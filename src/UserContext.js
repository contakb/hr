import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const checkSession = useCallback(async () => {
        const { data: sessionData, error } = await supabase.auth.getSession();
        if (!error && sessionData && sessionData.session) {
            setUser(sessionData.session.user);
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
                setUser(session.user);
            }
        });

        return () => {
            if (authListener && authListener.subscription) {
                authListener.subscription.unsubscribe();
            }
        };
    }, [checkSession]);

    // Method to update user in context and potentially in Supabase
    const updateUserContext = async (updatedUserData) => {
        // Update the user data in Supabase or your backend as needed
        // For now, we'll just update the context
        setUser(updatedUserData);
    };

    return (
        <UserContext.Provider value={{ user, updateUserContext }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
