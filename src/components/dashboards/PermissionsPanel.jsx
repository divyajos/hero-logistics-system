import React, { useState, useEffect } from 'react';
import { useLogistics } from '../../context/LogisticsContext';
import Button from '../common/Button';
import Modal from '../common/Modal';
import TextInput from '../common/TextInput';
import SelectInput from '../common/SelectInput';

const defaultMatrix = [
  {id: 1, label:'Create Loads',key:'createLoads',def:['dispatcher']},
  {id: 2, label:'Edit Routes',key:'editRoutes',def:['dispatcher']},
  {id: 3, label:'View Financials',key:'viewFinancials',def:['accounts']},
  {id: 4, label:'Approve Payroll',key:'approvePayroll',def:['accounts']},
  {id: 5, label:'Warehouse Access',key:'warehouseAccess',def:['warehouse','yard']},
  {id: 6, label:'Driver Management',key:'driverMgmt',def:['dispatcher']},
  {id: 7, label:'Customer Portal',key:'customerPortal',def:['dispatcher','accounts','customer']},
  {id: 8, label:'Export Reports',key:'exportReports',def:['dispatcher','accounts']},
  {id: 9, label:'Asset Register',key:'assetRegister',def:['warehouse']},
  {id: 10, label:'Expense Submit',key:'expenseSubmit',def:['dispatcher','driver','warehouse','accounts','yard']},
  {id: 11, label:'Invoice View',key:'invoiceView',def:['accounts','customer']},
  {id: 12, label:'Settings Access',key:'settingsAccess',def:[]},
];

const defaultFeatures = [
  {id: 1, label:'AI Dispatch Suggestions',desc:'Show AI-powered route & driver suggestions',key:'aiDispatch',on:true},
  {id: 2, label:'GPS Live Tracking',desc:'Enable real-time vehicle GPS map view',key:'gpsTracking',on:true},
  {id: 3, label:'Driver Chat (In-App)',desc:'Allow dispatcher-driver messaging',key:'driverChat',on:true},
  {id: 4, label:'Customer Portal Access',desc:'Let customers log in to track loads',key:'custPortal',on:false},
  {id: 5, label:'Expense Receipt AI',desc:'AI auto-scan and categorize expenses',key:'expAI',on:true},
  {id: 6, label:'White Label Mode',desc:'Hide Hero Logistics branding for clients',key:'whiteLabel',on:false},
  {id: 7, label:'Auto-Invoice on Delivery',desc:'Generate invoice when load is delivered',key:'autoInvoice',on:true},
  {id: 8, label:'SMS Notifications',desc:'Send automated SMS alerts to drivers',key:'smsAlerts',on:false},
];

const defaultBranches = [
  {id: 1, branch:'Chicago HQ Terminal',users:8,restrict:false, permType: 'Open'},
  {id: 2, branch:'Los Angeles Depot',users:4,restrict:true, permType: 'Restricted'},
  {id: 3, branch:'Dallas Terminal',users:3,restrict:false, permType: 'Open'}
];

const defaultGroups = [
  {id: 1, name:'Dispatch Team',desc:'Team for managing dispatch operations', branch:'All', members:4,perms:['Create Loads','Edit Routes','Driver Management']},
  {id: 2, name:'Finance Team',desc:'Accounts and billing access', branch:'All', members:2,perms:['View Financials','Export Reports','Invoice View']},
  {id: 3, name:'Ops Managers',desc:'General managers', branch:'All', members:3,perms:['Asset Register','Settings Access','Export Reports']}
];

const roles = ['dispatcher','driver','warehouse','accounts','yard','customer'];

