import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchWarehouseData, 
  addWarehouseInventory, 
  updateWarehouseInventory, 
  fetchInventoryMovements, 
  fetchWarehouseAssets 
} from '../../store/slices/warehouseSlice';
import { useLogistics } from '../../context/LogisticsContext';
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
import { KpiGridSkeleton, TableSkeleton } from '../common/Skeletons';
import { 
  Layers, MapPin, Database, Award, Plus, Check, Trash2, Edit2, 
  QrCode, Camera, RefreshCw, Move, CheckSquare, Shield, Activity, List
} from 'lucide-react';

export default function WarehouseDashboard({ activeTab = 'overview' }) {
  const dispatch = useDispatch();
  const { inventory, occupancy, scansCount, crossDockCount, movements, assets, loading } = useSelector((state) => state.warehouse);
  const { selectedNiche } = useLogistics();

  // Modals & Drawers
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);

  // Car Carrying specific states
  const [localCars, setLocalCars] = useState([
    { sku: 'VIN-7YV1HP82A81920', desc: 'Toyota Hilux double-cab', qty: 'Plate: QLD-88A', bay: 'Lane 1', status: 'Unassigned' },
    { sku: 'VIN-3YV1HP52X81254', desc: 'Mitsubishi Triton GLX', qty: 'Plate: NSW-99B', bay: 'Lane 2', status: 'Unassigned' },
    { sku: 'VIN-5YV1HP12Z83951', desc: 'Ford Ranger Wildtrak', qty: 'Plate: VIC-44C', bay: 'Lane 3', status: 'Unassigned' }
  ]);
  const [carModalOpen, setCarModalOpen] = useState(false);
  const [newCarVin, setNewCarVin] = useState('');
  const [newCarModel, setNewCarModel] = useState('');
  const [newCarRego, setNewCarRego] = useState('');
  const [newCarLane, setNewCarLane] = useState('Lane 1');
  const [selectedCarForLane, setSelectedCarForLane] = useState(null);
  const [laneAssignModalOpen, setLaneAssignModalOpen] = useState(false);
  const [targetOutboundLane, setTargetOutboundLane] = useState('Lane A1');

  // Sub-tabs State
  const [stockSubTab, setStockSubTab] = useState('inventory'); // inventory, bins, movements
  const [yardSubTab, setYardSubTab] = useState('yard'); // yard, assets

  // Form Fields
  const [skuCode, setSkuCode] = useState('');
  const [skuQty, setSkuQty] = useState('');
  const [skuBay, setSkuBay] = useState('Bay A');
  const [selectedStock, setSelectedStock] = useState(null);
  const [relocationBay, setRelocationBay] = useState('Bay A');

  // Scanner Simulator State
  const [scanSkuInput, setScanSkuInput] = useState('');
  const [scannedResults, setScannedResults] = useState(null);

  // Inbound & Outbound Queues State
  const [inboundQueue, setInboundQueue] = useState([
    { id: 'INB-102', carrier: 'Falcon Logistics', cargo: 'Electric Engine parts', lane: 'Lane 2', status: 'Awaiting Offload' },
    { id: 'INB-103', carrier: 'Swift Cargo Express', cargo: 'Retail Groceries', lane: 'Lane 5', status: 'Unloading' }
  ]);

  const [outboundQueue, setOutboundQueue] = useState([
    { id: 'OUT-401', carrier: 'Apex Carrier', cargo: 'Automotive Pallets', lane: 'Lane A1', status: 'Ready for Loading' },
    { id: 'OUT-402', carrier: 'Global Freight', cargo: 'Bulk Reels Cotton', lane: 'Lane C3', status: 'Scheduled' }
  ]);

  // Yard lane allocation spots
  const [lanes, setLanes] = useState([
    { id: 'Lane-1', description: 'Inbound Unloading Dock', spotCapacity: '1 Trailer limit', activeTrailer: 'TR-9410' },
    { id: 'Lane-2', description: 'Holding Yard area', spotCapacity: '4 Trailers limit', activeTrailer: 'TR-1102' },
    { id: 'Lane-3', description: 'Cross-Dock Gate 4', spotCapacity: '1 Trailer limit', activeTrailer: 'TR-4809' }
  ]);

  // Warehouse Transfers state
  const [warehouseTransfers, setWarehouseTransfers] = useState([
    { id: 'TRF-901', from: 'Chicago HQ Terminal', to: 'Dallas Depot Terminal', item: 'Dry Pallets (PLT-AUTO-19)', qty: 15, status: 'Transit' },
    { id: 'TRF-902', from: 'Sydney Port Terminal', to: 'Melbourne Yard Depot', item: 'HAZMAT Drums (UN-3480)', qty: 8, status: 'Awaiting Dispatch' }
  ]);
  const [newTrfFrom, setNewTrfFrom] = useState('Chicago HQ Terminal');
  const [newTrfTo, setNewTrfTo] = useState('Dallas Depot Terminal');
  const [newTrfSku, setNewTrfSku] = useState('');
  const [newTrfQty, setNewTrfQty] = useState('');

  // Relocate Form
  const [relocateLaneId, setRelocateLaneId] = useState('');
  const [relocateTargetTrailer, setRelocateTargetTrailer] = useState('');

  // Search & Filters
  const [search, setSearch] = useState('');
  const [filterBay, setFilterBay] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  useEffect(() => {
    dispatch(fetchWarehouseData());
    dispatch(fetchInventoryMovements());
    dispatch(fetchWarehouseAssets());
  }, [dispatch]);

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // Receive Pallet Submit
  const handleReceivePallet = (e) => {
    e.preventDefault();
    if (!skuCode || !skuQty) {
      triggerToast('Complete SKU and Quantity.', 'error');
      return;
    }
    dispatch(addWarehouseInventory({
      sku: skuCode,
      qty: skuQty,
      bay: skuBay
    }));

    setSkuCode('');
    setSkuQty('');
    setReceiveModalOpen(false);
    triggerToast(`Pallet stock SKU ${skuCode} received & cataloged.`);
  };

  // Scanner Simulator trigger
  const handleSimulateScan = (e) => {
    e.preventDefault();
    if (!scanSkuInput) return;
    const matched = inventory.find(i => i.sku.toLowerCase() === scanSkuInput.toLowerCase());
    if (matched) {
      setScannedResults(matched);
      triggerToast('Barcode decoded. Stock record resolved.');
    } else {
      setScannedResults({
        sku: scanSkuInput.toUpperCase(),
        desc: 'New unregistered cargo SKU',
        qty: '0 Pallets',
        bay: 'Unassigned',
        status: 'Pending Verification'
      });
      triggerToast('SKU not resolved. Registering new catalog code.', 'warning');
    }
  };

  // Add new car to stock handler
  const handleAddCar = (e) => {
    e.preventDefault();
    if (!newCarVin || !newCarModel || !newCarRego) {
      triggerToast('All car fields are required.', 'error');
      return;
    }
    const carObj = {
      sku: `VIN-${newCarVin.toUpperCase()}`,
      desc: newCarModel,
      qty: `Plate: ${newCarRego.toUpperCase()}`,
      bay: newCarLane,
      status: 'Unassigned'
    };
    setLocalCars([carObj, ...localCars]);
    triggerToast(`Car ${newCarModel} added to warehouse inventory in ${newCarLane}!`);
    setNewCarVin('');
    setNewCarModel('');
    setNewCarRego('');
    setCarModalOpen(false);
  };

  // Assign lane to picked car handler
  const handleAssignCarLane = (e) => {
    e.preventDefault();
    if (!selectedCarForLane) return;
    setLocalCars(localCars.map(c => c.sku === selectedCarForLane.sku ? { ...c, bay: targetOutboundLane, status: 'Allocated' } : c));
    triggerToast(`Car ${selectedCarForLane.desc} assigned to Outbound Lane ${targetOutboundLane}!`);
    setLaneAssignModalOpen(false);
    setSelectedCarForLane(null);
  };

  // Inbound offload complete
  const handleCompleteOffload = (id) => {
    const target = inboundQueue.find(q => q.id === id);
    if (target) {
      setInboundQueue(inboundQueue.filter(q => q.id !== id));
      // Add to inventory
      dispatch(addWarehouseInventory({
        sku: `PLT-${target.id}`,
        qty: '12',
        bay: 'Bay A'
      }));
      triggerToast(`Offload completed. Pallets received into general stock.`);
    }
  };

  // Outbound load complete
  const handleCompleteLoad = (id) => {
    setOutboundQueue(outboundQueue.filter(q => q.id !== id));
    triggerToast(`Outbound load completed. Trailer departed terminal.`);
  };

  // Lane Relocation
  const handleRelocateTrailer = (e) => {
    e.preventDefault();
    if (!relocateLaneId || !relocateTargetTrailer) return;
    setLanes(lanes.map(l => l.id === relocateLaneId ? { ...l, activeTrailer: relocateTargetTrailer } : l));
    triggerToast(`Trailer ${relocateTargetTrailer} spotted to ${relocateLaneId}.`);
    setRelocateTargetTrailer('');
  };

  // Filters & Page logic
  const filteredInventory = selectedNiche === 'car_carrying'
    ? localCars.filter((item) => {
        const matchesSearch = item.sku.toLowerCase().includes(search.toLowerCase()) || 
                              item.desc.toLowerCase().includes(search.toLowerCase()) ||
                              item.qty.toLowerCase().includes(search.toLowerCase());
        const matchesBay = filterBay === '' || item.bay === filterBay;
        return matchesSearch && matchesBay;
      })
    : inventory.filter((item) => {
        const matchesSearch = item.sku.toLowerCase().includes(search.toLowerCase()) || 
                              item.desc.toLowerCase().includes(search.toLowerCase());
        const matchesBay = filterBay === '' || item.bay === filterBay;
        return matchesSearch && matchesBay;
      });

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      
      {/* Toast Notifications */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
          <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
        </div>
      )}

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#23324C]/60 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white capitalize">Warehouse • {activeTab.replace('-', ' ')}</h2>
          <p className="text-xs text-slate-400 font-medium">Receive pallets, inspect storage bay lanes, and scan incoming stock tags.</p>
        </div>

        {activeTab === 'stock' && (
          selectedNiche === 'car_carrying' ? (
            <Button variant="primary" icon={Plus} onClick={() => setCarModalOpen(true)}>
              Add New Car to Stock
            </Button>
          ) : (
            <Button variant="primary" icon={Plus} onClick={() => setReceiveModalOpen(true)}>
              Receive Pallet Stock
            </Button>
          )
        )}
      </div>

      {loading && inventory.length === 0 ? (
        <TableSkeleton rows={4} cols={5} />
      ) : (
        <>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Pallets Stored" value={inventory.length} description="In active warehouse zones" trend="+12 stock" trendDirection="up" />
                <StatCard title="Occupancy Level" value={occupancy} description="Bay limits capacity" progress={78} />
                <StatCard title="Barcodes Verified" value={scansCount} description="Scanned items today" trend="+18.4%" trendDirection="up" />
                <StatCard title="Pending Cross-Dock" value={crossDockCount} description="Trucks awaiting offload" trend="3 active" trendDirection="neutral" />
              </div>

              {/* Visual Storage Bay occupancy indicator */}
              <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-sm font-extrabold text-white">Bay Area Occupancy Thresholds</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-center">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Bay A (Dry)</span>
                      <strong className="text-emerald-400 text-lg font-black block mt-1">94%</strong>
                    </div>
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-center">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Bay B (Cold)</span>
                      <strong className="text-emerald-400 text-lg font-black block mt-1">82%</strong>
                    </div>
                    <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl text-center">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Bay C (Hazard)</span>
                      <strong className="text-yellow-400 text-lg font-black block mt-1">42%</strong>
                    </div>
                    <div className="p-4 bg-brand-500/5 border border-brand-500/20 rounded-xl text-center">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Bay D (Overflow)</span>
                      <strong className="text-brand-400 text-lg font-black block mt-1">12%</strong>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Capacity Allocation</h4>
                  <PieChartWidget 
                    data={[
                      { name: 'Bay A (Dry)', value: 94 },
                      { name: 'Bay B (Cold)', value: 82 },
                      { name: 'Bay C (Hazard)', value: 42 },
                      { name: 'Bay D (Overflow)', value: 12 }
                    ]} 
                    height={150} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Inbound Screen */}
          {activeTab === 'inbound' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <h3 className="text-sm font-extrabold text-white">Inbound Receiving Queue</h3>
              
              <DataTable columns={[
                { key: 'id', label: 'Receipt ID', render: (row) => <span className="font-mono font-extrabold text-white">{row.id}</span> },
                { key: 'carrier', label: 'Carrier', render: (row) => <span className="text-slate-300 font-semibold">{row.carrier}</span> },
                { key: 'cargo', label: 'Expected Cargo', render: (row) => <span className="text-slate-400">{row.cargo}</span> },
                { key: 'lane', label: 'Offload Lane Spot', render: (row) => <span className="text-brand-400 font-bold font-mono">{row.lane}</span> },
                { key: 'status', label: 'State', render: (row) => <span className="text-xs text-yellow-400">{row.status}</span> },
                { key: 'actions', label: 'Offload Actions', render: (row) => (
                  <Button size="sm" variant="secondary" icon={CheckSquare} onClick={() => handleCompleteOffload(row.id)}>
                    Log Offloaded
                  </Button>
                )}
              ]} data={inboundQueue} />
            </div>
          )}

          {/* Outbound Screen */}
          {activeTab === 'outbound' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <h3 className="text-sm font-extrabold text-white">Outbound Loading Queue</h3>

              <DataTable columns={[
                { key: 'id', label: 'Outbound ID', render: (row) => <span className="font-mono font-extrabold text-white">{row.id}</span> },
                { key: 'carrier', label: 'Carrier', render: (row) => <span className="text-slate-300 font-semibold">{row.carrier}</span> },
                { key: 'cargo', label: 'Expected Cargo', render: (row) => <span className="text-slate-400">{row.cargo}</span> },
                { key: 'lane', label: 'Dock Gate Lane', render: (row) => <span className="text-brand-400 font-bold font-mono">{row.lane}</span> },
                { key: 'status', label: 'State', render: (row) => <span className="text-xs text-brand-400">{row.status}</span> },
                { key: 'actions', label: 'Loading Actions', render: (row) => (
                  <Button size="sm" variant="secondary" onClick={() => handleCompleteLoad(row.id)}>
                    Log Loaded
                  </Button>
                )}
              ]} data={outboundQueue} />
            </div>
          )}

          {/* Stock Screen & Barcode QR Scanner Simulator */}
          {activeTab === 'stock' && (
            <div className="space-y-6 w-full">
              {/* Stock Navigation Bar */}
              <div className="flex border-b border-[#23324C]/45 pb-px text-xs font-bold gap-4 text-left">
                <button
                  onClick={() => setStockSubTab('inventory')}
                  className={`pb-2.5 cursor-pointer transition-colors ${
                    stockSubTab === 'inventory' ? 'text-brand-500 border-b-2 border-brand-500 font-extrabold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Current Inventory Stock
                </button>
                <button
                  onClick={() => setStockSubTab('transfers')}
                  className={`pb-2.5 cursor-pointer transition-colors ${
                    stockSubTab === 'transfers' ? 'text-brand-500 border-b-2 border-brand-500 font-extrabold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Inter-Warehouse Transfers
                </button>
              </div>

              {stockSubTab === 'inventory' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* General Stock Database */}
                  <div className="lg:col-span-8 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <h3 className="text-sm font-extrabold text-white">
                        {selectedNiche === 'car_carrying' ? 'Car Carrying Warehouse Stock' : 'Pallets Database'}
                      </h3>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <SearchInput 
                          value={search} 
                          onChange={(e) => setSearch(e.target.value)} 
                          onClear={() => setSearch('')} 
                          placeholder={selectedNiche === 'car_carrying' ? "Search VIN, Rego, Model..." : "Search SKU..."} 
                          className="w-full sm:max-w-[180px]" 
                        />
                        <SelectInput value={filterBay} onChange={(e) => setFilterBay(e.target.value)} options={
                          selectedNiche === 'car_carrying' ? [
                            { value: '', label: 'All Lanes' },
                            { value: 'Lane 1', label: 'Lane 1' },
                            { value: 'Lane 2', label: 'Lane 2' },
                            { value: 'Lane 3', label: 'Lane 3' }
                          ] : [
                            { value: '', label: 'All Bays' },
                            { value: 'Bay A', label: 'Bay A' },
                            { value: 'Bay B', label: 'Bay B' },
                            { value: 'Bay C', label: 'Bay C' }
                          ]
                        } className="w-full sm:max-w-[120px]" />
                      </div>
                    </div>

                    <DataTable columns={
                      selectedNiche === 'car_carrying' ? [
                        { key: 'sku', label: 'VIN / Stock ID', render: (row) => <span className="font-mono font-extrabold text-white">{row.sku}</span> },
                        { key: 'desc', label: 'Car Make / Model', render: (row) => <span className="text-slate-300 font-semibold">{row.desc}</span> },
                        { key: 'qty', label: 'Rego Plate', render: (row) => <span className="font-mono text-brand-400 font-bold">{row.qty}</span> },
                        { key: 'bay', label: 'Yard Lane Location', render: (row) => <span className="text-slate-400 font-semibold">{row.bay}</span> },
                        { key: 'status', label: 'State', render: (row) => <StatusBadge status={row.status} /> },
                        { key: 'actions', label: 'Actions', render: (row) => (
                          <div className="flex gap-2">
                            <Button size="sm" variant="secondary" onClick={() => { setSelectedStock(row); setDetailsDrawerOpen(true); }}>Inspect</Button>
                            <Button size="sm" variant="primary" onClick={() => { setSelectedCarForLane(row); setLaneAssignModalOpen(true); }}>Assign Lane</Button>
                          </div>
                        ) }
                      ] : selectedNiche === 'dangerous_goods' ? [
                        { key: 'sku', label: 'UN Code / HAZMAT', render: (row) => <span className="font-mono font-extrabold text-red-400">{row.sku.replace('PLT-', 'UN-3480 / ')}</span> },
                        { key: 'desc', label: 'Chemical Class', render: (row) => <span className="text-slate-350 font-bold">{row.desc} (Hazmat Class 9)</span> },
                        { key: 'qty', label: 'D.G. Qty', render: (row) => <span className="font-mono text-red-350 font-bold">{row.qty} Drums</span> },
                        { key: 'bay', label: 'DG Segregation Zone', render: (row) => <span className="text-slate-400 font-semibold">{row.bay} (Bunker 3)</span> },
                        { key: 'status', label: 'DG State', render: (row) => <StatusBadge status={row.status} /> },
                        { key: 'actions', label: 'Actions', render: (row) => <Button size="sm" variant="secondary" onClick={() => { setSelectedStock(row); setDetailsDrawerOpen(true); }}>Inspect</Button> }
                      ] : [
                        { key: 'sku', label: 'SKU / Pallet Code', render: (row) => <span className="font-mono font-extrabold text-white">{row.sku}</span> },
                        { key: 'desc', label: 'Description', render: (row) => <span className="text-slate-300 font-semibold">{row.desc}</span> },
                        { key: 'qty', label: 'Qty Stored', render: (row) => <span className="font-mono">{row.qty} Pallets</span> },
                        { key: 'bay', label: 'Storage Bay', render: (row) => <span className="text-slate-400 font-semibold">{row.bay}</span> },
                        { key: 'status', label: 'State', render: (row) => <StatusBadge status={row.status} /> },
                        { key: 'actions', label: 'Actions', render: (row) => <Button size="sm" variant="secondary" onClick={() => { setSelectedStock(row); setDetailsDrawerOpen(true); }}>Inspect</Button> }
                      ]
                    } data={paginatedInventory} />

                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                  </div>

                  {/* Barcode Scanner Simulator */}
                  <div className="lg:col-span-4 glass rounded-2xl p-5 border border-[#23324C]/60 text-left flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-white mb-1">Stock Barcode & Manifest Scanner</h3>
                      <p className="text-[10px] text-slate-500">Scan barcode SKU tags (e.g. PLT-AUTO-19) or manifest sheets.</p>
                    </div>

                    <div className="my-4 space-y-4">
                      <form onSubmit={handleSimulateScan} className="flex gap-2">
                        <TextInput placeholder="Enter SKU tag..." value={scanSkuInput} onChange={(e) => setScanSkuInput(e.target.value)} />
                        <Button type="submit" variant="primary" icon={QrCode} />
                      </form>

                      <div className="flex gap-2 justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            triggerToast('Manifest document barcode scanned. Registered 3 vehicle units!');
                            setScanSkuInput('VIN-7YV1HP82A81920');
                            setScannedResults({
                              sku: 'MANIFEST-INB-99',
                              desc: 'Inbound Carrier Manifest Sheet: 3 Vehicles',
                              qty: '3 Vehicles Stored',
                              bay: 'Lane 1 / Lane 2',
                              status: 'Verified Inbound'
                            });
                          }}
                          className="w-full py-2 bg-[#161F30] hover:bg-[#23324C] border border-[#23324C] text-slate-200 text-xs rounded-xl font-bold cursor-pointer transition-colors"
                        >
                          Scan Manifest Code
                        </button>
                      </div>

                      {scannedResults && (
                        <div className="p-3.5 bg-[#0B0F19] border border-[#23324C] rounded-xl space-y-2 text-xs">
                          <div className="flex justify-between font-bold text-white">
                            <span>SKU: {scannedResults.sku}</span>
                            <StatusBadge status={scannedResults.status || 'Docked'} />
                          </div>
                          <p className="text-slate-400">{scannedResults.desc}</p>
                          <div className="text-[10px] text-slate-500 font-semibold">
                            Qty: {scannedResults.qty} • Bay Location: {scannedResults.bay}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-[#111827]/40 border border-[#23324C] text-[9px] text-slate-500 rounded-xl leading-relaxed text-center">
                      * Scans update the server database manifest logs.
                    </div>
                  </div>
                </div>
              )}

              {stockSubTab === 'transfers' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Create New Warehouse Transfer */}
                  <div className="lg:col-span-4 bg-[#111827]/60 border border-[#23324C]/60 p-5 rounded-2xl text-left space-y-4 h-fit">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">New Inter-Warehouse Dispatch</h4>
                    <div className="space-y-3.5 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1 text-[10px] uppercase font-bold">From Warehouse</label>
                        <select 
                          value={newTrfFrom} 
                          onChange={(e) => setNewTrfFrom(e.target.value)} 
                          className="w-full px-3 py-2 bg-[#0b0f19] border border-[#23324C] rounded-xl text-slate-200 focus:outline-none"
                        >
                          <option value="Chicago HQ Terminal">Chicago HQ Terminal</option>
                          <option value="Dallas Depot Terminal">Dallas Depot Terminal</option>
                          <option value="Sydney Port Terminal">Sydney Port Terminal</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 text-[10px] uppercase font-bold">To Destination Warehouse</label>
                        <select 
                          value={newTrfTo} 
                          onChange={(e) => setNewTrfTo(e.target.value)} 
                          className="w-full px-3 py-2 bg-[#0b0f19] border border-[#23324C] rounded-xl text-slate-200 focus:outline-none"
                        >
                          <option value="Dallas Depot Terminal">Dallas Depot Terminal</option>
                          <option value="Chicago HQ Terminal">Chicago HQ Terminal</option>
                          <option value="Melbourne Yard Depot">Melbourne Yard Depot</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 text-[10px] uppercase font-bold">Transfer Item SKU</label>
                        <input 
                          type="text" 
                          placeholder="e.g. PLT-AUTO-19" 
                          value={newTrfSku} 
                          onChange={(e) => setNewTrfSku(e.target.value)} 
                          className="w-full px-3 py-2 bg-[#0b0f19] border border-[#23324C] rounded-xl text-slate-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 text-[10px] uppercase font-bold">Quantity (Units)</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 10" 
                          value={newTrfQty} 
                          onChange={(e) => setNewTrfQty(e.target.value)} 
                          className="w-full px-3 py-2 bg-[#0b0f19] border border-[#23324C] rounded-xl text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        if (!newTrfSku || !newTrfQty) {
                          triggerToast('Please provide SKU and Quantity.', 'error');
                          return;
                        }
                        const newTrf = {
                          id: `TRF-${Date.now().toString().slice(-3)}`,
                          from: newTrfFrom,
                          to: newTrfTo,
                          item: newTrfSku,
                          qty: parseInt(newTrfQty),
                          status: 'Awaiting Dispatch'
                        };
                        setWarehouseTransfers([newTrf, ...warehouseTransfers]);
                        setNewTrfSku('');
                        setNewTrfQty('');
                        triggerToast('Warehouse transfer dispatch route initialized.');
                      }}
                      className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs rounded-xl font-black cursor-pointer transition-colors"
                    >
                      Initiate Transfer Route
                    </button>
                  </div>

                  {/* Active Transfers Ledger */}
                  <div className="lg:col-span-8 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                    <h3 className="text-sm font-extrabold text-white">Transfers Dispatch & Receiving Registry</h3>
                    <DataTable columns={[
                      { key: 'id', label: 'ID', render: (row) => <span className="font-mono text-white font-bold">{row.id}</span> },
                      { key: 'route', label: 'Route Path', render: (row) => <span className="text-[11px] text-slate-300 font-semibold">{row.from} ➔ {row.to}</span> },
                      { key: 'details', label: 'Item & Qty', render: (row) => <span className="text-slate-400 font-mono text-xs">{row.item} (Qty: {row.qty})</span> },
                      { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
                      { key: 'actions', label: 'Workflow Actions', render: (row) => (
                        <div className="flex gap-2">
                          {row.status === 'Awaiting Dispatch' && (
                            <button
                              onClick={() => {
                                setWarehouseTransfers(warehouseTransfers.map(t => t.id === row.id ? { ...t, status: 'Transit' } : t));
                                triggerToast('Transfer departed: Dispatch manifest printed.');
                              }}
                              className="px-2.5 py-1 bg-brand-500 hover:bg-brand-600 text-slate-950 text-[10px] rounded-lg font-black transition-colors cursor-pointer"
                            >
                              Dispatch Outbound
                            </button>
                          )}
                          {row.status === 'Transit' && (
                            <button
                              onClick={() => {
                                setWarehouseTransfers(warehouseTransfers.map(t => t.id === row.id ? { ...t, status: 'Completed' } : t));
                                triggerToast('Transfer cargo received & scanned into inventory bin.');
                              }}
                              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] rounded-lg font-bold transition-colors cursor-pointer"
                            >
                              Confirm Receipt
                            </button>
                          )}
                        </div>
                      )}
                    ]} data={warehouseTransfers} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Yard Map Screen */}
          {activeTab === 'yard-map' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
              <h3 className="text-sm font-extrabold text-white">Interactive Trailer Spotting Yard Map</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {lanes.map(lane => (
                  <div key={lane.id} className="p-4 bg-[#111827]/40 border border-[#23324C]/60 hover:border-brand-500/20 rounded-xl space-y-3 shadow-md transition-all">
                    <div className="flex justify-between items-center text-xs">
                      <strong className="text-white font-extrabold uppercase">{lane.id}</strong>
                      <span className="text-[9px] font-mono text-slate-500">{lane.spotCapacity}</span>
                    </div>
                    <p className="text-slate-400 text-xs">{lane.description}</p>
                    
                    <div className="border-t border-[#23324C]/40 pt-2.5 flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-500">Trailer Spotted:</span>
                      {lane.activeTrailer ? (
                        <span className="text-brand-400 font-bold font-mono">{lane.activeTrailer}</span>
                      ) : (
                        <span className="text-slate-600 italic">Empty Slot</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Load Lanes Management Screen */}
          {activeTab === 'load-lanes' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Relocation Form */}
              <div className="lg:col-span-5 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                <h3 className="text-sm font-extrabold text-white">Spotted Relocator</h3>
                <form onSubmit={handleRelocateTrailer} className="space-y-4">
                  <SelectInput label="Select Target Yard Lane" value={relocateLaneId} onChange={(e) => setRelocateLaneId(e.target.value)} placeholder="Choose lane..." options={
                    lanes.map(l => ({ value: l.id, label: l.id }))
                  } />
                  <TextInput label="Trailer ID to Spot" required value={relocateTargetTrailer} onChange={(e) => setRelocateTargetTrailer(e.target.value)} placeholder="e.g. TR-9410" />
                  
                  <Button type="submit" variant="primary" className="w-full">
                    Spot Trailer to Lane
                  </Button>
                </form>
              </div>

              {/* Lane status summaries */}
              <div className="lg:col-span-7 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                <h3 className="text-sm font-extrabold text-white">Lanes Allocation Summary</h3>
                <div className="divide-y divide-[#23324C]/40">
                  {lanes.map(lane => (
                    <div key={lane.id} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-white block font-bold">{lane.id}</strong>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{lane.description}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block font-mono">Spot: {lane.activeTrailer || 'Empty'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Labels & Barcodes Management (Priority 3) */}
          {activeTab === 'labels' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-5">
              <div>
                <h3 className="text-sm font-extrabold text-white">Labels & Barcodes Print Center</h3>
                <p className="text-xs text-slate-400">Generate inventory tags, print vehicle asset VIN labels, or simulate barcode scans.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Print Control panel */}
                <div className="lg:col-span-5 bg-[#111827]/60 border border-[#23324C] p-5 rounded-2xl space-y-4">
                  <strong className="text-xs text-slate-200 block">Print Label Generator</strong>
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-slate-450 mb-1.5 font-semibold uppercase text-[9px]">Select Inventory Item</label>
                      <select id="lbl-item-select" className="w-full px-3 py-2 bg-[#111827] border border-[#23324C] rounded-xl text-slate-200 focus:outline-none">
                        <option value="VIN-7YV1HP82A81920">Toyota Hilux (VIN-7YV1HP82A81920)</option>
                        <option value="PLT-COMP-42">Dry Cargo Pallet (PLT-COMP-42)</option>
                        <option value="ASSET-SC-881">Barcode Hand Scanner (ASSET-SC-881)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-450 mb-1.5 font-semibold uppercase text-[9px]">Label Layout Template</label>
                      <select id="lbl-layout-select" className="w-full px-3 py-2 bg-[#111827] border border-[#23324C] rounded-xl text-slate-200 focus:outline-none">
                        <option value="Standard QR Tag">Standard QR Inventory Tag</option>
                        <option value="Hazard UN Class placard">Hazard HAZMAT Placard Label</option>
                        <option value="Shipping Manifest barcode">Shipping Manifest Barcode 128</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => triggerToast('Label sent to Zebra Warehouse printer queue.')}
                      className="flex-grow py-2.5 bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs rounded-xl font-black cursor-pointer transition-all"
                    >
                      Print Label
                    </button>
                    <button 
                      onClick={() => triggerToast('Re-dispatched print queue request.')}
                      className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs rounded-xl font-bold cursor-pointer transition-all"
                    >
                      Reprint
                    </button>
                  </div>
                </div>

                {/* Printable Label Preview Screen */}
                <div className="lg:col-span-7 bg-[#111827]/40 border border-[#23324C] p-5 rounded-2xl text-center flex flex-col justify-between items-center space-y-4">
                  <div className="text-left w-full">
                    <strong className="text-xs text-slate-200 block">Printable Label Preview</strong>
                    <span className="text-[10px] text-slate-550 block">Live output preview before dispatching to physical spoolers.</span>
                  </div>

                  {/* Visual Barcode/QR Sticker layout */}
                  <div className="w-64 bg-white text-slate-950 p-4.5 rounded-xl border-4 border-slate-300 shadow-xl space-y-3 font-mono text-[9px] text-left select-none">
                    <div className="flex justify-between items-center border-b border-slate-950 pb-1.5">
                      <span className="font-extrabold text-[10px]">HERO LOGISTICS</span>
                      <span>SYS-LBL v2</span>
                    </div>
                    <div className="flex gap-3 items-center">
                      <div className="w-14 h-14 bg-slate-950 flex items-center justify-center text-white font-black text-center text-base rounded border border-slate-900">
                        QR
                      </div>
                      <div className="space-y-0.5 text-[8px]">
                        <div>ID: <span className="font-bold">PLT-COMP-42</span></div>
                        <div>LOC: <span className="font-bold">BAY A - ROW 4</span></div>
                        <div>WEIGHT: <span className="font-bold">14,200 LBS</span></div>
                        <div>STATUS: <span className="font-bold">INWARDED</span></div>
                      </div>
                    </div>
                    <div className="pt-1.5 border-t border-dashed border-slate-950 text-center text-[7px] font-bold">
                      * SCAN TO MOVE CUSTODY / LANE UPDATE *
                    </div>
                  </div>

                  <div className="flex justify-between gap-4 w-full">
                    <button 
                      onClick={() => triggerToast('Odometer/Asset verification scan successful.')}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs rounded-xl font-bold cursor-pointer"
                    >
                      Simulate Barcode Scan Inward
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Holding Areas Screen */}
          {activeTab === 'holding-areas' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white">Holding Areas & Segregation Zones</h3>
                  <p className="text-xs text-slate-450 mt-1">Configure temporary buffer storage, segregate high-risk HAZMAT, and map yard capacity.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => triggerToast("Location configuration added to warehouse database.")}>
                    Add Location
                  </Button>
                  <Button size="sm" variant="primary" onClick={() => triggerToast("New holding area buffer zone registered.")}>
                    Add Holding Area
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => triggerToast("Load lane allocation initialized.")}>
                    Add Load Lane
                  </Button>
                  <Button size="sm" variant="primary" onClick={() => triggerToast("Cargo units relocated to holding area.")}>
                    Move to Holding Area
                  </Button>
                </div>
              </div>

              <DataTable columns={[
                { key: 'zoneId', label: 'Zone ID', render: (row) => <span className="font-mono font-extrabold text-white">{row.zoneId}</span> },
                { key: 'category', label: 'Segregation Category', render: (row) => <span className="text-slate-355 font-semibold">{row.category}</span> },
                { key: 'capacity', label: 'Max Capacity', render: (row) => <span className="font-mono">{row.capacity}</span> },
                { key: 'occupancy', label: 'Occupancy Level', render: (row) => <span className="text-brand-400 font-bold">{row.occupancy}</span> },
                { key: 'status', label: 'State', render: (row) => <StatusBadge status={row.status} /> }
              ]} data={[
                { zoneId: 'HOLD-Z1', category: 'General Dry Freight Segregation', capacity: '20 Pallets', occupancy: '14 Pallets (70%)', status: 'Active' },
                { zoneId: 'HOLD-HAZ', category: 'HAZMAT Dangerous Goods segregation', capacity: '8 Drums limit', occupancy: '4 Drums (50%)', status: 'Active' },
                { zoneId: 'HOLD-COLD', category: 'Cold Chain Pre-load buffer', capacity: '12 Pallets', occupancy: '0 Pallets (0%)', status: 'Inactive' }
              ]} />
            </div>
          )}

          {/* Scanning Screen */}
          {activeTab === 'scanning' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-white">Warehouse Scanning Terminal</h3>
                <p className="text-xs text-slate-450 mt-1">Scan inbound barcodes, register stock tags, and log custody transfer manifests.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-5 bg-[#111827]/60 border border-[#23324C] rounded-2xl space-y-4">
                  <strong className="text-xs text-slate-200 block">Scan Action Simulator</strong>
                  <TextInput label="Barcode Input Tag" placeholder="Enter barcode or QR code..." />
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <Button variant="primary" size="sm" onClick={() => triggerToast("Barcode scanned: Item marked IN-STOCK.")}>
                      Scan In
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => triggerToast("Barcode scanned: Item marked OUTBOUND.")}>
                      Scan Out
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => triggerToast("Decoding 1D Barcode...")}>
                      Scan by Barcode
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => triggerToast("Decoding 2D QR Code...")}>
                      Scan by QR
                    </Button>
                    <Button variant="outline" size="sm" className="col-span-2 sm:col-span-1" onClick={() => triggerToast("Manual catalog code registered.")}>
                      Manual Entry
                    </Button>
                  </div>
                </div>

                <div className="p-5 bg-[#111827]/40 border border-[#23324C] rounded-2xl flex flex-col justify-between items-center text-center">
                  <div className="text-left w-full">
                    <strong className="text-xs text-slate-200 block">Device Status</strong>
                    <span className="text-[10px] text-slate-500 block">Zebra Scanner handheld connected.</span>
                  </div>
                  <div className="my-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl">
                    SCANNER ONLINE • READY TO SCAN
                  </div>
                  <div className="text-[9px] text-slate-550 leading-relaxed">
                    * Scanning operations automatically update inventory locations and log movements history.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Movements Screen */}
          {activeTab === 'movements' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white">Inventory Movements & Custody Ledger</h3>
                  <p className="text-xs text-slate-450 mt-1">Trace the chain of custody, verify movement logs, and spot items to load lanes.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="primary" onClick={() => triggerToast("Stock relocation completed.")}>
                    Move Item
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => triggerToast("Asset spotted directly to load lane.")}>
                    Move to Load Lane
                  </Button>
                  <Button size="sm" variant="primary" onClick={() => triggerToast("Load lane assignment updated.")}>
                    Assign to Load Lane
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => triggerToast("Asset history audit log generated.")}>
                    View Asset History
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => triggerToast("Movement ledger exported.")}>
                    View Movement History
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => triggerToast("Flagged: Missing item report sent to Supervisor.", "warning")}>
                    Report Missing Item
                  </Button>
                </div>
              </div>

              <DataTable columns={[
                { key: 'moveId', label: 'Movement ID', render: (row) => <span className="font-mono font-extrabold text-white">{row.moveId}</span> },
                { key: 'item', label: 'Inventory Item', render: (row) => <span className="text-slate-300 font-semibold">{row.item}</span> },
                { key: 'source', label: 'Origin Source', render: (row) => <span className="text-slate-400 font-semibold">{row.source}</span> },
                { key: 'dest', label: 'Destination target', render: (row) => <span className="text-brand-400 font-bold">{row.dest}</span> },
                { key: 'user', label: 'Warehouse Operative', render: (row) => <span className="text-slate-450">{row.user}</span> },
                { key: 'time', label: 'Timestamp', render: (row) => <span className="text-slate-500 font-mono text-[10px]">{row.time}</span> }
              ]} data={[
                { moveId: 'MOV-994', item: 'VIN-7YV1HP82A81920', source: 'Lane 1', dest: 'Outbound Lane A1', user: 'Adam K.', time: '06/23 10:24 AM' },
                { moveId: 'MOV-993', item: 'PLT-AUTO-19', source: 'Bay A', dest: 'Holding Area HOLD-Z1', user: 'Julie B.', time: '06/23 09:12 AM' }
              ]} />
            </div>
          )}

          {/* Reports Screen */}
          {activeTab === 'reports' && (
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white">Warehouse Capacity & Operations Analytics</h3>
                  <p className="text-xs text-slate-450 mt-1">Export manifest registries, monitor occupancy thresholds, and evaluate warehouse productivity.</p>
                </div>
                <Button variant="primary" onClick={() => triggerToast("CSV Stock List database exported successfully.")}>
                  Export Stock List
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Daily Outbound Dispatches" value="18 Trailers" description="Ready manifests completed" progress={82} />
                <StatCard title="Storage Utilization" value="78%" description="Total capacity allocated" progress={78} />
                <StatCard title="Fulfillment Accuracy" value="99.94%" description="Picker scan matching checks" progress={99} />
              </div>

              <div className="p-4 bg-[#111827]/40 border border-[#23324C]/60 rounded-xl space-y-2 text-xs">
                <strong className="text-white block font-bold">Monthly Stock Turnover Analytics Report</strong>
                <p className="text-slate-400">Total processed volume for June 2026: 4,890 pallets incoming, 4,620 outbound, net inventory stock growth: +270 units.</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Receive Pallet Modal */}
      <Modal isOpen={receiveModalOpen} onClose={() => setReceiveModalOpen(false)} title="Receive Incoming Dry Cargo Pallet">
        <form onSubmit={handleReceivePallet} className="space-y-4">
          <TextInput label="SKU / Pallet Code ID" required placeholder="e.g. PLT-COMP-42" value={skuCode} onChange={(e) => setSkuCode(e.target.value)} />
          <TextInput label="Quantity (Pallets)" required type="number" placeholder="e.g. 12" value={skuQty} onChange={(e) => setSkuQty(e.target.value)} />
          <SelectInput label="Assign Storage Bay Area" value={skuBay} onChange={(e) => setSkuBay(e.target.value)} options={[
            { value: 'Bay A', label: 'Bay A (Dry)' },
            { value: 'Bay B', label: 'Bay B (Cold)' },
            { value: 'Bay C', label: 'Bay C (Hazard)' }
          ]} />
          <Button type="submit" variant="primary" className="w-full">
            Log Pallet Stock Inward
          </Button>
        </form>
      </Modal>

      {/* Add New Car to Stock Modal */}
      <Modal isOpen={carModalOpen} onClose={() => setCarModalOpen(false)} title="Add New Car to Stock Inventory">
        <form onSubmit={handleAddCar} className="space-y-4">
          <TextInput label="Vehicle VIN Number" required placeholder="e.g. 7YV1HP82A81920" value={newCarVin} onChange={(e) => setNewCarVin(e.target.value)} />
          <TextInput label="Make / Model / Trim" required placeholder="e.g. Toyota Hilux double-cab" value={newCarModel} onChange={(e) => setNewCarModel(e.target.value)} />
          <TextInput label="Rego Plate Code" required placeholder="e.g. QLD-88A" value={newCarRego} onChange={(e) => setNewCarRego(e.target.value)} />
          <SelectInput label="Assign Storage Lane" value={newCarLane} onChange={(e) => setNewCarLane(e.target.value)} options={[
            { value: 'Lane 1', label: 'Lane 1' },
            { value: 'Lane 2', label: 'Lane 2' },
            { value: 'Lane 3', label: 'Lane 3' }
          ]} />
          <Button type="submit" variant="primary" className="w-full">
            Register Car to Stock
          </Button>
        </form>
      </Modal>

      {/* AssignPicked Car to Outbound Lane Modal */}
      <Modal isOpen={laneAssignModalOpen} onClose={() => setLaneAssignModalOpen(false)} title="Assign Car to Outbound Lane">
        {selectedCarForLane && (
          <form onSubmit={handleAssignCarLane} className="space-y-4">
            <div className="p-3 bg-[#111827] border border-[#23324C] rounded-xl text-xs space-y-1">
              <div className="text-slate-450 uppercase font-bold text-[9px]">Picked Vehicle</div>
              <strong className="text-white block">{selectedCarForLane.desc}</strong>
              <div className="text-slate-400 font-mono">VIN: {selectedCarForLane.sku}</div>
            </div>
            
            <SelectInput label="Select Outbound Lane Spot" value={targetOutboundLane} onChange={(e) => setTargetOutboundLane(e.target.value)} options={[
              { value: 'Lane A1', label: 'Outbound Lane A1' },
              { value: 'Lane B2', label: 'Outbound Lane B2' },
              { value: 'Lane C3', label: 'Outbound Lane C3' }
            ]} />
            
            <Button type="submit" variant="primary" className="w-full">
              Allocate Lane & Queue
            </Button>
          </form>
        )}
      </Modal>

      {/* Details Drawer */}
      <Drawer isOpen={detailsDrawerOpen} onClose={() => setDetailsDrawerOpen(false)} title="Stock Asset Inspector">
        {selectedStock && (
          <div className="space-y-6 text-left text-slate-300 text-xs sm:text-sm">
            <div className="border-b border-[#23324C]/60 pb-3">
              <h4 className="text-base font-extrabold text-white mb-1">SKU: {selectedStock.sku}</h4>
              <StatusBadge status={selectedStock.status} />
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-500 block">Item Description</span>
                <strong className="text-white text-xs">{selectedStock.desc}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Quantity Stored</span>
                <span className="text-xs font-semibold">{selectedStock.qty}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Bay Location Area</span>
                <span className="text-xs font-semibold text-brand-400">{selectedStock.bay}</span>
              </div>
            </div>

            <div className="flex gap-2 border-t border-[#23324C]/60 pt-4">
              <Button variant="danger" size="sm" onClick={() => { setDetailsDrawerOpen(false); triggerToast('Pallet relocated.'); }}>
                Relocate Bay Bin
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setDetailsDrawerOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Drawer>

    </div>
  );
}
