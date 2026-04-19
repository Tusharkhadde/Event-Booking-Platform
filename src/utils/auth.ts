import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import { dbConnect } from "./database";
import { UserModel } from "./models";
import bcrypt from "bcrypt";

export const authConfig: NextAuthOptions = {
    pages: {
        signIn: '/login'
    },
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "example@example.com",
                },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials || !credentials.email || !credentials.password)
                    return null;
                await dbConnect();
                const user = await UserModel.findOne({
                    $or: [
                        { email: credentials.email },
                        { username: credentials.email }
                    ]
                })
                if (user && bcrypt.compareSync(credentials.password, user.password)) {
                    if (user.status === "suspended") {
                        throw new Error("Your account has been suspended. Please contact support.");
                    }
                    return { id: user._id, username: user.username, email: user.email, profilePicture: user.profilePicture, balance: user.balance, role: user.role }
                }

                return null;
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                await dbConnect();
                const existingUser = await UserModel.findOne({ email: user.email });
                if (!existingUser) {
                    await UserModel.create({
                        username: user.name || user.email?.split('@')[0],
                        email: user.email,
                        profilePicture: user.image,
                        role: "user",
                        balance: 0,
                    });
                } else if (!existingUser.profilePicture && user.image) {
                   existingUser.profilePicture = user.image;
                   await existingUser.save();
                }
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (trigger === "update") {
                if (session?.profilePicture) {
                    token.profilePicture = session.profilePicture;
                    console.log(token.profilePicture);
                } else if (session?.username) {
                    token.username = session.username;
                }
            }
            if (user) {
                // If it's a new login, ensure we use the database _id
                await dbConnect();
                const dbUser = await UserModel.findOne({ email: user.email });
                
                token.id = dbUser ? dbUser._id.toString() : user.id;
                token.username = user.username || (user as any).name;
                token.email = user.email;
                token.profilePicture = user.profilePicture || (user as any).image;
                token.balance = (user as any).balance || 0;
                token.role = (user as any).role || dbUser.role || "user";
            }

            // Force Sync: If token.id is missing or looks like a numeric Google ID (non-ObjectId)
            const isObjectId = /^[0-9a-fA-F]{24}$/.test(token.id as string || "");
            if (token.email && !isObjectId) {
                await dbConnect();
                const dbEntry = await UserModel.findOne({ email: token.email });
                if (dbEntry) {
                    token.id = dbEntry._id.toString();
                }
            }
            
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.username = token.username;
                session.user.email = token.email;
                session.user.profilePicture = token.profilePicture;
                session.user.balance = token.balance;
                session.user.role = token.role;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
}