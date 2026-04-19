"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
    BarChart3, 
    TrendingUp, 
    Users, 
    DollarSign,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Filter
} from "lucide-react";

interface AnalyticsData {
    revenueTrends: {
        _id: string;
        dailyRevenue: number;
        bookingsCount: number;
    }[];
    userGrowth: {
        _id: string;
        newUsers: number;
    }[];
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activePeriod, setActivePeriod] = useState("30d");

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch("/api/admin/analytics");
                const result = await res.json();
                if (result.revenueTrends) {
                    setData(result);
                }
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-amber-500/10 rounded-full"></div>
                    <div className="w-20 h-20 border-4 border-amber-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
            </div>
        );
    }

    const maxRevenue = data && data.revenueTrends.length > 0 ? Math.max(...data.revenueTrends.map(d => d.dailyRevenue), 100) : 100;
    const maxUsers = data && data.userGrowth.length > 0 ? Math.max(...data.userGrowth.map(d => d.newUsers), 10) : 10;

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            {/* Intel Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold font-syne tracking-tight text-white">Platform Intelligence</h1>
                    <p className="text-zinc-500 font-medium">Historical trends, revenue forecasting, and node growth.</p>
                </div>
                
                <div className="flex items-center gap-3 bg-zinc-900 border border-white/5 p-2 rounded-2xl">
                    {["7d", "30d", "90d", "All"].map((p) => (
                        <button 
                            key={p}
                            onClick={() => setActivePeriod(p)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activePeriod === p ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Overview - High Fidelity Chart */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 bg-zinc-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 shadow-2xl relative overflow-hidden group"
                >
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl">
                                <DollarSign className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold font-syne">Revenue Velocity</h2>
                                <p className="text-xs text-zinc-500">Daily financial nodes across the network</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black tracking-widest uppercase">
                            <TrendingUp className="w-3 h-3" />
                            +24.8% MOM GROWTH
                        </div>
                    </div>

                    <div className="h-[350px] flex items-end justify-between gap-3 px-4 relative">
                        {/* Grid Lines */}
                        <div className="absolute inset-x-0 bottom-[40px] top-0 flex flex-col justify-between pointer-events-none">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-full border-t border-dashed border-white/5" />
                            ))}
                        </div>

                        {data?.revenueTrends.map((trend, i) => (
                            <div key={trend._id} className="flex-1 flex flex-col items-center group/bar relative">
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(trend.dailyRevenue / maxRevenue) * 280}px` }}
                                    transition={{ delay: i * 0.02, duration: 0.8, ease: "circOut" }}
                                    className="w-full max-w-[24px] bg-gradient-to-t from-emerald-500/20 to-emerald-500 rounded-t-lg group-hover/bar:from-emerald-400 group-hover/bar:to-emerald-400 transition-all relative z-10"
                                >
                                    {/* Interactive Tooltip */}
                                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-3 py-2 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-all scale-75 group-hover/bar:scale-100 whitespace-nowrap z-20 shadow-2xl uppercase tracking-tighter">
                                        <p className="opacity-50 mb-0.5 text-[8px] font-bold">{trend._id}</p>
                                        <p className="text-lg tracking-tight">${trend.dailyRevenue.toLocaleString()}</p>
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-white rotate-45" />
                                    </div>
                                </motion.div>
                                <span className="text-[9px] font-black text-zinc-600 font-mono mt-4 origin-left -rotate-45 h-10 group-hover/bar:text-white transition-colors">
                                    {trend._id.split('-').slice(1).join('/')}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* User Influx - High Fidelity Analytics */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-zinc-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 p-8 shadow-2xl relative overflow-hidden group"
                >
                    <div className="flex items-center gap-4 mb-12">
                        <div className="p-3 bg-amber-500/10 rounded-2xl">
                            <Users className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold font-syne">Node Influx</h2>
                            <p className="text-xs text-zinc-500">Monthly community expansion</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {data?.userGrowth.map((growth, i) => (
                            <div key={growth._id} className="space-y-3">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                                    <span className="group-hover:text-amber-500 transition-colors">{growth._id}</span>
                                    <span className="text-white bg-white/5 px-2 py-0.5 rounded-lg">{growth.newUsers} NODES</span>
                                </div>
                                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(growth.newUsers / maxUsers) * 100}%` }}
                                        transition={{ delay: i * 0.1, duration: 1.2, ease: "circOut" }}
                                        className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full relative shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 p-6 bg-zinc-900 border border-white/5 rounded-[2rem] text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-50" />
                        <p className="relative z-10 text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-1">Network Capacity</p>
                        <p className="relative z-10 text-4xl font-black font-syne text-white tracking-tighter">1,284</p>
                        <div className="relative z-10 flex items-center justify-center gap-1.5 text-[10px] text-emerald-500 font-black mt-2 tracking-widest uppercase">
                            <TrendingUp className="w-3.5 h-3.5" />
                            +12% ANNUAL GROWTH
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Performance Node Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Avg Ticket Value", value: "$45.20", trend: "+2.4%", up: true, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                    { label: "Conversion Rate", value: "3.8%", trend: "-0.5%", up: false, icon: BarChart3, color: "text-rose-500", bg: "bg-rose-500/10" },
                    { label: "Organizer Depth", value: "124", trend: "+14", up: true, icon: Users, color: "text-amber-500", bg: "bg-amber-500/10" },
                    { label: "Engine Capacity", value: "84%", trend: "+5.2%", up: true, icon: Calendar, color: "text-indigo-500", bg: "bg-indigo-500/10" },
                ].map((stat, i) => (
                    <motion.div 
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + (i * 0.05) }}
                        className="bg-zinc-900/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all shadow-2xl relative overflow-hidden"
                    >
                        <div className="relative z-10 space-y-2">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">{stat.label}</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl font-black text-white tracking-tight">{stat.value}</h3>
                                <div className={`flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-lg ${stat.up ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                    {stat.up ? '+' : ''}{stat.trend}
                                </div>
                            </div>
                        </div>
                        <div className={`relative z-10 p-3 ${stat.bg} ${stat.color} rounded-2xl group-hover:scale-110 transition-transform duration-500`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
