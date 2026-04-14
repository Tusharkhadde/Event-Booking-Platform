"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import { QRCodeCanvas } from "qrcode.react";
import { motion } from "framer-motion";
import { Ticket, Download, Home } from "lucide-react";

const SuccessPageContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [bookingCode, setBookingCode] = useState<string | null>(null);

    useEffect(() => {
        const code = searchParams.get("code");
        if (code) setBookingCode(code);
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center">
            <Navbar className="fixed w-full z-50" />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center w-full max-w-2xl pt-32 px-4 pb-20"
            >
                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-8 border-4 border-green-500/20">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-14 w-14 text-green-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-7.5 7.5a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 011.414-1.414L9 11.086l6.793-6.793a1 1 0 011.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>

                <h1 className="text-4xl font-black text-foreground text-center mb-4">
                    Booking Confirmed!
                </h1>
                <p className="text-muted-foreground text-center text-lg mb-12">
                    Your seats are reserved. Show the QR code below at the event entrance for quick check-in.
                </p>

                {bookingCode && (
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-card border-2 border-amber-500/30 rounded-[2.5rem] p-10 shadow-2xl flex flex-col items-center mb-12 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-amber-500" />
                        
                        <div className="bg-white p-4 rounded-3xl shadow-inner mb-6">
                            <QRCodeCanvas 
                                value={bookingCode} 
                                size={200}
                                level="H"
                                includeMargin={true}
                                imageSettings={{
                                    src: "/images/logo.png",
                                    x: undefined,
                                    y: undefined,
                                    height: 40,
                                    width: 40,
                                    excavate: true,
                                }}
                            />
                        </div>
                        
                        <div className="text-center space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Booking Reference</p>
                            <p className="text-3xl font-black tracking-tighter text-amber-500">{bookingCode}</p>
                        </div>
                        
                        <div className="mt-8 flex gap-4 w-full">
                            <Button variant="outline" className="flex-1 rounded-2xl h-12 gap-2 border-border" onClick={() => window.print()}>
                                <Download className="w-4 h-4" /> Save Ticket
                            </Button>
                        </div>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
                    <Button
                        className="h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold gap-2 shadow-xl transition-all hover:scale-105"
                        onClick={() => router.push("/")}
                    >
                        <Home className="w-5 h-5" /> Back to Home
                    </Button>
                    <Button
                        variant="secondary"
                        className="h-14 rounded-2xl font-bold gap-2 transition-all hover:scale-105"
                        onClick={() => router.push("/bookings")}
                    >
                        <Ticket className="w-5 h-5" /> My Bookings
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

const SuccessPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SuccessPageContent />
        </Suspense>
    );
};

export default SuccessPage;