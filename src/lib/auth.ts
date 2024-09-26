import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { User } from "@/lib/models";
import { connectDB } from "@/lib/mongodb";
import "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Connect to MongoDB using the connectDB function
        await connectDB();

        // Find user in the database using Mongoose
        const user = await User.findOne({ email: credentials.email });

        if (!user || !user.password || !(await bcrypt.compare(credentials.password, user.password))) {
          return null;
        }

        if (!user.isVerified) {
          throw new Error('Please verify your email before signing in.');
        }

        return { id: user._id, email: user.email, name: user.name };
      }
    })
  ],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.id as string;

      return session;
    },
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token
        token.id = user?.id
      }
      return token
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectDB();

        let existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          const newUser = new User({
            nextAuthUserId: user.id,
            email: user.email,
            name: user.name,
            password: null,
            image: user.image,
            isFirstLogin: true,
            isVerified: true,
          });
          existingUser = await newUser.save();
        }
      }
      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
