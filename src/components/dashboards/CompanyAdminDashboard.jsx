import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLogistics } from '../../context/LogisticsContext';
import { fetchVehicles, addVehicle, updateVehicle, deleteVehicle } from '../../store/slices/vehiclesSlice';
import { fetchDrivers, addDriver, updateDriver, deleteDriver } from '../../store/slices/driversSlice';
import { fetchCustomerInstructions, createCustomerInstruction, editCustomerInstruction, deleteCustomerInstruction } from '../../store/slices/customersSlice';
import { fetchTenants, createTenantUser } from '../../store/slices/companySlice';
import Button from '../common/Button';
import TextInput from '../common/TextInput';
import SelectInput from '../common/SelectInput';
import SearchInput from '../common/SearchInput';
import DatePicker from '../common/DatePicker';
import StatCard from '../common/StatCard';
import EmptyState from '../common/EmptyState';
import Toast from '../common/Toast';
import Pagination from '../common/Pagination';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import Drawer from '../common/Drawer';
import Tabs from '../common/Tabs';
import MiniChart from '../common/MiniChart';
import { KpiGridSkeleton, TableSkeleton } from '../common/Skeletons';
import { 
  Truck, MapPin, Users, Briefcase, Plus, Check, Edit2, 
  Trash2, Shield, Calendar, Key, UserCheck, AlertTriangle
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function CompanyAdminDashboard({ activeTab = 'overview' }) {
  const dispatch = useDispatch();
  const { fleet, loading: fleetLoading } = useSelector((state) => state.vehicles);
  const { drivers, loading: driversLoading } = useSelector((state) => state.drivers);
  const { customerInstructions } = useSelector((state) => state.customers);
  const { tenants } = useSelector((state) => state.company);
  const { user } = useSelector((state) => state.auth);
  const activeTenant = tenants.find(t => t.name.toLowerCase() === (user?.company || 'Apex Logistics LLC').toLowerCase());
  const { transfers, initiateTransfer, acceptTransfer, rejectTransfer } = useLogistics();

  // Modals & Drawers
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);

  // Selections
  const [selectedItem, setSelectedItem] = useState(null);
  const [drawerType, setDrawerType] = useState('branch'); // branch, customer, driver, trailer, asset
  const [inspectTab, setInspectTab] = useState('profile');
  
  // Vehicle sub-forms state
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServiceDate, setNewServiceDate] = useState('');
  const [newServiceCost, setNewServiceCost] = useState('');
  
  const [newSchedDesc, setNewSchedDesc] = useState('');
  const [newSchedDate, setNewSchedDate] = useState('');
  
  const [newInspDate, setNewInspDate] = useState('');
  const [newInspResult, setNewInspResult] = useState('Pass');
  const [newInspInspector, setNewInspInspector] = useState('');
  const [newInspNotes, setNewInspNotes] = useState('');

  // Driver sub-forms state
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDate, setNewCourseDate] = useState('');
  const [newCourseScore, setNewCourseScore] = useState('');

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('');
  const [formValue, setFormValue] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');
  const [editingInsId, setEditingInsId] = useState(null);
  const [editingInsText, setEditingInsText] = useState('');
  const [newInsType, setNewInsType] = useState('Customer Instructions');
  const [newInsScopeType, setNewInsScopeType] = useState('Customer');
  const [newInsScopeValue, setNewInsScopeValue] = useState('');
  const [newInsText, setNewInsText] = useState('');
  const [newInsIsCritical, setNewInsIsCritical] = useState(false);

  // Custom DB lists states
  const [branches, setBranches] = useState([
    { id: 1, name: 'Chicago HQ Terminal', address: '100 Logistics Blvd', city: 'Chicago', state: 'IL', manager: 'hq@company.com', staff: 8 },
    { id: 2, name: 'Los Angeles Depot', address: '45 Long Beach Rd', city: 'Los Angeles', state: 'CA', manager: 'la@company.com', staff: 4 }
  ]);

  const [customers, setCustomers] = useState([
    { id: 1, name: 'Global Retail Corp', email: 'billing@globalretail.com', contract: 'Enterprise Contract', billing: 'Net 30' },
    { id: 2, name: 'Memphis Shippers Inc', email: 'freight@memphis.com', contract: 'Standard Agreement', billing: 'Net 15' }
  ]);

  const [trailers, setTrailers] = useState([
    { id: 1, plate: 'TR-4022', type: 'Dry Van', status: 'Available', spot: 'Chicago A-4' },
    { id: 2, plate: 'TR-9118', type: 'Reefer (Cold)', status: 'Spotted', spot: 'Los Angeles B-1' },
    { id: 3, plate: 'TR-7422', type: 'Flatbed', status: 'Available', spot: 'Chicago A-5' }
  ]);

  const [leaves, setLeaves] = useState([
    { id: 1, employee: 'John D. (Driver)', start: '06/25/2026', end: '06/28/2026', type: 'Sick Leave', status: 'Pending' },
    { id: 2, employee: 'Sarah R. (Driver)', start: '07/02/2026', end: '07/05/2026', type: 'Vacation', status: 'Approved' }
  ]);

  const [assets, setAssets] = useState([
    { id: 1, name: 'Forklift TR-01', type: 'Warehouse Crane', serial: 'SN-4029112', status: 'Active' },
    { id: 2, name: 'Zebra TC57 Scanner', type: 'Barcode Scan Terminal', serial: 'SN-9102381', status: 'Active' },
    { id: 3, name: 'Detroit diesel generator', type: 'Back-up Power Unit', serial: 'SN-1022384', status: 'Maintenance' }
  ]);

  // Permission toggles
  const [userPermissions, setUserPermissions] = useState({
    dispatchCreateLoads: true,
    dispatchEditRoutes: true,
    accountsPayouts: false,
    warehouseOverrides: false
  });

  useEffect(() => {
    dispatch(fetchVehicles());
    dispatch(fetchDrivers());
    dispatch(fetchCustomerInstructions());
    dispatch(fetchTenants());
  }, [dispatch]);

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const handleAddUser = () => {
    const limits = {
      Starter: 3,
      Professional: 15,
      Enterprise: Infinity
    };
    if (activeTenant) {
      const currentUsers = activeTenant.users || 0;
      const limit = limits[activeTenant.plan] || 15;
      if (currentUsers >= limit) {
        triggerToast(`Plan Limit Exceeded: Your ${activeTenant.plan} plan allows up to ${limit} users. Current: ${currentUsers}.`, 'error');
        return;
      }
    }
    const randomId = Math.floor(1000 + Math.random() * 9000);
    dispatch(createTenantUser({
      name: `User ${randomId}`,
      email: `user_${randomId}@${activeTenant?.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company'}.com`,
      role: 'Dispatcher'
    })).then((res) => {
      if (res.error) {
        triggerToast(res.error.message || 'Failed to invite user', 'error');
      } else {
        triggerToast(`Invited dispatcher: ${res.payload.email}`);
        dispatch(fetchTenants());
      }
    });
  };

  // Add Item handler
  const handleAddItemSubmit = (e) => {
    e.preventDefault();
    if (!formName) return;

    if (activeTab === 'branches') {
      const newB = { id: Date.now(), name: formName, address: formType, city: 'Dallas', state: 'TX', manager: formValue, staff: 0 };
      setBranches([newB, ...branches]);
      triggerToast(`Branch ${formName} added successfully.`);
    } else if (activeTab === 'customers') {
      const newC = { id: Date.now(), name: formName, email: formType, contract: 'Standard Agreement', billing: formValue };
      setCustomers([newC, ...customers]);
      triggerToast(`Customer account ${formName} configured.`);
    } else if (activeTab === 'drivers') {
      if (activeTenant) {
        const limit = activeTenant.plan === 'Starter' ? 5 : (activeTenant.plan === 'Professional' ? 30 : Infinity);
        if ((activeTenant.drivers || 0) >= limit) {
          triggerToast(`Plan Limit Exceeded: Your ${activeTenant.plan} plan allows up to ${limit} drivers. Current: ${activeTenant.drivers}.`, 'error');
          setAddModalOpen(false);
          return;
        }
      }
      dispatch(addDriver({ name: formName, email: formType, plate: formValue })).then((res) => {
        if (res.error) {
          triggerToast(res.error.message || 'Failed to add driver', 'error');
        } else {
          triggerToast(`Driver ${formName} registered.`);
          dispatch(fetchTenants());
        }
      });
    } else if (activeTab === 'fleet') {
      if (activeTenant) {
        const limit = activeTenant.plan === 'Starter' ? 5 : (activeTenant.plan === 'Professional' ? 30 : Infinity);
        if ((activeTenant.vehicles || 0) >= limit) {
          triggerToast(`Plan Limit Exceeded: Your ${activeTenant.plan} plan allows up to ${limit} vehicles. Current: ${activeTenant.vehicles}.`, 'error');
          setAddModalOpen(false);
          return;
        }
      }
      dispatch(addVehicle({ plate: formName, type: formType, capacity: formValue })).then((res) => {
        if (res.error) {
          triggerToast(res.error.message || 'Failed to add vehicle', 'error');
        } else {
          triggerToast(`Vehicle ${formName} specs registered.`);
          dispatch(fetchTenants());
        }
      });
    } else if (activeTab === 'trailers') {
      const newT = { id: Date.now(), plate: formName, type: formType, status: 'Available', spot: formValue };
      setTrailers([newT, ...trailers]);
      triggerToast(`Trailer ${formName} spots registered.`);
    } else if (activeTab === 'assets') {
      const newA = { id: Date.now(), name: formName, type: formType, serial: formValue, status: 'Active' };
      setAssets([newA, ...assets]);
      triggerToast(`Asset ${formName} saved.`);
    }

    // Reset Form
    setFormName('');
    setFormType('');
    setFormValue('');
    setAddModalOpen(false);
  };

  // Approval handlers
  const handleApproveLeave = (id) => {
    setLeaves(leaves.map(l => l.id === id ? { ...l, status: 'Approved' } : l));
    triggerToast('Leave request approved.');
  };

  const handleRejectLeave = (id) => {
    setLeaves(leaves.map(l => l.id === id ? { ...l, status: 'Rejected' } : l));
    triggerToast('Leave request declined.', 'warning');
  };

  // Inspect Handler
  const handleOpenInspect = (item, type) => {
    setSelectedItem(item);
    setDrawerType(type);
    setInspectTab('profile');
    setDetailsDrawerOpen(true);
  };

  // Add maintenance log
  const handleAddMaintenanceLog = (e) => {
    e.preventDefault();
    if (!newServiceDesc || !newServiceDate || !newServiceCost) return;
    const newLog = { service: newServiceDesc, date: newServiceDate, cost: `$${parseFloat(newServiceCost).toFixed(2)}`, status: 'Completed' };
    const updatedHistory = [newLog, ...(selectedItem.maintenanceHistory || [])];
    
    dispatch(updateVehicle({ id: selectedItem.id, data: { maintenanceHistory: updatedHistory } }));
    setSelectedItem({ ...selectedItem, maintenanceHistory: updatedHistory });
    
    setNewServiceDesc('');
    setNewServiceDate('');
    setNewServiceCost('');
    triggerToast('Maintenance service logged.');
  };

  // Add service schedule
  const handleAddServiceSchedule = (e) => {
    e.preventDefault();
    if (!newSchedDesc || !newSchedDate) return;
    const newSched = { service: newSchedDesc, date: newSchedDate, status: 'Scheduled' };
    const updatedSchedule = [newSched, ...(selectedItem.serviceSchedule || [])];
    
    dispatch(updateVehicle({ id: selectedItem.id, data: { serviceSchedule: updatedSchedule } }));
    setSelectedItem({ ...selectedItem, serviceSchedule: updatedSchedule });
    
    setNewSchedDesc('');
    setNewSchedDate('');
    triggerToast('Upcoming service scheduled.');
  };

  // Add inspection record
  const handleAddInspection = (e) => {
    e.preventDefault();
    if (!newInspDate || !newInspInspector) return;
    const newInsp = { date: newInspDate, result: newInspResult, inspector: newInspInspector, notes: newInspNotes };
    const updatedInspections = [newInsp, ...(selectedItem.inspections || [])];
    
    dispatch(updateVehicle({ id: selectedItem.id, data: { inspections: updatedInspections } }));
    setSelectedItem({ ...selectedItem, inspections: updatedInspections });
    
    setNewInspDate('');
    setNewInspInspector('');
    setNewInspNotes('');
    triggerToast('DOT inspection record saved.');
  };

  // Add training log
  const handleAddTrainingRecord = (e) => {
    e.preventDefault();
    if (!newCourseName || !newCourseDate) return;
    const newRecord = { course: newCourseName, date: newCourseDate, score: newCourseScore || 'N/A' };
    const updatedRecords = [newRecord, ...(selectedItem.trainingRecords || [])];
    
    dispatch(updateDriver({ id: selectedItem.id, data: { trainingRecords: updatedRecords } }));
    setSelectedItem({ ...selectedItem, trainingRecords: updatedRecords });
    
    setNewCourseName('');
    setNewCourseDate('');
    setNewCourseScore('');
    triggerToast('Training record registered.');
  };

  // Update document expiries
  const handleUpdateDriverDocExpiries = (docType, expiryDate) => {
    const updatedDocData = { ...selectedItem[docType], expires: expiryDate, status: new Date(expiryDate) < new Date() ? 'Expired' : 'Valid' };
    dispatch(updateDriver({ id: selectedItem.id, data: { [docType]: updatedDocData } }));
    setSelectedItem({ ...selectedItem, [docType]: updatedDocData });
    triggerToast('Compliance expiry date updated.');
  };

  // Driver/Vehicle Suspension
  const handleDeactivateItem = () => {
    if (drawerType === 'fleet') {
      dispatch(deleteVehicle(selectedItem.id));
      triggerToast('Vehicle deactivated and removed from registry.', 'warning');
    } else if (drawerType === 'driver') {
      dispatch(deleteDriver(selectedItem.id));
      triggerToast('Driver suspended and removed from registry.', 'warning');
    }
    setDetailsDrawerOpen(false);
  };

  // Customer Instructions Handlers
  const handleCreateInstruction = (e) => {
    e.preventDefault();
    if (!newInsText.trim()) {
      triggerToast('Please enter the instruction directive text.', 'error');
      return;
    }
    
    let scopeVal = newInsScopeValue;
    if (!scopeVal) {
      if (newInsScopeType === 'Customer') scopeVal = 'Global Retail Corp';
      else if (newInsScopeType === 'Address') scopeVal = 'Chicago HQ Terminal';
      else scopeVal = 'LD-9411';
    }

    const scopeStr = `${newInsScopeType === 'Customer' ? 'Customer' : newInsScopeType === 'Address' ? 'Stop Terminal' : 'Load ID'} (${scopeVal})`;
    
    dispatch(createCustomerInstruction({
      type: newInsType,
      scope: scopeStr,
      text: newInsText.trim(),
      isCritical: newInsIsCritical,
      createdBy: 'Company Admin'
    }));

    setNewInsText('');
    setNewInsIsCritical(false);
    triggerToast('Special Instruction attached successfully.');
  };

  const handleStartEditIns = (item) => {
    setEditingInsId(item.id);
    setEditingInsText(item.text);
  };

  const handleSaveEditIns = (item) => {
    if (!editingInsText.trim()) {
      triggerToast('Instruction text cannot be empty.', 'error');
      return;
    }
    dispatch(editCustomerInstruction({
      id: item.id,
      scope: item.scope,
      type: item.type,
      text: editingInsText.trim(),
      isCritical: item.isCritical
    }));
    setEditingInsId(null);
    setEditingInsText('');
    triggerToast('Instruction updated successfully.');
  };

  const handleDeleteIns = (id) => {
    if (confirm('Are you sure you want to delete this instruction?')) {
      dispatch(deleteCustomerInstruction(id));
      triggerToast('Instruction deleted.', 'warning');
    }
  };

  // Search & Pagination queries
  const getFilteredList = () => {
    if (activeTab === 'branches') {
      return branches.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (activeTab === 'customers') {
      return customers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (activeTab === 'drivers') {
      return drivers.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (activeTab === 'fleet') {
      return fleet.filter(v => v.plate.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (activeTab === 'trailers') {
      return trailers.filter(t => t.plate.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (activeTab === 'assets') {
      return assets.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return [];
  };

  const activeList = getFilteredList();
  const totalPages = Math.ceil(activeList.length / itemsPerPage);
  const paginatedList = activeList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      
      {/* Toast notifications */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
          <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#23324C]/60 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white capitalize">Company Admin • {activeTab.replace('-', ' ')}</h2>
          <p className="text-xs text-slate-400">Configure entities, invite operators, and audit registered company assets.</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAddUser}>
            Add User
          </Button>
          <Button variant="outline" onClick={() => triggerToast('Opening assign user to branch modal...')}>
            Assign User To Branch
          </Button>
          {activeTab !== 'overview' && activeTab !== 'workforce' && (
            <Button variant="primary" icon={Plus} onClick={() => setAddModalOpen(true)}>
              Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('s', '')}
            </Button>
          )}
        </div>
      </div>

      {/* Main dashboard screens */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Registered Fleet Size" value={fleet.length} description="Vehicles active in registry" trend="+3 trucks" trendDirection="up" />
            <StatCard title="Active Branches Setup" value={`${branches.length} Depots`} description="Terminals fully configured" trend="Stable" trendDirection="neutral" />
            <StatCard title="Workforce headcount" value={`${drivers.length + 4} Staff`} description="Drivers, Attendants & Admins" trend="+2 hired" trendDirection="up" />
            <StatCard title="Registered Shippers" value={`${customers.length} Accounts`} description="Configured billing customers" trend="+1 new" trendDirection="up" />
          </div>

          {/* Expense Reminders & Overdue Alerts automatically */}
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-left">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="h-4.5 w-4.5" />
                <span className="text-xs font-bold uppercase tracking-wider">Expense Reminders & Overdue Alerts</span>
              </div>
              <p className="text-slate-300 text-xs">
                Alert: <strong>3 Vehicle DOT Inspections</strong> are overdue this week. <strong>2 outstanding Net-30 invoices</strong> have breached payment agreements.
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => triggerToast('Auto-alert reminders sent to billing contacts.')}>
                Trigger Reminders
              </Button>
              <Button size="sm" variant="outline" onClick={() => triggerToast('Maintenance routing alerts dispatched to dispatch board.')}>
                Route Vehicles
              </Button>
            </div>
          </div>

          <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left">
            <h3 className="text-sm font-extrabold text-white mb-3">Operational Fleet Capacity Utilization %</h3>
            <MiniChart type="line" data={[78, 85, 82, 88, 94, 91]} labels={['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6']} />
          </div>
        </div>
      )}

      {/* Branches Setup Screen */}
      {activeTab === 'branches' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h3 className="text-sm font-extrabold text-white">Branch Depots</h3>
            <SearchInput value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onClear={() => setSearchQuery('')} className="max-w-[200px]" />
          </div>
          
          <DataTable columns={[
            { key: 'name', label: 'Depot Name', render: (row) => <span className="font-extrabold text-white">{row.name}</span> },
            { key: 'address', label: 'Address', render: (row) => <span className="text-slate-300 font-semibold">{row.address}</span> },
            { key: 'manager', label: 'Manager Email', render: (row) => <span className="text-slate-400 font-mono text-[11px]">{row.manager}</span> },
            { key: 'staff', label: 'Staff Count', render: (row) => <span className="font-mono">{row.staff} Users</span> },
            { key: 'actions', label: 'Actions', render: (row) => (
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => handleOpenInspect(row, 'branch')}>Inspect</Button>
                <Button size="sm" variant="outline" onClick={() => triggerToast(`Editing branch ${row.name}...`)}>Edit Branch</Button>
              </div>
            ) }
          ]} data={paginatedList} />
          
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      {/* Customer / Shipper Settings Screen */}
      {activeTab === 'customers' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h3 className="text-sm font-extrabold text-white">Customer Shipper Database</h3>
            <SearchInput value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onClear={() => setSearchQuery('')} className="max-w-[200px]" />
          </div>

          <DataTable columns={[
            { key: 'name', label: 'Company Name', render: (row) => <span className="font-extrabold text-white">{row.name}</span> },
            { key: 'email', label: 'Billing Email', render: (row) => <span className="text-slate-300 font-mono text-[11px]">{row.email}</span> },
            { key: 'contract', label: 'Agreement Contract', render: (row) => <span className="text-slate-400 font-semibold">{row.contract}</span> },
            { key: 'billing', label: 'Billing Net Terms', render: (row) => <span className="font-bold text-brand-400">{row.billing}</span> },
            { key: 'actions', label: 'Actions', render: (row) => <Button size="sm" variant="secondary" onClick={() => handleOpenInspect(row, 'customer')}>Inspect</Button> }
          ]} data={paginatedList} />

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      {/* Driver Registry Screen */}
      {activeTab === 'drivers' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h3 className="text-sm font-extrabold text-white">Active Driver Registry</h3>
            <SearchInput value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onClear={() => setSearchQuery('')} className="max-w-[200px]" />
          </div>

          <DataTable columns={[
            { key: 'name', label: 'Driver Operator Name', render: (row) => <span className="font-extrabold text-white">{row.name}</span> },
            { key: 'email', label: 'Portal Email', render: (row) => <span className="text-slate-300 font-mono text-[11px]">{row.email}</span> },
            { key: 'plate', label: 'Active Assigned Vehicle', render: (row) => <span className="font-mono text-brand-400">{row.plate}</span> },
            { key: 'rating', label: 'Performance Rating', render: (row) => <span className="font-bold text-yellow-400 font-mono">★ {row.rating}</span> },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            { key: 'actions', label: 'Actions', render: (row) => <Button size="sm" variant="secondary" onClick={() => handleOpenInspect(row, 'driver')}>Inspect</Button> }
          ]} data={paginatedList} />

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      {/* Fleet Register Screen */}
      {activeTab === 'fleet' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h3 className="text-sm font-extrabold text-white">Active Fleet Vehicles</h3>
            <SearchInput value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onClear={() => setSearchQuery('')} className="max-w-[200px]" />
          </div>

          {fleetLoading && fleet.length === 0 ? (
            <TableSkeleton rows={4} cols={5} />
          ) : (
            <>
              <DataTable columns={[
                { key: 'plate', label: 'Plate Number', render: (row) => <span className="font-extrabold text-white">{row.plate}</span> },
                { key: 'type', label: 'Vehicle Type', render: (row) => <span className="text-slate-300 font-semibold">{row.type}</span> },
                { key: 'compliance', label: 'Safety Compliance', render: (row) => (
                  row.complianceChecked ? (
                    <span className="text-[10px] text-emerald-400 font-bold">✓ Compliant ({row.odometer} mi)</span>
                  ) : (
                    <span className="text-[10px] text-amber-500 font-bold">⚠️ Pending Inspection</span>
                  )
                )},
                { key: 'capacity', label: 'Weight Capacity', render: (row) => <span className="font-mono">{row.capacity}</span> },
                { key: 'branch', label: 'Branch Depot', render: (row) => <span className="text-slate-400">{row.branch || 'Chicago HQ'}</span> },
                { key: 'status', label: 'Operational Status', render: (row) => <StatusBadge status={row.status} /> },
                { key: 'actions', label: 'Actions', render: (row) => <Button size="sm" variant="secondary" onClick={() => handleOpenInspect(row, 'fleet')}>Inspect</Button> }
              ]} data={paginatedList} />

              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </>
          )}
        </div>
      )}

      {/* Trailer Spots Screen */}
      {activeTab === 'trailers' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h3 className="text-sm font-extrabold text-white">Trailer Spots Registry</h3>
            <SearchInput value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onClear={() => setSearchQuery('')} className="max-w-[200px]" />
          </div>

          <DataTable columns={[
            { key: 'plate', label: 'Trailer Plate', render: (row) => <span className="font-mono font-extrabold text-white">{row.plate}</span> },
            { key: 'type', label: 'Container Type', render: (row) => <span className="text-slate-300 font-semibold">{row.type}</span> },
            { key: 'spot', label: 'Parking Spot Location', render: (row) => <span className="text-brand-400 font-bold">{row.spot}</span> },
            { key: 'status', label: 'Spot State', render: (row) => <StatusBadge status={row.status} /> },
            { key: 'actions', label: 'Actions', render: (row) => <Button size="sm" variant="secondary" onClick={() => handleOpenInspect(row, 'trailer')}>Inspect</Button> }
          ]} data={paginatedList} />

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      {/* Workforce availability, shift planner & leaves logs */}
      {activeTab === 'workforce' && (
        <div className="space-y-6">
          {/* Sub Tab Menu */}
          <div className="flex border-b border-[#23324C]/45 pb-px text-xs font-bold gap-4 text-left">
            {['Availability Calendar', 'Shift Planner', 'Leave Registry'].map(sub => (
              <button 
                key={sub}
                onClick={() => triggerToast(`Workforce view switched to: ${sub}`)}
                className="capitalize pb-2 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {sub}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: Capacity and Calendar display */}
            <div className="lg:col-span-7 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-white">Workforce Availability & Leave Calendar</h3>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">88% Capacity Available</span>
              </div>

              {/* Roster Calendar Grid */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-slate-400">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="p-1 bg-slate-900/60 border border-[#23324C]/40 rounded-lg text-slate-400 uppercase tracking-wider">{day}</div>
                ))}
                {Array.from({ length: 14 }).map((_, idx) => {
                  const dayNum = (idx % 7) + 1;
                  const isAvailable = idx !== 4 && idx !== 9;
                  return (
                    <div 
                      key={idx} 
                      onClick={() => triggerToast(`Day ${idx+1} selected. Roster capacity: 8/9 drivers.`)}
                      className={`p-3 border rounded-xl cursor-pointer transition-all ${
                        isAvailable 
                          ? 'bg-slate-900/40 border-[#23324C]/40 text-white hover:border-brand-500/30' 
                          : 'bg-red-500/5 border-red-500/15 text-red-400'
                      }`}
                    >
                      <span className="block text-[8px] font-semibold text-slate-500 mb-1">{idx+1} Jun</span>
                      <strong className="block text-xs">{isAvailable ? 'Active' : 'Off'}</strong>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between gap-4 flex-wrap pt-2">
                <button 
                  onClick={() => triggerToast('Mock Availability slot added successfully.')}
                  className="px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs rounded-xl font-black transition-all cursor-pointer"
                >
                  Add Availability
                </button>
                <button 
                  onClick={() => triggerToast('Mock Leave request form loaded.')}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs rounded-xl font-bold transition-all cursor-pointer"
                >
                  Add Leave Request
                </button>
              </div>
            </div>

            {/* Right: Shift Planner */}
            <div className="lg:col-span-5 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-white">Roster Shift Planner</h3>
                <p className="text-[10px] text-slate-500 font-semibold mb-3">Schedule operational shifts for active drivers and yard attendants.</p>
              </div>

              <div className="space-y-3.5 my-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Select Employee</label>
                  <select id="shift-driver-select" className="w-full px-3.5 py-2 bg-[#111827] border border-[#23324C] rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500">
                    <option value="John D.">John D. (Driver)</option>
                    <option value="Sarah R.">Sarah R. (Driver)</option>
                    <option value="Michael S.">Michael S. (Yard Attendant)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Branch Location</label>
                  <select id="shift-branch-select" className="w-full px-3.5 py-2 bg-[#111827] border border-[#23324C] rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500">
                    <option value="Chicago HQ">Chicago HQ Terminal</option>
                    <option value="Dallas Depot">Dallas Depot</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Shift Hours</label>
                  <input type="text" id="shift-hours" defaultValue="08:00 - 16:00 (8 hrs)" className="w-full px-3.5 py-2 bg-[#111827] border border-[#23324C] rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500" />
                </div>
              </div>

              <button 
                onClick={() => {
                  const emp = document.getElementById('shift-driver-select').value;
                  const hr = document.getElementById('shift-hours').value;
                  triggerToast(`Shift scheduled successfully for ${emp} (${hr}).`);
                }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-white text-xs rounded-xl font-bold transition-all cursor-pointer"
              >
                Assign Shift
              </button>
            </div>
          </div>

          {/* Leave approvals table */}
          <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
            <h3 className="text-sm font-extrabold text-white">Leave Approval Requests</h3>
            <DataTable columns={[
              { key: 'employee', label: 'Personnel Employee', render: (row) => <span className="font-extrabold text-white">{row.employee}</span> },
              { key: 'type', label: 'Leave Reason Type', render: (row) => <span className="text-slate-355 font-semibold">{row.type}</span> },
              { key: 'start', label: 'Start Date', render: (row) => <span className="text-slate-400 font-mono text-xs">{row.start}</span> },
              { key: 'end', label: 'End Date', render: (row) => <span className="text-slate-400 font-mono text-xs">{row.end}</span> },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
              { key: 'actions', label: 'Leave Approval Actions', render: (row) => (
                row.status === 'Pending' ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleApproveLeave(row.id)}>Approve Leave</Button>
                    <Button size="sm" variant="secondary" onClick={() => handleRejectLeave(row.id)}>Reject</Button>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-500 font-semibold">Action Finalized</span>
                )
              )}
            ]} data={leaves} />
          </div>
        </div>
      )}

      {/* Customer Instructions Module (Priority 5) */}
      {activeTab === 'instructions' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-5">
          <div>
            <h3 className="text-sm font-extrabold text-white">Customer Instructions Registry</h3>
            <p className="text-xs text-slate-400">Attach special handling directives, address alerts, or loading instructions to customers, loads, and stop terminals.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Create Instruction Form */}
            <form onSubmit={handleCreateInstruction} className="lg:col-span-5 bg-[#111827]/60 border border-[#23324C] rounded-2xl p-5 space-y-4">
              <strong className="text-xs text-slate-200 block">Create Instruction Alert</strong>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold uppercase text-[9px]">Instruction Category</label>
                  <select 
                    value={newInsType} 
                    onChange={(e) => setNewInsType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#111827] border border-[#23324C] rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="Customer Instructions">Customer Instructions</option>
                    <option value="Delivery Instructions">Delivery Instructions</option>
                    <option value="Address Instructions">Address Instructions</option>
                    <option value="Special Handling Instructions">Special Handling Instructions</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold uppercase text-[9px]">Attachment Scope Type</label>
                  <select 
                    value={newInsScopeType} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewInsScopeType(val);
                      if (val === 'Customer') setNewInsScopeValue('Global Retail Corp');
                      else if (val === 'Address') setNewInsScopeValue('Chicago HQ Terminal');
                      else setNewInsScopeValue('LD-9411');
                    }}
                    className="w-full px-3 py-2 bg-[#111827] border border-[#23324C] rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="Customer">Customer Account</option>
                    <option value="Address">Address / Stop Terminal</option>
                    <option value="Load">Load ID</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold uppercase text-[9px]">Select Scope Target</label>
                  <select 
                    value={newInsScopeValue} 
                    onChange={(e) => setNewInsScopeValue(e.target.value)}
                    className="w-full px-3 py-2 bg-[#111827] border border-[#23324C] rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    {newInsScopeType === 'Customer' && [
                      'Global Retail Corp', 'Memphis Shippers Inc', 'Vance Refrigeration', 'HEB Distributors', 'Seattle Metalworks', 'East Coast Textiles'
                    ].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    {newInsScopeType === 'Address' && [
                      'Chicago HQ Terminal', 'Los Angeles Depot', 'Dallas Depot', 'Portland Metal Distributors, Dock #2', 'Seattle Metalworks Dock #4', 'Houston Logistics Hub, Lane 4', 'Atlanta Depot'
                    ].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    {newInsScopeType === 'Load' && [
                      'LD-9411', 'LD-1102', 'LD-4809', 'LD-7712'
                    ].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-2 py-1.5">
                  <input
                    type="checkbox"
                    id="ins-critical-chk"
                    checked={newInsIsCritical}
                    onChange={(e) => setNewInsIsCritical(e.target.checked)}
                    className="rounded border-[#23324C] text-brand-500 focus:ring-brand-500 h-4 w-4 cursor-pointer"
                  />
                  <label htmlFor="ins-critical-chk" className="text-[10px] font-bold text-red-400 uppercase tracking-wider cursor-pointer">
                    Flag as Critical / High Priority (Requires Driver Acknowledgement)
                  </label>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold uppercase text-[9px]">Directives / Instructions Alert</label>
                  <textarea 
                    value={newInsText}
                    onChange={(e) => setNewInsText(e.target.value)}
                    placeholder="e.g. Call supervisor on arrival; check gate clearance..." 
                    className="w-full h-20 px-3 py-2 bg-[#111827] border border-[#23324C] rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder:text-slate-550" 
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-2 bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs rounded-xl font-black transition-all cursor-pointer"
              >
                Attach Instruction
              </button>
            </form>

            {/* Linked Instructions Registry list */}
            <div className="lg:col-span-7 space-y-4">
              <strong className="text-xs text-slate-200 block">Linked Special Instructions</strong>
              <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
                {(customerInstructions || []).length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">No special instructions registered.</p>
                ) : (
                  (customerInstructions || []).map((item) => (
                    <div key={item.id} className={`p-4 bg-[#111827]/40 border rounded-xl text-xs space-y-2.5 transition-all ${
                      item.isCritical ? 'border-red-500/30 bg-red-500/5' : 'border-[#23324C]'
                    }`}>
                      <div className="flex justify-between items-center border-b border-[#23324C]/40 pb-1.5 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                            item.isCritical ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {item.isCritical ? '🚨 CRITICAL' : item.type}
                          </span>
                          {item.isCritical && (
                            <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-semibold uppercase">
                              Needs Driver Conf
                            </span>
                          )}
                        </div>
                        <strong className="text-[10px] text-slate-400 font-mono">{item.scope}</strong>
                      </div>

                      {editingInsId === item.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editingInsText}
                            onChange={(e) => setEditingInsText(e.target.value)}
                            className="w-full h-16 px-3 py-2 bg-[#111827] border border-brand-500 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                          />
                          <div className="flex gap-2 justify-end">
                            <Button size="xs" variant="primary" onClick={() => handleSaveEditIns(item)}>Save</Button>
                            <Button size="xs" variant="secondary" onClick={() => { setEditingInsId(null); setEditingInsText(''); }}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-slate-200 italic">"{item.text}"</p>
                          <div className="flex justify-between items-center border-t border-[#23324C]/25 pt-2 text-[9px] text-slate-500 font-medium">
                            <div className="flex gap-2">
                              <span>Created by: {item.createdBy || 'System'}</span>
                              <span>•</span>
                              <span>At: {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}</span>
                            </div>
                            <div className="flex gap-2.5">
                              <button 
                                onClick={() => handleStartEditIns(item)}
                                className="text-brand-400 hover:text-brand-300 font-bold flex items-center gap-0.5 cursor-pointer"
                              >
                                <Edit2 className="h-3 w-3" /> Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteIns(item.id)}
                                className="text-red-400 hover:text-red-300 font-bold flex items-center gap-0.5 cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3" /> Delete
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Asset Register Screen */}
      {activeTab === 'assets' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
          <h3 className="text-sm font-extrabold text-white">Physical Warehouse Asset Register</h3>
          <DataTable columns={[
            { key: 'name', label: 'Asset Name', render: (row) => <span className="font-extrabold text-white">{row.name}</span> },
            { key: 'type', label: 'Category Type', render: (row) => <span className="text-slate-300">{row.type}</span> },
            { key: 'serial', label: 'Serial Number', render: (row) => <span className="font-mono text-[10px] text-slate-400">{row.serial}</span> },
            { key: 'status', label: 'State', render: (row) => <StatusBadge status={row.status} /> }
          ]} data={assets} />
        </div>
      )}

      {/* Loads Screen */}
      {activeTab === 'loads' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-white">Operational Shipments</h3>
            <Button size="sm" variant="primary" onClick={() => triggerToast('Transfer Load request initiated.')}>
              Transfer Load
            </Button>
          </div>
          <DataTable columns={[
            { key: 'id', label: 'Load ID', render: () => <span>#LD-9411</span> },
            { key: 'route', label: 'Route', render: () => <span>Chicago ➔ Dallas</span> },
            { key: 'cargo', label: 'Cargo Cargo', render: () => <span>Engine Components</span> },
            { key: 'status', label: 'Status', render: () => <StatusBadge status="Transit" /> }
          ]} data={[{}]} />
        </div>
      )}

      {/* Dispatch Screen */}
      {activeTab === 'dispatch' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-white">Dispatch Scheduling Board</h3>
            <Button size="sm" variant="primary" onClick={() => triggerToast('Shift assigned from Dispatch board.')}>
              Assign Shift
            </Button>
          </div>
          <p className="text-xs text-slate-400">Manage daily dispatcher loads and assign operators directly.</p>
        </div>
      )}

      {/* Warehouse / Yard Screen */}
      {activeTab === 'warehouse-yard' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-white">Depot Storage Configuration</h3>
            <Button size="sm" variant="secondary" onClick={() => triggerToast('Custom Niche Fields configuration modal loaded.')}>
              Configure Niche Fields
            </Button>
          </div>
          <p className="text-xs text-slate-400">Edit layout lanes, loading slots, and custom inventory definitions.</p>
        </div>
      )}

      {/* Accounts Screen */}
      {activeTab === 'accounts' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-white">Company Admin Financial Overview</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="primary" onClick={() => triggerToast('Loading branch P&L metrics')}>
                View Branch P&L
              </Button>
              <Button size="sm" variant="secondary" onClick={() => triggerToast('Financial statement PDF generated successfully.')}>
                Export Report
              </Button>
            </div>
          </div>
          <p className="text-xs text-slate-400">Audit company invoices, contractor cashflows, and payroll ledgers.</p>
        </div>
      )}

      {activeTab === 'payroll' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
          <h3 className="text-sm font-extrabold text-white">Company Payroll Settlement</h3>
          <p className="text-xs text-slate-400">Process driver payroll, contractor checks, and payroll summaries.</p>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
          <h3 className="text-sm font-extrabold text-white">Asset Expenses & Reminders</h3>
          <p className="text-xs text-slate-400">Configure recurring alerts, road toll reviews, and maintenance invoices.</p>
        </div>
      )}

      {/* Inter-Company Transfers Screen */}
      {activeTab === 'transfers' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-5">
          <div>
            <h3 className="text-sm font-extrabold text-white">Inter-Company Transfers Registry</h3>
            <p className="text-xs text-slate-400">Initiate, review, and track custody transfers of loads and item assets.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Initiate Transfer Form Panel */}
            <div className="lg:col-span-5 bg-[#111827]/60 border border-[#23324C] rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div>
                <strong className="text-xs text-slate-200 block">Transfer Logistics Custody</strong>
                <p className="text-[10px] text-slate-450 mt-0.5">Initiate sub-contracting transfers of loads or item assets.</p>
              </div>

              <div className="space-y-3.5 my-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Transfer Item Type</label>
                  <select id="ca-tx-type-select" className="w-full px-3 py-2 bg-[#111827] border border-[#23324C] rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500">
                    <option value="Load Transfer">Transfer Load</option>
                    <option value="Asset/Car Transfer">Transfer Item/Car</option>
                    <option value="Delivery Section Transfer">Transfer Delivery Section</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Select Target</label>
                  <select id="ca-tx-target-select" className="w-full px-3 py-2 bg-[#111827] border border-[#23324C] rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500">
                    <option value="LD-9411 (Chicago ➔ Dallas)">LD-9411 (Cargo: Auto Components)</option>
                    <option value="VIN: 1YV1HP82A81920 (Ford Mustang)">VIN: 1YV1HP82A81920 (Ford Mustang)</option>
                    <option value="Delivery Section B (Stop 2 ➔ Stop 3)">Delivery Section B (Stop 2 ➔ Stop 3)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Target Transport Partner</label>
                  <select id="ca-tx-partner-select" className="w-full px-3 py-2 bg-[#111827] border border-[#23324C] rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500">
                    <option value="Super Freight Carriers">Super Freight Carriers</option>
                    <option value="Car Transporters Co">Car Transporters Co</option>
                    <option value="Rapid Logistics SA">Rapid Logistics SA</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={() => {
                  const type = document.getElementById('ca-tx-type-select').value;
                  const target = document.getElementById('ca-tx-target-select').value;
                  const partner = document.getElementById('ca-tx-partner-select').value;
                  initiateTransfer(type, target, 'Hero Logistics Ltd', partner);
                  triggerToast(`Inter-company transfer initiated successfully.`);
                }}
                className="w-full py-2 bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs rounded-xl font-black transition-all cursor-pointer shadow-lg shadow-brand-500/10"
              >
                Create Transfer
              </button>
            </div>

            {/* Registry & Custody Timeline */}
            <div className="lg:col-span-7 space-y-4">
              <strong className="text-xs text-slate-200 block">Custody & Chain of History</strong>
              
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {(transfers || []).length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">No inter-company transfers logged.</p>
                ) : (
                  (transfers || []).map(tx => (
                    <div key={tx.id} className="p-4 bg-[#111827]/40 border border-[#23324C] rounded-xl space-y-3.5">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono font-bold block">{tx.type}</span>
                          <strong className="text-white text-xs block mt-0.5">{tx.target}</strong>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          tx.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                          tx.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {tx.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Custody Timeline detail zone */}
                      <div className="text-[11px] text-slate-450 border-t border-[#23324C]/25 pt-2">
                        <strong className="text-[10px] text-slate-400 block mb-1">Chain of Custody Logs</strong>
                        <div className="space-y-3 pl-3 border-l border-[#23324C]/80 ml-1.5 py-1">
                          <div className="relative pl-1">
                            <span className="absolute left-[-16px] top-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="font-extrabold text-slate-200">Current Owner: {tx.toCompany}</span>
                              <span className="text-slate-550 font-mono">Active</span>
                            </div>
                          </div>
                          {(tx.custodyChain || []).map((log, idx) => (
                            <div key={idx} className="relative pl-1">
                              <span className="absolute left-[-16px] top-1.5 w-1.5 h-1.5 rounded-full bg-slate-600" />
                              <div className="text-slate-350 text-[10px]">
                                Party: <strong className="text-slate-200">{log.party}</strong> | Action: {log.action}
                              </div>
                              <span className="text-[9px] text-slate-500 font-mono">{log.timestamp}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {tx.status === 'pending' && (
                        <div className="flex gap-2 pt-2 border-t border-[#23324C]/25">
                          <button 
                            onClick={() => {
                              acceptTransfer(tx.id, 'Company Admin');
                              triggerToast('Inter-company transfer accepted!');
                            }}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] rounded-xl font-bold transition-all cursor-pointer"
                          >
                            Accept Transfer
                          </button>
                          <button 
                            onClick={() => {
                              rejectTransfer(tx.id, 'Company Admin');
                              triggerToast('Inter-company transfer rejected.', 'warning');
                            }}
                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[11px] rounded-xl font-bold transition-all cursor-pointer"
                          >
                            Reject Transfer
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-white">Operator Permissions Configuration Matrix</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="primary" onClick={() => triggerToast('New custom security role created.')}>
                Create Role
              </Button>
              <Button size="sm" variant="success" onClick={() => triggerToast('Role permissions saved.')}>
                Set Permissions
              </Button>
            </div>
          </div>
          <p className="text-xs text-slate-400">Bind action buttons dynamically to customized role permissions.</p>
        </div>
      )}

      {/* General Add Item Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title={`Register New ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('s', '')}`}>
        <form onSubmit={handleAddItemSubmit} className="space-y-4">
          <TextInput label="Name / Unique Plate ID" required placeholder="e.g. TR-4022" value={formName} onChange={(e) => setFormName(e.target.value)} />
          
          {activeTab === 'branches' && (
            <>
              <TextInput label="Terminal Location Address" placeholder="e.g. 100 Logistics Blvd" value={formType} onChange={(e) => setFormType(e.target.value)} />
              <TextInput label="Branch Manager Email" placeholder="e.g. manager@hero.com" value={formValue} onChange={(e) => setFormValue(e.target.value)} />
            </>
          )}

          {activeTab === 'customers' && (
            <>
              <TextInput label="Client Billing Email" placeholder="billing@client.com" value={formType} onChange={(e) => setFormType(e.target.value)} />
              <SelectInput label="Net Billing Terms" value={formValue} onChange={(e) => setFormValue(e.target.value)} options={[
                { value: 'Net 15', label: 'Net 15 Days' },
                { value: 'Net 30', label: 'Net 30 Days' },
                { value: 'Net 60', label: 'Net 60 Days' }
              ]} />
            </>
          )}

          {activeTab === 'drivers' && (
            <>
              <TextInput label="Portal Registry Email" type="email" placeholder="driver@hero.com" value={formType} onChange={(e) => setFormType(e.target.value)} />
              <TextInput label="Assigned Vehicle plate" placeholder="TX-ROAD88" value={formValue} onChange={(e) => setFormValue(e.target.value)} />
            </>
          )}

          {activeTab === 'fleet' && (
            <>
              <SelectInput label="Vehicle Type" value={formType} onChange={(e) => setFormType(e.target.value)} options={[
                { value: 'Semi-Truck', label: 'Semi-Truck' },
                { value: 'Flatbed Trailer', label: 'Flatbed Trailer' },
                { value: 'Box Truck', label: 'Box Truck' }
              ]} />
              <TextInput label="Capacity Limit" placeholder="45,000 lbs" value={formValue} onChange={(e) => setFormValue(e.target.value)} />
            </>
          )}

          {activeTab === 'trailers' && (
            <>
              <SelectInput label="Trailer Type" value={formType} onChange={(e) => setFormType(e.target.value)} options={[
                { value: 'Dry Van', label: 'Dry Van' },
                { value: 'Reefer (Cold)', label: 'Reefer' },
                { value: 'Flatbed', label: 'Flatbed' }
              ]} />
              <TextInput label="Terminal Parking Spot" placeholder="e.g. Chicago A-4" value={formValue} onChange={(e) => setFormValue(e.target.value)} />
            </>
          )}

          {activeTab === 'assets' && (
            <>
              <TextInput label="Asset Category Description" placeholder="Barcode scanner" value={formType} onChange={(e) => setFormType(e.target.value)} />
              <TextInput label="Serial / barcode Tag" placeholder="SN-1022384" value={formValue} onChange={(e) => setFormValue(e.target.value)} />
            </>
          )}

          <Button type="submit" variant="primary" className="w-full">
            Save Registry Record
          </Button>
        </form>
      </Modal>

      {/* Details Drawer */}
      <Drawer isOpen={detailsDrawerOpen} onClose={() => setDetailsDrawerOpen(false)} title={`${drawerType.toUpperCase()} Detail Inspector`}>
        {selectedItem && (
          <div className="space-y-5 text-left text-slate-350 text-xs sm:text-sm flex flex-col h-full overflow-y-auto pr-1">
            <div className="border-b border-[#23324C]/65 pb-3">
              <h4 className="text-base font-extrabold text-white mb-1.5">{selectedItem.name || selectedItem.plate}</h4>
              <div className="flex justify-between items-center">
                <StatusBadge status={selectedItem.status} />
                <span className="text-[10px] font-mono text-slate-500 font-bold">ID: {selectedItem.id}</span>
              </div>
            </div>

            {/* Render Tabs for Fleet and Drivers */}
            {drawerType === 'fleet' && (
              <Tabs 
                tabs={[
                  { id: 'profile', label: 'Profile Specs', icon: Truck },
                  { id: 'maintenance', label: 'Service History', icon: Calendar },
                  { id: 'schedule', label: 'Schedule', icon: Calendar },
                  { id: 'inspections', label: 'DOT Inspection', icon: Shield }
                ]} 
                activeTab={inspectTab} 
                onChange={setInspectTab} 
                className="border-[#23324C]/40"
              />
            )}

            {drawerType === 'driver' && (
              <Tabs 
                tabs={[
                  { id: 'profile', label: 'Profile', icon: Users },
                  { id: 'docs', label: 'CDL Docs', icon: Calendar },
                  { id: 'compliance', label: 'Compliance & Logs', icon: Shield },
                  { id: 'performance', label: 'Safety Trend', icon: UserCheck }
                ]} 
                activeTab={inspectTab} 
                onChange={setInspectTab} 
                className="border-[#23324C]/40"
              />
            )}

            <div className="flex-1 py-1">
              {/* --- BRANCH DETAIL --- */}
              {drawerType === 'branch' && (
                <div className="space-y-3.5">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Address Location</span>
                    <strong className="text-white text-xs">{selectedItem.address}, {selectedItem.city}, {selectedItem.state}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">HQ Operations Manager</span>
                    <span className="text-xs font-mono text-slate-350">{selectedItem.manager}</span>
                  </div>
                </div>
              )}

              {/* --- CUSTOMER DETAIL --- */}
              {drawerType === 'customer' && (
                <div className="space-y-3.5">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Client Contact Billing</span>
                    <strong className="text-white text-xs font-mono">{selectedItem.email}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Contract Terms</span>
                    <span className="text-xs text-slate-300">{selectedItem.contract} ({selectedItem.billing})</span>
                  </div>
                </div>
              )}

              {/* --- TRAILER DETAIL --- */}
              {drawerType === 'trailer' && (
                <div className="space-y-3.5">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Parking Slot</span>
                    <strong className="text-white text-xs font-mono">{selectedItem.spot}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Trailer Specifications</span>
                    <span className="text-xs text-slate-300">{selectedItem.type} Container</span>
                  </div>
                </div>
              )}

              {/* --- FLEET VEHICLE COMPLIANCE TABS --- */}
              {drawerType === 'fleet' && (
                <div className="space-y-4">
                  {inspectTab === 'profile' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-900/40 border border-[#23324C]/40 rounded-xl">
                          <span className="text-[9px] text-slate-500 font-bold uppercase block">Vehicle Plate / Type</span>
                          <strong className="text-white text-xs block mt-1">{selectedItem.plate}</strong>
                          <span className="text-[9px] text-slate-400 block mt-0.5">{selectedItem.type}</span>
                        </div>
                        <div className="p-3 bg-slate-900/40 border border-[#23324C]/40 rounded-xl">
                          <span className="text-[9px] text-slate-500 font-bold uppercase block">Odometer / Efficiency</span>
                          <strong className="text-white text-xs block mt-1">{selectedItem.mileage || '10,000 miles'}</strong>
                          <span className="text-[9px] text-brand-400 font-bold block mt-0.5">{selectedItem.efficiency || '7.2 mpg'}</span>
                        </div>
                      </div>

                      {/* Expiry alerts for Registration and Insurance */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Compliance Registration</span>
                        <div className="p-3 bg-[#111827]/60 border border-[#23324C]/45 rounded-xl text-xs space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-slate-400">State Registration</span>
                            <span className="text-white font-mono">{selectedItem.registration?.state || 'TX'} ({selectedItem.registration?.number || 'REG-TX8'})</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Expiration Date</span>
                            <span className={`font-semibold font-mono ${
                              new Date(selectedItem.registration?.expires) - new Date() < 15 * 24 * 60 * 60 * 1000
                                ? 'text-red-400 animate-pulse'
                                : 'text-slate-200'
                            }`}>{selectedItem.registration?.expires || '2026-08-30'}</span>
                          </div>
                          {new Date(selectedItem.registration?.expires) - new Date() < 15 * 24 * 60 * 60 * 1000 && (
                            <div className="text-[10px] text-red-400 font-bold flex items-center gap-1 mt-1 bg-red-500/5 p-1 rounded border border-red-500/10">
                              <AlertTriangle className="h-3 w-3" /> Registration soon to expire! Renew immediately.
                            </div>
                          )}
                        </div>

                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mt-3">Insurance Policy</span>
                        <div className="p-3 bg-[#111827]/60 border border-[#23324C]/45 rounded-xl text-xs space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Policy Provider</span>
                            <span className="text-white font-bold">{selectedItem.insurance?.provider || 'Progressive'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Policy Number</span>
                            <span className="text-white font-mono">{selectedItem.insurance?.policy || 'POL-8812'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Policy Expiration</span>
                            <span className={`font-semibold font-mono ${
                              new Date(selectedItem.insurance?.expires) - new Date() < 15 * 24 * 60 * 60 * 1000
                                ? 'text-red-400 animate-pulse'
                                : 'text-slate-200'
                            }`}>{selectedItem.insurance?.expires || '2026-06-28'}</span>
                          </div>
                          {new Date(selectedItem.insurance?.expires) - new Date() < 15 * 24 * 60 * 60 * 1000 && (
                            <div className="text-[10px] text-red-400 font-bold flex items-center gap-1 mt-1 bg-red-500/5 p-1 rounded border border-red-500/10">
                              <AlertTriangle className="h-3 w-3" /> Insurance expiration warning! Policy renewal required.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {inspectTab === 'maintenance' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {(selectedItem.maintenanceHistory || []).length === 0 ? (
                          <p className="text-[11px] text-slate-500 text-center py-4">No logged service history items.</p>
                        ) : (
                          (selectedItem.maintenanceHistory || []).map((log, idx) => (
                            <div key={idx} className="p-2.5 bg-slate-900/60 border border-[#23324C]/40 rounded-xl flex justify-between text-xs">
                              <div>
                                <strong className="text-slate-200 block">{log.service}</strong>
                                <span className="text-[9px] text-slate-500 font-mono">{log.date}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-emerald-400 font-bold font-mono">{log.cost}</span>
                                <span className="text-[9px] text-slate-500 block">Completed</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Log service form */}
                      <form onSubmit={handleAddMaintenanceLog} className="p-3 bg-[#111827]/40 border border-[#23324C] rounded-xl space-y-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Log Completed Service</span>
                        <TextInput placeholder="Service Description..." required value={newServiceDesc} onChange={(e) => setNewServiceDesc(e.target.value)} />
                        <div className="grid grid-cols-2 gap-2">
                          <TextInput type="date" required value={newServiceDate} onChange={(e) => setNewServiceDate(e.target.value)} />
                          <TextInput type="number" required placeholder="Cost ($)" value={newServiceCost} onChange={(e) => setNewServiceCost(e.target.value)} />
                        </div>
                        <Button type="submit" variant="outline" size="sm" className="w-full">
                          Log Maintenance Service
                        </Button>
                      </form>
                    </div>
                  )}

                  {inspectTab === 'schedule' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {(selectedItem.serviceSchedule || []).length === 0 ? (
                          <p className="text-[11px] text-slate-500 text-center py-4">No scheduled upcoming services.</p>
                        ) : (
                          (selectedItem.serviceSchedule || []).map((sched, idx) => (
                            <div key={idx} className="p-2.5 bg-slate-900/60 border border-[#23324C]/40 rounded-xl flex justify-between text-xs">
                              <div>
                                <strong className="text-slate-200 block">{sched.service}</strong>
                                <span className="text-[9px] text-slate-400 font-mono">Scheduled: {sched.date}</span>
                              </div>
                              <span className="text-brand-400 text-[10px] font-bold">Awaiting Service</span>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Schedule service form */}
                      <form onSubmit={handleAddServiceSchedule} className="p-3 bg-[#111827]/40 border border-[#23324C] rounded-xl space-y-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Schedule New Maintenance</span>
                        <TextInput placeholder="Upcoming Service Description..." required value={newSchedDesc} onChange={(e) => setNewSchedDesc(e.target.value)} />
                        <TextInput type="date" required value={newSchedDate} onChange={(e) => setNewSchedDate(e.target.value)} />
                        <Button type="submit" variant="outline" size="sm" className="w-full">
                          Schedule Service Date
                        </Button>
                      </form>
                    </div>
                  )}

                  {inspectTab === 'inspections' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {(selectedItem.inspections || []).length === 0 ? (
                          <p className="text-[11px] text-slate-500 text-center py-4">No inspection logs in records.</p>
                        ) : (
                          (selectedItem.inspections || []).map((insp, idx) => (
                            <div key={idx} className="p-2.5 bg-slate-900/60 border border-[#23324C]/40 rounded-xl text-xs space-y-1">
                              <div className="flex justify-between">
                                <strong className="text-slate-200">{insp.date} • {insp.inspector}</strong>
                                <span className={insp.result === 'Pass' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{insp.result}</span>
                              </div>
                              <p className="text-slate-400 text-[10px]">"{insp.notes}"</p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Log inspection form */}
                      <form onSubmit={handleAddInspection} className="p-3 bg-[#111827]/40 border border-[#23324C] rounded-xl space-y-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Log Safety Inspection</span>
                        <TextInput type="date" required value={newInspDate} onChange={(e) => setNewInspDate(e.target.value)} />
                        <div className="grid grid-cols-2 gap-2">
                          <TextInput placeholder="Inspector Name..." required value={newInspInspector} onChange={(e) => setNewInspInspector(e.target.value)} />
                          <SelectInput value={newInspResult} onChange={(e) => setNewInspResult(e.target.value)} options={[
                            { value: 'Pass', label: 'Inspection Pass' },
                            { value: 'Fail', label: 'Inspection Fail' }
                          ]} />
                        </div>
                        <TextInput placeholder="Notes / Observations..." value={newInspNotes} onChange={(e) => setNewInspNotes(e.target.value)} />
                        <Button type="submit" variant="outline" size="sm" className="w-full">
                          Save Inspection Log
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* --- DRIVER COMPLIANCE & PERFORMANCE TABS --- */}
              {drawerType === 'driver' && (
                <div className="space-y-4">
                  {inspectTab === 'profile' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="divide-y divide-[#23324C]/45 bg-[#111827]/40 border border-[#23324C] rounded-xl p-3.5 space-y-2.5">
                        <div className="flex justify-between py-1 text-xs">
                          <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Driver Name</span>
                          <strong className="text-white font-bold">{selectedItem.name}</strong>
                        </div>
                        <div className="flex justify-between py-1 text-xs">
                          <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Portal Email</span>
                          <span className="text-slate-200 font-mono">{selectedItem.email}</span>
                        </div>
                        <div className="flex justify-between py-1 text-xs">
                          <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Contact Phone</span>
                          <span className="text-slate-250 font-semibold">{selectedItem.contact || '555-0100'}</span>
                        </div>
                        <div className="flex justify-between py-1 text-xs">
                          <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Assigned Truck</span>
                          <span className="text-brand-400 font-mono font-bold">{selectedItem.plate || 'Unassigned'}</span>
                        </div>
                        <div className="flex justify-between py-1 text-xs">
                          <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Total Deliveries</span>
                          <span className="text-slate-200 font-bold">{selectedItem.totalDeliveries || 0} runs</span>
                        </div>
                        <div className="flex justify-between py-1 text-xs">
                          <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">On-Time Rate</span>
                          <span className="text-emerald-400 font-bold">{selectedItem.onTimeRate || '100%'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {inspectTab === 'docs' && (
                    <div className="space-y-4 animate-fade-in text-xs">
                      {/* Document expiration warnings & inline update forms */}
                      <div className="space-y-3">
                        <div className="p-3 bg-slate-900/60 border border-[#23324C]/45 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-white">CDL Driver License</span>
                            <StatusBadge status={selectedItem.license?.status || 'Valid'} />
                          </div>
                          <p className="text-[10px] text-slate-400">License Number: <span className="font-mono text-slate-200">{selectedItem.license?.number || 'N/A'}</span></p>
                          <div className="flex items-center justify-between gap-2 mt-1">
                            <span className="text-slate-500 text-[10px]">Expires: {selectedItem.license?.expires || 'N/A'}</span>
                            <input 
                              type="date" 
                              value={selectedItem.license?.expires || ''} 
                              onChange={(e) => handleUpdateDriverDocExpiries('license', e.target.value)} 
                              className="px-2 py-1 bg-[#111827] border border-[#23324C] rounded text-[10px] text-slate-250 cursor-pointer"
                            />
                          </div>
                          {selectedItem.license?.status === 'Soon to Expire' && (
                            <span className="text-[9px] text-amber-400 font-bold block mt-1">⚠️ Warning: CDL soon to expire! Update record fields.</span>
                          )}
                        </div>

                        <div className="p-3 bg-slate-900/60 border border-[#23324C]/45 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-white">Medical Card CDL</span>
                            <StatusBadge status={selectedItem.medicalCard?.status || 'Valid'} />
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-1">
                            <span className="text-slate-500 text-[10px]">Expires: {selectedItem.medicalCard?.expires || 'N/A'}</span>
                            <input 
                              type="date" 
                              value={selectedItem.medicalCard?.expires || ''} 
                              onChange={(e) => handleUpdateDriverDocExpiries('medicalCard', e.target.value)} 
                              className="px-2 py-1 bg-[#111827] border border-[#23324C] rounded text-[10px] text-slate-250 cursor-pointer"
                            />
                          </div>
                          {selectedItem.medicalCard?.status === 'Soon to Expire' && (
                            <span className="text-[9px] text-amber-400 font-bold block mt-1">⚠️ Warning: Medical certificate renewal required soon.</span>
                          )}
                        </div>

                        <div className="p-3 bg-slate-900/60 border border-[#23324C]/45 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-white">HAZMAT Endorsement Certificate</span>
                            <StatusBadge status={selectedItem.hazmatCert?.status || 'Valid'} />
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-1">
                            <span className="text-slate-500 text-[10px]">Expires: {selectedItem.hazmatCert?.expires || 'N/A'}</span>
                            <input 
                              type="date" 
                              value={selectedItem.hazmatCert?.expires || ''} 
                              onChange={(e) => handleUpdateDriverDocExpiries('hazmatCert', e.target.value)} 
                              className="px-2 py-1 bg-[#111827] border border-[#23324C] rounded text-[10px] text-slate-250 cursor-pointer"
                            />
                          </div>
                          {selectedItem.hazmatCert?.status === 'Soon to Expire' && (
                            <span className="text-[9px] text-amber-400 font-bold block mt-1">⚠️ Warning: HAZMAT certificate near expiration warning!</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {inspectTab === 'compliance' && (
                    <div className="space-y-4 animate-fade-in text-xs">
                      <div className="p-3 bg-slate-900/60 border border-[#23324C]/45 rounded-xl space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">ELD Log compliance Audit</span>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Hours of Service (HOS) Violations</span>
                          <span className={`font-bold ${selectedItem.complianceRecords?.eldViolations > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {selectedItem.complianceRecords?.eldViolations || 0} Violations
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Drug Screening Status</span>
                          <span className="text-emerald-400 font-bold">Clear / Passed</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Background Verification Date</span>
                          <span className="text-white font-mono">{selectedItem.complianceRecords?.backgroundCheckDate || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Training courses */}
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mt-3">Completed Training Courses</span>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {(selectedItem.trainingRecords || []).length === 0 ? (
                          <p className="text-[11px] text-slate-500 text-center py-2">No training files cataloged.</p>
                        ) : (
                          (selectedItem.trainingRecords || []).map((course, idx) => (
                            <div key={idx} className="p-2.5 bg-[#111827]/40 border border-[#23324C]/30 rounded-xl flex justify-between">
                              <div>
                                <span className="font-bold text-slate-200 block">{course.course}</span>
                                <span className="text-[9px] text-slate-500 font-mono">{course.date}</span>
                              </div>
                              <span className="text-brand-400 font-bold font-mono">{course.score}</span>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add course form */}
                      <form onSubmit={handleAddTrainingRecord} className="p-3 bg-[#111827]/45 border border-[#23324C] rounded-xl space-y-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Log Course Completion</span>
                        <TextInput placeholder="Course Title..." required value={newCourseName} onChange={(e) => setNewCourseName(e.target.value)} />
                        <div className="grid grid-cols-2 gap-2">
                          <TextInput type="date" required value={newCourseDate} onChange={(e) => setNewCourseDate(e.target.value)} />
                          <TextInput placeholder="Score (e.g. 98%)" value={newCourseScore} onChange={(e) => setNewCourseScore(e.target.value)} />
                        </div>
                        <Button type="submit" variant="outline" size="sm" className="w-full">
                          Register Completed Course
                        </Button>
                      </form>
                    </div>
                  )}

                  {inspectTab === 'performance' && (
                    <div className="space-y-4 animate-fade-in text-xs">
                      {/* Safety trend Recharts */}
                      <div className="p-3 bg-[#111827]/50 border border-[#23324C] rounded-xl text-center space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Safety Index Score Trend</span>
                        <div className="h-32 w-full text-slate-200">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={(selectedItem.safetyTrend || [95, 96, 98, 100]).map((score, index) => ({ name: `Pt ${index+1}`, score }))}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#23324C" />
                              <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                              <YAxis domain={[90, 100]} stroke="#64748b" fontSize={9} />
                              <Tooltip contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#23324C', fontSize: '9px' }} />
                              <Line type="monotone" dataKey="score" stroke="#0ea0ea" strokeWidth={2.5} activeDot={{ r: 4 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold mt-1">Graph updates reactively using driving telemetry logs.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* General Actions */}
            <div className="flex gap-2 border-t border-[#23324C]/60 pt-4 mt-auto">
              {(drawerType === 'fleet' || drawerType === 'driver') && (
                <Button variant="danger" size="sm" onClick={handleDeactivateItem} className="w-1/3">
                  Suspend / Del
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={() => setDetailsDrawerOpen(false)} className="flex-grow">
                Close Inspector
              </Button>
            </div>
          </div>
        )}
      </Drawer>

    </div>
  );
}
