import { dbConnect } from "@/utils/database";
import { PaymentModel, BookingModel, UserModel } from "@/utils/models";
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

        // 1. Revenue trends (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const revenueTrends = await PaymentModel.aggregate([
            { $match: { status: "success", createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    dailyRevenue: { $sum: "$amount" },
                    bookingsCount: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 2. User growth trends (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const userGrowth = await UserModel.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    newUsers: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        return NextResponse.json({
            revenueTrends,
            userGrowth
        }, { status: 200 });
    } catch (error) {
        console.error("Admin analytics error:", error);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}
