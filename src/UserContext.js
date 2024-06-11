import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const computeSchemaName = (email) => `schema_${email.replace(/[@\.]/g, '_')}`;

    const fetchUserDetails = useCallback(async (email) => {
        const { data, error } = await supabase
            .from('user_details')
            .select('schema_name, role')
            .eq('user_email', email)
            .single();

        if (error) {
            if (error.code !== 'PGRST116') { // PGRST116 means no rows found
                console.error('Error fetching user details:', error);
            }
            return null;
        }

        return data;
    }, []);

    const checkSession = useCallback(async () => {
        const { data: sessionData, error } = await supabase.auth.getSession();
        if (!error && sessionData && sessionData.session) {
            const userEmail = sessionData.session.user.email;

            const userDetails = await fetchUserDetails(userEmail);

            if (userDetails) {
                const { schema_name, role } = userDetails;
                const newUser = { ...sessionData.session.user, schemaName: schema_name, role };
                setUser(newUser);
            } else {
                const schemaName = computeSchemaName(userEmail);
                const newUser = { ...sessionData.session.user, schemaName, role: 'admin' };
                setUser(newUser);
            }
        } else {
            setUser(null);
        }
    }, [fetchUserDetails]);

    useEffect(() => {
        checkSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                setUser(null);
            } else if (event === 'SIGNED_IN' && session) {
                const userEmail = session.user.email;

                fetchUserDetails(userEmail).then((userDetails) => {
                    if (userDetails) {
                        const { schema_name, role } = userDetails;
                        const newUser = { ...session.user, schemaName: schema_name, role };
                        setUser(newUser);
                    } else {
                        const schemaName = computeSchemaName(userEmail);
                        const newUser = { ...session.user, schemaName, role: 'admin' };
                        setUser(newUser);
                    }
                });
            }
        });

        return () => {
            if (authListener && authListener.subscription) {
                authListener.subscription.unsubscribe();
            }
        };
    }, [checkSession, fetchUserDetails]);

    const updateUserContext = (updatedUserData) => {
        setUser(updatedUserData);
    };

    return (
        <UserContext.Provider value={{ user, updateUserContext }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
