const axios = require('axios');
import { supabase } from './supabaseClient';

const SUPABASE_URL = 'https://your-supabase-url.supabase.co';
const SERVICE_ROLE_KEY = 'your-service-role-key';
const PROJECT_REF = 'your-project-ref';

async function updateExposedSchemas(newSchema) {
  try {
    // Fetch the current project settings
    const projectResponse = await axios.get(`${SUPABASE_URL}/rest/v1/settings`, {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
    });

    if (projectResponse.status !== 200) {
      throw new Error('Failed to fetch project settings');
    }

    const projectSettings = projectResponse.data;

    // Update the exposed schemas list
    const exposedSchemas = projectSettings.db.exposed_schemas;
    if (!exposedSchemas.includes(newSchema)) {
      exposedSchemas.push(newSchema);

      // Save the updated project settings
      const updateResponse = await axios.put(
        `${SUPABASE_URL}/rest/v1/settings`,
        {
          db: {
            ...projectSettings.db,
            exposed_schemas: exposedSchemas,
          },
        },
        {
          headers: {
            apikey: SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          },
        }
      );

      if (updateResponse.status !== 200) {
        throw new Error('Failed to update project settings');
      }

      console.log(`Schema ${newSchema} has been added to exposed schemas.`);
    } else {
      console.log(`Schema ${newSchema} is already in the exposed schemas list.`);
    }
  } catch (error) {
    console.error('Error updating exposed schemas:', error.message);
  }
}

// Example usage: Add a new schema
const newSchema = 'schema_sz_c_pl';
updateExposedSchemas(newSchema);
