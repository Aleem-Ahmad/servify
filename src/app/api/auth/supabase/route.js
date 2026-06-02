import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createUniqueUsername } from "@/lib/createUniqueUsername";
import { findUserByEmail } from "@/lib/findUserByEmail";
import { getSupabaseAuthClient, isSupabaseConfigured } from "@/lib/supabaseServer";
import { normalizeEmail } from "@/lib/normalizeEmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, message: "Supabase auth is not configured." },
        { status: 503 }
      );
    }

    const { accessToken } = await request.json();
    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Missing Supabase access token" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAuthClient();
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Google authentication failed" },
        { status: 401 }
      );
    }

    const supabaseUser = data.user;
    const email = normalizeEmail(supabaseUser.email);
    const googleId = supabaseUser.identities?.find((identity) => identity.provider === "google")?.id || supabaseUser.id;
    const metadata = supabaseUser.user_metadata || {};
    const displayName = metadata.full_name || metadata.name || email.split("@")[0];
    const avatarUrl = metadata.avatar_url || metadata.picture || "";

    let user = await findUserByEmail(prisma, email);

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: user.googleId || googleId,
          isVerified: true,
          ...(avatarUrl && !user.image ? { image: avatarUrl } : {}),
        },
      });
    } else {
      const username = await createUniqueUsername(prisma, email, displayName);
      user = await prisma.user.create({
        data: {
          username,
          name: displayName,
          email,
          password: null,
          googleId,
          verifyCode: "",
          verifyCodeExpiry: new Date(),
          isVerified: true,
          role: "customer",
          status: "Active",
          ...(avatarUrl && { image: avatarUrl }),
        },
      });
    }

    const response = NextResponse.json({
      success: true,
      message: "Google login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        username: user.username,
        isVerified: user.isVerified,
        status: user.status,
        image: user.image,
      },
    });

    response.cookies.set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Supabase auth error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error during Google login",
        ...(process.env.NODE_ENV === "development" && { detail: error.message }),
      },
      { status: 500 }
    );
  }
}
