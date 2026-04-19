import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/utils/auth";
import { dbConnect } from "@/utils/database";
import { UserModel } from "@/utils/models";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authConfig);

        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userId, action, role } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        await dbConnect();

        let update = {};
        if (action === "suspend") {
            update = { status: "suspended" };
        } else if (action === "activate") {
            update = { status: "active" };
        } else if (action === "updateRole" && role) {
            update = { role };
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        const updatedUser = await UserModel.findByIdAndUpdate(userId, update, { new: true });

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ 
            message: `User ${action === "updateRole" ? "role updated" : "status updated"} successfuly`,
            user: updatedUser 
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
