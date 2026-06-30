import React from 'react';
import {
  Package, Truck, DollarSign, Globe, Users, Box, Zap, Activity,
  Plus, SlidersHorizontal, Search, FileText, AlertCircle, CheckCircle2, UserCheck,
  Truck as TruckIcon, MapPin, Trash2, ChevronLeft, Camera, Upload, Clock,
  Wrench, Shield, Droplet, List, Grid, X, UserPlus, Clipboard, Star, Edit, Building, Store, ShieldAlert,
  Power, Settings, User, RotateCcw, RefreshCw, Check,
  TrendingUp, TrendingDown, CreditCard, BarChart2, PieChart, ArrowUpRight, ArrowDownRight,
  Download, Eye, Lock, Unlock, MoreVertical, Mail, Phone, Calendar,
  Key, Save, ChevronRight, ChevronDown as ChevronDownIcon, Bell
} from 'lucide-react';


const CommandCenterDashboard = ({ setActiveTab }) => {
  // Year specific data state
  const [loadYear, setLoadYear] = React.useState('2026');
  const [financeYear, setFinanceYear] = React.useState('2026');

  // Hover states for tooltips
  const [hoveredLoadIdx, setHoveredLoadIdx] = React.useState(null);
  const [hoveredFinanceIdx, setHoveredFinanceIdx] = React.useState(null);

  // Chart Data
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  const loadThroughputData = {
    '2026': [30, 45, 40, 52, 48, 55, 60, 65, 75, 85, 95, 100],
    '2025': [25, 30, 35, 45, 42, 50, 48, 58, 62, 70, 78, 85]
  };

  const financialPerformanceData = {
    '2026': [40, 50, 45, 60, 55, 70, 75, 80, 85, 90, 95, 100],
    '2025': [35, 40, 38, 48, 46, 52, 58, 62, 68, 72, 80, 88]
  };

  const currentLoadData = loadThroughputData[loadYear];
  const currentFinanceData = financialPerformanceData[financeYear];

  // Helper to format financial tooltip values
  const formatFinanceVal = (val, isMax) => {
    if (isMax) return "$1.2M";
    return `$${val * 10}k`;
  };

  // CSV Export Handler
  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Metric,Value,Change\n"
      + "Loads (Monthly MTD),12482,+14%\n"
      + "Active Vehicles,415,+2%\n"
      + "Revenue (Monthly Gross),$1.2M,+4.5%\n"
      + "Branches,12,+1\n"
      + "Drivers,580,98%\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Command_Center_KPIs_${loadYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-2 sm:p-4">
      {/* Page Title & Action */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Command Center</h1>
          <p className="text-gray-500 mt-1">Operational HQ</p>
        </div>
        <button
          onClick={handleExport}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm cursor-pointer"
        >
          Export Data
        </button>
      </div>

      {/* KPI Cards (5 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div
          onClick={() => setActiveTab && setActiveTab('loads')}
          className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-blue-500 rounded-xl"><Box size={20} /></div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">+14%</span>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Loads <span className="text-[10px] ml-1">MONTHLY MTD</span></div>
              <div className="text-3xl font-extrabold text-gray-900">12,482</div>
            </div>
          </div>
        </div>
        <div
          onClick={() => setActiveTab && setActiveTab('vehicles')}
          className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-50 text-green-500 rounded-xl"><Truck size={20} /></div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+2%</span>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Vehicles <span className="text-[10px] ml-1">ACTIVE FLEET</span></div>
              <div className="text-3xl font-extrabold text-gray-900">415</div>
            </div>
          </div>
        </div>
        <div
          onClick={() => setActiveTab && setActiveTab('finance')}
          className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-indigo-50 text-indigo-500 rounded-xl"><DollarSign size={20} /></div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">+4.5%</span>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Revenue <span className="text-[10px] ml-1">MONTHLY GROSS</span></div>
              <div className="text-3xl font-extrabold text-gray-900">$1.2M</div>
            </div>
          </div>
        </div>
        <div
          onClick={() => setActiveTab && setActiveTab('branches')}
          className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-50 text-orange-500 rounded-xl"><Globe size={20} /></div>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">+1</span>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Branches <span className="text-[10px] ml-1">TOTAL DEPOTS</span></div>
              <div className="text-3xl font-extrabold text-gray-900">12</div>
            </div>
          </div>
        </div>
        <div
          onClick={() => setActiveTab && setActiveTab('drivers')}
          className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-50 text-purple-500 rounded-xl"><Users size={20} /></div>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">98%</span>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Drivers <span className="text-[10px] ml-1">ACTIVE ROSTER</span></div>
              <div className="text-3xl font-extrabold text-gray-900">580</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 hover:shadow-sm transition-shadow duration-300">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase">Load Throughput</h3>
              <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Monthly Analytics (Volume)</p>
            </div>
            <select
              value={loadYear}
              onChange={(e) => setLoadYear(e.target.value)}
              className="bg-white border border-gray-200 text-gray-700 py-1.5 px-3 rounded-lg text-sm focus:outline-none cursor-pointer"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
          <div className="h-48 flex items-end justify-between gap-2">
            {currentLoadData.map((val, i) => {
              const isHovered = hoveredLoadIdx === i;
              const showTooltip = isHovered;

              return (
                <div
                  key={i}
                  className="h-full w-full flex flex-col justify-end items-center group relative"
                  onMouseEnter={() => setHoveredLoadIdx(i)}
                  onMouseLeave={() => setHoveredLoadIdx(null)}
                >
                  <div className="w-full h-[80%] flex items-end relative">
                    {showTooltip && (
                      <div
                        className="absolute text-[10px] font-bold py-0.5 px-1.5 rounded z-10 shadow-md border border-gray-800 whitespace-nowrap pointer-events-none"
                        style={{
                          color: '#ffffff',
                          backgroundColor: '#111827',
                          bottom: `calc(${val}% + 6px)`,
                          left: '50%',
                          transform: 'translateX(-50%)'
                        }}
                      >
                        {val}k
                      </div>
                    )}
                    <div
                      className="w-full bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-t-md transition-all duration-300 hover:brightness-110 shadow-xs cursor-pointer"
                      style={{ height: `${val}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 mt-2">{months[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 hover:shadow-sm transition-shadow duration-300">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase">Financial Performance</h3>
              <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Monthly Revenue Flow ($USD)</p>
            </div>
            <select
              value={financeYear}
              onChange={(e) => setFinanceYear(e.target.value)}
              className="bg-white border border-gray-200 text-gray-700 py-1.5 px-3 rounded-lg text-sm focus:outline-none cursor-pointer"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
          <div className="h-48 flex items-end justify-between gap-2">
            {currentFinanceData.map((val, i) => {
              const isHovered = hoveredFinanceIdx === i;
              const showTooltip = isHovered;

              return (
                <div
                  key={i}
                  className="h-full w-full flex flex-col justify-end items-center group relative"
                  onMouseEnter={() => setHoveredFinanceIdx(i)}
                  onMouseLeave={() => setHoveredFinanceIdx(null)}
                >
                  <div className="w-full h-[80%] flex items-end relative">
                    {showTooltip && (
                      <div
                        className="absolute text-[10px] font-bold py-0.5 px-1.5 rounded z-10 shadow-md border border-gray-800 whitespace-nowrap pointer-events-none"
                        style={{
                          color: '#ffffff',
                          backgroundColor: '#111827',
                          bottom: `calc(${val}% + 6px)`,
                          left: '50%',
                          transform: 'translateX(-50%)'
                        }}
                      >
                        {formatFinanceVal(val, i === 11 && financeYear === '2026')}
                      </div>
                    )}
                    <div
                      className="w-full bg-gradient-to-t from-emerald-500 to-teal-300 rounded-t-md transition-all duration-300 hover:brightness-110 shadow-xs cursor-pointer"
                      style={{ height: `${val}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 mt-2">{months[i]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-10">

        <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-yellow-200 flex flex-col">
          <div className="flex items-center gap-2 text-yellow-500 mb-6">
            <Zap size={18} fill="currentColor" />
            <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase">Quick Control</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6 flex-1">
            <button
              onClick={() => setActiveTab && setActiveTab('loads')}
              className="flex flex-col items-start p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer w-full text-left"
            >
              <div className="p-2 bg-blue-50 text-blue-500 rounded-lg mb-3"><Box size={18} /></div>
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Loads</span>
            </button>
            <button
              onClick={() => setActiveTab && setActiveTab('vehicles')}
              className="flex flex-col items-start p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer w-full text-left"
            >
              <div className="p-2 bg-green-50 text-green-500 rounded-lg mb-3"><Truck size={18} /></div>
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Fleet<br />Control</span>
            </button>
            <button
              onClick={() => setActiveTab && setActiveTab('drivers')}
              className="flex flex-col items-start p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer w-full text-left"
            >
              <div className="p-2 bg-purple-50 text-purple-500 rounded-lg mb-3"><Users size={18} /></div>
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Staff Roster</span>
            </button>
            <button
              onClick={() => setActiveTab && setActiveTab('branches')}
              className="flex flex-col items-start p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer w-full text-left"
            >
              <div className="p-2 bg-orange-50 text-orange-500 rounded-lg mb-3"><Globe size={18} /></div>
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Network</span>
            </button>
          </div>
          <div className="text-center">
            <button
              onClick={() => setActiveTab && setActiveTab('delivery-issues')}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            >
              View Full Audit Terminal &gt;
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase">Network Distribution</h3>
            <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 py-1 px-2 rounded uppercase">Daily Mix</span>
          </div>
          <div className="h-4 w-full flex rounded-full overflow-hidden mb-10">
            <div className="bg-blue-500 h-full w-[55%]"></div>
            <div className="bg-emerald-400 h-full w-[30%]"></div>
            <div className="bg-yellow-400 h-full w-[15%]"></div>
          </div>
          <div className="grid grid-cols-2 gap-y-8 gap-x-4">
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Standard</div>
              <div className="text-2xl font-bold text-gray-900">55%</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Express</div>
              <div className="text-2xl font-bold text-gray-900">30%</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Premium</div>
              <div className="text-2xl font-bold text-gray-900">15%</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-blue-300 mb-8">
            <Activity size={16} />
            <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase">Activity Monitor</h3>
          </div>

          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-1 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gray-100">
            <div className="relative flex items-start gap-4">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-300 border-2 border-white relative z-10"></div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase">Delivery Completed</h4>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">12M Ago &bull; Operator Jack Taylor</p>
              </div>
            </div>
            <div className="relative flex items-start gap-4">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-300 border-2 border-white relative z-10"></div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase">Route Optimized</h4>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">1H Ago &bull; Operator Sarah Mitchell</p>
              </div>
            </div>
            <div className="relative flex items-start gap-4">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-300 border-2 border-white relative z-10"></div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase">Handover Initiated</h4>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">2H Ago &bull; Operator Liam Smith</p>
              </div>
            </div>
            <div className="relative flex items-start gap-4">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-300 border-2 border-white relative z-10"></div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase">Cross-Dock Sorting</h4>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">5H Ago &bull; Operator Maria Garcia</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- LOADS DASHBOARD VIEW ---
const LoadsDashboardView = () => {
  const [view, setView] = React.useState('list'); // 'list' | 'create'
  const [selectedQueue, setSelectedQueue] = React.useState('Review');
  const [search, setSearch] = React.useState('');
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [selectedLoad, setSelectedLoad] = React.useState(null);
  const [createForm, setCreateForm] = React.useState({
    origin: '',
    destination: '',
    priority: 'MEDIUM',
    cargo: '',
    weight: '',
    driver: '',
    notes: ''
  });

  // All loads state - starts with sample data matching Vercel
  const [allLoads, setAllLoads] = React.useState([
    { id: 'SHP-3021', ref: 'COKE-1102 · SN: STK-9902', route: ['Melbourne Depot', 'Adelaide Branch'], priority: 'MEDIUM', load: '4.5t', operator: 'Draft Status', status: 'Draft', cargo: 'Beverages', notes: 'Awaiting driver assignment' },
    { id: 'SHP-9055', ref: 'COKE-9901 · SN: STK-4401', route: ['Sydney Depot', 'Canberra Branch'], priority: 'HIGH', load: '6.2t', operator: 'Awaiting Assignment', status: 'Review', cargo: 'General Freight', notes: 'Pending admin approval' },
    { id: 'SHP-2201', ref: 'PEPSI-8821 · SN: STK-3302', route: ['Darwin Hub', 'Alice Springs Depot'], priority: 'HIGH', load: '9.1t', operator: 'Admin Review', status: 'Review', cargo: 'Electronics', notes: 'Compliance check in progress' },
    { id: 'SHP-1290', ref: 'PEPSI-4402 · SN: STK-8812', route: ['Brisbane Depot', 'Sydney Depot'], priority: 'LOW', load: '8.0t', operator: 'Ready for Dispatch', status: 'Ready', cargo: 'Dry Goods', notes: 'Validated, awaiting pickup' },
    { id: 'SHP-7710', ref: 'NESTLE-5500 · SN: STK-1100', route: ['Perth Depot', 'Kalgoorlie Branch'], priority: 'MEDIUM', load: '11.3t', operator: 'Ready for Dispatch', status: 'Ready', cargo: 'FMCG', notes: 'All docs cleared' },
    { id: 'SHP-4402', ref: 'FANTA-9931 · SN: STK-2211', route: ['Perth Depot', 'Fremantle Branch'], priority: 'HIGH', load: '12.4t', operator: 'James Carter', status: 'Assigned', cargo: 'Automotive Parts', notes: 'Driver confirmed, truck B-229' },
    { id: 'SHP-6621', ref: 'SPRITE-4410 · SN: STK-9940', route: ['Adelaide Hub', 'Mount Gambier Depot'], priority: 'MEDIUM', load: '7.8t', operator: 'Sarah Mitchell', status: 'Assigned', cargo: 'Chemicals', notes: 'Vehicle TRK-441 assigned' },
    { id: 'SHP-8821', ref: 'SPRITE-5501 · SN: STK-7711', route: ['Hobart Depot', 'Launceston Branch'], priority: 'HIGH', load: '5.1t', operator: 'Mike Johnson', status: 'Active', cargo: 'Refrigerated Goods', notes: 'ETA 14:30 today' },
  ]);

  const queues = ['Draft', 'Review', 'Ready', 'Assigned', 'Active'];

  const queueCounts = React.useMemo(() => {
    const counts = {};
    queues.forEach(q => { counts[q] = allLoads.filter(l => l.status === q).length; });
    return counts;
  }, [allLoads]);

  const activeQueueItems = allLoads.filter(l => l.status === selectedQueue);

  const filteredItems = activeQueueItems.filter(item =>
    item.id.toLowerCase().includes(search.toLowerCase()) ||
    item.ref.toLowerCase().includes(search.toLowerCase()) ||
    item.route[0].toLowerCase().includes(search.toLowerCase()) ||
    item.route[1].toLowerCase().includes(search.toLowerCase()) ||
    item.cargo.toLowerCase().includes(search.toLowerCase()) ||
    item.operator.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateLoad = (e) => {
    e.preventDefault();
    if (!createForm.origin || !createForm.destination || !createForm.cargo) return;
    const newLoad = {
      id: `SHP-${Math.floor(1000 + Math.random() * 9000)}`,
      ref: `LOAD-${Math.floor(1000 + Math.random() * 9000)} · SN: STK-${Math.floor(1000 + Math.random() * 9000)}`,
      route: [createForm.origin, createForm.destination],
      priority: createForm.priority,
      load: '0.0t',
      operator: createForm.driver || 'Unassigned',
      status: 'Draft',
      cargo: createForm.cargo,
      notes: createForm.notes || 'New load created'
    };
    setAllLoads(prev => [newLoad, ...prev]);
    setCreateForm({ origin: '', destination: '', priority: 'MEDIUM', cargo: '', weight: '', driver: '', notes: '' });
    setShowCreateModal(false);
    setSelectedQueue('Draft');
  };

  const promoteStatus = (loadId) => {
    setAllLoads(prev => prev.map(l => {
      if (l.id !== loadId) return l;
      const next = { Draft: 'Review', Review: 'Ready', Ready: 'Assigned', Assigned: 'Active', Active: 'Active' };
      return { ...l, status: next[l.status] || l.status };
    }));
  };

  const deleteLoad = (loadId) => {
    setAllLoads(prev => prev.filter(l => l.id !== loadId));
    setShowDetailsModal(false);
  };

  const queueConfig = {
    Draft:    { icon: FileText,     color: 'text-gray-500',   bg: 'bg-gray-50',   activeColor: 'text-yellow-600', activeBg: 'bg-yellow-50',   desc: 'Internal or driver created' },
    Review:   { icon: AlertCircle,  color: 'text-gray-400',   bg: 'bg-gray-50',   activeColor: 'text-amber-500',  activeBg: 'bg-amber-50',    desc: 'Awaiting admin finalisation' },
    Ready:    { icon: CheckCircle2, color: 'text-gray-400',   bg: 'bg-gray-50',   activeColor: 'text-blue-500',   activeBg: 'bg-blue-50',     desc: 'Validated & ready for dispatch' },
    Assigned: { icon: UserCheck,    color: 'text-gray-400',   bg: 'bg-gray-50',   activeColor: 'text-indigo-500', activeBg: 'bg-indigo-50',   desc: 'Driver & asset linked' },
    Active:   { icon: Zap,          color: 'text-gray-400',   bg: 'bg-gray-50',   activeColor: 'text-emerald-500',activeBg: 'bg-emerald-50',  desc: 'Currently in transit' },
  };

  const nextStatusLabel = { Draft: 'Send for Review', Review: 'Approve', Ready: 'Assign Driver', Assigned: 'Start Transit', Active: null };

  // If in create view, show the full Create Load Console
  if (view === 'create') {
    return (
      <CreateLoadConsole
        onBack={() => setView('list')}
        onSave={(loadData) => {
          const newLoad = {
            id: `SHP-${Math.floor(1000 + Math.random() * 9000)}`,
            ref: loadData.specs?.customerRef 
              ? `${loadData.specs.customerRef.toUpperCase()} · SN: STK-${Math.floor(1000 + Math.random() * 9000)}` 
              : `LOAD-${Math.floor(1000 + Math.random() * 9000)} · SN: STK-${Math.floor(1000 + Math.random() * 9000)}`,
            route: [loadData.stops[0]?.address || 'Origin Depot', loadData.stops[loadData.stops.length - 1]?.address || 'Destination Depot'],
            priority: loadData.specs?.priority === 'URGENT' ? 'HIGH' : loadData.specs?.priority === 'EXPRESS' ? 'MEDIUM' : 'LOW',
            load: `${loadData.items?.reduce((acc, i) => acc + Number(i.weight || 0), 0)}kg`,
            operator: loadData.stops[0]?.contact || 'Unassigned Dispatcher',
            status: loadData.status || 'Draft',
            cargo: loadData.items?.map(i => i.description || i.nicheType).join(', ') || 'General',
            notes: loadData.specs?.notes || ''
          };
          setAllLoads(prev => [newLoad, ...prev]);
          setSelectedQueue(loadData.status === 'Active' ? 'Active' : 'Draft');
        }}
      />
    );
  }

  return (
    <div className="p-2 sm:p-6 text-left">

      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gray-100 rounded-xl text-gray-800"><Box size={24} /></div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Load Queue</h1>
            <p className="text-gray-500 text-sm mt-0.5">Consolidated enterprise logistics management system</p>
          </div>
        </div>
        <button
          onClick={() => setView('create')}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-extrabold py-2.5 px-5 rounded-xl transition-colors flex items-center gap-2 text-sm cursor-pointer"
        >
          <Plus size={16} strokeWidth={2.5} />
          Create Load
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {queues.slice(0, 4).map(q => {
          const cfg = queueConfig[q];
          const Icon = cfg.icon;
          const isActive = selectedQueue === q;
          return (
            <div
              key={q}
              onClick={() => setSelectedQueue(q)}
              className={`bg-white p-5 rounded-2xl border cursor-pointer transition-all duration-200 text-left flex flex-col justify-between h-36 ${
                isActive ? 'border-2 border-yellow-400 shadow-md' : 'border-gray-100 hover:shadow-sm hover:border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className={`p-2.5 rounded-xl ${isActive ? `${cfg.activeColor} ${cfg.activeBg}` : `${cfg.color} ${cfg.bg}`}`}>
                  <Icon size={20} />
                </div>
                <span className="text-3xl font-black text-gray-900">{queueCounts[q]}</span>
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-gray-900">{q}</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">{cfg.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active card - separate row to match screenshot */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 -mt-4">
        {(() => {
          const q = 'Active';
          const cfg = queueConfig[q];
          const Icon = cfg.icon;
          const isActive = selectedQueue === q;
          return (
            <div
              onClick={() => setSelectedQueue(q)}
              className={`bg-white p-5 rounded-2xl border cursor-pointer transition-all duration-200 text-left flex flex-col justify-between h-36 ${
                isActive ? 'border-2 border-yellow-400 shadow-md' : 'border-gray-100 hover:shadow-sm hover:border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className={`p-2.5 rounded-xl ${isActive ? `${cfg.activeColor} ${cfg.activeBg}` : `${cfg.color} ${cfg.bg}`}`}>
                  <Icon size={20} />
                </div>
                <span className="text-3xl font-black text-gray-900">{queueCounts[q]}</span>
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-gray-900">{q}</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">{cfg.desc}</p>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {/* Table Header / Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">{selectedQueue} Queue</h3>
            <p className="text-xs text-gray-400 mt-0.5">{filteredItems.length} Load{filteredItems.length !== 1 ? 's' : ''} identified</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                placeholder="Search Reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs w-full focus:outline-none focus:ring-1 focus:ring-yellow-400"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
              <SlidersHorizontal size={14} className="opacity-70" />
              Parameters
            </button>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Box size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold">No loads in {selectedQueue} queue</p>
            <p className="text-xs mt-1">Create a new load or check other queues</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 pl-3 w-10"><input type="checkbox" className="rounded border-gray-300" /></th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Routing</th>
                  <th className="py-3 px-4 text-center">Priority</th>
                  <th className="py-3 px-4 text-center">Load</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="text-xs hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 pl-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#0b0f19] rounded-lg text-yellow-400 flex-shrink-0">
                          <TruckIcon size={15} />
                        </div>
                        <div>
                          <strong className="text-sm font-extrabold text-gray-900 block">{item.id}</strong>
                          <span className="text-[10px] text-gray-400 font-medium block mt-0.5">{item.ref}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-gray-800 text-xs">
                        <span>{item.route[0]}</span>
                        <span className="text-gray-300">›</span>
                        <span>{item.route[1]}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded tracking-wider border ${
                        item.priority === 'HIGH'
                          ? 'bg-black text-yellow-400 border-yellow-500'
                          : item.priority === 'MEDIUM'
                            ? 'bg-white text-gray-600 border-gray-300'
                            : 'bg-white text-green-600 border-green-300'
                      }`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-extrabold text-gray-900">{item.load}</td>
                    <td className="py-4 px-4 text-gray-500 font-medium">{item.operator}</td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => { setSelectedLoad(item); setShowDetailsModal(true); }}
                        className="px-3 py-1.5 border border-gray-200 hover:bg-gray-100 rounded-lg text-[11px] font-bold text-gray-800 transition-colors cursor-pointer"
                      >
                        DETAILS
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== CREATE LOAD MODAL ===== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">Create New Load</h2>
                <p className="text-xs text-gray-400 mt-0.5">New loads start in the Draft queue</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-700 text-xl font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateLoad} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Origin *</label>
                  <input
                    required
                    value={createForm.origin}
                    onChange={e => setCreateForm(p => ({...p, origin: e.target.value}))}
                    placeholder="e.g. Sydney Depot"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Destination *</label>
                  <input
                    required
                    value={createForm.destination}
                    onChange={e => setCreateForm(p => ({...p, destination: e.target.value}))}
                    placeholder="e.g. Canberra Branch"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Cargo Type *</label>
                <input
                  required
                  value={createForm.cargo}
                  onChange={e => setCreateForm(p => ({...p, cargo: e.target.value}))}
                  placeholder="e.g. Beverages, Electronics, Dry Goods"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Weight</label>
                  <input
                    value={createForm.weight}
                    onChange={e => setCreateForm(p => ({...p, weight: e.target.value}))}
                    placeholder="e.g. 6.2t"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Priority</label>
                  <select
                    value={createForm.priority}
                    onChange={e => setCreateForm(p => ({...p, priority: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Assign Driver</label>
                <input
                  value={createForm.driver}
                  onChange={e => setCreateForm(p => ({...p, driver: e.target.value}))}
                  placeholder="Driver name (optional)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Notes</label>
                <textarea
                  value={createForm.notes}
                  onChange={e => setCreateForm(p => ({...p, notes: e.target.value}))}
                  placeholder="Additional notes..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-yellow-400 hover:bg-yellow-500 rounded-xl text-xs font-extrabold text-gray-900 cursor-pointer transition-colors">
                  Create Load
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== DETAILS MODAL ===== */}
      {showDetailsModal && selectedLoad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#0b0f19] rounded-xl text-yellow-400">
                    <TruckIcon size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-900">{selectedLoad.id}</h2>
                    <p className="text-[11px] text-gray-400">{selectedLoad.ref}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-700 text-xl font-bold cursor-pointer">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Origin</p>
                  <p className="text-sm font-bold text-gray-900">{selectedLoad.route[0]}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Destination</p>
                  <p className="text-sm font-bold text-gray-900">{selectedLoad.route[1]}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    selectedLoad.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                    selectedLoad.status === 'Assigned' ? 'bg-indigo-100 text-indigo-700' :
                    selectedLoad.status === 'Ready' ? 'bg-blue-100 text-blue-700' :
                    selectedLoad.status === 'Review' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{selectedLoad.status}</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Priority</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    selectedLoad.priority === 'HIGH' ? 'bg-black text-yellow-400' :
                    selectedLoad.priority === 'MEDIUM' ? 'bg-gray-200 text-gray-700' :
                    'bg-green-100 text-green-700'
                  }`}>{selectedLoad.priority}</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Cargo</p>
                  <p className="text-sm font-bold text-gray-900">{selectedLoad.cargo}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Load Weight</p>
                  <p className="text-sm font-bold text-gray-900">{selectedLoad.load}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Operator</p>
                <p className="text-sm font-bold text-gray-900">{selectedLoad.operator}</p>
              </div>
              {selectedLoad.notes && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-yellow-700 uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-xs text-gray-700">{selectedLoad.notes}</p>
                </div>
              )}
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => deleteLoad(selectedLoad.id)}
                className="flex-1 py-2.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Delete Load
              </button>
              {nextStatusLabel[selectedLoad.status] && (
                <button
                  onClick={() => { promoteStatus(selectedLoad.id); setShowDetailsModal(false); }}
                  className="flex-1 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-xl text-xs font-extrabold cursor-pointer transition-colors"
                >
                  {nextStatusLabel[selectedLoad.status]}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// ===== CREATE LOAD CONSOLE =====
const CreateLoadConsole = ({ onBack, onSave }) => {
  const [stops, setStops] = React.useState([
    { id: 1, type: 'Pickup', address: '', contact: '', phone: '', time: '' },
    { id: 2, type: 'Drop',   address: '', contact: '', phone: '', time: '' },
  ]);
  const [items, setItems] = React.useState([
    { id: 1, customer: '', pickupStop: 1, dropStop: 2, nicheType: 'FREIGHT', description: '', weight: 0 }
  ]);
  const [specs, setSpecs] = React.useState({
    customerRef: '',
    priority: 'NORMAL',
    deadline: '',
    notes: ''
  });
  const [files, setFiles] = React.useState({
    manifest: null,
    photos: []
  });

  const manifestRef = React.useRef(null);
  const photosRef = React.useRef(null);

  const addStop = () => {
    const newId = stops.length > 0 ? Math.max(...stops.map(s => s.id)) + 1 : 1;
    setStops(prev => [...prev, { id: newId, type: 'Drop', address: '', contact: '', phone: '', time: '' }]);
  };

  const removeStop = (id) => {
    if (stops.length <= 2) return;
    setStops(prev => prev.filter(s => s.id !== id));
  };

  const updateStop = (id, field, value) => {
    setStops(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const addItem = () => {
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    setItems(prev => [...prev, { id: newId, customer: '', pickupStop: stops[0]?.id || 1, dropStop: stops[1]?.id || 2, nicheType: 'FREIGHT', description: '', weight: 0 }]);
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const handleActivate = () => {
    if (onSave) onSave({ stops, items, specs, status: 'Active' });
    onBack();
  };

  const handleSaveDraft = () => {
    if (onSave) onSave({ stops, items, specs, status: 'Draft' });
    onBack();
  };

  return (
    <div className="-mx-4 sm:-mx-6 -mt-4 sm:-mt-6 min-h-[calc(100vh-73px)] bg-gray-50 text-left flex flex-col">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl flex items-center justify-center transition-colors cursor-pointer text-gray-700 shadow-xs"
          >
            <ChevronLeft size={18} strokeWidth={3} />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <span className="text-gray-900">CREATE LOAD</span>
              <span className="text-yellow-400 italic">CONSOLE</span>
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
              Operational Principle: Load → Stops → Items
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveDraft}
            className="px-5 py-2.5 border-2 border-gray-300 rounded-xl text-xs font-black text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer tracking-wider bg-white"
          >
            SAVE DRAFT
          </button>
          <button
            onClick={handleActivate}
            style={{ backgroundColor: '#0b0f19', color: '#ffffff' }}
            className="px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-colors cursor-pointer tracking-wider shadow-md hover:opacity-90"
          >
            <Zap size={13} className="text-yellow-400 fill-yellow-400" />
            ACTIVATE LOAD
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex-1 flex gap-6 p-6 max-w-7xl mx-auto w-full">

        {/* LEFT COLUMN */}
        <div className="flex-1 space-y-6">

          {/* STEP 1: Configure Route Stops */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 rounded-xl">
                  <MapPin size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-base font-black text-gray-900 uppercase tracking-wide">Step 1: Configure Route Stops</h2>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold italic mt-0.5">Define all physical locations for this load</p>
                </div>
              </div>
              <button
                onClick={addStop}
                style={{ backgroundColor: '#3b3eb2', color: '#ffffff' }}
                className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-black rounded-xl transition-colors cursor-pointer uppercase tracking-wider shadow-xs hover:opacity-90"
              >
                <Plus size={12} strokeWidth={3.5} />
                Add Stop
              </button>
            </div>

            <div className="space-y-5">
              {stops.map((stop, idx) => (
                <div key={stop.id} className="relative">
                  {/* Connector line */}
                  {idx < stops.length - 1 && (
                    <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-200 z-0" />
                  )}
                  <div className="relative z-10 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    {/* Stop number badge */}
                    <div className="flex items-start gap-4">
                      <div 
                        style={{ backgroundColor: '#0b0f19' }}
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                      >
                        <span style={{ color: '#ffffff' }} className="text-xs font-black">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        {/* Row 1: Type + Address */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Stop Type</label>
                            <select
                              value={stop.type}
                              onChange={e => updateStop(stop.id, 'type', e.target.value)}
                              style={{ paddingTop: '0.625rem', paddingBottom: '0.625rem', lineHeight: '1.25rem' }}
                              className="w-full px-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white cursor-pointer"
                            >
                              <option value="Pickup">Pickup</option>
                              <option value="Drop">Drop</option>
                              <option value="Warehouse">Warehouse</option>
                              <option value="Yard">Yard</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Address / Suburb</label>
                            <div className="relative">
                              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                type="text"
                                value={stop.address}
                                onChange={e => updateStop(stop.id, 'address', e.target.value)}
                                placeholder="Full location address..."
                                className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                              />
                            </div>
                          </div>
                        </div>
                        {/* Row 2: Contact + Phone + Time */}
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Contact Name</label>
                            <input
                              type="text"
                              value={stop.contact}
                              onChange={e => updateStop(stop.id, 'contact', e.target.value)}
                              placeholder="Receiver/Sender Name"
                              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Phone</label>
                            <input
                              type="tel"
                              value={stop.phone}
                              onChange={e => updateStop(stop.id, 'phone', e.target.value)}
                              placeholder="+61..."
                              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Required Time</label>
                            <input
                              type="datetime-local"
                              value={stop.time}
                              onChange={e => updateStop(stop.id, 'time', e.target.value)}
                              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                          </div>
                        </div>
                      </div>
                      {/* Delete button for extra stops */}
                      {stops.length > 2 && (
                        <button
                          onClick={() => removeStop(stop.id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex-shrink-0 mt-1"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 2: Declare Items / Cars */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gray-900 rounded-xl">
                  <Package size={18} className="text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-base font-black text-gray-900 uppercase tracking-wide">Step 2: Declare Items / Cars</h2>
                  <p className="text-[10px] text-yellow-500 uppercase tracking-widest font-bold italic mt-0.5">Link each item to the created stops above</p>
                </div>
              </div>
              <button
                onClick={addItem}
                style={{ backgroundColor: '#0b0f19', color: '#ffd400' }}
                className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-black rounded-xl transition-colors cursor-pointer uppercase tracking-wider border border-gray-800 shadow-xs hover:opacity-90"
              >
                <Plus size={12} strokeWidth={3.5} className="text-yellow-400" />
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="border-l-4 border-yellow-400 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm relative">
                  {/* Row 1: Customer + Stops + Delete */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Customer / Owner</label>
                      <input
                        type="text"
                        value={item.customer}
                        onChange={e => updateItem(item.id, 'customer', e.target.value)}
                        placeholder="Acme Corp Logistics"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Link Pickup Stop</label>
                      <select
                        value={item.pickupStop}
                        onChange={e => updateItem(item.id, 'pickupStop', Number(e.target.value))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white cursor-pointer"
                      >
                        {stops.map((s, i) => (
                          <option key={s.id} value={s.id}>Stop #{i + 1}: {s.type} {s.address ? `(${s.address.slice(0,15)}...)` : ''}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Link Drop-Off Stop</label>
                        <select
                          value={item.dropStop}
                          onChange={e => updateItem(item.id, 'dropStop', Number(e.target.value))}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white cursor-pointer"
                        >
                          {stops.map((s, i) => (
                            <option key={s.id} value={s.id}>Stop #{i + 1}: {s.type} {s.address ? `(${s.address.slice(0,15)}...)` : ''}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="mt-6 p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Niche Type toggle */}
                  <div className="mb-4">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Niche Type</label>
                    <div className="flex items-center gap-1">
                      {['CAR', 'FREIGHT', 'DANGEROUS'].map(type => (
                        <button
                          key={type}
                          onClick={() => updateItem(item.id, 'nicheType', type)}
                          className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer tracking-wider ${
                            item.nicheType === type
                              ? 'bg-gray-900 text-yellow-400'
                              : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Row 3: Description + Weight */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Item Description / Identification</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={e => updateItem(item.id, 'description', e.target.value)}
                        placeholder="e.g. 2024 Toyota Hilux or General Cargo"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Weight (KG)</label>
                      <input
                        type="number"
                        value={item.weight}
                        onChange={e => updateItem(item.id, 'weight', e.target.value)}
                        min="0"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="w-72 xl:w-80 space-y-4 flex-shrink-0">

          {/* LOAD SPECIFICATIONS (dark card) */}
          <div className="bg-gray-900 rounded-2xl p-6">
            <h3 className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-5">Load Specifications</h3>

            <div className="mb-4">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Customer Reference</label>
              <input
                type="text"
                value={specs.customerRef}
                onChange={e => setSpecs(p => ({...p, customerRef: e.target.value}))}
                placeholder="PO-12345"
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div className="mb-4">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Priority Tier</label>
              <div className="flex gap-1">
                {['NORMAL', 'EXPRESS', 'URGENT'].map(p => (
                  <button
                    key={p}
                    onClick={() => setSpecs(prev => ({...prev, priority: p}))}
                    className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all cursor-pointer tracking-wider ${
                      specs.priority === p
                        ? 'bg-yellow-400 text-gray-900'
                        : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Global Deadline</label>
              <div className="relative">
                <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="datetime-local"
                  value={specs.deadline}
                  onChange={e => setSpecs(p => ({...p, deadline: e.target.value}))}
                  className="w-full pl-8 pr-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>
          </div>

           {/* DOCUMENTS & PHOTOS */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Camera size={14} className="text-gray-400" />
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Documents & Photos</h3>
            </div>
            
            <input 
              type="file" 
              ref={manifestRef} 
              onChange={e => setFiles(prev => ({ ...prev, manifest: e.target.files[0] }))}
              className="hidden" 
            />
            <input 
              type="file" 
              multiple 
              ref={photosRef} 
              onChange={e => setFiles(prev => ({ ...prev, photos: Array.from(e.target.files) }))}
              className="hidden" 
            />

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => manifestRef.current?.click()}
                className={`flex flex-col items-center gap-2 py-5 border-2 border-dashed rounded-xl transition-all cursor-pointer group ${
                  files.manifest ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-yellow-400 hover:bg-yellow-50'
                }`}
              >
                <Upload size={20} className={files.manifest ? 'text-green-500' : 'text-gray-300 group-hover:text-yellow-500 transition-colors'} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${
                  files.manifest ? 'text-green-700' : 'text-gray-400 group-hover:text-yellow-600'
                }`}>
                  {files.manifest ? files.manifest.name.slice(0, 10) + '...' : 'Manifest'}
                </span>
              </button>
              <button 
                onClick={() => photosRef.current?.click()}
                className={`flex flex-col items-center gap-2 py-5 border-2 border-dashed rounded-xl transition-all cursor-pointer group ${
                  files.photos.length > 0 ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-yellow-400 hover:bg-yellow-50'
                }`}
              >
                <Camera size={20} className={files.photos.length > 0 ? 'text-green-500' : 'text-gray-300 group-hover:text-yellow-500 transition-colors'} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${
                  files.photos.length > 0 ? 'text-green-700' : 'text-gray-400 group-hover:text-yellow-600'
                }`}>
                  {files.photos.length > 0 ? `${files.photos.length} Attached` : 'Photos'}
                </span>
              </button>
            </div>
          </div>

          {/* INTERNAL DISPATCH NOTES */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Internal Dispatch Notes</h3>
            <textarea
              value={specs.notes}
              onChange={e => setSpecs(p => ({...p, notes: e.target.value}))}
              placeholder="Gate codes, site rules, or special procedures..."
              rows={5}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
            />
          </div>

        </div>
      </div>
    </div>
  );
};

// ===== VEHICLES & FLEET DASHBOARD VIEW =====
const VehiclesDashboardView = () => {
  const [vehicles, setVehicles] = React.useState([
    { id: 'TRK-102', reg: 'XQG-984', branch: 'SYDNEY', driver: 'Jack Taylor', driverImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60', type: 'HEAVY TRUCK', payload: 'PAYLOAD: 20T', status: 'ACTIVE', img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=60' },
    { id: 'VAN-08', reg: 'BZX-441', branch: 'MELBOURNE', driver: 'Oliver Brown', driverImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60', type: 'DELIVERY VAN', payload: 'PAYLOAD: 2.5T', status: 'MAINTENANCE', img: 'https://images.unsplash.com/photo-1516576880881-14017b29a739?w=600&auto=format&fit=crop&q=60' },
    { id: 'TRL-44', reg: 'T-9921', branch: 'BRISBANE', driver: 'Noah Williams', driverImg: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60', type: 'TRAILER FLATBED', payload: 'PAYLOAD: 40T', status: 'ACTIVE', img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=60' },
    { id: 'TRK-09', reg: 'XYY-112', branch: 'SYDNEY', driver: 'Liam Smith', driverImg: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=60', type: 'HEAVY TRUCK', payload: 'PAYLOAD: 20T', status: 'INBOUND', img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=60' },
  ]);

  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('ALL');
  const [sortBy, setSortBy] = React.useState('id');
  const [viewMode, setViewMode] = React.useState('list'); // 'list' | 'grid'
  
  // Add/Edit Modals state
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newVehicle, setNewVehicle] = React.useState({
    id: '', reg: '', branch: 'SYDNEY', driver: '', type: 'HEAVY TRUCK', payload: 'PAYLOAD: 20T', status: 'ACTIVE'
  });

  const handleAddVehicle = (e) => {
    e.preventDefault();
    if (!newVehicle.id || !newVehicle.reg) return;

    const randomAvatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60',
    ];
    
    const randomTrucks = [
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1516576880881-14017b29a739?w=600&auto=format&fit=crop&q=60'
    ];

    const entry = {
      ...newVehicle,
      id: newVehicle.id.toUpperCase(),
      reg: newVehicle.reg.toUpperCase(),
      driver: newVehicle.driver || 'Unassigned Driver',
      driverImg: randomAvatars[Math.floor(Math.random() * randomAvatars.length)],
      img: randomTrucks[Math.floor(Math.random() * randomTrucks.length)]
    };

    setVehicles(prev => [entry, ...prev]);
    setShowAddModal(false);
    setNewVehicle({ id: '', reg: '', branch: 'SYDNEY', driver: '', type: 'HEAVY TRUCK', payload: 'PAYLOAD: 20T', status: 'ACTIVE' });
  };

  const deleteVehicle = (id) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.id.toLowerCase().includes(search.toLowerCase()) ||
                          v.reg.toLowerCase().includes(search.toLowerCase()) ||
                          v.branch.toLowerCase().includes(search.toLowerCase()) ||
                          v.driver.toLowerCase().includes(search.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && v.status === statusFilter;
  });

  return (
    <div className="p-2 sm:p-6 text-left">
      {/* Header section */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gray-100 rounded-xl text-gray-800">
            <Truck size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Vehicles & Fleet</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage trucks, vans, and trailers across all branches.</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-extrabold py-2.5 px-5 rounded-xl transition-colors flex items-center gap-2 text-sm cursor-pointer"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add Vehicle
        </button>
      </div>

      {/* KPI Cards section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        {/* Fleet Usage */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-center h-28">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fleet Usage</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">84%</h3>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-500">
            <Activity size={20} />
          </div>
        </div>

        {/* Needs Maintenance */}
        <div className="bg-white p-5 rounded-2xl border-2 border-yellow-400 flex justify-between items-center h-28 shadow-xs">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Needs Maintenance</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">08 Trucks</h3>
          </div>
          <div className="p-3 rounded-xl bg-red-50 text-red-500">
            <Wrench size={20} />
          </div>
        </div>

        {/* Safety Check */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-center h-28">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Safety Check</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">100%</h3>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-500">
            <Shield size={20} />
          </div>
        </div>

        {/* Fuel Cost */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-center h-28">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fuel Cost</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">$1.42/km</h3>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-500">
            <Droplet size={20} />
          </div>
        </div>
      </div>

      {/* Filters row */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input 
              type="text" 
              placeholder="Search Reg, ID or Branch..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs w-full focus:outline-none focus:ring-1 focus:ring-yellow-400"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 cursor-pointer ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-400'}`}
              >
                <List size={16} />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 cursor-pointer ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-400'}`}
              >
                <Grid size={16} />
              </button>
            </div>

            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 bg-white cursor-pointer focus:outline-none"
            >
              <option value="ALL">Filter Status</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
              <option value="INBOUND">INBOUND</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 bg-white cursor-pointer focus:outline-none"
            >
              <option value="id">SORT BY: ID</option>
              <option value="branch">SORT BY: BRANCH</option>
              <option value="status">SORT BY: STATUS</option>
            </select>
          </div>
        </div>

        {/* View content layout */}
        {filteredVehicles.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm font-medium">No vehicles found.</div>
        ) : viewMode === 'list' ? (
          <div className="overflow-x-auto mt-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <th className="py-3 pl-3 w-10 font-normal"><input type="checkbox" className="rounded border-gray-300" /></th>
                  <th className="py-3 px-4 font-medium">Vehicle Details</th>
                  <th className="py-3 px-4 font-medium">Branch</th>
                  <th className="py-3 px-4 font-medium">Assigned Driver</th>
                  <th className="py-3 px-4 font-medium">Type</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredVehicles.map(v => (
                  <tr key={v.id} className="text-xs hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 pl-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img src={v.img} alt={v.id} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 block">{v.id}</div>
                          <span className="text-[10px] text-gray-400 font-normal mt-0.5 block">{v.reg}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-600 tracking-wide uppercase">{v.branch}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <img src={v.driverImg} alt={v.driver} className="w-6 h-6 rounded-full object-cover border border-gray-100" />
                        <span className="font-medium text-gray-600">{v.driver}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="block text-gray-900 uppercase font-medium">{v.type}</div>
                      <span className="text-[9px] text-gray-400 block mt-0.5 font-normal">{v.payload}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 text-[10px] font-medium rounded-lg tracking-wider border ${
                        v.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                          : v.status === 'MAINTENANCE'
                            ? 'bg-red-50 text-red-600 border-red-200'
                            : 'bg-blue-50 text-blue-600 border-blue-200'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => deleteVehicle(v.id)}
                        className="px-4 py-1.5 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-lg text-xs font-semibold text-gray-800 transition-all cursor-pointer"
                      >
                        MANAGE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {filteredVehicles.map(v => {
              const isDarkBg = v.id === 'VAN-08' || v.id === 'TRL-44';
              return (
                <div key={v.id} className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs hover:border-yellow-400 hover:shadow-yellow-500/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between">
                  
                  {/* Top card block with image or dark solid background */}
                  <div className={`relative h-44 p-5 flex flex-col justify-between ${isDarkBg ? 'bg-[#0B0B0B]' : ''}`} style={!isDarkBg ? { backgroundImage: `url(${v.img})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                    {/* Dark overlay for readability on image backgrounds */}
                    {!isDarkBg && <div className="absolute inset-0 bg-black/35 z-0" />}

                    {/* Checkbox and Badge Row */}
                    <div className="flex justify-between items-center z-10 relative">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400 cursor-pointer bg-white"
                      />
                      <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider ${
                        v.status === 'ACTIVE' ? 'bg-emerald-500 text-white' :
                        v.status === 'MAINTENANCE' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                      }`}>{v.status}</span>
                    </div>

                    {/* ID & Registration Details */}
                    <div className="z-10 relative text-left">
                      <h4 className="text-lg font-black text-white tracking-tight">{v.id}</h4>
                      <p className="text-[10px] text-gray-300 font-bold uppercase tracking-wider mt-0.5">{v.reg}</p>
                    </div>
                  </div>

                  {/* Bottom details block */}
                  <div className="p-5 text-left flex flex-col justify-between flex-grow">
                    {/* Branch & Payload details row */}
                    <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4 mb-4">
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Assigned Branch</span>
                        <strong className="text-sm font-black text-gray-800 uppercase block mt-1">{v.branch}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Payload</span>
                        <strong className="text-sm font-black text-gray-800 uppercase block mt-1">{v.payload.replace('PAYLOAD: ', '').toLowerCase()}</strong>
                      </div>
                    </div>

                    {/* Driver details row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={v.driverImg} alt={v.driver} className="w-8 h-8 rounded-full object-cover border border-gray-100 shadow-xs" />
                        <div className="text-left">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Driver</span>
                          <strong className="text-xs font-bold text-gray-800 block mt-0.5">{v.driver}</strong>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => deleteVehicle(v.id)}
                        className="p-2 bg-gray-50 text-gray-700 hover:text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors border border-gray-100 cursor-pointer shadow-xs"
                      >
                        <Activity size={14} />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-black text-gray-900 tracking-tight">ADD VEHICLE TO FLEET</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer text-gray-400">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddVehicle} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Vehicle ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. TRK-102"
                  value={newVehicle.id}
                  onChange={e => setNewVehicle(p => ({ ...p, id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Registration Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. XQG-984"
                  value={newVehicle.reg}
                  onChange={e => setNewVehicle(p => ({ ...p, reg: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 font-bold"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Branch</label>
                  <select 
                    value={newVehicle.branch}
                    onChange={e => setNewVehicle(p => ({ ...p, branch: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white cursor-pointer font-bold focus:outline-none"
                  >
                    <option value="SYDNEY">SYDNEY</option>
                    <option value="MELBOURNE">MELBOURNE</option>
                    <option value="BRISBANE">BRISBANE</option>
                    <option value="PERTH">PERTH</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Status</label>
                  <select 
                    value={newVehicle.status}
                    onChange={e => setNewVehicle(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white cursor-pointer font-bold focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="INBOUND">INBOUND</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Assigned Driver</label>
                <input 
                  type="text" 
                  placeholder="Driver Full Name"
                  value={newVehicle.driver}
                  onChange={e => setNewVehicle(p => ({ ...p, driver: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Type</label>
                  <select 
                    value={newVehicle.type}
                    onChange={e => setNewVehicle(p => ({ ...p, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white cursor-pointer font-bold focus:outline-none"
                  >
                    <option value="HEAVY TRUCK">HEAVY TRUCK</option>
                    <option value="DELIVERY VAN">DELIVERY VAN</option>
                    <option value="TRAILER FLATBED">TRAILER FLATBED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Payload</label>
                  <input 
                    type="text" 
                    placeholder="e.g. PAYLOAD: 20T"
                    value={newVehicle.payload}
                    onChange={e => setNewVehicle(p => ({ ...p, payload: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-xl text-xs font-black tracking-wider uppercase transition-colors cursor-pointer"
              >
                SUBMIT & ADD VEHICLE
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// ===== OPERATIONS: BRANCHES DASHBOARD VIEW =====
const BranchesDashboardView = () => {
  const [branches, setBranches] = React.useState([
    { id: 'SYD-CENTRAL', name: 'Sydney Central Depot', type: 'PRIMARY DEPOT', status: 'Online', score: '98% Score', address: 'STRATHFIELD, NSW 2135', phone: '+61 2 9111 2222', hours: '24/7', leadInitials: 'MA', leadName: 'MICHAEL ADAMS', staff: 42, vehicles: 18, storage: 92, storageLabel: 'Full', progressColor: 'bg-red-500' },
    { id: 'MEL-DEPOT', name: 'Melbourne Depot', type: 'PRIMARY DEPOT', status: 'Online', score: '84% Score', address: 'TULLAMARINE, VIC 3043', phone: '+61 3 9222 3333', hours: '24/7', leadInitials: 'SM', leadName: 'SARAH MITCHELL', staff: 14, vehicles: 6, storage: 45, storageLabel: 'Ok', progressColor: 'bg-yellow-400' },
    { id: 'BNE-PORT', name: 'Brisbane Port Branch', type: 'LOCAL BRANCH', status: 'Maintenance', score: '72% Score', address: 'LYTTON, QLD 4178', phone: '+61 7 3444 5555', hours: '12/6', leadInitials: 'LS', leadName: 'LIAM SMITH', staff: 28, vehicles: 12, storage: 78, storageLabel: 'Ok', progressColor: 'bg-yellow-400' }
  ]);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [selectedBranch, setSelectedBranch] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [newBranch, setNewBranch] = React.useState({
    id: '',
    name: '',
    type: 'Local Branch',
    address: '',
    managerName: '',
    phone: '',
    workingHours: '08:00 - 18:00',
    storageSpace: '1000'
  });

  const handleAddBranch = (e) => {
    e.preventDefault();
    const initials = newBranch.managerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'XX';
    const storagePercent = Math.min(Math.max(Math.floor((parseInt(newBranch.storageSpace) || 1000) / 20), 10), 95);
    const newObj = {
      id: newBranch.id.toUpperCase() || 'NEW-DEPOT',
      name: newBranch.name || 'New Logistics Depot',
      type: newBranch.type.toUpperCase(),
      status: 'Online',
      score: '100% Score',
      address: newBranch.address || 'UNKNOWN REGION',
      phone: newBranch.phone || '+61 2 9000 0000',
      hours: newBranch.workingHours || '24/7',
      leadInitials: initials,
      leadName: newBranch.managerName || 'Staff Lead',
      staff: 15,
      vehicles: 8,
      storage: storagePercent,
      storageLabel: storagePercent > 85 ? 'Full' : 'Ok',
      progressColor: storagePercent > 85 ? 'bg-red-500' : 'bg-yellow-400'
    };
    setBranches([...branches, newObj]);
    setShowAddForm(false);
    setNewBranch({ id: '', name: '', type: 'Local Branch', address: '', managerName: '', phone: '', workingHours: '08:00 - 18:00', storageSpace: '1000' });
  };

  const filtered = branches.filter(b => b.name.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase()));

  const [cockpitTab, setCockpitTab] = React.useState('Overview');
  const [branchOnline, setBranchOnline] = React.useState(true);
  const [showAddStaffInline, setShowAddStaffInline] = React.useState(false);
  const [roster, setRoster] = React.useState([
    { name: 'Michael Adams', role: 'Branch Manager', init: 'MA' },
    { name: 'Sarah Mitchell', role: 'Dispatcher', init: 'SM' },
    { name: 'Emma Thompson', role: 'Dispatcher', init: 'ET' },
    { name: 'Chris Lee', role: 'Accounts', init: 'CL' }
  ]);
  const [newStaffName, setNewStaffName] = React.useState('');
  const [newStaffRole, setNewStaffRole] = React.useState('Dispatcher');

  const handleAddStaffSubmit = (e) => {
    e.preventDefault();
    if (!newStaffName) return;
    const initials = newStaffName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'ST';
    setRoster([...roster, { name: newStaffName, role: newStaffRole, init: initials }]);
    setNewStaffName('');
    setShowAddStaffInline(false);
  };

  // Render 1: Manage Specific Branch Details Page
  if (selectedBranch) {
    const tabsList = ['Overview', `Authority (${roster.length})`, 'Drivers (4)', 'Fleet (5)', 'Recent Jobs'];

    return (
      <div className="p-2 sm:p-6 text-left bg-gray-50/50 min-h-screen">
        {/* Header Cockpit */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-gray-200 pb-5">
          <div className="flex items-start gap-3.5">
            <button 
              onClick={() => {
                setSelectedBranch(null);
                setCockpitTab('Overview');
              }}
              className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 cursor-pointer shadow-xs mt-1"
            >
              <ChevronLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">{selectedBranch.name}</h1>
                <span className="px-2 py-0.5 text-[9px] font-black bg-yellow-100 text-yellow-800 rounded">{selectedBranch.type}</span>
                <span className={`px-2 py-0.5 text-[9px] font-black rounded ${
                  branchOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {branchOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-bold mt-1 tracking-wider uppercase">
                📍 {selectedBranch.address} &nbsp;·&nbsp; 📞 {selectedBranch.phone} &nbsp;·&nbsp; 🕒 {selectedBranch.hours}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => {
                setCockpitTab(`Authority (${roster.length})`);
                setShowAddStaffInline(true);
              }}
              className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={14} /> Add Staff
            </button>
            <button className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs">
              <Wrench size={14} /> Configure
            </button>
          </div>
        </div>

        {/* Cockpit KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-xs">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Total Staff</span>
            <strong className="text-xl font-black text-gray-900 block mt-1">{selectedBranch.staff + roster.length - 4}</strong>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-xs">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Drivers</span>
            <strong className="text-xl font-black text-gray-900 block mt-1">{selectedBranch.vehicles}</strong>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-xs">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Fleet Assets</span>
            <strong className="text-xl font-black text-gray-900 block mt-1">24</strong>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-xs">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Active Jobs</span>
            <strong className="text-xl font-black text-gray-900 block mt-1">18</strong>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-xs">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Delivered Today</span>
            <strong className="text-xl font-black text-gray-900 block mt-1">412</strong>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-xs">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block text-red-500">Issues</span>
            <strong className="text-xl font-black text-red-500 block mt-1">3</strong>
          </div>
        </div>

        {/* Dock capacity indicator */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 mb-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-grow w-full">
            <div className="flex justify-between text-xs font-bold text-gray-700 mb-2">
              <span>Dock Capacity</span>
              <span>{selectedBranch.storage}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-red-500" style={{ width: `${selectedBranch.storage}%` }} />
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xs font-black text-gray-900">18 Active Docks</div>
            <span className="text-[10px] text-red-500 font-extrabold flex items-center gap-1 mt-0.5 justify-end">
              ⚠️ Near Capacity
            </span>
          </div>
        </div>

        {/* Main Tabbed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 columns: Branch profile details and loads table */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 pb-1.5 overflow-x-auto">
              {tabsList.map((tab) => {
                const isActive = cockpitTab.split(' ')[0] === tab.split(' ')[0];
                return (
                  <button 
                    key={tab} 
                    onClick={() => setCockpitTab(tab)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all whitespace-nowrap ${
                      isActive ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-400 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Overview */}
            {cockpitTab.startsWith('Overview') && (
              <>
                {/* Profile Card */}
                <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs">
                  <div className="flex items-center gap-2 mb-6 text-gray-800">
                    <Store size={15} />
                    <h4 className="text-xs font-black uppercase tracking-wider">Branch Profile</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
                    <div>
                      <span className="text-gray-400 font-medium block">Branch Manager</span>
                      <strong className="text-gray-900 font-semibold block mt-1">{selectedBranch.leadName}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Contact Phone</span>
                      <strong className="text-gray-900 font-semibold block mt-1">{selectedBranch.phone}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Operating Hours</span>
                      <strong className="text-gray-900 font-semibold block mt-1">{selectedBranch.hours}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Facility Type</span>
                      <strong className="text-gray-900 font-semibold block mt-1">{selectedBranch.type === 'PRIMARY DEPOT' ? 'Primary Depot' : 'Local Branch'}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Location</span>
                      <strong className="text-gray-900 font-semibold block mt-1">{selectedBranch.address}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 font-medium block">Branch ID</span>
                      <strong className="text-gray-900 font-semibold block mt-1 font-mono">{selectedBranch.id}</strong>
                    </div>
                  </div>
                </div>

                {/* Recent Loads Table */}
                <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs">
                  <div className="flex justify-between items-center mb-5">
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-800">Recent Loads</h4>
                    <button className="text-[10px] text-gray-400 hover:text-yellow-500 font-black tracking-wider uppercase cursor-pointer">
                      View All &gt;
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 font-medium text-gray-400 uppercase tracking-wider">
                          <th className="py-2.5 px-3">Load</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Driver</th>
                          <th className="py-2.5 px-3">ETA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-xs">
                        <tr>
                          <td className="py-3 px-3">
                            <strong className="text-gray-900 font-semibold block">SHP-9042</strong>
                            <span className="text-[10px] text-gray-400 block mt-0.5">Acme Corp</span>
                          </td>
                          <td className="py-3 px-3"><span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-200">IN TRANSIT</span></td>
                          <td className="py-3 px-3 font-semibold text-gray-700">Jack Taylor</td>
                          <td className="py-3 px-3 font-semibold text-gray-600">14:30</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3">
                            <strong className="text-gray-900 font-semibold block">SHP-9055</strong>
                            <span className="text-[10px] text-gray-400 block mt-0.5">Acme Freight</span>
                          </td>
                          <td className="py-3 px-3"><span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-200">UNASSIGNED</span></td>
                          <td className="py-3 px-3 text-gray-400">—</td>
                          <td className="py-3 px-3 text-gray-400">—</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3">
                            <strong className="text-gray-900 font-semibold block">SHP-9039</strong>
                            <span className="text-[10px] text-gray-400 block mt-0.5">Global Traders</span>
                          </td>
                          <td className="py-3 px-3"><span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">RECEIVED</span></td>
                          <td className="py-3 px-3 font-semibold text-gray-700">Liam Smith</td>
                          <td className="py-3 px-3 font-semibold text-gray-600">Done</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3">
                            <strong className="text-gray-900 font-semibold block">SHP-9041</strong>
                            <span className="text-[10px] text-gray-400 block mt-0.5">Tech Solutions</span>
                          </td>
                          <td className="py-3 px-3"><span className="px-2 py-0.5 rounded text-[9px] font-bold bg-red-50 text-red-600 border border-red-200">ISSUE</span></td>
                          <td className="py-3 px-3 font-semibold text-gray-700">Lucas Jones</td>
                          <td className="py-3 px-3 font-semibold text-gray-600">Delayed</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Tab 2: Roster / Authority details */}
            {cockpitTab.startsWith('Authority') && (
              <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs">
                <div className="flex justify-between items-center mb-5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-800">Complete Branch Authority</h4>
                  <button 
                    onClick={() => setShowAddStaffInline(!showAddStaffInline)}
                    className="text-xs font-bold text-yellow-600 hover:underline cursor-pointer"
                  >
                    {showAddStaffInline ? 'Cancel' : '+ Add New Staff Member'}
                  </button>
                </div>

                {showAddStaffInline && (
                  <form onSubmit={handleAddStaffSubmit} className="bg-gray-50 p-4 rounded-xl mb-5 space-y-3 border border-gray-100">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Staff Member Name</label>
                        <input 
                          type="text" required placeholder="e.g. John Doe"
                          value={newStaffName} onChange={(e) => setNewStaffName(e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Company Role</label>
                        <select 
                          value={newStaffRole} onChange={(e) => setNewStaffRole(e.target.value)}
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none"
                        >
                          <option>Dispatcher</option>
                          <option>Branch Manager</option>
                          <option>Accounts Officer</option>
                          <option>Operations Auditor</option>
                        </select>
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      style={{ color: '#000000', backgroundColor: '#facc15' }}
                      className="w-full font-black text-xs py-2 rounded-lg hover:bg-yellow-500 cursor-pointer"
                    >
                      ADD TO ROSTER
                    </button>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roster.map(staff => (
                    <div key={staff.name} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div 
                          style={{ color: '#ffffff', backgroundColor: '#111827' }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                        >
                          {staff.init}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-gray-900 block">{staff.name}</span>
                          <span className="text-[10px] text-gray-400 block mt-0.5">{staff.role}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[8px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 rounded">ACTIVE</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Drivers list */}
            {cockpitTab.startsWith('Drivers') && (
              <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-800 mb-4">Assigned Drivers</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'Jack Taylor', license: 'MC Heavy Double', phone: '+61 400 111 222', state: 'In Transit' },
                    { name: 'Liam Smith', license: 'HC Heavy Rigid', phone: '+61 400 222 333', state: 'At Depot' },
                    { name: 'Lucas Jones', license: 'MC Heavy Double', phone: '+61 400 333 444', state: 'Rest Period' },
                    { name: 'Sarah Connor', license: 'HR Heavy Vehicle', phone: '+61 400 444 555', state: 'At Depot' }
                  ].map(drv => (
                    <div key={drv.name} className="p-4 border border-gray-100 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-extrabold text-gray-900">{drv.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                          drv.state === 'In Transit' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                          drv.state === 'Rest Period' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                          'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        }`}>{drv.state}</span>
                      </div>
                      <div className="text-[10px] text-gray-400">Class: {drv.license}</div>
                      <div className="text-[10px] text-gray-500">Phone: {drv.phone}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Fleet list */}
            {cockpitTab.startsWith('Fleet') && (
              <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-800 mb-4">Assigned Fleet Vehicles</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: '2022 Toyota Camry', plate: 'ABC 123', status: 'IN DEPOT', type: 'Sedan' },
                    { name: '2023 Honda CR-V', plate: 'XYZ 987', status: 'IN TRANSIT', type: 'SUV' },
                    { name: '2024 Tesla Model S', plate: 'EV 0001', status: 'DELIVERED', type: 'Electric Sedan' },
                    { name: '2021 Ford Ranger', plate: 'TRK 444', status: 'AWAITING LOAD', type: 'Ute' },
                    { name: '2022 Nissan X-Trail', plate: 'NIS 202', status: 'IN DEPOT', type: 'SUV' }
                  ].map(v => (
                    <div key={v.plate} className="p-4 border border-gray-100 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-extrabold text-gray-900">{v.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                          v.status === 'IN TRANSIT' ? 'bg-blue-50 text-blue-600' :
                          v.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' :
                          v.status === 'AWAITING LOAD' ? 'bg-amber-50 text-amber-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>{v.status}</span>
                      </div>
                      <div className="text-[10px] text-gray-400">Plate: {v.plate} &nbsp;·&nbsp; Body: {v.type}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 5: Recent Jobs list */}
            {cockpitTab.startsWith('Recent Jobs') && (
              <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-800 mb-4">Cargo Log Book</h4>
                <div className="space-y-4">
                  {[
                    { load: 'SHP-9042', client: 'Acme Corp', route: 'Sydney Central ➔ Brisbane Port', cargo: 'Automotive Parts (1.5 tons)' },
                    { load: 'SHP-9055', client: 'Acme Freight', route: 'Melbourne Depot ➔ Sydney Central', cargo: 'Retail Stock (800 kg)' },
                    { load: 'SHP-9039', client: 'Global Traders', route: 'Brisbane Port ➔ Melbourne Depot', cargo: 'Electronics (2.1 tons)' }
                  ].map(job => (
                    <div key={job.load} className="p-3 border border-gray-100 rounded-xl text-xs">
                      <div className="flex justify-between font-extrabold text-gray-950 mb-1">
                        <span>{job.load}</span>
                        <span className="text-gray-400 font-medium text-[10px]">{job.client}</span>
                      </div>
                      <div className="text-gray-600 font-medium text-[11px]">{job.route}</div>
                      <div className="text-gray-400 text-[10px] mt-1">Cargo: {job.cargo}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column: Operations Control and Authority list */}
          <div className="space-y-6">
            {/* Operations Control Panel */}
            <div 
              style={{ backgroundColor: '#0B0B0B' }}
              className="rounded-2xl p-5 border border-white/5 shadow-md text-left"
            >
              <div className="flex items-center gap-2 mb-6" style={{ color: '#facc15' }}>
                <Settings size={15} className="animate-spin-slow" />
                <h4 className="text-[10px] font-black uppercase tracking-wider">Operations Control</h4>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => setBranchOnline(!branchOnline)}
                  style={{ 
                    color: branchOnline ? '#f87171' : '#34d399', 
                    backgroundColor: branchOnline ? 'rgba(239, 68, 68, 0.05)' : 'rgba(52, 211, 153, 0.05)', 
                    borderColor: branchOnline ? 'rgba(239, 68, 68, 0.3)' : 'rgba(52, 211, 153, 0.3)' 
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-black border cursor-pointer transition-all flex items-center justify-center gap-2 tracking-wider"
                >
                  <Power size={13} /> {branchOnline ? 'FORCE OFFLINE' : 'FORCE ONLINE'}
                </button>
                <button 
                  onClick={() => setCockpitTab(`Authority (${roster.length})`)}
                  style={{ color: '#ffffff', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  className="w-full py-2.5 rounded-xl text-xs font-black border hover:bg-white/10 cursor-pointer transition-all flex items-center justify-center gap-2 tracking-wider"
                >
                  <Shield size={13} /> VIEW AUTHORITY ROSTER
                </button>
                <button 
                  onClick={() => {
                    setCockpitTab(`Authority (${roster.length})`);
                    setShowAddStaffInline(true);
                  }}
                  style={{ color: '#facc15', backgroundColor: 'rgba(250, 204, 21, 0.05)', borderColor: 'rgba(250, 204, 21, 0.2)' }}
                  className="w-full py-2.5 rounded-xl text-xs font-black border hover:bg-yellow-400/10 cursor-pointer transition-all flex items-center justify-center gap-2 tracking-wider"
                >
                  <UserPlus size={13} /> ADD STAFF TO BRANCH
                </button>
              </div>
            </div>

            {/* Authority List (Sticky Roster Sidebar) */}
            <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-800">Authority</h4>
                <button 
                  onClick={() => setCockpitTab(`Authority (${roster.length})`)}
                  className="text-[9px] text-gray-400 hover:text-yellow-600 font-extrabold uppercase"
                >
                  Details
                </button>
              </div>
              <div className="space-y-4">
                {roster.slice(0, 4).map(staff => (
                  <div key={staff.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div 
                        style={{ color: '#ffffff', backgroundColor: '#111827' }}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                      >
                        {staff.init}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">{staff.name}</span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">{staff.role}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[8px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 rounded">ACTIVE</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render 2: Add New Branch Form Builder
  if (showAddForm) {
    return (
      <div className="p-4 sm:p-8 text-left bg-gray-50/50 min-h-screen">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <button 
            onClick={() => setShowAddForm(false)}
            className="p-1 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Admin Portal</span>
          <span className="text-gray-300">/</span>
          <span className="text-xs font-bold text-gray-500">Add New Branch</span>
        </div>

        <form onSubmit={handleAddBranch} className="max-w-4xl mx-auto space-y-6">
          {/* Card 1: Branch Details */}
          <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 bg-yellow-50 text-yellow-500 rounded-lg"><Store size={16} /></div>
              <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Branch Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Branch Name</label>
                <input 
                  type="text" required placeholder="e.g. Sydney West Depot"
                  value={newBranch.name} onChange={(e) => setNewBranch({...newBranch, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Branch Type</label>
                <select 
                  value={newBranch.type} onChange={(e) => setNewBranch({...newBranch, type: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none"
                >
                  <option>Primary Depot</option>
                  <option>Local Branch</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input 
                    type="text" required placeholder="123 Industrial Dr, Suburb, VIC 3000"
                    value={newBranch.address} onChange={(e) => setNewBranch({...newBranch, address: e.target.value})}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Branch Code / ID</label>
                <input 
                  type="text" required placeholder="e.g. SYD-WEST"
                  value={newBranch.id} onChange={(e) => setNewBranch({...newBranch, id: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bottom Grid for Management and Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 2: Management */}
            <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg"><Users size={16} /></div>
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Management</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Manager Name</label>
                  <input 
                    type="text" required placeholder="Enter full name"
                    value={newBranch.managerName} onChange={(e) => setNewBranch({...newBranch, managerName: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input 
                      type="text" required placeholder="+61 400 000 000"
                      value={newBranch.phone} onChange={(e) => setNewBranch({...newBranch, phone: e.target.value})}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Capacity & Hours */}
            <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 bg-emerald-50 text-emerald-500 rounded-lg"><Clock size={16} /></div>
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Capacity & Hours</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Working Hours</label>
                  <input 
                    type="text" required placeholder="08:00 - 18:00"
                    value={newBranch.workingHours} onChange={(e) => setNewBranch({...newBranch, workingHours: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Storage Space (SQM)</label>
                  <input 
                    type="number" required placeholder="1000"
                    value={newBranch.storageSpace} onChange={(e) => setNewBranch({...newBranch, storageSpace: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-6 py-2.5 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-500 transition-all cursor-pointer"
            >
              CANCEL
            </button>
            <button 
              type="submit"
              style={{ color: '#000000', backgroundColor: '#eab308' }}
              className="px-6 py-2.5 text-gray-900 font-extrabold rounded-xl text-xs hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:shadow-yellow-500/10"
            >
              <CheckCircle2 size={14} />
              SAVE BRANCH
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Render 3: Main List of Branches
  return (
    <div className="p-2 sm:p-6 text-left">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gray-100 rounded-xl text-gray-800 shadow-xs">
            <Store size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Branch List</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage Depots and delivery centers across your area.</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          style={{ color: '#ffffff', backgroundColor: '#eab308' }}
          className="hover:scale-[1.02] active:scale-[0.98] text-gray-900 font-extrabold py-2.5 px-5 rounded-xl transition-all flex items-center gap-2 text-sm cursor-pointer shadow-md hover:shadow-yellow-500/20"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add New Branch
        </button>
      </div>

      {/* Search and KPI Cards */}
      <div className="mb-6 flex gap-4 max-w-md relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
        <input 
          type="text" 
          placeholder="Filter branches by name or code..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs w-full focus:outline-none focus:ring-1 focus:ring-yellow-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-center h-24 shadow-xs">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">System Status</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">98.4%</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-500"><Grid size={18} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-center h-24 shadow-xs">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Staff</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">1,240</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-500"><Users size={18} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-center h-24 shadow-xs">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Vehicles</p>
            <h3 className="text-2xl font-bold mt-1" style={{ color: '#d97706' }}>840</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-500"><TruckIcon size={18} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-center h-24 shadow-xs">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">System Online</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">99.9%</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-500"><Globe size={18} /></div>
        </div>
      </div>

      {/* Grid of branch cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map(b => (
          <div 
            key={b.id} 
            className="bg-white rounded-2xl border border-gray-100 hover:border-yellow-400 hover:shadow-yellow-500/10 p-6 flex flex-col justify-between shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <div>
              {/* Header tags */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded tracking-wide ${
                    b.type === 'PRIMARY DEPOT' ? 'bg-[#FEF08A] text-[#713F12]' : 'bg-gray-100 text-gray-800'
                  }`}>{b.type}</span>
                  <span className="text-[10px] text-gray-400 font-medium">{b.status}</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{b.score}</span>
              </div>

              {/* Title & Address */}
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">{b.name}</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                <MapPin size={10} /> {b.address}
              </p>

              {/* Lead details */}
              <div className="flex items-center gap-2.5 mt-5 mb-6">
                <div 
                  style={{ color: '#ffffff', backgroundColor: '#111827' }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                >
                  {b.leadInitials}
                </div>
                <div className="text-xs font-semibold text-gray-600">LEAD: {b.leadName}</div>
              </div>

              {/* Staff & Vehicle grid info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Staff Count</span>
                  <strong className="text-xl font-bold text-gray-900 block mt-1">{b.staff}</strong>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Vehicles</span>
                  <strong className="text-xl font-bold text-gray-900 block mt-1">{b.vehicles}</strong>
                </div>
              </div>
            </div>

            {/* Storage usage details */}
            <div className="border-t border-gray-100 pt-4 mt-auto">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-2">
                <span className="text-gray-400">Storage Usage</span>
                <span className={b.storageLabel === 'Full' ? 'text-red-500' : 'text-emerald-500'}>
                  {b.storageLabel} {b.storage}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-5">
                <div className={`h-full ${b.progressColor}`} style={{ width: `${b.storage}%` }} />
              </div>

              {/* Card footer */}
              <div className="flex justify-between items-center text-[10px] font-bold tracking-wider pt-2 border-t border-gray-50">
                <span className="text-gray-400 uppercase">{b.id}</span>
                <button 
                  onClick={() => setSelectedBranch(b)}
                  className="text-gray-800 hover:text-yellow-500 cursor-pointer flex items-center gap-1 font-bold"
                >
                  MANAGE BRANCH ↗
                </button>
            </div>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
};

const DriversDashboardView = () => {
  const [drivers, setDrivers] = React.useState([
    { id: 'DRV-102', name: 'Jack Taylor', phone: '+61 412 888 456', license: 'NSW - HC Class', licenseCode: 'BGT-221', region: 'Melbourne SE', status: 'ON TRIP', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60' },
    { id: 'DRV-104', name: 'Liam Smith', phone: '+61 412 888 000', license: 'NSW - HC Class', licenseCode: 'KLY-004', region: 'Adelaide Depot', status: 'ACTIVE', img: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=60' },
    { id: 'DRV-101', name: 'Noah Williams', phone: '+61 412 888 123', license: 'NSW - MC Class', licenseCode: 'XQG-984', region: 'Sydney Metro', status: 'ACTIVE', badge: 'EDITOR', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60' },
    { id: 'DRV-103', name: 'Oliver Brown', phone: '+61 412 888 789', license: 'NSW - HR Class', licenseCode: 'NONE', region: 'Brisbane NW', status: 'OFFLINE', badge: 'EDITOR', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60' }
  ]);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [newDriver, setNewDriver] = React.useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    nationalId: '',
    address: '',
    licenseClass: 'NSW - HC (Heavy Combination)',
    licenseNumber: '',
    licenseExpiry: '',
    medicalExpiry: '',
    experience: '',
    msic: false,
    dg: false,
    whitecard: false,
    emergencyName: '',
    emergencyRelationship: 'Spouse',
    emergencyPhone: '',
    emergencyEmail: '',
    depot: 'Sydney Central Depot',
    employmentType: 'Full-time Permanent',
    shift: 'Morning (06:00 - 14:00)',
    startDate: '',
    canEditLoads: false,
    bankName: '',
    bsb: '',
    accountNumber: '',
    confirmed: false
  });

  const handleAddDriver = (e) => {
    e.preventDefault();
    if (!newDriver.confirmed) {
      alert('Please confirm all details are correct.');
      return;
    }
    const newObj = {
      id: `DRV-${100 + drivers.length + 1}`,
      name: newDriver.name || 'Anonymous Driver',
      phone: newDriver.phone || '+61 400 000 000',
      license: newDriver.licenseClass,
      licenseCode: newDriver.licenseNumber.toUpperCase() || 'REG-999',
      region: newDriver.depot.split(' ')[0] || 'Sydney Metro',
      status: 'ACTIVE',
      img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'
    };
    setDrivers([newObj, ...drivers]);
    setShowAddForm(false);
    setNewDriver({
      name: '', email: '', phone: '', dob: '', nationalId: '', address: '',
      licenseClass: 'NSW - HC (Heavy Combination)', licenseNumber: '', licenseExpiry: '',
      medicalExpiry: '', experience: '', msic: false, dg: false, whitecard: false,
      emergencyName: '', emergencyRelationship: 'Spouse', emergencyPhone: '', emergencyEmail: '',
      depot: 'Sydney Central Depot', employmentType: 'Full-time Permanent', shift: 'Morning (06:00 - 14:00)',
      startDate: '', canEditLoads: false, bankName: '', bsb: '', accountNumber: '', confirmed: false
    });
  };

  const filtered = drivers.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.region.toLowerCase().includes(search.toLowerCase()) ||
    d.id.toLowerCase().includes(search.toLowerCase())
  );

  // Render Full Screen Driver Form Builder
  if (showAddForm) {
    return (
      <div className="p-4 sm:p-8 text-left bg-gray-50/50 min-h-screen">
        {/* Header cockpit */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-200 pb-5">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => setShowAddForm(false)}
              className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 cursor-pointer shadow-xs"
            >
              <ChevronLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Add New Driver</h1>
                <span className="px-2 py-0.5 text-[9px] font-black bg-emerald-100 text-emerald-800 rounded">NEW</span>
              </div>
              <p className="text-gray-500 text-xs mt-0.5">Register a new fleet operator with full profile, documents, and work setup.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-5 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl text-xs font-extrabold text-gray-500 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handleAddDriver}
              style={{ color: '#000000', backgroundColor: '#eab308' }}
              className="px-5 py-2.5 text-gray-950 font-black rounded-xl text-xs hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:shadow-yellow-500/10"
            >
              <CheckCircle2 size={14} />
              Save Driver
            </button>
          </div>
        </div>

        <form onSubmit={handleAddDriver} className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Left Column: Personal, License, Emergency Contacts */}
          <div className="lg:col-span-2 space-y-6">
            {/* PERSONAL INFORMATION Card */}
            <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 bg-yellow-50 text-yellow-500 rounded-lg"><Users size={16} /></div>
                <div>
                  <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Personal Information</h3>
                  <span className="text-[10px] text-gray-400 block mt-0.5">BASIC IDENTITY AND CONTACT DETAILS</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Full Legal Name *</label>
                  <div className="relative">
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input 
                      type="text" required placeholder="e.g. Jack Taylor"
                      value={newDriver.name} onChange={(e) => setNewDriver({...newDriver, name: e.target.value})}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address *</label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input 
                        type="email" required placeholder="driver@company.com"
                        value={newDriver.email} onChange={(e) => setNewDriver({...newDriver, email: e.target.value})}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Mobile Phone *</label>
                    <div className="relative">
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input 
                        type="text" required placeholder="+61 412 000 000"
                        value={newDriver.phone} onChange={(e) => setNewDriver({...newDriver, phone: e.target.value})}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Date of Birth *</label>
                    <input 
                      type="date" required
                      value={newDriver.dob} onChange={(e) => setNewDriver({...newDriver, dob: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">National ID / Passport</label>
                    <input 
                      type="text" placeholder="ID or passport number"
                      value={newDriver.nationalId} onChange={(e) => setNewDriver({...newDriver, nationalId: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Home Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input 
                      type="text" placeholder="Full residential address"
                      value={newDriver.address} onChange={(e) => setNewDriver({...newDriver, address: e.target.value})}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* LICENSE & CERTIFICATIONS Card */}
            <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg"><FileText size={16} /></div>
                <div>
                  <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">License & Certifications</h3>
                  <span className="text-[10px] text-gray-400 block mt-0.5">DRIVING CREDENTIALS AND COMPLIANCE DOCUMENTS</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">License Class *</label>
                  <select 
                    value={newDriver.licenseClass} onChange={(e) => setNewDriver({...newDriver, licenseClass: e.target.value})}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none"
                  >
                    <option>NSW - HC (Heavy Combination)</option>
                    <option>NSW - MC (Multi Combination)</option>
                    <option>VIC - HR (Heavy Rigid)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">License Number *</label>
                    <input 
                      type="text" required placeholder="e.g. HR-4412"
                      value={newDriver.licenseNumber} onChange={(e) => setNewDriver({...newDriver, licenseNumber: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">License Expiry Date *</label>
                    <input 
                      type="date" required
                      value={newDriver.licenseExpiry} onChange={(e) => setNewDriver({...newDriver, licenseExpiry: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Medical Certificate Expiry</label>
                    <input 
                      type="date" 
                      value={newDriver.medicalExpiry} onChange={(e) => setNewDriver({...newDriver, medicalExpiry: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Years of Experience</label>
                    <input 
                      type="number" placeholder="e.g. 5"
                      value={newDriver.experience} onChange={(e) => setNewDriver({...newDriver, experience: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Special Certifications & Access</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2.5 text-xs text-gray-700 font-medium">
                      <input 
                        type="checkbox" checked={newDriver.msic} onChange={(e) => setNewDriver({...newDriver, msic: e.target.checked})}
                        className="rounded text-yellow-400 focus:ring-yellow-400"
                      />
                      <span>MSIC Access (Maritime Security Identification Card)</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-xs text-gray-700 font-medium">
                      <input 
                        type="checkbox" checked={newDriver.dg} onChange={(e) => setNewDriver({...newDriver, dg: e.target.checked})}
                        className="rounded text-yellow-400 focus:ring-yellow-400"
                      />
                      <span>Dangerous Goods (DG) Certificate</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-xs text-gray-700 font-medium">
                      <input 
                        type="checkbox" checked={newDriver.whitecard} onChange={(e) => setNewDriver({...newDriver, whitecard: e.target.checked})}
                        className="rounded text-yellow-400 focus:ring-yellow-400"
                      />
                      <span>Construction White Card (General Construction Induction)</span>
                    </label>
                  </div>
                </div>

                {/* Upload Buttons */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">ID / License — Front</span>
                    <button type="button" className="w-full py-2 bg-gray-50 border border-dashed border-gray-300 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-500 cursor-pointer flex items-center justify-center gap-1.5 transition-colors">
                      <Upload size={13} /> Upload front scan
                    </button>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">ID / License — Back</span>
                    <button type="button" className="w-full py-2 bg-gray-50 border border-dashed border-gray-300 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-500 cursor-pointer flex items-center justify-center gap-1.5 transition-colors">
                      <Upload size={13} /> Upload back scan
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* EMERGENCY CONTACT Card */}
            <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 bg-red-50 text-red-500 rounded-lg">❤️</div>
                <div>
                  <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Emergency Contact</h3>
                  <span className="text-[10px] text-gray-400 block mt-0.5">NEXT OF KIN OR EMERGENCY PERSON</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Contact Name *</label>
                    <div className="relative">
                      <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input 
                        type="text" required placeholder="Full name"
                        value={newDriver.emergencyName} onChange={(e) => setNewDriver({...newDriver, emergencyName: e.target.value})}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Relationship</label>
                    <select 
                      value={newDriver.emergencyRelationship} onChange={(e) => setNewDriver({...newDriver, emergencyRelationship: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none"
                    >
                      <option>Spouse</option>
                      <option>Parent</option>
                      <option>Sibling</option>
                      <option>Friend</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Contact Phone *</label>
                    <div className="relative">
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input 
                        type="text" required placeholder="+61 400 000 000"
                        value={newDriver.emergencyPhone} onChange={(e) => setNewDriver({...newDriver, emergencyPhone: e.target.value})}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Contact Email</label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input 
                        type="email" placeholder="email@example.com"
                        value={newDriver.emergencyEmail} onChange={(e) => setNewDriver({...newDriver, emergencyEmail: e.target.value})}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Photo, Setup, Permissions, Banking */}
          <div className="space-y-6">
            {/* PROFILE PHOTO Card */}
            <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs text-center">
              <div className="flex items-center gap-2 mb-6">
                <Camera size={14} className="text-gray-400" />
                <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-800">Profile Photo</h4>
              </div>

              <div className="border-2 border-dashed border-gray-200 hover:border-yellow-400 transition-colors rounded-2xl p-6 bg-gray-50/50 flex flex-col items-center justify-center cursor-pointer">
                <Camera size={28} className="text-gray-300 mb-2" />
                <span className="text-xs font-bold text-gray-700 block">Upload Driver Photo</span>
                <span className="text-[9px] text-gray-400 block mt-1">JPEG OR PNG — MAX 5MB</span>
              </div>
            </div>

            {/* WORK SETUP Card */}
            <div 
              style={{ backgroundColor: '#0B0B0B' }}
              className="rounded-2xl p-5 border border-white/5 shadow-md text-left"
            >
              <div className="flex items-center gap-2 mb-6 text-yellow-500">
                <Wrench size={14} />
                <h4 className="text-[10px] font-black uppercase tracking-wider">Work Setup</h4>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Assigned Depot *</label>
                  <select 
                    value={newDriver.depot} onChange={(e) => setNewDriver({...newDriver, depot: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-xs focus:outline-none"
                  >
                    <option className="bg-gray-950">Sydney Central Depot</option>
                    <option className="bg-gray-950">Melbourne Depot</option>
                    <option className="bg-gray-950">Brisbane Port Branch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Employment Type</label>
                  <select 
                    value={newDriver.employmentType} onChange={(e) => setNewDriver({...newDriver, employmentType: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-xs focus:outline-none"
                  >
                    <option className="bg-gray-950">Full-time Permanent</option>
                    <option className="bg-gray-950">Contractor</option>
                    <option className="bg-gray-950">Casual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Default Shift</label>
                  <select 
                    value={newDriver.shift} onChange={(e) => setNewDriver({...newDriver, shift: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-xs focus:outline-none"
                  >
                    <option className="bg-gray-950">Morning (06:00 - 14:00)</option>
                    <option className="bg-gray-950">Afternoon (14:00 - 22:00)</option>
                    <option className="bg-gray-950">Night (22:00 - 06:00)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Start Date</label>
                  <input 
                    type="date"
                    value={newDriver.startDate} onChange={(e) => setNewDriver({...newDriver, startDate: e.target.value})}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* APP & PERMISSIONS Card */}
            <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs text-left">
              <div className="flex items-center gap-2 mb-6 text-gray-800">
                <Shield size={14} className="text-gray-400" />
                <h4 className="text-[10px] font-black uppercase tracking-wider">App & Permissions</h4>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <strong className="text-xs font-bold text-gray-900 block">Can Edit Loads</strong>
                    <span className="text-[10px] text-gray-400 block mt-0.5 leading-relaxed">
                      Granting this allows the driver to modify vehicle details, stock numbers, and cargo items in active loads.
                    </span>
                  </div>
                  <input 
                    type="checkbox" checked={newDriver.canEditLoads} onChange={(e) => setNewDriver({...newDriver, canEditLoads: e.target.checked})}
                    className="rounded text-yellow-400 focus:ring-yellow-400 w-4 h-4 cursor-pointer mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-50">
                  <button 
                    type="button"
                    style={{ color: '#000000', backgroundColor: '#facc15' }}
                    className="py-1.5 rounded-lg text-[10px] font-black cursor-pointer hover:bg-yellow-500 transition-colors"
                  >
                    SMS Invite
                  </button>
                  <button type="button" className="py-1.5 border border-gray-200 rounded-lg text-[10px] font-extrabold text-gray-500 hover:bg-gray-50 transition-colors">
                    Email Invite
                  </button>
                </div>
              </div>
            </div>

            {/* BANK & PAYROLL Card */}
            <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs text-left">
              <div className="flex items-center gap-2 mb-6 text-gray-800">
                <Building size={14} className="text-gray-400" />
                <h4 className="text-[10px] font-black uppercase tracking-wider">Bank & Payroll</h4>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Bank Name</label>
                  <input 
                    type="text" placeholder="e.g. Commonwealth Bank"
                    value={newDriver.bankName} onChange={(e) => setNewDriver({...newDriver, bankName: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">BSB Number</label>
                    <input 
                      type="text" placeholder="062-000"
                      value={newDriver.bsb} onChange={(e) => setNewDriver({...newDriver, bsb: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Account Number</label>
                    <input 
                      type="text" placeholder="1234 5678"
                      value={newDriver.accountNumber} onChange={(e) => setNewDriver({...newDriver, accountNumber: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance Footer Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-[10px] text-yellow-800 space-y-1">
              <strong className="block">⚠️ Compliance Notice</strong>
              <p className="leading-relaxed">All driver profiles are subject to verification. Documents will be reviewed within 24-48 hours before activation.</p>
            </div>

            <label className="flex items-center gap-2.5 text-xs text-gray-700 font-bold justify-start py-2">
              <input 
                type="checkbox" required checked={newDriver.confirmed} onChange={(e) => setNewDriver({...newDriver, confirmed: e.target.checked})}
                className="rounded text-yellow-400 focus:ring-yellow-400 cursor-pointer"
              />
              <span>I CONFIRM ALL DETAILS ARE CORRECT AND VERIFIED</span>
            </label>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-6 text-left">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gray-100 rounded-xl text-gray-800 shadow-xs">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Drivers</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage fleet vehicle operators, credentials, and deployment zones.</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          style={{ color: '#ffffff', backgroundColor: '#eab308' }}
          className="hover:scale-[1.02] active:scale-[0.98] text-gray-900 font-extrabold py-2.5 px-5 rounded-xl transition-all flex items-center gap-2 text-sm cursor-pointer shadow-md hover:shadow-yellow-500/20"
        >
          <Plus size={16} strokeWidth={2.5} />
          New Driver
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-150 flex justify-between items-center h-24 shadow-xs">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">On Duty Now</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">18</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-500"><UserPlus size={18} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-150 flex justify-between items-center h-24 shadow-xs">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Trips</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">12</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-500"><TruckIcon size={18} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-150 flex justify-between items-center h-24 shadow-xs">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Avg Rating</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">4.85 ★</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-500"><Star size={18} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-150 flex justify-between items-center h-24 shadow-xs">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Alerts</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">02</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-red-50 text-red-500"><AlertCircle size={18} /></div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input 
              type="text" 
              placeholder="Search drivers or regions..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs w-full focus:outline-none focus:ring-1 focus:ring-yellow-400"
            />
          </div>
          <select className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 bg-white focus:outline-none cursor-pointer">
            <option>Sort: Driver Name</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4 font-medium">Identity & ID</th>
                <th className="py-3 px-4 font-medium">Credentials</th>
                <th className="py-3 px-4 font-medium">Primary Region</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(d => (
                <tr key={d.id} className="text-xs hover:bg-gray-50/50 transition-colors duration-200 group">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img src={d.img} alt={d.name} className="w-9 h-9 rounded-lg object-cover border border-gray-200" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900 group-hover:text-yellow-600 transition-colors">{d.name}</span>
                          {d.badge && (
                            <span className="px-1.5 py-0.5 text-[8px] font-black text-indigo-600 bg-indigo-50 border border-indigo-200 rounded tracking-wider">{d.badge}</span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium mt-0.5 block">{d.id} · {d.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <strong className="block text-gray-900 font-semibold">{d.license}</strong>
                    <span className="text-[10px] text-gray-400 font-medium block mt-0.5">{d.licenseCode}</span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-gray-700">{d.region}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded border ${
                      d.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                      d.status === 'ON TRIP' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                      'bg-red-50 text-red-600 border-red-200'
                    }`}>{d.status}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="px-4 py-1.5 border border-gray-200 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-800 transition-colors cursor-pointer">
                      MANAGE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ===== OPERATIONS: CUSTOMERS DASHBOARD VIEW =====
const CustomersDashboardView = () => {
  const [customers, setCustomers] = React.useState([
    { id: 'CUST-001', name: 'Acme Corp Logistics', contact: 'John Smith', email: 'john@acme.com.au', limit: '$50,000', terms: 'Net 30', loadCount: 142, amount: '$28,400', rating: 4.8, status: 'ACTIVE', img: 'https://images.unsplash.com/photo-1516576880881-14017b29a739?w=100&auto=format&fit=crop&q=60' },
    { id: 'CUST-006', name: 'Blue River Exports', contact: 'Mike Tan', email: 'mike@blueriver.com', limit: '$5,000', terms: 'Net 7', loadCount: 0, amount: '$0', rating: 2.8, status: 'SUSPENDED', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&auto=format&fit=crop&q=60' },
    { id: 'CUST-004', name: 'Fresh Markets AU', contact: 'Ben Chu', email: 'ben@freshmarkets.com', limit: '$25,000', terms: 'Net 14', loadCount: 89, amount: '$14,600', rating: 4.9, status: 'ACTIVE', img: 'https://images.unsplash.com/photo-1516576880881-14017b29a739?w=100&auto=format&fit=crop&q=60' },
    { id: 'CUST-003', name: 'Global Traders Australia', contact: 'Lucas Brown', email: 'lucas@globaltr.com', limit: '$150,000', terms: 'Net 60', loadCount: 0, amount: '$0', rating: 3.2, status: 'ON HOLD', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&auto=format&fit=crop&q=60' },
    { id: 'CUST-005', name: 'Southport Logistics', contact: 'Sarah Miller', email: 'sarah@southport.com', limit: '$80,000', terms: 'Net 30', loadCount: 204, amount: '$41,300', rating: 4.7, status: 'ACTIVE', img: 'https://images.unsplash.com/photo-1516576880881-14017b29a739?w=100&auto=format&fit=crop&q=60' },
    { id: 'CUST-002', name: 'Tech Solutions Ltd', contact: 'Emma Watson', email: 'emma@techsol.com', limit: '$10,000', terms: 'Net 14', loadCount: 38, amount: '$7,200', rating: 4.5, status: 'ACTIVE', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&auto=format&fit=crop&q=60' }
  ]);
  const [tab, setTab] = React.useState('ALL');
  const [search, setSearch] = React.useState('');
  const [showModal, setShowModal] = React.useState(false);
  const [newCust, setNewCust] = React.useState({ name: '', contact: '', email: '', limit: '', terms: 'Net 30', rating: 5.0, status: 'ACTIVE' });
  
  // Sorting State
  const [sortBy, setSortBy] = React.useState('NAME');
  const [sortAsc, setSortAsc] = React.useState(true);

  const handleAddCustomer = (e) => {
    e.preventDefault();
    const newObj = {
      id: `CUST-00${customers.length + 1}`,
      name: newCust.name || 'New B2B Client',
      contact: newCust.contact || 'Client Manager',
      email: newCust.email || 'info@client.com',
      limit: `$${parseInt(newCust.limit || 10000).toLocaleString()}`,
      terms: newCust.terms,
      loadCount: 0,
      amount: '$0',
      rating: parseFloat(newCust.rating) || 5.0,
      status: newCust.status,
      img: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=100&auto=format&fit=crop&q=60'
    };
    setCustomers([newObj, ...customers]);
    setShowModal(false);
    setNewCust({ name: '', contact: '', email: '', limit: '', terms: 'Net 30', rating: 5.0, status: 'ACTIVE' });
  };

  const filtered = customers
    .filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
      if (tab === 'ALL') return matchesSearch;
      return matchesSearch && c.status === tab;
    })
    .sort((a, b) => {
      let valA, valB;
      if (sortBy === 'NAME') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortBy === 'CREDIT') {
        valA = parseFloat(a.limit.replace(/[$,]/g, '')) || 0;
        valB = parseFloat(b.limit.replace(/[$,]/g, '')) || 0;
      } else if (sortBy === 'LOADS') {
        valA = a.loadCount || 0;
        valB = b.loadCount || 0;
      } else if (sortBy === 'RATING') {
        valA = a.rating || 0;
        valB = b.rating || 0;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

  return (
    <div className="p-2 sm:p-6 text-left">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gray-100 rounded-xl text-gray-800 shadow-xs">
            <Building size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Customer Management</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage B2B clients, credit limits, and payment terms.</p>
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ color: '#000000', backgroundColor: '#fbbf24' }}
          className="hover:scale-[1.02] active:scale-[0.98] text-gray-900 font-extrabold py-2.5 px-5 rounded-xl transition-all flex items-center gap-2 text-sm cursor-pointer shadow-md hover:shadow-yellow-500/20"
        >
          <Plus size={16} strokeWidth={2.5} />
          New Customer
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs">
        {/* Navigation Tabs and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {['ALL', 'ACTIVE', 'ON HOLD', 'SUSPENDED'].map(t => (
              <button 
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer uppercase tracking-wider transition-all duration-200 ${
                  tab === t ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {t === 'ALL' ? 'All' : t === 'ACTIVE' ? 'Active' : t === 'ON HOLD' ? 'On Hold' : 'Suspended'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-grow sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input 
                type="text" 
                placeholder="Search by Company or ID..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs w-full focus:outline-none focus:ring-1 focus:ring-yellow-400"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-yellow-400 cursor-pointer"
              >
                <option value="NAME">Sort by Name</option>
                <option value="CREDIT">Sort by Credit</option>
                <option value="LOADS">Sort by Loads</option>
                <option value="RATING">Sort by Rating</option>
              </select>
              <button 
                type="button"
                onClick={() => setSortAsc(!sortAsc)}
                className={`p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 bg-white text-gray-500 cursor-pointer flex items-center justify-center transition-all ${
                  !sortAsc ? 'bg-yellow-50 border-yellow-200 text-yellow-600' : ''
                }`}
                title={sortAsc ? "Sort Descending" : "Sort Ascending"}
              >
                <SlidersHorizontal size={14} className={`transition-transform duration-200 ${!sortAsc ? 'rotate-180 text-yellow-600' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Table list */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4 font-medium">Company</th>
                <th className="py-3 px-4 font-medium">Primary Contact</th>
                <th className="py-3 px-4 font-medium">Credit Limit</th>
                <th className="py-3 px-4 font-medium">Terms</th>
                <th className="py-3 px-4 font-medium">Loads</th>
                <th className="py-3 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(c => (
                <tr key={c.id} className="text-xs hover:bg-gray-50/50 transition-colors duration-200 group">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img src={c.img} alt={c.name} className="w-9 h-9 rounded-lg object-cover border border-gray-200" />
                      <div>
                        <span className="text-sm font-semibold text-gray-900 block group-hover:text-yellow-600 transition-colors">{c.name}</span>
                        <span className="text-[10px] text-gray-400 font-bold block mt-0.5">{c.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm font-bold text-gray-900">{c.contact}</div>
                    <span className="text-[10px] text-gray-400 font-medium block mt-0.5 flex items-center gap-1">
                      <Globe size={11} className="text-gray-400" /> {c.email}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-gray-900 text-sm">{c.limit}</td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 text-[10px] font-bold bg-gray-50 text-gray-600 border border-gray-200 rounded-lg flex items-center gap-1 w-max">
                      <FileText size={11} className="text-gray-400" /> {c.terms}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <strong className="block text-gray-900 font-bold text-sm">{c.loadCount}</strong>
                    <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">{c.amount}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1">
                        ★ {c.rating}
                      </span>
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded border uppercase ${
                        c.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        c.status === 'SUSPENDED' ? 'bg-red-50 text-red-600 border-red-200' :
                        'bg-amber-50 text-amber-600 border-amber-200'
                      }`}>{c.status}</span>
                      <button className="px-3.5 py-1.5 border border-gray-200 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-800 transition-colors cursor-pointer ml-2">
                        VIEW →
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-gray-100 max-w-md w-full p-6 shadow-xl text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-900">Add New Customer</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-1">Company/Client Name</label>
                <input 
                  type="text" required placeholder="e.g. Acme Corp Logistics"
                  value={newCust.name} onChange={(e) => setNewCust({...newCust, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-1">Contact Person</label>
                  <input 
                    type="text" required placeholder="e.g. John Smith"
                    value={newCust.contact} onChange={(e) => setNewCust({...newCust, contact: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-1">Email</label>
                  <input 
                    type="email" required placeholder="john@acme.com"
                    value={newCust.email} onChange={(e) => setNewCust({...newCust, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-1">Credit Limit ($)</label>
                  <input 
                    type="number" required placeholder="50000"
                    value={newCust.limit} onChange={(e) => setNewCust({...newCust, limit: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-1">Payment Terms</label>
                  <select 
                    value={newCust.terms} onChange={(e) => setNewCust({...newCust, terms: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none bg-white"
                  >
                    <option>Net 30</option>
                    <option>Net 14</option>
                    <option>Net 7</option>
                    <option>Net 60</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-1">Rating (Out of 5)</label>
                  <input 
                    type="number" step="0.1" max="5" required placeholder="4.8"
                    value={newCust.rating} onChange={(e) => setNewCust({...newCust, rating: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-1">Status</label>
                  <select 
                    value={newCust.status} onChange={(e) => setNewCust({...newCust, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none bg-white"
                  >
                    <option>ACTIVE</option>
                    <option>ON HOLD</option>
                    <option>SUSPENDED</option>
                  </select>
                </div>
              </div>
              <button 
                type="submit"
                style={{ color: '#000000', backgroundColor: '#fbbf24' }}
                className="w-full font-extrabold py-2.5 rounded-xl text-xs mt-2 hover:bg-yellow-500 cursor-pointer transition-colors"
              >
                SUBMIT & ADD CUSTOMER
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== OPERATIONS: ASSET INVENTORY DASHBOARD VIEW =====
const AssetInventoryDashboardView = () => {
  const [assets, setAssets] = React.useState([
    { id: '1', name: '2022 Toyota Camry', desc: 'White · Sedan · 1,450 kg', vin: '1HGCM82633A004352', plate: 'ABC 123', status: 'IN DEPOT', task: 'LD-2041', target: 'Brisbane QLD', targetSub: 'AutoDeal Pty Ltd', img: 'https://images.unsplash.com/photo-1516576880881-14017b29a739?w=600&auto=format&fit=crop&q=60' },
    { id: '2', name: '2023 Honda CR-V', desc: 'Black · SUV · 1,720 kg', vin: '2T1BURHE0JC034820', plate: 'XYZ 987', status: 'IN TRANSIT', task: 'LD-2039', target: 'Melbourne VIC', targetSub: 'Smith Motors', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=60' },
    { id: '3', name: '2024 Tesla Model S', desc: 'Red · Sedan · 2,162 kg', vin: '5YJSA1DG9PFJ12345', plate: 'EV 0001', status: 'DELIVERED', task: 'LD-2031', target: 'Sydney NSW', targetSub: 'EV Fleet Co', img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=60' },
    { id: '4', name: '2021 Ford Ranger', desc: 'Silver · Ute · 2,030 kg', vin: '3FADP4BJ7FM123456', plate: 'TRK 444', status: 'AWAITING LOAD', task: 'Available', target: 'Perth WA', targetSub: 'WA Motors', img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=60' },
    { id: '5', name: '2022 Nissan X-Trail', desc: 'Blue · SUV · 1,680 kg', vin: '1N4AL3AP7JC234567', plate: 'NIS 202', status: 'IN DEPOT', task: 'LD-2042', target: 'Adelaide SA', targetSub: 'SA Auto Group', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=60' }
  ]);
  const [search, setSearch] = React.useState('');
  const [tab, setTab] = React.useState('ALL');
  const [showModal, setShowModal] = React.useState(false);
  const [newAsset, setNewAsset] = React.useState({ name: '', desc: '', vin: '', plate: '', status: 'AWAITING LOAD', target: '', targetSub: '' });

  const handleRegisterAsset = (e) => {
    e.preventDefault();
    const newObj = {
      id: `${assets.length + 1}`,
      name: newAsset.name || 'Unnamed Asset',
      desc: newAsset.desc || 'White · Sedan · 1,500 kg',
      vin: newAsset.vin.toUpperCase() || 'VIN-TBD-00000',
      plate: newAsset.plate.toUpperCase() || 'PLATE-NEW',
      status: newAsset.status,
      task: 'Available',
      target: newAsset.target || 'Sydney NSW',
      targetSub: newAsset.targetSub || 'Central Depot',
      img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=60'
    };
    setAssets([newObj, ...assets]);
    setShowModal(false);
    setNewAsset({ name: '', desc: '', vin: '', plate: '', status: 'AWAITING LOAD', target: '', targetSub: '' });
  };

  const handleDeleteAsset = (id) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  const filtered = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.vin.toLowerCase().includes(search.toLowerCase());
    if (tab === 'ALL') return matchesSearch;
    return matchesSearch && a.status === tab;
  });

  const [viewMode, setViewMode] = React.useState('grid');

  return (
    <div className="p-2 sm:p-6 text-left">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Asset Inventory</h1>
          <p className="text-gray-500 text-sm mt-0.5">{assets.length} assets registered · Global VIN Search</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ color: '#ffffff', backgroundColor: '#111827' }}
          className="hover:scale-[1.02] active:scale-[0.98] font-extrabold py-2.5 px-5 rounded-xl transition-all flex items-center gap-2 text-sm cursor-pointer shadow-md hover:bg-black"
        >
          <Plus size={16} strokeWidth={2.5} />
          Register Asset
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-xs">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <div className="relative w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input 
              type="text" 
              placeholder="Search VIN, Plate, Make, Model, Destination..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs w-full focus:outline-none focus:ring-1 focus:ring-yellow-400"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 cursor-pointer ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-400'}`}
              >
                <List size={16} />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 cursor-pointer ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-400'}`}
              >
                <Grid size={16} />
              </button>
            </div>

            <div className="flex bg-gray-100 p-1 rounded-xl">
              {['ALL', 'AWAITING LOAD', 'IN DEPOT', 'IN TRANSIT', 'DELIVERED'].map(t => (
                <button 
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-bold cursor-pointer uppercase tracking-wider transition-all duration-200 ${
                    tab === t ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* View content layout */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm font-medium">No assets found.</div>
        ) : viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <th className="py-3 pl-3 w-10 font-normal"><input type="checkbox" className="rounded border-gray-300" /></th>
                  <th className="py-3 px-4 font-medium">Registered Asset</th>
                  <th className="py-3 px-4 font-medium">VIN / Plate</th>
                  <th className="py-3 px-4 font-medium">Operational Status</th>
                  <th className="py-3 px-4 font-medium">Current Task</th>
                  <th className="py-3 px-4 font-medium">Target</th>
                  <th className="py-3 px-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(a => (
                  <tr key={a.id} className="text-xs hover:bg-gray-50/50 transition-colors duration-200 group">
                    <td className="py-4 pl-3"><input type="checkbox" className="rounded border-gray-300" /></td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img src={a.img} alt={a.name} className="w-9 h-9 rounded-lg object-cover border border-gray-200" />
                        <div>
                          <span className="text-sm font-semibold text-gray-900 block group-hover:text-yellow-600 transition-colors">{a.name}</span>
                          <span className="text-[10px] text-gray-400 font-normal block mt-0.5">{a.desc}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 border border-gray-200 rounded bg-gray-50 font-mono text-[9px] block w-max">{a.vin}</span>
                      <span className="text-[10px] text-gray-600 font-bold block mt-1">{a.plate}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg tracking-wider border ${
                        a.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                        a.status === 'IN TRANSIT' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        a.status === 'IN DEPOT' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>{a.status}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-semibold ${a.task === 'Available' ? 'text-gray-400' : 'text-blue-600 font-extrabold hover:underline cursor-pointer'}`}>
                        {a.task}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-800">{a.target}</div>
                      <span className="text-[10px] text-gray-400 block mt-0.5">{a.targetSub}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button className="p-1.5 border border-gray-200 rounded-lg text-indigo-500 hover:bg-indigo-50 transition-colors cursor-pointer"><Edit size={14} /></button>
                        <button 
                          onClick={() => handleDeleteAsset(a.id)}
                          className="p-1.5 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {filtered.map(a => {
              const isDarkBg = a.id === '5';
              const nameParts = a.name.split(' ');
              const yearModel = nameParts[0];
              const makeModel = nameParts.slice(1).join(' ');
              
              return (
                <div key={a.id} className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs hover:border-yellow-400 hover:shadow-yellow-500/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between">
                  {/* Top card block with image or dark solid background */}
                  <div className={`relative h-44 p-5 flex flex-col justify-between ${isDarkBg ? 'bg-[#0B0B0B]' : ''}`} style={!isDarkBg ? { backgroundImage: `url(${a.img})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                    {/* Dark overlay for readability on image backgrounds */}
                    {!isDarkBg && <div className="absolute inset-0 bg-black/40 z-0" />}

                    {/* Checkbox and Status Badge Row */}
                    <div className="flex justify-between items-center z-10 relative">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400 cursor-pointer bg-white"
                      />
                      <span className={`px-2.5 py-0.5 text-[9px] font-extrabold rounded-full bg-white tracking-wider border shadow-xs ${
                        a.status === 'DELIVERED' ? 'text-emerald-600 border-emerald-100' :
                        a.status === 'IN TRANSIT' ? 'text-amber-600 border-amber-100' :
                        a.status === 'IN DEPOT' ? 'text-blue-600 border-blue-100' :
                        'text-gray-500 border-gray-100'
                      }`}>{a.status}</span>
                    </div>

                    {/* Make & VIN details overlay */}
                    <div className="z-10 relative text-left">
                      <h4 className="text-lg font-bold text-white tracking-tight leading-tight">{yearModel} {makeModel}</h4>
                      <p className="text-[10px] text-gray-300 font-mono tracking-wider mt-0.5">{a.vin}</p>
                    </div>
                  </div>

                  {/* Bottom details block */}
                  <div className="p-5 text-left flex flex-col justify-between flex-grow">
                    {/* Destination & Plate details row */}
                    <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4 mb-4">
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Target Office</span>
                        <strong className="text-xs font-bold text-gray-800 block mt-1">{a.target}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Plate</span>
                        <strong className="text-xs font-bold text-gray-800 uppercase block mt-1">{a.plate}</strong>
                      </div>
                    </div>

                    {/* Asset Type Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Truck size={14} className="text-gray-400" />
                        <div className="text-left">
                          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block">Type</span>
                          <strong className="text-xs font-bold text-gray-800 block mt-0.5">{a.desc.split(' · ')[1] || 'Sedan'}</strong>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 hover:border-yellow-200 transition-all cursor-pointer">
                          <Edit size={12} />
                        </button>
                        <button 
                          onClick={() => handleDeleteAsset(a.id)}
                          className="p-1.5 border border-gray-200 rounded-lg text-red-500 hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Register Asset Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-gray-100 max-w-md w-full p-6 shadow-xl text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-900">Register Asset</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={18} /></button>
            </div>
            <form onSubmit={handleRegisterAsset} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-1">Asset Model Name</label>
                <input 
                  type="text" required placeholder="e.g. 2024 Tesla Model S"
                  value={newAsset.name} onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-1">Specification / Weight</label>
                <input 
                  type="text" required placeholder="e.g. Red · Sedan · 2,162 kg"
                  value={newAsset.desc} onChange={(e) => setNewAsset({...newAsset, desc: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-1">VIN Code</label>
                  <input 
                    type="text" required placeholder="e.g. 5YJSA1DG9PFJ12345"
                    value={newAsset.vin} onChange={(e) => setNewAsset({...newAsset, vin: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-1">Plate Number</label>
                  <input 
                    type="text" required placeholder="e.g. EV 0001"
                    value={newAsset.plate} onChange={(e) => setNewAsset({...newAsset, plate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-1">Target Location</label>
                  <input 
                    type="text" required placeholder="e.g. Sydney NSW"
                    value={newAsset.target} onChange={(e) => setNewAsset({...newAsset, target: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-1">Operator/Depot Agency</label>
                  <input 
                    type="text" required placeholder="e.g. EV Fleet Co"
                    value={newAsset.targetSub} onChange={(e) => setNewAsset({...newAsset, targetSub: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-1">Operational Status</label>
                <select 
                  value={newAsset.status} onChange={(e) => setNewAsset({...newAsset, status: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none bg-white"
                >
                  <option>AWAITING LOAD</option>
                  <option>IN DEPOT</option>
                  <option>IN TRANSIT</option>
                  <option>DELIVERED</option>
                </select>
              </div>
              <button 
                type="submit"
                style={{ color: '#ffffff', backgroundColor: '#111827' }}
                className="w-full font-extrabold py-2.5 rounded-xl text-xs mt-2 hover:bg-black cursor-pointer transition-colors"
              >
                SUBMIT & REGISTER ASSET
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== OPERATIONS: SAFETY CHECKLISTS DASHBOARD VIEW =====
const SafetyChecklistsDashboardView = () => {
  const [checklists, setChecklists] = React.useState([
    { id: 'CL-001', name: 'Standard Pre-Trip', status: 'ACTIVE', enforce: 'STRICT EXECUTION', users: 'All Drivers', schedule: 'Every Trip', items: '6 items · 5 required' },
    { id: 'CL-002', name: 'Dangerous Goods Check', status: 'ACTIVE', enforce: 'STRICT EXECUTION', users: 'DG Certified Drivers', schedule: 'DG Loads Only', items: '5 items · 5 required' },
    { id: 'CL-003', name: 'Cold Chain Monitoring', status: 'INACTIVE', enforce: 'STRICT EXECUTION', users: 'Reefer Vehicle Drivers', schedule: 'Cold Chain Loads', items: '3 items · 3 required' }
  ]);
  const [showModal, setShowModal] = React.useState(false);
  const [newChecklist, setNewChecklist] = React.useState({ name: '', users: 'All Drivers', schedule: 'Every Trip', items: '5 items · 4 required' });

  const handleAddChecklist = (e) => {
    e.preventDefault();
    const newObj = {
      id: `CL-00${checklists.length + 1}`,
      name: newChecklist.name || 'Custom Safety Inspection',
      status: 'ACTIVE',
      enforce: 'STRICT EXECUTION',
      users: newChecklist.users,
      schedule: newChecklist.schedule,
      items: newChecklist.items
    };
    setChecklists([...checklists, newObj]);
    setShowModal(false);
    setNewChecklist({ name: '', users: 'All Drivers', schedule: 'Every Trip', items: '5 items · 4 required' });
  };

  const toggleChecklist = (id) => {
    setChecklists(checklists.map(c => c.id === id ? { ...c, status: c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : c));
  };

  const deleteChecklist = (id) => {
    setChecklists(checklists.filter(c => c.id !== id));
  };

  return (
    <div className="p-2 sm:p-6 text-left">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gray-100 rounded-xl text-gray-800 shadow-xs">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Safety Checklists</h1>
            <p className="text-gray-500 text-sm mt-0.5">Build and manage pre-trip safety checklists. Active checklists block drivers from starting trips.</p>
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ color: '#ffffff', backgroundColor: '#eab308' }}
          className="hover:scale-[1.02] active:scale-[0.98] text-gray-900 font-extrabold py-2.5 px-5 rounded-xl transition-all flex items-center gap-2 text-sm cursor-pointer shadow-md hover:shadow-yellow-500/20"
        >
          <Plus size={16} strokeWidth={2.5} />
          New Checklist
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-center h-24 shadow-xs">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Checklists</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{checklists.length}</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-gray-50 text-gray-500"><Clipboard size={18} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-center h-24 shadow-xs">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active & Enforced</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">
              {checklists.filter(c => c.status === 'ACTIVE').length}
            </h3>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-500"><Zap size={18} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-center h-24 shadow-xs">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Trips Blocked Today</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1 text-red-500">3</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-red-50 text-red-500"><AlertCircle size={18} /></div>
        </div>
      </div>

      {/* Alert Banner */}
      <div 
        style={{ color: '#ffffff', backgroundColor: '#111827' }}
        className="p-4 rounded-xl flex items-center justify-between mb-8 animate-pulse shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-400/10 text-yellow-400 rounded-lg"><ShieldAlert size={20} /></div>
          <div>
            <h4 className="text-xs font-black text-yellow-400 uppercase tracking-wider">Trip Block Enforcement Active</h4>
            <p style={{ color: '#d1d5db' }} className="text-[11px] mt-0.5">Drivers cannot start a trip until all required checklist items are completed. {checklists.filter(c => c.status === 'ACTIVE').length} checklists currently enforced.</p>
          </div>
        </div>
        <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase px-2 py-0.5 bg-emerald-500/10 rounded">Live</span>
      </div>

      {/* List cards */}
      <div className="space-y-4">
        {checklists.map(c => (
          <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 text-gray-400 rounded-xl"><Clipboard size={20} /></div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900">{c.name}</span>
                  <span className="text-[10px] text-gray-400 font-bold">{c.id}</span>
                  <span className={`px-1.5 py-0.5 text-[8px] font-black rounded ${
                    c.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-gray-50 text-gray-400 border border-gray-200'
                  }`}>{c.status}</span>
                  <span className="px-1.5 py-0.5 text-[8px] font-black bg-red-50 text-red-600 border border-red-200 rounded">{c.enforce}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium mt-1.5">
                  <span>👤 {c.users}</span>
                  <span>⚡ {c.schedule}</span>
                  <span>📊 {c.items}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-3.5 py-1.5 text-xs text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">Preview</button>
              <button className="p-1.5 text-gray-400 hover:bg-gray-50 rounded-lg cursor-pointer"><Edit size={14} /></button>
              <button 
                onClick={() => toggleChecklist(c.id)}
                className={`px-4 py-1.5 border rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  c.status === 'ACTIVE'
                    ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                    : 'border-gray-200 text-gray-400 hover:bg-gray-50'
                }`}
              >
                {c.status === 'ACTIVE' ? 'Disable' : 'Enable'}
              </button>
              <button onClick={() => deleteChecklist(c.id)} className="p-1.5 text-gray-300 hover:text-red-500 cursor-pointer transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create safety checklist modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-gray-100 max-w-md w-full p-6 shadow-xl text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-900">Create Safety Checklist</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddChecklist} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-1">Checklist Title</label>
                <input 
                  type="text" required placeholder="e.g. Hazardous Materials Check"
                  value={newChecklist.name} onChange={(e) => setNewChecklist({...newChecklist, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-1">Target Operators</label>
                <input 
                  type="text" required placeholder="e.g. DG Certified Drivers"
                  value={newChecklist.users} onChange={(e) => setNewChecklist({...newChecklist, users: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-1">Enforcement Schedule</label>
                  <input 
                    type="text" required placeholder="e.g. Every DG Load"
                    value={newChecklist.schedule} onChange={(e) => setNewChecklist({...newChecklist, schedule: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-1">Items Count</label>
                  <input 
                    type="text" required placeholder="e.g. 5 items · 5 required"
                    value={newChecklist.items} onChange={(e) => setNewChecklist({...newChecklist, items: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                  />
                </div>
              </div>
              <button 
                type="submit"
                style={{ color: '#000000', backgroundColor: '#fbbf24' }}
                className="w-full font-extrabold py-2.5 rounded-xl text-xs mt-2 hover:bg-yellow-500 cursor-pointer transition-colors"
              >
                CREATE & ACTIVATE CHECKLIST
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== OPERATIONS: EXCEPTIONS DASHBOARD VIEW =====
const ExceptionsDashboardView = () => {
  const [exceptions, setExceptions] = React.useState([
    { 
      id: 'EXP-101', 
      loadId: 'SHP-9039', 
      time: '14 mins ago',
      type: 'Location Problem', 
      severity: 'HIGH', 
      source: 'GPS',
      reportedBy: 'Liam Smith', 
      desc: 'The driver is in the wrong place for this drop-off.', 
      status: 'UNRESOLVED',
      iconType: 'pin'
    },
    { 
      id: 'EXP-102', 
      loadId: 'SHP-9011', 
      time: '41 mins ago',
      type: 'Temperature Alert', 
      severity: 'CRITICAL', 
      source: 'Sensor',
      reportedBy: 'Oliver Brown', 
      desc: 'The truck storage is too warm for the items.', 
      status: 'UNRESOLVED',
      iconType: 'sensor'
    },
    { 
      id: 'EXP-103', 
      loadId: 'SHP-8992', 
      time: '2 hrs ago',
      type: 'Customer Refusal', 
      severity: 'MEDIUM', 
      source: 'Customer',
      reportedBy: 'Noah Williams', 
      desc: 'The client did not want to take the items today.', 
      status: 'UNRESOLVED',
      iconType: 'customer'
    }
  ]);

  const [activeDropdownId, setActiveDropdownId] = React.useState(null);

  const updateExceptionStatus = (id, newStatus) => {
    setExceptions(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
    setActiveDropdownId(null);
  };

  return (
    <div className="p-2 sm:p-6 text-left max-w-5xl mx-auto">
      {/* Exceptions Card List */}
      <div className="space-y-4 mb-6">
        {exceptions.map(e => {
          const isDropdownOpen = activeDropdownId === e.id;
          
          return (
            <div 
              key={e.id} 
              className="bg-white rounded-2xl border border-gray-150 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs relative"
            >
              {/* Left Column: Time & Shipment ID */}
              <div className="flex items-center gap-4 sm:w-48 shrink-0">
                <div className="text-left">
                  <span className="text-xs font-semibold text-gray-400 block">{e.time}</span>
                  <span className="text-sm font-bold text-gray-800 hover:text-yellow-600 transition-colors cursor-pointer mt-1 block flex items-center gap-1">
                    {e.loadId} <span className="text-gray-300">›</span>
                  </span>
                </div>

                {/* Left Status Icon Circle */}
                <div className={`p-2.5 rounded-full shrink-0 ${
                  e.iconType === 'pin' ? 'bg-red-50 text-red-500' :
                  e.iconType === 'sensor' ? 'bg-amber-50 text-amber-500' :
                  'bg-blue-50 text-blue-500'
                }`}>
                  {e.iconType === 'pin' ? <MapPin size={18} /> :
                   e.iconType === 'sensor' ? <TruckIcon size={18} /> :
                   <User size={18} />}
                </div>
              </div>

              {/* Middle Column: Details, Priority & Status badges */}
              <div className="flex-grow text-left">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider ${
                    e.severity === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'
                  }`}>{e.severity}</span>
                  <span className="text-[10px] font-bold text-gray-400 italic">{e.source}</span>
                  {e.status !== 'UNRESOLVED' && (
                    <span className={`px-2 py-0.5 text-[9px] font-black rounded border uppercase ${
                      e.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                      e.status === 'DELIVER AGAIN' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                      e.status === 'RETURN TO DEPOT' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                      'bg-red-50 text-red-600 border-red-200'
                    }`}>{e.status}</span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-gray-900 leading-tight">{e.type}</h4>
                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                  {e.desc} <span className="text-gray-300 mx-1.5">•</span> Driver: <strong className="font-bold text-gray-700">{e.reportedBy}</strong>
                </p>
              </div>

              {/* Right Column: Interactive Dropdown Action */}
              <div className="relative shrink-0 sm:text-right">
                <button
                  type="button"
                  onClick={() => setActiveDropdownId(isDropdownOpen ? null : e.id)}
                  style={{ color: '#000000', backgroundColor: '#fbbf24' }}
                  className="hover:bg-yellow-500 text-xs font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  UPDATE STATUS
                  <SlidersHorizontal size={12} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-90' : ''}`} />
                </button>

                {/* Dropdown Options Box */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 bg-white border border-gray-150 rounded-2xl shadow-xl z-50 p-2 w-64 text-left animate-in fade-in slide-in-from-top-1 duration-150">
                    <button
                      type="button"
                      onClick={() => updateExceptionStatus(e.id, 'RESOLVED')}
                      className="w-full p-2.5 rounded-xl hover:bg-gray-50 flex items-start gap-3 transition-colors cursor-pointer text-left"
                    >
                      <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-full shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <div>
                        <strong className="block text-xs font-bold text-gray-800">MARK RESOLVED</strong>
                        <span className="text-[10px] text-gray-400 font-medium">Issue is fully fixed</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateExceptionStatus(e.id, 'DELIVER AGAIN')}
                      className="w-full p-2.5 rounded-xl hover:bg-gray-50 flex items-start gap-3 transition-colors cursor-pointer text-left"
                    >
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-full shrink-0">
                        <RefreshCw size={12} strokeWidth={3} />
                      </div>
                      <div>
                        <strong className="block text-xs font-bold text-gray-800">DELIVER AGAIN</strong>
                        <span className="text-[10px] text-gray-400 font-medium">Retry delivery attempt</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateExceptionStatus(e.id, 'RETURN TO DEPOT')}
                      className="w-full p-2.5 rounded-xl hover:bg-gray-50 flex items-start gap-3 transition-colors cursor-pointer text-left"
                    >
                      <div className="p-1.5 bg-amber-50 text-amber-600 rounded-full shrink-0">
                        <RotateCcw size={12} strokeWidth={3} />
                      </div>
                      <div>
                        <strong className="block text-xs font-bold text-gray-800">RETURN TO DEPOT</strong>
                        <span className="text-[10px] text-gray-400 font-medium">Bring back to branch</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateExceptionStatus(e.id, 'DAMAGED')}
                      className="w-full p-2.5 rounded-xl hover:bg-gray-50 flex items-start gap-3 transition-colors cursor-pointer text-left"
                    >
                      <div className="p-1.5 bg-red-50 text-red-600 rounded-full shrink-0">
                        <Box size={12} strokeWidth={3} />
                      </div>
                      <div>
                        <strong className="block text-xs font-bold text-gray-800">MARK DAMAGED</strong>
                        <span className="text-[10px] text-gray-400 font-medium">Report items broken</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Notice Info Banner */}
      <div className="bg-[#0a0f1d] text-gray-300 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
        <div className="p-2 bg-yellow-400/10 text-yellow-400 rounded-full shrink-0">
          <AlertCircle size={18} />
        </div>
        <p className="text-[11px] leading-relaxed text-left">
          Issues now display their status in the middle column next to the priority. Track and clear resolved issues using the status logs.
        </p>
      </div>
    </div>
  );
};

// ============================================================
// FINANCE DASHBOARD VIEW
// ============================================================
const FinanceDashboardView = () => {
  const [activeSubTab, setActiveSubTab] = React.useState('overview');
  const [toastMsg, setToastMsg] = React.useState('');
  const triggerToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); };

  const kpis = [
    { label: 'Total Revenue (MTD)', value: '$1,248,400', change: '+12.4%', up: true, icon: DollarSign, color: 'emerald' },
    { label: 'Total Expenses (MTD)', value: '$842,150', change: '+5.2%', up: false, icon: TrendingDown, color: 'red' },
    { label: 'Gross Profit', value: '$406,250', change: '+22.1%', up: true, icon: TrendingUp, color: 'blue' },
    { label: 'Pending Invoices', value: '38', change: '-8 since last week', up: true, icon: FileText, color: 'yellow' },
    { label: 'Outstanding Balance', value: '$184,320', change: 'Across 18 clients', up: false, icon: AlertCircle, color: 'orange' },
  ];

  const invoices = [
    { id: 'INV-10421', client: 'Sunstate Logistics', date: '06/28/2026', amount: '$18,400', status: 'Paid' },
    { id: 'INV-10420', client: 'Pacific Freight Co.', date: '06/27/2026', amount: '$24,800', status: 'Pending' },
    { id: 'INV-10419', client: 'Metro Transport', date: '06/26/2026', amount: '$9,200', status: 'Overdue' },
    { id: 'INV-10418', client: 'BlueSky Carriers', date: '06/25/2026', amount: '$31,000', status: 'Paid' },
    { id: 'INV-10417', client: 'Eagle Haulage', date: '06/24/2026', amount: '$12,600', status: 'Pending' },
    { id: 'INV-10416', client: 'Diamond Logistics', date: '06/23/2026', amount: '$7,350', status: 'Paid' },
  ];

  const expenses = [
    { id: 'EXP-501', category: 'Fuel & Diesel', vendor: 'Shell Fleet Card', date: '06/28/2026', amount: '$48,200', status: 'Approved' },
    { id: 'EXP-502', category: 'Driver Wages', vendor: 'Payroll System', date: '06/27/2026', amount: '$124,800', status: 'Approved' },
    { id: 'EXP-503', category: 'Vehicle Maintenance', vendor: 'Volvo Service Centre', date: '06/26/2026', amount: '$14,200', status: 'Pending' },
    { id: 'EXP-504', category: 'Insurance Premium', vendor: 'Allianz Commercial', date: '06/25/2026', amount: '$8,400', status: 'Approved' },
    { id: 'EXP-505', category: 'Toll Charges', vendor: 'Linkt Tolls', date: '06/24/2026', amount: '$2,180', status: 'Approved' },
  ];

  const monthlyRevenue = [820, 940, 1050, 980, 1120, 1248];
  const monthlyExpenses = [620, 710, 790, 750, 810, 842];
  const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const maxVal = Math.max(...monthlyRevenue);

  const statusColor = (s) => {
    if (s === 'Paid' || s === 'Approved') return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (s === 'Pending') return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (s === 'Overdue') return 'text-red-600 bg-red-50 border-red-200';
    return 'text-slate-600 bg-slate-100';
  };

  const subTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'pl', label: 'P&L Statement' },
  ];

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xl animate-fade-in">{toastMsg}</div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-emerald-500" /> Finance
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Revenue, expenses, invoices & P&L tracking across all operations.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => triggerToast('Exporting finance report as PDF...')} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer shadow-xs">
            <Download className="h-4 w-4" /> Export Report
          </button>
          <button onClick={() => triggerToast('Adding new invoice...')} className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-xl text-sm font-bold text-gray-900 transition-all cursor-pointer shadow-xs">
            <Plus className="h-4 w-4" /> New Invoice
          </button>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {subTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeSubTab === tab.id ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {kpis.map((kpi, i) => {
              const Icon = kpi.icon;
              const colorMap = { emerald: 'bg-emerald-50 text-emerald-600', red: 'bg-red-50 text-red-600', blue: 'bg-blue-50 text-blue-600', yellow: 'bg-yellow-50 text-yellow-600', orange: 'bg-orange-50 text-orange-600' };
              return (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-xl ${colorMap[kpi.color]}`}><Icon className="h-4 w-4" /></div>
                    <span className={`text-xs font-bold ${kpi.up ? 'text-emerald-600' : 'text-red-500'}`}>{kpi.change}</span>
                  </div>
                  <div className="text-2xl font-black text-gray-900">{kpi.value}</div>
                  <div className="text-xs text-gray-400 font-medium mt-0.5">{kpi.label}</div>
                </div>
              );
            })}
          </div>

          {/* Revenue vs Expenses Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-gray-900">Revenue vs Expenses</h3>
                <div className="flex gap-3 text-xs font-semibold">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span>Revenue</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400"></span>Expenses</span>
                </div>
              </div>
              <div className="flex items-end gap-3 h-40">
                {months.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex gap-0.5 items-end">
                      <div className="flex-1 bg-emerald-500 rounded-t-lg transition-all" style={{ height: `${(monthlyRevenue[i] / maxVal) * 140}px` }} />
                      <div className="flex-1 bg-red-400 rounded-t-lg transition-all" style={{ height: `${(monthlyExpenses[i] / maxVal) * 140}px` }} />
                    </div>
                    <span className="text-[10px] text-gray-400 font-semibold">{m}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* P&L Summary */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-4">
              <h3 className="font-black text-gray-900">P&L Summary</h3>
              <div className="space-y-3">
                {[
                  { label: 'Gross Revenue', value: '$1,248,400', color: 'text-emerald-600' },
                  { label: 'Operating Expenses', value: '($842,150)', color: 'text-red-500' },
                  { label: 'Gross Profit', value: '$406,250', color: 'text-blue-600' },
                  { label: 'Tax Liability (30%)', value: '($121,875)', color: 'text-orange-500' },
                  { label: 'Net Profit', value: '$284,375', color: 'text-gray-900 font-black text-lg' },
                ].map((item, i) => (
                  <div key={i} className={`flex justify-between items-center ${i === 4 ? 'pt-3 border-t border-gray-200' : ''}`}>
                    <span className="text-sm text-gray-500">{item.label}</span>
                    <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-gray-900">Recent Invoices</h3>
              <button onClick={() => setActiveSubTab('invoices')} className="text-xs text-blue-600 font-bold hover:underline cursor-pointer">View All →</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100">
                  {['Invoice ID', 'Client', 'Date', 'Amount', 'Status', 'Actions'].map(h => <th key={h} className="text-left py-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>)}
                </tr></thead>
                <tbody>
                  {invoices.slice(0, 4).map((inv, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-3 font-bold text-gray-900 font-mono text-xs">{inv.id}</td>
                      <td className="py-3 px-3 text-gray-700 font-semibold">{inv.client}</td>
                      <td className="py-3 px-3 text-gray-500">{inv.date}</td>
                      <td className="py-3 px-3 font-black text-gray-900">{inv.amount}</td>
                      <td className="py-3 px-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${statusColor(inv.status)}`}>{inv.status}</span></td>
                      <td className="py-3 px-3">
                        <button onClick={() => triggerToast(`Viewing ${inv.id}...`)} className="text-xs text-blue-600 font-bold hover:underline cursor-pointer mr-2">View</button>
                        <button onClick={() => triggerToast(`Downloading ${inv.id} PDF...`)} className="text-xs text-gray-500 font-bold hover:underline cursor-pointer">PDF</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeSubTab === 'invoices' && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-gray-900">All Invoices</h3>
            <button onClick={() => triggerToast('Creating new invoice...')} className="flex items-center gap-1 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 rounded-lg text-xs font-bold text-gray-900 cursor-pointer"><Plus className="h-3.5 w-3.5" /> New Invoice</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                {['Invoice ID', 'Client', 'Date', 'Amount', 'Status', 'Actions'].map(h => <th key={h} className="text-left py-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>)}
              </tr></thead>
              <tbody>
                {invoices.map((inv, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 font-bold text-gray-900 font-mono text-xs">{inv.id}</td>
                    <td className="py-3 px-3 text-gray-700 font-semibold">{inv.client}</td>
                    <td className="py-3 px-3 text-gray-500">{inv.date}</td>
                    <td className="py-3 px-3 font-black text-gray-900">{inv.amount}</td>
                    <td className="py-3 px-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${statusColor(inv.status)}`}>{inv.status}</span></td>
                    <td className="py-3 px-3 flex gap-2">
                      <button onClick={() => triggerToast(`Viewing ${inv.id}`)} className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg cursor-pointer">View</button>
                      <button onClick={() => triggerToast(`Downloading ${inv.id} PDF...`)} className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg cursor-pointer">PDF</button>
                      {inv.status === 'Pending' && <button onClick={() => triggerToast(`Sending reminder for ${inv.id}`)} className="px-2.5 py-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 text-xs font-bold rounded-lg cursor-pointer">Remind</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeSubTab === 'expenses' && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-gray-900">Expense Registry</h3>
            <button onClick={() => triggerToast('Adding expense entry...')} className="flex items-center gap-1 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 rounded-lg text-xs font-bold text-gray-900 cursor-pointer"><Plus className="h-3.5 w-3.5" /> Add Expense</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                {['Expense ID', 'Category', 'Vendor', 'Date', 'Amount', 'Status', 'Action'].map(h => <th key={h} className="text-left py-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>)}
              </tr></thead>
              <tbody>
                {expenses.map((exp, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 font-mono text-xs text-gray-500">{exp.id}</td>
                    <td className="py-3 px-3 font-bold text-gray-900">{exp.category}</td>
                    <td className="py-3 px-3 text-gray-600">{exp.vendor}</td>
                    <td className="py-3 px-3 text-gray-500">{exp.date}</td>
                    <td className="py-3 px-3 font-black text-gray-900">{exp.amount}</td>
                    <td className="py-3 px-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${statusColor(exp.status)}`}>{exp.status}</span></td>
                    <td className="py-3 px-3">
                      <button onClick={() => triggerToast(`Viewing expense ${exp.id}`)} className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg cursor-pointer">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* P&L Statement Tab */}
      {activeSubTab === 'pl' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Revenue Breakdown */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
              <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-500" /> Revenue Streams</h3>
              <div className="space-y-3">
                {[
                  { name: 'Freight Revenue', amount: '$842,400', pct: 67 },
                  { name: 'Car Carrying', amount: '$284,000', pct: 23 },
                  { name: 'Warehousing', amount: '$82,000', pct: 7 },
                  { name: 'Other Income', amount: '$40,000', pct: 3 },
                ].map((r, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-gray-700">{r.name}</span>
                      <span className="text-gray-900 font-bold">{r.amount}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${r.pct}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
              <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2"><TrendingDown className="h-4 w-4 text-red-500" /> Expense Breakdown</h3>
              <div className="space-y-3">
                {[
                  { name: 'Driver Wages', amount: '$312,000', pct: 37 },
                  { name: 'Fuel & Diesel', amount: '$198,400', pct: 24 },
                  { name: 'Vehicle Maintenance', amount: '$124,800', pct: 15 },
                  { name: 'Insurance', amount: '$84,000', pct: 10 },
                  { name: 'Toll & Levies', amount: '$42,500', pct: 5 },
                  { name: 'Admin & Overheads', amount: '$80,450', pct: 9 },
                ].map((e, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-gray-700">{e.name}</span>
                      <span className="text-gray-900 font-bold">{e.amount}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-red-400 rounded-full" style={{ width: `${e.pct}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Full P&L Table */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-gray-900">Profit & Loss Statement — FY 2026</h3>
              <button onClick={() => triggerToast('Exporting P&L statement as PDF...')} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 rounded-lg cursor-pointer"><Download className="h-3.5 w-3.5" /> Export PDF</button>
            </div>
            <div className="space-y-1">
              {[
                { label: 'REVENUE', value: '', bold: true, section: true },
                { label: 'Freight & Car Carrying Revenue', value: '$1,126,400', bold: false },
                { label: 'Warehousing & Storage Revenue', value: '$82,000', bold: false },
                { label: 'Other Operating Income', value: '$40,000', bold: false },
                { label: 'Total Revenue', value: '$1,248,400', bold: true },
                { label: '', value: '', bold: false, divider: true },
                { label: 'EXPENSES', value: '', bold: true, section: true },
                { label: 'Driver Wages & Payroll', value: '($312,000)', bold: false },
                { label: 'Fuel, Diesel & Tolls', value: '($240,900)', bold: false },
                { label: 'Vehicle Maintenance & Repairs', value: '($124,800)', bold: false },
                { label: 'Commercial Insurance Premiums', value: '($84,000)', bold: false },
                { label: 'Admin, IT & Overheads', value: '($80,450)', bold: false },
                { label: 'Total Expenses', value: '($842,150)', bold: true },
                { label: '', value: '', bold: false, divider: true },
                { label: 'GROSS PROFIT', value: '$406,250', bold: true },
                { label: 'Tax Provision (30%)', value: '($121,875)', bold: false },
                { label: 'NET PROFIT AFTER TAX', value: '$284,375', bold: true, highlight: true },
              ].map((row, i) => (
                row.divider ? <div key={i} className="border-t border-gray-200 my-2" /> :
                <div key={i} className={`flex justify-between py-1.5 px-2 rounded-lg ${
                  row.section ? 'bg-gray-50' : row.highlight ? 'bg-emerald-50' : 'hover:bg-gray-50'
                }`}>
                  <span className={`text-sm ${ row.section ? 'text-xs text-gray-400 uppercase font-black tracking-wider' : row.bold ? 'font-black text-gray-900' : 'text-gray-600'}`}>{row.label}</span>
                  <span className={`text-sm font-black ${ row.highlight ? 'text-emerald-600 text-base' : row.bold ? 'text-gray-900' : 'text-gray-700'}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// USER ROLES DASHBOARD VIEW
// ============================================================
const UserRolesDashboardView = () => {
  const [toastMsg, setToastMsg] = React.useState('');
  const triggerToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); };
  const [search, setSearch] = React.useState('');
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [activeSubTab, setActiveSubTab] = React.useState('users');

  const [users, setUsers] = React.useState([
    { id: 'USR-001', name: 'Rajiv Mehta', email: 'rajiv.m@herologistics.com', role: 'Company Admin', status: 'Active', lastLogin: '30 Jun 2026, 09:42 AM', branch: 'Sydney HQ' },
    { id: 'USR-002', name: 'Sarah Collins', email: 'sarah.c@herologistics.com', role: 'Dispatcher', status: 'Active', lastLogin: '30 Jun 2026, 08:15 AM', branch: 'Melbourne Depot' },
    { id: 'USR-003', name: 'Tom Zhang', email: 'tom.z@herologistics.com', role: 'Driver', status: 'Active', lastLogin: '30 Jun 2026, 07:50 AM', branch: 'Brisbane Terminal' },
    { id: 'USR-004', name: 'Linda Park', email: 'linda.p@herologistics.com', role: 'Accounts', status: 'Active', lastLogin: '29 Jun 2026, 04:20 PM', branch: 'Sydney HQ' },
    { id: 'USR-005', name: 'Michael Chen', email: 'michael.c@herologistics.com', role: 'Warehouse Manager', status: 'Active', lastLogin: '29 Jun 2026, 02:10 PM', branch: 'Adelaide Depot' },
    { id: 'USR-006', name: 'Jessica Nguyen', email: 'jessica.n@herologistics.com', role: 'Driver', status: 'Inactive', lastLogin: '25 Jun 2026, 11:00 AM', branch: 'Perth Branch' },
    { id: 'USR-007', name: 'Dave Wilson', email: 'dave.w@herologistics.com', role: 'Sales', status: 'Active', lastLogin: '30 Jun 2026, 10:05 AM', branch: 'Sydney HQ' },
    { id: 'USR-008', name: 'Priya Sharma', email: 'priya.s@herologistics.com', role: 'Yard Attendant', status: 'Active', lastLogin: '30 Jun 2026, 06:30 AM', branch: 'Melbourne Depot' },
  ]);

  const roleColors = {
    'Company Admin': 'bg-purple-50 text-purple-700 border-purple-200',
    'Dispatcher': 'bg-blue-50 text-blue-700 border-blue-200',
    'Driver': 'bg-green-50 text-green-700 border-green-200',
    'Accounts': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Warehouse Manager': 'bg-orange-50 text-orange-700 border-orange-200',
    'Sales': 'bg-pink-50 text-pink-700 border-pink-200',
    'Yard Attendant': 'bg-teal-50 text-teal-700 border-teal-200',
    'Customer': 'bg-gray-50 text-gray-700 border-gray-200',
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const rolePermissions = [
    { role: 'Company Admin', loads: true, finance: true, users: true, fleet: true, settings: true, reports: true },
    { role: 'Dispatcher', loads: true, finance: false, users: false, fleet: true, settings: false, reports: true },
    { role: 'Driver', loads: true, finance: false, users: false, fleet: false, settings: false, reports: false },
    { role: 'Accounts', loads: true, finance: true, users: false, fleet: false, settings: false, reports: true },
    { role: 'Warehouse Manager', loads: true, finance: false, users: false, fleet: true, settings: false, reports: true },
    { role: 'Sales', loads: true, finance: false, users: false, fleet: false, settings: false, reports: true },
    { role: 'Yard Attendant', loads: false, finance: false, users: false, fleet: true, settings: false, reports: false },
    { role: 'Customer', loads: true, finance: false, users: false, fleet: false, settings: false, reports: false },
  ];

  const permKeys = ['loads', 'finance', 'users', 'fleet', 'settings', 'reports'];

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xl animate-fade-in">{toastMsg}</div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-500" /> User Roles & Management
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage staff accounts, assign roles, and configure access permissions.</p>
        </div>
        <button onClick={() => setAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-xl text-sm font-bold text-gray-900 transition-all cursor-pointer shadow-xs">
          <UserPlus className="h-4 w-4" /> Add User
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Active Users', value: users.filter(u => u.status === 'Active').length, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Inactive Users', value: users.filter(u => u.status === 'Inactive').length, icon: AlertCircle, color: 'text-red-600 bg-red-50' },
          { label: 'Total Roles', value: [...new Set(users.map(u => u.role))].length, icon: Shield, color: 'text-purple-600 bg-purple-50' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${stat.color}`}><Icon className="h-5 w-5" /></div>
              <div>
                <div className="text-2xl font-black text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-400 font-medium">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {['users', 'permissions'].map(tab => (
          <button key={tab} onClick={() => setActiveSubTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer capitalize ${
              activeSubTab === tab ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-700'
            }`}>{tab === 'users' ? 'All Users' : 'Role Permissions'}</button>
        ))}
      </div>

      {/* Users Table */}
      {activeSubTab === 'users' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <span className="text-sm text-gray-500 font-medium">{filteredUsers.length} users found</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 bg-gray-50">
                {['User', 'Role', 'Branch', 'Last Login', 'Status', 'Actions'].map(h => <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>)}
              </tr></thead>
              <tbody>
                {filteredUsers.map((u, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-black">{u.name.split(' ').map(n => n[0]).join('')}</div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">{u.name}</div>
                          <div className="text-xs text-gray-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${roleColors[u.role] || 'bg-gray-100 text-gray-700'}`}>{u.role}</span></td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{u.branch}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{u.lastLogin}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${ u.status === 'Active' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-red-500 bg-red-50 border-red-200'}`}>{u.status}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1.5">
                        <button onClick={() => triggerToast(`Editing ${u.name}'s profile...`)} className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg cursor-pointer">Edit</button>
                        <button onClick={() => { setUsers(prev => prev.map(usr => usr.id === u.id ? { ...usr, status: usr.status === 'Active' ? 'Inactive' : 'Active' } : usr)); triggerToast(`${u.name} ${u.status === 'Active' ? 'deactivated' : 'activated'}.`); }} className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer ${ u.status === 'Active' ? 'bg-red-50 hover:bg-red-100 text-red-700' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'}`}>{u.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
                        <button onClick={() => triggerToast(`Resetting password for ${u.name}...`)} className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg cursor-pointer">Reset PW</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Permissions Matrix */}
      {activeSubTab === 'permissions' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-black text-gray-900">Role Permissions Matrix</h3>
            <p className="text-xs text-gray-400 mt-0.5">Overview of what each role can access across the platform.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                {permKeys.map(k => <th key={k} className="text-center py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider capitalize">{k}</th>)}
                <th className="text-center py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
              </tr></thead>
              <tbody>
                {rolePermissions.map((rp, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${roleColors[rp.role] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>{rp.role}</span></td>
                    {permKeys.map(k => (
                      <td key={k} className="py-3 px-4 text-center">
                        {rp[k] ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" /> : <X className="h-4 w-4 text-red-300 mx-auto" />}
                      </td>
                    ))}
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => triggerToast(`Editing permissions for ${rp.role}...`)} className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg cursor-pointer">Edit Permissions</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setAddModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-gray-900 text-lg">Add New User</h3>
              <button onClick={() => setAddModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl cursor-pointer"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-bold text-gray-500 uppercase">Full Name</label><input className="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="e.g. John Smith" /></div>
              <div><label className="text-xs font-bold text-gray-500 uppercase">Email Address</label><input className="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="john.smith@company.com" /></div>
              <div><label className="text-xs font-bold text-gray-500 uppercase">Role</label>
                <select className="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                  {['Company Admin', 'Dispatcher', 'Driver', 'Accounts', 'Warehouse Manager', 'Sales', 'Yard Attendant', 'Customer'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div><label className="text-xs font-bold text-gray-500 uppercase">Branch</label>
                <select className="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                  {['Sydney HQ', 'Melbourne Depot', 'Brisbane Terminal', 'Adelaide Depot', 'Perth Branch'].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setAddModalOpen(false)} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm cursor-pointer">Cancel</button>
              <button onClick={() => { triggerToast('New user invitation sent successfully!'); setAddModalOpen(false); }} className="flex-1 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-xl text-sm cursor-pointer">Send Invite</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// COMPANY SETTINGS DASHBOARD VIEW
// ============================================================
const CompanySettingsDashboardView = () => {
  const [toastMsg, setToastMsg] = React.useState('');
  const triggerToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); };
  const [form, setForm] = React.useState({
    companyName: 'Hero Logistics Ltd',
    abn: 'ABN 48 901 029 421',
    email: 'admin@herologistics.com',
    phone: '+61 2 9876 5432',
    address: '123 Logistics Drive, Sydney NSW 2000',
    website: 'www.herologistics.com.au',
    timezone: 'Australia/Sydney',
    currency: 'AUD',
    industry: 'Road Freight & Logistics',
  });

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xl animate-fade-in">{toastMsg}</div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Building className="h-6 w-6 text-purple-500" /> Company Settings
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Configure your company's core profile and operational settings.</p>
        </div>
        <button onClick={() => triggerToast('Company settings saved successfully!')} className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-xl text-sm font-bold text-gray-900 transition-all cursor-pointer shadow-xs">
          <Save className="h-4 w-4" /> Save Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Profile Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-5">
          <h3 className="font-black text-gray-900 border-b border-gray-100 pb-3">Company Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Registered Company Name', key: 'companyName', icon: Building },
              { label: 'ABN / Business Number', key: 'abn', icon: FileText },
              { label: 'Admin Email Address', key: 'email', icon: Mail },
              { label: 'Phone Number', key: 'phone', icon: Phone },
              { label: 'Head Office Address', key: 'address', icon: MapPin },
              { label: 'Company Website', key: 'website', icon: Globe },
            ].map(({ label, key, icon: Icon }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Default Timezone', key: 'timezone', options: ['Australia/Sydney', 'Australia/Melbourne', 'Australia/Brisbane', 'Australia/Perth'] },
              { label: 'Currency', key: 'currency', options: ['AUD', 'USD', 'GBP', 'EUR', 'NZD'] },
              { label: 'Industry Niche', key: 'industry', options: ['Road Freight & Logistics', 'Car Carrying', 'Dangerous Goods', 'Cold Chain', 'Last Mile Delivery'] },
            ].map(({ label, key, options }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</label>
                <select value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                  {options.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          <button onClick={() => triggerToast('Company profile settings saved!')} className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-500 rounded-xl text-sm font-bold text-gray-900 transition-all cursor-pointer">
            Save Company Profile
          </button>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Subscription Badge */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
            <h3 className="font-black text-gray-900 text-sm mb-3">Current Plan</h3>
            <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl text-center">
              <div className="text-2xl mb-1">⭐</div>
              <div className="font-black text-purple-700">Enterprise Tier</div>
              <div className="text-xs text-gray-500 mt-0.5">Unlimited depots & users</div>
            </div>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">Next billing</span><span className="font-bold text-gray-900">Jul 20, 2026</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Monthly cost</span><span className="font-bold text-gray-900">$499.00/mo</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="font-bold text-emerald-600">Active</span></div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl p-5 border border-red-100 shadow-xs">
            <h3 className="font-black text-red-600 text-sm mb-3">Danger Zone</h3>
            <div className="space-y-2">
              <button onClick={() => triggerToast('Export request submitted. You will receive an email when ready.')} className="w-full py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer transition-all">Export All Company Data</button>
              <button onClick={() => triggerToast('Please contact support to delete your account.')} className="w-full py-2 border border-red-200 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer transition-all">Delete Company Account</button>
            </div>
          </div>

          {/* Branding */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
            <h3 className="font-black text-gray-900 text-sm mb-3">Company Logo</h3>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-yellow-400 transition-all cursor-pointer" onClick={() => triggerToast('Logo upload dialog opened.')}>
              <div className="text-3xl mb-2">🏢</div>
              <p className="text-xs font-bold text-gray-500">Click to upload logo</p>
              <p className="text-[10px] text-gray-400">SVG, PNG, JPG up to 5MB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// SUBSCRIPTION & BILLING DASHBOARD VIEW
// ============================================================
const BillingDashboardView = () => {
  const [toastMsg, setToastMsg] = React.useState('');
  const triggerToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); };

  const invoices = [
    { id: 'INV-89112', date: 'Jun 20, 2026', amt: '$499.00', status: 'Paid' },
    { id: 'INV-88029', date: 'May 20, 2026', amt: '$499.00', status: 'Paid' },
    { id: 'INV-87002', date: 'Apr 20, 2026', amt: '$499.00', status: 'Paid' },
    { id: 'INV-86011', date: 'Mar 20, 2026', amt: '$499.00', status: 'Paid' },
    { id: 'INV-85001', date: 'Feb 20, 2026', amt: '$499.00', status: 'Paid' },
  ];

  const plans = [
    { name: 'Starter', price: '$99/mo', features: ['Up to 5 users', '1 Branch', 'Basic Reports', 'Email Support'], current: false },
    { name: 'Professional', price: '$249/mo', features: ['Up to 25 users', '5 Branches', 'Advanced Reports', 'Priority Support', 'GPS Integration'], current: false },
    { name: 'Enterprise', price: '$499/mo', features: ['Unlimited Users', 'Unlimited Branches', 'Full Analytics', '24/7 Support', 'GPS & ELD Integration', 'White Labeling', 'Custom API Access'], current: true },
  ];

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xl animate-fade-in">{toastMsg}</div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-blue-500" /> Subscription & Billing
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your plan, payment method, and billing invoices.</p>
      </div>

      {/* Current Plan Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider opacity-75 mb-1">Current Active Plan</div>
            <div className="text-3xl font-black">Enterprise Tier</div>
            <div className="text-sm opacity-80 mt-1">Unlimited users, branches & all premium features</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black">$499<span className="text-lg opacity-75">/mo</span></div>
            <div className="text-xs opacity-75 mt-0.5">Next billing: Jul 20, 2026</div>
            <div className="mt-2 px-3 py-1 bg-white/20 border border-white/30 rounded-full text-xs font-bold w-fit ml-auto">● Active</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plans */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-black text-gray-900">Available Plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan, i) => (
              <div key={i} className={`rounded-2xl p-5 border-2 transition-all ${ plan.current ? 'border-purple-500 bg-purple-50' : 'border-gray-100 bg-white hover:border-gray-300'}`}>
                {plan.current && <div className="text-xs font-black text-purple-600 uppercase mb-2">✓ Current Plan</div>}
                <div className="font-black text-gray-900 text-lg">{plan.name}</div>
                <div className="text-2xl font-black text-gray-900 my-2">{plan.price}</div>
                <div className="space-y-1.5 mb-4">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />{f}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => plan.current ? triggerToast('You are already on this plan.') : triggerToast(`Switching to ${plan.name} plan...`)}
                  className={`w-full py-2 rounded-xl text-sm font-bold cursor-pointer transition-all ${ plan.current ? 'bg-purple-500 text-white' : 'bg-gray-100 hover:bg-yellow-400 text-gray-900'}`}
                >{plan.current ? 'Current Plan' : 'Switch Plan'}</button>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method + Invoice History */}
        <div className="space-y-4">
          {/* Payment Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
            <h3 className="font-black text-gray-900 text-sm mb-4">Payment Method</h3>
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-4 text-white mb-3">
              <div className="text-xs opacity-60 mb-3">VISA</div>
              <div className="font-mono text-sm tracking-widest">•••• •••• •••• 8812</div>
              <div className="flex justify-between mt-3 text-xs opacity-75">
                <span>HERO LOGISTICS LTD</span>
                <span>09/29</span>
              </div>
            </div>
            <button onClick={() => triggerToast('Update payment method form loaded.')} className="w-full py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer transition-all">Update Payment Method</button>
          </div>

          {/* Invoice History */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
            <h3 className="font-black text-gray-900 text-sm mb-4">Billing History</h3>
            <div className="space-y-2">
              {invoices.map((inv, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <div className="text-xs font-bold text-gray-900">#{inv.id}</div>
                    <div className="text-[10px] text-gray-400">{inv.date}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-gray-900">{inv.amt}</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{inv.status}</span>
                    <button onClick={() => triggerToast(`Downloading ${inv.id}...`)} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer"><Download className="h-3 w-3 text-gray-600" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MY PROFILE DASHBOARD VIEW
// ============================================================
const MyProfileDashboardView = () => {
  const [toastMsg, setToastMsg] = React.useState('');
  const triggerToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); };
  const [activeSubTab, setActiveSubTab] = React.useState('profile');
  const [profile, setProfile] = React.useState({
    firstName: 'Rajiv',
    lastName: 'Mehta',
    email: 'rajiv.m@herologistics.com',
    phone: '+61 412 345 678',
    role: 'Company Admin',
    branch: 'Sydney HQ',
    timezone: 'Australia/Sydney',
    notifications: { email: true, sms: true, push: false },
  });
  const [passwords, setPasswords] = React.useState({ current: '', newPw: '', confirm: '' });

  const activityLog = [
    { action: 'Login Success', date: '30 Jun 2026, 09:42 AM', ip: '192.168.1.45', device: 'Chrome / Windows' },
    { action: 'Updated Company Settings', date: '29 Jun 2026, 04:15 PM', ip: '192.168.1.45', device: 'Chrome / Windows' },
    { action: 'Exported Finance Report', date: '28 Jun 2026, 02:30 PM', ip: '192.168.1.45', device: 'Safari / MacOS' },
    { action: 'Added New User: Tom Zhang', date: '27 Jun 2026, 11:20 AM', ip: '192.168.1.45', device: 'Chrome / Windows' },
    { action: 'Login Success', date: '26 Jun 2026, 08:05 AM', ip: '10.0.2.15', device: 'Mobile / iOS' },
  ];

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xl animate-fade-in">{toastMsg}</div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <User className="h-6 w-6 text-emerald-500" /> My Profile
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage your personal information, password & notification preferences.</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col md:flex-row items-center md:items-start gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white text-2xl font-black shadow-lg">
            {profile.firstName[0]}{profile.lastName[0]}
          </div>
          <button onClick={() => triggerToast('Avatar upload opened.')} className="absolute -bottom-1 -right-1 p-1.5 bg-yellow-400 rounded-lg cursor-pointer hover:bg-yellow-500 transition-all">
            <Camera className="h-3 w-3 text-gray-900" />
          </button>
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="text-xl font-black text-gray-900">{profile.firstName} {profile.lastName}</div>
          <div className="text-sm text-gray-500">{profile.email}</div>
          <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
            <span className="px-2.5 py-1 bg-purple-100 text-purple-700 border border-purple-200 rounded-full text-xs font-bold">{profile.role}</span>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold">{profile.branch}</span>
          </div>
        </div>
        <div className="text-center md:text-right text-xs text-gray-400">
          <div className="font-semibold">Member since</div>
          <div className="text-gray-600 font-bold">Jan 15, 2024</div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {[
          { id: 'profile', label: 'Profile Info' },
          { id: 'security', label: 'Security' },
          { id: 'notifications', label: 'Notifications' },
          { id: 'activity', label: 'Activity Log' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeSubTab === tab.id ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-700'
            }`}>{tab.label}</button>
        ))}
      </div>

      {/* Profile Info Tab */}
      {activeSubTab === 'profile' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-5">
          <h3 className="font-black text-gray-900 border-b border-gray-100 pb-3">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'First Name', key: 'firstName' },
              { label: 'Last Name', key: 'lastName' },
              { label: 'Email Address', key: 'email' },
              { label: 'Phone Number', key: 'phone' },
            ].map(({ label, key }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</label>
                <input
                  value={profile[key]}
                  onChange={e => setProfile({ ...profile, [key]: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Role (Read Only)</label>
              <input value={profile.role} readOnly className="w-full px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Branch</label>
              <input value={profile.branch} readOnly className="w-full px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed" />
            </div>
          </div>
          <button onClick={() => triggerToast('Profile updated successfully!')} className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 rounded-xl text-sm font-bold text-gray-900 cursor-pointer transition-all">
            Save Profile
          </button>
        </div>
      )}

      {/* Security Tab */}
      {activeSubTab === 'security' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-5">
            <h3 className="font-black text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2"><Key className="h-4 w-4" /> Change Password</h3>
            <div className="max-w-sm space-y-3">
              {[
                { label: 'Current Password', key: 'current', placeholder: '••••••••' },
                { label: 'New Password', key: 'newPw', placeholder: 'Min. 8 characters' },
                { label: 'Confirm New Password', key: 'confirm', placeholder: 'Repeat new password' },
              ].map(({ label, key, placeholder }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</label>
                  <input
                    type="password"
                    value={passwords[key]}
                    onChange={e => setPasswords({ ...passwords, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              ))}
              <button onClick={() => { triggerToast('Password changed successfully!'); setPasswords({ current: '', newPw: '', confirm: '' }); }} className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-500 rounded-xl text-sm font-bold text-gray-900 cursor-pointer transition-all">
                Update Password
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
            <h3 className="font-black text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2 mb-4"><Shield className="h-4 w-4" /> Two-Factor Authentication</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <div className="font-bold text-gray-900 text-sm">Authenticator App (2FA)</div>
                <div className="text-xs text-gray-500 mt-0.5">Add an extra layer of security to your account</div>
              </div>
              <button onClick={() => triggerToast('2FA setup wizard opened.')} className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-bold rounded-xl cursor-pointer transition-all">Enable 2FA</button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeSubTab === 'notifications' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-5">
          <h3 className="font-black text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2"><Bell className="h-4 w-4" /> Notification Preferences</h3>
          <div className="space-y-4">
            {[
              { key: 'email', label: 'Email Notifications', desc: 'Receive alerts, reports and updates via email' },
              { key: 'sms', label: 'SMS Notifications', desc: 'Get critical driver and load alerts via SMS' },
              { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications for real-time updates' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-bold text-gray-900 text-sm">{label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                </div>
                <button
                  onClick={() => { setProfile(prev => ({ ...prev, notifications: { ...prev.notifications, [key]: !prev.notifications[key] } })); triggerToast(`${label} ${!profile.notifications[key] ? 'enabled' : 'disabled'}.`); }}
                  className={`relative w-11 h-6 rounded-full transition-all cursor-pointer ${ profile.notifications[key] ? 'bg-emerald-500' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${ profile.notifications[key] ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
          <button onClick={() => triggerToast('Notification preferences saved!')} className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 rounded-xl text-sm font-bold text-gray-900 cursor-pointer transition-all">Save Preferences</button>
        </div>
      )}

      {/* Activity Log Tab */}
      {activeSubTab === 'activity' && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
          <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2"><Clock className="h-4 w-4" /> Recent Account Activity</h3>
          <div className="space-y-3">
            {activityLog.map((log, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="p-1.5 bg-blue-100 rounded-lg mt-0.5"><Activity className="h-3.5 w-3.5 text-blue-600" /></div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900 text-sm">{log.action}</div>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                    <span>{log.date}</span>
                    <span>IP: {log.ip}</span>
                    <span>{log.device}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function CompanyAdminDashboard({ activeTab, setActiveTab }) {
  if (activeTab === 'command-center' || activeTab === 'overview') {
    return <CommandCenterDashboard setActiveTab={setActiveTab} />;
  }

  if (activeTab === 'loads') {
    return <LoadsDashboardView />;
  }

  if (activeTab === 'vehicles' || activeTab === 'fleet' || activeTab === 'vehicle-registry') {
    return <VehiclesDashboardView />;
  }

  if (activeTab === 'branches') {
    return <BranchesDashboardView />;
  }

  if (activeTab === 'drivers') {
    return <DriversDashboardView />;
  }

  if (activeTab === 'customers') {
    return <CustomersDashboardView />;
  }

  if (activeTab === 'asset-inventory') {
    return <AssetInventoryDashboardView />;
  }

  if (activeTab === 'safety-checklists') {
    return <SafetyChecklistsDashboardView />;
  }

  if (activeTab === 'delivery-issues' || activeTab === 'exceptions') {
    return <ExceptionsDashboardView />;
  }

  if (activeTab === 'finance') {
    return <FinanceDashboardView />;
  }

  if (activeTab === 'user-roles' || activeTab === 'users') {
    return <UserRolesDashboardView />;
  }

  if (activeTab === 'company-settings' || activeTab === 'company') {
    return <CompanySettingsDashboardView />;
  }

  if (activeTab === 'subscription-billing' || activeTab === 'billing') {
    return <BillingDashboardView />;
  }

  if (activeTab === 'my-profile') {
    return <MyProfileDashboardView />;
  }

  // Placeholder for other tabs
  return (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="text-xl text-gray-500 font-semibold uppercase tracking-wider">
        {activeTab ? activeTab.replace('-', ' ') : 'Select a tab'}
      </div>
    </div>
  );
}