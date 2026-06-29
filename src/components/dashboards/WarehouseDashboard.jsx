import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchWarehouseData,
  addWarehouseInventory,
  updateWarehouseInventory,
  fetchInventoryMovements,
  fetchWarehouseAssets
} from '../../store/slices/warehouseSlice';
import Button from '../common/Button';
import TextInput from '../common/TextInput';
import SelectInput from '../common/SelectInput';
import SearchInput from '../common/SearchInput';
import StatCard from '../common/StatCard';
import EmptyState from '../common/EmptyState';
import Toast from '../common/Toast';
import Pagination from '../common/Pagination';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import Drawer from '../common/Drawer';
import { PieChartWidget } from '../common/DashboardCharts';
import { TableSkeleton } from '../common/Skeletons';
import {
  Plus, Check, Trash2, Edit2, QrCode, Move, CheckSquare,
  AlertTriangle, Activity, List, Download, MapPin, Printer, RefreshCw
} from 'lucide-react';

export default function WarehouseDashboard({ activeTab = 'overview' }) {
  const dispatch = useDispatch();
  const { occupancy, scansCount, crossDockCount, loading } = useSelector((state) => state.warehouse);

  // Logistics Niche View State
  const [logisticsMode, setLogisticsMode] = useState('car_carrying'); // car_carrying or general_freight

  // Toasts
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Modals & Drawers
  const [addLocationModalOpen, setAddLocationModalOpen] = useState(false);
  const [addHoldingAreaModalOpen, setAddHoldingAreaModalOpen] = useState(false);
  const [addLoadLaneModalOpen, setAddLoadLaneModalOpen] = useState(false);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const [manualEntryModalOpen, setManualEntryModalOpen] = useState(false);
  const [relocateModalOpen, setRelocateModalOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [movementDrawerOpen, setMovementDrawerOpen] = useState(false);

  // Map settings state
  const [locations, setLocations] = useState([
    { id: 'LOC-1', name: 'Bay 1', type: 'Bay', category: 'Car Yard' },
    { id: 'LOC-2', name: 'Bay 2', type: 'Bay', category: 'Car Yard' },
    { id: 'LOC-3', name: 'Bay 3', type: 'Bay', category: 'Car Yard' },
    { id: 'LOC-4', name: 'Holding Area A', type: 'Holding Area', category: 'Both' },
    { id: 'LOC-5', name: 'Holding Area B', type: 'Holding Area', category: 'Both' },
    { id: 'LOC-6', name: 'Lane A1', type: 'Load Lane', category: 'Both' },
    { id: 'LOC-7', name: 'Lane A2', type: 'Load Lane', category: 'Both' },
    { id: 'LOC-8', name: 'Lane C3', type: 'Load Lane', category: 'Both' },
    { id: 'LOC-9', name: 'Aisle 1 - Bin B', type: 'Aisle/Bin', category: 'Freight' },
    { id: 'LOC-10', name: 'Aisle 2 - Bin A', type: 'Aisle/Bin', category: 'Freight' },
    { id: 'LOC-11', name: 'Aisle 4 - Bin C', type: 'Aisle/Bin', category: 'Freight' }
  ]);

  // Asset Mock Database
  const [carStock, setCarStock] = useState([
    { id: 'CAR-1', vin: 'VIN-7YV1HP82A81920', rego: 'QLD-88A', stockNo: 'STK-4401', model: 'Toyota Hilux Double-Cab', location: 'Bay 3', lane: 'Lane A1', destination: 'Brisbane Port', customer: 'Toyota Australia', status: 'Stowed' },
    { id: 'CAR-2', vin: 'VIN-3YV1HP52X81254', rego: 'NSW-99B', stockNo: 'STK-4402', model: 'Mitsubishi Triton GLX', location: 'Holding Area B', lane: 'Lane A2', destination: 'Sydney Depot', customer: 'NSW Fleet Services', status: 'Assigned' },
    { id: 'CAR-3', vin: 'VIN-5YV1HP12Z83951', rego: 'VIC-44C', stockNo: 'STK-4403', model: 'Ford Ranger Wildtrak', location: 'Bay 1', lane: 'Unassigned', destination: 'Melbourne Yard', customer: 'Express Auto', status: 'Stowed' },
    { id: 'CAR-4', vin: 'VIN-8ZV9HK21W92110', rego: 'WA-55D', stockNo: 'STK-4404', model: 'Hyundai i30 Active', location: 'Holding Area A', lane: 'Lane C3', destination: 'Perth Hub', customer: 'Hertz Rental WA', status: 'Ready' }
  ]);

  const [freightStock, setFreightStock] = useState([
    { id: 'FR-1', itemNo: 'ITM-9011', palletCount: 15, weight: '14,200 lbs', dimensions: '1.2m x 1.2m x 1.5m', barcode: 'BAR-9011283', zone: 'Zone A (Dry)', aisleBin: 'Aisle 4 - Bin C', customer: 'Global Retail Corp', destination: 'Chicago HQ Terminal', status: 'Inwarded' },
    { id: 'FR-2', itemNo: 'ITM-4491', palletCount: 8, weight: '4,500 lbs', dimensions: '1.2m x 1.2m x 1.8m', barcode: 'BAR-4491028', zone: 'Zone B (Cold)', aisleBin: 'Aisle 2 - Bin A', customer: 'Vance Refrigeration', destination: 'Dallas Depot Terminal', status: 'Staged' },
    { id: 'FR-3', itemNo: 'ITM-1022', palletCount: 6, weight: '9,800 lbs', dimensions: '1.1m x 1.1m x 1.2m', barcode: 'BAR-1022384', zone: 'Zone C (Hazard)', aisleBin: 'Aisle 1 - Bin B', customer: 'Memphis Shippers Inc', destination: 'Sydney Port Terminal', status: 'Inwarded' }
  ]);

  // Selected items state
  const [selectedCarId, setSelectedCarId] = useState('CAR-1');
  const [selectedFreightId, setSelectedFreightId] = useState('FR-1');

  // Form states
  const [newLocName, setNewLocName] = useState('');
  const [newLocType, setNewLocType] = useState('Bay');

  // Manual Entry States
  const [manualVin, setManualVin] = useState('');
  const [manualRego, setManualRego] = useState('');
  const [manualStockNo, setManualStockNo] = useState('');
  const [manualModel, setManualModel] = useState('');
  const [manualLocation, setManualLocation] = useState('Bay 1');
  const [manualLane, setManualLane] = useState('Unassigned');
  const [manualDest, setManualDest] = useState('');
  const [manualCust, setManualCust] = useState('');

  const [manualItemNo, setManualItemNo] = useState('');
  const [manualPalletCount, setManualPalletCount] = useState(1);
  const [manualWeight, setManualWeight] = useState('');
  const [manualDim, setManualDim] = useState('');
  const [manualBarcode, setManualBarcode] = useState('');
  const [manualZone, setManualZone] = useState('Zone A (Dry)');
  const [manualBin, setManualBin] = useState('Aisle 1 - Bin B');

  // Relocation State
  const [relocationTarget, setRelocationTarget] = useState('Bay 1');

  // Scanner Simulator States
  const [scannerAction, setScannerAction] = useState('Scan In'); // Scan In, Scan Out, Barcode, QR
  const [scannerInput, setScannerInput] = useState('');

  // History Log States
  const [assetHistory, setAssetHistory] = useState([
    { id: 'H-1', itemId: 'CAR-1', action: 'Stowed to Bay 3', user: 'Adam K. (Yard Manager)', time: '06/26/2026 11:20 AM' },
    { id: 'H-2', itemId: 'CAR-1', action: 'Registered independent asset', user: 'System', time: '06/26/2026 09:15 AM' },
    { id: 'H-3', itemId: 'FR-1', action: 'Inwarded to Aisle 4 - Bin C', user: 'Sarah R. (Clerk)', time: '06/26/2026 10:45 AM' }
  ]);

  // Search filter state
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchWarehouseData());
    dispatch(fetchInventoryMovements());
    dispatch(fetchWarehouseAssets());
  }, [dispatch]);

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const getSelectedAsset = () => {
    if (logisticsMode === 'car_carrying') {
      return carStock.find(c => c.id === selectedCarId);
    } else {
      return freightStock.find(f => f.id === selectedFreightId);
    }
  };

  const handleAddLocationSubmit = (e) => {
    e.preventDefault();
    if (!newLocName) return;
    const newLoc = {
      id: `LOC-${Date.now().toString().slice(-4)}`,
      name: newLocName,
      type: newLocType,
      category: logisticsMode === 'car_carrying' ? 'Car Yard' : 'Freight'
    };
    setLocations([...locations, newLoc]);
    setNewLocName('');
    setAddLocationModalOpen(false);
    setAddHoldingAreaModalOpen(false);
    setAddLoadLaneModalOpen(false);
    triggerToast(`New location "${newLocName}" added to the map.`);
  };

  const handleManualEntrySubmit = (e) => {
    e.preventDefault();
    if (logisticsMode === 'car_carrying') {
      if (!manualVin || !manualModel) {
        triggerToast('VIN and Model are required.', 'error');
        return;
      }
      const newCar = {
        id: `CAR-${Date.now().toString().slice(-4)}`,
        vin: manualVin.toUpperCase(),
        rego: manualRego.toUpperCase() || 'N/A',
        stockNo: manualStockNo || `STK-${Date.now().toString().slice(-4)}`,
        model: manualModel,
        location: manualLocation,
        lane: manualLane,
        destination: manualDest || 'Pending',
        customer: manualCust || 'Independent Asset',
        status: 'Stowed'
      };
      setCarStock([newCar, ...carStock]);
      setSelectedCarId(newCar.id);

      // Log movement history
      const newLog = {
        id: `H-${Date.now()}`,
        itemId: newCar.id,
        action: `Registered independent vehicle & stowed to ${manualLocation}`,
        user: 'Adam K. (Yard Manager)',
        time: new Date().toLocaleString()
      };
      setAssetHistory([newLog, ...assetHistory]);

      triggerToast(`Vehicle ${manualModel} registered as independent asset.`);
    } else {
      if (!manualItemNo || !manualBarcode) {
        triggerToast('Item No and Barcode are required.', 'error');
        return;
      }
      const newFreight = {
        id: `FR-${Date.now().toString().slice(-4)}`,
        itemNo: manualItemNo.toUpperCase(),
        palletCount: parseInt(manualPalletCount) || 1,
        weight: manualWeight || '0 lbs',
        dimensions: manualDim || 'Standard',
        barcode: manualBarcode,
        zone: manualZone,
        aisleBin: manualBin,
        customer: manualCust || 'Independent Cargo',
        destination: manualDest || 'Pending',
        status: 'Inwarded'
      };
      setFreightStock([newFreight, ...freightStock]);
      setSelectedFreightId(newFreight.id);

      const newLog = {
        id: `H-${Date.now()}`,
        itemId: newFreight.id,
        action: `Inwarded general freight cargo to ${manualBin}`,
        user: 'Adam K. (Yard Manager)',
        time: new Date().toLocaleString()
      };
      setAssetHistory([newLog, ...assetHistory]);

      triggerToast(`Freight SKU ${manualItemNo} received as independent asset.`);
    }

    // Reset forms
    setManualVin(''); setManualRego(''); setManualStockNo(''); setManualModel(''); setManualDest(''); setManualCust('');
    setManualItemNo(''); setManualWeight(''); setManualDim(''); setManualBarcode('');
    setManualEntryModalOpen(false);
  };

  const handleMoveAsset = (e) => {
    e.preventDefault();
    const asset = getSelectedAsset();
    if (!asset) return;

    if (logisticsMode === 'car_carrying') {
      setCarStock(carStock.map(c => c.id === asset.id ? { ...c, location: relocationTarget } : c));
    } else {
      setFreightStock(freightStock.map(f => f.id === asset.id ? { ...f, aisleBin: relocationTarget } : f));
    }

    const newLog = {
      id: `H-${Date.now()}`,
      itemId: asset.id,
      action: `Moved asset location to ${relocationTarget}`,
      user: 'Adam K. (Yard Manager)',
      time: new Date().toLocaleString()
    };
    setAssetHistory([newLog, ...assetHistory]);

    setRelocateModalOpen(false);
    triggerToast(`Asset ${asset.id} relocated to ${relocationTarget}.`);
  };

  const handleDirectMoveToHolding = (item = null) => {
    const asset = item || getSelectedAsset();
    if (!asset) return;
    const targetHolding = logisticsMode === 'car_carrying' ? 'Holding Area A' : 'Zone A (Dry)';

    if (logisticsMode === 'car_carrying') {
      setCarStock(carStock.map(c => c.id === asset.id ? { ...c, location: targetHolding } : c));
    } else {
      setFreightStock(freightStock.map(f => f.id === asset.id ? { ...f, aisleBin: targetHolding } : f));
    }

    const newLog = {
      id: `H-${Date.now()}`,
      itemId: asset.id,
      action: `Moved to holding area: ${targetHolding}`,
      user: 'Adam K. (Yard Manager)',
      time: new Date().toLocaleString()
    };
    setAssetHistory([newLog, ...assetHistory]);
    triggerToast(`Asset moved to holding area: ${targetHolding}.`);
  };

  const handleDirectMoveToLane = (item = null) => {
    const asset = item || getSelectedAsset();
    if (!asset) return;
    const targetLane = 'Lane A1';

    if (logisticsMode === 'car_carrying') {
      setCarStock(carStock.map(c => c.id === asset.id ? { ...c, location: targetLane, lane: targetLane } : c));
    } else {
      setFreightStock(freightStock.map(f => f.id === asset.id ? { ...f, aisleBin: targetLane } : f));
    }

    const newLog = {
      id: `H-${Date.now()}`,
      itemId: asset.id,
      action: `Moved to load lane: ${targetLane}`,
      user: 'Adam K. (Yard Manager)',
      time: new Date().toLocaleString()
    };
    setAssetHistory([newLog, ...assetHistory]);
    triggerToast(`Asset spotted to load lane: ${targetLane}.`);
  };

  const handleAssignToLane = (item = null) => {
    const asset = item || getSelectedAsset();
    if (!asset) return;
    const targetLane = 'Lane C3';

    if (logisticsMode === 'car_carrying') {
      setCarStock(carStock.map(c => c.id === asset.id ? { ...c, lane: targetLane, status: 'Ready' } : c));
    } else {
      setFreightStock(freightStock.map(f => f.id === asset.id ? { ...f, status: 'Staged' } : f));
    }

    const newLog = {
      id: `H-${Date.now()}`,
      itemId: asset.id,
      action: `Assigned load lane routing: ${targetLane}`,
      user: 'Adam K. (Yard Manager)',
      time: new Date().toLocaleString()
    };
    setAssetHistory([newLog, ...assetHistory]);
    triggerToast(`Asset assigned to load lane ${targetLane} queue.`);
  };

  const handlePrintLabel = (reprint = false, item = null) => {
    const asset = item || getSelectedAsset();
    if (!asset) {
      triggerToast('No asset selected to print label for.', 'error');
      return;
    }
    const labelCode = asset.vin || asset.barcode || asset.id;
    triggerToast(`${reprint ? 'Reprinted' : 'Printed'} Zebra barcode tag: ${labelCode}`);
  };

  const handleReportMissing = (item = null) => {
    const asset = item || getSelectedAsset();
    if (!asset) return;

    if (logisticsMode === 'car_carrying') {
      setCarStock(carStock.map(c => c.id === asset.id ? { ...c, status: 'Missing' } : c));
    } else {
      setFreightStock(freightStock.map(f => f.id === asset.id ? { ...f, status: 'Missing' } : f));
    }

    const newLog = {
      id: `H-${Date.now()}`,
      itemId: asset.id,
      action: `FLAGGED MISSING`,
      user: 'Adam K. (Yard Manager)',
      time: new Date().toLocaleString()
    };
    setAssetHistory([newLog, ...assetHistory]);
    triggerToast(`Asset ${asset.id} reported missing! Incident ticket dispatched to supervisor.`, 'error');
  };

  const handleScannerSimulation = (e) => {
    e.preventDefault();
    if (!scannerInput) return;

    // Search matches
    let matchFound = false;
    if (logisticsMode === 'car_carrying') {
      const match = carStock.find(c => c.vin.toLowerCase() === scannerInput.toLowerCase() || c.rego.toLowerCase() === scannerInput.toLowerCase());
      if (match) {
        matchFound = true;
        setSelectedCarId(match.id);

        let newStatus = match.status;
        let newLoc = match.location;
        if (scannerAction === 'Scan In') {
          newStatus = 'Stowed';
          newLoc = 'Bay 1';
        } else if (scannerAction === 'Scan Out') {
          newStatus = 'Dispatched';
          newLoc = 'Gate Outbound';
        }

        setCarStock(carStock.map(c => c.id === match.id ? { ...c, status: newStatus, location: newLoc } : c));
        const newLog = {
          id: `H-${Date.now()}`,
          itemId: match.id,
          action: `${scannerAction} via scanner: ${newLoc} (${newStatus})`,
          user: 'Adam K. (Yard Manager)',
          time: new Date().toLocaleString()
        };
        setAssetHistory([newLog, ...assetHistory]);
      }
    } else {
      const match = freightStock.find(f => f.itemNo.toLowerCase() === scannerInput.toLowerCase() || f.barcode.toLowerCase() === scannerInput.toLowerCase());
      if (match) {
        matchFound = true;
        setSelectedFreightId(match.id);

        let newStatus = match.status;
        let newLoc = match.aisleBin;
        if (scannerAction === 'Scan In') {
          newStatus = 'Inwarded';
          newLoc = 'Aisle 1 - Bin B';
        } else if (scannerAction === 'Scan Out') {
          newStatus = 'Staged';
          newLoc = 'Lane A1';
        }

        setFreightStock(freightStock.map(f => f.id === match.id ? { ...f, status: newStatus, aisleBin: newLoc } : f));
        const newLog = {
          id: `H-${Date.now()}`,
          itemId: match.id,
          action: `${scannerAction} via scanner: ${newLoc} (${newStatus})`,
          user: 'Adam K. (Yard Manager)',
          time: new Date().toLocaleString()
        };
        setAssetHistory([newLog, ...assetHistory]);
      }
    }

    if (matchFound) {
      triggerToast(`Scanner action "${scannerAction}" completed for code: ${scannerInput.toUpperCase()}`);
    } else {
      triggerToast(`No registered asset resolved for barcode "${scannerInput}".`, 'error');
    }
    setScannerInput('');
    setScannerModalOpen(false);
  };

  const handleExportStock = () => {
    const list = logisticsMode === 'car_carrying' ? carStock : freightStock;
    const csvContent = "data:text/csv;charset=utf-8,"
      + (logisticsMode === 'car_carrying'
        ? "VIN,Rego,Stock Number,Model,Location,Lane,Status\n" + list.map(e => `"${e.vin}","${e.rego}","${e.stockNo}","${e.model}","${e.location}","${e.lane}","${e.status}"`).join("\n")
        : "Item No,Pallet Count,Weight,Dimensions,Barcode,Aisle/Bin,Status\n" + list.map(e => `"${e.itemNo}","${e.palletCount}","${e.weight}","${e.dimensions}","${e.barcode}","${e.aisleBin}","${e.status}"`).join("\n"));

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `warehouse_stock_${logisticsMode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Stock database CSV exported successfully.");
  };

  // Filter lists based on search
  const getFilteredList = () => {
    if (logisticsMode === 'car_carrying') {
      return carStock.filter(c =>
        c.vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.rego.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.stockNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.customer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      return freightStock.filter(f =>
        f.itemNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.aisleBin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.customer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  };

  const filteredAssets = getFilteredList();
  const selectedAsset = getSelectedAsset();

  const mockLabels = (logisticsMode === 'car_carrying' ? carStock : freightStock).map((item, index) => {
    const printStatusOptions = ['Printed', 'Pending', 'Failed', 'Reprinted'];
    const printStatus = printStatusOptions[index % printStatusOptions.length];
    return {
      labelId: `LBL-${(index + 100).toString()}`,
      barcode: item.barcode || item.vin,
      vinItem: item.vin || item.itemNo,
      stockNo: item.stockNo || item.palletCount,
      customer: item.customer,
      assetType: logisticsMode === 'car_carrying' ? 'Vehicle' : 'Freight',
      location: item.location || item.aisleBin,
      destination: item.destination,
      generatedDate: new Date().toLocaleDateString(),
      printedBy: 'System Auto',
      printStatus: printStatus,
      printerStatus: printStatus === 'Failed' ? 'Offline' : 'Online',
      originalItem: item
    };
  });

  const filteredLabels = mockLabels.filter(l => 
    l.vinItem.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(l.stockNo).toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.barcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
          <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
        </div>
      )}

      {/* Header with Switcher & Operations */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 capitalize">Warehouse & Yard Workspace</h2>
          <p className="text-xs text-slate-500 font-medium">Manage stock allocations, print asset tags, and spot load lanes.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Logistics Niche Toggle */}
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 text-xs font-bold">
            <button
              onClick={() => { setLogisticsMode('car_carrying'); }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${logisticsMode === 'car_carrying' ? 'bg-brand-500 text-slate-950 font-black' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Car Carrying Yard
            </button>
            <button
              onClick={() => { setLogisticsMode('general_freight'); }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${logisticsMode === 'general_freight' ? 'bg-brand-500 text-slate-950 font-black' : 'text-slate-500 hover:text-slate-700'}`}
            >
              General Freight
            </button>
          </div>

          <Button variant="outline" icon={QrCode} onClick={() => { setScannerAction('Barcode'); setScannerModalOpen(true); }}>
            Barcode Simulator
          </Button>
          <Button variant="outline" icon={Plus} onClick={() => setManualEntryModalOpen(true)}>
            Manual Entry
          </Button>
          <Button variant="primary" icon={Download} onClick={handleExportStock}>
            Export Stock List
          </Button>
        </div>
      </div>

      {/* Top statistics overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Stored Assets" value={logisticsMode === 'car_carrying' ? carStock.length : freightStock.length} description="In active yard segregation" trend="+3 new" trendDirection="up" />
            <StatCard title="Occupancy Level" value={occupancy} description="Segregation capacity" progress={78} />
            <StatCard title="Lanes Spotted" value="5 active" description="Loading bay limits" trend="Normal" trendDirection="neutral" />
            <StatCard title="Pending Dispatches" value={crossDockCount} description="Trailer staging queue" trend="3 ready" trendDirection="neutral" />
          </div>

          {/* Visual Storage capacity occupancy indicators */}
          <div className="glass rounded-2xl p-5 border border-slate-200 text-left grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900">Zone Allocations & Limits</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Lane A (Pickup)</span>
                  <strong className="text-emerald-400 text-lg font-black block mt-1">92%</strong>
                </div>
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Lane B (Staging)</span>
                  <strong className="text-emerald-400 text-lg font-black block mt-1">84%</strong>
                </div>
                <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Holding Areas</span>
                  <strong className="text-yellow-400 text-lg font-black block mt-1">45%</strong>
                </div>
                <div className="p-4 bg-brand-500/5 border border-brand-500/20 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Bunker storage</span>
                  <strong className="text-brand-400 text-lg font-black block mt-1">15%</strong>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Capacity Allocation</h4>
              <PieChartWidget
                data={[
                  { name: 'Lane A', value: 92 },
                  { name: 'Lane B', value: 84 },
                  { name: 'Holding', value: 45 },
                  { name: 'Bunker', value: 15 }
                ]}
                height={150}
              />
            </div>
          </div>
        </div>
      )}

      {/* Current Stock Tab */}
      {activeTab === 'stock' && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
             <StatCard title="Total Stock" value={logisticsMode === 'car_carrying' ? carStock.length : freightStock.length} description="Total units tracked" />
             <StatCard title="Available Stock" value={(logisticsMode === 'car_carrying' ? carStock : freightStock).filter(x => x.status === 'Ready' || x.status === 'Stowed' || x.status === 'Inwarded').length} description="Unassigned units" />
             <StatCard title="In Holding Area" value={(logisticsMode === 'car_carrying' ? carStock : freightStock).filter(x => x.location?.includes('Holding') || x.aisleBin?.includes('Holding') || x.aisleBin?.includes('Zone')).length} description="Units staged" />
             <StatCard title="Load Lanes" value={(logisticsMode === 'car_carrying' ? carStock : freightStock).filter(x => x.lane && x.lane !== 'Unassigned' || x.aisleBin?.includes('Lane')).length} description="Units queued" />
             <StatCard title="Ready to Dispatch" value={(logisticsMode === 'car_carrying' ? carStock : freightStock).filter(x => x.status === 'Ready' || x.status === 'Staged').length} description="Cleared to load" />
             <StatCard title="Missing Items" value={(logisticsMode === 'car_carrying' ? carStock : freightStock).filter(x => x.status === 'Missing').length} description="Flagged incidents" />
          </div>

          <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div>
                 <h3 className="text-sm font-extrabold text-slate-900">Current Stock Inventory</h3>
                 <p className="text-xs text-slate-450 mt-1">Comprehensive view of all independent assets and staging cargo.</p>
               </div>
               <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                 <SearchInput
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   onClear={() => setSearchQuery('')}
                   placeholder={logisticsMode === 'car_carrying' ? "Search VIN, Rego, Customer..." : "Search Item No, Customer..."}
                   className="w-full md:w-64"
                 />
                 <Button size="sm" variant="primary" icon={Download} onClick={handleExportStock}>
                   Export Stock List
                 </Button>
               </div>
             </div>

             <div className="overflow-x-auto w-full">
               <DataTable 
                 columns={logisticsMode === 'car_carrying' ? [
                   { key: 'id', label: 'VIN', render: (row) => <span className="font-mono text-slate-900 font-semibold">{row.vin}</span> },
                   { key: 'desc', label: 'Rego / Make', render: (row) => <span className="text-slate-600 text-[10px]">{row.rego} | {row.model}</span> },
                   { key: 'stockNo', label: 'Stock No', render: (row) => <span className="text-slate-500">{row.stockNo}</span> },
                   { key: 'customer', label: 'Customer', render: (row) => <span className="text-brand-300 font-bold">{row.customer}</span> },
                   { key: 'loc', label: 'Location / Bay', render: (row) => <span className="text-emerald-400 font-mono text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{row.location}</span> },
                   { key: 'lane', label: 'Load Lane', render: (row) => <span className="text-slate-500">{row.lane}</span> },
                   { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
                   { key: 'actions', label: 'Actions', render: (row) => (
                     <div className="flex gap-1.5 flex-wrap min-w-[280px]">
                       <Button size="sm" variant="secondary" onClick={() => {
                          setSelectedCarId(row.id);
                          triggerToast(`Viewing details for ${row.vin}`);
                       }}>View</Button>
                       <Button size="sm" variant="outline" onClick={() => {
                          setSelectedCarId(row.id);
                          setRelocateModalOpen(true);
                       }}>Move</Button>
                       <Button size="sm" variant="outline" onClick={() => handleDirectMoveToHolding(row)}>To Holding</Button>
                       <Button size="sm" variant="outline" onClick={() => handleAssignToLane(row)}>To Lane</Button>
                       <Button size="sm" variant="outline" onClick={() => {
                          setSelectedCarId(row.id);
                          setHistoryDrawerOpen(true);
                       }}>Hist</Button>
                       <Button size="sm" variant="outline" onClick={() => handlePrintLabel(false, row)}>Label</Button>
                       <Button size="sm" variant="outline" className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10" onClick={() => handleReportMissing(row)}>Missing</Button>
                     </div>
                   )}
                 ] : [
                   { key: 'id', label: 'Item Number', render: (row) => <span className="font-mono text-slate-900 font-semibold">{row.itemNo}</span> },
                   { key: 'barcode', label: 'Barcode', render: (row) => <span className="text-slate-600 font-mono text-xs">{row.barcode}</span> },
                   { key: 'palletCount', label: 'Pallet / Dim', render: (row) => <span className="text-slate-500 text-[10px]">{row.palletCount} Plts | {row.dimensions}</span> },
                   { key: 'customer', label: 'Customer', render: (row) => <span className="text-brand-300 font-bold">{row.customer}</span> },
                   { key: 'zone', label: 'Zone', render: (row) => <span className="text-slate-500">{row.zone}</span> },
                   { key: 'loc', label: 'Holding Area / Bin', render: (row) => <span className="text-emerald-400 font-mono text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{row.aisleBin}</span> },
                   { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
                   { key: 'actions', label: 'Actions', render: (row) => (
                     <div className="flex gap-1.5 flex-wrap min-w-[280px]">
                       <Button size="sm" variant="secondary" onClick={() => {
                          setSelectedFreightId(row.id);
                          triggerToast(`Viewing details for ${row.itemNo}`);
                       }}>View</Button>
                       <Button size="sm" variant="outline" onClick={() => {
                          setSelectedFreightId(row.id);
                          setRelocateModalOpen(true);
                       }}>Move</Button>
                       <Button size="sm" variant="outline" onClick={() => handleDirectMoveToHolding(row)}>To Holding</Button>
                       <Button size="sm" variant="outline" onClick={() => handleAssignToLane(row)}>To Lane</Button>
                       <Button size="sm" variant="outline" onClick={() => {
                          setSelectedFreightId(row.id);
                          setHistoryDrawerOpen(true);
                       }}>Hist</Button>
                       <Button size="sm" variant="outline" onClick={() => handlePrintLabel(false, row)}>Label</Button>
                       <Button size="sm" variant="outline" className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10" onClick={() => handleReportMissing(row)}>Missing</Button>
                     </div>
                   )}
                 ]}
                 data={filteredAssets}
               />
             </div>
          </div>
        </div>
      )}

      {/* Main Split Layout Workspace (for Yard map tab) */}
      {activeTab === 'yard-map' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

          {/* LEFT COLUMN: Stock list table (3/12) */}
          <div className="lg:col-span-4 glass rounded-2xl p-4 border border-slate-200 text-left space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Independent Assets</h3>
                <span className="text-[10px] bg-brand-500/10 text-brand-400 border border-brand-500/25 px-2 py-0.5 rounded-full font-bold">
                  {filteredAssets.length} Units
                </span>
              </div>
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                placeholder={logisticsMode === 'car_carrying' ? "Search VIN, Rego, Model..." : "Search Item No, Barcode..."}
                className="w-full"
              />

              <div className="space-y-2.5 overflow-y-auto max-h-[460px] pr-1">
                {filteredAssets.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs italic">
                    No matching assets in this mode.
                  </div>
                ) : (
                  filteredAssets.map((item) => {
                    const isSelected = logisticsMode === 'car_carrying' ? item.id === selectedCarId : item.id === selectedFreightId;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (logisticsMode === 'car_carrying') setSelectedCarId(item.id);
                          else setSelectedFreightId(item.id);
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer text-xs space-y-1.5 ${isSelected
                            ? 'bg-slate-50 border-brand-500 shadow-md shadow-brand-500/10'
                            : 'bg-white/40 border-slate-200 hover:border-slate-200/80'
                          }`}
                      >
                        <div className="flex justify-between items-center">
                          <strong className="text-slate-900 font-mono uppercase">
                            {logisticsMode === 'car_carrying' ? item.vin : item.itemNo}
                          </strong>
                          <StatusBadge status={item.status} />
                        </div>
                        <div className="flex justify-between text-slate-500 text-[10px]">
                          <span>{logisticsMode === 'car_carrying' ? item.model : `${item.palletCount} Pallets • ${item.weight}`}</span>
                          <span className="text-brand-400 font-bold font-mono">
                            {logisticsMode === 'car_carrying' ? item.location : item.aisleBin}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 text-center">
              <span className="text-[10px] text-slate-550 leading-relaxed block">
                * Assets exist independently of load bookings.
              </span>
            </div>
          </div>

          {/* CENTRE COLUMN: Yard / Warehouse Map (6/12) */}
          <div className="lg:col-span-5 glass rounded-2xl p-4 border border-slate-200 text-left flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Yard / Warehouse Allocation Map</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setAddLocationModalOpen(true); setNewLocType('Bay'); }}
                    className="text-[10px] font-black text-brand-400 hover:text-brand-500 hover:underline cursor-pointer"
                  >
                    + Add Location
                  </button>
                  <button
                    onClick={() => { setAddHoldingAreaModalOpen(true); setNewLocType('Holding Area'); }}
                    className="text-[10px] font-black text-brand-400 hover:text-brand-500 hover:underline cursor-pointer"
                  >
                    + Add Holding
                  </button>
                  <button
                    onClick={() => { setAddLoadLaneModalOpen(true); setNewLocType('Load Lane'); }}
                    className="text-[10px] font-black text-brand-400 hover:text-brand-500 hover:underline cursor-pointer"
                  >
                    + Add Load Lane
                  </button>
                </div>
              </div>

              {/* Grid map overlay */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 min-h-[380px] grid grid-cols-2 sm:grid-cols-3 gap-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#23324c_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

                {locations.filter(l =>
                  logisticsMode === 'car_carrying'
                    ? l.category === 'Car Yard' || l.category === 'Both'
                    : l.category === 'Freight' || l.category === 'Both'
                ).map(loc => {
                  const isItemHere = selectedAsset && (
                    logisticsMode === 'car_carrying'
                      ? selectedAsset.location === loc.name
                      : selectedAsset.aisleBin === loc.name
                  );

                  return (
                    <div
                      key={loc.id}
                      onClick={() => {
                        setRelocationTarget(loc.name);
                        triggerToast(`Target location set to ${loc.name}. Click 'Move Item' to execute.`);
                      }}
                      className={`p-3 rounded-xl border flex flex-col justify-between min-h-[90px] cursor-pointer transition-all ${isItemHere
                          ? 'bg-brand-500/10 border-brand-500 shadow-lg shadow-brand-500/10 animate-pulse'
                          : relocationTarget === loc.name
                            ? 'bg-white/60 border-slate-200/90 text-slate-900'
                            : 'bg-white/40 border-slate-200 hover:border-slate-800'
                        }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wide">{loc.type}</span>
                        {isItemHere && <MapPin className="h-3 w-3 text-brand-400" />}
                      </div>
                      <strong className="text-slate-900 text-xs block truncate">{loc.name}</strong>
                      <span className="text-[8px] text-slate-500 truncate">
                        {isItemHere
                          ? (logisticsMode === 'car_carrying' ? selectedAsset.model : selectedAsset.itemNo)
                          : 'Empty Spot'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex justify-between gap-3 text-xs">
              <Button size="sm" variant="secondary" icon={Move} onClick={() => setRelocateModalOpen(true)}>
                Move Item
              </Button>
              <Button size="sm" variant="outline" onClick={handleDirectMoveToHolding}>
                Move to Holding Area
              </Button>
              <Button size="sm" variant="outline" onClick={handleDirectMoveToLane}>
                Move to Load Lane
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN: Selected Item Details & Actions (3/12) */}
          <div className="lg:col-span-3 glass rounded-2xl p-4 border border-slate-200 text-left flex flex-col justify-between">
            {selectedAsset ? (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Active Stock Detail</span>
                    <h4 className="text-sm font-extrabold text-slate-900 font-mono mt-0.5">
                      {logisticsMode === 'car_carrying' ? selectedAsset.vin : selectedAsset.itemNo}
                    </h4>
                  </div>
                  <StatusBadge status={selectedAsset.status} />
                </div>

                <div className="space-y-3 text-xs">
                  {logisticsMode === 'car_carrying' ? (
                    <>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">Make / Model / Trim</span>
                        <strong className="text-slate-700 block mt-0.5">{selectedAsset.model}</strong>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-bold">Rego Plate</span>
                          <span className="text-slate-600 font-semibold font-mono">{selectedAsset.rego}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-bold">Stock Number</span>
                          <span className="text-slate-600 font-semibold font-mono">{selectedAsset.stockNo}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-bold">Yard Spot</span>
                          <span className="text-brand-400 font-bold font-mono">{selectedAsset.location}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-bold">Load Lane</span>
                          <span className="text-slate-600 font-semibold font-mono">{selectedAsset.lane}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">Pallet Count</span>
                        <strong className="text-slate-700 block mt-0.5">{selectedAsset.palletCount} Pallets</strong>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-bold">Weight</span>
                          <span className="text-slate-600 font-semibold font-mono">{selectedAsset.weight}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-bold">Dimensions</span>
                          <span className="text-slate-600 font-semibold font-mono">{selectedAsset.dimensions}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-bold">Aisle/Bin Location</span>
                          <span className="text-brand-400 font-bold font-mono">{selectedAsset.aisleBin}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9px] uppercase font-bold">Zone</span>
                          <span className="text-slate-600 font-semibold">{selectedAsset.zone}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">Barcode / QR</span>
                        <span className="text-slate-600 font-mono font-semibold">{selectedAsset.barcode}</span>
                      </div>
                    </>
                  )}

                  <div className="border-t border-slate-200 pt-2.5">
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Customer Account</span>
                    <span className="text-slate-600 font-semibold">{selectedAsset.customer}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Destination Delivery</span>
                    <span className="text-slate-600 font-semibold">{selectedAsset.destination}</span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-200 pt-3">
                  <Button size="sm" variant="secondary" className="w-full justify-start" icon={Move} onClick={handleAssignToLane}>
                    Assign to Load Lane
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handlePrintLabel(false)}
                      className="py-2 bg-slate-50 border border-slate-200 hover:bg-[#23324C] text-slate-600 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer text-[10px]"
                    >
                      <Printer className="h-3 w-3" /> Print Label
                    </button>
                    <button
                      onClick={() => handlePrintLabel(true)}
                      className="py-2 bg-slate-50 border border-slate-200 hover:bg-[#23324C] text-slate-600 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer text-[10px]"
                    >
                      <RefreshCw className="h-3 w-3" /> Reprint
                    </button>
                  </div>

                  <button
                    onClick={() => setHistoryDrawerOpen(true)}
                    className="w-full py-2 bg-white/40 hover:bg-white text-slate-600 rounded-xl font-bold text-center cursor-pointer text-[10px] block"
                  >
                    View Asset History
                  </button>

                  <button
                    onClick={handleReportMissing}
                    className="w-full py-2 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-400 rounded-xl font-bold text-center cursor-pointer text-[10px] block"
                  >
                    Report Missing Item
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500 text-xs italic">
                Select an asset to view details and execute movements.
              </div>
            )}

            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={() => setMovementDrawerOpen(true)}
                className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs rounded-xl font-black cursor-pointer transition-colors text-center block"
              >
                View Movement History
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Holding Areas Tab */}
      {activeTab === 'holding-areas' && (
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <div>
               <h3 className="text-sm font-extrabold text-slate-900">Holding Area Management</h3>
               <p className="text-xs text-slate-450 mt-1">Manage intermediate holding zones and assigned staging assets.</p>
             </div>
             <div className="flex gap-2">
               <Button size="sm" variant="outline" icon={Plus} onClick={() => { setAddHoldingAreaModalOpen(true); setNewLocType('Holding Area'); }}>Add Holding Area</Button>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Holding Zones Status</h4>
              <DataTable 
                columns={[
                  { key: 'name', label: 'Holding Area', render: (row) => <span className="font-bold text-slate-900">{row.name}</span> },
                  { key: 'capacity', label: 'Capacity', render: (row) => <span className="text-slate-600">{row.assetsCount} / 50</span> },
                  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.assetsCount >= 50 ? 'Full' : 'Available'} /> }
                ]}
                data={locations.filter(l => l.type === 'Holding Area').map(loc => {
                   const assetsInLoc = logisticsMode === 'car_carrying' 
                     ? carStock.filter(c => c.location === loc.name)
                     : freightStock.filter(f => f.aisleBin === loc.name);
                   return { ...loc, assetsCount: assetsInLoc.length };
                })}
              />
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Assets in Holding</h4>
              <DataTable 
                columns={[
                  { key: 'id', label: 'Asset Code', render: (row) => <span className="font-mono text-slate-900 font-semibold">{logisticsMode === 'car_carrying' ? row.vin : row.itemNo}</span> },
                  { key: 'loc', label: 'Holding Area', render: (row) => <span className="text-brand-400 font-mono">{logisticsMode === 'car_carrying' ? row.location : row.aisleBin}</span> },
                  { key: 'actions', label: 'Actions', render: (row) => (
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => {
                        if(logisticsMode === 'car_carrying') setSelectedCarId(row.id);
                        else setSelectedFreightId(row.id);
                        setRelocateModalOpen(true);
                      }}>Move Item</Button>
                      <Button size="sm" variant="outline" onClick={() => triggerToast(`Asset ${row.id} flagged for removal from holding.`)}>Remove Item</Button>
                    </div>
                  )}
                ]}
                data={(logisticsMode === 'car_carrying' ? carStock : freightStock).filter(asset => {
                  const loc = logisticsMode === 'car_carrying' ? asset.location : asset.aisleBin;
                  return locations.find(l => l.name === loc && l.type === 'Holding Area');
                })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Load Lanes Tab */}
      {activeTab === 'load-lanes' && (
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <div>
               <h3 className="text-sm font-extrabold text-slate-900">Load Lane Management</h3>
               <p className="text-xs text-slate-450 mt-1">Manage outbound dispatch loading queues and lane spotting.</p>
             </div>
             <div className="flex gap-2">
               <Button size="sm" variant="outline" icon={Plus} onClick={() => { setAddLoadLaneModalOpen(true); setNewLocType('Load Lane'); }}>Add Load Lane</Button>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Active Load Lanes</h4>
              <DataTable 
                columns={[
                  { key: 'name', label: 'Load Lane', render: (row) => <span className="font-bold text-slate-900">{row.name}</span> },
                  { key: 'assigned', label: 'Assigned Assets', render: (row) => <span className="text-brand-400 font-mono">{row.assetsCount} Units</span> },
                  { key: 'status', label: 'Lane Status', render: (row) => <StatusBadge status={row.assetsCount > 0 ? 'Loading' : 'Ready To Load'} /> }
                ]}
                data={locations.filter(l => l.type === 'Load Lane').map(loc => {
                   const assetsInLane = logisticsMode === 'car_carrying' 
                     ? carStock.filter(c => c.lane === loc.name || c.location === loc.name)
                     : freightStock.filter(f => f.aisleBin === loc.name);
                   return { ...loc, assetsCount: assetsInLane.length };
                })}
              />
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Queueing Assets</h4>
              <DataTable 
                columns={[
                  { key: 'id', label: 'Asset Code', render: (row) => <span className="font-mono text-slate-900 font-semibold">{logisticsMode === 'car_carrying' ? row.vin : row.itemNo}</span> },
                  { key: 'lane', label: 'Assigned Lane', render: (row) => <span className="text-brand-400 font-mono">{logisticsMode === 'car_carrying' ? (row.lane === 'Unassigned' ? row.location : row.lane) : row.aisleBin}</span> },
                  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
                  { key: 'actions', label: 'Actions', render: (row) => (
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleAssignToLane(row)}>Assign to Load Lane</Button>
                      <Button size="sm" variant="outline" onClick={() => triggerToast(`Asset ${row.id} removed from load lane.`)}>Remove from Load Lane</Button>
                    </div>
                  )}
                ]}
                data={(logisticsMode === 'car_carrying' ? carStock : freightStock).filter(asset => {
                  const loc = logisticsMode === 'car_carrying' ? (asset.lane === 'Unassigned' ? asset.location : asset.lane) : asset.aisleBin;
                  return locations.find(l => l.name === loc && l.type === 'Load Lane');
                })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Inbound Screen */}
      {activeTab === 'inbound' && (
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4 animate-fade-in">
          <h3 className="text-sm font-extrabold text-slate-900">Inbound Staging Queue</h3>
          <DataTable
            columns={[
              { key: 'id', label: 'Receipt ID', render: (row) => <span className="font-mono font-extrabold text-slate-900">{row.id}</span> },
              { key: 'carrier', label: 'Carrier Partner', render: (row) => <span className="text-slate-600 font-semibold">{row.carrier}</span> },
              { key: 'cargo', label: 'Inbound Cargo Specs', render: (row) => <span className="text-slate-500">{row.cargo}</span> },
              { key: 'lane', label: 'Spotted Lane', render: (row) => <span className="text-brand-400 font-bold font-mono">{row.lane}</span> },
              {
                key: 'actions', label: 'Staged Actions', render: (row) => (
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => { setScannerAction('Scan In'); setScannerModalOpen(true); }}>
                      Scan In
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handlePrintLabel(false, row)}>
                      Print Label
                    </Button>
                  </div>
                )
              }
            ]}
            data={[
              { id: 'INB-9022', carrier: 'Toll Express', cargo: '12 Pallets Retail Goods', lane: 'Lane A1' },
              { id: 'INB-9023', carrier: 'Apex Logistics', cargo: '3 Toyota Hilux vehicles', lane: 'Lane A2' }
            ]}
          />
        </div>
      )}

      {/* Outbound Screen */}
      {activeTab === 'outbound' && (
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4 animate-fade-in">
          <h3 className="text-sm font-extrabold text-slate-900">Outbound Loading Queue</h3>
          <DataTable
            columns={[
              { key: 'id', label: 'Outbound ID', render: (row) => <span className="font-mono font-extrabold text-slate-900">{row.id}</span> },
              { key: 'carrier', label: 'Transport Carrier', render: (row) => <span className="text-slate-600 font-semibold">{row.carrier}</span> },
              { key: 'cargo', label: 'Outbound Cargo Specs', render: (row) => <span className="text-slate-500">{row.cargo}</span> },
              { key: 'lane', label: 'Dock Gate Lane', render: (row) => <span className="text-brand-400 font-bold font-mono">{row.lane}</span> },
              {
                key: 'actions', label: 'Loading Actions', render: (row) => (
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => { setScannerAction('Scan Out'); setScannerModalOpen(true); }}>
                      Scan Out
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handlePrintLabel(true, row)}>
                      Reprint Label
                    </Button>
                  </div>
                )
              }
            ]}
            data={[
              { id: 'OUT-4011', carrier: 'K&N Hauliers', cargo: '8 Pallets Reefers', lane: 'Lane C3' }
            ]}
          />
        </div>
      )}

      {/* Scanning Terminal View */}
      {activeTab === 'scanning' && (
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-6 animate-fade-in">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Warehouse Scanning Terminal</h3>
            <p className="text-xs text-slate-450 mt-1">Scan physical barcodes, register stock tags, and log movements.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 bg-white/60 border border-slate-200 rounded-2xl space-y-4">
              <strong className="text-xs text-slate-700 block">Scan Action Simulator</strong>
              <TextInput label="Barcode Input Tag" placeholder="Enter barcode or QR code..." />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <Button variant="primary" size="sm" onClick={() => { setScannerAction('Scan In'); setScannerModalOpen(true); }}>
                  Scan In
                </Button>
                <Button variant="danger" size="sm" onClick={() => { setScannerAction('Scan Out'); setScannerModalOpen(true); }}>
                  Scan Out
                </Button>
                <Button variant="secondary" size="sm" onClick={() => { setScannerAction('Barcode'); setScannerModalOpen(true); }}>
                  Scan by Barcode
                </Button>
                <Button variant="secondary" size="sm" onClick={() => { setScannerAction('QR'); setScannerModalOpen(true); }}>
                  Scan by QR
                </Button>
                <Button variant="outline" size="sm" className="col-span-2 sm:col-span-1" onClick={() => setManualEntryModalOpen(true)}>
                  Manual Entry
                </Button>
              </div>
            </div>

            <div className="p-5 bg-white/40 border border-slate-200 rounded-2xl flex flex-col justify-between items-center text-center">
              <div className="text-left w-full">
                <strong className="text-xs text-slate-700 block">Device Status</strong>
                <span className="text-[10px] text-slate-555 block">Zebra Scanner handheld connected.</span>
              </div>
              <div className="my-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl">
                SCANNER ONLINE • READY TO SCAN
              </div>
              <div className="text-[9px] text-slate-555 leading-relaxed">
                * Scanning operations automatically update inventory locations and log movements history.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Labels Management View */}
      {activeTab === 'labels' && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
             <StatCard title="Total Labels" value={mockLabels.length} description="Generated tags" />
             <StatCard title="Printed Labels" value={mockLabels.filter(l => l.printStatus === 'Printed').length} description="Successfully spooled" />
             <StatCard title="Pending Labels" value={mockLabels.filter(l => l.printStatus === 'Pending').length} description="In print queue" />
             <StatCard title="Failed Labels" value={mockLabels.filter(l => l.printStatus === 'Failed').length} description="Printer errors" />
             <StatCard title="Reprinted Labels" value={mockLabels.filter(l => l.printStatus === 'Reprinted').length} description="Duplicate tags" />
          </div>

          <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div>
                 <h3 className="text-sm font-extrabold text-slate-900">Label Management</h3>
                 <p className="text-xs text-slate-450 mt-1">Manage and track generated asset barcode tags.</p>
               </div>
               <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                 <SearchInput
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   onClear={() => setSearchQuery('')}
                   placeholder="Search VIN, Item No, Barcode, Customer..."
                   className="w-full md:w-64"
                 />
                 <Button size="sm" variant="primary" icon={QrCode} onClick={() => triggerToast("All pending labels sent to printer spool.")}>
                   Print All Pending
                 </Button>
               </div>
             </div>

             <div className="overflow-x-auto w-full">
               <DataTable 
                 columns={[
                   { key: 'labelId', label: 'Label ID', render: (row) => <span className="font-mono text-slate-900 font-bold">{row.labelId}</span> },
                   { key: 'barcode', label: 'Barcode / QR', render: (row) => <span className="text-slate-600 font-mono text-xs">{row.barcode}</span> },
                   { key: 'vinItem', label: 'VIN / Item No', render: (row) => <span className="text-brand-300 font-semibold">{row.vinItem}</span> },
                   { key: 'stockNo', label: 'Stock No', render: (row) => <span className="text-slate-500">{row.stockNo}</span> },
                   { key: 'customer', label: 'Customer', render: (row) => <span className="text-slate-700">{row.customer}</span> },
                   { key: 'type', label: 'Asset Type', render: (row) => <span className="text-slate-500">{row.assetType}</span> },
                   { key: 'location', label: 'Location', render: (row) => <span className="text-emerald-400 font-mono text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{row.location}</span> },
                   { key: 'generated', label: 'Generated', render: (row) => <span className="text-slate-500 text-xs">{row.generatedDate}</span> },
                   { key: 'printStatus', label: 'Print Status', render: (row) => <StatusBadge status={row.printStatus} /> },
                   { key: 'actions', label: 'Actions', render: (row) => (
                     <div className="flex gap-1.5 flex-wrap min-w-[280px]">
                       <Button size="sm" variant="secondary" onClick={() => handlePrintLabel(false, row.originalItem)}>Print</Button>
                       <Button size="sm" variant="outline" onClick={() => handlePrintLabel(true, row.originalItem)}>Reprint</Button>
                       <Button size="sm" variant="outline" onClick={() => triggerToast(`Previewing label ${row.labelId}`)}>Preview</Button>
                       <Button size="sm" variant="outline" icon={Download} onClick={() => triggerToast(`Downloading PDF for ${row.labelId}`)}>PDF</Button>
                       <Button size="sm" variant="outline" onClick={() => triggerToast(`Viewing details for ${row.labelId}`)}>Details</Button>
                       <Button size="sm" variant="outline" onClick={() => setHistoryDrawerOpen(true)}>History</Button>
                     </div>
                   )}
                 ]}
                 data={filteredLabels}
               />
             </div>
          </div>
        </div>
      )}

      {/* Movements Log View */}
      {activeTab === 'movements' && (
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-4 animate-fade-in">
          <h3 className="text-sm font-extrabold text-slate-900">Inventory Movements & Custody Ledger</h3>
          <DataTable
            columns={[
              { key: 'id', label: 'ID', render: (row) => <span className="font-mono text-slate-900 font-bold">{row.id}</span> },
              { key: 'action', label: 'Activity Logged', render: (row) => <span className="text-slate-600 font-semibold">{row.action}</span> },
              { key: 'user', label: 'Staff member', render: (row) => <span className="text-slate-500">{row.user}</span> },
              { key: 'time', label: 'Timestamp', render: (row) => <span className="font-mono text-[10px] text-slate-500">{row.time}</span> }
            ]}
            data={assetHistory}
          />
        </div>
      )}

      {/* Reports View */}
      {activeTab === 'reports' && (
        <div className="glass rounded-2xl p-5 border border-slate-200 text-left space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Capacity & Staging Reports</h3>
              <p className="text-xs text-slate-450 mt-1">Export manifest registries, monitor occupancy thresholds, and evaluate warehouse productivity.</p>
            </div>
            <Button variant="primary" icon={Download} onClick={handleExportStock}>
              Export Stock List
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard title="Daily Outbound Dispatches" value="18 Trailers" description="Ready manifests completed" progress={82} />
            <StatCard title="Storage Utilization" value="78%" description="Total capacity allocated" progress={78} />
            <StatCard title="Fulfillment Accuracy" value="99.94%" description="Picker scan matching checks" progress={99} />
          </div>

          <div className="p-4 bg-white/40 border border-slate-200 rounded-xl space-y-2 text-xs">
            <strong className="text-slate-900 block font-bold">Monthly Stock Turnover Analytics Report</strong>
            <p className="text-slate-500">Total processed volume for June 2026: 4,890 pallets incoming, 4,620 outbound, net inventory stock growth: +270 units.</p>
          </div>
        </div>
      )}

      {/* Add Location Modal */}
      <Modal isOpen={addLocationModalOpen} onClose={() => setAddLocationModalOpen(false)} title={`Add New ${newLocType}`}>
        <form onSubmit={handleAddLocationSubmit} className="space-y-4">
          <TextInput
            label="Location Name"
            required
            placeholder={newLocType === 'Bay' ? "e.g. Bay 4" : newLocType === 'Holding Area' ? "e.g. Holding Area C" : "e.g. Lane A3"}
            value={newLocName}
            onChange={(e) => setNewLocName(e.target.value)}
          />
          <SelectInput
            label="Location classification"
            value={newLocType}
            onChange={(e) => setNewLocType(e.target.value)}
            options={[
              { value: 'Bay', label: 'Storage Bay / Aisle' },
              { value: 'Holding Area', label: 'Holding Area Zone' },
              { value: 'Load Lane', label: 'Load Lane Spot' }
            ]}
          />
          <Button type="submit" variant="primary" className="w-full">
            Save Location
          </Button>
        </form>
      </Modal>

      {/* Add Holding Area Modal */}
      <Modal isOpen={addHoldingAreaModalOpen} onClose={() => setAddHoldingAreaModalOpen(false)} title="Add Holding Area Zone">
        <form onSubmit={handleAddLocationSubmit} className="space-y-4">
          <TextInput
            label="Holding Zone Name"
            required
            placeholder="e.g. Holding Area C"
            value={newLocName}
            onChange={(e) => { setNewLocName(e.target.value); setNewLocType('Holding Area'); }}
          />
          <Button type="submit" variant="primary" className="w-full">
            Create Holding Area
          </Button>
        </form>
      </Modal>

      {/* Add Load Lane Modal */}
      <Modal isOpen={addLoadLaneModalOpen} onClose={() => setAddLoadLaneModalOpen(false)} title="Add Load Lane Spot">
        <form onSubmit={handleAddLocationSubmit} className="space-y-4">
          <TextInput
            label="Load Lane Name"
            required
            placeholder="e.g. Lane B1"
            value={newLocName}
            onChange={(e) => { setNewLocName(e.target.value); setNewLocType('Load Lane'); }}
          />
          <Button type="submit" variant="primary" className="w-full">
            Create Load Lane
          </Button>
        </form>
      </Modal>

      {/* Relocate Asset Modal */}
      <Modal isOpen={relocateModalOpen} onClose={() => setRelocateModalOpen(false)} title="Relocate Asset Location">
        <form onSubmit={handleMoveAsset} className="space-y-4">
          <SelectInput
            label="Select Target Location Spot"
            value={relocationTarget}
            onChange={(e) => setRelocationTarget(e.target.value)}
            options={locations.map(l => ({ value: l.name, label: `${l.name} (${l.type})` }))}
          />
          <Button type="submit" variant="primary" className="w-full">
            Confirm Location Move
          </Button>
        </form>
      </Modal>

      {/* Manual Entry Asset Modal */}
      <Modal isOpen={manualEntryModalOpen} onClose={() => setManualEntryModalOpen(false)} title="Manual Asset Ingestion">
        <form onSubmit={handleManualEntrySubmit} className="space-y-4 text-left">
          {logisticsMode === 'car_carrying' ? (
            <>
              <TextInput label="Vehicle VIN Number" required placeholder="e.g. 7YV1HP82A81920" value={manualVin} onChange={(e) => setManualVin(e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <TextInput label="Rego Plate Code" placeholder="e.g. QLD-88A" value={manualRego} onChange={(e) => setManualRego(e.target.value)} />
                <TextInput label="Stock Number" placeholder="e.g. STK-4401" value={manualStockNo} onChange={(e) => setManualStockNo(e.target.value)} />
              </div>
              <TextInput label="Vehicle Make / Model" required placeholder="e.g. Toyota Hilux Double-Cab" value={manualModel} onChange={(e) => setManualModel(e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <SelectInput label="Initial Yard Location" value={manualLocation} onChange={(e) => setManualLocation(e.target.value)} options={locations.filter(l => l.type === 'Bay').map(l => ({ value: l.name, label: l.name }))} />
                <SelectInput label="Outbound Load Lane" value={manualLane} onChange={(e) => setManualLane(e.target.value)} options={[{ value: 'Unassigned', label: 'Unassigned' }, ...locations.filter(l => l.type === 'Load Lane').map(l => ({ value: l.name, label: l.name }))]} />
              </div>
            </>
          ) : (
            <>
              <TextInput label="Cargo SKU / Item number" required placeholder="e.g. PLT-AUTO-19" value={manualItemNo} onChange={(e) => setManualItemNo(e.target.value)} />
              <div className="grid grid-cols-3 gap-3">
                <TextInput label="Pallet Count" type="number" required value={manualPalletCount} onChange={(e) => setManualPalletCount(e.target.value)} />
                <TextInput label="Total Weight" placeholder="e.g. 14,200 lbs" value={manualWeight} onChange={(e) => setManualWeight(e.target.value)} />
                <TextInput label="Dimensions" placeholder="e.g. 1.2m x 1.2m x 1.5m" value={manualDim} onChange={(e) => setManualDim(e.target.value)} />
              </div>
              <TextInput label="Barcode / QR Tag" required placeholder="e.g. BAR-9011283" value={manualBarcode} onChange={(e) => setManualBarcode(e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <SelectInput label="Warehouse Zone" value={manualZone} onChange={(e) => setManualZone(e.target.value)} options={[{ value: 'Zone A (Dry)', label: 'Zone A (Dry)' }, { value: 'Zone B (Cold)', label: 'Zone B (Cold)' }, { value: 'Zone C (Hazard)', label: 'Zone C (Hazard)' }]} />
                <SelectInput label="Aisle / Bin Spot" value={manualBin} onChange={(e) => setManualBin(e.target.value)} options={locations.filter(l => l.type === 'Aisle/Bin').map(l => ({ value: l.name, label: l.name }))} />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4 border-t border-slate-200/45 pt-3">
            <TextInput label="Billing Customer" placeholder="e.g. Toyota Australia" value={manualCust} onChange={(e) => setManualCust(e.target.value)} />
            <TextInput label="Destination Delivery" placeholder="e.g. Brisbane Port" value={manualDest} onChange={(e) => setManualDest(e.target.value)} />
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2">
            Ingest Asset (Independent of loads)
          </Button>
        </form>
      </Modal>

      {/* Barcode Simulator Modal */}
      <Modal isOpen={scannerModalOpen} onClose={() => setScannerModalOpen(false)} title="Barcode/QR Scanner Simulator">
        <form onSubmit={handleScannerSimulation} className="space-y-4">
          <SelectInput
            label="Scanner Mode Action"
            value={scannerAction}
            onChange={(e) => setScannerAction(e.target.value)}
            options={[
              { value: 'Scan In', label: 'Scan Inward Stowing' },
              { value: 'Scan Out', label: 'Scan Outward Dispatching' },
              { value: 'Barcode', label: 'Scan by 1D Barcode tag' },
              { value: 'QR', label: 'Scan by 2D QR Code tag' }
            ]}
          />
          <TextInput
            label="Scan Decoder Input"
            required
            placeholder={logisticsMode === 'car_carrying' ? "Scan Rego/VIN (e.g. QLD-88A or VIN-7YV1HP82A81920)" : "Scan Barcode (e.g. BAR-9011283)"}
            value={scannerInput}
            onChange={(e) => setScannerInput(e.target.value)}
          />
          <Button type="submit" variant="primary" className="w-full">
            Simulate Scan Decoder Trigger
          </Button>
        </form>
      </Modal>

      {/* History Drawer */}
      <Drawer isOpen={historyDrawerOpen} onClose={() => setHistoryDrawerOpen(false)} title="Asset Custody History Log">
        <div className="space-y-4 text-left text-xs">
          {selectedAsset && (
            <div className="border-b border-slate-200 pb-3">
              <strong className="text-slate-900 block text-sm font-mono">{logisticsMode === 'car_carrying' ? selectedAsset.vin : selectedAsset.itemNo}</strong>
              <span className="text-[10px] text-slate-500">Asset chain of custody log</span>
            </div>
          )}
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {assetHistory.filter(h => h.itemId === (selectedAsset?.id)).length === 0 ? (
              <p className="text-slate-500 italic py-4 text-center">No movement logs registered for this asset.</p>
            ) : (
              assetHistory.filter(h => h.itemId === (selectedAsset?.id)).map(h => (
                <div key={h.id} className="p-3 bg-white/40 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex justify-between font-bold text-[10px]">
                    <span className="text-brand-400">{h.action}</span>
                    <span className="text-slate-500 font-mono">{h.time}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Operated by: {h.user}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </Drawer>

      {/* Movement Ledger Drawer */}
      <Drawer isOpen={movementDrawerOpen} onClose={() => setMovementDrawerOpen(false)} title="Full Warehouse Movement Register">
        <div className="space-y-4 text-left text-xs">
          <DataTable
            columns={[
              { key: 'itemId', label: 'Asset Code', render: (row) => <span className="font-mono text-slate-900 font-semibold">{row.itemId}</span> },
              { key: 'action', label: 'Action Logged', render: (row) => <span className="text-slate-500">{row.action}</span> },
              { key: 'time', label: 'Timestamp', render: (row) => <span className="font-mono text-[9px] text-slate-500">{row.time}</span> }
            ]}
            data={assetHistory}
          />
        </div>
      </Drawer>
    </div>
  );
}
