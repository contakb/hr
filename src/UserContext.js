import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const checkSession = useCallback(async () => {
        const { data: sessionData, error } = await supabase.auth.getSession();
        if (!error && sessionData && sessionData.session) {
            const schemaName = `schema_${sessionData.session.user.email.replace(/[@\.]/g, '_')}`;
            setUser({ ...sessionData.session.user, schemaName });
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
                const schemaName = `schema_${session.user.email.replace(/[@\.]/g, '_')}`;
                setUser({ ...session.user, schemaName });
            }
        });

        return () => {
            if (authListener && authListener.subscription) {
                authListener.subscription.unsubscribe();
            }
        };
    }, [checkSession]);

    const updateUserContext = async (updatedUserData) => {
        setUser(updatedUserData);
    };

    return (
        <UserContext.Provider value={{ user, updateUserContext }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
