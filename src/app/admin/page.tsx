"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
    Users, 
    Calendar, 
    Ticket, 
    DollarSign, 
    TrendingUp,
    Clock,
    UserPlus,
    ArrowUpRight
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Stats {
    totalUsers: number;
    totalEvents: number;
    totalBookings: number;
    totalRevenue: number;
    usersLastMonth: number;
}

interface RecentUser {
    _id: string;
    username: string;
    email: string;
    profilePicture?: string;
    createdAt: string;
}

interface RecentBooking {
    _id: string;
    user: { username: string };
    event: { title: string };
    bookingDate: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
    const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/admin/stats");
                const data = await res.json();
                if (data.stats) {
                    setStats(data.stats);
                    setRecentUsers(data.recentUsers);
                    setRecentBookings(data.recentBookings);
                }
            } catch (error) {
                console.error("Failed to fetch admin stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-amber-500/20 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
            </div>
        );
    }

    const statCards = [
        { 
            name: "Total Users", 
            value: stats?.totalUsers || 0, 
            icon: Users, 
            color: "text-blue-400", 
            bg: "bg-blue-400/10",
            trend: "+12%",
            description: "Active community members"
        },
        { 
            name: "Events Live", 
            value: stats?.totalEvents || 0, 
            icon: Calendar, 
            color: "text-purple-400", 
            bg: "bg-purple-400/10",
            trend: "+8%",
            description: "Scheduled and upcoming"
        },
        { 
            name: "Tickets Booked", 
            value: stats?.totalBookings || 0, 
            icon: Ticket, 
            color: "text-orange-400", 
            bg: "bg-orange-400/10",
            trend: "+15%",
            description: "Successful transactions"
        },
        { 
            name: "Total Revenue", 
            value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, 
            icon: DollarSign, 
            color: "text-emerald-400", 
            bg: "bg-emerald-400/10",
            trend: "+24%",
            description: "Gross platform earnings"
        },
    ];

    return (
        <div className="space-y-10 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold font-syne tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Command Center
                    </h1>
                    <p className="text-zinc-400 font-medium">Real-time overview of your ecosystem performance.</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-2xl">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">Live Services</span>
                </div>
            </div>

            {/* Premium KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <motion.div
                        key={stat.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group relative bg-zinc-900/40 backdrop-blur-xl border border-white/5 hover:border-amber-500/30 p-6 rounded-[2rem] transition-all duration-500"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className="text-right">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                    {stat.trend}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-sm text-zinc-500 font-bold uppercase tracking-widest">{stat.name}</h2>
                            <p className="text-4xl font-black tracking-tighter text-white">{stat.value}</p>
                            <p className="text-[10px] font-medium text-zinc-500 pt-1">{stat.description}</p>
                        </div>
                        
                        {/* Decorative Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] pointer-events-none" />
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Users - Glass Feed */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-500/10 rounded-2xl">
                                <UserPlus className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold font-syne">Growth Feed</h2>
                                <p className="text-xs text-zinc-500">Newly joined members</p>
                            </div>
                        </div>
                        <Link href="/admin/users" className="group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-amber-500 hover:text-black rounded-xl text-xs font-bold transition-all">
                            Directory <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {recentUsers.map((user, i) => (
                            <motion.div 
                                key={user._id} 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center justify-between p-4 rounded-3xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-white/10 overflow-hidden relative group-hover:scale-105 transition-transform">
                                        {user.profilePicture ? (
                                            <Image 
                                                src={user.profilePicture.startsWith('http') ? user.profilePicture : `/uploads/${user.profilePicture}`} 
                                                alt={user.username} 
                                                fill 
                                                className="object-cover" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-black text-zinc-500 uppercase">
                                                {user.username.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-lg tracking-tight group-hover:text-amber-500 transition-colors">{user.username}</p>
                                        <p className="text-xs text-zinc-500 font-medium">{user.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg">
                                        {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Activity Log - Glass Feed */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-500/10 rounded-2xl">
                                <Clock className="w-6 h-6 text-indigo-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold font-syne">Live Activity</h2>
                                <p className="text-xs text-zinc-500">Real-time booking events</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {recentBookings.map((booking, i) => (
                            <motion.div 
                                key={booking._id}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center justify-between p-5 rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-indigo-500/30 transition-all group"
                            >
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-white truncate max-w-[250px] group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                                        {booking.event?.title || "Unknown Event"}
                                    </p>
                                    <p className="text-xs text-zinc-400 font-medium">
                                        Confirmed for <span className="text-zinc-200">{booking.user?.username || "Guest"}</span>
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 rounded-full">
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">
                                            {new Date(booking.bookingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 font-bold">
                                        {new Date(booking.bookingDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
