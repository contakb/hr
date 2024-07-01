import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const computeSchemaName = (email) => `schema_${email.replace(/[@\.]/g, '_')}`;

    const fetchUserDetails = useCallback(async (email) => {
        console.log("Fetching user details for email:", email);
        const { data, error } = await supabase
            .from('user_details')
            .select('schema_name, role, plan_type, trial_status, trial_end_date')
            .eq('user_email', email)
            .single();

        if (error) {
            if (error.code !== 'PGRST116') { // PGRST116 means no rows found
                console.error('Error fetching user details:', error);
            }
            return null;
        }
        console.log("Fetched user details:", data);

        return data;
    }, []);

    const checkSession = useCallback(async () => {
        console.log("Checking session...");
        const { data: sessionData, error } = await supabase.auth.getSession();
        if (!error && sessionData && sessionData.session) {
            const userEmail = sessionData.session.user.email;
            console.log("User session found, fetching details for email:", userEmail);

            const userDetails = await fetchUserDetails(userEmail);

            if (userDetails) {
                const { schema_name, role, plan_type, trial_status, trial_end_date } = userDetails;
                const newUser = { 
                    ...sessionData.session.user, 
                    schemaName: schema_name, 
                    role, 
                    planType: plan_type,
                    trialStatus: trial_status,
                    trialEndDate: trial_end_date 
                };
                console.log("Setting user with fetched details:", newUser);
                setUser(newUser);
            } else {
                console.error("Failed to fetch user details. Setting user to null.");
                setUser(null);
            }
        } else {
            console.log("No user session found, setting user to null.");
            setUser(null);
        }
        setLoading(false);
    }, [fetchUserDetails]);

    useEffect(() => {
        checkSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("Auth state changed:", event);
            if (event === 'SIGNED_OUT') {
                console.log("User signed out, setting user to null.");
                setUser(null);
            } else if (event === 'SIGNED_IN' && session) {
                const userEmail = session.user.email;
                console.log("User signed in, fetching details for email:", userEmail);

                fetchUserDetails(userEmail).then((userDetails) => {
                    if (userDetails) {
                        const { schema_name, role, plan_type, trial_status, trial_end_date } = userDetails;
                        const newUser = { 
                            ...session.user, 
                            schemaName: schema_name, 
                            role, 
                            planType: plan_type,
                            trialStatus: trial_status,
                            trialEndDate: trial_end_date 
                        };
                        console.log("Setting user with fetched details:", newUser);
                        setUser(newUser);
                    } else {
                        console.error("Failed to fetch user details. Setting user to null.");
                        setUser(null);
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
        console.log("Updating user context with data:", updatedUserData);
        setUser(prevUser => ({
            ...prevUser,
            ...updatedUserData
        }));
    };
    return (
        <UserContext.Provider value={{ user, updateUserContext, loading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
