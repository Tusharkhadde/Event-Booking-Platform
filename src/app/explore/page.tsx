"use client";

import { Suspense } from 'react';
import Navbar from "@/components/navbar";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { IoLocationOutline } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Events from "@/components/events";
import Filter from '@/components/ui/filter-card';
import { DateRange } from 'react-day-picker';
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import debounce from 'debounce';
import { AuroraCurtain } from "@/components/ui/aurora-curtain";

const SearchBar = ({ onSearch }: { onSearch: (location: string, event: string) => void }) => {
    const [location, setLocation] = useState('');
    const [eventName, setEventName] = useState('');

    const debouncedSearch = debounce((loc: string, evt: string) => {
        onSearch(loc, evt);
    }, 500);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-4xl bg-black/40 backdrop-blur-xl p-3 text-white rounded-2xl border border-white/10 shadow-2xl"
        >
            <div className="relative flex-1 w-full">
                <IoLocationOutline className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                <Input
                    className="w-full h-12 pl-12 rounded-xl border-none bg-white/5 text-white placeholder:text-white/50 focus-visible:ring-1 focus-visible:ring-white/20 transition-all text-lg"
                    placeholder="Enter Location"
                    value={location}
                    onChange={(e) => {
                        setLocation(e.target.value);
                        debouncedSearch(e.target.value, eventName);
                    }}
                />
            </div>
            <div className="hidden sm:block w-px h-8 bg-white/10 mx-1"></div>
            <div className="relative flex-1 w-full">
                <FaSearch className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                <Input
                    className="w-full h-12 pl-12 rounded-xl border-none bg-white/5 text-white placeholder:text-white/50 focus-visible:ring-1 focus-visible:ring-white/20 transition-all text-lg"
                    placeholder="Search Event"
                    value={eventName}
                    onChange={(e) => {
                        setEventName(e.target.value);
                        debouncedSearch(location, e.target.value);
                    }}
                />
            </div>
            <Button
                className="w-full sm:w-auto h-12 bg-[#c8956c] hover:bg-[#b5825a] text-black px-8 rounded-xl font-semibold text-base transition-colors shadow-lg shadow-[#c8956c]/20"
                onClick={() => onSearch(location, eventName)}
            >
                Search
            </Button>
        </motion.div>
    );
};

const LoadingSkeleton = () => (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
        {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
                <Skeleton className="h-[200px] w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        ))}
    </div>
);

const SearchParamsHandler = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleFilterChange = (filters: { category?: string; date?: DateRange }) => {
        const currentQuery = new URLSearchParams(searchParams.toString());

        if (filters.category) {
            currentQuery.set('category', filters.category);
        }

        if (filters.date?.from) {
            currentQuery.set('dateFrom', filters.date.from.toISOString());
        }

        if (filters.date?.to) {
            currentQuery.set('dateTo', filters.date.to.toISOString());
        }

        router.push(`/explore?${currentQuery.toString()}`);
    };

    return <div className="lg:col-span-3">
        <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-lg" />}>
            <Filter onFilterChange={handleFilterChange} />
        </Suspense>
    </div>;
}

export default function EventsPage() {
    const router = useRouter();

    const handleSearch = (location: string, event: string) => {
        const query: Record<string, string> = {};
        if (location) query.location = location;
        if (event) query.event = event;

        const queryString = new URLSearchParams(query).toString();
        router.push(`/explore${queryString ? `?${queryString}` : ''}`);
    };

    return (
        <Suspense fallback={<LoadingSkeleton />}>
            <div className="min-h-screen bg-background text-foreground">
                <Navbar className="fixed top-0 w-full z-50" />

                <div className="relative h-[450px] md:h-[550px] overflow-hidden">
                    <AuroraCurtain className="absolute inset-0 w-full h-full" />
                    
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background pointer-events-none" />

                    <div className="absolute inset-0 flex flex-col items-center justify-center px-4 pt-16 z-10 pointer-events-none">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-white text-4xl md:text-6xl font-bold text-center mb-4 tracking-tight drop-shadow-lg"
                        >
                            Discover events for all the things you love!
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-white/80 text-lg md:text-xl text-center mb-10 max-w-2xl drop-shadow-md"
                        >
                            Search amazing events, from local meetups to massive festivals.
                        </motion.p>
                        <div className="w-full max-w-4xl pointer-events-auto">
                            <SearchBar onSearch={handleSearch} />
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl sm:mx-10 mx-auto lg:mx-40 px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        <Suspense fallback={<LoadingSkeleton />}>
                            <SearchParamsHandler />
                        </Suspense>

                        <div className="lg:col-span-9">
                            <Suspense fallback={<LoadingSkeleton />}>
                                <Events />
                            </Suspense>
                        </div>
                    </div>
                </div>
            </div>
        </Suspense>
    );
}