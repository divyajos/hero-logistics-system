import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { markAsRead, markAsUnread, markAllAsRead, archiveNotification, restoreArchive, bulkAction } from '../../store/slices/notificationsSlice';
import { Bell, X, ShieldAlert, CheckCircle, Info, Clock, Archive, Filter, Check, RotateCcw, AlertTriangle } from 'lucide-react';
import SelectInput from './SelectInput';
import SearchInput from './SearchInput';

export default function NotificationCenter({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { notifications, categories, priorities, unreadCount } = useSelector((state) => state.notifications);

  // Filters State
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('Unread'); // All, Unread, Read, Archived

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  if (!isOpen) return null;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'High': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'Low': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      default: return 'text-slate-500 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getIcon = (category) => {
    switch (category) {
      case 'System': return <Info className="h-4.5 w-4.5 text-brand-400" />;
      case 'Load Updates': return <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />;
      case 'Warehouse': return <ShieldAlert className="h-4.5 w-4.5 text-orange-400" />;
      case 'Accounts': return <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />;
      case 'Driver': return <AlertTriangle className="h-4.5 w-4.5 text-yellow-400" />;
      default: return <Bell className="h-4.5 w-4.5 text-slate-500" />;
    }
  };

  const handleSelectAll = (e, currentList) => {
    if (e.target.checked) {
      setSelectedIds(currentList.map(n => n.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkAction = (actionType) => {
    if (selectedIds.length === 0) return;
    dispatch(bulkAction({ ids: selectedIds, actionType }));
    setSelectedIds([]);
  };

  // Filter Logic
  const filteredNotifications = notifications.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.message.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'All' || n.category === filterCategory;
    const matchPriority = filterPriority === 'All' || n.priority === filterPriority;
    
    let matchStatus = false;
    if (filterStatus === 'Archived') {
      matchStatus = n.archived === true;
    } else if (n.archived) {
      matchStatus = false; // Hide archived unless explicitly requested
    } else if (filterStatus === 'All') {
      matchStatus = true;
    } else if (filterStatus === 'Unread') {
      matchStatus = !n.read;
    } else if (filterStatus === 'Read') {
      matchStatus = n.read;
    }

    return matchSearch && matchCategory && matchPriority && matchStatus;
  });

  const getPriorityBorder = (priority) => {
    switch (priority) {
      case 'Critical': return 'border-l-red-500';
      case 'High': return 'border-l-orange-400';
      case 'Medium': return 'border-l-yellow-400';
      case 'Low': return 'border-l-emerald-400';
      default: return 'border-l-transparent';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-50/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      ></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        {/* Sliding Panel */}
        <div className="w-screen max-w-md bg-slate-50 border-l border-slate-200 shadow-2xl flex flex-col animate-slide-in-right relative">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-[#0f1624]/40 h-16 shrink-0">
            <div>
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-brand-400" />
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">Notification Center</h2>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">{unreadCount} unread system logs</p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-900 transition-all cursor-pointer">
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-200 space-y-3 bg-white shrink-0">
            <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="Search alerts..." />
            <div className="grid grid-cols-3 gap-2">
              <SelectInput value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} options={[
                { value: 'Unread', label: 'Unread' },
                { value: 'Read', label: 'Read' },
                { value: 'All', label: 'All Active' },
                { value: 'Archived', label: 'Archived' }
              ]} />
              <SelectInput value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} options={categories.map(c => ({ value: c, label: c }))} />
              <SelectInput value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} options={priorities.map(p => ({ value: p, label: p }))} />
            </div>

            {/* Bulk Actions Menu */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                <input type="checkbox" checked={selectedIds.length > 0 && selectedIds.length === filteredNotifications.length} onChange={(e) => handleSelectAll(e, filteredNotifications)} className="rounded bg-slate-50 border-slate-200 text-brand-500 focus:ring-brand-500 h-4 w-4" />
                <span>Select All</span>
              </label>
              <div className="flex space-x-2">
                <button onClick={() => dispatch(markAllAsRead())} className="text-[10px] text-brand-400 font-bold hover:text-brand-300 transition-colors uppercase tracking-wider cursor-pointer">Mark All Read</button>
                {selectedIds.length > 0 && (
                  <div className="flex items-center space-x-2 border-l border-slate-200 pl-2">
                    <button onClick={() => handleBulkAction('read')} className="text-[10px] text-slate-600 hover:text-slate-900 transition-colors" title="Mark Read"><Check className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleBulkAction('archive')} className="text-[10px] text-slate-600 hover:text-red-400 transition-colors" title="Archive"><Archive className="h-3.5 w-3.5" /></button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#23324C]/40 bg-slate-50/60">
            {filteredNotifications.length === 0 ? (
              <div className="p-10 text-center text-slate-500 font-medium space-y-2">
                <Bell className="h-10 w-10 mx-auto opacity-20" />
                <p>No notifications match criteria.</p>
              </div>
            ) : (
              filteredNotifications.map((n) => (
                <div key={n.id} className={`p-4 transition-colors flex items-start space-x-3 text-left border-l-2 ${getPriorityBorder(n.priority)} ${n.read ? 'opacity-70 bg-transparent' : 'bg-slate-50/40'}`}>
                  <input type="checkbox" checked={selectedIds.includes(n.id)} onChange={(e) => {
                    if (e.target.checked) setSelectedIds([...selectedIds, n.id]);
                    else setSelectedIds(selectedIds.filter(id => id !== n.id));
                  }} className="mt-1 rounded bg-slate-50 border-slate-200 text-brand-500 focus:ring-brand-500 h-4 w-4 cursor-pointer" />
                  
                  <div className="mt-0.5 relative shrink-0">
                    {getIcon(n.category)}
                    {!n.read && <span className="absolute -top-1 -right-1 h-2 w-2 bg-brand-500 rounded-full border border-[#161F30]"></span>}
                  </div>
                  
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h5 className={`text-xs truncate ${n.read ? 'font-semibold text-slate-600' : 'font-extrabold text-slate-900'}`}>{n.title}</h5>
                      <span className="text-[9px] text-slate-500 whitespace-nowrap flex items-center shrink-0">
                        <Clock className="h-3 w-3 mr-0.5" />
                        {n.date}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed pr-2">{n.message}</p>
                    
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex gap-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getPriorityColor(n.priority)}`}>{n.priority}</span>
                        <span className="text-[9px] font-semibold text-slate-500 bg-white/50 px-1.5 py-0.5 rounded border border-slate-700/50">{n.category}</span>
                      </div>
                      <div className="flex space-x-2">
                        {!n.archived ? (
                          <>
                            <button onClick={() => dispatch(n.read ? markAsUnread(n.id) : markAsRead(n.id))} className="text-[10px] text-brand-400 hover:text-brand-300 cursor-pointer">{n.read ? 'Mark Unread' : 'Mark Read'}</button>
                            <button onClick={() => dispatch(archiveNotification(n.id))} className="text-[10px] text-slate-500 hover:text-red-400 cursor-pointer">Archive</button>
                          </>
                        ) : (
                          <button onClick={() => dispatch(restoreArchive(n.id))} className="text-[10px] text-slate-500 hover:text-emerald-400 cursor-pointer flex items-center"><RotateCcw className="h-3 w-3 mr-1" /> Restore</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
