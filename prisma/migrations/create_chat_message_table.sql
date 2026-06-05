-- Create ChatMessage table
-- This migration creates the ChatMessage table for the chat functionality

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
