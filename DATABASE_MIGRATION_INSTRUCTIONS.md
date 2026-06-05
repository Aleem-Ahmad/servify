# Database Migration Instructions for ChatMessage Table

## Problem
The chat functionality requires a `ChatMessage` table in the Supabase database. The schema is defined in `prisma/schema.prisma` but the table hasn't been created in the actual database yet.

## IMPORTANT: Table Name
The table is named **"ChatMessage"** (with capital C and M), NOT "message". Make sure you're looking for the correct table name in Supabase.

## Solution - Run SQL Directly in Supabase (Fastest Method)

### Step 1: Go to Supabase SQL Editor
1. Open your Supabase project dashboard
2. Go to the "SQL Editor" tab in the left sidebar
3. Click "New Query"

### Step 2: Run this SQL
Copy and paste the following SQL into the editor and click "Run":

```sql
-- Create ChatMessage table
CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "ChatMessage_bookingId_createdAt_idx" ON "ChatMessage"("bookingId", "createdAt");
CREATE INDEX IF NOT EXISTS "ChatMessage_senderId_idx" ON "ChatMessage"("senderId");

-- Add foreign key constraints
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_bookingId_fkey" 
    FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" 
    FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### Step 3: Verify the table was created
After running the SQL, run this query to verify:

```sql
SELECT * FROM "ChatMessage" LIMIT 1;
```

You should see an empty result (no error), which means the table exists.

## Alternative: Using Prisma CLI

If you prefer to use Prisma CLI, run this command in your project root:

```bash
npx prisma db push
```

Then regenerate the Prisma client:

```bash
npx prisma generate
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
- `ChatMessage_bookingId_createdAt_idx` - for querying messages by booking
- `ChatMessage_senderId_idx` - for querying messages by sender

## Troubleshooting
If you encounter issues:
1. Make sure you're looking for "ChatMessage" (not "message") in Supabase
2. Ensure your `DATABASE_URL` and `DIRECT_URL` environment variables are correctly set
3. Check that you have the necessary permissions in Supabase
4. Verify the Booking and User tables exist before creating ChatMessage
