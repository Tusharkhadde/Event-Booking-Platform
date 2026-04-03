"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { QuoteIcon } from "lucide-react";
import { MdEventAvailable, MdSecurity, MdSupportAgent } from "react-icons/md";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { useEffect, useState, useCallback } from "react";

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
    icon: <MdEventAvailable className="w-12 h-12 text-[#F59E0B]" />,
    title: "Easy to Use",
    description: "Intuitive interface for creating and managing events effortlessly."
  },
  {
    icon: <MdSecurity className="w-12 h-12 text-[#F59E0B]" />,
    title: "Secure Payments",
    description: "Trusted by thousands for seamless and secure transactions."
  },
  {
    icon: <MdSupportAgent className="w-12 h-12 text-[#F59E0B]" />,
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
  const heroSlides = [
    {
      src: "/images/hero_event_bg.png",
      label: "Luxury Event Venues",
      tag: "✨ India's #1 Event Booking Platform",
    },
    {
      src: "/images/hero_event_bg2.png",
      label: "Music Festivals",
      tag: "🎵 Book Music Festivals & Concerts",
    },
    {
      src: "/images/hero_event_bg3.png",
      label: "Business Conferences",
      tag: "💼 Corporate Conferences & Summits",
    },
    {
      src: "/images/hero_event_bg4.png",
      label: "Weddings & Celebrations",
      tag: "💍 Weddings, Galas & Private Events",
    },
  ];

  const [activeSlide, setActiveSlide] = useState(0);

  const goToSlide = useCallback((index: number) => {
    setActiveSlide(index);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>


      <div className="relative w-full min-h-screen">
        <Navbar background={false} />

        {/* ── HERO SLIDER ── */}
        <div className="relative h-[800px] flex items-center overflow-hidden">

          {/* Slide Images — Crossfade */}
          <AnimatePresence initial={false}>
            {heroSlides.map((slide, i) =>
              i === activeSlide ? (
                <motion.div
                  key={slide.src}
                  className="absolute inset-0 z-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                >
                  <Image
                    src={slide.src}
                    alt={slide.label}
                    fill
                    priority={i === 0}
                    className="object-cover object-center"
                  />
                  {/* Cinematic dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25 pointer-events-none" />
                  {/* Bottom fade */}
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                </motion.div>
              ) : null
            )}
          </AnimatePresence>

          {/* Hero Content */}
          <div className="relative z-10 container mx-auto px-6 md:px-16 flex flex-col justify-center h-full">
            <div className="max-w-2xl space-y-6">

              {/* Animated slide label badge */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide + "-badge"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/10 backdrop-blur-sm w-fit"
                >
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
                  <span className="text-[#F59E0B] text-sm font-semibold tracking-wide">
                    {heroSlides[activeSlide].tag}
                  </span>
                </motion.div>
              </AnimatePresence>

              {/* Main Heading */}
              <h1 className="hero-slide-in font-heading text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-tight">
                Book Your{" "}
                <span className="text-glow-gold block sm:inline">
                  Perfect Event
                </span>
              </h1>

              {/* Sub-heading */}
              <p className="hero-slide-in text-gray-300 text-lg sm:text-xl max-w-lg leading-relaxed" style={{ animationDelay: "0.3s" }}>
                Discover and book unforgettable concerts, conferences, weddings
                &amp; more — all in one place.
              </p>

              {/* CTAs */}
              <div className="hero-slide-in flex flex-col sm:flex-row gap-4 pt-2" style={{ animationDelay: "0.45s" }}>
                <Link
                  href="/explore"
                  className="flex items-center justify-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-black px-8 h-[54px] text-base font-bold rounded-xl transition-all duration-300 shadow-[0_0_24px_rgba(245,158,11,0.4)] hover:shadow-[0_0_32px_rgba(245,158,11,0.6)] hover:-translate-y-0.5"
                >
                  🎟️ Explore Events
                </Link>
                <Link
                  href="/events/new"
                  className="flex items-center justify-center gap-2 border border-white/30 hover:border-[#F59E0B]/60 text-white hover:text-[#F59E0B] bg-white/5 hover:bg-[#F59E0B]/10 backdrop-blur-sm px-8 h-[54px] text-base font-semibold rounded-xl transition-all duration-300"
                >
                  ✨ Create an Event
                </Link>
              </div>
            </div>
          </div>

          {/* ── Dot Indicators (bottom-center) ── */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`transition-all duration-500 rounded-full ${
                  i === activeSlide
                    ? "w-8 h-2 bg-[#F59E0B]"
                    : "w-2 h-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          {/* ── Stats badge bottom-right ── */}
          <div className="absolute bottom-10 right-10 z-20 hidden md:flex animate-fade-in" style={{ animationDelay: "1s" }}>
            <div className="flex items-center gap-3 px-5 py-3 bg-black/60 border border-white/10 rounded-xl backdrop-blur-md shadow-xl">
              <div className="text-right">
                <p className="text-white text-xl font-bold">50K+</p>
                <p className="text-gray-400 text-xs tracking-wide">Events Booked</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-right">
                <p className="text-white text-xl font-bold">4.9★</p>
                <p className="text-gray-400 text-xs tracking-wide">User Rating</p>
              </div>
            </div>
          </div>
        </div>



        <section className="bg-muted/50 py-24 px-6 sm:px-12">
          <div className="container mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              Why Choose <span className="text-[#F59E0B]">Us?</span>
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
                  <div className="mb-6 p-4 bg-muted rounded-2xl group-hover:bg-[#F59E0B]/10 transition-colors duration-500">
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
              What Our <span className="text-[#F59E0B]">Users Say</span>
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
                      className="rounded-full border-4 border-[#F59E0B] w-[80px] h-[80px] object-cover"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-[#F59E0B] rounded-full p-2 shadow-lg">
                      <QuoteIcon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 italic mb-4 text-center leading-relaxed">"{testimonial.quote}"</p>
                  <span className="text-sm font-bold text-[#F59E0B] uppercase tracking-wider">{testimonial.name}</span>
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
                Ready to Start Your <span className="text-[#F59E0B]">Event Journey?</span>
              </h2>
              <p className="text-neutral-400 text-lg sm:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                Join thousands of successful organizers who trust our platform for their most important events.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link
                  href="/events/new"
                  className="inline-flex items-center justify-center bg-[#ffc83c] hover:bg-[#ffb300] text-black px-12 h-[64px] text-xl font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-[rgba(255,200,60,0.4)] hover:-translate-y-1"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center border border-white/20 text-white hover:bg-white/5 px-12 h-[64px] text-xl font-semibold rounded-2xl transition-all duration-300"
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