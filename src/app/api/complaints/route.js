import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request) {
  try {
    const complaintData = await request.json();
    const newComplaint = await db.collection('complaints').insertOne({
        ...complaintData,
        status: "Submitted"
    });

    return NextResponse.json({
      success: true,
      message: "Complaint registered successfully.",
      complaintId: newComplaint.id,
      status: "Submitted"
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to register complaint"
    }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  let query = {};
  if (userId) query.userId = userId;

  const complaints = await db.collection('complaints').find(query);
  return NextResponse.json(complaints);
}
