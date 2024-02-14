
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://hxaxnwozubxemmygmmkw.supabase.co'; // Replace with your Supabase project URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4YXhud296dWJ4ZW1teWdtbWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTYyNDk0NzAsImV4cCI6MjAxMTgyNTQ3MH0.re-MQMIldEU9bhypt54b_14IPDqjOzTQhrcMEoLeTBg'; // Replace with your Supabase API key

export const supabase = createClient(supabaseUrl, supabaseKey);
