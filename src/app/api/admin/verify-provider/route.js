import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request) {
  await connectDB();
  try {
    const { providerId, action, badge, surveyDate } = await request.json();

    const user = await User.findById(providerId);
    if (!user) {
      return NextResponse.json({ success: false, message: "Provider not found" }, { status: 404 });
    }

    if (action === 'approve') {
      user.status = 'Active';
      user.isVerified = true;
      user.badge = badge || 'Basic';
      user.trustScore = badge === 'Elite' ? 95 : (badge === 'Pro' ? 80 : 60);
    } else if (action === 'reject') {
      user.status = 'Blocked';
    } else if (action === 'assign-survey') {
      if (!surveyDate) {
        return NextResponse.json({ success: false, message: "Survey date is required" }, { status: 400 });
      }
      user.surveyDate = new Date(surveyDate);
      await user.save();
      return NextResponse.json({ 
        success: true, 
        message: `Survey date assigned successfully for ${new Date(surveyDate).toLocaleDateString()}.` 
      });
    }

    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: `Provider ${action}d successfully with ${badge || 'Basic'} badge.` 
    });

  } catch (error) {
    console.error("Verification decision error:", error);
    return NextResponse.json({ success: false, message: "Error processing decision" }, { status: 500 });
  }
}
