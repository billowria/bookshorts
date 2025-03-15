-- Migration script to update Content table to store HTML content
-- Run this in the Supabase SQL Editor

-- First, let's check if the Content table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Content') THEN
        -- Update the Content table to ensure it can store HTML content
        -- Change content column type to TEXT if it's not already
        ALTER TABLE "Content" 
        ALTER COLUMN "content" TYPE TEXT;
        
        -- Add a column to track if content is HTML (if it doesn't exist)
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_name = 'Content' AND column_name = 'is_html') THEN
            ALTER TABLE "Content" 
            ADD COLUMN "is_html" BOOLEAN DEFAULT TRUE;
        END IF;
        
        -- Add a column for last_updated if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_name = 'Content' AND column_name = 'last_updated') THEN
            ALTER TABLE "Content" 
            ADD COLUMN "last_updated" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        END IF;
        
        RAISE NOTICE 'Content table updated successfully to store HTML content';
    ELSE
        -- Create the Content table if it doesn't exist
        CREATE TABLE "Content" (
            "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            "book_id" UUID NOT NULL REFERENCES "Books"("id") ON DELETE CASCADE,
            "type" TEXT NOT NULL,
            "content" TEXT,
            "is_html" BOOLEAN DEFAULT TRUE,
            "last_updated" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE("book_id", "type")
        );
        
        -- Create index for faster queries
        CREATE INDEX "content_book_id_idx" ON "Content"("book_id");
        CREATE INDEX "content_type_idx" ON "Content"("type");
        
        RAISE NOTICE 'Content table created successfully with HTML support';
    END IF;
END
$$;

-- Sample data insertion for testing (uncomment to use)
/*
INSERT INTO "Content" ("book_id", "type", "content", "is_html", "last_updated")
VALUES 
    ('book-uuid-1', 'core', '<h1>Sample HTML Content</h1><p>This is a test of HTML content storage.</p>', TRUE, CURRENT_TIMESTAMP),
    ('book-uuid-1', 'deep_dive', '<h1>Deep Dive HTML Content</h1><p>This is more detailed HTML content.</p>', TRUE, CURRENT_TIMESTAMP)
ON CONFLICT ("book_id", "type") 
DO UPDATE SET 
    "content" = EXCLUDED.content,
    "is_html" = EXCLUDED.is_html,
    "last_updated" = CURRENT_TIMESTAMP;
*/

-- Create or update RLS policies for the Content table
DO $$
BEGIN
    -- Drop existing RLS policies if they exist
    DROP POLICY IF EXISTS "Enable read access for all users" ON "Content";
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "Content";
    DROP POLICY IF EXISTS "Enable update for authenticated users only" ON "Content";
    DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON "Content";
    
    -- Enable Row Level Security
    ALTER TABLE "Content" ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Enable read access for all users" 
    ON "Content" FOR SELECT 
    USING (true);
    
    CREATE POLICY "Enable insert for authenticated users only" 
    ON "Content" FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');
    
    CREATE POLICY "Enable update for authenticated users only" 
    ON "Content" FOR UPDATE 
    USING (auth.role() = 'authenticated');
    
    CREATE POLICY "Enable delete for authenticated users only" 
    ON "Content" FOR DELETE 
    USING (auth.role() = 'authenticated');
    
    RAISE NOTICE 'RLS policies created or updated successfully';
END
$$; 