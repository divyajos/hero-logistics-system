import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck } from 'lucide-react';

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

export default function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const handleFooterLink = (e, path) => {
    e.preventDefault();
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#070A12] border-t border-[#23324C]/60 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-brand-500 rounded-xl mr-2.5 flex items-center justify-center">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                HERO<span className="text-brand-500 font-medium">LOGISTICS</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
              The complete logistics operating system. Streamline your dispatching, routing, drivers, billing, and fleet tracking under one secure, cloud-based platform.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-slate-800/40 hover:bg-brand-500/20 text-slate-400 hover:text-brand-400 rounded-lg transition-all">
                <TwitterIcon className="h-4.5 w-4.5" />
              </a>
              <a href="#" className="p-2 bg-slate-800/40 hover:bg-brand-500/20 text-slate-400 hover:text-brand-400 rounded-lg transition-all">
                <LinkedinIcon className="h-4.5 w-4.5" />
              </a>
              <a href="#" className="p-2 bg-slate-800/40 hover:bg-brand-500/20 text-slate-400 hover:text-brand-400 rounded-lg transition-all">
                <GithubIcon className="h-4.5 w-4.5" />
              </a>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-slate-200 font-semibold text-sm tracking-wider uppercase mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="text-slate-400 hover:text-white transition-colors">Pricing Plans</a></li>
              <li><a href="#integrations" className="text-slate-400 hover:text-white transition-colors">Integrations</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Developer API</a></li>
            </ul>
          </div>

          {/* Solutions links */}
          <div>
            <h4 className="text-slate-200 font-semibold text-sm tracking-wider uppercase mb-4">Solutions</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#solutions" className="text-slate-400 hover:text-white transition-colors">General Freight</a></li>
              <li><a href="#solutions" className="text-slate-400 hover:text-white transition-colors">Car Carrying</a></li>
              <li><a href="#solutions" className="text-slate-400 hover:text-white transition-colors">Courier Fleets</a></li>
              <li><a href="#solutions" className="text-slate-400 hover:text-white transition-colors">3PL Logistics</a></li>
            </ul>
          </div>

          {/* Resources links */}
          <div>
            <h4 className="text-slate-200 font-semibold text-sm tracking-wider uppercase mb-4">Resources</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">System Status</a></li>
              <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Help & Support</a></li>
              <li>
                <a 
                  href="/login" 
                  onClick={(e) => handleFooterLink(e, '/login')} 
                  className="text-brand-400 hover:text-brand-300 font-semibold transition-colors flex items-center"
                >
                  Login Portal
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#23324C]/40 pt-8 mt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {currentYear} Hero Systems Inc. All rights reserved. Built for logistics excellence.
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Security Rules</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
