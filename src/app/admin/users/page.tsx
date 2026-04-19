"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Search, 
    MoreVertical, 
    User, 
    Mail, 
    Shield, 
    Trash2,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown
} from "lucide-react";
import Image from "next/image";

interface UserData {
    _id: string;
    username: string;
    email: string;
    role: "user" | "organizer" | "admin";
    status: "active" | "suspended";
    createdAt: string;
    profilePicture?: string;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    pages: number;
}

export default function UserManagement() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users?search=${search}&page=${page}`);
            const data = await res.json();
            if (data.users) {
                setUsers(data.users);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (userId: string, action: string, role?: string) => {
        setProcessingId(userId);
        try {
            const res = await fetch("/api/admin/users/action", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, action, role })
            });
            const data = await res.json();
            if (res.ok) {
                // Update local state without full refetch
                setUsers(prev => prev.map(u => {
                    if (u._id === userId) {
                        if (action === "suspend") return { ...u, status: "suspended" as const };
                        if (action === "activate") return { ...u, status: "active" as const };
                        if (action === "updateRole" && role) return { ...u, role: role as any };
                    }
                    return u;
                }));
            } else {
                alert(data.error || "Action failed");
            }
        } catch (error) {
            console.error("Admin action failed:", error);
        } finally {
            setProcessingId(null);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 500); // debounce
        return () => clearTimeout(timer);
    }, [search, page]);

    const getRoleStyles = (role: string) => {
        switch (role) {
            case "admin": return "text-rose-400 bg-rose-400/10 border-rose-400/20";
            case "organizer": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
            default: return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
        }
    };

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold font-syne tracking-tight text-white">Security & Directory</h1>
                    <p className="text-zinc-500 font-medium">Provision accounts, manage roles, and monitor status.</p>
                </div>

                <div className="relative group w-full md:w-[400px]">
                    <div className="absolute inset-0 bg-amber-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-full" />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-amber-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by ID, name, or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="relative w-full pl-12 pr-4 py-4 bg-zinc-900 border border-white/5 rounded-2xl outline-none focus:border-amber-500/50 transition-all shadow-2xl font-medium"
                    />
                </div>
            </div>

            {/* Table Container - Premium Glass */}
            <div className="bg-zinc-900/40 backdrop-blur-xl rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-white/5">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Identity</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Connection</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Permissions</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Node Joined</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">Protocol Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence mode="popLayout">
                                {loading && users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-24 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-12 h-12 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Scanning Directory...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-24 text-center">
                                            <div className="flex flex-col items-center gap-2 text-zinc-600">
                                                <Search className="w-12 h-12 mb-2 opacity-20" />
                                                <p className="text-sm font-bold">No results matching query</p>
                                                <p className="text-xs">Adjust your filters and try again</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user, i) => (
                                        <motion.tr
                                            key={user._id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="hover:bg-white/[0.02] transition-colors group"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-11 h-11 rounded-2xl bg-zinc-800 border border-white/5 overflow-hidden relative group-hover:scale-105 transition-transform shadow-lg">
                                                        {user.profilePicture ? (
                                                            <Image 
                                                                src={user.profilePicture.startsWith('http') ? user.profilePicture : `/uploads/${user.profilePicture}`} 
                                                                alt={user.username} 
                                                                fill
                                                                className="object-cover" 
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs font-black text-zinc-600 uppercase">
                                                                {user.username.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-white tracking-tight group-hover:text-amber-500 transition-colors uppercase text-sm">
                                                            {user.username}
                                                        </p>
                                                        <span className={`text-[9px] font-black uppercase tracking-tighter ${user.status === 'suspended' ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                            ● {user.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-zinc-300">{user.email}</span>
                                                    <span className="text-[10px] text-zinc-600 font-bold tracking-widest uppercase">SSL SECURED</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] border ${getRoleStyles(user.role)}`}>
                                                        {user.role}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-xs text-zinc-500 font-mono font-bold">
                                                    {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                                    {user.status === "active" ? (
                                                        <button 
                                                            onClick={() => handleAction(user._id, "suspend")}
                                                            disabled={processingId === user._id}
                                                            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-[0.1em] transition-all disabled:opacity-50"
                                                        >
                                                            <XCircle className="w-3 h-3" /> Suspend
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleAction(user._id, "activate")}
                                                            disabled={processingId === user._id}
                                                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-[0.1em] transition-all disabled:opacity-50"
                                                        >
                                                            <CheckCircle2 className="w-3 h-3" /> Activate
                                                        </button>
                                                    )}
                                                    
                                                    <div className="h-4 w-[1px] bg-white/10 mx-1" />

                                                    <select 
                                                        disabled={processingId === user._id}
                                                        onChange={(e) => handleAction(user._id, "updateRole", e.target.value)}
                                                        value={user.role}
                                                        className="bg-zinc-800 border-none rounded-xl text-[9px] font-black uppercase p-2 focus:ring-1 focus:ring-amber-500 outline-none cursor-pointer hover:bg-zinc-700 transition-colors"
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="organizer">Organizer</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Glass Pagination */}
                {pagination && pagination.pages > 1 && (
                    <div className="px-8 py-6 flex items-center justify-between bg-white/[0.01] border-t border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            Showing <span className="text-white">{(page - 1) * 10 + 1} - {Math.min(page * 10, pagination.total)}</span> of <span className="text-white">{pagination.total}</span> entries
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-3 rounded-xl bg-white/5 disabled:opacity-20 hover:bg-amber-500 hover:text-black transition-all border border-white/5"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-xs font-black text-white w-10 text-center">{page}</span>
                            <button
                                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                                disabled={page === pagination.pages}
                                className="p-3 rounded-xl bg-white/5 disabled:opacity-20 hover:bg-amber-500 hover:text-black transition-all border border-white/5"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
