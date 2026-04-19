import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            username: string;
            email: string;
            profilePicture: string;
            balance: number;
            role: string;
        }
    }
    interface User {
        id: string;
        username: string;
        email: string;
        profilePicture: string;
        balance: number;
        role: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        username: string;
        email: string;
        profilePicture: string;
        balance: number;
        role: string;
    }
}