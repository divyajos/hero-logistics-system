import React, { useState } from 'react';
import Button from '../common/Button';
import TextInput from '../common/TextInput';
import SelectInput from '../common/SelectInput';
import StatCard from '../common/StatCard';
import Toast from '../common/Toast';
import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import FileUploader from '../common/FileUploader';
import MiniChart from '../common/MiniChart';
import { 
  Bot, Brain, Sparkles, QrCode, FileText, BarChart3, Settings, 
  Send, User, Clock, Check, Eye, X, Edit, Trash2, Cpu
} from 'lucide-react';

export default function AiCenterDashboard() {
  const [activeSubTab, setActiveSubTab] = useState('inbox'); // inbox, playground, analytics, settings
  
  // AI Extraction Queue State
  const [extractionQueue, setExtractionQueue] = useState([
    { id: 'EXT-701', type: 'Load Sheet', source: 'Vance_Ref_PO_109.pdf', confidence: '97.2%', status: 'Pending Review', date: 'Just now', data: { cargo: 'HVAC Units', weight: '18,500 lbs', route: 'Chicago HQ ➔ St. Louis Depot', customer: 'Vance Refrigeration' } },
    { id: 'EXT-702', type: 'Fuel Receipt', source: 'Shell_Receipt_TX88.jpg', confidence: '94.8%', status: 'Pending Review', date: '5 min ago', data: { item: 'Diesel Fuel', fuelQty: '120 Gal', cost: '$468.00', gst: '$46.80' } },
    { id: 'EXT-703', type: 'Odometer Photo', source: 'odo_truck_88.png', confidence: '99.1%', status: 'Processed', date: '1 hour ago', data: { vehicle: 'TX-ROAD88', reading: '142,890 km' } }
  ]);

  // AI Chat Playground State
  const [chatMessages, setChatMessages] = useState([
    { sender: 'AI Assistant', text: 'Hello! I am your Hero Logistics AI co-pilot. I can query active transits, search VIN registries, calculate fuel taxes, or write custom dispatcher alerts. Ask me anything.', time: 'Just now' }
  ]);
  const [currentPrompt, setCurrentPrompt] = useState('');

  // AI Settings State
  const [aiSettings, setAiSettings] = useState({
    autoIngestLowConfidence: false,
    confidenceThreshold: '85%',
    modelSelector: 'GPT-4o Logistics v2',
    enableVoiceCommands: true
  });

  // Toasts
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // AI Chat prompt submit
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!currentPrompt.trim()) return;
    
    const userMsg = { sender: 'Operator', text: currentPrompt.trim(), time: 'Just now' };
    setChatMessages([userMsg, ...chatMessages]);
    const promptText = currentPrompt.toLowerCase();
    setCurrentPrompt('');

    // Generate intelligent logistics mock responses
    setTimeout(() => {
      let botResponse = "I have analyzed your request. Connecting to GIS telemetry and active rosters database to generate coordinates...";
      if (promptText.includes(' Sydney') || promptText.includes('sydney')) {
        botResponse = "GIS Search Result: Truck #TX-ROAD88 is currently within geofence radius of Sydney Terminal, traveling at 62 km/h. Next scheduled arrival: 45 minutes.";
      } else if (promptText.includes('invoice') || promptText.includes('money')) {
        botResponse = "Accounts Summary: Outstanding invoice balance totals $22,350 across 3 Net-30 agreements. 2 invoices are flag-triggered as overdue.";
      } else if (promptText.includes('car') || promptText.includes('vin')) {
        botResponse = "VIN Lookup: Found Mitsubishi Triton GLX in warehouse stock (Lane 2). State: Unassigned. Destination: Brisbane Terminal.";
      }
      setChatMessages(prev => [{ sender: 'AI Assistant', text: botResponse, time: 'Just now' }, ...prev]);
    }, 800);
  };

  // AI Actions Trigger
  const handleConfirmAIResult = (item) => {
    setExtractionQueue(extractionQueue.filter(q => q.id !== item.id));
    triggerToast(`AI Extraction approved and saved: ${item.type} (ID: ${item.id}).`);
  };

  const handleRejectAIResult = (item) => {
    setExtractionQueue(extractionQueue.filter(q => q.id !== item.id));
    triggerToast(`AI Extraction discarded: ${item.id}.`, 'warning');
  };

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
          <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#23324C]/60 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Cpu className="h-6 w-6 text-brand-500" /> AI Center
          </h2>
          <p className="text-xs text-slate-400">Manage autonomous ingestion queues, run co-pilot commands, and monitor extraction metrics.</p>
        </div>
      </div>

      {/* Sub-tabs menu */}
      <div className="flex border-b border-[#23324C]/40 pb-px text-xs font-bold gap-4">
        {[
          { id: 'inbox', label: 'Ingestion Queue', icon: FileText },
          { id: 'playground', label: 'AI Co-Pilot Playground', icon: Bot },
          { id: 'analytics', label: 'Extraction Analytics', icon: BarChart3 },
          { id: 'settings', label: 'Model Configuration', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 pb-3 cursor-pointer transition-colors ${
                isActive ? 'text-brand-500 border-b-2 border-brand-500 font-extrabold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Ingestion Queue Tab */}
      {activeSubTab === 'inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Ingestion Queue table */}
          <div className="lg:col-span-8 glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4">
            <h3 className="text-sm font-extrabold text-white">AI Extraction Inbox</h3>
            <div className="space-y-4">
              {extractionQueue.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs italic">
                  Ingestion queue is empty. All OCR items resolved.
                </div>
              ) : (
                extractionQueue.map((item) => (
                  <div key={item.id} className="p-4 bg-[#111827]/60 border border-[#23324C] rounded-xl space-y-3.5">
                    <div className="flex justify-between items-center border-b border-[#23324C]/50 pb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          item.type.includes('Load') ? 'bg-brand-500/10 text-brand-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {item.type}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{item.source}</span>
                      </div>
                      <span className="text-[10px] bg-brand-500/10 text-brand-400 border border-brand-500/20 px-2 py-0.5 rounded-full font-bold">
                        {item.confidence} Match Rate
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
                      {item.type === 'Load Sheet' && (
                        <>
                          <div>
                            <span className="text-slate-500 block uppercase font-bold text-[8px]">Cargo Description</span>
                            <strong className="text-white block mt-0.5">{item.data.cargo} ({item.data.weight})</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 block uppercase font-bold text-[8px]">Route</span>
                            <strong className="text-white block mt-0.5">{item.data.route}</strong>
                          </div>
                        </>
                      )}
                      {item.type === 'Fuel Receipt' && (
                        <>
                          <div>
                            <span className="text-slate-500 block uppercase font-bold text-[8px]">Fuel Details</span>
                            <strong className="text-white block mt-0.5">{item.data.item} - {item.data.fuelQty}</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 block uppercase font-bold text-[8px]">Financials</span>
                            <strong className="text-white block mt-0.5">Total: {item.data.cost} (GST: {item.data.gst})</strong>
                          </div>
                        </>
                      )}
                      {item.type === 'Odometer Photo' && (
                        <>
                          <div>
                            <span className="text-slate-500 block uppercase font-bold text-[8px]">Vehicle ID</span>
                            <strong className="text-white block mt-0.5">{item.data.vehicle}</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 block uppercase font-bold text-[8px]">Odometer Reading</span>
                            <strong className="text-white block mt-0.5 font-mono">{item.data.reading}</strong>
                          </div>
                        </>
                      )}
                    </div>

                    {/* AI Buttons required by client spec */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-[#23324C]/45">
                      <button 
                        onClick={() => triggerToast(`AI details parsed from: ${item.source}`)}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-bold transition-colors cursor-pointer"
                      >
                        Review AI Result
                      </button>
                      <button 
                        onClick={() => handleConfirmAIResult(item)}
                        className="px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs rounded-xl font-black transition-colors cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => triggerToast('Mock editor loaded.')}
                        className="px-3.5 py-2 bg-slate-700 hover:bg-slate-650 text-slate-355 text-xs rounded-xl font-bold transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleRejectAIResult(item)}
                        className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs rounded-xl font-bold transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Ingestion side-zone */}
          <div className="lg:col-span-4 glass rounded-2xl p-5 border border-[#23324C]/60 text-left flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-white mb-1">OCR Document Uploader</h3>
              <p className="text-[10px] text-slate-500 font-semibold mb-3">Upload receipts, trip tickets, or manifests for automatic ingestion.</p>
              <FileUploader onUploadSuccess={(url, name) => {
                const isPdf = name.endsWith('.pdf');
                const newItem = {
                  id: `EXT-${Date.now().toString().slice(-3)}`,
                  type: isPdf ? 'Load Sheet' : 'Fuel Receipt',
                  source: name,
                  confidence: '95.6%',
                  status: 'Pending Review',
                  date: 'Just now',
                  data: isPdf ? { cargo: 'Extra Machinery Parts', weight: '8,400 lbs', route: 'ChicagoHQ ➔ Sydney Depot', customer: 'Global Retail Corp' } 
                              : { item: 'Premium Diesel', fuelQty: '94 Gal', cost: '$380.00', gst: '$38.00' }
                };
                setExtractionQueue([newItem, ...extractionQueue]);
                triggerToast('OCR ingestion started: Document extracted.');
              }} />
            </div>
            
            <div className="p-3 bg-[#111827]/40 border border-[#23324C] text-[9.5px] text-slate-500 rounded-xl leading-relaxed text-center mt-4">
              * Files are immediately scanned using LLM vision models to categorize items.
            </div>
          </div>
        </div>
      )}

      {/* AI Playground tab */}
      {activeSubTab === 'playground' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left flex flex-col justify-between h-[500px]">
          <div>
            <h3 className="text-sm font-extrabold text-white mb-1">Interactive AI Assistant Playground</h3>
            <p className="text-[10px] text-slate-500 mb-3">Query vehicle fleets, calculate margins, or search customer accounts using natural language prompts.</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 my-4 pr-1 scrollbar-none flex flex-col-reverse max-h-[340px]">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`p-3 rounded-xl text-xs max-w-[80%] leading-relaxed ${
                msg.sender === 'Operator' 
                  ? 'bg-brand-500 text-slate-950 ml-auto font-semibold' 
                  : 'bg-[#111827]/80 border border-[#23324C] text-slate-300'
              }`}>
                <div className="flex justify-between font-bold text-[9px] mb-1 opacity-70">
                  <span>{msg.sender}</span>
                  <span className="font-mono">{msg.time}</span>
                </div>
                <p>{msg.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleChatSubmit} className="flex gap-2 border-t border-[#23324C]/40 pt-4">
            <input
              type="text"
              required
              value={currentPrompt}
              onChange={(e) => setCurrentPrompt(e.target.value)}
              placeholder="e.g. Find all trucks near Sydney or calculate net margin..."
              className="flex-grow px-3 py-2 bg-[#111827] border border-[#23324C] focus:border-brand-500 rounded-xl text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 placeholder:text-slate-500"
            />
            <Button type="submit" variant="primary" icon={Send} />
          </form>
        </div>
      )}

      {/* AI Analytics Tab */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="AI Extraction Accuracy" value="96.2%" description="Average match precision score" progress={96} />
            <StatCard title="Processed sheets" value="14,890" description="Monthly document volume processed" trend="+18%" trendDirection="up" />
            <StatCard title="Frictionless matches" value="84%" description="No manual edits needed" progress={84} />
            <StatCard title="Co-pilot queries" value="1,240 runs" description="Direct AI commands answered" trend="Active" trendDirection="neutral" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-2">
              <h3 className="text-sm font-extrabold text-white">Ingested Document Volumes</h3>
              <MiniChart type="line" data={[2100, 2400, 2900, 3100, 3800, 4200]} labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']} />
            </div>
            
            <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-2">
              <h3 className="text-sm font-extrabold text-white">Extraction Processing Times (sec)</h3>
              <MiniChart type="bar" data={[4.5, 4.2, 3.9, 3.5, 2.9, 2.1]} labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']} />
            </div>
          </div>
        </div>
      )}

      {/* Model Configuration Tab */}
      {activeSubTab === 'settings' && (
        <div className="glass rounded-2xl p-5 border border-[#23324C]/60 text-left space-y-4 max-w-xl">
          <h3 className="text-sm font-extrabold text-white">AI Model Configurations</h3>
          
          <div className="space-y-4">
            <SelectInput 
              label="Active AI Engine Model" 
              value={aiSettings.modelSelector} 
              onChange={(e) => setAiSettings({ ...aiSettings, modelSelector: e.target.value })} 
              options={[
                { value: 'GPT-4o Logistics v2', label: 'GPT-4o Logistics Fine-tuned v2' },
                { value: 'Claude 3.5 Sonnet v2', label: 'Claude 3.5 Sonnet Routing Optimizer' },
                { value: 'Gemini 1.5 Pro', label: 'Gemini 1.5 Pro Long-context OCR' }
              ]} 
            />

            <SelectInput 
              label="Minimum Extraction Confidence Level" 
              value={aiSettings.confidenceThreshold} 
              onChange={(e) => setAiSettings({ ...aiSettings, confidenceThreshold: e.target.value })} 
              options={[
                { value: '95%', label: '95% (Strict auditing)' },
                { value: '85%', label: '85% (Balanced review)' },
                { value: '75%', label: '75% (Fast ingestion)' }
              ]} 
            />

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-[#23324C] rounded-xl cursor-pointer select-none">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-200 block">Auto-Ingest Low Confidence Items</span>
                  <span className="text-[10px] text-slate-500 block">Ingest records below threshold into draft mode automatically</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={aiSettings.autoIngestLowConfidence} 
                  onChange={(e) => setAiSettings({ ...aiSettings, autoIngestLowConfidence: e.target.checked })} 
                  className="rounded text-brand-500 focus:ring-brand-500 h-4.5 w-4.5 cursor-pointer" 
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-[#23324C] rounded-xl cursor-pointer select-none">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-200 block">Enable Driver Voice Dispatching Commands</span>
                  <span className="text-[10px] text-slate-500 block">Allows voice-to-text dictation on compliance checklists</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={aiSettings.enableVoiceCommands} 
                  onChange={(e) => setAiSettings({ ...aiSettings, enableVoiceCommands: e.target.checked })} 
                  className="rounded text-brand-500 focus:ring-brand-500 h-4.5 w-4.5 cursor-pointer" 
                />
              </label>
            </div>
            
            <Button 
              type="button" 
              variant="primary" 
              className="w-full mt-2"
              onClick={() => triggerToast('AI configurations saved.')}
            >
              Save Configurations
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
