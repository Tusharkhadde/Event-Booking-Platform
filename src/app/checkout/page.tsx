"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import Navbar from "@/components/navbar";
import { GlassCheckoutCard } from "@/components/ui/glass-checkout-card-shadcnui";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, ShieldCheck, CheckCircle2, QrCode, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { QRCodeCanvas } from "qrcode.react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Event {
  _id: string;
  title: string;
  price: number;
  imageUrl: string;
  date: string;
  address: string;
}

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const eventId = searchParams.get("eventId");
  const quantity = parseInt(searchParams.get("quantity") || "1");

  useEffect(() => {
    if (!eventId) {
      router.push("/");
      return;
    }

    const fetchEvent = async () => {
      try {
        const res = await axios.get(`/api/events/${eventId}`);
        setEvent(res.data);
      } catch (err) {
        console.error("Failed to fetch event", err);
        toast.error("Could not load event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, router]);

  const handlePaymentSuccess = async () => {
    if (!event || !session?.user?.id) return;

    setIsProcessing(true);
    try {
      const response = await axios.post("/api/checkout", {
        amount: event.price,
        quantity: quantity,
        eventName: event.title,
        userId: session.user.id,
        eventId: event._id,
      });

      if (response.status === 200) {
        toast.success("Payment Successful!");
        // The API returns { proxy: true, url: '/success' } or { id: stripe_session_id }
        // We modified it to return bookingId in our plan, let's check what it currently returns.
        // For now, let's redirect to success with the booking reference if available.
        const bookingId = response.data.bookingId || response.data.id || "SUCCESS";
        router.push(`/success?code=${bookingId}`);
      }
    } catch (error) {
      console.error("Payment failed", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        <p className="mt-4 text-slate-400">Loading checkout details...</p>
      </div>
    );
  }

  const totalAmount = (event?.price || 0) * quantity;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <Navbar className="relative" />
      
      <div className="container mx-auto px-4 pt-10 pb-20">
        <Button 
          variant="ghost" 
          className="mb-8 text-slate-400 hover:text-white"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Event
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Side: Order Summary */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-4xl font-bold font-syne text-white mb-2">Checkout</h1>
              <p className="text-slate-400">Review your order and complete the payment.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-500" /> Order Summary
              </h2>
              
              <div className="flex gap-6">
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10">
                  <Image
                    src={event?.imageUrl ? (event.imageUrl.startsWith('http') ? event.imageUrl : `/uploads/${event.imageUrl}`) : "/images/mockhead.jpg"}
                    alt={event?.title || "Event"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-bold text-white">{event?.title}</h3>
                  <p className="text-slate-400 text-sm line-clamp-1">{event?.address}</p>
                  <div className="flex justify-between items-end mt-4">
                    <div className="text-sm">
                      <span className="text-slate-500">Tickets:</span>
                      <span className="ml-2 text-white font-medium">{quantity} x ${event?.price.toFixed(2)}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Total Amount</p>
                      <p className="text-2xl font-black text-amber-500">${totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900/40 border border-white/5 rounded-3xl p-6"
            >
              <div className="flex items-center gap-4 text-emerald-400 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                <ShieldCheck className="w-6 h-6" />
                <div>
                  <p className="font-bold text-sm">Secure Payment Gateway</p>
                  <p className="text-xs opacity-80">This is a demonstration payment environment.</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Side: Payment Methods */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6">Select Payment Method</h2>
              
              <Tabs defaultValue="card" className="w-full">
                <TabsList className="grid grid-cols-3 bg-slate-950/50 p-1 rounded-2xl border border-white/10 mb-6 h-14">
                  <TabsTrigger value="card" className="rounded-xl data-[state=active]:bg-amber-500 data-[state=active]:text-black">
                    <CreditCard className="w-4 h-4 mr-2" /> Card
                  </TabsTrigger>
                  <TabsTrigger value="upi" className="rounded-xl data-[state=active]:bg-amber-500 data-[state=active]:text-black">
                    UPI
                  </TabsTrigger>
                  <TabsTrigger value="qr" className="rounded-xl data-[state=active]:bg-amber-500 data-[state=active]:text-black">
                    <QrCode className="w-4 h-4 mr-2" /> QR
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="card">
                  <GlassCheckoutCard 
                    amount={totalAmount} 
                    className="max-w-full"
                  />
                  <Button 
                    className="w-full mt-6 bg-amber-600 hover:bg-amber-700 text-white h-14 rounded-2xl font-bold text-lg shadow-lg shadow-amber-600/20"
                    onClick={handlePaymentSuccess}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : `Proceed to Pay $${totalAmount.toFixed(2)}`}
                  </Button>
                </TabsContent>

                <TabsContent value="upi">
                  <div className="bg-card/30 backdrop-blur-md border border-white/5 rounded-3xl p-8 text-center space-y-6">
                    <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
                      <span className="text-2xl font-bold text-amber-500">UPI</span>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="upi-id" className="text-slate-400">Enter Your UPI ID</Label>
                      <input 
                        id="upi-id"
                        placeholder="username@bank"
                        className="w-full h-14 bg-slate-950/50 border border-white/10 rounded-2xl px-4 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                    <Button 
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white h-14 rounded-2xl font-bold"
                      onClick={handlePaymentSuccess}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Verifying..." : "Verify & Pay"}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="qr">
                  <div className="bg-card/30 backdrop-blur-md border border-white/5 rounded-3xl p-8 text-center space-y-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="bg-white p-4 rounded-3xl inline-block mx-auto shadow-2xl relative z-10">
                      <QRCodeCanvas 
                        value={`upi://pay?pa=${process.env.NEXT_PUBLIC_UPI_ID || "eventflow@bank"}&pn=EventFlow&am=${totalAmount}&cu=INR&tn=Booking for ${event?.title}`} 
                        size={220}
                        level="H"
                        includeMargin={true}
                        imageSettings={{
                          src: "/images/logo.png",
                          x: undefined,
                          y: undefined,
                          height: 40,
                          width: 40,
                          excavate: true,
                        }}
                      />
                    </div>
                    <div className="space-y-2 relative z-10">
                      <p className="text-sm font-bold text-white">Scan & Pay</p>
                      <p className="text-xs text-slate-400">Scan this code with any UPI app like GPay, PhonePe, or Paytm</p>
                    </div>
                    <Button 
                      variant="outline"
                      className="w-full border-white/10 hover:bg-white/5 h-14 rounded-2xl relative z-10"
                      onClick={handlePaymentSuccess}
                      disabled={isProcessing}
                    >
                      I have completed the payment
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Animation Overlay */}
      {isProcessing && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
        >
          <div className="relative w-32 h-32 mb-8">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-t-4 border-amber-500 rounded-full"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 border-b-4 border-blue-500 rounded-full opacity-50"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <ShieldCheck className="w-12 h-12 text-amber-500 animate-pulse" />
            </div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold font-syne text-white mb-2">Processing Payment</h2>
            <p className="text-slate-400 max-w-xs mx-auto">Please wait while we secure your transaction. Do not refresh or close this page.</p>
          </motion.div>
          
          <div className="mt-10 flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 bg-amber-500 rounded-full"
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">Loading...</div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}
