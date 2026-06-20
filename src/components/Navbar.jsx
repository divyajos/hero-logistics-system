import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ShieldAlert, Truck, ChevronRight } from 'lucide-react';
import heroLogo from '../assets/hero.png';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'Solutions', href: '#solutions' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Integrations', href: '#integrations' },
    { name: 'FAQ', href: '#faq' },
  ];

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    setIsOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for page to render before scrolling
      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#0B0B0B]/85 backdrop-blur-md border-b border-[#2E2E2E]/60 py-3 shadow-lg shadow-[#000000]/30' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <div className="px-2 py-1 bg-neutral-900 rounded-xl border border-[#2E2E2E] shadow-lg shadow-black/20 flex items-center justify-center hover:scale-105 transition-transform duration-300">
              <img src={heroLogo} alt="Hero Logistics Logo" className="h-9 w-auto object-contain" />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/40 transition-all duration-200"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop CTA Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            <button
              onClick={() => navigate('/login')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                location.pathname === '/login'
                  ? 'text-brand-500 bg-brand-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Login
            </button>
            <a
              href="#contact"
              onClick={(e) => handleLinkClick(e, '#contact')}
              className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white border border-[#2E2E2E] hover:border-brand-500/50 rounded-lg transition-all duration-200"
            >
              Book Demo
            </a>
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-2 text-sm font-extrabold text-slate-950 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 rounded-lg shadow-md shadow-brand-500/20 hover:shadow-brand-500/35 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 flex items-center justify-center gap-1 group cursor-pointer"
            >
              Start Free Trial
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 focus:outline-none transition-all"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
        isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
      }`}>
        <div className="px-2 pt-2 pb-4 space-y-1 bg-[#141414]/95 border-b border-[#2E2E2E] backdrop-blur-lg shadow-inner">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="block px-4 py-3 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-4 pb-2 border-t border-[#2E2E2E] px-4 space-y-3">
            <button
              onClick={() => { setIsOpen(false); navigate('/login'); }}
              className="w-full text-center py-2.5 text-base font-semibold text-slate-300 hover:text-white bg-slate-800/40 hover:bg-slate-800 rounded-lg transition-all"
            >
              Login
            </button>
            <a
              href="#contact"
              onClick={(e) => handleLinkClick(e, '#contact')}
              className="block w-full text-center py-2.5 text-base font-semibold text-slate-300 hover:text-white border border-[#2E2E2E] rounded-lg transition-all"
            >
              Book Demo
            </a>
            <button
              onClick={() => { setIsOpen(false); navigate('/register'); }}
              className="w-full text-center py-2.5 text-base font-extrabold text-slate-950 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 rounded-lg shadow-lg shadow-brand-500/25 transition-all cursor-pointer"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
