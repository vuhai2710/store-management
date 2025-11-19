-- Add avatar_url column to users table
ALTER TABLE users 
ADD COLUMN avatar_url VARCHAR(500) NULL COMMENT 'URL ảnh đại diện của user';

-- Create uploads directory for user avatars (comment only - directory will be created by application)
-- uploads/users/


