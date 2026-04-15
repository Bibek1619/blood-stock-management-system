-- Check if password column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        AND column_name = 'password'
    ) THEN
        ALTER TABLE "User" ADD COLUMN "password" TEXT NOT NULL DEFAULT '';
    END IF;
END $$;
