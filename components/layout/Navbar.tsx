'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GraduationCap,
  Calendar,
  FileText,
  BarChart3,
  Target,
  CreditCard,
  Info,
  Mail,
  LogIn,
  LogOut,
  Settings,
  MessageCircle,
  Menu,
  X,
  Home,
} from 'lucide-react';
import { DarkModeToggle } from '@/components/ui/DarkModeToggle';
import { useState } from 'react';
import { ChatbotModal } from '@/components/chatbot/ChatbotModal';
import { useSession } from '@/lib/use-session';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/learn', label: 'Learn', icon: GraduationCap },
  { href: '/planner', label: 'Study Planner', icon: Calendar },
  { href: '/worksheet', label: 'Worksheet', icon: FileText },
  { href: '/progress', label: 'Progress', icon: BarChart3 },
  { href: '/weakness', label: 'Weakness', icon: Target },
  { href: '/pricing', label: 'Pricing', icon: CreditCard },
  { href: '/about', label: 'About', icon: Info },
  { href: '/contact', label: 'Contact', icon: Mail },
];

export function Navbar() {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');
  const { user, loading } = useSession();
  const [chatOpen, setChatOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    if (typeof window !== 'undefined') localStorage.removeItem('omnilearn-user');
    window.location.href = '/';
  };

  if (isAuthPage) {
    return (
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0c]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white hover:text-brand-primary transition-colors">
            <span className="bg-brand-primary/20 p-1.5 rounded-lg border border-brand-primary/30">
              <GraduationCap className="w-5 h-5 text-brand-primary" />
            </span>
            OmniLearnAI
          </Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-white">← Back to Home</Link>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0c]/80 backdrop-blur-md relative">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg text-white hover:text-brand-primary transition-colors"
          >
            <span className="bg-brand-primary/20 p-1.5 rounded-lg border border-brand-primary/30">
              <GraduationCap className="w-5 h-5 text-brand-primary" />
            </span>
            OmniLearnAI
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${
                  pathname === href
                    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="p-2 rounded-lg border border-white/10 bg-white/5"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
              aria-label="Help"
            >
              <MessageCircle className="w-5 h-5 text-gray-400" />
            </button>
            <DarkModeToggle />
            {!loading && (
              user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 max-w-[120px] truncate" title={user.email}>
                    {user.name || user.email}
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              )
            )}
            <Link
              href="/admin"
              className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
              aria-label="Admin"
            >
              <Settings className="w-5 h-4" />
            </Link>
          </div>
        </div>
        {mobileOpen && (
          <div className="absolute top-full left-0 right-0 mt-0 py-2 px-4 bg-[#0a0a0c]/95 border-t border-white/10 backdrop-blur-md md:hidden flex flex-col gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${
                  pathname === href
                    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        )}
      </header>
      <ChatbotModal open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
