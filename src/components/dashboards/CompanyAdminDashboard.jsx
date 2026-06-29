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
  Trash2, Shield, Calendar, Key, UserCheck, AlertTriangle, Activity, DollarSign, Package, BarChart3,
  Bell, Search, FileText, Download, Sparkles, XCircle, X, Edit, Settings
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, AreaChart, Area, Legend } from 'recharts';
import AlertsReminders from './AlertsReminders';
import PermissionsPanel from './PermissionsPanel';

export default function CompanyAdminDashboard({ activeTab: initialActiveTab = 'overview' }) {
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
  const [addAlertModalOpen, setAddAlertModalOpen] = useState(false);
  
  // Add User Modal State
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '', lastName: '', email: '', phone: '', employeeId: '', role: 'Company Admin', branch: '', status: 'Active', permissions: []
  });

  // Assign User Modal State
  const [assignUserModalOpen, setAssignUserModalOpen] = useState(false);
  const [isAssigningUser, setIsAssigningUser] = useState(false);
  const [assignUser, setAssignUser] = useState({
    userId: '', currentBranch: 'Chicago HQ Terminal', assignToBranch: '', effectiveDate: '', position: '', notes: ''
  });

  // Permissions Options
  const permissionOptions = [
    'View Reports', 'Manage Fleet', 'Approve Expenses', 'Manage Users',
    'Edit Branch Settings', 'Dispatch Loads', 'View Billing', 'Audit Logs'
  ];

  // Submit Handlers
  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.branch) {
      triggerToast('Please fill in all required fields.', 'error');
      return;
    }
    
    // Check permission validation
    if (!checkPermission('manageUsers', 'create a new user')) return;
    
    setIsSavingUser(true);
    setTimeout(() => {
      const createdUser = {
        id: newUser.employeeId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        ...newUser
      };
      
      setUsers(prev => [createdUser, ...prev]);
      
      // Log audit
      logAuditEvent('User Created', `Created user ${newUser.firstName} ${newUser.lastName} (${newUser.email}) assigned to ${newUser.branch}`);
      
      triggerToast(`Successfully created user: ${newUser.firstName} ${newUser.lastName}`);
      setIsSavingUser(false);
      setAddUserModalOpen(false);
      setNewUser({ firstName: '', lastName: '', email: '', phone: '', employeeId: '', role: 'Company Admin', branch: '', status: 'Active', permissions: [] });
    }, 800);
  };

  const handleAssignUserSubmit = (e) => {
    e.preventDefault();
    if (!assignUser.userId || !assignUser.assignToBranch || !assignUser.effectiveDate) {
      triggerToast('Please complete all required fields.', 'error');
      return;
    }
    
    // Check permission validation
    if (!checkPermission('manageUsers', 'assign a user to a branch')) return;
    
    setIsAssigningUser(true);
    setTimeout(() => {
      setUsers(prev => prev.map(u => {
        if (u.id === assignUser.userId) {
          return {
            ...u,
            branch: assignUser.assignToBranch,
            role: assignUser.position || u.role
          };
        }
        return u;
      }));
      
      const targetUser = users.find(u => u.id === assignUser.userId);
      const userName = targetUser ? `${targetUser.firstName} ${targetUser.lastName}` : assignUser.userId;
      
      // Log audit
      logAuditEvent('User Assigned', `Assigned user ${userName} to branch ${assignUser.assignToBranch} effective ${assignUser.effectiveDate}`);
      
      triggerToast(`User successfully assigned to ${assignUser.assignToBranch} effective ${assignUser.effectiveDate}.`);
      setIsAssigningUser(false);
      setAssignUserModalOpen(false);
      setAssignUser({ userId: '', currentBranch: 'Chicago HQ Terminal', assignToBranch: '', effectiveDate: '', position: '', notes: '' });
    }, 800);
  };

  // CSV Import handler
  const handleCsvImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check permission validation
    if (!checkPermission('manageUsers', 'import users via CSV')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n');
      const newImportedUsers = [];
      let skippedCount = 0;
      
      if (lines.length <= 1) {
        triggerToast('The CSV file is empty.', 'error');
        return;
      }

      // Parse header line to determine columns
      const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
      
      const fnIdx = headers.indexOf('first name') !== -1 ? headers.indexOf('first name') : headers.indexOf('firstname');
      const lnIdx = headers.indexOf('last name') !== -1 ? headers.indexOf('last name') : headers.indexOf('lastname');
      const emailIdx = headers.indexOf('email');
      const phoneIdx = headers.indexOf('phone') !== -1 ? headers.indexOf('phone') : headers.indexOf('phone number');
      const roleIdx = headers.indexOf('role');
      const branchIdx = headers.indexOf('branch') !== -1 ? headers.indexOf('branch') : headers.indexOf('assigned branch');
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const columns = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        
        const firstName = columns[fnIdx] || '';
        const lastName = columns[lnIdx] || '';
        const email = columns[emailIdx] || '';
        const phone = columns[phoneIdx] || '';
        const role = columns[roleIdx] || 'Dispatcher';
        const branch = columns[branchIdx] || 'Chicago HQ Terminal';
        
        if (!firstName || !lastName || !email) {
          skippedCount++;
          continue;
        }
        
        newImportedUsers.push({
          id: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
          firstName,
          lastName,
          email,
          phone,
          role,
          branch,
          status: 'Active',
          permissions: []
        });
      }
      
      if (newImportedUsers.length > 0) {
        setUsers(prev => [...newImportedUsers, ...prev]);
        logAuditEvent('CSV User Import', `Imported ${newImportedUsers.length} users from CSV file: ${file.name}`);
        triggerToast(`Successfully imported ${newImportedUsers.length} users.${skippedCount > 0 ? ` Skipped ${skippedCount} invalid records.` : ''}`);
      } else {
        triggerToast('No valid user records found in the CSV file.', 'error');
      }
      
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  // Export handlers
  const handleExportUsersCSV = () => {
    if (!checkPermission('exportReports', 'export users registry')) return;
    const headers = ['Employee ID', 'First Name', 'Last Name', 'Email Address', 'Phone Number', 'Role Profile', 'Assigned Branch', 'Status'];
    const rows = users.map(u => [u.id, u.firstName, u.lastName, u.email, u.phone || '', u.role, u.branch, u.status]);
    const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Hero_Logistics_Users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logAuditEvent('Export Users', 'Exported users registry to CSV.');
    triggerToast('Users list CSV exported.');
  };

  const handleExportBranchesCSV = () => {
    if (!checkPermission('exportReports', 'export branches registry')) return;
    const headers = ['Branch Name', 'Address', 'City', 'State', 'Manager', 'Staff Count'];
    const rows = branches.map(b => [b.name, b.address, b.city, b.state, b.manager, getBranchStaffCount(b.name)]);
    const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Hero_Logistics_Branches_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logAuditEvent('Export Branches', 'Exported branches list to CSV.');
    triggerToast('Branches list CSV exported.');
  };

  // Reusable confirmation modal trigger
  const handleConfirmDeactivate = (item, type) => {
    setConfirmTitle(type === 'driver' ? 'Suspend Driver?' : type === 'user' ? 'Deactivate User?' : 'Deactivate Vehicle?');
    setConfirmText(
      type === 'driver' 
        ? `Are you sure you want to suspend driver ${item.name}? This will remove them from active dispatch rosters.`
        : type === 'user'
        ? `Are you sure you want to deactivate staff member ${item.firstName} ${item.lastName}? They will lose access to the logistics system immediately.`
        : `Are you sure you want to decommission vehicle ${item.plate}? Active dispatches associated with this vehicle will be unassigned.`
    );
    setConfirmAction(() => () => {
      if (type === 'driver') {
        if (!checkPermission('driverMgmt', 'suspend a driver')) return;
        dispatch(deleteDriver(item.id));
        logAuditEvent('Driver Suspended', `Deactivated driver ${item.name} from registry.`);
        triggerToast('Driver suspended and removed from registry.', 'warning');
      } else if (type === 'user') {
        if (!checkPermission('manageUsers', 'deactivate a user')) return;
        setUsers(prev => prev.filter(u => u.id !== item.id));
        logAuditEvent('User Deactivated', `Deactivated user ${item.firstName} ${item.lastName} (${item.email})`);
        triggerToast('User deactivated and access revoked.', 'warning');
      } else if (type === 'fleet') {
        if (!checkPermission('manageFleet', 'deactivate a vehicle')) return;
        dispatch(deleteVehicle(item.id));
        logAuditEvent('Vehicle Decommissioned', `Decommissioned vehicle ${item.plate}`);
        triggerToast('Vehicle deactivated and removed from registry.', 'warning');
      }
    });
    setConfirmModalOpen(true);
  };

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

  // Sync activeTab to state to allow local overrides
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  useEffect(() => {
    setActiveTab(initialActiveTab);
    setCurrentPage(1);
    setSearchQuery('');
  }, [initialActiveTab]);

  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery('');
  }, [activeTab]);

  // Branch Selector
  const [selectedBranch, setSelectedBranch] = useState('all');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [branchSubTab, setBranchSubTab] = useState('directory');
  const itemsPerPage = 5;

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');
  const [editingInsId, setEditingInsId] = useState(null);
  const [editingInsText, setEditingInsText] = useState('');
  const [newInsType, setNewInsType] = useState('Customer Instructions');
  const [newInsScopeType, setNewInsScopeType] = useState('Customer');
  const [newInsScopeValue, setNewInsScopeValue] = useState('');

  // Niche Configurations
  const [selectedNiche, setSelectedNiche] = useState('General Freight');
  const [nicheSettings, setNicheSettings] = useState({
    generalFreightEnabled: true,
    carCarryingEnabled: false,
    dangerousGoodsEnabled: false
  });

  // Address Instructions
  const [instructionSubTab, setInstructionSubTab] = useState('customer');
  const [addressInstructions, setAddressInstructions] = useState([
    { id: 1, address: 'Chicago HQ Depot - Dock A', instructions: 'Ring bell and wait for yard operator. Hand over paperwork before uncoupling.', hazard: 'High Forklift Traffic', priority: 'High' },
    { id: 2, address: 'Los Angeles Terminal - Gate B', instructions: 'Security code #4019. Driver must wear steel-toed boots at all times.', hazard: 'Heavy Container Movement', priority: 'High' },
    { id: 3, address: 'Atlanta Depot - East Wing', instructions: 'Register safety manifest at gatehouse. Speed limit is strictly 5 MPH.', hazard: 'None', priority: 'Medium' }
  ]);
  const [addressForm, setAddressForm] = useState({ address: '', instructions: '', hazard: '', priority: 'Medium' });


  // AI Actions Review
  const [aiActionReview, setAiActionReview] = useState(null);
  const [newInsText, setNewInsText] = useState('');
  const [newInsIsCritical, setNewInsIsCritical] = useState(false);

  // Confirmation Dialog Modal State
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  // Sub Tab states
  const [driversSubTab, setDriversSubTab] = useState('drivers');
  const [settingsSubTab, setSettingsSubTab] = useState('niche');

  // Custom DB lists states
  const defaultBranches = [
    { id: 1, name: 'Chicago HQ Terminal', address: '100 Logistics Blvd', city: 'Chicago', state: 'IL', manager: 'hq@company.com', staff: 8 },
    { id: 2, name: 'Los Angeles Depot', address: '45 Long Beach Rd', city: 'Los Angeles', state: 'CA', manager: 'la@company.com', staff: 4 }
  ];
  
  const [branches, setBranches] = useState(() => {
    const saved = localStorage.getItem('hero_admin_branches');
    return saved ? JSON.parse(saved) : defaultBranches;
  });

  useEffect(() => {
    localStorage.setItem('hero_admin_branches', JSON.stringify(branches));
  }, [branches]);

  const defaultUsers = [
    { id: 'EMP-8021', firstName: 'Alex', lastName: 'Wright', email: 'alex.w@company.com', phone: '+1 (555) 102-3921', role: 'Dispatcher', branch: 'Chicago HQ Terminal', status: 'Active', permissions: ['Dispatch Loads', 'Manage Fleet'] },
    { id: 'EMP-4921', firstName: 'Jan', lastName: 'Levinson', email: 'jan.l@company.com', phone: '+1 (555) 910-3841', role: 'Company Admin', branch: 'Chicago HQ Terminal', status: 'Active', permissions: ['View Reports', 'Audit Logs', 'Manage Users'] },
    { id: 'EMP-3042', firstName: 'Michael', lastName: 'Scott', email: 'michael.s@company.com', phone: '+1 (555) 201-9482', role: 'Branch Manager', branch: 'Los Angeles Depot', status: 'Active', permissions: ['Dispatch Loads', 'View Billing'] }
  ];

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('hero_admin_users');
    return saved ? JSON.parse(saved) : defaultUsers;
  });

  useEffect(() => {
    localStorage.setItem('hero_admin_users', JSON.stringify(users));
  }, [users]);

  // Audit Logs & Activity History
  const defaultAuditLogs = [
    { id: 1, action: 'User Created', detail: 'Created user Alex Wright (alex.w@company.com) assigned to Chicago HQ Terminal', user: 'Jan Levinson (Admin)', time: new Date(Date.now() - 3600000 * 2).toLocaleString() },
    { id: 2, action: 'Role Updated', detail: 'Changed role for Michael Scott to Branch Manager', user: 'Jan Levinson (Admin)', time: new Date(Date.now() - 3600000 * 4).toLocaleString() },
    { id: 3, action: 'System Backup', detail: 'Automated nightly state backup completed successfully.', user: 'System', time: new Date(Date.now() - 3600000 * 12).toLocaleString() },
    { id: 4, action: 'Branch Configured', detail: 'Configured LA Terminal location gate security protocols.', user: 'Jan Levinson (Admin)', time: new Date(Date.now() - 3600000 * 24).toLocaleString() }
  ];

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('hero_admin_audit_logs');
    return saved ? JSON.parse(saved) : defaultAuditLogs;
  });

  useEffect(() => {
    localStorage.setItem('hero_admin_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const logAuditEvent = (action, detail) => {
    const newLog = {
      id: Date.now(),
      action,
      detail,
      user: user?.name || 'Company Admin',
      time: new Date().toLocaleString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const getBranchStaffCount = (branchName) => {
    return users.filter(u => u.branch === branchName).length;
  };

  const checkPermission = (permKey, actionName) => {
    const saved = localStorage.getItem('hero_perms_toggles');
    if (!saved) return true;
    const roleMap = {
      'Super Admin': 'companyadmin',
      'Company Admin': 'companyadmin',
      'Dispatcher': 'dispatcher',
      'Driver': 'driver',
      'Warehouse Manager': 'warehouse',
      'Yard Attendant': 'yard',
      'Accounts': 'accounts',
      'Customer': 'customer'
    };
    const roleKey = roleMap[user?.role] || 'dispatcher';
    if (roleKey === 'companyadmin') return true;
    const pk = `${permKey}_${roleKey}`;
    const perms = JSON.parse(saved);
    if (perms[pk] === false) {
      triggerToast(`Access Denied: Role '${user?.role}' does not have permission to ${actionName}.`, 'error');
      return false;
    }
    return true;
  };

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

  const [selectedAssetForAssign, setSelectedAssetForAssign] = useState(null);
  const [assignBranchModalOpen, setAssignBranchModalOpen] = useState(false);
  const [selectedAssetForQr, setSelectedAssetForQr] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [branchStatus, setBranchStatus] = useState({
    1: 'Active',
    2: 'Active'
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
    setConfirmTitle(drawerType === 'fleet' ? 'Deactivate Vehicle?' : 'Suspend Driver?');
    setConfirmText(
      drawerType === 'fleet'
        ? `Are you sure you want to de-register and deactivate vehicle ${selectedItem?.plate}?`
        : `Are you sure you want to suspend driver ${selectedItem?.name} and revoke portal access?`
    );
    setConfirmAction(() => () => {
      if (drawerType === 'fleet') {
        if (!checkPermission('manageFleet', 'deactivate a vehicle')) return;
        dispatch(deleteVehicle(selectedItem.id));
        logAuditEvent('Vehicle Decommissioned', `Decommissioned vehicle ${selectedItem.plate} via details drawer`);
        triggerToast('Vehicle deactivated and removed from registry.', 'warning');
      } else if (drawerType === 'driver') {
        if (!checkPermission('driverMgmt', 'suspend a driver')) return;
        dispatch(deleteDriver(selectedItem.id));
        logAuditEvent('Driver Suspended', `Deactivated driver ${selectedItem.name} via details drawer`);
        triggerToast('Driver suspended and removed from registry.', 'warning');
      }
      setDetailsDrawerOpen(false);
    });
    setConfirmModalOpen(true);
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
    const ins = customerInstructions.find(i => i.id === id);
    const insText = ins ? ins.text : '';
    setConfirmTitle('Delete Special Instruction?');
    setConfirmText(`Are you sure you want to delete this safety directive? "${insText}"`);
    setConfirmAction(() => () => {
      dispatch(deleteCustomerInstruction(id));
      logAuditEvent('Instruction Deleted', `Deleted safety instruction directive: "${insText}"`);
      triggerToast('Instruction deleted.', 'warning');
    });
    setConfirmModalOpen(true);
  };

  // Search & Pagination queries
  const getFilteredList = () => {
    let list = [];
    if (activeTab === 'branches') {
      list = branches;
    } else if (activeTab === 'customers') {
      list = customers;
    } else if (activeTab === 'drivers') {
      list = drivers;
    } else if (activeTab === 'fleet') {
      list = fleet;
    } else if (activeTab === 'trailers') {
      list = trailers;
    } else if (activeTab === 'assets') {
      list = assets;
    }

    // Filter by branch
    if (selectedBranch !== 'all') {
      list = list.filter(item => {
        const itemId = item.id || (item.plate ? parseInt(item.plate.replace(/\D/g, '')) : 0) || 0;
        return itemId % 2 === (selectedBranch === 1 ? 0 : 1);
      });
    }

    // Filter by search query (Global Search)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(item => {
        return (
          (item.name && item.name.toLowerCase().includes(q)) ||
          (item.plate && item.plate.toLowerCase().includes(q)) ||
          (item.serial && item.serial.toLowerCase().includes(q)) ||
          (item.vin && item.vin.toLowerCase().includes(q)) ||
          (item.rego && item.rego.toLowerCase().includes(q)) ||
          (item.id && String(item.id).toLowerCase().includes(q)) ||
          (item.email && item.email.toLowerCase().includes(q)) ||
          (item.instructions && item.instructions.toLowerCase().includes(q)) ||
          (item.address && item.address.toLowerCase().includes(q))
        );
      });
    }
    return list;
  };

  const getSimulatedChangeForAi = (title) => {
    switch(title) {
      case 'AI Receipt Reader': return 'Receipt Total: $342.50 | Pilot Flying J | Auto-matched to Vehicle #VH-1102 (Odometer: 142,500 mi).';
      case 'AI Dispatch Suggestions': return 'Assign LD-9422 to John D. | ETA improvement: +1.5 hours (saves 92 miles of empty return trip).';
      case 'AI ETA Prediction': return 'Predicted arrival: 06/27 2:30 PM (Confidence: 95.2%). Original Scheduled: 06/27 4:15 PM.';
      case 'AI Cost Suggestions': return 'Re-route LD-9418 via I-94 to Dallas | Fuel saved: 12 gal ($48) | Toll savings: $35.';
      case 'AI Alert Center': return 'Compliance check: 2 Driver CDL documents expiring in <15 days. Auto-queued notification mail drafts.';
      case 'AI Load Optimiser': return 'Combine cargo: Chicago➔Atlanta (LD-9418 & LD-9420). Saves 1 truck dispatch and 180 total miles.';
      default: return 'No simulation data available.';
    }
  };

  const handleTriggerAiAction = (ai) => {
    setAiActionReview({
      title: ai.title,
      icon: ai.icon,
      suggestion: ai.fn,
      details: ai.desc,
      simulatedChange: getSimulatedChangeForAi(ai.title)
    });
  };

  const handleExportReportCSV = (reportName) => {
    const reportData = [
      { ref: 'REF-8812 (Chicago HQ)', date: 'Jun 26, 2026', cat: 'Standard Billing', deb: '$0.00', cred: '$4,200.00', status: 'Settled' },
      { ref: 'REF-8411 (BP station Chicago)', date: 'Jun 25, 2026', cat: 'Fuel Expense', deb: '$340.50', cred: '$0.00', status: 'Approved' },
      { ref: 'REF-7922 (Dallas terminal)', date: 'Jun 24, 2026', cat: 'Inter-Company', deb: '$0.00', cred: '$1,800.00', status: 'Settled' },
      { ref: 'REF-6821 (Tyre replacements)', date: 'Jun 21, 2026', cat: 'Maintenance', deb: '$1,200.00', cred: '$0.00', status: 'Approved' },
      { ref: 'REF-4819 (Memphis Shippers)', date: 'Jun 20, 2026', cat: 'Bulk Freight', deb: '$0.00', cred: '$8,800.00', status: 'Settled' }
    ];

    const headers = ['Record / Reference', 'Date / Period', 'Type / Category', 'Debit / Cost', 'Credit / Revenue', 'Status'];
    const rows = reportData.map(r => [r.ref, r.date, r.cat, r.deb, r.cred, r.status]);

    const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Hero_Logistics_${reportName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(`${reportName} CSV Export downloaded successfully!`);
  };

  const handleExportReportPDF = (reportName) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const html = `
      <html>
        <head>
          <title>${reportName} - Hero Logistics</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h1 { border-bottom: 2px solid #FFD400; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>Hero Logistics - ${reportName}</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Record / Reference</th>
                <th>Date / Period</th>
                <th>Type / Category</th>
                <th>Debit / Cost</th>
                <th>Credit / Revenue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>REF-8812 (Chicago HQ)</td>
                <td>Jun 26, 2026</td>
                <td>Standard Billing</td>
                <td>$0.00</td>
                <td>$4,200.00</td>
                <td>Settled</td>
              </tr>
              <tr>
                <td>REF-8411 (BP station Chicago)</td>
                <td>Jun 25, 2026</td>
                <td>Fuel Expense</td>
                <td>$340.50</td>
                <td>$0.00</td>
                <td>Approved</td>
              </tr>
              <tr>
                <td>REF-7922 (Dallas terminal)</td>
                <td>Jun 24, 2026</td>
                <td>Inter-Company</td>
                <td>$0.00</td>
                <td>$1,800.00</td>
                <td>Settled</td>
              </tr>
              <tr>
                <td>REF-6821 (Tyre replacements)</td>
                <td>Jun 21, 2026</td>
                <td>Maintenance</td>
                <td>$1,200.00</td>
                <td>$0.00</td>
                <td>Approved</td>
              </tr>
              <tr>
                <td>REF-4819 (Memphis Shippers)</td>
                <td>Jun 20, 2026</td>
                <td>Bulk Freight</td>
                <td>$0.00</td>
                <td>$8,800.00</td>
                <td>Settled</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const getBranchStats = () => {
    if (selectedBranch === 1) { // Chicago HQ
      return {
        activeLoads: 9,
        completedLoads: 122,
        revenue: 55400,
        expenses: 21120,
        grossMargin: '61.9%',
        availableDrivers: 4,
        activeVehicles: 6,
        overdueInvoices: 3,
        netProfit: 34280,
        profitChange: '↑ +12.4% vs last month',
        revenueChange: '↑ +6.2% vs last month',
        expensesChange: '↑ Fuel +$1,400',
        marginChange: '↑ +1.5% improvement',
        driversSub: 'of 6 assigned drivers',
        vehiclesSub: 'of 6 registered'
      };
    }
    if (selectedBranch === 2) { // Los Angeles Depot
      return {
        activeLoads: 5,
        completedLoads: 65,
        revenue: 28800,
        expenses: 10420,
        grossMargin: '63.8%',
        availableDrivers: 3,
        activeVehicles: 3,
        overdueInvoices: 1,
        netProfit: 18380,
        profitChange: '↑ +17.8% vs last month',
        revenueChange: '↑ +11.4% vs last month',
        expensesChange: '↑ Fuel +$700',
        marginChange: '↑ +3.2% improvement',
        driversSub: 'of 4 assigned drivers',
        vehiclesSub: 'of 3 registered'
      };
    }
    // Consolidated / All Branches
    return {
      activeLoads: 14,
      completedLoads: 187,
      revenue: 84200,
      expenses: 31540,
      grossMargin: '62.5%',
      availableDrivers: drivers.filter(d => d.status !== 'On Trip').length || 7,
      activeVehicles: fleet.filter(v => v.status === 'Active' || v.status === 'In Transit').length || 9,
      overdueInvoices: 4,
      netProfit: 52660,
      profitChange: '↑ +14.2% vs last month',
      revenueChange: '↑ +8.4% vs last month',
      expensesChange: '↑ Fuel +$2,100',
      marginChange: '↑ +2.1% improvement',
      driversSub: `of ${drivers.length} total drivers`,
      vehiclesSub: `of ${fleet.length} registered`
    };
  };

  const branchStats = getBranchStats();

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
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 capitalize">Company Admin • {activeTab.replace('-', ' ')}</h2>
            <p className="text-xs text-slate-500">Configure entities, invite operators, and audit registered company assets.</p>
          </div>
          
          {/* Branch Switcher Select */}
          <div className="flex items-center gap-1.5 bg-white/80 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500">
            <MapPin className="h-3.5 w-3.5 text-brand-400" />
            <select 
              value={selectedBranch} 
              onChange={(e) => {
                const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                setSelectedBranch(val);
                triggerToast(val === 'all' ? 'Showing consolidated data for all branches.' : `Filtered dashboard views to ${branches.find(b => b.id === val)?.name}`);
              }}
              className="bg-transparent focus:outline-none text-slate-700 cursor-pointer"
            >
              <option value="all" className="bg-white">All Branches</option>
              {branches.map(b => (
                <option key={b.id} value={b.id} className="bg-white">{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Global Search Bar */}
          <div className="relative flex items-center bg-white/80 border border-slate-200 rounded-xl px-3 py-2 w-48 sm:w-64 focus-within:border-brand-500 transition-all mr-2">
            <Search className="h-3.5 w-3.5 text-slate-500 mr-2 flex-shrink-0" />
            <input 
              type="text" 
              placeholder="Search VIN, Rego, Load ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-slate-700 text-xs w-full focus:outline-none placeholder-slate-500"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-slate-600">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Hide user buttons on alerts tab to reduce clutter */}
          {activeTab !== 'alerts' && (
            <>
              <Button variant="outline" onClick={() => {
                setNewUser(prev => ({ ...prev, employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}` }));
                setAddUserModalOpen(true);
              }}>
                Add User
              </Button>
              <Button variant="outline" onClick={() => {
                document.getElementById('csv-file-input').click();
              }}>
                Bulk Import (CSV)
              </Button>
              <input 
                id="csv-file-input" 
                type="file" 
                accept=".csv" 
                className="hidden" 
                onChange={handleCsvImport} 
              />
              <Button variant="outline" onClick={handleExportUsersCSV}>
                Export Users (CSV)
              </Button>
              <Button variant="outline" onClick={() => setAssignUserModalOpen(true)}>
                Assign User To Branch
              </Button>
            </>
          )}
          {activeTab === 'branches' && (
            <>
              <Button variant="outline" onClick={() => {
                setActiveTab('branch-pl');
                triggerToast('Loading Branch P&L Analysis...');
              }}>
                View Branch P&L
              </Button>
              <Button variant="outline" onClick={handleExportBranchesCSV}>
                Export Branches (CSV)
              </Button>
              <Button variant="primary" icon={Plus} onClick={() => setAddModalOpen(true)}>
                Add Branch
              </Button>
            </>
          )}
          {activeTab !== 'overview' && activeTab !== 'workforce' && activeTab !== 'branches' && activeTab !== 'availability' && activeTab !== 'branch-pl' && activeTab !== 'settings' && (
            <Button variant="primary" icon={Plus} onClick={() => {
              if (activeTab === 'alerts') {
                setAddAlertModalOpen(true);
              } else {
                setAddModalOpen(true);
              }
            }}>
              Add {activeTab === 'fleet' ? 'Vehicle' : activeTab === 'drivers' ? 'Driver' : activeTab === 'customers' ? 'Customer' : activeTab === 'trailers' ? 'Trailer' : activeTab === 'assets' ? 'Asset' : activeTab === 'alerts' ? 'Alerts' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </Button>
          )}
        </div>
      </div>

      {/* Main dashboard screens */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 8 KPI Cards — Client Required */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Row 1 */}
            <div className="p-4 glass border border-slate-200 rounded-2xl text-left space-y-1 hover:border-brand-500/30 transition-all">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Loads</p>
              <p className="text-2xl font-black text-slate-900">{branchStats.activeLoads}</p>
              <p className="text-[10px] text-emerald-400 font-semibold">↑ 3 new today</p>
            </div>
            <div className="p-4 glass border border-slate-200 rounded-2xl text-left space-y-1 hover:border-brand-500/30 transition-all">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completed Loads</p>
              <p className="text-2xl font-black text-slate-900">{branchStats.completedLoads}</p>
              <p className="text-[10px] text-emerald-400 font-semibold">↑ +12 this week</p>
            </div>
            <div className="p-4 glass border border-slate-200 rounded-2xl text-left space-y-1 hover:border-brand-500/30 transition-all">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Revenue</p>
              <p className="text-2xl font-black text-emerald-400">${branchStats.revenue.toLocaleString()}</p>
              <p className="text-[10px] text-emerald-400 font-semibold">{branchStats.revenueChange}</p>
            </div>
            <div className="p-4 glass border border-slate-200 rounded-2xl text-left space-y-1 hover:border-brand-500/30 transition-all">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expenses</p>
              <p className="text-2xl font-black text-red-400">${branchStats.expenses.toLocaleString()}</p>
              <p className="text-[10px] text-red-400 font-semibold">{branchStats.expensesChange}</p>
            </div>
            {/* Row 2 */}
            <div className="p-4 glass border border-slate-200 rounded-2xl text-left space-y-1 hover:border-brand-500/30 transition-all">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gross Margin</p>
              <p className="text-2xl font-black text-brand-400">{branchStats.grossMargin}</p>
              <p className="text-[10px] text-brand-400 font-semibold">{branchStats.marginChange}</p>
            </div>
            <div className="p-4 glass border border-slate-200 rounded-2xl text-left space-y-1 hover:border-brand-500/30 transition-all">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Available Drivers</p>
              <p className="text-2xl font-black text-slate-900">{branchStats.availableDrivers}</p>
              <p className="text-[10px] text-slate-500 font-semibold">{branchStats.driversSub}</p>
            </div>
            <div className="p-4 glass border border-slate-200 rounded-2xl text-left space-y-1 hover:border-brand-500/30 transition-all">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vehicles Active</p>
              <p className="text-2xl font-black text-slate-900">{branchStats.activeVehicles}</p>
              <p className="text-[10px] text-slate-500 font-semibold">{branchStats.vehiclesSub}</p>
            </div>
            <div className="p-4 glass border border-red-500/20 bg-red-500/5 rounded-2xl text-left space-y-1 hover:border-red-500/40 transition-all">
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Overdue Invoices</p>
              <p className="text-2xl font-black text-red-400">{branchStats.overdueInvoices}</p>
              <p className="text-[10px] text-red-400 font-semibold">⚠ ${(branchStats.overdueInvoices * 3100).toLocaleString()} outstanding</p>
            </div>
          </div>

          {/* Net Profit + Quick Actions Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 glass border border-brand-500/20 bg-brand-500/5 rounded-2xl text-left space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Net Profit (MTD)</p>
              <p className="text-2xl font-black text-brand-400">${branchStats.netProfit.toLocaleString()}</p>
              <p className="text-[10px] text-brand-400 font-semibold">{branchStats.profitChange}</p>
            </div>
            <div className="sm:col-span-2 glass rounded-2xl p-4 border border-slate-200 text-left">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  {label:'Create Load',icon:'📦',fn:'Create Load panel opened.'},
                  {label:'Add Driver',icon:'👤',fn:'Add Driver modal opened.'},
                  {label:'Assign Vehicle',icon:'🚚',fn:'Vehicle assignment modal opened.'},
                  {label:'View Reports',icon:'📊',fn:'Reports dashboard loaded.'},
                  {label:'Process Payroll',icon:'💳',fn:'Payroll processing initiated.'},
                  {label:'Approve Leave',icon:'✅',fn:'Leave approval queue opened.'},
                  {label:'AI Suggestions',icon:'🤖',fn:'AI Dispatch Suggestions activated.'},
                  {label:'Export Report',icon:'📄',fn:'Dashboard report PDF exported.'},
                ].map((a,i)=>(
                  <button key={i} onClick={() => {
                    if (a.label === 'Export Report') {
                      handleExportReportPDF('Operational Report MTD');
                    } else if (a.label === 'View Reports') {
                      setActiveTab('reports');
                    } else {
                      triggerToast(a.fn);
                    }
                  }} className="flex items-center gap-2 p-2 bg-white/60 border border-slate-200 hover:border-brand-500/30 hover:bg-brand-500/5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all cursor-pointer">
                    <span>{a.icon}</span><span className="truncate">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue vs Expenses + Profit Trend Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-5 border border-slate-200 text-left">
              <h3 className="text-sm font-extrabold text-slate-900 mb-3">Revenue vs Expenses — 6 Week Trend</h3>
              <MiniChart type="line" data={[62000, 71000, 68000, 76000, 82000, 84200]} labels={['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6']} />
            </div>
            <div className="glass rounded-2xl p-5 border border-slate-200 text-left">
              <h3 className="text-sm font-extrabold text-slate-900 mb-3">Net Profit Trend</h3>
              <MiniChart type="line" data={[38000, 44000, 40000, 48000, 51000, 52660]} labels={['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6']} />
            </div>
            <div className="glass rounded-2xl p-5 border border-slate-200 text-left">
              <h3 className="text-sm font-extrabold text-slate-900 mb-3">Fleet Capacity Utilization %</h3>
              <MiniChart type="line" data={[78, 85, 82, 88, 94, 91]} labels={['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6']} />
            </div>
          </div>

          {/* Loads by Status + Driver Availability + Fleet Health */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Loads by Status */}
            <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900">Today's Jobs — Loads by Status</h3>
              <div className="space-y-2">
                {[{s:'In Transit',n:6,c:'bg-brand-500'},{s:'Picked Up',n:3,c:'bg-blue-500'},{s:'Delivered',n:4,c:'bg-emerald-500'},{s:'Pending Dispatch',n:2,c:'bg-amber-500'},{s:'Cancelled',n:1,c:'bg-red-500'}].map((item,i)=>(
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${item.c} flex-shrink-0`}/>
                    <span className="text-slate-600 flex-1">{item.s}</span>
                    <span className="font-bold text-slate-900">{item.n}</span>
                    <div className="w-16 h-1.5 bg-white rounded-full overflow-hidden">
                      <div className={`h-full ${item.c}`} style={{width:`${(item.n/16)*100}%`}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Driver Availability Ring */}
            <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900">Driver Availability</h3>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1F2937" strokeWidth="3"/>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#0ea0ea" strokeWidth="3"
                      strokeDasharray={`${(drivers.filter(d=>d.status!=='On Trip').length||5)*10} 100`}
                      strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-black text-brand-400">{drivers.filter(d=>d.status!=='On Trip').length||5}</span>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand-500"/><span className="text-slate-600">Available: {drivers.filter(d=>d.status!=='On Trip').length||5}</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"/><span className="text-slate-600">On Trip: {drivers.length>0?Math.floor(drivers.length*0.4):3}</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"/><span className="text-slate-600">On Leave: 2</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-600"/><span className="text-slate-600">Off Duty: 1</span></div>
                </div>
              </div>
            </div>

            {/* Fleet Health */}
            <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900">Fleet Health Status</h3>
              <div className="space-y-2">
                {[{s:'Operational',n:fleet.length>0?fleet.length-1:6,c:'text-emerald-400',bg:'bg-emerald-500'},{s:'In Maintenance',n:1,c:'text-amber-400',bg:'bg-amber-500'},{s:'Overdue Service',n:2,c:'text-red-400',bg:'bg-red-500'}].map((item,i)=>(
                  <div key={i} className="flex items-center justify-between p-2.5 bg-white/40 border border-slate-200 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.bg}`}/>
                      <span className="text-slate-600">{item.s}</span>
                    </div>
                    <span className={`font-bold ${item.c}`}>{item.n} vehicles</span>
                  </div>
                ))}
              </div>
              <Button size="sm" variant="outline" className="w-full" onClick={()=>triggerToast('Fleet maintenance schedule opened.')}>Schedule Service</Button>
            </div>
          </div>

          {/* Recent Activities + Pending Approvals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Activity Timeline */}
            <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900">Recent Activities Timeline</h3>
              <div className="space-y-3">
                {[
                  {time:'11:42',icon:'🚚',text:'John D. picked up LD-9411 at Chicago Terminal',type:'load'},
                  {time:'11:15',icon:'💰',text:'Invoice #INV-0411 sent to Global Retail Corp ($12,400)',type:'invoice'},
                  {time:'10:30',icon:'⚠️',text:'CDL expiry alert: Dave K. license expires Jul 10',type:'alert'},
                  {time:'09:55',icon:'✅',text:'Vehicle TX-9811 DOT inspection completed — Pass',type:'compliance'},
                  {time:'09:20',icon:'📦',text:'Load LD-9418 dispatched to Sarah R. (Dallas route)',type:'dispatch'},
                  {time:'08:45',icon:'💳',text:'Expense approved: John D. fuel receipt $340',type:'expense'},
                ].map((act,i)=>(
                  <div key={i} className="flex gap-3 items-start">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sm flex-shrink-0">{act.icon}</div>
                      {i<5&&<div className="w-px h-3 bg-[#23324C] mt-1"/>}
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <p className="text-xs text-slate-700 font-semibold leading-snug">{act.text}</p>
                      <span className="text-[10px] text-slate-500 font-mono">{act.time} today</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Approvals Widget */}
            <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-slate-900">Pending Approvals</h3>
                <span className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-black flex items-center justify-center">7</span>
              </div>
              <div className="space-y-2">
                {[
                  {type:'Leave Request',who:'John D.',detail:'Sick Leave — Jun 30 to Jul 2',icon:'📅'},
                  {type:'Expense',who:'Sarah R.',detail:'Fuel receipt — $340 (BP Station)',icon:'💳'},
                  {type:'Timesheet',who:'Dave K.',detail:'42 hours week ending Jun 27',icon:'⏱️'},
                  {type:'Leave Request',who:'Mike T.',detail:'Vacation — Jul 10 to Jul 14',icon:'📅'},
                  {type:'Expense',who:'Anna B.',detail:'Toll pass reimbursement — $82',icon:'💳'},
                ].map((ap,i)=>(
                  <div key={i} className="flex items-center gap-3 p-2.5 bg-white/40 border border-slate-200 rounded-xl">
                    <span className="text-lg">{ap.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{ap.type} — {ap.who}</p>
                      <p className="text-[10px] text-slate-500 truncate">{ap.detail}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={()=>triggerToast(`${ap.type} for ${ap.who} approved.`)} className="px-2 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold cursor-pointer hover:bg-emerald-500/25">✓</button>
                      <button onClick={()=>triggerToast(`${ap.type} for ${ap.who} declined.`,'warning')} className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-[10px] font-bold cursor-pointer hover:bg-red-500/20">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Branch Performance + Upcoming Renewals + Weather/Fuel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Branch Performance Comparison */}
            <div className="lg:col-span-2 glass rounded-2xl p-5 border border-slate-200 text-left space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-slate-900">Branch Performance Comparison</h3>
                <Button size="sm" variant="outline" onClick={()=>triggerToast('Branch report PDF exported.')}>Export PDF</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-slate-200">{['Branch','Revenue','Loads','Drivers','Score'].map(h=>(<th key={h} className="text-left py-2 px-2 text-[10px] font-bold text-slate-500 uppercase">{h}</th>))}</tr></thead>
                  <tbody className="divide-y divide-[#23324C]/20">
                    {[
                      {b:'Chicago HQ',rev:'$42,100',loads:87,drivers:5,score:94},
                      {b:'Los Angeles',rev:'$28,400',loads:62,drivers:3,score:88},
                      {b:'Dallas',rev:'$13,700',loads:38,drivers:2,score:91},
                    ].map((r,i)=>(
                      <tr key={i} className="hover:bg-slate-900/20">
                        <td className="py-2 px-2 font-bold text-slate-900">{r.b}</td>
                        <td className="py-2 px-2 font-mono text-emerald-400">{r.rev}</td>
                        <td className="py-2 px-2 text-slate-600">{r.loads}</td>
                        <td className="py-2 px-2 text-slate-600">{r.drivers}</td>
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden">
                              <div className={`h-full ${r.score>=90?'bg-emerald-500':r.score>=80?'bg-brand-500':'bg-amber-500'}`} style={{width:`${r.score}%`}}/>
                            </div>
                            <span className={`text-[10px] font-bold ${r.score>=90?'text-emerald-400':'text-brand-400'}`}>{r.score}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Upcoming Renewals + Weather/Fuel */}
            <div className="space-y-4">
              <div className="glass rounded-2xl p-4 border border-slate-200 text-left space-y-3">
                <h3 className="text-xs font-extrabold text-slate-900">Upcoming Renewals</h3>
                <div className="space-y-2">
                  {[
                    {item:'TX-9811 Insurance',days:2,type:'🛡️'},
                    {item:'Dave K. CDL',days:14,type:'🪪'},
                    {item:'TX-4022 Rego',days:18,type:'📋'},
                    {item:'WHS Audit Fee',days:24,type:'🏛️'},
                  ].map((r,i)=>(
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span>{r.type}</span>
                      <span className="flex-1 text-slate-600 truncate">{r.item}</span>
                      <span className={`font-bold font-mono ${r.days<=7?'text-red-400':r.days<=14?'text-amber-400':'text-slate-500'}`}>{r.days}d</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass rounded-2xl p-4 border border-slate-200 text-left space-y-3">
                <h3 className="text-xs font-extrabold text-slate-900">Weather & Fuel Prices</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">☁️ Chicago, IL</span>
                    <span className="font-bold text-slate-900">72°F Cloudy</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">☀️ Dallas, TX</span>
                    <span className="font-bold text-slate-900">88°F Clear</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2">
                    <div className="flex justify-between"><span className="text-slate-500">⛽ Diesel (avg)</span><span className="font-bold text-amber-400">$3.84/gal</span></div>
                    <div className="flex justify-between mt-1"><span className="text-slate-500">↕ vs yesterday</span><span className="font-bold text-emerald-400">-$0.04</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Branches Setup Screen */}
      {activeTab === 'branches' && (
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Branch Depots</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Manage terminal layouts, operations managers, and monitor financial performance metrics per branch.</p>
            </div>
            
            <div className="flex border border-slate-200 bg-white/40 rounded-xl p-0.5 text-xs font-bold">
              {[
                { id: 'directory', label: 'Directory' },
                { id: 'analytics', label: 'Performance Analytics' }
              ].map(sub => (
                <button 
                  key={sub.id}
                  onClick={() => setBranchSubTab(sub.id)}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                    branchSubTab === sub.id ? 'bg-brand-500 text-slate-950 font-black' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>

          {branchSubTab === 'directory' ? (
            <div className="space-y-4 animate-fade-in">
              {/* Branch Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white/60 border border-slate-200/50 rounded-xl text-left">
                  <p className="text-[9px] text-slate-500 font-bold uppercase">Total Branches</p>
                  <p className="text-xl font-black text-slate-900 mt-0.5">{branches.length}</p>
                </div>
                <div className="p-3 bg-white/60 border border-slate-200/50 rounded-xl text-left">
                  <p className="text-[9px] text-slate-500 font-bold uppercase">Total Staff</p>
                  <p className="text-xl font-black text-slate-900 mt-0.5">{branches.reduce((s, b) => s + b.staff, 0) + drivers.length}</p>
                </div>
                <div className="p-3 bg-white/60 border border-slate-200/50 rounded-xl text-left">
                  <p className="text-[9px] text-slate-500 font-bold uppercase">Fleet Assigned</p>
                  <p className="text-xl font-black text-brand-400 mt-0.5">{fleet.length}</p>
                </div>
                <div className="p-3 bg-white/60 border border-slate-200/50 rounded-xl text-left">
                  <p className="text-[9px] text-slate-500 font-bold uppercase">Active States</p>
                  <p className="text-xl font-black text-emerald-400 mt-0.5">{[...new Set(branches.map(b => b.state))].join(', ') || 'IL, CA'}</p>
                </div>
              </div>
              
              <DataTable
                tableName="branches_table"
                columns={[
                  { key: 'name', label: 'Depot Name', render: (row) => <span className="font-extrabold text-slate-900">{row.name}</span> },
                  { key: 'address', label: 'Address', render: (row) => <span className="text-slate-600 font-semibold">{row.address}, {row.city}</span> },
                  { key: 'state', label: 'State', render: (row) => <span className="text-slate-500 font-mono text-xs font-bold">{row.state}</span> },
                  { key: 'manager', label: 'Manager Email', render: (row) => <span className="text-slate-500 font-mono text-[11px]">{row.manager}</span> },
                  { key: 'staff', label: 'Staff Count', render: (row) => <span className="font-mono">{row.staff} Users</span> },
                  { key: 'actions', label: 'Actions', render: (row) => (
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleOpenInspect(row, 'branch')}>Inspect</Button>
                      <Button size="sm" variant="outline" onClick={() => triggerToast(`Editing branch ${row.name}...`)}>Edit Branch</Button>
                      <Button size="sm" variant="outline" onClick={() => triggerToast(`Branch P&L loading for ${row.name}...`)}>P&L</Button>
                    </div>
                  ) }
                ]} data={paginatedList} />
              
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Performance Analytics Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 glass rounded-2xl p-5 border border-slate-200 text-left">
                  <h3 className="text-xs font-extrabold text-slate-900 mb-4">Branch Financial Comparison (MTD)</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Chicago HQ', Revenue: 42100, Expenses: 16200 },
                        { name: 'Los Angeles', Revenue: 28400, Expenses: 11800 },
                        { name: 'Dallas Depot', Revenue: 13700, Expenses: 3540 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#23324C" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                        <YAxis stroke="#94a3b8" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#23324C' }} />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-900">Efficiency Leadership</h3>
                  <div className="space-y-3">
                    {[
                      { branch: 'Chicago HQ Terminal', score: '94%', rank: '🏆 #1 Rank', color: 'text-emerald-400' },
                      { branch: 'Dallas Terminal', score: '91%', rank: '⚡ #2 Rank', color: 'text-brand-400' },
                      { branch: 'Los Angeles Depot', score: '88%', rank: '📈 #3 Rank', color: 'text-blue-400' }
                    ].map((lead, i) => (
                      <div key={i} className="p-3 bg-white/40 border border-slate-200/45 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <strong className="text-slate-900 block">{lead.branch}</strong>
                          <span className="text-[10px] text-slate-500 font-bold">{lead.rank}</span>
                        </div>
                        <span className={`text-sm font-black ${lead.color}`}>{lead.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Detailed metrics comparison table */}
              <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-3">
                <h3 className="text-xs font-extrabold text-slate-900">Branch Key Performance Indicators</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200">
                        {['Branch Terminal', 'Revenue', 'Operating Expense', 'Loads Completed', 'Avg Transit Time', 'Safety Index'].map(h => (
                          <th key={h} className="text-left py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#23324C]/20">
                      {[
                        { b: 'Chicago HQ', rev: '$42,100', exp: '$16,200', loads: 87, time: '21.4 hrs', safety: '94%' },
                        { b: 'Los Angeles Depot', rev: '$28,400', exp: '$11,800', loads: 62, time: '23.8 hrs', safety: '88%' },
                        { b: 'Dallas Terminal', rev: '$13,700', exp: '$3,540', loads: 38, time: '19.2 hrs', safety: '91%' }
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/20">
                          <td className="py-2.5 px-3 font-bold text-slate-900">{row.b}</td>
                          <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">{row.rev}</td>
                          <td className="py-2.5 px-3 font-mono text-red-400">{row.exp}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-700">{row.loads} completed</td>
                          <td className="py-2.5 px-3 text-slate-500 font-mono">{row.time}</td>
                          <td className="py-2.5 px-3 font-bold text-brand-400">{row.safety}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}


      {/* Customer / Shipper Settings Screen */}
      {activeTab === 'customers' && (
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h3 className="text-sm font-extrabold text-slate-900">Customer Shipper Database</h3>
            <SearchInput value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onClear={() => setSearchQuery('')} className="max-w-[200px]" />
          </div>

          <DataTable columns={[
            { key: 'name', label: 'Company Name', render: (row) => <span className="font-extrabold text-slate-900">{row.name}</span> },
            { key: 'email', label: 'Billing Email', render: (row) => <span className="text-slate-600 font-mono text-[11px]">{row.email}</span> },
            { key: 'contract', label: 'Agreement Contract', render: (row) => <span className="text-slate-500 font-semibold">{row.contract}</span> },
            { key: 'billing', label: 'Billing Net Terms', render: (row) => <span className="font-bold text-brand-400">{row.billing}</span> },
            { key: 'actions', label: 'Actions', render: (row) => <Button size="sm" variant="secondary" onClick={() => handleOpenInspect(row, 'customer')}>Inspect</Button> }
          ]} data={paginatedList} />

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      {/* Driver Registry Screen */}
      {activeTab === 'drivers' && (() => {
        // Calculate filtered and paginated drivers
        const filteredDrivers = drivers.filter(item => {
          if (selectedBranch !== 'all') {
            const itemId = item.id || 0;
            if (itemId % 2 !== (selectedBranch === 1 ? 0 : 1)) return false;
          }
          if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            return item.name.toLowerCase().includes(q) || item.email.toLowerCase().includes(q) || (item.plate && item.plate.toLowerCase().includes(q));
          }
          return true;
        });
        const totalDriversPages = Math.ceil(filteredDrivers.length / itemsPerPage);
        const paginatedDriversList = filteredDrivers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

        // Calculate filtered and paginated users (staff)
        const filteredUsers = users.filter(item => {
          if (selectedBranch !== 'all') {
            const targetB = branches.find(b => b.id === selectedBranch);
            if (targetB && item.branch !== targetB.name) return false;
          }
          if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            return (
              item.firstName.toLowerCase().includes(q) || 
              item.lastName.toLowerCase().includes(q) || 
              item.email.toLowerCase().includes(q) ||
              item.role.toLowerCase().includes(q) ||
              item.id.toLowerCase().includes(q)
            );
          }
          return true;
        });
        const totalUsersPages = Math.ceil(filteredUsers.length / itemsPerPage);
        const paginatedUsersList = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

        return (
          <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Personnel Registry</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Manage drivers, dispatchers, yard staff, and administrative operators.</p>
              </div>
              
              <div className="flex border border-slate-200 bg-white/40 rounded-xl p-0.5 text-xs font-bold">
                {[
                  { id: 'drivers', label: 'Active Drivers' },
                  { id: 'staff', label: 'Staff Directory' }
                ].map(sub => (
                  <button 
                    key={sub.id}
                    onClick={() => {
                      setDriversSubTab(sub.id);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                      driversSubTab === sub.id ? 'bg-brand-500 text-slate-950 font-black' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>

            {driversSubTab === 'drivers' ? (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-bold">{filteredDrivers.length} Drivers registered</span>
                  <SearchInput value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onClear={() => setSearchQuery('')} className="max-w-[200px]" />
                </div>
                <DataTable columns={[
                  { key: 'name', label: 'Driver Operator Name', render: (row) => <span className="font-extrabold text-slate-900">{row.name}</span> },
                  { key: 'email', label: 'Portal Email', render: (row) => <span className="text-slate-600 font-mono text-[11px]">{row.email}</span> },
                  { key: 'plate', label: 'Active Assigned Vehicle', render: (row) => <span className="font-mono text-brand-400">{row.plate}</span> },
                  { key: 'rating', label: 'Performance Rating', render: (row) => <span className="font-bold text-yellow-400 font-mono">★ {row.rating}</span> },
                  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
                  { key: 'actions', label: 'Actions', render: (row) => (
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleOpenInspect(row, 'driver')}>Inspect</Button>
                      <Button size="sm" variant="danger" onClick={() => handleConfirmDeactivate(row, 'driver')}>Deactivate</Button>
                    </div>
                  ) }
                ]} data={paginatedDriversList} />
                <Pagination currentPage={currentPage} totalPages={totalDriversPages} onPageChange={setCurrentPage} />
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-bold">{filteredUsers.length} Users registered</span>
                  <div className="flex gap-2">
                    <SearchInput value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onClear={() => setSearchQuery('')} className="max-w-[200px]" />
                    <Button variant="outline" size="sm" onClick={handleExportUsersCSV}>Export CSV</Button>
                  </div>
                </div>
                <DataTable columns={[
                  { key: 'id', label: 'Employee ID', render: (row) => <span className="font-mono text-xs text-slate-500 font-bold">{row.id}</span> },
                  { key: 'name', label: 'Full Name', render: (row) => <span className="font-extrabold text-slate-900">{row.firstName} {row.lastName}</span> },
                  { key: 'email', label: 'Email Address', render: (row) => <span className="text-slate-600 font-mono text-[11px]">{row.email}</span> },
                  { key: 'role', label: 'Role Profile', render: (row) => <span className="font-bold text-brand-400">{row.role}</span> },
                  { key: 'branch', label: 'Assigned Branch', render: (row) => <span className="text-slate-600 font-semibold">{row.branch}</span> },
                  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
                  { key: 'actions', label: 'Actions', render: (row) => (
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleOpenInspect({ ...row, name: `${row.firstName} ${row.lastName}` }, 'user')}>Inspect</Button>
                      <Button size="sm" variant="danger" onClick={() => handleConfirmDeactivate(row, 'user')}>Deactivate</Button>
                    </div>
                  ) }
                ]} data={paginatedUsersList} />
                <Pagination currentPage={currentPage} totalPages={totalUsersPages} onPageChange={setCurrentPage} />
              </div>
            )}
          </div>
        );
      })()}

      {/* Fleet Register Screen */}
      {activeTab === 'fleet' && (
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h3 className="text-sm font-extrabold text-slate-900">Active Fleet Vehicles</h3>
            <SearchInput value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onClear={() => setSearchQuery('')} className="max-w-[200px]" />
          </div>

          {fleetLoading && fleet.length === 0 ? (
            <TableSkeleton rows={4} cols={5} />
          ) : (
            <>
              <DataTable columns={[
                { key: 'plate', label: 'Plate Number', render: (row) => <span className="font-extrabold text-slate-900">{row.plate}</span> },
                { key: 'type', label: 'Vehicle Type', render: (row) => <span className="text-slate-600 font-semibold">{row.type}</span> },
                { key: 'compliance', label: 'Safety Compliance', render: (row) => (
                  row.complianceChecked ? (
                    <span className="text-[10px] text-emerald-400 font-bold">✓ Compliant ({row.odometer} mi)</span>
                  ) : (
                    <span className="text-[10px] text-amber-500 font-bold">⚠️ Pending Inspection</span>
                  )
                )},
                { key: 'capacity', label: 'Weight Capacity', render: (row) => <span className="font-mono">{row.capacity}</span> },
                { key: 'branch', label: 'Branch Depot', render: (row) => <span className="text-slate-500">{row.branch || 'Chicago HQ'}</span> },
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
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h3 className="text-sm font-extrabold text-slate-900">Trailer Spots Registry</h3>
            <SearchInput value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onClear={() => setSearchQuery('')} className="max-w-[200px]" />
          </div>

          <DataTable columns={[
            { key: 'plate', label: 'Trailer Plate', render: (row) => <span className="font-mono font-extrabold text-slate-900">{row.plate}</span> },
            { key: 'type', label: 'Container Type', render: (row) => <span className="text-slate-600 font-semibold">{row.type}</span> },
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
          <div className="flex border-b border-slate-200/45 pb-px text-xs font-bold gap-4 text-left">
            {['Availability Calendar', 'Shift Planner', 'Leave Registry'].map(sub => (
              <button 
                key={sub}
                onClick={() => triggerToast(`Workforce view switched to: ${sub}`)}
                className="capitalize pb-2 text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                {sub}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: Capacity and Calendar display */}
            <div className="lg:col-span-7 glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-slate-900">Workforce Availability & Leave Calendar</h3>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">88% Capacity Available</span>
              </div>

              {/* Roster Calendar Grid */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-slate-500">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="p-1 bg-slate-900/60 border border-slate-200 rounded-lg text-slate-500 uppercase tracking-wider">{day}</div>
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
                          ? 'bg-slate-900/40 border-slate-200 text-slate-900 hover:border-brand-500/30' 
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
                  className="px-3.5 py-2 bg-white hover:bg-slate-750 text-slate-600 text-xs rounded-xl font-bold transition-all cursor-pointer"
                >
                  Add Leave Request
                </button>
              </div>
            </div>

            {/* Right: Shift Planner */}
            <div className="lg:col-span-5 glass rounded-2xl p-5 border border-slate-200 text-left space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Roster Shift Planner</h3>
                <p className="text-[10px] text-slate-500 font-semibold mb-3">Schedule operational shifts for active drivers and yard attendants.</p>
              </div>

              <div className="space-y-3.5 my-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Select Employee</label>
                  <select id="shift-driver-select" className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500">
                    <option value="John D.">John D. (Driver)</option>
                    <option value="Sarah R.">Sarah R. (Driver)</option>
                    <option value="Michael S.">Michael S. (Yard Attendant)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Branch Location</label>
                  <select id="shift-branch-select" className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500">
                    <option value="Chicago HQ">Chicago HQ Terminal</option>
                    <option value="Dallas Depot">Dallas Depot</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Shift Hours</label>
                  <input type="text" id="shift-hours" defaultValue="08:00 - 16:00 (8 hrs)" className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500" />
                </div>
              </div>

              <button 
                onClick={() => {
                  const emp = document.getElementById('shift-driver-select').value;
                  const hr = document.getElementById('shift-hours').value;
                  triggerToast(`Shift scheduled successfully for ${emp} (${hr}).`);
                }}
                className="w-full py-2.5 bg-white hover:bg-slate-750 text-slate-900 text-xs rounded-xl font-bold transition-all cursor-pointer"
              >
                Assign Shift
              </button>
            </div>
          </div>

          {/* Leave approvals table */}
          <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Leave Approval Requests</h3>
            <DataTable columns={[
              { key: 'employee', label: 'Personnel Employee', render: (row) => <span className="font-extrabold text-slate-900">{row.employee}</span> },
              { key: 'type', label: 'Leave Reason Type', render: (row) => <span className="text-slate-355 font-semibold">{row.type}</span> },
              { key: 'start', label: 'Start Date', render: (row) => <span className="text-slate-500 font-mono text-xs">{row.start}</span> },
              { key: 'end', label: 'End Date', render: (row) => <span className="text-slate-500 font-mono text-xs">{row.end}</span> },
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
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Customer &amp; Terminal Instructions Registry</h3>
              <p className="text-xs text-slate-500">Attach special handling directives, address alerts, or loading instructions to customers, loads, and stop terminals.</p>
            </div>

            {/* Sub-tabs for Instructions */}
            <div className="flex gap-2 bg-white border border-slate-200 p-1 rounded-xl">
              <button 
                type="button"
                onClick={() => setInstructionSubTab('customer')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  instructionSubTab === 'customer' 
                    ? 'bg-brand-500 text-slate-950 shadow-md shadow-brand-500/20' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Customer Instructions
              </button>
              <button 
                type="button"
                onClick={() => setInstructionSubTab('address')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  instructionSubTab === 'address' 
                    ? 'bg-brand-500 text-slate-950 shadow-md shadow-brand-500/20' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Address Instructions
              </button>
            </div>
          </div>

          {instructionSubTab === 'customer' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Create Instruction Form */}
              <form onSubmit={handleCreateInstruction} className="lg:col-span-5 bg-white/60 border border-slate-200 rounded-2xl p-5 space-y-4">
                <strong className="text-xs text-slate-700 block">Create Instruction Alert</strong>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold uppercase text-[9px]">Instruction Category</label>
                    <select 
                      value={newInsType} 
                      onChange={(e) => setNewInsType(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="Customer Instructions">Customer Instructions</option>
                      <option value="Delivery Instructions">Delivery Instructions</option>
                      <option value="Address Instructions">Address Instructions</option>
                      <option value="Special Handling Instructions">Special Handling Instructions</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold uppercase text-[9px]">Attachment Scope Type</label>
                    <select 
                      value={newInsScopeType} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewInsScopeType(val);
                        if (val === 'Customer') setNewInsScopeValue('Global Retail Corp');
                        else if (val === 'Address') setNewInsScopeValue('Chicago HQ Terminal');
                        else setNewInsScopeValue('LD-9411');
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="Customer">Customer Account</option>
                      <option value="Address">Address / Stop Terminal</option>
                      <option value="Load">Load ID</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold uppercase text-[9px]">Select Scope Target</label>
                    <select 
                      value={newInsScopeValue} 
                      onChange={(e) => setNewInsScopeValue(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
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
                      className="rounded border-slate-200 text-brand-500 focus:ring-brand-500 h-4 w-4 cursor-pointer"
                    />
                    <label htmlFor="ins-critical-chk" className="text-[10px] font-bold text-red-400 uppercase tracking-wider cursor-pointer">
                      Flag as Critical / High Priority (Requires Driver Acknowledgement)
                    </label>
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold uppercase text-[9px]">Directives / Instructions Alert</label>
                    <textarea 
                      value={newInsText}
                      onChange={(e) => setNewInsText(e.target.value)}
                      placeholder="e.g. Call supervisor on arrival; check gate clearance..." 
                      className="w-full h-20 px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder:text-slate-550" 
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
                <strong className="text-xs text-slate-700 block">Linked Special Instructions</strong>
                <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
                  {(customerInstructions || []).length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-8">No special instructions registered.</p>
                  ) : (
                    (customerInstructions || []).map((item) => (
                      <div key={item.id} className={`p-4 bg-white/40 border rounded-xl text-xs space-y-2.5 transition-all ${
                        item.isCritical ? 'border-red-500/30 bg-red-500/5' : 'border-slate-200'
                      }`}>
                        <div className="flex justify-between items-center border-b border-slate-200 pb-1.5 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                              item.isCritical ? 'bg-red-500/20 text-red-400' : 'bg-white text-slate-500'
                            }`}>
                              {item.isCritical ? '🚨 CRITICAL' : item.type}
                            </span>
                            {item.isCritical && (
                              <span className="text-[9px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-semibold uppercase">
                                Needs Driver Conf
                              </span>
                            )}
                          </div>
                          <strong className="text-[10px] text-slate-500 font-mono">{item.scope}</strong>
                        </div>

                        {editingInsId === item.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editingInsText}
                              onChange={(e) => setEditingInsText(e.target.value)}
                              className="w-full h-16 px-3 py-2 bg-white border border-brand-500 rounded-xl text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                            />
                            <div className="flex gap-2 justify-end">
                              <Button size="xs" variant="primary" onClick={() => handleSaveEditIns(item)}>Save</Button>
                              <Button size="xs" variant="secondary" onClick={() => { setEditingInsId(null); setEditingInsText(''); }}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-slate-700 italic">"{item.text}"</p>
                            <div className="flex justify-between items-center border-t border-slate-200/25 pt-2 text-[9px] text-slate-500 font-medium">
                              <div className="flex gap-2">
                                <span>Created by: {item.createdBy || 'System'}</span>
                                <span>•</span>
                                <span>At: {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}</span>
                              </div>
                              <div className="flex gap-2.5">
                                <button 
                                  type="button"
                                  onClick={() => handleStartEditIns(item)}
                                  className="text-brand-400 hover:text-brand-300 font-bold flex items-center gap-0.5 cursor-pointer bg-transparent border-none"
                                >
                                  <Edit2 className="h-3 w-3" /> Edit
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => handleDeleteIns(item.id)}
                                  className="text-red-400 hover:text-red-300 font-bold flex items-center gap-0.5 cursor-pointer bg-transparent border-none"
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
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Create Address Instruction Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!addressForm.address || !addressForm.instructions) return;
                  const newAi = {
                    id: Date.now(),
                    address: addressForm.address,
                    instructions: addressForm.instructions,
                    hazard: addressForm.hazard || 'None',
                    priority: addressForm.priority
                  };
                  setAddressInstructions([newAi, ...addressInstructions]);
                  setAddressForm({ address: '', instructions: '', hazard: '', priority: 'Medium' });
                  triggerToast(`Address instructions added for ${newAi.address}`);
                }} 
                className="lg:col-span-5 bg-white/60 border border-slate-200 rounded-2xl p-5 space-y-4"
              >
                <strong className="text-xs text-slate-700 block">Add Terminal Address Instruction</strong>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold uppercase text-[9px]">Terminal / Location Address</label>
                    <select 
                      value={addressForm.address} 
                      onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="">-- Select Terminal --</option>
                      <option value="Chicago HQ Depot - Dock A">Chicago HQ Depot - Dock A</option>
                      <option value="Los Angeles Terminal - Gate B">Los Angeles Terminal - Gate B</option>
                      <option value="Atlanta Depot - East Wing">Atlanta Depot - East Wing</option>
                      <option value="Dallas Depot - Main Entrance">Dallas Depot - Main Entrance</option>
                      <option value="New York Terminal - Cargo Ramp">New York Terminal - Cargo Ramp</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold uppercase text-[9px]">Special Instructions Alert</label>
                    <textarea 
                      value={addressForm.instructions}
                      onChange={(e) => setAddressForm({ ...addressForm, instructions: e.target.value })}
                      placeholder="e.g. Speed limit 5 MPH; ring yard manager bell on entry..." 
                      className="w-full h-20 px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder:text-slate-550" 
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold uppercase text-[9px]">Safety Hazard Notes</label>
                    <TextInput 
                      value={addressForm.hazard}
                      onChange={(e) => setAddressForm({ ...addressForm, hazard: e.target.value })}
                      placeholder="e.g. Heavy container crane traffic..." 
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold uppercase text-[9px]">Alert Priority Level</label>
                    <select 
                      value={addressForm.priority} 
                      onChange={(e) => setAddressForm({ ...addressForm, priority: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High / Critical</option>
                    </select>
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full py-2 bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs rounded-xl font-black transition-all cursor-pointer border-none"
                >
                  Save Address Instruction
                </button>
              </form>

              {/* Linked Address Instructions list */}
              <div className="lg:col-span-7 space-y-4">
                <strong className="text-xs text-slate-700 block">Registered Terminal address Directives</strong>
                <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
                  {addressInstructions.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-8">No terminal address instructions registered.</p>
                  ) : (
                    addressInstructions.map((item) => (
                      <div key={item.id} className={`p-4 bg-white/40 border rounded-xl text-xs space-y-2.5 transition-all ${
                        item.priority === 'High' ? 'border-red-500/30 bg-red-500/5' : 'border-slate-200'
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-slate-900 text-[11px]">{item.address}</span>
                          <div className="flex gap-2 items-center">
                            <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded ${
                              item.priority === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-white text-slate-500 border border-slate-200'
                            }`}>
                              {item.priority} Priority
                            </span>
                            <button 
                              type="button"
                              onClick={() => {
                                setAddressInstructions(prev => prev.filter(a => a.id !== item.id));
                                triggerToast("Address instruction removed.");
                              }}
                              className="text-slate-500 hover:text-red-400 transition-all cursor-pointer bg-transparent border-none"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-slate-600 leading-normal">"{item.instructions}"</p>
                        <div className="text-[10px] text-slate-450 border-t border-slate-200 pt-2 flex justify-between items-center">
                          <span>⚠️ Hazard Warning: <strong className="text-amber-400">{item.hazard}</strong></span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Asset Register Screen */}
      {activeTab === 'assets' && (
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900">Physical Warehouse Asset Register</h3>
          <DataTable columns={[
            { key: 'name', label: 'Asset Name', render: (row) => <span className="font-extrabold text-slate-900">{row.name}</span> },
            { key: 'type', label: 'Category Type', render: (row) => <span className="text-slate-600">{row.type}</span> },
            { key: 'serial', label: 'Serial Number', render: (row) => <span className="font-mono text-[10px] text-slate-500">{row.serial}</span> },
            { key: 'status', label: 'State', render: (row) => <StatusBadge status={row.status} /> }
          ]} data={assets} />
        </div>
      )}

      {/* Loads Screen */}
      {activeTab === 'loads' && (
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-slate-900">Operational Shipments</h3>
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
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-slate-900">Dispatch Scheduling Board</h3>
            <Button size="sm" variant="primary" onClick={() => triggerToast('Shift assigned from Dispatch board.')}>
              Assign Shift
            </Button>
          </div>
          <p className="text-xs text-slate-500">Manage daily dispatcher loads and assign operators directly.</p>
        </div>
      )}

      {/* Warehouse / Yard Screen */}
      {activeTab === 'warehouse-yard' && (
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-slate-900">Depot Storage Configuration</h3>
            <Button size="sm" variant="secondary" onClick={() => triggerToast('Custom Niche Fields configuration modal loaded.')}>
              Configure Niche Fields
            </Button>
          </div>
          <p className="text-xs text-slate-500">Edit layout lanes, loading slots, and custom inventory definitions.</p>
        </div>
      )}

      {/* Accounts Screen */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[{label:'Total Revenue',value:'$84,200',color:'text-emerald-400',sub:'↑ +8.4% vs last month'},{label:'Total Expenses',value:'$31,540',color:'text-red-400',sub:'↑ Fuel +$2,100'},{label:'Net Profit',value:'$52,660',color:'text-brand-400',sub:'62.5% margin'},{label:'Overdue Invoices',value:'$12,400',color:'text-amber-400',sub:'4 invoices pending'}].map((k,i)=>(
              <div key={i} className="p-4 glass border border-slate-200 rounded-2xl text-left space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{k.label}</p>
                <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
                <p className="text-[10px] text-slate-500 font-semibold">{k.sub}</p>
              </div>
            ))}
          </div>
          <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-slate-900">Branch P&L Summary</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="primary" onClick={() => triggerToast('Full P&L report generating...')}>View Full P&L</Button>
                <Button size="sm" variant="secondary" onClick={() => triggerToast('Financial statement PDF exported!')}>Export PDF</Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-slate-200">{['Branch','Revenue','Expenses','Profit','Margin'].map(h=>(<th key={h} className="text-left py-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>))}</tr></thead>
                <tbody className="divide-y divide-[#23324C]/20">
                  {[{branch:'Chicago HQ',rev:'$42,100',exp:'$16,200',profit:'$25,900',margin:'61.5%'},{branch:'Los Angeles Depot',rev:'$28,400',exp:'$11,800',profit:'$16,600',margin:'58.4%'},{branch:'Dallas Terminal',rev:'$13,700',exp:'$3,540',profit:'$10,160',margin:'74.2%'}].map((row,i)=>(
                    <tr key={i} className="hover:bg-slate-900/20">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{row.branch}</td>
                      <td className="py-2.5 px-3 text-emerald-400 font-mono font-bold">{row.rev}</td>
                      <td className="py-2.5 px-3 text-red-400 font-mono font-bold">{row.exp}</td>
                      <td className="py-2.5 px-3 text-brand-400 font-mono font-bold">{row.profit}</td>
                      <td className="py-2.5 px-3"><span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold">{row.margin}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900">Recent Transactions</h3>
            <div className="space-y-2">
              {[{desc:'Fuel — Truck TX-9811',amount:'-$840',date:'Jun 25',type:'expense'},{desc:'Invoice #INV-0411 — Global Retail',amount:'+$12,400',date:'Jun 24',type:'income'},{desc:'Driver Pay — John D.',amount:'-$2,200',date:'Jun 23',type:'expense'},{desc:'Invoice #INV-0408 — Memphis Shippers',amount:'+$8,800',date:'Jun 22',type:'income'},{desc:'Tyre Replacement — TR-4022',amount:'-$1,200',date:'Jun 21',type:'expense'}].map((tx,i)=>(
                <div key={i} className="flex justify-between items-center p-2.5 bg-white/40 border border-slate-200 rounded-xl text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 block">{tx.desc}</span>
                    <span className="text-slate-500 font-mono">{tx.date}</span>
                  </div>
                  <span className={`font-bold font-mono ${tx.type==='income'?'text-emerald-400':'text-red-400'}`}>{tx.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== PAYROLL MODULE ===== */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          {/* Payroll KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[{label:'This Week Payroll',value:'$18,450',color:'text-emerald-400',sub:'12 employees'},{label:'Pending Approval',value:'$4,200',color:'text-amber-400',sub:'3 timesheets'},{label:'Driver Pay',value:'$11,800',color:'text-brand-400',sub:'8 drivers'},{label:'Last Payroll',value:'Jun 20',color:'text-slate-600',sub:'On time'}].map((k,i)=>(
              <div key={i} className="p-4 glass border border-slate-200 rounded-2xl text-left space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{k.label}</p>
                <p className={`text-xl font-black ${k.color}`}>{k.value}</p>
                <p className="text-[10px] text-slate-500 font-semibold">{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Timesheet Approval */}
          <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-slate-900">Timesheet Approval</h3>
              <Button size="sm" variant="primary" onClick={() => triggerToast('All timesheets approved for this pay period.')}>Approve All</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-slate-200">{['Employee','Role','Hours','Rate','Amount','Status','Action'].map(h=>(<th key={h} className="text-left py-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>))}</tr></thead>
                <tbody className="divide-y divide-[#23324C]/20">
                  {[
                    {name:'John D.',role:'Driver',hours:42,rate:'$28/hr',amount:'$1,176',status:'Pending'},
                    {name:'Sarah R.',role:'Driver',hours:38,rate:'$28/hr',amount:'$1,064',status:'Pending'},
                    {name:'Mike T.',role:'Yard Attendant',hours:40,rate:'$22/hr',amount:'$880',status:'Approved'},
                    {name:'Lisa P.',role:'Dispatcher',hours:44,rate:'$32/hr',amount:'$1,408',status:'Approved'},
                    {name:'Dave K.',role:'Driver',hours:36,rate:'$28/hr',amount:'$1,008',status:'Pending'},
                  ].map((emp,i)=>(
                    <tr key={i} className="hover:bg-slate-900/20">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{emp.name}</td>
                      <td className="py-2.5 px-3 text-slate-500">{emp.role}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{emp.hours}h</td>
                      <td className="py-2.5 px-3 text-slate-500">{emp.rate}</td>
                      <td className="py-2.5 px-3 font-bold font-mono text-emerald-400">{emp.amount}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${emp.status==='Approved'?'bg-emerald-500/10 text-emerald-400 border-emerald-500/20':'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{emp.status}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        {emp.status==='Pending'&&(
                          <div className="flex gap-1.5">
                            <button onClick={()=>triggerToast(`${emp.name} timesheet approved.`)} className="px-2 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold cursor-pointer hover:bg-emerald-500/25 transition-all">Approve</button>
                            <button onClick={()=>triggerToast(`${emp.name} timesheet returned for revision.`,'warning')} className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-[10px] font-bold cursor-pointer hover:bg-red-500/20 transition-all">Return</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Driver Pay Calculator + Weekly Payroll */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Driver Pay Calculator */}
            <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900">Driver Pay Calculator</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select Driver</label>
                  <select id="payroll-driver" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500">
                    <option>John D. (Driver)</option>
                    <option>Sarah R. (Driver)</option>
                    <option>Dave K. (Driver)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Hours Worked</label>
                    <input type="number" id="payroll-hours" defaultValue="42" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Hourly Rate ($)</label>
                    <input type="number" id="payroll-rate" defaultValue="28" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Bonuses / Allowances ($)</label>
                  <input type="number" id="payroll-bonus" defaultValue="150" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500" />
                </div>
                <button onClick={()=>{
                  const hrs=parseFloat(document.getElementById('payroll-hours')?.value||42);
                  const rate=parseFloat(document.getElementById('payroll-rate')?.value||28);
                  const bonus=parseFloat(document.getElementById('payroll-bonus')?.value||0);
                  const reg=Math.min(hrs,38)*rate;
                  const ot=Math.max(0,hrs-38)*rate*1.5;
                  const total=reg+ot+bonus;
                  triggerToast(`Pay calculated: Regular $${reg.toFixed(0)} + OT $${ot.toFixed(0)} + Bonus $${bonus.toFixed(0)} = $${total.toFixed(2)} total.`);
                }} className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs rounded-xl font-black transition-all cursor-pointer shadow-lg shadow-brand-500/10">Calculate Pay</button>
              </div>
            </div>

            {/* Payslip History */}
            <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-slate-900">Payslip History</h3>
                <Button size="sm" variant="secondary" onClick={()=>triggerToast('Payroll export (CSV) downloaded.')}>Export CSV</Button>
              </div>
              <div className="space-y-2">
                {[{period:'Jun 20, 2026',employees:12,total:'$18,450',status:'Processed'},{period:'Jun 6, 2026',employees:12,total:'$17,920',status:'Processed'},{period:'May 23, 2026',employees:11,total:'$16,800',status:'Processed'},{period:'May 9, 2026',employees:11,total:'$16,200',status:'Processed'}].map((slip,i)=>(
                  <div key={i} className="flex justify-between items-center p-3 bg-white/40 border border-slate-200 rounded-xl text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">Pay Period: {slip.period}</span>
                      <span className="text-slate-500">{slip.employees} employees</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold font-mono text-emerald-400 block">{slip.total}</span>
                      <button onClick={()=>triggerToast(`Payslip for ${slip.period} downloaded.`)} className="text-[10px] text-brand-400 hover:underline cursor-pointer">Download Payslips</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== EXPENSE MANAGEMENT MODULE ===== */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          {/* Expense KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[{label:'This Month',value:'$31,540',color:'text-red-400',sub:'↑ +12% vs last month'},{label:'Vehicle Expenses',value:'$14,200',color:'text-amber-400',sub:'45% of total'},{label:'Driver Expenses',value:'$8,840',color:'text-slate-600',sub:'28% of total'},{label:'Pending Approval',value:'$2,400',color:'text-brand-400',sub:'6 receipts'}].map((k,i)=>(
              <div key={i} className="p-4 glass border border-slate-200 rounded-2xl text-left space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{k.label}</p>
                <p className={`text-xl font-black ${k.color}`}>{k.value}</p>
                <p className="text-[10px] text-slate-500 font-semibold">{k.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Receipt Upload */}
            <div className="glass rounded-2xl p-5 border border-brand-500/20 bg-brand-500/3 text-left space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-brand-500/15 border border-brand-500/25 flex items-center justify-center">
                  <span className="text-[10px]">🤖</span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">AI Receipt Reader</h3>
                <span className="px-2 py-0.5 bg-brand-500/15 text-brand-400 border border-brand-500/25 rounded-full text-[9px] font-bold uppercase">AI Powered</span>
              </div>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center space-y-2 hover:border-brand-500/30 transition-all cursor-pointer" onClick={()=>triggerToast('AI Receipt Reader: Upload receipt image to auto-extract vendor, amount, date, and category.')}>
                <div className="text-2xl">📷</div>
                <p className="text-xs font-bold text-slate-600">Drop receipt image or click to upload</p>
                <p className="text-[10px] text-slate-500">AI will auto-extract: Vendor, Amount, Date, Category</p>
                <button onClick={(e)=>{e.stopPropagation();triggerToast('AI processed receipt: Vendor=BP Fuel Station, Amount=$340.50, Date=Jun 26, Category=Fuel');}} className="px-4 py-2 bg-brand-500/15 hover:bg-brand-500/25 text-brand-400 border border-brand-500/20 rounded-lg text-xs font-bold cursor-pointer transition-all">Simulate AI Scan</button>
              </div>
              <div className="p-3 bg-white/40 border border-slate-200 rounded-xl space-y-2 text-xs">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Last AI Scanned Receipt</p>
                <div className="flex justify-between"><span className="text-slate-500">Vendor</span><span className="text-slate-900 font-bold">BP Fuel Station — Chicago</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Amount</span><span className="text-red-400 font-bold font-mono">$340.50</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Category</span><span className="text-brand-400 font-bold">Fuel Expense</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Confidence</span><span className="text-emerald-400 font-bold">98.4% accurate</span></div>
              </div>
            </div>

            {/* Expense Categories */}
            <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900">Expense Categories</h3>
              <div className="space-y-2">
                {[{cat:'Fuel',amount:'$14,200',pct:45,color:'bg-amber-500'},{cat:'Driver Pay & OT',amount:'$8,840',pct:28,color:'bg-brand-500'},{cat:'Maintenance & Repairs',amount:'$4,200',pct:13,color:'bg-blue-500'},{cat:'Tolls & Permits',amount:'$2,800',pct:9,color:'bg-purple-500'},{cat:'Admin & Other',amount:'$1,500',pct:5,color:'bg-slate-500'}].map((c,i)=>(
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-600">{c.cat}</span>
                      <span className="font-bold font-mono text-slate-900">{c.amount} <span className="text-slate-500">({c.pct}%)</span></span>
                    </div>
                    <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                      <div className={`h-full ${c.color} rounded-full transition-all`} style={{width:`${c.pct}%`}} />
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={()=>triggerToast('Expense category management panel opened.')}>Manage Categories</Button>
            </div>
          </div>

          {/* Approval Workflow */}
          <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-slate-900">Expense Approval Workflow</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={()=>triggerToast('All pending expenses approved.')}>Approve All</Button>
                <Button size="sm" variant="outline" onClick={()=>triggerToast('Expense export CSV downloaded.')}>Export</Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-slate-200">{['Submitted By','Category','Description','Amount','Date','Status','Action'].map(h=>(<th key={h} className="text-left py-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>))}</tr></thead>
                <tbody className="divide-y divide-[#23324C]/20">
                  {[
                    {by:'John D.',cat:'Fuel',desc:'BP Station — Chicago',amount:'$340',date:'Jun 26',status:'Pending'},
                    {by:'Sarah R.',cat:'Tolls',desc:'I-90 Toll Pass',amount:'$42',date:'Jun 25',status:'Pending'},
                    {by:'Mike T.',cat:'Maintenance',desc:'Tyre inflation check',amount:'$85',date:'Jun 24',status:'Approved'},
                    {by:'Dave K.',cat:'Fuel',desc:'Shell Station — Dallas',amount:'$290',date:'Jun 24',status:'Approved'},
                    {by:'Lisa P.',cat:'Admin',desc:'Office supplies',amount:'$120',date:'Jun 23',status:'Rejected'},
                  ].map((exp,i)=>(
                    <tr key={i} className="hover:bg-slate-900/20">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{exp.by}</td>
                      <td className="py-2.5 px-3 text-slate-500">{exp.cat}</td>
                      <td className="py-2.5 px-3 text-slate-600">{exp.desc}</td>
                      <td className="py-2.5 px-3 font-bold font-mono text-red-400">{exp.amount}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500 text-[10px]">{exp.date}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          exp.status==='Approved'?'bg-emerald-500/10 text-emerald-400 border-emerald-500/20':
                          exp.status==='Rejected'?'bg-red-500/10 text-red-400 border-red-500/20':
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>{exp.status}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        {exp.status==='Pending'&&(
                          <div className="flex gap-1">
                            <button onClick={()=>triggerToast(`Expense by ${exp.by} approved.`)} className="px-2 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold cursor-pointer hover:bg-emerald-500/25">✓</button>
                            <button onClick={()=>triggerToast(`Expense by ${exp.by} rejected.`,'warning')} className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-[10px] font-bold cursor-pointer hover:bg-red-500/20">✕</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Alerts & Reminders Screen */}
      {activeTab === 'alerts' && (
        <AlertsReminders 
          globalSearchQuery={searchQuery}
          addAlertModalOpen={addAlertModalOpen}
          setAddAlertModalOpen={setAddAlertModalOpen}
        />
      )}

      {/* Inter-Company Transfers Screen */}
      {activeTab === 'transfers' && (
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-5">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Inter-Company Transfers Registry</h3>
            <p className="text-xs text-slate-500">Initiate, review, and track custody transfers of loads and item assets.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Initiate Transfer Form Panel */}
            <div className="lg:col-span-5 bg-white/60 border border-slate-200 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div>
                <strong className="text-xs text-slate-700 block">Transfer Logistics Custody</strong>
                <p className="text-[10px] text-slate-450 mt-0.5">Initiate sub-contracting transfers of loads or item assets.</p>
              </div>

              <div className="space-y-3.5 my-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Transfer Item Type</label>
                  <select id="ca-tx-type-select" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500">
                    <option value="Load Transfer">Transfer Load</option>
                    <option value="Asset/Car Transfer">Transfer Item/Car</option>
                    <option value="Delivery Section Transfer">Transfer Delivery Section</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Select Target</label>
                  <select id="ca-tx-target-select" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500">
                    <option value="LD-9411 (Chicago ➔ Dallas)">LD-9411 (Cargo: Auto Components)</option>
                    <option value="VIN: 1YV1HP82A81920 (Ford Mustang)">VIN: 1YV1HP82A81920 (Ford Mustang)</option>
                    <option value="Delivery Section B (Stop 2 ➔ Stop 3)">Delivery Section B (Stop 2 ➔ Stop 3)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Target Transport Partner</label>
                  <select id="ca-tx-partner-select" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500">
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
              <strong className="text-xs text-slate-700 block">Custody & Chain of History</strong>
              
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {(transfers || []).length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">No inter-company transfers logged.</p>
                ) : (
                  (transfers || []).map(tx => (
                    <div key={tx.id} className="p-4 bg-white/40 border border-slate-200 rounded-xl space-y-3.5">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono font-bold block">{tx.type}</span>
                          <strong className="text-slate-900 text-xs block mt-0.5">{tx.target}</strong>
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
                      <div className="text-[11px] text-slate-450 border-t border-slate-200/25 pt-2">
                        <strong className="text-[10px] text-slate-500 block mb-1">Chain of Custody Logs</strong>
                        <div className="space-y-3 pl-3 border-l border-slate-200/80 ml-1.5 py-1">
                          <div className="relative pl-1">
                            <span className="absolute left-[-16px] top-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="font-extrabold text-slate-700">Current Owner: {tx.toCompany}</span>
                              <span className="text-slate-550 font-mono">Active</span>
                            </div>
                          </div>
                          {(tx.custodyChain || []).map((log, idx) => (
                            <div key={idx} className="relative pl-1">
                              <span className="absolute left-[-16px] top-1.5 w-1.5 h-1.5 rounded-full bg-slate-600" />
                              <div className="text-slate-500 text-[10px]">
                                Party: <strong className="text-slate-700">{log.party}</strong> | Action: {log.action}
                              </div>
                              <span className="text-[9px] text-slate-500 font-mono">{log.timestamp}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {tx.status === 'pending' && (
                        <div className="flex gap-2 pt-2 border-t border-slate-200/25">
                          <button 
                            onClick={() => {
                              acceptTransfer(tx.id, 'Company Admin');
                              triggerToast('Inter-company transfer accepted!');
                            }}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-900 text-[11px] rounded-xl font-bold transition-all cursor-pointer"
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

      {activeTab === 'availability' && (
        <div className="space-y-6">
          <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Availability & Leave Management</h3>
                <p className="text-xs text-slate-500 mt-0.5">Track driver availability windows and manage approved leave requests.</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="primary" icon={Plus} onClick={() => triggerToast('Add Availability form opened.')}>
                  Add Availability
                </Button>
                <Button size="sm" variant="outline" onClick={() => triggerToast('Add Leave request form opened.')}>
                  Add Leave
                </Button>
              </div>
            </div>

            {/* Availability Grid */}
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">This Week — Driver Availability Calendar</p>
              <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-slate-500">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="p-1.5 bg-slate-900/60 border border-slate-200 rounded-lg text-slate-500 uppercase tracking-wider">{day}</div>
                ))}
                {['John D.', 'Sarah R.', 'Mike T.', 'Lisa P.', 'Dave K.', 'Anna B.', 'Tom R.'].map((name, idx) => {
                  const isLeave = idx === 2 || idx === 5;
                  return (
                    <div
                      key={idx}
                      onClick={() => triggerToast(`${name}: ${isLeave ? 'On Leave' : 'Available'} — Click to modify availability.`)}
                      className={`p-2.5 border rounded-xl cursor-pointer transition-all text-left ${
                        isLeave
                          ? 'bg-red-500/5 border-red-500/20 text-red-400'
                          : 'bg-emerald-500/5 border-emerald-500/15 text-emerald-400 hover:border-emerald-500/30'
                      }`}
                    >
                      <span className="block text-[8px] font-semibold text-slate-500 mb-0.5 truncate">{name}</span>
                      <strong className="block text-[10px]">{isLeave ? 'Leave' : 'Avail'}</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Leave Requests Table */}
          <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900">Pending Leave Approval Requests</h3>
            <DataTable columns={[
              { key: 'employee', label: 'Employee', render: (row) => <span className="font-extrabold text-slate-900">{row.employee}</span> },
              { key: 'type', label: 'Leave Type', render: (row) => <span className="text-slate-600 font-semibold">{row.type}</span> },
              { key: 'start', label: 'Start Date', render: (row) => <span className="text-slate-500 font-mono text-xs">{row.start}</span> },
              { key: 'end', label: 'End Date', render: (row) => <span className="text-slate-500 font-mono text-xs">{row.end}</span> },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
              { key: 'actions', label: 'Actions', render: (row) => (
                row.status === 'Pending' ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleApproveLeave(row.id)}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => handleRejectLeave(row.id)}>Reject</Button>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-500 font-semibold">Finalized</span>
                )
              )}
            ]} data={leaves} />
          </div>
        </div>
      )}

      {activeTab === 'permissions' && (
        <PermissionsPanel globalSearchQuery={searchQuery} />
      )}

      {/* ===== WAREHOUSE INTEGRATION ===== */}
      {activeTab === 'warehouse-yard' && (
        <div className="space-y-6">
          {/* Warehouse KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[{label:'Yard Occupancy',value:'74%',color:'text-brand-400',sub:'22 of 30 spots used'},{label:'Inventory Items',value:'1,842',color:'text-slate-900',sub:'14 categories'},{label:'Active Bays',value:'6/8',color:'text-emerald-400',sub:'2 bays available'},{label:'Scans Today',value:'284',color:'text-slate-600',sub:'\u2191 +22% vs yesterday'}].map((k,i)=>(
              <div key={i} className="p-4 glass border border-slate-200 rounded-2xl text-left space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{k.label}</p>
                <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
                <p className="text-[10px] text-slate-500 font-semibold">{k.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Yard Occupancy Visual */}
            <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900">Yard Occupancy Map</h3>
              <div className="grid grid-cols-6 gap-2">
                {Array.from({length:30}).map((_,i)=>{
                  const occupied=i<22;
                  const reserved=i>=18&&i<22;
                  return(
                    <div key={i} onClick={()=>triggerToast(`Spot ${i+1}: ${occupied?reserved?'Reserved':'Occupied':'Available'}`)}
                      className={`aspect-square rounded-xl border text-center flex items-center justify-center text-[8px] font-bold cursor-pointer transition-all ${
                        reserved?'bg-amber-500/20 border-amber-500/30 text-amber-400 hover:border-amber-500/50':
                        occupied?'bg-brand-500/15 border-brand-500/25 text-brand-400 hover:border-brand-500/40':
                        'bg-slate-900/40 border-slate-200 text-slate-500 hover:border-emerald-500/30 hover:text-emerald-400'
                      }`}>
                      {i+1}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4 text-[10px] font-bold">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-brand-500/40 inline-block"/>Occupied (22)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500/40 inline-block"/>Reserved (4)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-700 inline-block"/>Available (8)</span>
              </div>
            </div>

            {/* Loading Bays Status */}
            <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900">Loading Bays Status</h3>
              <div className="space-y-2">
                {[{bay:'Bay 1',status:'Active',load:'LD-9411',driver:'John D.',time:'08:30'},{bay:'Bay 2',status:'Active',load:'LD-9418',driver:'Sarah R.',time:'09:15'},{bay:'Bay 3',status:'Available',load:'—',driver:'—',time:'—'},{bay:'Bay 4',status:'Active',load:'LD-9420',driver:'Dave K.',time:'10:00'},{bay:'Bay 5',status:'Maintenance',load:'—',driver:'—',time:'—'},{bay:'Bay 6',status:'Active',load:'LD-9422',driver:'Mike T.',time:'10:30'},{bay:'Bay 7',status:'Available',load:'—',driver:'—',time:'—'},{bay:'Bay 8',status:'Active',load:'LD-9424',driver:'Anna B.',time:'11:00'}].map((b,i)=>(
                  <div key={i} className="flex items-center justify-between p-2.5 bg-white/40 border border-slate-200 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${b.status==='Active'?'bg-emerald-400':b.status==='Maintenance'?'bg-amber-400':'bg-slate-600'}`}/>
                      <span className="font-bold text-slate-900">{b.bay}</span>
                    </div>
                    <span className="text-slate-500 font-mono">{b.load}</span>
                    <span className="text-slate-600">{b.driver}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${b.status==='Active'?'bg-emerald-500/10 text-emerald-400 border-emerald-500/20':b.status==='Maintenance'?'bg-amber-500/10 text-amber-400 border-amber-500/20':'bg-white text-slate-500 border-slate-200'}`}>{b.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scan Activity Feed + Inventory */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900">Recent Scan Activity</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {[{item:'Pallet #PA-8812',action:'Scan In',loc:'Bay 2',by:'Sarah R.',time:'11:42'},
                  {item:'Box #BX-0041',action:'Moved',loc:'Zone A-3',by:'Mike T.',time:'11:38'},
                  {item:'Pallet #PA-8808',action:'Scan Out',loc:'Bay 1',by:'John D.',time:'11:25'},
                  {item:'Container #CT-112',action:'Received',loc:'Dock Door',by:'Dave K.',time:'11:10'},
                  {item:'Pallet #PA-8801',action:'Relocated',loc:'Zone B-1',by:'Anna B.',time:'10:55'},
                  {item:'Box #BX-0038',action:'Scan In',loc:'Bay 4',by:'Tom R.',time:'10:40'}
                ].map((s,i)=>(
                  <div key={i} className="flex items-center gap-3 p-2.5 bg-white/40 border border-slate-200/20 rounded-xl text-xs">
                    <div className="w-7 h-7 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-[10px] flex-shrink-0">📦</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{s.item} — <span className="text-brand-400">{s.action}</span></p>
                      <p className="text-slate-500">{s.loc} • {s.by}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 flex-shrink-0">{s.time}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold text-slate-900">Inventory Status</h3>
                <Button size="sm" variant="outline" onClick={()=>triggerToast('Inventory report exported.')}>Export</Button>
              </div>
              <div className="space-y-2">
                {[{cat:'Auto Parts',qty:284,allocated:210,pct:74},{cat:'Electronics',qty:142,allocated:95,pct:67},{cat:'Hazmat Goods',qty:28,allocated:28,pct:100},{cat:'General Freight',qty:680,allocated:412,pct:61},{cat:'Perishables',qty:48,allocated:40,pct:83}].map((inv,i)=>(
                  <div key={i} className="p-3 bg-white/40 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-900">{inv.cat}</span>
                      <span className="text-slate-500 font-mono">{inv.allocated}/{inv.qty} units</span>
                    </div>
                    <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${inv.pct>=90?'bg-red-500':inv.pct>=70?'bg-amber-500':'bg-brand-500'}`} style={{width:`${inv.pct}%`}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== REPORTS MODULE ===== */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {selectedReport ? (
            <div className="space-y-6 animate-fade-in text-left">
              {/* Detailed Report View */}
              <div className="flex justify-between items-center bg-white/40 border border-slate-200 p-4 rounded-2xl">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{selectedReport}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Real-time operational summary & business ledger insights.</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setSelectedReport(null)}>
                  ← Back to Reports
                </Button>
              </div>

              {/* Chart section */}
              <div className="glass rounded-2xl p-5 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-450 uppercase mb-4">{selectedReport} Trend Analytics</h4>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { name: 'Jan', value: 45000 },
                      { name: 'Feb', value: 52000 },
                      { name: 'Mar', value: 49000 },
                      { name: 'Apr', value: 68000 },
                      { name: 'May', value: 74000 },
                      { name: 'Jun', value: 84200 }
                    ]}>
                      <defs>
                        <linearGradient id="colorReport" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea0ea" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0ea0ea" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#23324C" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#23324C' }} />
                      <Area type="monotone" dataKey="value" stroke="#0ea0ea" fillOpacity={1} fill="url(#colorReport)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Table section */}
              <div className="glass rounded-2xl p-5 border border-slate-200 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-450 uppercase">Itemised Ledger Registry</h4>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleExportReportPDF(selectedReport)}>PDF</Button>
                    <Button size="sm" variant="primary" onClick={() => handleExportReportCSV(selectedReport)}>XLS</Button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                        <th className="py-2.5 px-3 text-left">Record / Reference</th>
                        <th className="py-2.5 px-3 text-left">Date / Period</th>
                        <th className="py-2.5 px-3 text-left">Type / Category</th>
                        <th className="py-2.5 px-3 text-right">Debit / Cost</th>
                        <th className="py-2.5 px-3 text-right">Credit / Revenue</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#23324C]/20 text-slate-600">
                      {[
                        { ref: 'REF-8812 (Chicago HQ)', date: 'Jun 26, 2026', cat: 'Standard Billing', deb: '$0.00', cred: '$4,200.00', status: 'Settled' },
                        { ref: 'REF-8411 (BP station Chicago)', date: 'Jun 25, 2026', cat: 'Fuel Expense', deb: '$340.50', cred: '$0.00', status: 'Approved' },
                        { ref: 'REF-7922 (Dallas terminal)', date: 'Jun 24, 2026', cat: 'Inter-Company', deb: '$0.00', cred: '$1,800.00', status: 'Settled' },
                        { ref: 'REF-6821 (Tyre replacements)', date: 'Jun 21, 2026', cat: 'Maintenance', deb: '$1,200.00', cred: '$0.00', status: 'Approved' },
                        { ref: 'REF-4819 (Memphis Shippers)', date: 'Jun 20, 2026', cat: 'Bulk Freight', deb: '$0.00', cred: '$8,800.00', status: 'Settled' }
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/20">
                          <td className="py-2.5 px-3 font-bold text-slate-900">{row.ref}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">{row.date}</td>
                          <td className="py-2.5 px-3 text-slate-500">{row.cat}</td>
                          <td className="py-2.5 px-3 text-right text-red-400 font-mono">{row.deb}</td>
                          <td className="py-2.5 px-3 text-right text-emerald-400 font-mono font-bold">{row.cred}</td>
                          <td className="py-2.5 px-3 text-center"><span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold">{row.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-medium text-xs">
                {[{label:'Revenue MTD',value:'$84,200',color:'text-emerald-400'},{label:'Expense MTD',value:'$31,540',color:'text-red-400'},{label:'Net Profit',value:'$52,660',color:'text-brand-400'},{label:'GST Collected',value:'$8,420',color:'text-amber-400'}].map((k,i)=>(
                  <div key={i} className="p-3 glass border border-slate-200 rounded-2xl text-left">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{k.label}</p>
                    <p className={`text-xl font-black ${k.color} mt-0.5`}>{k.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {title:'Revenue Report',desc:'Monthly revenue breakdown by customer and branch.',icon:'💰',color:'emerald'},
                  {title:'Expense Report',desc:'All company expenses categorised by type.',icon:'📉',color:'red'},
                  {title:'Profit & Loss',desc:'Full P&L statement with branch comparison.',icon:'📊',color:'brand'},
                  {title:'Driver Performance',desc:'Ratings, on-time %, safety scores per driver.',icon:'🚚',color:'brand'},
                  {title:'Fleet Utilization',desc:'Vehicle usage, KMs, downtime, fuel efficiency.',icon:'🛢️',color:'amber'},
                  {title:'Customer Revenue',desc:'Revenue per customer, load volume, growth.',icon:'👥',color:'blue'},
                  {title:'Branch Report',desc:'Revenue, expenses, staff, loads per branch.',icon:'🏢',color:'purple'},
                  {title:'Payroll Report',desc:'Weekly payroll summaries and cost breakdowns.',icon:'💳',color:'emerald'},
                  {title:'GST Report',desc:'Tax-ready GST collected and paid summary.',icon:'🧾',color:'amber'},
                ].map((r,i)=>(
                  <div key={i} className="glass rounded-2xl p-4 border border-slate-200 text-left space-y-3 hover:border-brand-500/30 transition-all group">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl">{r.icon}</div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase bg-white/60 px-2 py-0.5 rounded-full border border-slate-200">Report</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{r.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{r.desc}</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={()=>setSelectedReport(r.title)} className="flex-1 py-2 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/20 rounded-xl text-[10px] font-bold transition-all cursor-pointer">View Report</button>
                      <button type="button" onClick={()=>handleExportReportPDF(r.title)} className="px-3 py-2 bg-white/60 hover:bg-white text-slate-500 rounded-xl text-[10px] font-bold transition-all cursor-pointer">PDF</button>
                      <button type="button" onClick={()=>handleExportReportCSV(r.title)} className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-bold transition-all cursor-pointer">XLS</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== ASSET REGISTER ENHANCEMENTS ===== */}
      {activeTab === 'assets' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[{label:'Total Assets',value:assets.length,color:'text-slate-900',sub:'All categories'},{label:'Active',value:assets.filter(a=>a.status==='Active').length,color:'text-emerald-400',sub:'Operational'},{label:'In Maintenance',value:assets.filter(a=>a.status==='Maintenance').length,color:'text-amber-400',sub:'Being serviced'},{label:'Assigned',value:assets.length,color:'text-brand-400',sub:'Across branches'}].map((k,i)=>(
              <div key={i} className="p-4 glass border border-slate-200 rounded-2xl text-left space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{k.label}</p>
                <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
                <p className="text-[10px] text-slate-500 font-semibold">{k.sub}</p>
              </div>
            ))}
          </div>

          <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <h3 className="text-sm font-extrabold text-slate-900">Asset Register</h3>
              <div className="flex gap-2">
                <SearchInput value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} onClear={()=>setSearchQuery('')} className="max-w-[180px]" />
                <Button size="sm" variant="primary" icon={Plus} onClick={()=>setAddModalOpen(true)}>Add Asset</Button>
              </div>
            </div>

            {/* Asset Category Filter */}
            <div className="flex flex-wrap gap-2">
              {['All','Warehouse Equipment','Scanning Devices','Power Units','Vehicles','IT Equipment'].map(cat=>(
                <button key={cat} onClick={()=>triggerToast(`Filtered assets by category: ${cat}`)} className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/60 text-slate-500 hover:text-slate-900 hover:bg-white border border-slate-200 transition-all cursor-pointer">{cat}</button>
              ))}
            </div>

            <DataTable columns={[
              {key:'name',label:'Asset Name',render:(row)=><span className="font-extrabold text-slate-900">{row.name}</span>},
              {key:'type',label:'Category / Type',render:(row)=><span className="text-slate-600 font-semibold">{row.type}</span>},
              {key:'serial',label:'Serial / Tag',render:(row)=><span className="font-mono text-brand-400 text-[10px]">{row.serial}</span>},
              {key:'status',label:'Status',render:(row)=><StatusBadge status={row.status}/>},
              {key:'depreciation',label:'Est. Value',render:()=><span className="font-mono text-emerald-400 text-xs">${(Math.random()*8000+2000).toFixed(0)}</span>},
              {key:'qr',label:'QR Code',render:(row)=><button onClick={()=>{setSelectedAssetForQr(row); setQrModalOpen(true);}} className="px-2 py-1 bg-white text-slate-600 border border-slate-200 rounded-lg text-[10px] font-bold cursor-pointer hover:text-brand-400 hover:border-brand-500/30 transition-all">Generate QR</button>},
              {key:'actions',label:'Actions',render:(row)=>(
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={()=>handleOpenInspect(row, 'asset')}>Inspect</Button>
                  <Button size="sm" variant="outline" onClick={()=>{setSelectedAssetForAssign(row); setAssignBranchModalOpen(true);}}>Assign</Button>
                </div>
              )}
            ]} data={assets.filter(a=>a.name.toLowerCase().includes(searchQuery.toLowerCase()))} />
          </div>

          {/* Depreciation Table */}
          <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900">Asset Depreciation Schedule</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-slate-200">{['Asset','Purchase Cost','Annual Dep.','Current Value','Age','Status'].map(h=>(<th key={h} className="text-left py-2 px-3 text-[10px] font-bold text-slate-500 uppercase">{h}</th>))}</tr></thead>
                <tbody className="divide-y divide-[#23324C]/20">
                  {[{name:'Forklift TR-01',cost:'$45,000',dep:'$9,000',val:'$27,000',age:'2 yrs',s:'Good'},{name:'Zebra TC57 Scanner',cost:'$1,200',dep:'$300',val:'$600',age:'2 yrs',s:'Good'},{name:'Detroit Generator',cost:'$12,000',dep:'$2,400',val:'$4,800',age:'3 yrs',s:'Fair'}].map((r,i)=>(
                    <tr key={i} className="hover:bg-slate-900/20">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{r.name}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{r.cost}</td>
                      <td className="py-2.5 px-3 font-mono text-red-400">{r.dep}</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400">{r.val}</td>
                      <td className="py-2.5 px-3 text-slate-500">{r.age}</td>
                      <td className="py-2.5 px-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${r.s==='Good'?'bg-emerald-500/10 text-emerald-400 border-emerald-500/20':'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{r.s}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== AI FEATURES CENTER ===== */}
      {activeTab === 'ai-center' && (
        <div className="space-y-6">
          <div className="p-5 bg-gradient-to-r from-brand-500/10 to-purple-500/10 border border-brand-500/25 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-2xl flex-shrink-0">🤖</div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">AI Command Center</h3>
              <p className="text-xs text-slate-500 mt-0.5">Intelligent automation, predictions, and suggestions powered by Hero Logistics AI engine.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {title:'AI Receipt Reader',desc:'Auto-extract vendor, amount, date from receipt photos.',icon:'📷',badge:'Active',color:'emerald',action:'Scan Receipt',fn:'AI Receipt Reader activated. Upload a receipt photo to extract data.'},
              {title:'AI Dispatch Suggestions',desc:'Smart driver & vehicle matching for incoming loads.',icon:'🗺️',badge:'Active',color:'emerald',action:'Get Suggestions',fn:'AI analysed 14 active loads. Suggestion: Assign John D. to LD-9422 (ETA improvement: +18%).'},
              {title:'AI ETA Prediction',desc:'Predict delivery ETAs using traffic, weather & history.',icon:'⏱️',badge:'Active',color:'emerald',action:'Predict ETAs',fn:'AI ETA: LD-9411 Chicago→Dallas — Predicted arrival: 06/27 14:30 (95.2% confidence).'},
              {title:'AI Cost Suggestions',desc:'Optimise routes to reduce fuel and toll costs.',icon:'💡',badge:'Active',color:'emerald',action:'Optimise Costs',fn:'AI identified $1,240 in potential savings: Route LD-9418 via I-94 saves 42 miles & $320 fuel.'},
              {title:'AI Alert Center',desc:'Proactive alerts for compliance, expiries, and anomalies.',icon:'🔔',badge:'3 Alerts',color:'amber',action:'View Alerts',fn:'3 AI Alerts: 2 CDL licenses expiring <15 days, 1 vehicle insurance renewal overdue.'},
              {title:'AI Load Optimiser',desc:'Group and sequence loads for maximum efficiency.',icon:'📦',badge:'Beta',color:'purple',action:'Optimise Loads',fn:'AI load grouping: Combining LD-9418 & LD-9420 reduces total KMs by 180 miles.'},
            ].map((ai,i)=>(
              <div key={i} className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-3 hover:border-brand-500/25 transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-xl">{ai.icon}</div>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    ai.color==='emerald'?'bg-emerald-500/10 text-emerald-400 border-emerald-500/20':
                    ai.color==='amber'?'bg-amber-500/10 text-amber-400 border-amber-500/20':
                    'bg-purple-500/10 text-purple-400 border-purple-500/20'
                  }`}>{ai.badge}</span>
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">{ai.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{ai.desc}</p>
                </div>
                <button type="button" onClick={()=>handleTriggerAiAction(ai)} className="w-full py-2 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer">{ai.action}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* settings screen */}
      {/* settings screen */}
      {activeTab === 'settings' && (() => {
        // Enforce settingsAccess permission check
        if (!checkPermission('settingsAccess', 'view Operations Settings')) {
          return (
            <div className="glass rounded-2xl p-8 border border-red-500/20 bg-red-500/5 text-center text-red-400">
              <AlertTriangle className="h-10 w-10 mx-auto mb-4 animate-bounce" />
              <h4 className="font-extrabold text-sm text-slate-900">Access Denied</h4>
              <p className="text-[10px] text-slate-500 mt-1">Your role does not have permission to view or manage Operations Settings.</p>
            </div>
          );
        }

        // Calculate filtered and paginated audit logs
        const filteredAudits = auditLogs.filter(item => {
          if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            return (
              item.action.toLowerCase().includes(q) || 
              item.detail.toLowerCase().includes(q) || 
              item.user.toLowerCase().includes(q)
            );
          }
          return true;
        });
        const totalAuditPages = Math.ceil(filteredAudits.length / itemsPerPage);
        const paginatedAuditList = filteredAudits.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

        return (
          <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-6">
            <div className="flex border-b border-slate-200/45 pb-px text-xs font-bold gap-4 text-left justify-between items-center">
              <div className="flex gap-4">
                {[
                  { id: 'niche', label: 'Operations & Subscriptions' },
                  { id: 'audit', label: 'Audit Log & History' }
                ].map(sub => (
                  <button 
                    key={sub.id}
                    onClick={() => {
                      setSettingsSubTab(sub.id);
                      setCurrentPage(1);
                    }}
                    className={`capitalize pb-2 border-b-2 transition-all cursor-pointer ${
                      settingsSubTab === sub.id ? 'border-brand-500 text-brand-400 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Last Sync MTD: {new Date().toLocaleDateString()}</span>
            </div>

            {settingsSubTab === 'niche' ? (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Operations &amp; Subscription Settings</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Configure operational niche settings, set safety guidelines, and manage subscriptions.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Panel: Niche Configuration */}
                  <div className="lg:col-span-6 bg-white/60 border border-slate-200 rounded-2xl p-5 space-y-4">
                    <strong className="text-xs text-slate-700 block">Configure Company Operational Niche</strong>
                    <div className="space-y-3.5 text-xs">
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold uppercase text-[9px]">Select Active Operations Niche</label>
                        <select 
                          value={selectedNiche} 
                          onChange={(e) => {
                            setSelectedNiche(e.target.value);
                            logAuditEvent('Niche Changed', `Operations Niche changed to ${e.target.value}.`);
                            triggerToast(`Operations Niche changed to ${e.target.value}. Updating compliance rules...`);
                          }}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                        >
                          <option value="General Freight">General Freight</option>
                          <option value="Car Carrying">Car Carrying</option>
                          <option value="Dangerous Goods">Dangerous Goods</option>
                        </select>
                      </div>

                      {selectedNiche === 'Car Carrying' && (
                        <div className="bg-brand-500/5 border border-brand-500/10 p-3 rounded-xl space-y-2">
                          <span className="text-[9px] text-brand-400 font-bold uppercase tracking-wider block">Car Carrying compliance rules</span>
                          <ul className="list-disc list-inside text-[10px] text-slate-500 space-y-1">
                            <li>Requires active Auto-Ramp structural inspections.</li>
                            <li>Standard hauler vehicle configuration: Multi-car carrier trailer.</li>
                            <li>Pre-trip checklist includes tire pressure & tie-down straps safety validation.</li>
                          </ul>
                        </div>
                      )}

                      {selectedNiche === 'Dangerous Goods' && (
                        <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-xl space-y-2">
                          <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider block">HAZMAT Dangerous Goods compliance rules</span>
                          <ul className="list-disc list-inside text-[10px] text-slate-500 space-y-1">
                            <li>Requires Class 9 hazardous materials certificate on active shipments.</li>
                            <li>Placard verification checklist is mandatory for all active drivers.</li>
                            <li>Spills kit & safety containment guidelines must be marked as pass weekly.</li>
                          </ul>
                        </div>
                      )}

                      {selectedNiche === 'General Freight' && (
                        <div className="bg-slate-900/40 border border-slate-200 p-3 rounded-xl space-y-2">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">General Freight rules</span>
                          <ul className="list-disc list-inside text-[10px] text-slate-500 space-y-1">
                            <li>Requires standard dry van or refrigerated trailer clearance.</li>
                            <li>Warehouse forklift certification required for load handler staff.</li>
                            <li>Pallet capacity check is activated during loading phase.</li>
                          </ul>
                        </div>
                      )}
                    </div>
                    <Button variant="primary" className="w-full mt-2" onClick={() => {
                      logAuditEvent('Niche Configuration Saved', `Saved operations niche settings: ${selectedNiche}`);
                      triggerToast(`Niche settings saved for ${selectedNiche}`);
                    }}>
                      Save Niche Configuration
                    </Button>
                  </div>

                  {/* Right Panel: Subscription & Profile Summary */}
                  <div className="lg:col-span-6 bg-white/60 border border-slate-200 rounded-2xl p-5 space-y-4">
                    <strong className="text-xs text-slate-700 block">Company Profile &amp; Plan Tier</strong>
                    <div className="space-y-3 text-xs text-slate-500">
                      <div className="flex justify-between py-1 border-b border-slate-200/35">
                        <span>Registered Company Name</span>
                        <strong className="text-slate-900">{activeTenant?.name || 'Apex Logistics LLC'}</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/35">
                        <span>Contact E-mail</span>
                        <span className="text-slate-900">admin@apexlogistics.com</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200/35">
                        <span>Active Plan Tier</span>
                        <span className="bg-brand-500/10 text-brand-400 border border-brand-500/20 px-2 py-0.5 rounded font-bold uppercase text-[9px]">Enterprise Premium Plan</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Registered Drivers</span>
                        <span className="text-slate-900">{drivers.length} Drivers</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Registered Fleet size</span>
                        <span className="text-slate-900">{fleet.length} Vehicles</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">System Audit Log &amp; Activity Trail</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Immutable record of administrative mutations, configuration adjustments, and user actions.</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => {
                    const headers = ['Timestamp', 'Action Event', 'Audit Details', 'Operator'];
                    const rows = auditLogs.map(l => [l.time, l.action, l.detail, l.user]);
                    const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.setAttribute("href", url);
                    link.setAttribute("download", `Hero_Logistics_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    triggerToast('System Audit Logs exported.');
                  }}>
                    Export Logs (CSV)
                  </Button>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-bold">{filteredAudits.length} events logged</span>
                  <SearchInput value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onClear={() => setSearchQuery('')} className="max-w-[200px]" />
                </div>

                <DataTable columns={[
                  { key: 'time', label: 'Timestamp', render: (row) => <span className="font-mono text-slate-500 text-xs">{row.time}</span> },
                  { key: 'action', label: 'Action Event', render: (row) => <span className="font-extrabold text-slate-900 text-xs">{row.action}</span> },
                  { key: 'detail', label: 'Audit Details', render: (row) => <span className="text-slate-355 font-semibold text-xs leading-normal">{row.detail}</span> },
                  { key: 'user', label: 'Operator / Agent', render: (row) => <span className="text-brand-400 font-bold">{row.user}</span> }
                ]} data={paginatedAuditList} />
                <Pagination currentPage={currentPage} totalPages={totalAuditPages} onPageChange={setCurrentPage} />
              </div>
            )}
          </div>
        );
      })()}

      {/* branch-pl screen */}
      {activeTab === 'branch-pl' && (
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-5">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Branch Profit &amp; Loss Analysis</h3>
              <p className="text-xs text-slate-500 mt-0.5">Consolidated branch accounting statements, margins, and operational costs MTD.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setActiveTab('branches')}>
              ← Back to Branches
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 overflow-x-auto bg-white/60 border border-slate-200 rounded-2xl p-5">
              <strong className="text-xs text-slate-700 block mb-3">Profit &amp; Loss Statement (Consolidated)</strong>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase font-bold text-[9px]">
                    <th className="py-2.5 px-3 text-left">Branch Name</th>
                    <th className="py-2.5 px-3 text-right">Revenue</th>
                    <th className="py-2.5 px-3 text-right">Wages</th>
                    <th className="py-2.5 px-3 text-right">Fuel Cost</th>
                    <th className="py-2.5 px-3 text-right">Maintenance</th>
                    <th className="py-2.5 px-3 text-right">Net Profit</th>
                    <th className="py-2.5 px-3 text-center">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#23324C]/20 text-slate-500 font-mono">
                  {[
                    { name: 'Chicago HQ Terminal', rev: 55400, wages: 11200, fuel: 6200, maint: 2500, profit: 34280, margin: '61.9%' },
                    { name: 'Los Angeles Depot', rev: 28800, wages: 6400, fuel: 2800, maint: 800, profit: 18380, margin: '63.8%' },
                    { name: 'New York Terminal', rev: 15200, wages: 3600, fuel: 1500, maint: 1100, profit: 8200, margin: '53.9%' },
                    { name: 'Atlanta Depot', rev: 12400, wages: 2800, fuel: 1100, maint: 600, profit: 7700, margin: '62.1%' }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-955/40">
                      <td className="py-3 px-3 font-sans font-extrabold text-slate-900 text-left">{row.name}</td>
                      <td className="py-3 px-3 text-right text-emerald-400 font-bold">${row.rev.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-red-400">${row.wages.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-red-400">${row.fuel.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-red-400">${row.maint.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-brand-400 font-bold">${row.profit.toLocaleString()}</td>
                      <td className="py-3 px-3 text-center font-sans font-black text-brand-400">{row.margin}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-900/60 font-sans font-black">
                    <td className="py-3 px-3 text-slate-900 text-left">Consolidated Total</td>
                    <td className="py-3 px-3 text-right text-emerald-400 text-xs">$111,800</td>
                    <td className="py-3 px-3 text-right text-red-400 text-xs">$24,000</td>
                    <td className="py-3 px-3 text-right text-red-400 text-xs">$11,600</td>
                    <td className="py-3 px-3 text-right text-red-400 text-xs">$5,000</td>
                    <td className="py-3 px-3 text-right text-brand-400 text-xs">$68,560</td>
                    <td className="py-3 px-3 text-center text-brand-400 text-xs">61.3%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="lg:col-span-4 bg-white/60 border border-slate-200 rounded-2xl p-5 space-y-4">
              <strong className="text-xs text-slate-700 block">Profit Share Comparison</strong>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Chicago', profit: 34280 },
                    { name: 'Los Angeles', profit: 18380 },
                    { name: 'New York', profit: 8200 },
                    { name: 'Atlanta', profit: 7700 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#23324C" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#23324C' }} />
                    <Bar dataKey="profit" fill="#FFD400" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[10px] text-slate-500 space-y-1">
                <p>💡 Chicago HQ Terminal continues to drive <strong>50%</strong> of company MTD net operating margins.</p>
                <p>📈 Los Angeles shows highest margin efficiency at <strong>63.8%</strong>.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. AI Confirmation Modal */}
      <Modal 
        isOpen={!!aiActionReview} 
        onClose={() => setAiActionReview(null)} 
        title={`AI Decision Workflow: ${aiActionReview?.title}`}
      >
        {aiActionReview && (
          <div className="space-y-4 text-left text-xs">
            <div className="flex items-center gap-3 p-3.5 bg-brand-500/10 border border-brand-500/25 rounded-2xl">
              <span className="text-2xl">{aiActionReview.icon}</span>
              <div>
                <strong className="text-slate-900 text-xs block">{aiActionReview.title} Recommendation</strong>
                <p className="text-slate-500 text-[10px] mt-0.5">{aiActionReview.details}</p>
              </div>
            </div>
            
            <div className="bg-white/80 border border-slate-200 rounded-2xl p-4 space-y-3">
              <span className="text-[10px] text-slate-500 uppercase font-black block">AI Generated Proposal</span>
              <p className="text-slate-700 leading-relaxed font-mono">{aiActionReview.suggestion}</p>
              
              {aiActionReview.simulatedChange && (
                <div className="border-t border-slate-200 pt-3 mt-1 text-[11px] text-slate-500 space-y-1 bg-slate-900/30 p-2.5 rounded-xl">
                  <span className="font-bold text-brand-400">Simulation Comparison:</span>
                  <p className="font-mono">{aiActionReview.simulatedChange}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  triggerToast("Reviewing full route comparison map...");
                }}
                className="flex-1"
              >
                <Sparkles className="h-3 w-3 text-brand-400 mr-1" /> Review Simulation
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  const newProposal = prompt("Edit the AI proposal text:", aiActionReview.suggestion);
                  if (newProposal !== null) {
                    setAiActionReview({ ...aiActionReview, suggestion: newProposal });
                    triggerToast("AI Proposal edited successfully.");
                  }
                }}
                className="flex-1"
              >
                <Edit className="h-3 w-3 mr-1" /> Edit Proposal
              </Button>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => {
                  triggerToast("AI Proposal rejected and dismissed.");
                  setAiActionReview(null);
                }}
                className="flex-1"
              >
                Reject Recommendation
              </Button>
              <Button 
                variant="primary" 
                onClick={() => {
                  triggerToast("AI recommendation confirmed and applied successfully!");
                  setAiActionReview(null);
                }}
                className="flex-1"
              >
                Confirm & Apply
              </Button>
            </div>
          </div>
        )}
      </Modal>

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

      {/* Asset Assignment Modal */}
      <Modal isOpen={assignBranchModalOpen} onClose={() => setAssignBranchModalOpen(false)} title="Assign Asset to Branch">
        {selectedAssetForAssign && (
          <div className="space-y-4 text-left text-xs">
            <p className="text-slate-500">Assign asset <strong className="text-slate-900">{selectedAssetForAssign.name}</strong> ({selectedAssetForAssign.serial}) to a terminal location depot:</p>
            <div>
              <label className="block text-slate-500 font-bold uppercase text-[9px] mb-1">Select Branch Terminal</label>
              <select id="assign-asset-branch-select" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none">
                {branches.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>
            <Button 
              variant="primary" 
              className="w-full mt-2"
              onClick={() => {
                const branchName = document.getElementById('assign-asset-branch-select')?.value || 'Chicago HQ Terminal';
                triggerToast(`Asset ${selectedAssetForAssign.name} successfully assigned to ${branchName}.`);
                setAssignBranchModalOpen(false);
              }}
            >
              Confirm Assignment
            </Button>
          </div>
        )}
      </Modal>

      {/* Add User Modal */}
      <Modal isOpen={addUserModalOpen} onClose={() => setAddUserModalOpen(false)} title="Add New User">
        <form onSubmit={handleAddUserSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1 scrollbar-hide">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput label="First Name" required value={newUser.firstName} onChange={e => setNewUser({...newUser, firstName: e.target.value})} placeholder="e.g. John" />
            <TextInput label="Last Name" required value={newUser.lastName} onChange={e => setNewUser({...newUser, lastName: e.target.value})} placeholder="e.g. Doe" />
            <TextInput label="Email Address" type="email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} placeholder="john.doe@company.com" />
            <TextInput label="Phone Number" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} placeholder="+1 (555) 000-0000" />
            <TextInput label="Employee ID" value={newUser.employeeId} disabled />
            <div>
              <label className="block text-slate-500 font-bold uppercase text-[9px] mb-1">Profile Photo (Optional)</label>
              <input type="file" accept="image/*" className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-500/20 file:text-brand-400 hover:file:bg-brand-500/30 cursor-pointer" />
            </div>
            <SelectInput label="Role" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} options={[
              { value: 'Company Admin', label: 'Company Admin' },
              { value: 'Branch Manager', label: 'Branch Manager' },
              { value: 'Dispatcher', label: 'Dispatcher' },
              { value: 'Driver', label: 'Driver' },
              { value: 'Warehouse Staff', label: 'Warehouse Staff' },
              { value: 'Yard Staff', label: 'Yard Staff' },
              { value: 'Accounts', label: 'Accounts' },
              { value: 'Payroll', label: 'Payroll' },
              { value: 'HR', label: 'HR' },
              { value: 'Sales', label: 'Sales' },
              { value: 'Maintenance', label: 'Maintenance' }
            ]} />
            <SelectInput label="Branch Assignment" required value={newUser.branch} onChange={e => setNewUser({...newUser, branch: e.target.value})} options={[
              { value: '', label: 'Select Branch...' },
              ...branches.map(b => ({ value: b.name, label: b.name }))
            ]} />
            <SelectInput label="Status" value={newUser.status} onChange={e => setNewUser({...newUser, status: e.target.value})} options={[
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' }
            ]} />
          </div>

          <div className="pt-2">
            <label className="block text-slate-500 font-bold uppercase text-[9px] mb-2">Permissions</label>
            <div className="grid grid-cols-2 gap-2 bg-white/60 border border-slate-200 rounded-xl p-3">
              {permissionOptions.map(perm => (
                <label key={perm} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 bg-white border-slate-200 rounded accent-brand-500" 
                    checked={newUser.permissions.includes(perm)}
                    onChange={(e) => {
                      if (e.target.checked) setNewUser({...newUser, permissions: [...newUser.permissions, perm]});
                      else setNewUser({...newUser, permissions: newUser.permissions.filter(p => p !== perm)});
                    }}
                  />
                  {perm}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button type="button" variant="secondary" onClick={() => setAddUserModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={isSavingUser || !newUser.firstName || !newUser.lastName || !newUser.email || !newUser.branch}>
              {isSavingUser ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign User Modal */}
      <Modal isOpen={assignUserModalOpen} onClose={() => setAssignUserModalOpen(false)} title="Assign User To Branch">
        <form onSubmit={handleAssignUserSubmit} className="space-y-4">
          <SelectInput label="Select User" required value={assignUser.userId} onChange={e => setAssignUser({...assignUser, userId: e.target.value})} options={[
            { value: '', label: 'Select user...' },
            ...drivers.map(d => ({ value: d.id, label: d.name })) // using drivers mock for users
          ]} />
          
          <TextInput label="Current Branch" value={assignUser.currentBranch} disabled />
          
          <SelectInput label="Assign To Branch" required value={assignUser.assignToBranch} onChange={e => setAssignUser({...assignUser, assignToBranch: e.target.value})} options={[
            { value: '', label: 'Select destination branch...' },
            ...branches.map(b => ({ value: b.name, label: b.name }))
          ]} />
          
          <div className="grid grid-cols-2 gap-4">
            <TextInput label="Effective Date" type="date" required value={assignUser.effectiveDate} onChange={e => setAssignUser({...assignUser, effectiveDate: e.target.value})} />
            <TextInput label="New Position (Optional)" value={assignUser.position} onChange={e => setAssignUser({...assignUser, position: e.target.value})} placeholder="e.g. Lead Dispatcher" />
          </div>
          
          <div>
            <label className="block text-slate-500 font-bold uppercase text-[9px] mb-1">Assignment Notes</label>
            <textarea className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none focus:border-brand-500 min-h-[80px]" placeholder="Reason for transfer or special instructions..." value={assignUser.notes} onChange={e => setAssignUser({...assignUser, notes: e.target.value})}></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button type="button" variant="secondary" onClick={() => setAssignUserModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={isAssigningUser || !assignUser.userId || !assignUser.assignToBranch || !assignUser.effectiveDate}>
              {isAssigningUser ? 'Assigning...' : 'Assign'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Asset QR Code Modal */}
      <Modal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} title="Asset Barcode & QR Code Tag">
        {selectedAssetForQr && (
          <div className="space-y-4 text-center text-xs">
            <p className="text-slate-500">Scan tag below to check-in/out or update asset maintenance log:</p>
            
            <div className="bg-white p-4 rounded-2xl inline-block mx-auto border border-slate-200">
              <svg width="150" height="150" viewBox="0 0 100 100" className="mx-auto">
                <rect x="0" y="0" width="100" height="100" fill="white" />
                <rect x="5" y="5" width="25" height="25" fill="black" />
                <rect x="10" y="10" width="15" height="15" fill="white" />
                <rect x="13" y="13" width="9" height="9" fill="black" />

                <rect x="70" y="5" width="25" height="25" fill="black" />
                <rect x="75" y="10" width="15" height="15" fill="white" />
                <rect x="78" y="13" width="9" height="9" fill="black" />

                <rect x="5" y="70" width="25" height="25" fill="black" />
                <rect x="10" y="75" width="15" height="15" fill="white" />
                <rect x="13" y="78" width="9" height="9" fill="black" />
                
                <rect x="35" y="15" width="5" height="10" fill="black" />
                <rect x="45" y="5" width="15" height="5" fill="black" />
                <rect x="45" y="20" width="10" height="10" fill="black" />
                <rect x="15" y="45" width="15" height="5" fill="black" />
                <rect x="5" y="55" width="5" height="10" fill="black" />
                <rect x="35" y="35" width="20" height="5" fill="black" />
                <rect x="35" y="45" width="5" height="15" fill="black" />
                <rect x="45" y="55" width="15" height="10" fill="black" />
                <rect x="65" y="35" width="10" height="20" fill="black" />
                <rect x="80" y="45" width="15" height="5" fill="black" />
                <rect x="75" y="55" width="5" height="15" fill="black" />
                <rect x="65" y="75" width="10" height="5" fill="black" />
                <rect x="85" y="70" width="10" height="10" fill="black" />
                <rect x="80" y="85" width="15" height="5" fill="black" />
                <rect x="35" y="75" width="15" height="15" fill="black" />
                <rect x="55" y="80" width="5" height="5" fill="black" />
              </svg>
            </div>
            
            <div>
              <p className="font-extrabold text-slate-900 text-sm">{selectedAssetForQr.name}</p>
              <p className="font-mono text-[10px] text-brand-400 mt-0.5">{selectedAssetForQr.serial}</p>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="primary" 
                className="flex-1"
                onClick={() => {
                  triggerToast(`QR tag PNG for ${selectedAssetForQr.name} downloaded.`);
                  setQrModalOpen(false);
                }}
              >
                Download PNG
              </Button>
              <Button 
                variant="secondary" 
                className="flex-1"
                onClick={() => {
                  triggerToast(`QR tag sent to printer.`);
                  setQrModalOpen(false);
                }}
              >
                Print Label
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Details Drawer */}
      <Drawer isOpen={detailsDrawerOpen} onClose={() => setDetailsDrawerOpen(false)} title={`${drawerType.toUpperCase()} Detail Inspector`}>
        {selectedItem && (
          <div className="space-y-5 text-left text-slate-500 text-xs sm:text-sm flex flex-col h-full overflow-y-auto pr-1">
            <div className="border-b border-slate-200/65 pb-3">
              <h4 className="text-base font-extrabold text-slate-900 mb-1.5">{selectedItem.name || selectedItem.plate}</h4>
              <div className="flex justify-between items-center">
                <StatusBadge status={selectedItem.status} />
                <span className="text-[10px] font-mono text-slate-500 font-bold">ID: {selectedItem.id}</span>
              </div>
            </div>

            {/* Render Tabs for Fleet, Drivers, Branches, and Customers */}
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
                className="border-slate-200"
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
                className="border-slate-200"
              />
            )}

            {drawerType === 'branch' && (
              <Tabs 
                tabs={[
                  { id: 'profile', label: 'Profile', icon: MapPin },
                  { id: 'ops', label: 'Ops & Manager', icon: Briefcase },
                  { id: 'docs', label: 'Documents', icon: Calendar },
                  { id: 'history', label: 'History', icon: Activity }
                ]} 
                activeTab={inspectTab} 
                onChange={setInspectTab} 
                className="border-slate-200"
              />
            )}

            {drawerType === 'customer' && (
              <Tabs 
                tabs={[
                  { id: 'profile', label: 'Profile', icon: Users },
                  { id: 'ratecards', label: 'Rate Cards', icon: DollarSign },
                  { id: 'docs', label: 'Documents', icon: Calendar },
                  { id: 'timeline', label: 'Timeline', icon: Activity }
                ]} 
                activeTab={inspectTab} 
                onChange={setInspectTab} 
                className="border-slate-200"
              />
            )}

            <div className="flex-1 py-1">
              {/* --- BRANCH DETAIL --- */}
              {drawerType === 'branch' && (
                <div className="space-y-4">
                  {inspectTab === 'profile' && (
                    <div className="space-y-4 animate-fade-in">
                      {/* Key Info Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white/60 border border-slate-200/50 rounded-xl">
                          <span className="text-[9px] text-slate-500 font-bold uppercase block">Staff Count</span>
                          <strong className="text-slate-900 text-lg">{selectedItem.staff || 0}</strong>
                          <span className="text-[9px] text-slate-500 block">employees</span>
                        </div>
                        <div className="p-3 bg-white/60 border border-slate-200/50 rounded-xl">
                          <span className="text-[9px] text-slate-500 font-bold uppercase block">Active Loads</span>
                          <strong className="text-brand-400 text-lg">6</strong>
                          <span className="text-[9px] text-slate-500 block">this branch</span>
                        </div>
                        <div className="p-3 bg-white/60 border border-slate-200/50 rounded-xl">
                          <span className="text-[9px] text-slate-500 font-bold uppercase block">Fleet Here</span>
                          <strong className="text-slate-900 text-lg">{Math.ceil(fleet.length / 2)}</strong>
                          <span className="text-[9px] text-slate-500 block">vehicles assigned</span>
                        </div>
                        <div className="p-3 bg-white/60 border border-emerald-500/20 rounded-xl">
                          <span className="text-[9px] text-slate-500 font-bold uppercase block">Revenue</span>
                          <strong className="text-emerald-400 text-lg">$42.1K</strong>
                          <span className="text-[9px] text-slate-500 block">this month</span>
                        </div>
                      </div>

                      {/* Address & Contact */}
                      <div className="p-3.5 bg-white/50 border border-slate-200/45 rounded-xl space-y-2.5">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block uppercase">Address Location</span>
                          <strong className="text-slate-900 text-xs">{selectedItem.address}, {selectedItem.city}, {selectedItem.state}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block uppercase">HQ Operations Manager</span>
                          <span className="text-xs font-mono text-slate-600">{selectedItem.manager}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold block uppercase">Branch Status</span>
                            <span className={`text-[10px] font-bold uppercase ${(branchStatus[selectedItem.id] || 'Active') === 'Active' ? 'text-emerald-400' : 'text-red-400'}`}>
                              ● {(branchStatus[selectedItem.id] || 'Active') === 'Active' ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <button 
                            onClick={() => {
                              const curr = branchStatus[selectedItem.id] || 'Active';
                              const next = curr === 'Active' ? 'Inactive' : 'Active';
                              setBranchStatus({ ...branchStatus, [selectedItem.id]: next });
                              triggerToast(`Branch status toggled to ${next}.`);
                            }}
                            className={`w-9 h-4.5 rounded-full transition-all relative cursor-pointer ${(branchStatus[selectedItem.id] || 'Active') === 'Active' ? 'bg-emerald-500' : 'bg-slate-700'}`}
                          >
                            <span className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow transition-all ${(branchStatus[selectedItem.id] || 'Active') === 'Active' ? 'left-4.5' : 'left-0.5'}`} />
                          </button>
                        </div>
                      </div>

                      {/* Assigned Vehicles List */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-2">Assigned Fleet</span>
                        <div className="space-y-1.5">
                          {fleet.slice(0, 3).map((v, i) => (
                            <div key={i} className="flex justify-between items-center p-2 bg-slate-900/40 border border-slate-200 rounded-lg text-xs">
                              <span className="font-mono font-bold text-slate-900">{v.plate}</span>
                              <span className="text-slate-500">{v.type}</span>
                              <StatusBadge status={v.status || 'Active'} />
                            </div>
                          ))}
                          {fleet.length === 0 && <p className="text-[11px] text-slate-500 text-center py-2">No fleet assigned to this branch.</p>}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => triggerToast(`Branch P&L report loading for ${selectedItem.name}...`)}
                          className="flex-1 py-2 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 text-brand-400 text-xs rounded-xl font-bold transition-all cursor-pointer"
                        >
                          View Branch P&L
                        </button>
                        <button
                          onClick={() => triggerToast(`Editing branch ${selectedItem.name}...`)}
                          className="flex-1 py-2 bg-white/60 hover:bg-white text-slate-600 text-xs rounded-xl font-bold transition-all cursor-pointer"
                        >
                          Edit Branch
                        </button>
                      </div>
                    </div>
                  )}

                  {inspectTab === 'ops' && (
                    <div className="space-y-4 animate-fade-in text-xs">
                      {/* Manager Assignment */}
                      <div className="p-3 bg-white/40 border border-slate-200 rounded-xl space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Manager Assignment</span>
                        <div>
                          <label className="block text-slate-500 uppercase text-[9px] font-semibold mb-1">Select Operations Manager</label>
                          <select 
                            defaultValue={selectedItem.manager}
                            onChange={(e) => {
                              setBranches(branches.map(b => b.id === selectedItem.id ? { ...b, manager: e.target.value } : b));
                              setSelectedItem({ ...selectedItem, manager: e.target.value });
                              triggerToast(`Operations Manager reassigned for ${selectedItem.name}.`);
                            }}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                          >
                            <option value="hq@company.com">hq@company.com (HQ Lead)</option>
                            <option value="la@company.com">la@company.com (LA Lead)</option>
                            <option value="dallas@company.com">dallas@company.com (Dallas Lead)</option>
                            <option value="ops-lead@company.com">ops-lead@company.com (Ops General)</option>
                          </select>
                        </div>
                      </div>

                      {/* Operating Hours Editor */}
                      <div className="p-3 bg-white/40 border border-slate-200 rounded-xl space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Operating Hours & Schedule</span>
                        <div className="space-y-2 font-mono text-[11px] text-slate-500">
                          <div className="flex justify-between"><span>Mon - Fri</span><span className="text-slate-900">08:00 AM - 06:00 PM</span></div>
                          <div className="flex justify-between"><span>Saturday</span><span className="text-slate-900">09:00 AM - 02:00 PM</span></div>
                          <div className="flex justify-between text-red-400"><span>Sunday</span><span>Closed</span></div>
                        </div>
                        <button 
                          onClick={() => triggerToast('Business operating hours editor opened.')}
                          className="w-full py-1.5 mt-2 bg-white hover:bg-slate-750 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Configure Hours
                        </button>
                      </div>
                    </div>
                  )}

                  {inspectTab === 'docs' && (
                    <div className="space-y-4 animate-fade-in text-xs">
                      {/* Document Management */}
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Branch Documents & Policies</span>
                      <div className="space-y-2">
                        {[
                          { name: 'WHS Safety Certificate', size: '2.4 MB', updated: '05/20/2026' },
                          { name: 'Depot Lease Agreement.pdf', size: '14.8 MB', updated: '02/12/2026' },
                          { name: 'Public Liability Policy.pdf', size: '4.1 MB', updated: '06/01/2026' }
                        ].map((doc, i) => (
                          <div key={i} className="p-2.5 bg-slate-900/60 border border-slate-200/45 rounded-xl flex justify-between items-center text-xs">
                            <div>
                              <strong className="text-slate-700 block">{doc.name}</strong>
                              <span className="text-[9px] text-slate-500 font-mono">Size: {doc.size} • Updated: {doc.updated}</span>
                            </div>
                            <button 
                              onClick={() => triggerToast(`Downloading ${doc.name}...`)}
                              className="px-2.5 py-1 bg-white hover:bg-slate-700 border border-slate-200 rounded text-[10px] font-bold cursor-pointer"
                            >
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-brand-500/30 transition-all cursor-pointer" onClick={() => triggerToast('Branch document upload dialog opened.')}>
                        <p className="text-[11px] font-bold text-slate-500">Upload New compliance/facility document</p>
                        <p className="text-[9px] text-slate-500">PDF, PNG, JPG up to 20MB</p>
                      </div>
                    </div>
                  )}

                  {inspectTab === 'history' && (
                    <div className="space-y-4 animate-fade-in text-xs">
                      {/* Transfer History */}
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Custodian Load Transfers</span>
                      <div className="space-y-2">
                        {[
                          { load: 'LD-9411', partner: 'Super Freight Carriers', type: 'Load Out', date: 'Jun 25', status: 'Accepted' },
                          { load: 'LD-1102', partner: 'Rapid Logistics SA', type: 'Load In', date: 'Jun 22', status: 'Accepted' },
                          { load: 'LD-4809', partner: 'Car Transporters Co', type: 'Load Out', date: 'Jun 18', status: 'Rejected' }
                        ].map((tx, i) => (
                          <div key={i} className="p-2.5 bg-white/40 border border-slate-200/35 rounded-xl flex justify-between items-center text-xs">
                            <div>
                              <strong className="text-slate-900 block">{tx.load} ({tx.type})</strong>
                              <span className="text-[9px] text-slate-500">Partner: {tx.partner} • {tx.date}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${tx.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                              {tx.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- CUSTOMER DETAIL --- */}
              {drawerType === 'customer' && (
                <div className="space-y-4">
                  {inspectTab === 'profile' && (
                    <div className="space-y-4 animate-fade-in text-xs sm:text-sm">
                      <div className="p-3.5 bg-white/50 border border-slate-200/45 rounded-xl space-y-2.5">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block uppercase">Client Contact Billing</span>
                          <strong className="text-slate-900 text-xs font-mono">{selectedItem.email}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block uppercase">Contract Terms</span>
                          <span className="text-xs text-slate-600">{selectedItem.contract} ({selectedItem.billing})</span>
                        </div>
                      </div>

                      {/* Credit Limit & Portal Access */}
                      <div className="p-3.5 bg-white/50 border border-slate-200/45 rounded-xl space-y-3 text-xs">
                        <div>
                          <label className="block text-slate-500 uppercase text-[9px] font-bold mb-1">Credit Limit ($)</label>
                          <div className="flex gap-2">
                            <input 
                              type="number" 
                              id="cust-credit-limit"
                              defaultValue="50000" 
                              className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono text-xs focus:outline-none" 
                            />
                            <button 
                              onClick={() => {
                                const val = document.getElementById('cust-credit-limit')?.value || '50000';
                                triggerToast(`Credit limit updated to $${parseFloat(val).toLocaleString()} for ${selectedItem.name}.`);
                              }}
                              className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-slate-950 rounded-lg font-black transition-all cursor-pointer"
                            >
                              Apply
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-slate-200/35 pt-3">
                          <div>
                            <span className="font-bold text-slate-900 block">Client Portal Access</span>
                            <span className="text-[9px] text-slate-500">Allow this client to log in and track custody loads</span>
                          </div>
                          <button 
                            onClick={() => triggerToast(`Client portal access toggled.`)}
                            className="w-10 h-5 bg-brand-500 shadow-brand-500/20 rounded-full relative cursor-pointer transition-all"
                          >
                            <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all left-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {inspectTab === 'ratecards' && (
                    <div className="space-y-4 animate-fade-in text-xs">
                      {/* Rate Cards Table */}
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Configured Agreement Rate Cards</span>
                      <div className="space-y-2">
                        {[
                          { route: 'Chicago ➔ Dallas', cargo: 'General Freight', rate: '$2,850', fsc: '12%' },
                          { route: 'Los Angeles ➔ Seattle', cargo: 'Refrigerated', rate: '$4,100', fsc: '14%' },
                          { route: 'Dallas ➔ Los Angeles', cargo: 'Hazmat Goods', rate: '$3,900', fsc: '15%' }
                        ].map((card, i) => (
                          <div key={i} className="p-3 bg-slate-900/60 border border-slate-200/45 rounded-xl flex justify-between items-center text-xs">
                            <div>
                              <strong className="text-slate-900 block">{card.route}</strong>
                              <span className="text-[9px] text-slate-500">Cargo: {card.cargo}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold font-mono text-emerald-450 block">{card.rate}</span>
                              <span className="text-[9px] text-slate-500">FSC Surcharge: {card.fsc}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => triggerToast('Custom rate card configuration loaded.')}>
                        + Add Custom Rate Card
                      </Button>
                    </div>
                  )}

                  {inspectTab === 'docs' && (
                    <div className="space-y-4 animate-fade-in text-xs">
                      {/* Documents Tab */}
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Signed Agreements & Licenses</span>
                      <div className="space-y-2">
                        {[
                          { name: 'Master Services Agreement (MSA).pdf', date: '04/10/2026' },
                          { name: 'Credit Application Form.pdf', date: '04/09/2026' },
                          { name: 'W9 Tax Exemption Certificate.pdf', date: '04/12/2026' }
                        ].map((doc, i) => (
                          <div key={i} className="p-2.5 bg-slate-900/60 border border-slate-200 rounded-xl flex justify-between items-center">
                            <div>
                              <strong className="text-slate-700 block truncate max-w-[200px]">{doc.name}</strong>
                              <span className="text-[9px] text-slate-500 font-mono">Uploaded: {doc.date}</span>
                            </div>
                            <button 
                              onClick={() => triggerToast(`Downloading ${doc.name}...`)}
                              className="px-2 py-1 bg-white hover:bg-slate-750 rounded text-[9px] font-bold cursor-pointer"
                            >
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {inspectTab === 'timeline' && (
                    <div className="space-y-4 animate-fade-in text-xs">
                      {/* Customer Activity Timeline */}
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Recent Customer Events</span>
                      <div className="space-y-3.5 pl-3 border-l border-slate-200/80 ml-1">
                        {[
                          { time: 'Jun 26 11:15', text: 'Invoice #INV-0411 ($12,400) dispatched to email.' },
                          { time: 'Jun 25 09:20', text: 'New load LD-9418 requested for route Chicago ➔ LA.' },
                          { time: 'Jun 22 14:10', text: 'Credit limit increased by $10,000 via dashboard override.' },
                          { time: 'Jun 10 10:00', text: 'Master Services Agreement (MSA) signed for 12 months.' }
                        ].map((evt, i) => (
                          <div key={i} className="relative">
                            <span className="absolute left-[-16px] top-1.5 w-1.5 h-1.5 rounded-full bg-brand-500" />
                            <p className="text-slate-700 text-xs font-semibold leading-normal">{evt.text}</p>
                            <span className="text-[9.5px] text-slate-500 font-mono mt-0.5 block">{evt.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- TRAILER DETAIL --- */}
              {drawerType === 'trailer' && (
                <div className="space-y-3.5">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Parking Slot</span>
                    <strong className="text-slate-900 text-xs font-mono">{selectedItem.spot}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Trailer Specifications</span>
                    <span className="text-xs text-slate-600">{selectedItem.type} Container</span>
                  </div>
                </div>
              )}

              {/* --- ASSET DETAIL --- */}
              {drawerType === 'asset' && (
                <div className="space-y-4">
                  <div className="p-3 bg-white/60 border border-slate-200/50 rounded-xl space-y-2 text-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Asset Information</span>
                    <div className="flex justify-between"><span className="text-slate-500">Name</span><span className="text-slate-900 font-bold">{selectedItem.name}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Category Type</span><span className="text-slate-600 font-semibold">{selectedItem.type}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Serial Code</span><span className="text-brand-400 font-mono font-bold">{selectedItem.serial}</span></div>
                  </div>

                  <div className="p-3 bg-white/60 border border-slate-200/50 rounded-xl space-y-2 text-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Maintenance Schedule</span>
                    <div className="flex justify-between"><span className="text-slate-500">Last Service Date</span><span className="text-slate-600 font-mono">05/15/2026</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Next Due Date</span><span className="text-amber-400 font-mono font-bold">08/15/2026</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Service Cycle</span><span className="text-slate-600">Every 90 Days</span></div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full" onClick={() => triggerToast(`Maintenance scheduled for asset: ${selectedItem.name}`)}>
                    Schedule Asset Maintenance
                  </Button>
                </div>
              )}



              {/* --- FLEET VEHICLE COMPLIANCE TABS --- */}
              {drawerType === 'fleet' && (
                <div className="space-y-4">
                  {inspectTab === 'profile' && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-900/40 border border-slate-200 rounded-xl">
                          <span className="text-[9px] text-slate-500 font-bold uppercase block">Vehicle Plate / Type</span>
                          <strong className="text-slate-900 text-xs block mt-1">{selectedItem.plate}</strong>
                          <span className="text-[9px] text-slate-500 block mt-0.5">{selectedItem.type}</span>
                        </div>
                        <div className="p-3 bg-slate-900/40 border border-slate-200 rounded-xl">
                          <span className="text-[9px] text-slate-500 font-bold uppercase block">Odometer / Efficiency</span>
                          <strong className="text-slate-900 text-xs block mt-1">{selectedItem.mileage || '10,000 miles'}</strong>
                          <span className="text-[9px] text-brand-400 font-bold block mt-0.5">{selectedItem.efficiency || '7.2 mpg'}</span>
                        </div>
                      </div>

                      {/* Expiry alerts for Registration and Insurance */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Compliance Registration</span>
                        <div className="p-3 bg-white/60 border border-slate-200/45 rounded-xl text-xs space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-slate-500">State Registration</span>
                            <span className="text-slate-900 font-mono">{selectedItem.registration?.state || 'TX'} ({selectedItem.registration?.number || 'REG-TX8'})</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Expiration Date</span>
                            <span className={`font-semibold font-mono ${
                              new Date(selectedItem.registration?.expires) - new Date() < 15 * 24 * 60 * 60 * 1000
                                ? 'text-red-400 animate-pulse'
                                : 'text-slate-700'
                            }`}>{selectedItem.registration?.expires || '2026-08-30'}</span>
                          </div>
                          {new Date(selectedItem.registration?.expires) - new Date() < 15 * 24 * 60 * 60 * 1000 && (
                            <div className="text-[10px] text-red-400 font-bold flex items-center gap-1 mt-1 bg-red-500/5 p-1 rounded border border-red-500/10">
                              <AlertTriangle className="h-3 w-3" /> Registration soon to expire! Renew immediately.
                            </div>
                          )}
                        </div>

                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mt-3">Insurance Policy</span>
                        <div className="p-3 bg-white/60 border border-slate-200/45 rounded-xl text-xs space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Policy Provider</span>
                            <span className="text-slate-900 font-bold">{selectedItem.insurance?.provider || 'Progressive'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Policy Number</span>
                            <span className="text-slate-900 font-mono">{selectedItem.insurance?.policy || 'POL-8812'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Policy Expiration</span>
                            <span className={`font-semibold font-mono ${
                              new Date(selectedItem.insurance?.expires) - new Date() < 15 * 24 * 60 * 60 * 1000
                                ? 'text-red-400 animate-pulse'
                                : 'text-slate-700'
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
                            <div key={idx} className="p-2.5 bg-slate-900/60 border border-slate-200 rounded-xl flex justify-between text-xs">
                              <div>
                                <strong className="text-slate-700 block">{log.service}</strong>
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
                      <form onSubmit={handleAddMaintenanceLog} className="p-3 bg-white/40 border border-slate-200 rounded-xl space-y-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Log Completed Service</span>
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
                            <div key={idx} className="p-2.5 bg-slate-900/60 border border-slate-200 rounded-xl flex justify-between text-xs">
                              <div>
                                <strong className="text-slate-700 block">{sched.service}</strong>
                                <span className="text-[9px] text-slate-500 font-mono">Scheduled: {sched.date}</span>
                              </div>
                              <span className="text-brand-400 text-[10px] font-bold">Awaiting Service</span>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Schedule service form */}
                      <form onSubmit={handleAddServiceSchedule} className="p-3 bg-white/40 border border-slate-200 rounded-xl space-y-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Schedule New Maintenance</span>
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
                            <div key={idx} className="p-2.5 bg-slate-900/60 border border-slate-200 rounded-xl text-xs space-y-1">
                              <div className="flex justify-between">
                                <strong className="text-slate-700">{insp.date} • {insp.inspector}</strong>
                                <span className={insp.result === 'Pass' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{insp.result}</span>
                              </div>
                              <p className="text-slate-500 text-[10px]">"{insp.notes}"</p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Log inspection form */}
                      <form onSubmit={handleAddInspection} className="p-3 bg-white/40 border border-slate-200 rounded-xl space-y-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Log Safety Inspection</span>
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
                      <div className="divide-y divide-[#23324C]/45 bg-white/40 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                        <div className="flex justify-between py-1 text-xs">
                          <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Driver Name</span>
                          <strong className="text-slate-900 font-bold">{selectedItem.name}</strong>
                        </div>
                        <div className="flex justify-between py-1 text-xs">
                          <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Portal Email</span>
                          <span className="text-slate-700 font-mono">{selectedItem.email}</span>
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
                          <span className="text-slate-700 font-bold">{selectedItem.totalDeliveries || 0} runs</span>
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
                        <div className="p-3 bg-slate-900/60 border border-slate-200/45 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-900">CDL Driver License</span>
                            <StatusBadge status={selectedItem.license?.status || 'Valid'} />
                          </div>
                          <p className="text-[10px] text-slate-500">License Number: <span className="font-mono text-slate-700">{selectedItem.license?.number || 'N/A'}</span></p>
                          <div className="flex items-center justify-between gap-2 mt-1">
                            <span className="text-slate-500 text-[10px]">Expires: {selectedItem.license?.expires || 'N/A'}</span>
                            <input 
                              type="date" 
                              value={selectedItem.license?.expires || ''} 
                              onChange={(e) => handleUpdateDriverDocExpiries('license', e.target.value)} 
                              className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] text-slate-250 cursor-pointer"
                            />
                          </div>
                          {selectedItem.license?.status === 'Soon to Expire' && (
                            <span className="text-[9px] text-amber-400 font-bold block mt-1">⚠️ Warning: CDL soon to expire! Update record fields.</span>
                          )}
                        </div>

                        <div className="p-3 bg-slate-900/60 border border-slate-200/45 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-900">Medical Card CDL</span>
                            <StatusBadge status={selectedItem.medicalCard?.status || 'Valid'} />
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-1">
                            <span className="text-slate-500 text-[10px]">Expires: {selectedItem.medicalCard?.expires || 'N/A'}</span>
                            <input 
                              type="date" 
                              value={selectedItem.medicalCard?.expires || ''} 
                              onChange={(e) => handleUpdateDriverDocExpiries('medicalCard', e.target.value)} 
                              className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] text-slate-250 cursor-pointer"
                            />
                          </div>
                          {selectedItem.medicalCard?.status === 'Soon to Expire' && (
                            <span className="text-[9px] text-amber-400 font-bold block mt-1">⚠️ Warning: Medical certificate renewal required soon.</span>
                          )}
                        </div>

                        <div className="p-3 bg-slate-900/60 border border-slate-200/45 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-900">HAZMAT Endorsement Certificate</span>
                            <StatusBadge status={selectedItem.hazmatCert?.status || 'Valid'} />
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-1">
                            <span className="text-slate-500 text-[10px]">Expires: {selectedItem.hazmatCert?.expires || 'N/A'}</span>
                            <input 
                              type="date" 
                              value={selectedItem.hazmatCert?.expires || ''} 
                              onChange={(e) => handleUpdateDriverDocExpiries('hazmatCert', e.target.value)} 
                              className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] text-slate-250 cursor-pointer"
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
                      <div className="p-3 bg-slate-900/60 border border-slate-200/45 rounded-xl space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">ELD Log compliance Audit</span>
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
                          <span className="text-slate-900 font-mono">{selectedItem.complianceRecords?.backgroundCheckDate || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Training courses */}
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mt-3">Completed Training Courses</span>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {(selectedItem.trainingRecords || []).length === 0 ? (
                          <p className="text-[11px] text-slate-500 text-center py-2">No training files cataloged.</p>
                        ) : (
                          (selectedItem.trainingRecords || []).map((course, idx) => (
                            <div key={idx} className="p-2.5 bg-white/40 border border-slate-200 rounded-xl flex justify-between">
                              <div>
                                <span className="font-bold text-slate-700 block">{course.course}</span>
                                <span className="text-[9px] text-slate-500 font-mono">{course.date}</span>
                              </div>
                              <span className="text-brand-400 font-bold font-mono">{course.score}</span>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add course form */}
                      <form onSubmit={handleAddTrainingRecord} className="p-3 bg-white/45 border border-slate-200 rounded-xl space-y-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Log Course Completion</span>
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
                      <div className="p-3 bg-white/50 border border-slate-200 rounded-xl text-center space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Safety Index Score Trend</span>
                        <div className="h-32 w-full text-slate-700">
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
            <div className="flex gap-2 border-t border-slate-200 pt-4 mt-auto">
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

      {/* Reusable Enterprise Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl space-y-4 text-left">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-xl">⚠️</span>
              <h3 className="text-base font-extrabold text-slate-900">{confirmTitle}</h3>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">{confirmText}</p>
            
            <div className="flex gap-2.5 pt-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setConfirmModalOpen(false);
                  setConfirmAction(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={() => {
                  if (confirmAction) {
                    confirmAction();
                  }
                  setConfirmModalOpen(false);
                  setConfirmAction(null);
                }}
              >
                Confirm Action
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
