"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import Navbar from "@/components/navbar";
import { QRCodeCanvas } from "qrcode.react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Download, ArrowLeft, Loader2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import Image from "next/image";

interface Event {
  _id: string;
  title: string;
  date: string;
  address: string;
  city: string;
  imageUrl: string;
}

interface Booking {
  _id: string;
  event: Event;
  numberOfSeats: number;
  totalPrice: number;
  bookingDate: string;
  status: string;
  paymentStatus: string;
}

export default function TicketDetailPage() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (id) {
      const fetchTicket = async () => {
        try {
          const res = await axios.get(`/api/bookings/ticket/${id}`);
          if (res.data.success) {
            setBooking(res.data.booking);
          } else {
            toast.error(res.data.message || "Ticket not found");
          }
        } catch (error) {
          console.error("Error fetching ticket:", error);
          toast.error("Failed to load ticket details");
        } finally {
          setLoading(false);
        }
      };
      fetchTicket();
    }
  }, [id, status, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4">
        <Info className="w-16 h-16 text-slate-700 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Ticket Not Found</h1>
        <p className="text-slate-400 mb-8 text-center max-w-md">We couldn't find the ticket you're looking for. It might have been cancelled or doesn't exist.</p>
        <Button onClick={() => router.push("/bookings")}>Back to My Bookings</Button>
      </div>
    );
  }

  const { event } = booking;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <Navbar className="relative" />
      
      <div className="container mx-auto px-4 pt-10 pb-20 max-w-4xl">
        <Button 
          variant="ghost" 
          className="mb-8 text-slate-400 hover:text-white px-0"
          onClick={() => router.push("/bookings")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Bookings
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 bg-slate-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-sm shadow-2xl">
          {/* Left Side: QR & Ref */}
          <div className="md:col-span-2 bg-slate-950/50 p-10 flex flex-col items-center justify-center border-r md:border-b-0 border-white/5 border-dashed relative">
             {/* Ticket Cut-outs */}
             <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#020617] rounded-full hidden md:block"></div>
             <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#020617] rounded-full hidden md:block"></div>

            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-4 rounded-[2rem] shadow-2xl mb-6 relative group border-4 border-slate-100"
            >
              <QRCodeCanvas 
                value={booking._id} 
                size={220}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "/images/logo.png",
                  x: undefined,
                  y: undefined,
                  height: 48,
                  width: 48,
                  excavate: true,
                }}
              />
              <div className="absolute inset-0 border-[12px] border-white rounded-[2rem] pointer-events-none" />
            </motion.div>
            
            <div className="text-center space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Booking Reference</p>
              <p className="text-2xl font-black tracking-tighter text-amber-500">{booking._id.toUpperCase()}</p>
              <div className="pt-4">
                <Badge className={booking.status === "confirmed" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}>
                  {booking.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Right Side: Event Details */}
          <div className="md:col-span-3 p-10 flex flex-col">
            <div className="flex-1">
              <div className="mb-8">
                <h1 className="text-3xl font-black text-white mb-2 leading-tight">{event.title}</h1>
                <p className="inline-flex items-center text-amber-500 font-medium text-sm">
                  {event.city} • <span className="ml-2 py-0.5 px-2 bg-amber-500/10 rounded">{booking.numberOfSeats} Tickets</span>
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-500 border border-white/5">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Date & Time</p>
                    <p className="text-white font-medium">
                      {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-slate-400 text-sm">
                       {new Date(event.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-500 border border-white/5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Venue Location</p>
                    <p className="text-white font-medium">{event.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-500 border border-white/5">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Attendees</p>
                    <p className="text-white font-medium">{booking.numberOfSeats} Person{booking.numberOfSeats > 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex gap-4">
               <Button className="flex-1 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl h-14 font-bold shadow-lg shadow-amber-600/20" onClick={() => window.print()}>
                 <Download className="w-5 h-5 mr-2" /> Download Ticket
               </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 mt-0.5" />
          <p className="text-sm text-slate-300">
            Please present this ticket at the entry gate. The QR code will be scanned for verification. Make sure your screen brightness is set to high.
          </p>
        </div>
      </div>
    </div>
  );
}