export default function PermissionsPanel({ globalSearchQuery = '' }) {
  const { triggerToast } = useLogistics();

  // ----- State Management & Persistence -----
  const [savedState, setSavedState] = useState(() => {
    const m = localStorage.getItem('hero_perms_matrix') ? JSON.parse(localStorage.getItem('hero_perms_matrix')) : defaultMatrix;
    
    let t = {};
    const savedT = localStorage.getItem('hero_perms_toggles');
    if (savedT) {
      t = JSON.parse(savedT);
    } else {
      defaultMatrix.forEach(perm => {
        roles.forEach(role => {
          t[`${perm.key}_${role}`] = perm.def.includes(role);
        });
      });
    }

    const f = localStorage.getItem('hero_perms_features') ? JSON.parse(localStorage.getItem('hero_perms_features')) : defaultFeatures;
    const b = localStorage.getItem('hero_perms_branches') ? JSON.parse(localStorage.getItem('hero_perms_branches')) : defaultBranches;
    const g = localStorage.getItem('hero_perms_groups') ? JSON.parse(localStorage.getItem('hero_perms_groups')) : defaultGroups;

    return { matrix: m, userPermissions: t, features: f, branches: b, groups: g };
  });

  const [matrix, setMatrix] = useState(savedState.matrix);
  const [userPermissions, setUserPermissions] = useState(savedState.userPermissions);
  const [features, setFeatures] = useState(savedState.features);
  const [branches, setBranches] = useState(savedState.branches);
  const [groups, setGroups] = useState(savedState.groups);

  const isDirty = 
    JSON.stringify(matrix) !== JSON.stringify(savedState.matrix) ||
    JSON.stringify(userPermissions) !== JSON.stringify(savedState.userPermissions) ||
    JSON.stringify(features) !== JSON.stringify(savedState.features) ||
    JSON.stringify(branches) !== JSON.stringify(savedState.branches) ||
    JSON.stringify(groups) !== JSON.stringify(savedState.groups);

  // ----- Filters -----
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const searchLower = globalSearchQuery.toLowerCase();

  const filteredMatrix = matrix.filter(p => p.label.toLowerCase().includes(searchLower));
  const filteredFeatures = features.filter(f => f.label.toLowerCase().includes(searchLower) || f.desc.toLowerCase().includes(searchLower));
  const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(searchLower));

  // ----- Save All Changes & Reset -----
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSaveAll = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('hero_perms_matrix', JSON.stringify(matrix));
      localStorage.setItem('hero_perms_toggles', JSON.stringify(userPermissions));
      localStorage.setItem('hero_perms_features', JSON.stringify(features));
      localStorage.setItem('hero_perms_branches', JSON.stringify(branches));
      localStorage.setItem('hero_perms_groups', JSON.stringify(groups));
      
      setSavedState({
        matrix,
        userPermissions,
        features,
        branches,
        groups
      });
      setIsSaving(false);
      triggerToast('Permissions saved successfully for all roles.');
    }, 1000);
  };

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const handleResetDefaults = () => {
    setMatrix(defaultMatrix);
    const initial = {};
    defaultMatrix.forEach(perm => {
      roles.forEach(role => {
        initial[`${perm.key}_${role}`] = perm.def.includes(role);
      });
    });
    setUserPermissions(initial);
    setFeatures(defaultFeatures);
    setBranches(defaultBranches);
    setGroups(defaultGroups);
    setResetModalOpen(false);
    triggerToast('All permissions reset to default policy.');
  };

  // ----- Matrix Actions -----
  const togglePermission = (permKey, role, label) => {
    const key = `${permKey}_${role}`;
    const nextState = !userPermissions[key];
    setUserPermissions(prev => ({ ...prev, [key]: nextState }));
    triggerToast(`'${label}' for ${role}: ${nextState ? 'enabled' : 'disabled'}.`);
  };

  const [addPermModalOpen, setAddPermModalOpen] = useState(false);
  const [newPerm, setNewPerm] = useState({ name: '', key: '', defaultRoles: [] });
  
  const handleAddPermission = (e) => {
    e.preventDefault();
    if (!newPerm.name) return triggerToast('Permission name is required.', 'error');
    
    const key = newPerm.name.replace(/\s+/g, '').toLowerCase();
    const newPermObj = {
      id: Date.now(),
      label: newPerm.name,
      key: key,
      def: newPerm.defaultRoles
    };
    
    const nextPerms = { ...userPermissions };
    roles.forEach(r => {
      nextPerms[`${key}_${r}`] = newPerm.defaultRoles.includes(r);
    });
    
    setUserPermissions(nextPerms);
    setMatrix([...matrix, newPermObj]);
    setAddPermModalOpen(false);
    triggerToast(`Added new permission: ${newPerm.name}`);
    setNewPerm({ name: '', key: '', defaultRoles: [] });
  };

  const toggleRoleForNewPerm = (role) => {
    setNewPerm(prev => ({
      ...prev,
      defaultRoles: prev.defaultRoles.includes(role) 
        ? prev.defaultRoles.filter(r => r !== role) 
        : [...prev.defaultRoles, role]
    }));
  };

  // ----- Feature Toggles Actions -----
  const toggleFeature = (id, label) => {
    const feature = features.find(f => f.id === id);
    if (feature) {
      const nextState = !feature.on;
      setFeatures(prev => prev.map(f => f.id === id ? { ...f, on: nextState } : f));
      triggerToast(`Feature '${label}' ${nextState ? 'enabled' : 'disabled'}.`);
    }
  };

  // ----- Branch Permissions Actions -----
  const [branchPermModalOpen, setBranchPermModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  const openBranchPermEditor = (branch) => {
    setEditingBranch({ ...branch });
    setBranchPermModalOpen(true);
  };

  const saveBranchPerms = () => {
    setBranches(prev => prev.map(b => b.id === editingBranch.id ? {
      ...editingBranch, 
      restrict: editingBranch.permType !== 'Open'
    } : b));
    setBranchPermModalOpen(false);
    triggerToast(`Permissions updated for ${editingBranch.branch}`);
  };

  // ----- User Groups Actions -----
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [deleteGroupModalOpen, setDeleteGroupModalOpen] = useState(false);

  const openNewGroup = () => {
    setEditingGroup({ name: '', desc: '', branch: 'All', members: 0, perms: [] });
    setGroupModalOpen(true);
  };

  const openEditGroup = (group) => {
    setEditingGroup({ ...group });
    setGroupModalOpen(true);
  };

  const toggleGroupPerm = (permLabel) => {
    setEditingGroup(prev => ({
      ...prev,
      perms: prev.perms.includes(permLabel)
        ? prev.perms.filter(p => p !== permLabel)
        : [...prev.perms, permLabel]
    }));
  };

  const saveGroup = (e) => {
    e.preventDefault();
    if (!editingGroup.name) return triggerToast('Group name is required.', 'error');

    if (editingGroup.id) {
      setGroups(prev => prev.map(g => g.id === editingGroup.id ? editingGroup : g));
      triggerToast(`Group '${editingGroup.name}' updated.`);
    } else {
      setGroups([...groups, { ...editingGroup, id: Date.now() }]);
      triggerToast(`Group '${editingGroup.name}' created.`);
    }
    setGroupModalOpen(false);
  };

  const confirmDeleteGroup = (group) => {
    setEditingGroup(group);
    setDeleteGroupModalOpen(true);
  };

  const deleteGroup = () => {
    setGroups(prev => prev.filter(g => g.id !== editingGroup.id));
    setDeleteGroupModalOpen(false);
    triggerToast(`Group deleted.`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Unsaved changes warning banner */}
      {isDirty && (
        <div className="flex items-center justify-between p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-left animate-pulse">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="text-xs font-bold text-slate-900">Unsaved Policy Mutations Detected</p>
              <p className="text-[10px] text-slate-500 mt-0.5">You have toggled permissions or configuration parameters. Click "Save All Changes" below to write updates to database registry.</p>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={handleSaveAll} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-5">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Permission Matrix — Module-wise Access Control</h3>
            <p className="text-xs text-slate-500 mt-0.5">Control module access, feature toggles, and branch-specific permissions per role.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-40 mr-2">
              <SelectInput 
                value={selectedBranch}
                onChange={e => setSelectedBranch(e.target.value)}
                options={['All Branches', 'Chicago HQ Terminal', 'Los Angeles Depot', 'Dallas Terminal']}
              />
            </div>
            <Button size="sm" variant="outline" onClick={() => setAddPermModalOpen(true)}>+ Add Permissions</Button>
            <Button size="sm" variant="primary" onClick={handleSaveAll} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save All Changes'}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setResetModalOpen(true)}>Reset Defaults</Button>
          </div>
        </div>

        {/* Full Permission Matrix */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-44">Module / Feature</th>
                {roles.map(r => (
                  <th key={r} className="text-center py-3 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#23324C]/30">
              {filteredMatrix.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-sm">No permissions found matching search.</td>
                </tr>
              ) : filteredMatrix.map(perm => (
                <tr key={perm.key} className="hover:bg-slate-900/20 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-600 text-xs">{perm.label}</td>
                  {roles.map(role => {
                    const pk = `${perm.key}_${role}`;
                    const on = userPermissions[pk] || false;
                    return (
                      <td key={role} className="py-2.5 px-2 text-center">
                        <button type="button" onClick={() => togglePermission(perm.key, role, perm.label)}
                          className={`w-10 h-5 rounded-full transition-all relative cursor-pointer flex-shrink-0 ${on ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] border border-emerald-400' : 'bg-white border border-slate-700'}`}>
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? 'left-5.5' : 'left-0.5'}`}/>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900">Feature Toggles</h3>
        {filteredFeatures.length === 0 ? (
          <div className="text-center text-slate-500 py-4 text-xs">No features found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredFeatures.map(f => (
              <div key={f.id} className="flex items-center justify-between p-3 bg-white/50 border border-slate-200 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-slate-900">{f.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{f.desc}</p>
                </div>
                <button type="button" onClick={() => toggleFeature(f.id, f.label)} className={`w-10 h-5 rounded-full relative cursor-pointer flex-shrink-0 ml-3 transition-all ${f.on ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] border border-emerald-400' : 'bg-white border border-slate-700'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${f.on ? 'left-5.5' : 'left-0.5'}`}/>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Branch-wise Permissions + User Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900">Branch-wise Permissions</h3>
          <p className="text-[10px] text-slate-500">Restrict users to specific branches only.</p>
          <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide">
            {branches.map(b => (
              <div key={b.id} className="flex items-center justify-between p-3 bg-white/40 border border-slate-200 rounded-xl text-xs hover:border-slate-200 transition-colors">
                <div>
                  <p className="font-bold text-slate-900">{b.branch}</p>
                  <p className="text-slate-500">{b.users} users assigned</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    b.permType === 'Restricted' ? 'text-red-400 bg-red-500/10 border-red-500/20' : 
                    b.permType === 'Read Only' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 
                    b.permType === 'Custom' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : 
                    'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  }`}>
                    {b.permType}
                  </span>
                  <button type="button" onClick={() => openBranchPermEditor(b)} className="text-[10px] text-slate-500 hover:text-brand-400 transition-colors font-semibold">
                    Edit →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-slate-900">User Groups</h3>
            <Button size="sm" variant="outline" onClick={openNewGroup}>+ New Group</Button>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide">
            {filteredGroups.length === 0 ? (
              <div className="text-center text-slate-500 py-4 text-xs">No groups found.</div>
            ) : filteredGroups.map(g => (
              <div key={g.id} className="p-3 bg-white/40 border border-slate-200 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900 text-xs">{g.name}</p>
                    {g.desc && <p className="text-[10px] text-slate-500 line-clamp-1">{g.desc}</p>}
                  </div>
                  <span className="text-[10px] bg-white text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full font-bold">{g.members} members</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {g.perms.map((p, j) => (<span key={j} className="text-[9px] bg-brand-500/10 text-brand-400 border border-brand-500/20 px-1.5 py-0.5 rounded font-bold">{p}</span>))}
                </div>
                <div className="flex gap-4 pt-1 border-t border-slate-200">
                  <button type="button" onClick={() => openEditGroup(g)} className="text-[10px] text-slate-500 hover:text-brand-400 cursor-pointer transition-colors font-semibold">Edit Group</button>
                  <button type="button" onClick={() => confirmDeleteGroup(g)} className="text-[10px] text-slate-500 hover:text-red-400 cursor-pointer transition-colors font-semibold">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Modals --- */}
      
      {/* Reset Confirm Modal */}
      <Modal isOpen={resetModalOpen} onClose={() => setResetModalOpen(false)} title="Reset Permissions?">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Are you sure you want to reset all permissions, branches, features, and groups to their default templates? This action cannot be undone.</p>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" type="button" onClick={() => setResetModalOpen(false)}>Cancel</Button>
            <Button variant="danger" type="button" onClick={handleResetDefaults}>Yes, Reset All</Button>
          </div>
        </div>
      </Modal>

      {/* Add Permission Modal */}
      <Modal isOpen={addPermModalOpen} onClose={() => setAddPermModalOpen(false)} title="Add New Permission Module">
        <form onSubmit={handleAddPermission} className="space-y-4">
          <TextInput label="Permission Name *" placeholder="e.g. View Audit Logs" required value={newPerm.name} onChange={e => setNewPerm({...newPerm, name: e.target.value})} />
          
          <div>
            <label className="block text-slate-500 font-bold uppercase text-[9px] mb-2">Enable By Default For Roles</label>
            <div className="flex flex-wrap gap-2">
              {roles.map(r => {
                const isSelected = newPerm.defaultRoles.includes(r);
                return (
                  <button 
                    key={r} type="button" 
                    onClick={() => toggleRoleForNewPerm(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${isSelected ? 'bg-brand-500/20 text-brand-400 border-brand-500/30' : 'bg-white text-slate-500 border-slate-200'}`}
                  >
                    {r.toUpperCase()}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="secondary" type="button" onClick={() => setAddPermModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Add Module</Button>
          </div>
        </form>
      </Modal>

      {/* Branch Permission Editor */}
      {editingBranch && (
        <Modal isOpen={branchPermModalOpen} onClose={() => setBranchPermModalOpen(false)} title={`Branch Permissions: ${editingBranch.branch}`}>
          <div className="space-y-4">
            <SelectInput 
              label="Access Type" 
              value={editingBranch.permType} 
              onChange={e => setEditingBranch({...editingBranch, permType: e.target.value})} 
              options={[
                { value: 'Open', label: 'Open' },
                { value: 'Restricted', label: 'Restricted' },
                { value: 'Read Only', label: 'Read Only' },
                { value: 'Custom', label: 'Custom' }
              ]} 
            />
            {editingBranch.permType === 'Custom' && (
              <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-500">
                Custom rules configuration panel would appear here.
              </div>
            )}
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <Button variant="secondary" type="button" onClick={() => setBranchPermModalOpen(false)}>Cancel</Button>
              <Button variant="primary" type="button" onClick={saveBranchPerms}>Save Configuration</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* User Group Modal (Create / Edit) */}
      {editingGroup && (
        <Modal isOpen={groupModalOpen} onClose={() => setGroupModalOpen(false)} title={editingGroup.id ? "Edit User Group" : "Create User Group"}>
          <form onSubmit={saveGroup} className="space-y-4 max-h-[70vh] overflow-y-auto px-1 scrollbar-hide">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput label="Group Name *" required value={editingGroup.name} onChange={e => setEditingGroup({...editingGroup, name: e.target.value})} />
              <SelectInput label="Assigned Branch" value={editingGroup.branch} onChange={e => setEditingGroup({...editingGroup, branch: e.target.value})} options={[
                { value: 'All', label: 'All' },
                { value: 'Chicago HQ Terminal', label: 'Chicago HQ Terminal' },
                { value: 'Los Angeles Depot', label: 'Los Angeles Depot' },
                { value: 'Dallas Terminal', label: 'Dallas Terminal' }
              ]} />
            </div>
            <TextInput label="Description" value={editingGroup.desc} onChange={e => setEditingGroup({...editingGroup, desc: e.target.value})} />
            
            <div className="pt-2">
              <label className="block text-slate-500 font-bold uppercase text-[9px] mb-2">Group Permissions</label>
              <div className="flex flex-wrap gap-1.5 p-3 bg-white border border-slate-200 rounded-xl max-h-40 overflow-y-auto">
                {matrix.map(m => {
                  const isSelected = editingGroup.perms.includes(m.label);
                  return (
                    <button 
                      key={m.key} type="button" 
                      onClick={() => toggleGroupPerm(m.label)}
                      className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${isSelected ? 'bg-brand-500/20 text-brand-400 border-brand-500/30' : 'bg-white text-slate-500 border-slate-200'}`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 mt-4">
              <Button variant="secondary" type="button" onClick={() => setGroupModalOpen(false)}>Cancel</Button>
              <Button variant="primary" type="submit">Save Group</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Group Confirm */}
      {editingGroup && (
        <Modal isOpen={deleteGroupModalOpen} onClose={() => setDeleteGroupModalOpen(false)} title="Delete Group?">
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Are you sure you want to delete the group <strong>{editingGroup.name}</strong>? This action cannot be undone and {editingGroup.members} members will lose these specific roles.</p>
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <Button variant="secondary" type="button" onClick={() => setDeleteGroupModalOpen(false)}>Cancel</Button>
              <Button variant="danger" type="button" onClick={deleteGroup}>Delete Group</Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
