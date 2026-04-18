import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function PrivacyPage() {
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
        
        <h1 className="text-4xl font-extrabold tracking-tight mb-8 font-syne text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
          Privacy Policy
        </h1>
        
        <div className="space-y-6 text-zinc-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you create an account, book an event, or contact support. This includes your name, email address, and profile picture (via Google).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">2. How We Use Information</h2>
            <p>
              We use the information we collect to operate and maintain our services, process your transactions, send you event reminders, and improve the user experience on Aura.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">3. Sharing of Information</h2>
            <p>
              We do not sell your personal information. We share information with event organizers (only what is necessary for your booking) and third-party service providers like Stripe (for payments) and Cloudinary (for image storage).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">4. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to remember your preferences and keep you logged in. You can control cookie settings through your browser.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">5. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">6. Your Rights</h2>
            <p>
              You have the right to access, update, or delete your personal information at any time through your account settings.
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
