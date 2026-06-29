import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, MapPin, Users, Truck, Briefcase, CheckCircle2, 
  Plus, Trash2, ArrowLeft, ArrowRight, Upload, Shield 
} from 'lucide-react';
import heroLogo from '../assets/hero.png';

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Company Details State
  const [companyDetails, setCompanyDetails] = useState({
    legalName: '',
    taxId: '',
    currency: 'USD ($)',
    timezone: 'UTC -5 (EST)',
    logo: null
  });

  // Step 2: Branches List State
  const [branches, setBranches] = useState([
    { id: 1, name: 'HQ Terminal', address: '100 Logistics Blvd', city: 'Chicago', state: 'IL', manager: 'hq@company.com' }
  ]);
  const [newBranch, setNewBranch] = useState({ name: '', address: '', city: '', state: '', manager: '' });

  // Step 3: Users List State
  const [users, setUsers] = useState([
    { id: 1, name: 'Alexander Wright', email: 'alex@company.com', role: 'Company Admin' }
  ]);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Dispatcher' });

  // Step 4: Vehicles Fleet State
  const [vehicles, setVehicles] = useState([
    { id: 1, plate: 'TX-ROAD88', type: 'Semi-Truck', capacity: '45,000 lbs', branch: 'HQ Terminal' }
  ]);
  const [newVehicle, setNewVehicle] = useState({ plate: '', type: 'Semi-Truck', capacity: '', branch: 'HQ Terminal' });

  // Step 5: Shippers/Customers State
  const [customers, setCustomers] = useState([
    { id: 1, name: 'Global Retail Corp', contact: 'John Miller', email: 'billing@globalretail.com', terms: 'Net 30' }
  ]);
  const [newCustomer, setNewCustomer] = useState({ name: '', contact: '', email: '', terms: 'Net 30' });

  // Step Helpers
  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 6));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // Branch Handlers
  const addBranch = () => {
    if (!newBranch.name || !newBranch.city || !newBranch.state) return;
    setBranches([...branches, { ...newBranch, id: Date.now() }]);
    setNewBranch({ name: '', address: '', city: '', state: '', manager: '' });
  };
  const removeBranch = (id) => setBranches(branches.filter(b => b.id !== id));

  // User Handlers
  const addUser = () => {
    if (!newUser.name || !newUser.email) return;
    setUsers([...users, { ...newUser, id: Date.now() }]);
    setNewUser({ name: '', email: '', role: 'Dispatcher' });
  };
  const removeUser = (id) => setUsers(users.filter(u => u.id !== id));

  // Vehicle Handlers
  const addVehicle = () => {
    if (!newVehicle.plate || !newVehicle.capacity) return;
    setVehicles([...vehicles, { ...newVehicle, id: Date.now() }]);
    setNewVehicle({ plate: '', type: 'Semi-Truck', capacity: '', branch: branches[0]?.name || 'HQ Terminal' });
  };
  const removeVehicle = (id) => setVehicles(vehicles.filter(v => v.id !== id));

  // Customer Handlers
  const addCustomer = () => {
    if (!newCustomer.name || !newCustomer.email) return;
    setCustomers([...customers, { ...newCustomer, id: Date.now() }]);
    setNewCustomer({ name: '', contact: '', email: '', terms: 'Net 30' });
  };
  const removeCustomer = (id) => setCustomers(customers.filter(c => c.id !== id));

  const stepsList = [
    { num: 1, label: 'Company', icon: Building2 },
    { num: 2, label: 'Branches', icon: MapPin },
    { num: 3, label: 'Team', icon: Users },
    { num: 4, label: 'Fleet', icon: Truck },
    { num: 5, label: 'Customers', icon: Briefcase },
    { num: 6, label: 'Complete', icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-slate-50 px-4 sm:px-6 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-4xl glass rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 animate-fade-in border border-slate-200/80">
        
        {/* Header Branding */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-6 mb-8 gap-4">
          <div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 flex items-center gap-2">
              <div className="px-2 py-1 bg-neutral-900 border border-slate-200 rounded-lg">
                <img src={heroLogo} alt="Hero Logistics Logo" className="h-8 w-auto object-contain" />
              </div>
              HERO<span className="text-brand-500 font-medium">LOGISTICS</span>
            </span>
            <h2 className="text-xl font-bold text-slate-700 mt-1.5">SaaS Onboarding Setup Wizard</h2>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 bg-brand-500/10 border border-brand-500/30 text-brand-400 rounded-lg self-start sm:self-center">
            Step {currentStep} of 6
          </span>
        </div>

        {/* Step Progress Tracker */}
        <div className="hidden md:flex justify-between items-center mb-10 px-4 relative">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#23324C] -translate-y-1/2 z-0"></div>
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-brand-500 to-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / 5) * 100}%` }}
          ></div>

          {stepsList.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;
            
            return (
              <div key={step.num} className="relative z-10 flex flex-col items-center">
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                  isActive 
                    ? 'bg-brand-500 border-brand-400 text-slate-950 shadow-lg shadow-brand-500/30 scale-110' 
                    : isCompleted
                      ? 'bg-emerald-500 border-emerald-400 text-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  <Icon className="h-5.5 w-5.5" />
                </div>
                <span className={`text-xs font-bold mt-2 transition-all ${
                  isActive ? 'text-brand-400 font-extrabold' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
                }`}>{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* --- STEP WORKSPACE CONTAINER --- */}
        <div className="min-h-[380px] bg-white/40 border border-slate-200 rounded-xl p-5 sm:p-7 mb-6 animate-fade-in-up">
          
          {/* STEP 1: COMPANY DETAILS */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-brand-400" />
                Company Identity Profile
              </h3>
              <p className="text-slate-500 text-xs mb-6">Setup the legal entity name, taxation codes, and system localization preferences.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Company Legal Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Apex Logistics Solutions LLC"
                      value={companyDetails.legalName}
                      onChange={(e) => setCompanyDetails({...companyDetails, legalName: e.target.value})}
                      className="block w-full px-4 py-3 bg-[#161f30]/60 border border-slate-200 focus:border-brand-500 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Tax Registration / VAT ID</label>
                    <input
                      type="text"
                      placeholder="e.g. TX-991203-9A"
                      value={companyDetails.taxId}
                      onChange={(e) => setCompanyDetails({...companyDetails, taxId: e.target.value})}
                      className="block w-full px-4 py-3 bg-[#161f30]/60 border border-slate-200 focus:border-brand-500 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">System Currency</label>
                      <select 
                        value={companyDetails.currency}
                        onChange={(e) => setCompanyDetails({...companyDetails, currency: e.target.value})}
                        className="block w-full px-4 py-3 bg-[#161f30] border border-slate-200 focus:border-brand-500 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
                      >
                        <option>USD ($)</option>
                        <option>EUR (€)</option>
                        <option>INR (₹)</option>
                        <option>GBP (£)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Timezone</label>
                      <select 
                        value={companyDetails.timezone}
                        onChange={(e) => setCompanyDetails({...companyDetails, timezone: e.target.value})}
                        className="block w-full px-4 py-3 bg-[#161f30] border border-slate-200 focus:border-brand-500 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
                      >
                        <option>UTC -5 (EST)</option>
                        <option>UTC +0 (GMT)</option>
                        <option>UTC +5:30 (IST)</option>
                        <option>UTC -8 (PST)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Brand Logo Asset</label>
                    <div className="border-2 border-dashed border-slate-200 hover:border-brand-500/50 rounded-xl p-4 text-center cursor-pointer transition-colors bg-[#161f30]/20 flex flex-col items-center justify-center">
                      <Upload className="h-6 w-6 text-slate-500 mb-2" />
                      <span className="text-xs text-slate-500 font-medium">Drag logo file here or <span className="text-brand-400">browse</span></span>
                      <span className="text-[10px] text-slate-500 mt-1">Supports PNG, JPG (Max 2MB)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BRANCH SETUP */}
          {currentStep === 2 && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-brand-400" />
                Operational Hubs & Depots
              </h3>
              <p className="text-slate-500 text-xs mb-6">Create physical office or warehouse locations. Add at least one warehouse terminal or office.</p>

              {/* Add form */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 bg-[#161f30]/40 p-4 border border-slate-200 rounded-xl mb-6">
                <input
                  type="text"
                  placeholder="Branch Name (e.g. Chicago Depot)"
                  value={newBranch.name}
                  onChange={(e) => setNewBranch({...newBranch, name: e.target.value})}
                  className="px-3.5 py-2 bg-white border border-slate-200 focus:border-brand-500 rounded-lg text-slate-700 text-xs focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={newBranch.city}
                  onChange={(e) => setNewBranch({...newBranch, city: e.target.value})}
                  className="px-3.5 py-2 bg-white border border-slate-200 focus:border-brand-500 rounded-lg text-slate-700 text-xs focus:outline-none"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="State Code (e.g. IL)"
                    value={newBranch.state}
                    onChange={(e) => setNewBranch({...newBranch, state: e.target.value})}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-brand-500 rounded-lg text-slate-700 text-xs focus:outline-none"
                  />
                  <button
                    onClick={addBranch}
                    className="px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Add
                  </button>
                </div>
              </div>

              {/* Grid List */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-500 uppercase">Configured Branches ({branches.length})</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-48 overflow-y-auto pr-1">
                  {branches.map((b) => (
                    <div key={b.id} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-brand-500/30 transition-all">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-700">{b.name}</h4>
                        <span className="text-xs text-slate-500">{b.city}, {b.state}</span>
                      </div>
                      {branches.length > 1 && (
                        <button onClick={() => removeBranch(b.id)} className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ADD USERS */}
          {currentStep === 3 && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5 flex items-center">
                <Users className="h-5 w-5 mr-2 text-brand-400" />
                Team Invite & Access Management
              </h3>
              <p className="text-slate-500 text-xs mb-6">Invite dispatchers, accounts executives, yard managers, and drivers to log in.</p>

              {/* Add form */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 bg-[#161f30]/40 p-4 border border-slate-200 rounded-xl mb-6">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="px-3.5 py-2 bg-white border border-slate-200 focus:border-brand-500 rounded-lg text-slate-700 text-xs focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="px-3.5 py-2 bg-white border border-slate-200 focus:border-brand-500 rounded-lg text-slate-700 text-xs focus:outline-none"
                />
                <div className="flex gap-2">
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-brand-500 rounded-lg text-slate-700 text-xs focus:outline-none cursor-pointer"
                  >
                    <option>Dispatcher</option>
                    <option>Accounts</option>
                    <option>Warehouse Manager</option>
                    <option>Driver</option>
                    <option>Yard Attendant</option>
                  </select>
                  <button
                    onClick={addUser}
                    className="px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Invite
                  </button>
                </div>
              </div>

              {/* Users List Table */}
              <div className="overflow-x-auto max-h-48 overflow-y-auto">
                <table className="min-w-full text-left text-xs border border-slate-200 rounded-xl">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Assigned Role</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#23324C]/60 text-slate-600">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-white/10">
                        <td className="p-3 font-semibold">{u.name}</td>
                        <td className="p-3 text-slate-500">{u.email}</td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 bg-brand-500/10 border border-brand-500/25 rounded-md text-[10px] font-bold text-brand-400 uppercase tracking-wide">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {u.id !== 1 && (
                            <button onClick={() => removeUser(u.id)} className="p-1 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded transition-colors cursor-pointer">
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 4: ADD VEHICLES */}
          {currentStep === 4 && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5 flex items-center">
                <Truck className="h-5 w-5 mr-2 text-brand-400" />
                Fleet Registration Setup
              </h3>
              <p className="text-slate-500 text-xs mb-6">Configure active vehicles in your pool to enable routing and dispatch tracking cards.</p>

              {/* Add form */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#161f30]/40 p-4 border border-slate-200 rounded-xl mb-6">
                <input
                  type="text"
                  placeholder="Plate Number (e.g. TX-ROAD)"
                  value={newVehicle.plate}
                  onChange={(e) => setNewVehicle({...newVehicle, plate: e.target.value})}
                  className="px-3.5 py-2 bg-white border border-slate-200 focus:border-brand-500 rounded-lg text-slate-700 text-xs focus:outline-none"
                />
                <select
                  value={newVehicle.type}
                  onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}
                  className="px-3.5 py-2 bg-white border border-slate-200 focus:border-brand-500 rounded-lg text-slate-700 text-xs focus:outline-none cursor-pointer"
                >
                  <option>Semi-Truck</option>
                  <option>Flatbed Trailer</option>
                  <option>Box Truck</option>
                  <option>Courier Van</option>
                  <option>Car Carrier</option>
                </select>
                <input
                  type="text"
                  placeholder="Capacity (e.g. 40k lbs)"
                  value={newVehicle.capacity}
                  onChange={(e) => setNewVehicle({...newVehicle, capacity: e.target.value})}
                  className="px-3.5 py-2 bg-white border border-slate-200 focus:border-brand-500 rounded-lg text-slate-700 text-xs focus:outline-none"
                />
                <div className="flex gap-2">
                  <select
                    value={newVehicle.branch}
                    onChange={(e) => setNewVehicle({...newVehicle, branch: e.target.value})}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-brand-500 rounded-lg text-slate-700 text-xs focus:outline-none cursor-pointer"
                  >
                    {branches.map(b => (
                      <option key={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={addVehicle}
                    className="px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Add
                  </button>
                </div>
              </div>

              {/* Grid List */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-500 uppercase">Vehicles In Fleet ({vehicles.length})</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-48 overflow-y-auto pr-1">
                  {vehicles.map((v) => (
                    <div key={v.id} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-brand-500/30 transition-all">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-700 flex items-center gap-2">
                          <Truck className="h-4 w-4 text-brand-400" />
                          {v.plate}
                        </h4>
                        <span className="text-xs text-slate-500">{v.type} • {v.capacity} • {v.branch}</span>
                      </div>
                      {vehicles.length > 1 && (
                        <button onClick={() => removeVehicle(v.id)} className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: ADD CUSTOMERS */}
          {currentStep === 5 && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5 flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-brand-400" />
                Customer Profiles (Shippers)
              </h3>
              <p className="text-slate-500 text-xs mb-6">Define shipper accounts or partners to assign loads and invoices to immediately.</p>

              {/* Add form */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#161f30]/40 p-4 border border-slate-200 rounded-xl mb-6">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                  className="px-3.5 py-2 bg-white border border-slate-200 focus:border-brand-500 rounded-lg text-slate-700 text-xs focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Contact Person"
                  value={newCustomer.contact}
                  onChange={(e) => setNewCustomer({...newCustomer, contact: e.target.value})}
                  className="px-3.5 py-2 bg-white border border-slate-200 focus:border-brand-500 rounded-lg text-slate-700 text-xs focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="billing@customer.com"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                  className="px-3.5 py-2 bg-white border border-slate-200 focus:border-brand-500 rounded-lg text-slate-700 text-xs focus:outline-none"
                />
                <div className="flex gap-2">
                  <select
                    value={newCustomer.terms}
                    onChange={(e) => setNewCustomer({...newCustomer, terms: e.target.value})}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-brand-500 rounded-lg text-slate-700 text-xs focus:outline-none cursor-pointer"
                  >
                    <option>Net 15</option>
                    <option>Net 30</option>
                    <option>Net 45</option>
                    <option>Due on Receipt</option>
                  </select>
                  <button
                    onClick={addCustomer}
                    className="px-4 py-2 bg-brand-500 hover:bg-brand-600 rounded-lg text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Add
                  </button>
                </div>
              </div>

              {/* Grid List */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-500 uppercase">Shippers Configured ({customers.length})</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-48 overflow-y-auto pr-1">
                  {customers.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-brand-500/30 transition-all">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-700">{c.name}</h4>
                        <span className="text-xs text-slate-500">{c.contact} • {c.email} • {c.terms}</span>
                      </div>
                      {customers.length > 1 && (
                        <button onClick={() => removeCustomer(c.id)} className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: SETUP COMPLETE */}
          {currentStep === 6 && (
            <div className="text-center py-6">
              <div className="inline-flex p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl mb-4 text-emerald-400 animate-bounce">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Onboarding Configuration Complete!</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto mb-8">
                Your company workspace is fully provisioned. The items configured below are ready to be used.
              </p>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 max-w-3xl mx-auto mb-8">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="block text-xl font-black text-brand-400">{companyDetails.legalName ? '1' : '0'}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Company Profile</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="block text-xl font-black text-brand-400">{branches.length}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Branches</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="block text-xl font-black text-brand-400">{users.length}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Users Invited</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="block text-xl font-black text-brand-400">{vehicles.length}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Fleet Vehicles</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="block text-xl font-black text-brand-400">{customers.length}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Shippers Setup</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-brand-500 to-emerald-500 hover:from-brand-600 hover:to-emerald-600 text-slate-950 font-black rounded-xl shadow-xl shadow-brand-500/20 hover:shadow-brand-500/35 transition-all text-sm cursor-pointer"
              >
                Launch Company Admin Dashboard
                <ArrowRight className="h-4.5 w-4.5 ml-2" />
              </button>
            </div>
          )}

        </div>

        {/* --- BOTTOM ACTIONS --- */}
        {currentStep < 6 && (
          <div className="flex justify-between items-center pt-2 border-t border-slate-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:border-brand-500/30 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center text-sm cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>

            <div className="flex items-center gap-3">
              {currentStep > 1 && currentStep < 6 && (
                <button
                  onClick={nextStep}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-600 transition-colors"
                >
                  Skip Step
                </button>
              )}
              <button
                onClick={nextStep}
                className="px-6 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-brand-500/20 hover:shadow-brand-500/35 transition-all flex items-center text-sm cursor-pointer"
              >
                Save & Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
