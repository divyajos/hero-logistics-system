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

export default function WarehouseDashboard() {
  const { tab } = useParams();
  const activeTab = tab || 'overview';
  const dispatch = useDispatch();
  const { inventory, occupancy, scansCount, crossDockCount, movements, assets, loading } = useSelector((state) => state.warehouse);

  // Modals & Drawers
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);

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
  const filteredInventory = inventory.filter((item) => {
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
          <p className="text-xs text-slate-400">Receive pallets, inspect storage bay lanes, and scan incoming stock tags.</p>
        </div>

        {activeTab === 'stock' && (
          <Button variant="primary" icon={Plus} onClick={() => setReceiveModalOpen(true)}>
            Receive Pallet Stock
          </Button>
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* General Stock Database */}
              <div className="lg:col-span-8 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <h3 className="text-sm font-extrabold text-white">Pallets Database</h3>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="Search SKU..." className="max-w-[150px]" />
                    <SelectInput value={filterBay} onChange={(e) => setFilterBay(e.target.value)} options={[
                      { value: '', label: 'All Bays' },
                      { value: 'Bay A', label: 'Bay A' },
                      { value: 'Bay B', label: 'Bay B' },
                      { value: 'Bay C', label: 'Bay C' }
                    ]} className="max-w-[120px]" />
                  </div>
                </div>

                <DataTable columns={[
                  { key: 'sku', label: 'SKU / Pallet Code', render: (row) => <span className="font-mono font-extrabold text-white">{row.sku}</span> },
                  { key: 'desc', label: 'Description', render: (row) => <span className="text-slate-300 font-semibold">{row.desc}</span> },
                  { key: 'qty', label: 'Qty Stored', render: (row) => <span className="font-mono">{row.qty}</span> },
                  { key: 'bay', label: 'Storage Bay', render: (row) => <span className="text-slate-400 font-semibold">{row.bay}</span> },
                  { key: 'status', label: 'State', render: (row) => <StatusBadge status={row.status} /> },
                  { key: 'actions', label: 'Actions', render: (row) => <Button size="sm" variant="secondary" onClick={() => { setSelectedStock(row); setDetailsDrawerOpen(true); }}>Inspect</Button> }
                ]} data={paginatedInventory} />

                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>

              {/* Barcode Scanner Simulator */}
              <div className="lg:col-span-4 glass rounded-2xl p-5 border border-[#23324C]/60 text-left flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-white mb-1">Stock Barcode / QR Scanner</h3>
                  <p className="text-[10px] text-slate-500">Scan barcode SKU tags (e.g. PLT-AUTO-19).</p>
                </div>

                <div className="my-4 space-y-4">
                  <form onSubmit={handleSimulateScan} className="flex gap-2">
                    <TextInput placeholder="Enter SKU tag..." value={scanSkuInput} onChange={(e) => setScanSkuInput(e.target.value)} />
                    <Button type="submit" variant="primary" icon={QrCode} />
                  </form>

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
