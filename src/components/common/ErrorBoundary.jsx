import React, { Component } from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex items-center justify-center p-6 selection:bg-brand-500 selection:text-white">
          <div className="glass max-w-md w-full rounded-3xl p-8 border border-[#23324C]/60 text-center space-y-6 shadow-2xl relative overflow-hidden">
            {/* Glowing Backdrop Decorative Circle */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl" />

            <div className="inline-flex items-center justify-center p-4 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-400">
              <AlertOctagon className="h-10 w-10 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-black text-white tracking-tight">System Node Disturbance</h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                An unexpected boundary error occurred while processing the logistics canvas. The operational state has been secured.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-[#111827] border border-[#23324C] rounded-xl p-3.5 text-left text-[10px] font-mono text-red-300 max-h-24 overflow-y-auto">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white font-extrabold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-brand-500/15"
              >
                <RotateCcw className="h-4 w-4" /> Restart App
              </button>
              <a
                href="/"
                className="flex-1 py-3 bg-[#1F2937]/50 hover:bg-[#1F2937] border border-[#23324C] text-slate-300 font-extrabold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Home className="h-4 w-4" /> Exit to Safety
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
