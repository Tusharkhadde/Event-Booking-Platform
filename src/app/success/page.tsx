"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";

const SuccessPage = () => {
    const router = useRouter();

    const handleGoBack = () => {
        router.push("/");
    };

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center -mt-20 items-center">
            <Navbar className="fixed w-full z-50" />
            <div className="flex flex-col items-center justify-center w-full h-full pt-16 px-4">
                <div className="flex items-center justify-center w-20 h-20 bg-amber-500/20 rounded-full mb-6 shadow-md border border-amber-500/20">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-green-600"
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

                <h1 className="text-3xl sm:text-4xl font-extrabold text-green-500 text-center mb-4">
                    Payment Successful!
                </h1>
                <p className="text-lg text-muted-foreground text-center max-w-lg mb-8">
                    Thank you for your purchase! Your payment has been successfully processed.
                </p>

                <Button
                    className="px-8 py-3 bg-[#F59E0B] hover:bg-[#D97706] text-white font-medium text-lg rounded-lg shadow-lg transition duration-200"
                    onClick={handleGoBack}
                >
                    Go to Home
                </Button>
            </div>
        </div>
    );
};

export default SuccessPage;