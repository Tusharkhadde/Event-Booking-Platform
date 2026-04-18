import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center text-emerald-500 hover:text-emerald-400 mb-8 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-extrabold tracking-tight mb-8 font-syne text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
          Terms of Service
        </h1>
        
        <div className="space-y-6 text-zinc-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using this Event Booking Platform ("Aura"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">2. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate, current, and complete information during the registration process.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">3. Booking and Payments</h2>
            <p>
              All bookings are subject to availability. Payments are processed securely via Stripe. Refunds and cancellations are subject to the specific event organizer's policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">4. Prohibited Conduct</h2>
            <p>
              Users may not use the platform for any unlawful purposes, including but not limited to fraudulent bookings, harassment of other users, or attempting to breach platform security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">5. Limitation of Liability</h2>
            <p>
              Aura shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our services or participation in any listed events.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">6. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the platform after changes are posted constitutes acceptance of the new terms.
            </p>
          </section>

          <footer className="pt-8 border-t border-zinc-800 text-sm">
            <p>Last updated: April 18, 2026</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
