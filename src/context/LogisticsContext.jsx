import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const LogisticsContext = createContext();

export function LogisticsProvider({ children }) {
  // 1. Niche Configuration State
  const [selectedNiche, setSelectedNiche] = useState('car_carrying'); // 'car_carrying' | 'general_freight' | 'dangerous_goods'

  // 2. Start / Finish Work (Shift State)
  const [shiftState, setShiftState] = useState({
    isWorking: false,
    startTime: null,
    totalSeconds: 0,
    history: []
  });

  useEffect(() => {
    let interval;
    if (shiftState.isWorking) {
      interval = setInterval(() => {
        setShiftState(prev => ({
          ...prev,
          totalSeconds: prev.totalSeconds + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [shiftState.isWorking]);

  const startWork = (role) => {
    setShiftState(prev => ({
      ...prev,
      isWorking: true,
      startTime: new Date().toLocaleTimeString(),
      totalSeconds: 0
    }));
  };

  const finishWork = (role) => {
    const durationMin = Math.round(shiftState.totalSeconds / 60) || 1;
    const log = {
      date: new Date().toLocaleDateString(),
      startTime: shiftState.startTime,
      endTime: new Date().toLocaleTimeString(),
      durationMin,
      role
    };
    
    // Auto-log shift payout to ledgers (Wages expense)
    const wageAmount = (durationMin * 0.75).toFixed(2); // $45.00/hour
    apiClient.post('ledgers', {
      type: 'Wages',
      payee: `${role} Shift Pay`,
      amount: wageAmount,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      approvalNotes: `Auto-logged via shift completion. Duration: ${durationMin} mins.`
    }).catch(err => console.error('Failed to log shift wages', err));

    setShiftState(prev => ({
      ...prev,
      isWorking: false,
      startTime: null,
      history: [log, ...prev.history]
    }));
  };

  // 3. Permission-based toggles (Company Admin settings interface)
  const [permissions, setPermissions] = useState({
    driverCreateDraftLoad: true,
    dispatchAssignOnly: true, // Dispatcher can assign but NOT deliver
    accountsEditOperational: false // Accounts can approve invoice but NOT edit load operational details
  });

  const togglePermission = (key) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // 4. AI Confirmation workflows queue
  const [aiQueue, setAiQueue] = useState({
    loadInbox: [
      { id: 'ai-ld-1', type: 'Load Ingestion', source: 'Email PDF', data: { cargo: '12x Tesla Model Y', route: 'Fremont CA ➔ Las Vegas NV', customer: 'Tesla Inc', stops: ['Fremont Factory', 'Vegas Depot'], weight: '54,000 lbs' }, status: 'pending' },
      { id: 'ai-ld-2', type: 'Load Ingestion', source: 'Manifest scan', data: { cargo: 'Heavy Excavator (Dangerous Goods Class 9)', route: 'Houston TX ➔ Chicago IL', customer: 'CAT Machinery', stops: ['Houston Port', 'Chicago Depot'], weight: '92,000 lbs' }, status: 'pending' }
    ],
    odometer: [
      { id: 'ai-odo-1', type: 'Odometer Photo', source: 'Truck #TX-882', data: { image: '/assets/odo.jpg', detectedValue: '124,592 mi' }, status: 'pending' }
    ],
    receipts: [
      { id: 'ai-rcpt-1', type: 'Fuel Receipt', source: 'Pilot Travel Center', data: { image: '/assets/receipt.jpg', amount: '$420.50', gallons: '110.5 gal' }, status: 'pending' }
    ]
  });

  const resolveAiItem = (queueKey, id, status, updatedData) => {
    setAiQueue(prev => ({
      ...prev,
      [queueKey]: prev[queueKey].map(item => 
        item.id === id ? { ...item, status, data: updatedData || item.data } : item
      )
    }));
  };

  // 5. Inter-Company Transfers state
  const [transfers, setTransfers] = useState([]);

  useEffect(() => {
    apiClient.get('transfers')
      .then(res => {
        setTransfers(res.data || []);
      })
      .catch(err => console.error('Failed to fetch transfers', err));
  }, []);

  const initiateTransfer = async (type, target, fromCompany, toCompany) => {
    const newTx = {
      id: `tx-${Date.now()}`,
      type,
      target,
      fromCompany,
      toCompany,
      status: 'pending',
      custodyChain: [
        { party: `${fromCompany} Operator`, action: 'Initiated Transfer', timestamp: new Date().toLocaleString() }
      ]
    };
    try {
      const res = await apiClient.post('transfers', newTx);
      setTransfers(prev => [res.data, ...prev]);
    } catch (err) {
      console.error('Failed to initiate transfer', err);
    }
  };

  const acceptTransfer = async (id, receiverName) => {
    const targetTx = transfers.find(t => t.id === id);
    if (!targetTx) return;
    const updatedTx = {
      ...targetTx,
      status: 'accepted',
      custodyChain: [
        ...targetTx.custodyChain,
        { party: receiverName, action: 'Accepted Custody', timestamp: new Date().toLocaleString() }
      ]
    };
    try {
      const res = await apiClient.put(`transfers/${id}`, updatedTx);
      setTransfers(prev => prev.map(t => t.id === id ? res.data : t));
    } catch (err) {
      console.error('Failed to accept transfer', err);
    }
  };

  const rejectTransfer = async (id, receiverName) => {
    const targetTx = transfers.find(t => t.id === id);
    if (!targetTx) return;
    const updatedTx = {
      ...targetTx,
      status: 'rejected',
      custodyChain: [
        ...targetTx.custodyChain,
        { party: receiverName, action: 'Rejected Transfer', timestamp: new Date().toLocaleString() }
      ]
    };
    try {
      const res = await apiClient.put(`transfers/${id}`, updatedTx);
      setTransfers(prev => prev.map(t => t.id === id ? res.data : t));
    } catch (err) {
      console.error('Failed to reject transfer', err);
    }
  };

  return (
    <LogisticsContext.Provider value={{
      selectedNiche,
      setSelectedNiche,
      shiftState,
      startWork,
      finishWork,
      permissions,
      togglePermission,
      aiQueue,
      resolveAiItem,
      transfers,
      initiateTransfer,
      acceptTransfer,
      rejectTransfer
    }}>
      {children}
    </LogisticsContext.Provider>
  );
}

export function useLogistics() {
  const context = useContext(LogisticsContext);
  if (!context) {
    throw new Error('useLogistics must be used within a LogisticsProvider');
  }
  return context;
}
