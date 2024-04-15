-- Clone the structure of the tables from the source schema
    FOR record IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('CREATE TABLE %I.%I (LIKE public.%I INCLUDING ALL)', new_schema_name, record.tablename, record.tablename);
    END LOOP;