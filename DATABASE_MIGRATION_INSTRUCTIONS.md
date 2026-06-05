# Database Migration Instructions for ChatMessage Table

## Problem
The chat functionality requires a `ChatMessage` table in the Supabase database. The schema is defined in `prisma/schema.prisma` but the table hasn't been created in the actual database yet.

## Solution

### Option 1: Using Prisma CLI (Recommended)
Run the following command in your project root:

```bash
npx prisma db push
```

This will sync your Prisma schema with the Supabase database and create the `ChatMessage` table.

### Option 2: Using Prisma Migrate
If you prefer to use migrations:

```bash
npx prisma migrate dev --name create_chat_message_table
```

### Option 3: Manual SQL Execution
Run the SQL migration script located at `prisma/migrations/create_chat_message_table.sql` in your Supabase SQL editor.

## After Migration
Once the migration is complete, regenerate the Prisma client:

```bash
npx prisma generate
```

## Verification
To verify the table was created successfully, you can:
1. Check your Supabase database table list
2. Run a test query in Supabase SQL editor:
   ```sql
   SELECT * FROM "ChatMessage" LIMIT 1;
   ```

## ChatMessage Schema
The table has the following structure:
- `id` (UUID, Primary Key)
- `bookingId` (Foreign Key to Booking)
- `senderId` (Foreign Key to User)
- `body` (Text - message content)
- `readAt` (Timestamp - when message was read)
- `createdAt` (Timestamp - when message was created)

Indexes:
- `bookingId_createdAt_idx` - for querying messages by booking
- `senderId_idx` - for querying messages by sender

## Troubleshooting
If you encounter issues:
1. Ensure your `DATABASE_URL` and `DIRECT_URL` environment variables are correctly set
2. Check that you have the necessary permissions in Supabase
3. Verify the Prisma schema matches your database structure
