import { dbConnect } from "@/utils/database";
import { EventModel } from "@/utils/models";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    await dbConnect();

    try {
        const events = await EventModel.find({ organizer: userId }).populate("reviews");

        return NextResponse.json({ success: true, events });
    } catch (error) {
        console.error("Error fetching events with ratings:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch events." },
            { status: 500 }
        );
    }
}