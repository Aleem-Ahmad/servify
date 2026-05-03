import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await connectDB();
        try {
          const user = await User.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });

          if (!user) {
            throw new Error("No user found with this email or username");
          }

          if (!user.isVerified) {
            throw new Error("Please verify your account before logging in");
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (isPasswordCorrect) {
            return user;
          } else {
            throw new Error("Incorrect password");
          }
        } catch (err) {
          throw new Error(err.message);
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        await connectDB();
        try {
          const existingUser = await User.findOne({ email: user.email });

          if (existingUser) {
            if (existingUser.role === "provider") {
              throw new Error("Providers must use email and password to log in");
            }
            if (!existingUser.googleId) {
              existingUser.googleId = profile.sub;
              if (!existingUser.image) existingUser.image = user.image;
              await existingUser.save();
            }
          } else {
            // Create a new user as a customer
            const baseUsername = user.email.split('@')[0];
            const uniqueUsername = `${baseUsername}_${Math.floor(Math.random() * 1000)}`;
            
            await User.create({
              username: uniqueUsername,
              name: user.name,
              email: user.email,
              googleId: profile.sub,
              image: user.image,
              role: "customer",
              isVerified: true, // Google users are verified
              verifyCode: 'google-oauth',
              verifyCodeExpiry: new Date(),
              status: "Active",
            });
          }
          return true;
        } catch (error) {
          console.error("Error during Google sign in:", error.message);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.username = token.username;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/authentication",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
