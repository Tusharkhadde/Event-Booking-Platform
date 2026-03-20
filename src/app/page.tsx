"use client";

import { buttonVariants } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { QuoteIcon } from "lucide-react";
import { MdEventAvailable, MdSecurity, MdSupportAgent } from "react-icons/md";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { LaserPrecision } from "@/components/ui/laser-precision";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Testimonial {
  image: string;
  quote: string;
  name: string;
}

const features: Feature[] = [
  {
    icon: <MdEventAvailable className="w-12 h-12 text-[#24AE7C]" />,
    title: "Easy to Use",
    description: "Intuitive interface for creating and managing events effortlessly."
  },
  {
    icon: <MdSecurity className="w-12 h-12 text-[#24AE7C]" />,
    title: "Secure Payments",
    description: "Trusted by thousands for seamless and secure transactions."
  },
  {
    icon: <MdSupportAgent className="w-12 h-12 text-[#24AE7C]" />,
    title: "24/7 Support",
    description: "Dedicated support team available to assist you anytime."
  }
];

const testimonials: Testimonial[] = [
  {
    image: "/images/user1.jpg",
    quote: "The easiest platform I've ever used to organize my events. Simply brilliant!",
    name: "Sarah L."
  },
  {
    image: "/images/user2.jpg",
    quote: "Booking tickets was a breeze, and the event experience was amazing!",
    name: "Michael T."
  },
  {
    image: "/images/user3.jpg",
    quote: "Highly recommend! The team is super supportive, and the features are top-notch.",
    name: "Emily R."
  }
];

export default function HomePage() {
  return (
    <>

      <div className="relative w-full min-h-screen">
        <Navbar background={false} />

        <div className="relative h-[800px] flex items-center overflow-hidden bg-[#2a2f2b]">
          <div className="absolute inset-0 z-0">
            <LaserPrecision className="w-full h-full opacity-70 mix-blend-screen" heroCenterX={0.7} heroCenterY={0.5} heroScale={0.85} />
            <div className="absolute inset-0 bg-gradient-to-r from-[#2a2f2b] via-[#2a2f2b]/60 to-transparent pointer-events-none"></div>
          </div>

          <div className="relative z-10 container mx-auto px-6 md:px-12 flex flex-col justify-center h-full">
            <div className="max-w-2xl space-y-6">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-white drop-shadow-md leading-tight">
                Your next big event starts here
              </h1>
              
              <p className="text-[#a0a8a3] text-lg sm:text-2xl max-w-lg font-medium animate-fade-in drop-shadow-sm leading-relaxed" style={{ animationDelay: "0.2s" }}>
                A beautiful platform to discover, book, and manage unforgettable experiences.
              </p>

              <div className="flex animate-fade-in pt-4" style={{ animationDelay: "0.4s" }}>
                <Link
                  href="/events/new"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "bg-[#d29f76] hover:bg-[#b8855a] text-black px-8 h-[52px] text-lg font-medium rounded-md transition-all duration-300 shadow-lg border border-[#e6b185]/20"
                  )}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-10 right-10 z-20 hidden md:block animate-fade-in" style={{ animationDelay: "1s" }}>
            <div className="px-5 py-2.5 bg-black/60 border border-white/5 rounded-md text-xs tracking-[0.2em] text-[#a0a8a3] font-mono shadow-xl backdrop-blur-sm">
              DRAG TO INTERACT
            </div>
          </div>
        </div>

        <section className="bg-muted/50 py-24 px-6 sm:px-12">
          <div className="container mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              Why Choose <span className="text-[#24AE7C]">Us?</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center text-center p-8 bg-background rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 group border border-border"
                >
                  <div className="mb-6 p-4 bg-muted rounded-2xl group-hover:bg-[#24AE7C]/10 transition-colors duration-500">
                    <div className="transform group-hover:scale-110 transition-transform duration-500">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-background py-24 px-6 sm:px-12">
          <div className="container mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              What Our <span className="text-[#24AE7C]">Users Say</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center p-8 bg-muted/50 rounded-2xl hover:bg-muted transition-all duration-300 border border-border"
                >
                  <div className="relative mb-6">
                    <Image
                      src={testimonial.image}
                      alt={`${testimonial.name}'s testimonial`}
                      width={80}
                      height={80}
                      className="rounded-full border-4 border-[#24AE7C] w-[80px] h-[80px] object-cover"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-[#24AE7C] rounded-full p-2 shadow-lg">
                      <QuoteIcon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 italic mb-4 text-center leading-relaxed">"{testimonial.quote}"</p>
                  <span className="text-sm font-bold text-[#24AE7C] uppercase tracking-wider">{testimonial.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative py-24 px-6 sm:px-12 overflow-hidden bg-black">
          <div className="absolute inset-0 z-0 opacity-20">
            <BackgroundPaths showContent={false} />
          </div>
          <div className="container mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl sm:text-6xl font-bold text-white mb-8 tracking-tighter">
                Ready to Start Your <span className="text-[#24AE7C]">Event Journey?</span>
              </h2>
              <p className="text-neutral-400 text-lg sm:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                Join thousands of successful organizers who trust our platform for their most important events.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link
                  href="/events/new"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "bg-[#24AE7C] hover:bg-[#329c75] text-white px-12 h-[64px] text-xl rounded-2xl transition-all duration-300 shadow-xl hover:shadow-[#24AE7C]/30 hover:-translate-y-1"
                  )}
                >
                  Get Started Free
                </Link>
                <Link
                  href="/contact"
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "border-white/20 text-white hover:bg-white/5 px-12 h-[64px] text-xl rounded-2xl transition-all duration-300"
                  )}
                >
                  Contact Sales
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <footer className="bg-gray-900 text-gray-300 py-12 px-6 sm:px-12">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <div className="space-y-4">
                <h3 className="text-white text-lg font-bold">Aura</h3>
                <p className="text-sm text-gray-400">
                  Making event management simple and efficient.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-semibold">Quick Links</h4>
                <nav className="flex flex-col space-y-2">
                  <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                    About
                  </Link>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                    Contact
                  </Link>
                  <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </nav>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-semibold">Features</h4>
                <nav className="flex flex-col space-y-2">
                  <Link href="/features" className="text-gray-400 hover:text-white transition-colors">
                    Event Management
                  </Link>
                  <Link href="/features" className="text-gray-400 hover:text-white transition-colors">
                    Ticket Sales
                  </Link>
                  <Link href="/features" className="text-gray-400 hover:text-white transition-colors">
                    Analytics
                  </Link>
                </nav>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-semibold">Connect</h4>
                <nav className="flex flex-col space-y-2">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Twitter
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    LinkedIn
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Facebook
                  </a>
                </nav>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-12 pt-8 text-center">
              <p className="text-sm">© 2024 Aura. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}