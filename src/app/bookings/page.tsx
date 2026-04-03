"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import Navbar from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Ticket, CheckCircle2, XCircle, Clock, Loader2, Sparkles, Filter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Event {
  _id: string;
  title: string;
  category: string;
  city: string;
  date: string;
  imageUrl: string;
}

interface Booking {
  _id: string;
  event: Event;
  bookingDate: string;
  numberOfSeats: number;
  totalPrice: number;
  status: "confirmed" | "cancelled";
  paymentStatus: "paid" | "pending";
}

export default function BookingsLandingPage() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [recommendations, setRecommendations] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      const fetchBookingsData = async () => {
        setLoading(true);
        try {
          const res = await axios.get(`/api/user/bookings?userId=${session.user.id}`);
          if (res.data.success) {
            const fetchedBookings: Booking[] = res.data.bookings;
            setBookings(fetchedBookings);

            // Recommendations logic
            const categoryCounts: Record<string, number> = {};
            fetchedBookings.forEach((b) => {
              if (b.event?.category) {
                categoryCounts[b.event.category] = (categoryCounts[b.event.category] || 0) + 1;
              }
            });
            const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
            
            if (topCategory) {
              const recRes = await axios.get(`/api/events?category=${encodeURIComponent(topCategory)}&limit=4`);
              const bookedIds = new Set(fetchedBookings.map((b) => b.event?._id));
              setRecommendations(
                (recRes.data.events as Event[]).filter((e) => !bookedIds.has(e._id)).slice(0, 4)
              );
            } else {
              const recRes = await axios.get(`/api/events?limit=4`);
              setRecommendations(recRes.data.events as Event[]);
            }
          }
        } catch (error) {
          console.error("Failed to load bookings");
        } finally {
          setLoading(false);
        }
      };

      fetchBookingsData();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [session, status]);

  if (loading) {
    return (
      <div className="bg-background min-h-screen">
        <Navbar />
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="bg-background min-h-screen">
        <Navbar />
        <div className="container mx-auto pt-32 px-4 flex flex-col items-center justify-center text-center mt-20">
          <Ticket className="w-16 h-16 text-muted-foreground/30 mb-6" />
          <h1 className="text-3xl font-bold mb-4">You need to sign in</h1>
          <p className="text-muted-foreground mb-8">Sign in to view and manage your event bookings.</p>
          <Link href="/login">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white rounded-full px-8 py-6">Sign In / Register</Button>
          </Link>
        </div>
      </div>
    );
  }

  const now = new Date();
  const upcomingBookings = bookings.filter((b) => new Date(b.event?.date) >= now && b.status !== "cancelled");
  const pastBookings = bookings.filter((b) => new Date(b.event?.date) < now && b.status !== "cancelled");
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled");

  return (
    <div className="bg-[#020617] min-h-screen text-slate-200 selection:bg-amber-500/30">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-16 px-4 sm:px-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />
        </div>

        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center md:text-left"
          >
            <h1 className="text-4xl md:text-6xl font-bold font-syne text-white mb-4 tracking-tight">
              My <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600">Bookings</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl">
              Access your digital tickets, review past experiences, and discover your next unforgettable event.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-8 pb-24 relative z-10">
        <Tabs defaultValue="upcoming" className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <TabsList className="bg-slate-900/50 border border-white/5 p-1 h-auto rounded-full w-full max-w-md backdrop-blur-md justify-start grid grid-cols-3">
              <TabsTrigger
                value="upcoming"
                className="rounded-full py-2.5 px-4 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 font-medium transition-all"
              >
                Upcoming
                <Badge className="ml-2 bg-amber-500/10 text-amber-500 border-none">{upcomingBookings.length}</Badge>
              </TabsTrigger>
              <TabsTrigger
                value="past"
                className="rounded-full py-2.5 px-4 data-[state=active]:bg-white/10 data-[state=active]:text-white font-medium transition-all"
              >
                Past
                <Badge className="ml-2 bg-slate-800 text-slate-300 border-none">{pastBookings.length}</Badge>
              </TabsTrigger>
              <TabsTrigger
                value="cancelled"
                className="rounded-full py-2.5 px-4 data-[state=active]:bg-red-500/10 data-[state=active]:text-red-400 font-medium transition-all"
              >
                Cancelled
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="upcoming" className="mt-0 outline-none">
            {upcomingBookings.length > 0 ? (
              <BookingGrid bookings={upcomingBookings} />
            ) : (
              <EmptyState type="upcoming" />
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-0 outline-none">
            {pastBookings.length > 0 ? (
              <BookingGrid bookings={pastBookings} isPast />
            ) : (
              <EmptyState type="past" />
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="mt-0 outline-none">
            {cancelledBookings.length > 0 ? (
              <BookingGrid bookings={cancelledBookings} />
            ) : (
              <EmptyState type="cancelled" />
            )}
          </TabsContent>
        </Tabs>

        {/* You Might Like Section on the Bookings Page */}
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-28"
          >
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl font-bold text-white font-syne">Handpicked For You</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map((event) => (
                <Link href={`/event/${event._id}`} key={event._id} className="group">
                  <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-300">
                    <div className="relative h-40 overflow-hidden">
                      <Image
                        src={event.imageUrl ? `/uploads/${event.imageUrl}` : "/images/mockhead.jpg"}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-900 to-transparent" />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">{event.title}</h3>
                      <div className="flex items-center text-slate-400 text-sm gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-amber-500" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-slate-400 text-sm gap-2 mt-1">
                        <MapPin className="w-4 h-4 text-amber-500" />
                        {event.city}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

const BookingGrid = ({ bookings, isPast = false }: { bookings: Booking[], isPast?: boolean }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {bookings.map((booking, idx) => (
      <motion.div
        key={booking._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className={`bg-slate-900 border ${isPast ? 'border-white/5 opacity-80' : 'border-white/10 hover:border-amber-500/30'} rounded-2xl flex flex-col sm:flex-row overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group`}
      >
        {/* Ticket Left Side (Image) */}
        <div className="relative w-full sm:w-48 h-40 sm:h-auto overflow-hidden flex-shrink-0 flex sm:flex-col items-center justify-center bg-slate-800">
          <Image
            src={booking.event?.imageUrl ? `/uploads/${booking.event.imageUrl}` : "/images/mockhead.jpg"}
            alt={booking.event?.title || "Event"}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex flex-col items-center justify-center text-white p-4">
            <div className="text-center bg-black/50 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <span className="block text-sm font-medium uppercase tracking-widest text-amber-400">
                {booking.event?.date ? new Date(booking.event.date).toLocaleDateString('en-US', { month: 'short' }) : 'Unknown'}
              </span>
              <span className="block text-4xl font-black">
                {booking.event?.date ? new Date(booking.event.date).getDate() : '--'}
              </span>
            </div>
          </div>
        </div>

        {/* Ticket Right Side (Details) */}
        <div className="p-6 flex-1 flex flex-col justify-between border-l border-white/5 border-dashed relative">
          <div className="absolute top-0 -left-3 bottom-0 flex flex-col justify-between py-6 hidden sm:flex">
            <div className="w-6 h-6 rounded-full bg-[#020617] absolute -top-3"></div>
            <div className="w-6 h-6 rounded-full bg-[#020617] absolute -bottom-3"></div>
          </div>

          <div>
            <div className="flex justify-between items-start gap-4 mb-3">
              <h3 className="text-xl font-bold text-white line-clamp-2 leading-tight">
                {booking.event?.title || "Unknown Event"}
              </h3>
              <div className="flex flex-col gap-1 items-end flex-shrink-0">
                {booking.status === "confirmed" ? (
                  <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 gap-1 rounded-full whitespace-nowrap">
                    <CheckCircle2 className="w-3 h-3" /> Confirmed
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 gap-1 rounded-full whitespace-nowrap">
                    <XCircle className="w-3 h-3" /> Cancelled
                  </Badge>
                )}
                {booking.paymentStatus === "pending" && booking.status !== "cancelled" && (
                  <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 gap-1 rounded-full whitespace-nowrap">
                    <Clock className="w-3 h-3" /> Pending
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2 mt-4 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500/70" />
                <span>{booking.event?.city || 'Location unavailable'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500/70" />
                <span>{booking.numberOfSeats} Ticket{booking.numberOfSeats > 1 ? 's' : ''}</span>
                <span className="text-slate-500 mx-1">•</span>
                <span className="font-mono text-xs bg-slate-800 px-2 py-0.5 rounded text-amber-400/80">Ref: {booking._id.slice(-6).toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
            <div className="text-xs text-slate-500">
              Booked {new Date(booking.bookingDate).toLocaleDateString()}
            </div>
            {booking.event?._id && (
              <Link href={`/event/${booking.event._id}`}>
                <Button className="bg-white/5 hover:bg-white/10 text-white rounded-full transition-all border border-white/10 hover:border-white/20">
                  {isPast ? 'See Details' : 'View Tickets'}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

const EmptyState = ({ type }: { type: 'upcoming' | 'past' | 'cancelled' }) => (
  <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-white/5">
      {type === 'upcoming' ? <Ticket className="w-8 h-8 text-amber-500/50" /> : <Filter className="w-8 h-8 text-slate-500" />}
    </div>
    <h3 className="text-xl font-bold text-white mb-2">
      {type === 'upcoming' ? 'No Upcoming Events' : type === 'past' ? 'No Past Events' : 'No Cancelled Bookings'}
    </h3>
    <p className="text-slate-400 max-w-sm mb-8">
      {type === 'upcoming' 
        ? "You don't have any event bookings scheduled right now. Discover your next great experience."
        : `You have no ${type} bookings to show here.`}
    </p>
    {type === 'upcoming' && (
      <Link href="/explore">
        <Button className="bg-amber-600 hover:bg-amber-700 text-white rounded-full px-8">
          Explore Events
        </Button>
      </Link>
    )}
  </div>
);
