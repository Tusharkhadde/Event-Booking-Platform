import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { dbConnect } from '@/utils/database';
import { PaymentModel, BookingModel, EventModel, UserModel } from '@/utils/models';

const hasValidStripeKey = process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('stripe secret key');

const stripe = hasValidStripeKey 
    ? new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2024-06-20' })
    : null;

interface CheckoutSessionBody {
    amount: number;
    quantity: number;
    eventName: string;
    userId: string;
    eventId: string;
}

export async function POST(req: NextRequest) {
    try {
        const { amount, quantity, eventName, userId, eventId }: CheckoutSessionBody = await req.json();

        // If Stripe is not configured, use a proxy logic to complete the booking
        if (!stripe) {
            console.log("Stripe not configured. Using payment proxy...");
            await dbConnect();
            
            try {
                // 1. Create a successful payment record
                const payment = new PaymentModel({
                    user: userId,
                    event: eventId,
                    amount: amount * quantity,
                    paymentMethod: 'proxy-demo',
                    status: 'success',
                    transactionId: `proxy_${Date.now()}`,
                });
                await payment.save();

                // 2. Create the booking
                const booking = new BookingModel({
                    event: eventId,
                    user: userId,
                    numberOfSeats: quantity,
                    totalPrice: amount * quantity,
                    paymentStatus: 'paid',
                });
                await booking.save();

                // 3. Update event booked seats
                await EventModel.findByIdAndUpdate(
                    eventId,
                    { $inc: { bookedSeats: quantity } },
                    { new: true }
                );

                // 4. Update organizer balance
                const event = await EventModel.findById(eventId);
                if (event) {
                    await UserModel.findByIdAndUpdate(
                        event.organizer,
                        { $inc: { balance: amount * quantity } },
                        { new: true }
                    );
                }

                return NextResponse.json({ proxy: true, bookingId: booking._id }, { status: 200 });
            } catch (error) {
                console.error('Proxy payment failed:', error);
                return NextResponse.json({ error: 'Failed to process proxy payment' }, { status: 500 });
            }
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Event Ticket - ${eventName}`,
                        },
                        unit_amount: amount * 100,
                    },
                    quantity,
                },
            ],
            mode: 'payment',
            success_url: `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.get('origin')}/cancel`,
            metadata: {
                userId: userId,
                eventId: eventId,
                quantity,
            },
        });
        
        return NextResponse.json({ id: session.id }, { status: 200 });
    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }
}