import { NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";
import { dbConnect } from "@/utils/database";
import { EventModel } from "@/utils/models";
import { getServerSession } from "next-auth";
import { authConfig } from "@/utils/auth";

export async function POST(req: Request) {
    await dbConnect();

    const session = await getServerSession(authConfig);

    if (session) {
        try {
            const formData = await req.formData();

            // Get form data fields
            const title = formData.get('title')?.toString();
            const description = formData.get('description')?.toString();
            const price = parseFloat(formData.get('price') as string);
            const date = formData.get('date')?.toString();
            const address = formData.get('address')?.toString();
            const city = formData.get('city')?.toString();
            const file = formData.get('file') as File;
            const category = formData.get('category')?.toString();
            const availableSeats = parseFloat(formData.get('seats') as string);
            const time = formData.get('time')?.toString();

            // Validate required fields
            if (!title || !description || !date || !time || !address || !city) {
                return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
            }

            let dateObject;
            try {
                // date is usually a string from val.toString() in the frontend: 
                // "Fri Mar 14 2026 00:00:00 GMT+0530 (India Standard Time)"
                // We parse it first, then set the hours/minutes from the time input
                dateObject = new Date(date);
                if (time) {
                    const [hours, minutes] = time.split(':');
                    dateObject.setHours(parseInt(hours), parseInt(minutes));
                }
                
                if (isNaN(dateObject.getTime())) {
                    throw new Error("Invalid date");
                }
            } catch (err) {
                console.error("Date parsing error:", err, { date, time });
                return NextResponse.json({ error: 'Invalid date or time format' }, { status: 400 });
            }

            let imageUrl = null;

            if (file) {
                // Handle file upload
                const buffer = Buffer.from(await file.arrayBuffer());
                const filename = file.name.replaceAll(" ", "_");
                imageUrl = filename;

                try {
                    await writeFile(
                        path.join(process.cwd(), "public/uploads/" + filename),
                        new Int8Array(buffer)
                    );
                } catch (error) {
                    console.error("Error occurred while saving file: ", error);
                    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
                }
            }

            // Create new event
            const newEvent = new EventModel({
                title,
                description,
                price: price || 0,
                date: dateObject,
                address,
                city,
                imageUrl,
                category,
                availableSeats,
                bookedSeats: 0,
                organizer: session.user.id,
            });

            await newEvent.save();

            return NextResponse.json({ success: true, event: newEvent }, { status: 201 });
        } catch (error) {
            console.error("Error creating event:", error);
            return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
        }
    } else {
        console.error("Error creating event: invalid session");
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
}