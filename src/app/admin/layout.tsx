import { getServerSession } from "next-auth";
import { authConfig } from "@/utils/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
    LayoutDashboard, 
    Users, 
    BarChart3, 
    Settings, 
    LogOut, 
    Calendar,
    ArrowLeft,
    Cpu
} from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authConfig);

    if (!session || session.user.role !== "admin") {
        redirect("/");
    }


    return (
        <div className="flex h-screen bg-black text-zinc-400 selection:bg-amber-500 selection:text-black">
            {/* Sidebar */}
            <aside className="w-72 bg-zinc-950 border-r border-white/5 hidden lg:flex flex-col relative z-20">
                <div className="p-8">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-amber-500/20">
                            <Cpu className="w-6 h-6 text-black" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black font-syne text-white tracking-tighter uppercase">AURA</span>
                            <span className="text-[10px] uppercase tracking-[0.3em] text-amber-500 font-black">Control Panel</span>
                        </div>
                    </Link>
                </div>

                <div className="flex-1 px-4 py-6">
                    <p className="px-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-6">Operations</p>
                    <AdminNav />
                </div>

                <div className="p-6 border-t border-white/5 bg-zinc-950/50">
                    <div className="bg-zinc-900 border border-white/5 rounded-3xl p-4 flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white uppercase tracking-tight">{session.user.username}</p>
                            <p className="text-[10px] font-medium text-zinc-500">Root Administrator</p>
                        </div>
                    </div>
                    
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-6 py-4 rounded-2xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest">Exit Terminal</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between p-6 border-b border-white/5 bg-black/50 backdrop-blur-xl z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                            <Cpu className="w-5 h-5 text-black" />
                        </div>
                        <span className="text-sm font-black font-syne text-white tracking-widest uppercase">AURA OS</span>
                    </div>
                    {/* Simplified mobile nav for now */}
                    <Link href="/admin" className="p-2 bg-white/5 rounded-xl">
                        <LayoutDashboard className="w-5 h-5 text-zinc-400" />
                    </Link>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-12 custom-scrollbar bg-[url('/grid.svg')] bg-[length:40px_40px] relative">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>

                {/* Cyberpunk Decorative Gradients */}
                <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />
                <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />
            </main>
        </div>
    );
}
