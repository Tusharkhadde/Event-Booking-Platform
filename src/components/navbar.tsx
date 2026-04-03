"use client";
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { Button, buttonVariants } from './ui/button';
import { FaCalendarMinus, FaBars, FaTimes } from "react-icons/fa";
import { Ticket, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { signOut, useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Session } from 'next-auth';

interface Props {
    background?: boolean;
    className?: string;
}

const NavLink = ({ href, children, className, onClick }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}) => (
    <Link
        href={href}
        className={className}
        onClick={onClick}
    >
        {children}
    </Link>
);

const Navbar: React.FC<Props> = ({ background = true, className }) => {
    const { data: session, status } = useSession();
    const [userBalance, setUserBalance] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchUserBalance = async () => {
            try {
                const response = await axios.get("/api/user/balance");
                if (response) setUserBalance(response.data.balance);
            } catch (error) {
                console.error(error);
            }
        }

        if (session) fetchUserBalance();
    }, [session]);

    const handleSignOut = async () => {
        await signOut();
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const navbarClassName = cn(
        'fixed z-50 transition-all duration-500 flex justify-between items-center px-6',
        background || isScrolled
            ? 'top-4 inset-x-4 md:inset-x-0 md:max-w-5xl md:mx-auto h-[64px] rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]'
            : 'top-0 w-full h-[80px] px-4 md:px-12 bg-transparent',
        className
    );

    const linkClassName = cn(
        "text-sm font-medium transition-all duration-300 px-4 py-2 rounded-full",
        {
            'text-gray-300 hover:text-white hover:bg-white/10': background || isScrolled,
            'text-white/80 hover:text-white hover:bg-white/10': !background && !isScrolled
        },
        "hover:cursor-pointer"
    );

    return (
        <nav className={navbarClassName}>
            <div className='flex flex-row items-center gap-6'>
                <NavLink href="/" className="flex flex-row items-center gap-3">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        className="bg-gradient-to-br from-[#F59E0B] to-[#D97706] p-[2px] rounded-2xl"
                    >
                        <Image
                            src="/images/logo.webp"
                            alt="Logo"
                            width={36}
                            height={36}
                            className="rounded-2xl"
                            priority
                        />
                    </motion.div>
                    <p className={cn("font-bold text-xl tracking-tight", {
                        "text-white": background || isScrolled,
                        "text-white": !background && !isScrolled
                    })}>
                        Aura
                    </p>
                </NavLink>
                
                <Separator orientation='vertical' className='hidden md:block bg-white/20 h-5' />
                
                <div className='hidden md:flex gap-1 items-center'>
                    <NavLink href="/explore" className={linkClassName}>
                        Explore Events
                    </NavLink>
                    {session && status === "authenticated" && (
                        <>
                            <NavLink
                                href="/bookings"
                                className={cn(linkClassName, "flex items-center gap-1.5")}
                            >
                                <Ticket className="w-3.5 h-3.5" />
                                My Bookings
                            </NavLink>
                            <NavLink
                                href="/bookings"
                                className={cn(linkClassName, "flex items-center gap-1.5")}
                            >
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                Recommendations
                            </NavLink>
                        </>
                    )}
                </div>
            </div>

            <div className='hidden md:flex flex-row items-center gap-4'>
                {session && status === "authenticated" ? (
                    <UserMenu
                        session={session}
                        userBalance={userBalance}
                        handleSignOut={handleSignOut}
                        background={background}
                        isScrolled={isScrolled}
                    />
                ) : (
                    <AuthLinks background={background} isScrolled={isScrolled} />
                )}
                <CreateEventButton />
            </div>

            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleMenu}
                aria-label="Toggle navigation menu"
                className={cn('md:hidden p-2 rounded-full hover:bg-white/10 transition-colors', {
                    'text-white': background || isScrolled,
                    'text-white': !background && !isScrolled
                })}
            >
                {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </motion.button>

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-[80px] left-4 right-4 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 flex flex-col items-center gap-4 py-6 md:hidden shadow-2xl z-50"
                    >
                        <MobileMenuContent
                            session={session}
                            status={status}
                            handleSignOut={handleSignOut}
                            toggleMenu={toggleMenu}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

const UserMenu = ({ session, userBalance, handleSignOut, background, isScrolled }: {
    session: Session;
    userBalance: number;
    handleSignOut: () => void;
    background: boolean;
    isScrolled: boolean;
}) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <motion.div
                whileHover={{ scale: 1.05 }}
                className={cn("flex flex-row items-center gap-3 px-3 py-1.5 cursor-pointer rounded-full border border-white/10 transition-all", {
                    'bg-white/5 hover:bg-white/10 text-white': background || isScrolled,
                    'bg-transparent hover:bg-white/10 text-white': !background && !isScrolled
                })}
            >
                <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-sm font-medium leading-none">{session.user.username}</span>
                    <span className="text-xs text-gray-400 mt-1">${userBalance || session.user.balance}</span>
                </div>
                <Avatar className='w-8 h-8 border border-white/20'>
                    <AvatarImage src={`/uploads/${session.user.profilePicture}`} />
                    <AvatarFallback className="text-white bg-gradient-to-br from-[#F59E0B] to-[#D97706]">
                        {session.user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-black/90 backdrop-blur-xl border-white/10 text-white shadow-2xl">
            <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user.username}</p>
                    <p className="text-xs leading-none text-gray-400">
                        Balance: ${userBalance || session.user.balance}
                    </p>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <NavLink href={`/profile/${session.user.id}`}>
                <DropdownMenuItem className='hover:cursor-pointer hover:bg-white/10 focus:bg-white/10'>Profile</DropdownMenuItem>
            </NavLink>
            <NavLink href="/events">
                <DropdownMenuItem className='hover:cursor-pointer hover:bg-white/10 focus:bg-white/10'>My Events</DropdownMenuItem>
            </NavLink>
            <NavLink href="/bookings">
                <DropdownMenuItem className='hover:cursor-pointer hover:bg-white/10 focus:bg-white/10 flex items-center gap-2'>
                    <Ticket className="w-3.5 h-3.5" /> My Bookings
                </DropdownMenuItem>
            </NavLink>
            <NavLink href="/bookings">
                <DropdownMenuItem className='hover:cursor-pointer hover:bg-white/10 focus:bg-white/10 flex items-center gap-2'>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Options For You
                </DropdownMenuItem>
            </NavLink>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
                className='text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-300 hover:cursor-pointer'
                onClick={handleSignOut}
            >
                Sign out
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);

const AuthLinks = ({ background, isScrolled }: {
    background: boolean;
    isScrolled: boolean;
}) => (
    <div className='flex flex-row items-center gap-3'>
        <NavLink
            href="/login"
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
        >
            Login
        </NavLink>
        <NavLink
            href="/register"
            className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition-colors"
        >
            Sign Up
        </NavLink>
    </div>
);

const CreateEventButton = () => (
    <NavLink
        href="/events/new"
        className="flex items-center gap-2 text-sm font-bold bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#F59E0B] text-white px-5 py-2.5 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transform hover:-translate-y-0.5"
    >
        <FaCalendarMinus size={16} />
        <span>Create Event</span>
    </NavLink>
);

const MobileMenuContent = ({ session, status, handleSignOut, toggleMenu }: {
    session: Session | null;
    status: string;
    handleSignOut: () => void;
    toggleMenu: () => void;
}) => (
    <>
        <CreateEventButton />
        <NavLink
            href="/explore"
            className="text-foreground hover:text-[#D97706] transition-all"
            onClick={toggleMenu}
        >
            Explore events
        </NavLink>
        {session && status === "authenticated" ? (
            <div className='flex flex-col items-center gap-4'>
                <NavLink
                    href={`/profile/${session.user.id}`}
                    className="text-foreground hover:text-[#D97706] transition-all"
                    onClick={toggleMenu}
                >
                    Your profile
                </NavLink>
                <NavLink
                    href="/bookings"
                    className="flex items-center gap-2 text-foreground hover:text-[#D97706] transition-all"
                    onClick={toggleMenu}
                >
                    <Ticket className="w-4 h-4" /> My Bookings
                </NavLink>
                <Button
                    variant="destructive"
                    className="hover:cursor-pointer transition-all"
                    onClick={handleSignOut}
                >
                    Sign out
                </Button>
            </div>
        ) : (
            <div className='flex flex-col items-center gap-4'>
                <NavLink
                    href="/login"
                    className="text-foreground hover:text-[#D97706] transition-all"
                    onClick={toggleMenu}
                >
                    Sign in
                </NavLink>
                <NavLink
                    href="/register"
                    className="text-foreground hover:text-[#D97706] transition-all"
                    onClick={toggleMenu}
                >
                    Create an account
                </NavLink>
            </div>
        )}
    </>
);

export default Navbar;