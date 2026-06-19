import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Building, User, Phone, CheckCircle2, AlertCircle, ArrowRight, Shield } from 'lucide-react';

const GoogleIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

const MicrosoftIcon = (props) => (
  <svg viewBox="0 0 23 23" fill="currentColor" {...props}>
    <path fill="#f25022" d="M1 1h10v10H1z"/>
    <path fill="#7fba00" d="M12 1h10v10H12z"/>
    <path fill="#00a4ef" d="M1 12h10v10H1z"/>
    <path fill="#ffb900" d="M12 12h10v10H12z"/>
  </svg>
);

export default function AuthPages({ view }) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('Company Admin');
  
  // Registration state
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Feedback alerts
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles = [
    'Super Admin',
    'Sales',
    'Company Admin',
    'Dispatcher',
    'Driver',
    'Warehouse Manager',
    'Yard Attendant',
    'Accounts',
    'Customer'
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg(`Login Successful! Redirecting to ${selectedRole} dashboard...`);
      setTimeout(() => {
        login(email, selectedRole);
        navigate('/dashboard');
      }, 1500);
    }, 1200);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!companyName || !fullName || !email || !phone || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg('Account created successfully! Launching Onboarding Wizard...');
      setTimeout(() => {
        login(email, 'Company Admin');
        navigate('/onboarding');
      }, 1500);
    }, 1200);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email) {
      setError('Please provide your registered email address.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg('Reset link dispatched! Please check your email inbox.');
    }, 1000);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!password || !confirmPassword) {
      setError('Please fill out all password fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg('Password updated! Redirecting to login portal...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    }, 1000);
  };

  return (
    <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-[#0B0F19] relative px-4 overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-lg glass rounded-2xl p-8 sm:p-10 shadow-2xl relative z-10 animate-fade-in border border-[#23324C]/80">
        
        {/* Success Modal Overlay */}
        {successMsg && (
          <div className="absolute inset-0 bg-[#0B0F19]/95 rounded-2xl flex flex-col items-center justify-center text-center p-8 z-50 animate-fade-in">
            <CheckCircle2 className="h-16 w-16 text-emerald-400 mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-white mb-2">Success</h3>
            <p className="text-slate-300 max-w-xs">{successMsg}</p>
            <div className="w-12 h-1 border-t-2 border-brand-500 rounded-full animate-spin mt-6"></div>
          </div>
        )}

        {/* --- 1. LOGIN SCREEN --- */}
        {view === 'login' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold tracking-tight text-white mb-1.5">Sign In</h2>
              <p className="text-slate-400 text-sm">Enter your credentials to access the logistics suite</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start text-sm">
                <AlertCircle className="h-5 w-5 mr-2.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Simulated Role Selection for demo */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Simulated Portal Role
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Shield className="h-5 w-5 text-brand-400" />
                  </span>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="block w-full pl-10.5 pr-4 py-3 bg-[#111827]/80 border border-[#23324C] hover:border-brand-500/40 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/35 focus:border-brand-500 transition-all cursor-pointer"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r} className="bg-[#111827]">
                        {r} Dashboard Redirect
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="block w-full pl-10.5 pr-4 py-3 bg-[#111827]/80 border border-[#23324C] hover:border-brand-500/40 rounded-xl text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/35 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-300">Password</label>
                  <a
                    href="#forgot-password"
                    onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); setError(''); }}
                    className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10.5 pr-4 py-3 bg-[#111827]/80 border border-[#23324C] hover:border-brand-500/40 rounded-xl text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/35 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 bg-[#111827] border-[#23324C] text-brand-500 focus:ring-brand-500 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400 cursor-pointer select-none">
                  Remember this device
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all focus:outline-none disabled:opacity-50 flex items-center justify-center cursor-pointer"
              >
                {isSubmitting ? 'Verifying...' : 'Login to Account'}
                {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
              </button>
            </form>

            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#23324C]"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#161F30] px-3 text-slate-400">Or continue with</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <button
                onClick={() => { setSuccessMsg('Mock Google Sign-In Successful!'); setTimeout(() => setRoleDashboard('Company Admin'), 1200); }}
                className="py-2.5 px-4 rounded-xl border border-[#23324C] hover:border-brand-500/40 bg-slate-800/20 hover:bg-slate-800/40 text-slate-300 hover:text-white transition-all flex items-center justify-center text-sm cursor-pointer"
              >
                <GoogleIcon className="h-4.5 w-4.5 mr-2 text-brand-400" />
                Google
              </button>
              <button
                onClick={() => { setSuccessMsg('Mock Microsoft Sign-In Successful!'); setTimeout(() => setRoleDashboard('Company Admin'), 1200); }}
                className="py-2.5 px-4 rounded-xl border border-[#23324C] hover:border-brand-500/40 bg-slate-800/20 hover:bg-slate-800/40 text-slate-300 hover:text-white transition-all flex items-center justify-center text-sm cursor-pointer"
              >
                <MicrosoftIcon className="h-4.5 w-4.5 mr-2 text-purple-400" />
                Microsoft
              </button>
            </div>

            <div className="mt-8 text-center text-sm">
              <span className="text-slate-400">New to the platform? </span>
              <button
                onClick={() => { navigate('/register'); setError(''); }}
                className="text-brand-400 hover:text-brand-300 font-bold ml-1 transition-colors"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        )}

        {/* --- 2. REGISTRATION SCREEN --- */}
        {view === 'register' && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-3xl font-extrabold tracking-tight text-white mb-1.5">Free Trial</h2>
              <p className="text-slate-400 text-sm">Create your 14-day full access trial company</p>
            </div>

            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start text-sm">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Company Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Building className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Apex Logistics LLC"
                    className="block w-full pl-10.5 pr-4 py-2.5 bg-[#111827]/80 border border-[#23324C] hover:border-brand-500/40 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/35 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <User className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alexander Wright"
                    className="block w-full pl-10.5 pr-4 py-2.5 bg-[#111827]/80 border border-[#23324C] hover:border-brand-500/40 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/35 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Business Email</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Mail className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@company.com"
                      className="block w-full pl-10.5 pr-3 py-2.5 bg-[#111827]/80 border border-[#23324C] hover:border-brand-500/40 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/35 focus:border-brand-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Phone className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      className="block w-full pl-10.5 pr-3 py-2.5 bg-[#111827]/80 border border-[#23324C] hover:border-brand-500/40 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/35 focus:border-brand-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Lock className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-10.5 pr-3 py-2.5 bg-[#111827]/80 border border-[#23324C] hover:border-brand-500/40 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/35 focus:border-brand-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Confirm</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Lock className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-10.5 pr-3 py-2.5 bg-[#111827]/80 border border-[#23324C] hover:border-brand-500/40 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/35 focus:border-brand-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start pt-1">
                <input
                  id="agree-terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 mt-0.5 bg-[#111827] border-[#23324C] text-brand-500 focus:ring-brand-500 rounded cursor-pointer"
                />
                <label htmlFor="agree-terms" className="ml-2 block text-xs text-slate-400 cursor-pointer select-none leading-relaxed">
                  I agree to the <a href="#" className="text-brand-400 hover:underline">Terms of Service</a> & <a href="#" className="text-brand-400 hover:underline">Privacy Policy</a>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-lg shadow-brand-500/20 transition-all focus:outline-none disabled:opacity-50 flex items-center justify-center cursor-pointer mt-2"
              >
                {isSubmitting ? 'Creating Workspace...' : 'Create Account & Start Trial'}
                {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
              </button>
            </form>

            <div className="mt-6 text-center text-sm border-t border-[#23324C]/50 pt-5">
              <span className="text-slate-400">Already registered? </span>
              <button
                onClick={() => { navigate('/login'); setError(''); }}
                className="text-brand-400 hover:text-brand-300 font-bold ml-1 transition-colors"
              >
                Login Portal
              </button>
            </div>
          </div>
        )}

        {/* --- 3. FORGOT PASSWORD --- */}
        {view === 'forgot-password' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">Forgot Password</h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
                Enter your account email. We will generate and dispatch a secure reset link.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start text-sm">
                <AlertCircle className="h-5 w-5 mr-2.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="block w-full pl-10.5 pr-4 py-3 bg-[#111827]/80 border border-[#23324C] hover:border-brand-500/40 rounded-xl text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/35 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all focus:outline-none disabled:opacity-50 flex items-center justify-center cursor-pointer"
              >
                {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-8 text-center text-sm border-t border-[#23324C]/50 pt-6">
              <button
                onClick={() => { navigate('/login'); setError(''); }}
                className="text-slate-400 hover:text-white font-semibold transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}

        {/* --- 4. RESET PASSWORD --- */}
        {view === 'reset-password' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">Reset Password</h2>
              <p className="text-slate-400 text-sm">Create a new secure password for your credentials</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start text-sm">
                <AlertCircle className="h-5 w-5 mr-2.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10.5 pr-4 py-3 bg-[#111827]/80 border border-[#23324C] hover:border-brand-500/40 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/35 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10.5 pr-4 py-3 bg-[#111827]/80 border border-[#23324C] hover:border-brand-500/40 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/35 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all focus:outline-none disabled:opacity-50 flex items-center justify-center cursor-pointer"
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
        
      </div>
    </div>
  );
}
