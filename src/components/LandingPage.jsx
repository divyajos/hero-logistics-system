import React, { useState } from 'react';
import { 
  ArrowRight, ShieldCheck, Star, Sparkles, Navigation, CheckCircle2,
  Calendar, Check, ChevronDown, Plus, Mail, MessageSquare, Phone, Building, User
} from 'lucide-react';

export default function LandingPage({ setView }) {
  // Solutions State
  const [activeSolution, setActiveSolution] = useState('General Freight');
  
  // Screenshots State
  const [activeScreenshot, setActiveScreenshot] = useState('Admin Dashboard');

  // Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  // Form State
  const [formData, setFormData] = useState({ name: '', company: '', email: '', phone: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const solutions = [
    { name: 'General Freight', desc: 'Manage full truckloads (FTL) and less-than-truckloads (LTL) with automated scheduling, custom bill of lading rates, and real-time transit notifications.', points: ['Automated dispatch match templates', 'Multi-stop route planning systems', 'Custom billing tables & invoices'] },
    { name: 'Car Carrying', desc: 'Secure transport logs for automotive transit. Track vehicle VIN numbers, vehicle inspection report checklists, and trailer space loading capacities.', points: ['Multi-car visual loading charts', 'Damage inspection photo capture', 'Electronic Bill of Lading (eBOL)'] },
    { name: 'Courier', desc: 'Final-mile localized delivery routes optimized for high-volume courier vehicles, parcel barcodes scanning, and instant driver push dispatching.', points: ['SLA urgency countdown clocks', 'Customer notification alerts via Twilio', 'Barcode scanning and proof-of-delivery'] },
    { name: 'Fleet Management', desc: 'Complete telematics suite tracking vehicle mechanical health logs, refueling sheets, maintenance scheduling, and safety compliance reports.', points: ['Fuel efficiency log indicators', 'Automated preventative alerts', 'Electronic logging device (ELD) status'] },
    { name: 'Warehouse Operations', desc: 'Organize warehouse storage spaces with modern bin-allocation controls, inventory picking sheets, barcode prints, and transfer updates.', points: ['Interactive warehouse storage grids', 'FIFO inventory tracking tools', 'Barcode scans for picking tasks'] },
    { name: '3PL Logistics', desc: 'Connect third-party freight carriers and shipper agents. Manage freight brokerage commissions, agent splits, and cross-docking workflows.', points: ['Carrier bidding and matching rules', 'Brokerage performance counters', 'Multi-tenant client invoicing portal'] }
  ];

  const features = [
    { title: 'Load Management', desc: 'Efficient dispatching, load status updates, rate calculations, and customer notifications in one place.', icon: '📦' },
    { title: 'Dispatch Planning', desc: 'Smart routing, calendars, drag-and-drop assign tools, and driver schedules.', icon: '📅' },
    { title: 'Driver App', desc: 'Offline support, turn-by-turn route navigation, status updates, and digital signature POD capture.', icon: '📱' },
    { title: 'GPS Tracking', desc: 'Live truck coordinates, breadcrumb path logs, custom geofences, and accurate ETA forecasting.', icon: '📍' },
    { title: 'Warehouse Management', desc: 'Inventory counts, pick/pack sheets, bin allocations, and barcode scanning.', icon: '🏢' },
    { title: 'Billing & Payroll', desc: 'Automated invoice runs, driver pay sheets, factoring exports, and ledger system integrations.', icon: '💵' },
    { title: 'Customer Portal', desc: 'Self-serve direct load booking, live tracking maps, and historical document archives.', icon: '👥' },
    { title: 'AI Automation', desc: 'Smart dispatch matching systems, document character recognition (OCR), and load rate forecasts.', icon: '🤖' }
  ];

  const screenshots = [
    { 
      name: 'Admin Dashboard', 
      title: 'Global Fleet Performance Control Room',
      desc: 'Get a 360-degree operational view of active loads, revenue runs, dispatch maps, and driver utilization stats.',
      preview: (
        <div className="bg-[#111827] h-full w-full rounded-lg p-4 font-mono text-[10px] text-slate-300 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-[#23324C] pb-2.5">
            <span className="font-extrabold text-white">HERO // ADMIN PANEL</span>
            <div className="flex gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5 my-3 text-center">
            <div className="bg-[#161F30] p-2 border border-[#23324C] rounded-lg">
              <span className="text-slate-500 block">ACTIVE LOADS</span>
              <span className="text-white text-sm font-bold">142</span>
            </div>
            <div className="bg-[#161F30] p-2 border border-[#23324C] rounded-lg">
              <span className="text-slate-500 block">TOTAL REVENUE</span>
              <span className="text-emerald-400 text-sm font-bold">$42,910</span>
            </div>
            <div className="bg-[#161F30] p-2 border border-[#23324C] rounded-lg">
              <span className="text-slate-500 block">DRIVERS ACTIVE</span>
              <span className="text-brand-400 text-sm font-bold">94%</span>
            </div>
          </div>
          <div className="bg-[#161F30] p-2.5 border border-[#23324C] rounded-lg h-24 overflow-hidden space-y-1.5">
            <div className="flex justify-between text-slate-400 border-b border-[#23324C] pb-1">
              <span>LOAD ID</span><span>STATUS</span><span>ETA</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>#LD-9410</span><span className="text-emerald-400">IN TRANSIT</span><span>10:45 AM</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>#LD-9411</span><span className="text-brand-400">DISPATCHED</span><span>11:30 AM</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>#LD-9412</span><span className="text-yellow-400">PENDING</span><span>02:15 PM</span>
            </div>
          </div>
        </div>
      )
    },
    { 
      name: 'Dispatch Dashboard', 
      title: 'Smart Dispatch Board',
      desc: 'Drag, drop, and match loads to drivers instantly based on weight, locations, and hours of service rules.',
      preview: (
        <div className="bg-[#111827] h-full w-full rounded-lg p-4 font-mono text-[10px] text-slate-300 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-[#23324C] pb-2">
            <span className="font-extrabold text-white">DISPATCH BOARD // HQ</span>
            <span className="text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded text-[8px]">ROUTING AUTO-ON</span>
          </div>
          <div className="flex gap-2.5 my-3 h-full">
            <div className="w-1/2 bg-[#161F30] p-2.5 border border-[#23324C] rounded-lg space-y-1.5">
              <span className="text-slate-500 font-bold block border-b border-[#23324C] pb-1">UNASSIGNED LOADS</span>
              <div className="bg-brand-500/10 p-1.5 rounded border border-brand-500/20 text-brand-400">LD-9402 [42k lbs]</div>
              <div className="bg-brand-500/10 p-1.5 rounded border border-brand-500/20 text-brand-400">LD-9403 [12k lbs]</div>
            </div>
            <div className="w-1/2 bg-[#161F30] p-2.5 border border-[#23324C] rounded-lg space-y-1.5">
              <span className="text-slate-500 font-bold block border-b border-[#23324C] pb-1">ACTIVE FLEET (CHICAGO)</span>
              <div className="bg-[#111827] p-1.5 rounded border border-[#23324C] text-slate-300">Driver: John D. [ELD: 2.5h]</div>
              <div className="bg-[#111827] p-1.5 rounded border border-[#23324C] text-slate-300">Driver: Sarah R. [ELD: 5.0h]</div>
            </div>
          </div>
        </div>
      )
    },
    { 
      name: 'Driver App', 
      title: 'Mobile App For Truck Drivers',
      desc: 'A robust mobile interface with offline scanning, route details, and customer signature upload.',
      preview: (
        <div className="bg-[#111827] h-full w-full rounded-lg p-4 font-mono text-[10px] text-slate-300 flex justify-center">
          <div className="w-48 bg-[#161F30] border-4 border-slate-700 rounded-2xl p-2.5 flex flex-col justify-between shadow-lg">
            <div className="text-center border-b border-[#23324C] pb-1 text-[8px]">
              <span className="text-emerald-400 font-extrabold">● LIVE CONNECTED</span>
            </div>
            <div className="my-2.5 space-y-1.5">
              <span className="text-slate-500 font-bold block text-[7px]">ACTIVE DELIVERY</span>
              <div className="bg-[#111827] p-2 rounded border border-[#23324C]">
                <h5 className="text-[8px] text-white font-extrabold">Chicago Auto Hub</h5>
                <p className="text-[7px] text-slate-400">Loads: 4 Car Carriers</p>
                <div className="mt-1.5 text-[6px] text-brand-400 flex items-center">📍 12 miles to destination</div>
              </div>
            </div>
            <button className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 rounded text-[8px] font-bold text-white text-center">
              SUBMIT POD SIGNATURE
            </button>
          </div>
        </div>
      )
    },
    { 
      name: 'Warehouse Panel', 
      title: 'Warehouse Stock Control',
      desc: 'Perform bin allocation inventories, scan incoming pallets, and organize barcode manifests.',
      preview: (
        <div className="bg-[#111827] h-full w-full rounded-lg p-4 font-mono text-[10px] text-slate-300 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-[#23324C] pb-2">
            <span className="font-extrabold text-white">WAREHOUSE // INVENTORY</span>
            <span className="text-slate-500">Bay 4 Depot</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 my-3 text-center">
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-1.5 rounded text-emerald-400">BIN A1 [98%]</div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-1.5 rounded text-emerald-400">BIN A2 [85%]</div>
            <div className="bg-red-500/10 border border-red-500/30 p-1.5 rounded text-red-400">BIN B1 [12%]</div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 p-1.5 rounded text-yellow-400">BIN B2 [60%]</div>
          </div>
          <div className="bg-[#161F30] p-2 border border-[#23324C] rounded-lg">
            <span className="text-slate-500 font-bold block mb-1">SCAN ACTIONS LOG</span>
            <div className="text-slate-400 text-[8px]">
              * [11:15 AM] Item #PLT-901 scanned into BIN A1<br />
              * [10:42 AM] Item #PLT-905 moved to Dock 2
            </div>
          </div>
        </div>
      )
    },
    { 
      name: 'Accounts Dashboard', 
      title: 'Automated Freight Accounts',
      desc: 'Verify driver payroll sheets, export factored invoices, and check revenue margins.',
      preview: (
        <div className="bg-[#111827] h-full w-full rounded-lg p-4 font-mono text-[10px] text-slate-300 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-[#23324C] pb-2">
            <span className="font-extrabold text-white">LEDGER // PAYROLL & BILLING</span>
            <span className="text-emerald-400 font-bold">REVENUE ON TRACK</span>
          </div>
          <div className="my-2.5 space-y-1.5 text-left">
            <div className="flex justify-between border-b border-[#23324C]/60 pb-1 text-[8px] text-slate-500">
              <span>PAYEE</span><span>LOAD BASIS</span><span>NET PAYOUT</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Driver: Donald S.</span><span>3 Deliveries</span><span>$1,420.00</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Driver: Jessica K.</span><span>4 Deliveries</span><span>$1,890.00</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Brokerage Split</span><span>Carrier Match</span><span>$2,310.00</span>
            </div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-lg flex items-center justify-between">
            <span className="text-[8px] text-emerald-400 font-bold">Quick Export: QUICKBOOKS / SAGE</span>
            <button className="bg-emerald-500 text-white font-extrabold text-[8px] px-2 py-0.5 rounded">EXPORT NOW</button>
          </div>
        </div>
      )
    },
    { 
      name: 'Customer Portal', 
      title: 'Shipper & Customer Portal',
      desc: 'Enable your shipper clients to check transit maps, view load histories, and download invoices directly.',
      preview: (
        <div className="bg-[#111827] h-full w-full rounded-lg p-4 font-mono text-[10px] text-slate-300 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-[#23324C] pb-2">
            <span className="font-extrabold text-white">CUSTOMER SHIPMENT HUB</span>
            <span className="text-slate-500">Client ID: global-retail</span>
          </div>
          <div className="my-2.5 bg-[#161F30] p-2.5 border border-[#23324C] rounded-lg">
            <span className="text-slate-500 block">ACTIVE FREIGHT TRANSIT MAP</span>
            <div className="h-14 bg-[#111827] border border-[#23324C] rounded my-1.5 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#23324c_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
              <span className="text-[8px] text-slate-400">Map Route Preview</span>
              <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-brand-500 rounded-full animate-ping"></div>
              <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-emerald-500 rounded-full"></div>
            </div>
            <div className="flex justify-between text-[8px] text-slate-400 mt-1">
              <span>Origin: Memphis TN</span><span>Dest: Dallas TX</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '$49',
      desc: 'Excellent configuration features for small operations and growing teams.',
      features: [
        'Up to 5 Fleet Trucks',
        'Standard Dispatch Board',
        'Mobile Driver App Access',
        'Live GPS path tracking',
        'Standard Email support'
      ]
    },
    {
      name: 'Professional',
      price: '$149',
      desc: 'The optimal choice for growing mid-sized operations and expanding fleets.',
      popular: true,
      features: [
        'Up to 25 Fleet Trucks',
        'Smart Dispatch Board',
        'Advanced Route Optimization',
        'Billing & Payroll Ledgers',
        '2FA Security & Audits',
        'Priority 24/7 Hotline support'
      ]
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      desc: 'Customized operating portals for large logistics networks and brokerage houses.',
      features: [
        'Unlimited Fleet Trucks',
        'Full Enterprise SaaS Suite',
        'Dedicated Custom Integrations',
        'Tenant API Controls',
        'SLA Contract Guarantees',
        'Dedicated Account Manager'
      ]
    }
  ];

  const faqs = [
    {
      q: 'How long does the setup onboarding wizard take?',
      a: 'The setup onboarding wizard takes less than 5 minutes. You can configure initial branches, fleet vehicles, team members, and shipper customers. If you are not ready, you can skip steps and configure them inside the main company admin dashboard later.'
    },
    {
      q: 'Can we import our existing customer databases?',
      a: 'Absolutely. Within the admin panel database tab, you can download CSV templates, copy over your drivers, locations, and customer lists, and upload them back to populate files instantly.'
    },
    {
      q: 'What happens after my free trial period ends?',
      a: 'Your trial company workspace stays intact, but active dispatch routing locks. You can easily upgrade by entering payment details inside the billing settings page to choose a suitable package.'
    },
    {
      q: 'Does it support offline logging for driver locations?',
      a: 'Yes. The driver mobile view stores coordinates and status updates locally if they enter cellular dead zones. Once connection restores, the data automatically synchronizes back to dispatch coordinates.'
    }
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({ name: '', company: '', email: '', phone: '', message: '' });
    }, 4000);
  };

  return (
    <div className="bg-[#0B0F19]">
      
      {/* ======================================================== */}
      {/* 1. HERO SECTION */}
      {/* ======================================================== */}
      <section id="home" className="relative pt-36 pb-20 md:pt-44 md:pb-28 overflow-hidden px-4">
        {/* Ambient Blur Graphics */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-brand-500/10 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute top-1/3 left-10 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Text area */}
          <div className="lg:col-span-6 space-y-6 text-left animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-500/10 border border-brand-500/25 text-brand-400 text-xs font-extrabold uppercase tracking-wide">
              <Sparkles className="h-4 w-4 text-brand-400" />
              SaaS Operational Portal
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
              Complete Logistics <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-brand-500 via-brand-400 to-indigo-400 bg-clip-text text-transparent">
                Operating System
              </span>
            </h1>
            
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl">
              Manage Loads, Dispatch, Drivers, Warehouses, Billing, Payroll and Customer Tracking from one powerful, modern platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button 
                onClick={() => setView('register')}
                className="px-8 py-4 bg-brand-500 hover:bg-brand-600 font-extrabold text-white rounded-xl shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 transition-all text-sm flex items-center justify-center gap-2 group cursor-pointer"
              >
                Start Free Trial
                <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a 
                href="#contact"
                className="px-8 py-4 bg-[#161F30] hover:bg-[#1f2a3f] font-semibold text-slate-300 hover:text-white rounded-xl border border-[#23324C] hover:border-brand-500/30 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="h-4.5 w-4.5 text-slate-400" />
                Book Live Demo
              </a>
            </div>

            <div className="flex items-center gap-6 pt-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4.5 w-4.5 text-brand-400" /> 14-Day Free Trial
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-4.5 w-4.5 text-yellow-400 fill-yellow-400" /> No Card Required
              </span>
            </div>
          </div>

          {/* Graphics Mockups area */}
          <div className="lg:col-span-6 relative flex items-center justify-center animate-fade-in animate-delay-200">
            {/* Primary Large Dashboard Mockup */}
            <div className="w-full max-w-[500px] h-[340px] bg-[#161F30]/80 backdrop-blur-md border border-[#23324C] rounded-2xl p-4 shadow-2xl relative overflow-hidden flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300">
              <div className="flex justify-between items-center border-b border-[#23324C]/60 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-brand-500 animate-pulse"></div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Logistics Dispatch Center</span>
                </div>
                <span className="text-[9px] text-slate-500">PORTAL LIVE // SECURE</span>
              </div>
              <div className="my-4 h-full flex flex-col justify-between">
                <div className="grid grid-cols-4 gap-2 text-center text-[8px] font-bold text-slate-400">
                  <div className="bg-[#0B0F19] p-2 rounded-lg border border-[#23324C]">Loads: <span className="text-white">42</span></div>
                  <div className="bg-[#0B0F19] p-2 rounded-lg border border-[#23324C]">Fleet: <span className="text-white">96%</span></div>
                  <div className="bg-[#0B0F19] p-2 rounded-lg border border-[#23324C]">Transit: <span className="text-brand-400">18</span></div>
                  <div className="bg-[#0B0F19] p-2 rounded-lg border border-[#23324C]">Issues: <span className="text-red-400">0</span></div>
                </div>
                <div className="bg-[#0B0F19] border border-[#23324C] rounded-lg p-2.5 h-32 flex flex-col justify-between">
                  <div className="flex justify-between text-[8px] text-slate-500 border-b border-[#23324C] pb-1">
                    <span>ROUTE ORIGIN / DESTINATION</span><span>SHIPPED</span><span>ETA STATUS</span>
                  </div>
                  <div className="flex justify-between text-[8px] text-slate-300">
                    <span>Houston TX ➔ Atlanta GA</span><span>1,200 lbs</span><span className="text-emerald-400">ON TIME</span>
                  </div>
                  <div className="flex justify-between text-[8px] text-slate-300">
                    <span>Chicago IL ➔ Dallas TX</span><span>42,000 lbs</span><span className="text-brand-400">TRANSIT</span>
                  </div>
                  <div className="flex justify-between text-[8px] text-slate-300">
                    <span>Seattle WA ➔ Portland OR</span><span>8,500 lbs</span><span className="text-emerald-400">DELIVERED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Overlapping Floating Driver App Panel */}
            <div className="absolute -bottom-6 -left-4 w-44 bg-[#161F30] border border-[#23324C]/80 rounded-2xl p-3 shadow-2xl flex flex-col justify-between hover:translate-y-[-5px] transition-transform duration-300 animate-float">
              <div className="text-[8px] text-slate-400 font-bold border-b border-[#23324C] pb-1 flex justify-between items-center">
                <span>DRIVER: DONALD S.</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </div>
              <div className="my-2 space-y-1">
                <span className="text-[7px] text-slate-500">ACTIVE TASK</span>
                <p className="text-[8px] text-white font-extrabold">Delivery: Dallas Terminal</p>
                <p className="text-[7px] text-slate-400">Load ID: #LD-9411</p>
              </div>
              <span className="block text-center py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-[8px] rounded-lg">
                SIGNED & UPLOADED POD
              </span>
            </div>

            {/* Overlapping Floating GPS Path Panel */}
            <div className="absolute -top-6 -right-4 w-48 bg-[#161F30] border border-[#23324C]/80 rounded-2xl p-3 shadow-2xl flex flex-col justify-between hover:translate-y-[-5px] transition-transform duration-300 animate-float animate-delay-300">
              <div className="text-[8px] text-slate-400 font-bold border-b border-[#23324C] pb-1 flex justify-between items-center">
                <span>📍 LIVE GPS ROUTE</span>
                <span className="text-[7px] text-brand-400">ETA 12 MIN</span>
              </div>
              <div className="h-16 bg-[#0B0F19] rounded-lg border border-[#23324C] my-2 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(#23324c_1px,transparent_1px)] [background-size:12px_12px] opacity-40"></div>
                <div className="w-10 h-0.5 bg-brand-500/50 absolute rotate-12"></div>
                <div className="w-1.5 h-1.5 bg-brand-500 rounded-full absolute top-1/3 left-1/3 animate-ping"></div>
                <div className="w-1.5 h-1.5 bg-brand-500 rounded-full absolute top-1/3 left-1/3"></div>
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full absolute bottom-1/3 right-1/4"></div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. TRUSTED BY SECTION */}
      {/* ======================================================== */}
      <section className="border-y border-[#23324C]/50 bg-[#0B0F19] py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-slate-400 font-bold text-xs uppercase tracking-widest text-center lg:text-left lg:max-w-xs">
            Trusted by leading dispatch and transit fleets nationwide
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 w-full lg:w-auto">
            <div className="text-center">
              <span className="block text-2xl sm:text-3xl font-black text-white">1,200+</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Active Companies</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl sm:text-3xl font-black text-white">15,000+</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Active Drivers</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl sm:text-3xl font-black text-white">5,000,000+</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Loads Dispatched</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl sm:text-3xl font-black text-white">4.9/5 ★</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Customer Ratings</span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. FEATURES SECTION */}
      {/* ======================================================== */}
      <section id="features" className="py-24 relative px-4">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Everything Needed to Run Modern Logistics
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              We replace individual, siloed apps with one integrated cloud-based portal. Scalable features designed for operational growth.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat) => (
              <div 
                key={feat.title} 
                className="p-6 bg-[#161F30]/70 border border-[#23324C] hover:border-brand-500/40 rounded-2xl hover:scale-[1.03] transition-all duration-300 text-left hover:shadow-xl hover:shadow-brand-500/5 group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. SOLUTIONS SECTION */}
      {/* ======================================================== */}
      <section id="solutions" className="py-24 bg-[#0B0F19] border-t border-[#23324C]/40 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Tailored Industry Solutions
            </h2>
            <p className="text-slate-400 text-sm">
              Hero Logistics adapts dynamically to support your specific shipping niche or pipeline operations.
            </p>
          </div>

          {/* Solutions Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {solutions.map((sol) => (
              <button
                key={sol.name}
                onClick={() => setActiveSolution(sol.name)}
                className={`px-5 py-2.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  activeSolution === sol.name
                    ? 'bg-brand-500 border-brand-400 text-white shadow-lg shadow-brand-500/20'
                    : 'bg-[#161F30] border-[#23324C] text-slate-400 hover:text-white'
                }`}
              >
                {sol.name}
              </button>
            ))}
          </div>

          {/* Solution Body */}
          <div className="glass rounded-2xl p-6 sm:p-10 max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center text-left border border-[#23324C]/80 animate-fade-in">
            <div className="md:w-3/5 space-y-5">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-brand-500 rounded-full"></span>
                {activeSolution} Suite
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {solutions.find(s => s.name === activeSolution)?.desc}
              </p>
              <ul className="space-y-2.5 pt-2">
                {solutions.find(s => s.name === activeSolution)?.points.map((pt, i) => (
                  <li key={i} className="flex items-center text-xs text-slate-300 font-semibold">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 mr-2.5 flex-shrink-0" />
                    {pt}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => setView('register')}
                className="inline-flex items-center text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors pt-2 group cursor-pointer"
              >
                Get started with {activeSolution} <ArrowRight className="h-4 w-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
            <div className="md:w-2/5 w-full flex items-center justify-center p-6 bg-[#0B0F19]/60 border border-[#23324C] rounded-xl h-60 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#23324c_1px,transparent_1px)] [background-size:16px_16px] opacity-25"></div>
              <div className="text-center space-y-3 z-10 animate-fade-in-up">
                <Navigation className="h-10 w-10 text-brand-500 mx-auto animate-bounce" />
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interactive Fleet Map</span>
                <span className="block text-[8px] px-2 py-1 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-md">Live GPS Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. SCREENSHOTS GALLERY */}
      {/* ======================================================== */}
      <section className="py-24 bg-[#0B0F19] border-t border-[#23324C]/40 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Explore Our Interfaces
            </h2>
            <p className="text-slate-400 text-sm">
              See the exact control panels built for each department in your organization.
            </p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-8 max-w-3xl mx-auto">
            {screenshots.map((screen) => (
              <button
                key={screen.name}
                onClick={() => setActiveScreenshot(screen.name)}
                className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  activeScreenshot === screen.name
                    ? 'bg-brand-500/10 border-brand-500/40 text-brand-400'
                    : 'bg-[#161F30] border-[#23324C] text-slate-400 hover:text-white'
                }`}
              >
                {screen.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Screenshot active display */}
          <div className="max-w-4xl mx-auto bg-[#161F30]/40 border border-[#23324C] rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-center gap-8 shadow-2xl relative">
            <div className="lg:w-1/3 text-left space-y-4">
              <span className="text-[10px] font-bold tracking-widest text-brand-400 uppercase">Operational View</span>
              <h3 className="text-xl font-bold text-white">{screenshots.find(s => s.name === activeScreenshot)?.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{screenshots.find(s => s.name === activeScreenshot)?.desc}</p>
              <button 
                onClick={() => setView('register')}
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg text-xs font-bold text-white transition-all cursor-pointer"
              >
                Try Interface
              </button>
            </div>
            
            <div className="lg:w-2/3 w-full bg-[#0B0F19] border border-[#23324C] rounded-xl h-64 p-3 overflow-hidden shadow-inner flex items-center justify-center">
              {screenshots.find(s => s.name === activeScreenshot)?.preview}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. PRICING SECTION */}
      {/* ======================================================== */}
      <section id="pricing" className="py-24 bg-[#0B0F19] border-t border-[#23324C]/40 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Transparent, Scalable Pricing
            </h2>
            <p className="text-slate-400 text-sm">
              All plans include access to standard driver mobile views. Choose a tier based on fleet size.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {pricingPlans.map((plan) => (
              <div 
                key={plan.name} 
                className={`p-8 bg-[#161F30]/80 border rounded-2xl flex flex-col justify-between text-left relative ${
                  plan.popular 
                    ? 'border-brand-500 shadow-xl shadow-brand-500/5 scale-[1.02] md:scale-[1.04] z-10' 
                    : 'border-[#23324C]'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand-500 border border-brand-400 rounded-full text-[10px] font-black text-white uppercase tracking-wider">
                    Most Popular
                  </span>
                )}
                
                <div>
                  <h4 className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-1.5">{plan.name}</h4>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">{plan.price}</span>
                    {plan.price !== 'Custom' && <span className="text-slate-500 text-xs">/month</span>}
                  </div>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 border-b border-[#23324C]/60 pb-5">
                    {plan.desc}
                  </p>
                  
                  <ul className="space-y-3.5 mb-8 text-xs text-slate-300 font-medium">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-center">
                        <Check className="h-4.5 w-4.5 text-brand-500 mr-2 flex-shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={() => setView(plan.name === 'Enterprise' ? 'login' : 'register')}
                  className={`w-full py-3 px-4 font-bold text-sm rounded-xl transition-all cursor-pointer ${
                    plan.popular
                      ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/25'
                      : 'bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-white border border-[#23324C]'
                  }`}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Trial'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. INTEGRATIONS SECTION */}
      {/* ======================================================== */}
      <section id="integrations" className="py-20 bg-[#0B0F19] border-t border-[#23324C]/40 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
            Supported Integrations
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-10">
            We sync automatically with leading routing, SMS alert alerts, payments, and mapping APIs.
          </p>

          <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
            {['Google Maps', 'Stripe Payments', 'Razorpay Sync', 'WhatsApp API', 'Twilio SMS Gateway', 'Telematics Providers'].map((int) => (
              <div key={int} className="px-6 py-4 bg-[#161F30]/60 border border-[#23324C] hover:border-brand-500/35 rounded-xl text-slate-300 font-bold text-xs hover:scale-105 transition-all shadow-md">
                {int}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. TESTIMONIALS SECTION */}
      {/* ======================================================== */}
      <section className="py-24 bg-[#0B0F19] border-t border-[#23324C]/40 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white text-center mb-16">
            Tested & Trusted in Action
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="p-6 bg-[#161F30]/40 border border-[#23324C]/80 rounded-2xl text-left space-y-4">
              <p className="text-slate-400 text-xs sm:text-sm italic leading-relaxed">
                "Hero Logistics doubled our dispatch efficiency in 2 months. We went from handling 12 shipments to 30+ daily without adding office staff."
              </p>
              <div className="flex items-center gap-3 border-t border-[#23324C]/60 pt-4">
                <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xs">RK</div>
                <div>
                  <h4 className="text-white text-xs font-bold">Rajesh K.</h4>
                  <span className="text-[10px] text-slate-500">CEO, Falcon Logistics</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#161F30]/40 border border-[#23324C]/80 rounded-2xl text-left space-y-4">
              <p className="text-slate-400 text-xs sm:text-sm italic leading-relaxed">
                "The driver app is so simple that our older operators picked it up instantly. Electronic POD signatures sync immediately to back-office accounting."
              </p>
              <div className="flex items-center gap-3 border-t border-[#23324C]/60 pt-4">
                <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xs">SM</div>
                <div>
                  <h4 className="text-white text-xs font-bold">Sarah M.</h4>
                  <span className="text-[10px] text-slate-500">Dispatch Director, SwiftTrans</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#161F30]/40 border border-[#23324C]/80 rounded-2xl text-left space-y-4">
              <p className="text-slate-400 text-xs sm:text-sm italic leading-relaxed">
                "Accounts dashboards saved us 10+ hours a week in invoice calculations. Driver payroll audits are now finished with a single click."
              </p>
              <div className="flex items-center gap-3 border-t border-[#23324C]/60 pt-4">
                <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xs">AS</div>
                <div>
                  <h4 className="text-white text-xs font-bold">Amit S.</h4>
                  <span className="text-[10px] text-slate-500">CFO, RedExpress 3PL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. FAQ SECTION */}
      {/* ======================================================== */}
      <section id="faq" className="py-24 bg-[#0B0F19] border-t border-[#23324C]/40 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-3 text-left">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="bg-[#161F30]/40 border border-[#23324C] rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-5 py-4 flex items-center justify-between text-slate-200 hover:text-white font-bold text-sm cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-brand-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <div className={`transition-all overflow-hidden duration-300 ${
                  openFaq === i ? 'max-h-40 border-t border-[#23324C]/60 p-5' : 'max-h-0'
                }`}>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 10. CONTACT & LEAD GEN SECTION */}
      {/* ======================================================== */}
      <section id="contact" className="py-24 bg-[#0B0F19] border-t border-[#23324C]/40 px-4 relative">
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-brand-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
          
          <div className="lg:col-span-5 text-left space-y-5 flex flex-col justify-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Get in Touch with Us
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Talk to our logistics experts or book a personalized screen demonstration to see how our dispatch boards solve your fleet delays.
            </p>

            <div className="space-y-4 pt-4 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-brand-500/10 border border-brand-500/25 rounded-lg text-brand-400">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <span>sales@herologistics.com</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-brand-500/10 border border-brand-500/25 rounded-lg text-brand-400">
                  <Phone className="h-4.5 w-4.5" />
                </span>
                <span>+1 (800) 555-0199</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="glass rounded-2xl p-6 sm:p-8 shadow-xl text-left border border-[#23324C]">
              {formSubmitted ? (
                <div className="py-12 text-center animate-fade-in">
                  <CheckCircle2 className="h-14 w-14 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Inquiry Submitted Successfully!</h3>
                  <p className="text-slate-400 text-xs max-w-sm mx-auto">
                    Thank you. A logistics product specialist will reach out to schedule your live demo.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Full Name</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><User className="h-4 w-4" /></span>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="e.g. John Doe"
                          className="block w-full pl-9 pr-3 py-2.5 bg-[#111827]/80 border border-[#23324C] focus:border-brand-500 rounded-xl text-slate-200 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Company Name</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><Building className="h-4 w-4" /></span>
                        <input
                          type="text"
                          required
                          value={formData.company}
                          onChange={(e) => setFormData({...formData, company: e.target.value})}
                          placeholder="e.g. Apex Cargo"
                          className="block w-full pl-9 pr-3 py-2.5 bg-[#111827]/80 border border-[#23324C] focus:border-brand-500 rounded-xl text-slate-200 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Email Address</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><Mail className="h-4 w-4" /></span>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="e.g. john@apexcargo.com"
                          className="block w-full pl-9 pr-3 py-2.5 bg-[#111827]/80 border border-[#23324C] focus:border-brand-500 rounded-xl text-slate-200 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Phone Number</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><Phone className="h-4 w-4" /></span>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="e.g. +1 (555) 0199"
                          className="block w-full pl-9 pr-3 py-2.5 bg-[#111827]/80 border border-[#23324C] focus:border-brand-500 rounded-xl text-slate-200 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Message / Requirements</label>
                    <div className="relative">
                      <span className="absolute top-3.5 left-3 text-slate-500"><MessageSquare className="h-4 w-4" /></span>
                      <textarea
                        required
                        rows="3"
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        placeholder="Tell us about your fleet size, dispatcher count, and goals..."
                        className="block w-full pl-9 pr-3 py-2.5 bg-[#111827]/80 border border-[#23324C] focus:border-brand-500 rounded-xl text-slate-200 text-xs focus:outline-none"
                      ></textarea>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-extrabold rounded-xl shadow-lg shadow-brand-500/20 hover:shadow-brand-500/35 transition-all text-xs cursor-pointer flex-1 text-center"
                    >
                      Send Inquiry
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormSubmitted(true)}
                      className="px-6 py-3 bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-white border border-[#23324C] rounded-xl transition-all text-xs cursor-pointer flex-1 text-center"
                    >
                      Book Live Demo
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
