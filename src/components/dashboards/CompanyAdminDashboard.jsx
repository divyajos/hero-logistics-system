import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';import { 
  Package, Truck, GitBranch, Users, UserSquare, FileText, 
  CheckSquare, AlertTriangle, DollarSign, Settings, PhoneCall, 
  Building, CreditCard, PlusCircle 
} from 'lucide-react';

// --- SIDEBAR COMPONENT ---
const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <Building size={20} /> },
    { name: 'Loads', path: '/admin/loads', icon: <Package size={20} /> },
    { name: 'Fleet / Vehicles', path: '/admin/fleet', icon: <Truck size={20} /> },
    { name: 'Branches', path: '/admin/branches', icon: <GitBranch size={20} /> },
    { name: 'Drivers', path: '/admin/drivers', icon: <Users size={20} /> },
    { name: 'Customers', path: '/admin/customers', icon: <UserSquare size={20} /> },
    { name: 'Vehicle Registry', path: '/admin/vehicle-registry', icon: <FileText size={20} /> },
    { name: 'Safety Checklists', path: '/admin/safety-checklists', icon: <CheckSquare size={20} /> },
    { name: 'Exceptions', path: '/admin/exceptions', icon: <AlertTriangle size={20} /> },
    { name: 'Finance', path: '/admin/finance', icon: <DollarSign size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
  ];

  const settingItems = [
    { name: 'Helpline', path: '/admin/helpline', icon: <PhoneCall size={20} /> },
    { name: 'Company Settings', path: '/admin/company', icon: <Settings size={20} /> },
    { name: 'Billing', path: '/admin/billing', icon: <CreditCard size={20} /> },
    { name: 'General Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col shadow-lg">
      <div className="p-5 text-2xl font-bold border-b border-gray-700 text-center">
        Logistic Admin
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Main Menu</div>
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors ${
                  location.pathname === item.path ? 'bg-blue-600 border-l-4 border-white' : ''
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-2">System & Settings</div>
        <ul className="space-y-1">
          {settingItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors ${
                  location.pathname === item.path ? 'bg-blue-600 border-l-4 border-white' : ''
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// --- DUMMY PAGES FOR ROUTING ---

const DashboardHome = () => <div className="p-6"><h1 className="text-3xl font-bold">Admin Dashboard</h1><p className="mt-2 text-gray-600">Welcome to the Logistic Management System.</p></div>;

const LoadsPage = () => (
  <div className="p-6">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Manage Loads</h1>
      <Link to="/admin/loads/create" className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700">
        <PlusCircle size={20} /> Create New Load
      </Link>
    </div>
    <div className="bg-white p-4 shadow rounded h-64 flex items-center justify-center text-gray-500">Loads Data Table Here</div>
  </div>
);

const CreateLoad = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-6">Create New Load</h1>
    <div className="bg-white p-6 shadow rounded">
      <form className="space-y-4">
        <div><label className="block text-gray-700">Load Title</label><input type="text" className="w-full border p-2 rounded mt-1" placeholder="Enter load details..." /></div>
        <div><label className="block text-gray-700">Destination</label><input type="text" className="w-full border p-2 rounded mt-1" placeholder="Enter destination..." /></div>
        <button className="bg-green-600 text-white px-6 py-2 rounded">Submit Load</button>
      </form>
    </div>
  </div>
);

const DriversPage = () => (
  <div className="p-6">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Drivers Directory</h1>
      <Link to="/admin/drivers/add" className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700">
        <PlusCircle size={20} /> Add Driver
      </Link>
    </div>
    <div className="bg-white p-4 shadow rounded h-64 flex items-center justify-center text-gray-500">Drivers List Here</div>
  </div>
);

const AddDriver = () => <div className="p-6"><h1 className="text-3xl font-bold">Add New Driver</h1><p className="mt-2">Driver form comes here...</p></div>;

const GenericPage = ({ title }) => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4">{title}</h1>
    <div className="bg-white p-4 shadow rounded h-64 flex items-center justify-center text-gray-500">
      Content for {title} goes here.
    </div>
  </div>
);

// --- MAIN DASHBOARD LAYOUT & ROUTER ---
const CompanyAdminDashboard = () => {
  return (
    <Router>
      <div className="flex h-screen bg-gray-100 font-sans">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/admin" element={<DashboardHome />} />
            
            {/* Loads */}
            <Route path="/admin/loads" element={<LoadsPage />} />
            <Route path="/admin/loads/create" element={<CreateLoad />} />
            
            {/* Fleet */}
            <Route path="/admin/fleet" element={<GenericPage title="Fleet Management" />} />
            
            {/* Branches */}
            <Route path="/admin/branches" element={<GenericPage title="Branches" />} />
            <Route path="/admin/branches/add" element={<GenericPage title="Add New Branch" />} />
            
            {/* Drivers */}
            <Route path="/admin/drivers" element={<DriversPage />} />
            <Route path="/admin/drivers/add" element={<AddDriver />} />
            
            {/* Customers */}
            <Route path="/admin/customers" element={<GenericPage title="Customers" />} />
            <Route path="/admin/customers/add" element={<GenericPage title="Add New Customer" />} />
            
            {/* Operations & Checks */}
            <Route path="/admin/vehicle-registry" element={<GenericPage title="Vehicle Registry" />} />
            <Route path="/admin/safety-checklists" element={<GenericPage title="Safety Checklists" />} />
            <Route path="/admin/exceptions" element={<GenericPage title="Exceptions" />} />
            <Route path="/admin/finance" element={<GenericPage title="Finance" />} />
            
            {/* Users */}
            <Route path="/admin/users" element={<GenericPage title="Users Management" />} />
            <Route path="/admin/users/invite" element={<GenericPage title="Invite User" />} />
            
            {/* Settings */}
            <Route path="/admin/helpline" element={<GenericPage title="Helpline" />} />
            <Route path="/admin/company" element={<GenericPage title="Company Settings" />} />
            <Route path="/admin/billing" element={<GenericPage title="Billing Details" />} />
            <Route path="/admin/settings" element={<GenericPage title="General Settings" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default CompanyAdminDashboard;