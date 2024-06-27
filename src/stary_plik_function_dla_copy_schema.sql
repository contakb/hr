DECLARE
    new_schema_name TEXT := 'schema_' || replace(replace(email, '@', '_'), '.', '_');
    record RECORD;
    fk RECORD;
BEGIN
    -- Create new schema
    EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', new_schema_name);

    -- Clone the structure of the tables from the source schema
    FOR record IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> 'user_details'
    LOOP
        EXECUTE format('CREATE TABLE %I.%I (LIKE public.%I INCLUDING ALL)', new_schema_name, record.tablename, record.tablename);
    END LOOP;

    -- Clone foreign key constraints
    FOR fk IN SELECT conrelid::regclass::text AS table_name, conname, pg_get_constraintdef(oid) AS condef
              FROM pg_constraint
              WHERE connamespace = 'public'::regnamespace AND contype = 'f'
    LOOP
        -- Modify the constraint definition to change schema references from 'public' to new schema
        EXECUTE format('ALTER TABLE %I.%I ADD CONSTRAINT %I %s',
                       new_schema_name,
                       fk.table_name,
                       fk.conname,
                       replace(fk.condef, 'REFERENCES ', 'REFERENCES ' || new_schema_name || '.'));
    END LOOP;


    -- Grant ALL privileges on all tables, sequences, and functions in the schema to the roles
    EXECUTE format('GRANT ALL ON ALL TABLES IN SCHEMA %I TO postgres, anon, authenticated, service_role', new_schema_name);
    EXECUTE format('GRANT ALL ON ALL SEQUENCES IN SCHEMA %I TO postgres, anon, authenticated, service_role', new_schema_name);
    EXECUTE format('GRANT ALL ON ALL FUNCTIONS IN SCHEMA %I TO postgres, anon, authenticated, service_role', new_schema_name);

    -- Alter default privileges to grant ALL on future tables, sequences, and functions in this schema
    EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role', new_schema_name);
    EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role', new_schema_name);
    EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role', new_schema_name);

    -- Grant all privileges on the schema to the postgres role
    EXECUTE format('GRANT ALL PRIVILEGES ON SCHEMA %I TO postgres', new_schema_name);

    -- Grant usage on the schema to specific roles
    EXECUTE format('GRANT USAGE ON SCHEMA %I TO postgres, anon, authenticated, service_role', new_schema_name);

    -- Populate the working_days and holidays tables for the new schema
    PERFORM populate_working_days_and_holidays(email);
END;