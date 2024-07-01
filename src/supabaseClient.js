
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;


const supabaseServiceKey = process.env.SUPABASE_URL;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

