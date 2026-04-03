import { dbConnect } from "@/utils/database";
import { BookingModel, EventModel } from "@/utils/models";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
        return NextResponse.json({ success: false, message: "userId is required" }, { status: 400 });
    }

    await dbConnect();

    try {
        const bookings = await BookingModel.find({ user: userId })
            .populate({
                path: "event",
                model: EventModel,
            })
            .sort({ bookingDate: -1 });

        return NextResponse.json({ success: true, bookings });
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch bookings." },
            { status: 500 }
        );
    }
}
