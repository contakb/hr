// src/utils/axiosInstance.js

import axios from 'axios';
import { supabase } from './supabaseClient'; // Adjust the import path as necessary

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001/',
});

// Asynchronously retrieve the current session's access token
const getAuthToken = async () => {
  const { data: sessionData, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error.message);
    return null;
  }

  return sessionData?.session?.access_token || null;
};

// Use an asynchronous function to set the Authorization header
axiosInstance.interceptors.request.use(async config => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default axiosInstance;

