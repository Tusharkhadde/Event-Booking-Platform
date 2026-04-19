import { dbConnect } from "@/utils/database";
import { UserModel, EventModel, BookingModel, PaymentModel } from "@/utils/models";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/utils/auth";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authConfig);

        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await dbConnect();

        const [
            totalUsers,
            totalEvents,
            totalBookings,
            revenueData,
            recentUsers,
            recentBookings
        ] = await Promise.all([
            UserModel.countDocuments(),
            EventModel.countDocuments(),
            BookingModel.countDocuments(),
            PaymentModel.aggregate([
                { $match: { status: "success" } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            UserModel.find().sort({ createdAt: -1 }).limit(5).select("username email profilePicture createdAt"),
            BookingModel.find().sort({ bookingDate: -1 }).limit(5).populate("user", "username").populate("event", "title")
        ]);

        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        // Calculate growth (simple mock for now, or could query by date)
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const usersLastMonth = await UserModel.countDocuments({ createdAt: { $gte: lastMonth } });

        return NextResponse.json({
            stats: {
                totalUsers,
                totalEvents,
                totalBookings,
                totalRevenue,
                usersLastMonth
            },
            recentUsers,
            recentBookings
        }, { status: 200 });
    } catch (error) {
        console.error("Admin stats error:", error);
        return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 });
    }
}
