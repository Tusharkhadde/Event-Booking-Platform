import { dbConnect } from "@/utils/database";
import { BookingModel, EventModel } from "@/utils/models";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        await dbConnect();
        const booking = await BookingModel.findById(id).populate({
            path: "event",
            model: EventModel,
        });

        if (!booking) {
            return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, booking });
    } catch (error) {
        console.error("Error fetching booking:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
