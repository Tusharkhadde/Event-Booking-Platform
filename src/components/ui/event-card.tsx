// EventCard.tsx
import Image from 'next/image';
import React from 'react';
import { BsFillPeopleFill } from "react-icons/bs";
import { IoTicket } from 'react-icons/io5';
import { IoLocationSharp } from 'react-icons/io5';
import { BsCalendarDate } from 'react-icons/bs';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface EventData {
    _id: string;
    date: string | Date;
    title: string;
    price: number;
    city: string;
    availableSeats: number;
    bookedSeats: number;
    imageUrl: string;
    category: string;
}

interface Props {
    data: EventData;
}

const EventCard: React.FC<Props> = ({ data }) => {
    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const getCategoryColor = (category: string) => {
        const colors: { [key: string]: string } = {
            music: 'bg-purple-500/20 text-purple-400 border border-purple-500/20',
            sports: 'bg-blue-500/20 text-blue-400 border border-blue-500/20',
            tech: 'bg-green-500/20 text-green-400 border border-green-500/20',
            arts: 'bg-pink-500/20 text-pink-400 border border-pink-500/20',
        };
        return colors[category.toLowerCase()] || 'bg-muted text-muted-foreground border border-border';
    };

    return (
        <motion.div
            variants={item}
            className="bg-card text-card-foreground rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-border"
        >
            <div className="flex flex-col md:flex-row">
                <div className="relative md:w-1/3 h-48 md:h-auto">
                    <Image
                        src={data.imageUrl ? `/uploads/${data.imageUrl}` : "/images/mockhead.jpg"}
                        alt={data.title}
                        fill
                        className="object-cover rounded-t-xl md:rounded-l-xl md:rounded-tr-none"
                    />
                </div>

                <div className="flex-1 p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(data.category)}`}>
                            {data.category}
                        </span>
                        <span className="px-3 py-1 bg-[#24AE7C] text-white rounded-full text-sm font-medium">
                            £{data.price}
                        </span>
                    </div>

                    <h2 className="text-xl font-bold text-card-foreground mb-2">{data.title}</h2>

                    <div className="flex flex-wrap gap-4 text-muted-foreground text-sm mb-4">
                        <div className="flex items-center gap-1">
                            <IoLocationSharp className="text-[#24AE7C]" />
                            <span>{data.city}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <BsCalendarDate className="text-[#24AE7C]" />
                            <span>{new Date(data.date).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between mt-4 pt-4 border-t">
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <BsFillPeopleFill className="text-[#24AE7C]" />
                                <span>{data.bookedSeats} attending</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <IoTicket className="text-[#24AE7C]" />
                                <span>{data.availableSeats - data.bookedSeats} seats left</span>
                            </div>
                        </div>

                        <Link
                            href={`/events/edit/${data._id}`}
                            className="inline-flex items-center px-4 py-2 bg-[#24AE7C] hover:bg-[#329c75] text-white font-medium rounded-lg transition-colors duration-200"
                        >
                            Edit Event
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default EventCard;