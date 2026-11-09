import { useState } from "react";
import { Mail, ArrowRight, Globe, Heart, Twitter, Linkedin } from "lucide-react";
import { toast } from "sonner";
import { subscribeNewsletter } from "../integrations/supabase/data";

interface FooterProps {
  onNavigate: (view: string, id?: string) => void;
}

const FOOTER_LINKS = {
  Technology: [
    { label: "Artificial Intelligence", view: "tech" },
    { label: "Programming & Development", view: "tech" },
    { label: "Software Reviews", view: "tech" },
    { label: "Gadgets & Tech News", view: "tech" },
    { label: "AI Tools & Tutorials", view: "tech" },
  ],
  Education: [
    { label: "Study Resources", view: "education" },
    { label: "Exam Preparation", view: "education" },
    { label: "GPA & CGPA Guides", view: "education" },
    { label: "Scholarships", view: "education" },
    { label: "University Guides", view: "education" },
  ],
  "Popular Tools": [
    { label: "GPA Calculator", view: "tools" },
    { label: "CGPA Calculator", view: "tools" },
    { label: "Percentage Calculator", view: "tools" },
    { label: "Word Counter", view: "tools" },
    { label: "QR Code Generator", view: "tools" },
  ],
};

const LEGAL_LINKS = [
  { label: "Privacy Policy", view: "privacy" },
  { label: "Terms of Service", view: "terms" },
  { label: "Disclaimer", view: "disclaimer" },
];

export default function Footer({ onNavigate }: FooterProps) {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSubscribing(true);
    try {
      const result = await subscribeNewsletter(email.trim().toLowerCase());
      toast.success(
        result === "exists"
          ? "You are already on the list. Thanks for staying with PearlHub!"
          : "Welcome to the PearlHub community! Check your inbox for a confirmation."
      );
      setEmail("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again in a moment.";
      toast.error(`Subscription failed: ${message}`);
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-navy text-white">
      {/* Newsletter Banner */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-1">Stay Ahead with PearlHub</h3>
              <p className="text-white/60 text-sm">Get curated guides, tools, and insights delivered to your inbox.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-2">
              <div className="relative flex-1 md:w-72">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={subscribing}
                className="px-5 py-2.5 rounded-lg bg-brand-purple hover:bg-brand-purple-light text-white text-sm font-medium transition-colors flex items-center gap-2 shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {subscribing ? "Joining..." : "Subscribe"} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <button onClick={() => onNavigate("home")} className="flex items-center gap-2 mb-4">
              <div className="rounded-lg bg-black px-2 py-1 inline-flex">
                <img src="https://dala-prod-public-storage.s3.eu-west-1.amazonaws.com/attachments/2279f60b-da80-4165-b5eb-bcd80ff90107/1793990664534_PearlHub_Tech_Learning_Logo.webp" alt="PearlHub Tech Learning" className="h-7 w-auto" />
              </div>
            </button>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm mb-4">
              Your gateway to knowledge, technology, and smarter tools. We create practical guides and free tools for students, professionals, and curious minds across Nigeria and the world.
            </p>
            <div className="flex items-center gap-2 text-white/40 text-sm mb-4">
              <Globe className="w-4 h-4" />
              <span>Nigeria &amp; Global</span>
            </div>
            <div className="flex items-center gap-3">
              <a href="https://twitter.com/pearlhub" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-brand-purple-light transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com/company/pearlhub" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-brand-purple-light transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white/80 mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => onNavigate(link.view)}
                      className="text-sm text-white/50 hover:text-brand-purple-light transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-white/40 text-xs flex items-center gap-1">
              &copy; 2025 PearlHub. Built with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> for learners everywhere.
            </p>
            <div className="flex items-center gap-4">
              {LEGAL_LINKS.map((link) => (
                <button
                  key={link.view}
                  onClick={() => onNavigate(link.view)}
                  className="text-white/40 hover:text-brand-purple-light text-xs transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}