import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const computeSchemaName = (email) => `schema_${email.replace(/[@\.]/g, '_')}`;

    const checkSession = useCallback(async () => {
        const { data: sessionData, error } = await supabase.auth.getSession();
        if (!error && sessionData && sessionData.session) {
            const schemaName = computeSchemaName(sessionData.session.user.email);
            const newUser = { ...sessionData.session.user, schemaName };
            console.log('Setting user with schema:', newUser);
            setUser(newUser);
        } else {
            setUser(null);
        }
    }, []);

    useEffect(() => {
        checkSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                setUser(null);
            } else if (event === 'SIGNED_IN' && session) {
                const schemaName = computeSchemaName(session.user.email);
                const newUser = { ...session.user, schemaName };
                console.log('Setting user with schema:', newUser);
                setUser(newUser);
            }
        });

        return () => {
            if (authListener && authListener.subscription) {
                authListener.subscription.unsubscribe();
            }
        };
    }, [checkSession]);

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
