"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
    LayoutDashboard, 
    Users, 
    BarChart3, 
    Compass 
} from "lucide-react";

const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Directory", href: "/admin/users", icon: Users },
    { name: "Intelligence", href: "/admin/analytics", icon: BarChart3 },
    { name: "Ecosystem", href: "/explore", icon: Compass },
];

export default function AdminNav() {
    const pathname = usePathname();

    return (
        <nav className="space-y-2">
            {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500 group relative ${
                            isActive 
                                ? "text-white" 
                                : "text-zinc-500 hover:text-white"
                        }`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="nav-glow"
                                className="absolute inset-0 bg-amber-500/10 border border-amber-500/20 rounded-2xl"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <item.icon className={`w-5 h-5 transition-all duration-500 ${
                            isActive ? "text-amber-500" : "group-hover:scale-110"
                        }`} />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">{item.name}</span>
                        
                        {isActive && (
                            <motion.div 
                                className="absolute left-0 w-1 h-6 bg-amber-500 rounded-r-full"
                                layoutId="nav-line"
                            />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
