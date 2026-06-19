import axios from 'axios';

// Determine if we should intercept and resolve requests using client-side mock databases
const isMockMode = import.meta.env.VITE_USE_MOCK_API === 'true';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const session = localStorage.getItem('hero_session');
    if (session) {
      const parsed = JSON.parse(session);
      if (parsed?.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiry (401)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Catch 401 and try auto refresh token handshake
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const session = localStorage.getItem('hero_session');
        if (session) {
          const parsed = JSON.parse(session);
          // Call refresh endpoint
          const res = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${parsed.token}` }
          });
          if (res.data?.token) {
            parsed.token = res.data.token;
            localStorage.setItem('hero_session', JSON.stringify(parsed));
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, auto logout
        localStorage.removeItem('hero_session');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ========================================================
// IN-MEMORY MOCK DATABASE ENGINE (For Client-Side Runs)
// ========================================================
if (isMockMode) {
  const LOCAL_STORAGE_DB_KEY = 'hero_mock_db';
  
  // Default seeds for all dashboard operations
  const defaultDb = {
    tenants: [
      { id: 1, name: 'Falcon Logistics LLC', plan: 'Professional', status: 'Active', drivers: 24, joined: '03/12/2026' },
      { id: 2, name: 'Swift Cargo Express', plan: 'Starter', status: 'Active', drivers: 5, joined: '04/19/2026' },
      { id: 3, name: 'Global Shipping Solutions', plan: 'Enterprise', status: 'Active', drivers: 142, joined: '02/01/2026' },
      { id: 4, name: 'Texas Hotshot Carriers', plan: 'Starter', status: 'Hold', drivers: 3, joined: '05/20/2026' },
      { id: 5, name: 'Apex Logistics LLC', plan: 'Professional', status: 'Active', drivers: 18, joined: '06/19/2026' }
    ],
    leads: [
      { id: 1, name: 'Robert Vance', company: 'Vance Refrigeration', email: 'rvance@vancerefrig.com', phone: '555-0912', status: 'Pending', msg: 'Need flatbed rates for regional deliveries.', rate: 1200, source: 'Google', stage: 'Prospect' },
      { id: 2, name: 'Stanley Hudson', company: 'Hudson Logistics Corp', email: 'shudson@hudsonlog.com', phone: '555-8941', status: 'Demo Scheduled', msg: 'Scheduling a walkthrough for 15 dispatch operators.', rate: 3500, source: 'Referral', stage: 'Contacted' },
      { id: 3, name: 'Phyllis Vance', company: 'Vance Logistics', email: 'pvance@vance.com', phone: '555-9012', status: 'Completed', msg: 'Free trial setup requested.', rate: 850, source: 'LinkedIn', stage: 'Won' },
      { id: 4, name: 'Oscar Martinez', company: 'Martinez Accounting Freight', email: 'oscar@martinezfr.com', phone: '555-4122', status: 'Delayed', msg: 'Inquiry on factoring invoice automation rules.', rate: 2200, source: 'Cold Call', stage: 'Qualified' }
    ],
    fleet: [
      { 
        id: 1, 
        plate: 'TX-ROAD88', 
        type: 'Semi-Truck', 
        capacity: '45,000 lbs', 
        branch: 'Chicago HQ Terminal', 
        status: 'Active',
        mileage: '124,500 miles',
        efficiency: '6.8 mpg',
        maintenanceHistory: [
          { service: 'Oil Change & Fuel Filters', date: '2026-05-10', cost: '$350.00', status: 'Completed' },
          { service: 'Brake Pad Replacement', date: '2026-04-12', cost: '$820.00', status: 'Completed' }
        ],
        serviceSchedule: [
          { service: 'Tire Rotation & Alignment', date: '2026-07-20', status: 'Scheduled' },
          { service: 'Annual DOT Inspection', date: '2026-08-15', status: 'Scheduled' }
        ],
        registration: { state: 'TX', expires: '2026-08-30', number: 'REG-88291A', status: 'Active' },
        insurance: { policy: 'POL-881923', expires: '2026-06-28', provider: 'Progressive Commercial', coverage: '$1,000,000' },
        inspections: [
          { date: '2026-05-01', result: 'Pass', inspector: 'Officer Ramirez', notes: 'Brakes and lights fully compliant.' }
        ]
      },
      { 
        id: 2, 
        plate: 'IL-HAUL42', 
        type: 'Flatbed Trailer', 
        capacity: '38,000 lbs', 
        branch: 'Chicago HQ Terminal', 
        status: 'Transit',
        mileage: '98,200 miles',
        efficiency: 'N/A',
        maintenanceHistory: [
          { service: 'Wheel Bearing Greasing', date: '2026-03-22', cost: '$180.00', status: 'Completed' }
        ],
        serviceSchedule: [
          { service: 'DOT Annual Inspection', date: '2026-07-05', status: 'Scheduled' }
        ],
        registration: { state: 'IL', expires: '2026-07-08', number: 'REG-10223B', status: 'Active' },
        insurance: { policy: 'POL-910238', expires: '2026-09-12', provider: 'Berkshire Hathaway', coverage: '$500,000' },
        inspections: [
          { date: '2026-03-01', result: 'Pass', inspector: 'Officer Miller', notes: 'Tires at 8/32 tread.' }
        ]
      },
      { 
        id: 3, 
        plate: 'CA-CARRI7', 
        type: 'Car Carrier', 
        capacity: '12 Cars', 
        branch: 'Los Angeles Depot', 
        status: 'Active',
        mileage: '64,100 miles',
        efficiency: '5.9 mpg',
        maintenanceHistory: [],
        serviceSchedule: [],
        registration: { state: 'CA', expires: '2026-11-15', number: 'REG-90112C', status: 'Active' },
        insurance: { policy: 'POL-771123', expires: '2026-12-05', provider: 'Liberty Mutual', coverage: '$2,000,000' },
        inspections: []
      },
      { 
        id: 4, 
        plate: 'NY-VAN023', 
        type: 'Courier Van', 
        capacity: '8,000 lbs', 
        branch: 'New York Bay Terminal', 
        status: 'Pending',
        mileage: '42,000 miles',
        efficiency: '14.2 mpg',
        maintenanceHistory: [],
        serviceSchedule: [],
        registration: { state: 'NY', expires: '2026-06-22', number: 'REG-55291D', status: 'Active' },
        insurance: { policy: 'POL-223841', expires: '2026-06-25', provider: 'GEICO Commercial', coverage: '$250,000' },
        inspections: []
      },
      { 
        id: 5, 
        plate: 'GA-LOAD99', 
        type: 'Box Truck', 
        capacity: '18,000 lbs', 
        branch: 'Atlanta Depot', 
        status: 'Delayed',
        mileage: '85,400 miles',
        efficiency: '8.4 mpg',
        maintenanceHistory: [],
        serviceSchedule: [],
        registration: { state: 'GA', expires: '2026-10-31', number: 'REG-22319E', status: 'Active' },
        insurance: { policy: 'POL-661129', expires: '2026-10-15', provider: 'Nationwide', coverage: '$750,000' },
        inspections: []
      }
    ],
    branches: [
      { id: 1, name: 'Chicago HQ Terminal', address: '100 Logistics Blvd', city: 'Chicago', state: 'IL', manager: 'hq@company.com', staff: 8 },
      { id: 2, name: 'Los Angeles Depot', address: '45 Long Beach Rd', city: 'Los Angeles', state: 'CA', manager: 'la@company.com', staff: 4 }
    ],
    users: [
      { id: 1, name: 'Alexander Wright', email: 'alex@apexcargo.com', role: 'Company Admin' }
    ],
    loads: [
      { 
        id: 1, 
        loadId: 'LD-9411', 
        cargo: 'Automotive Components (Flatbed)', 
        route: 'Chicago IL ➔ Dallas TX', 
        driver: 'John D.', 
        contact: '555-0192', 
        weight: '42,000 lbs', 
        status: 'In Transit', 
        eta: '3 hours', 
        cost: '$1,200.00',
        customerName: 'Global Retail Corp',
        customerEmail: 'billing@globalretail.com',
        customerPhone: '555-0192',
        customerRef: 'PO-9102',
        pickupAddress: 'Chicago HQ Terminal, 100 Logistics Blvd',
        pickupDate: '2026-06-18T08:00',
        pickupContact: 'Bob Evans',
        pickupNotes: 'Open deck loading required.',
        deliveryAddress: 'Dallas Depot, 400 Freight Rd, Dallas TX',
        deliveryDate: '2026-06-20T17:00',
        deliveryContact: 'Alice Cooper',
        deliveryNotes: 'Check seals before opening doors.',
        stops: [
          { id: 1, address: 'St. Louis Transit Yard, MO', type: 'Layover', notes: 'Mandatory rest stop.', sequence: 1 }
        ],
        vehicle: 'TX-ROAD88',
        notes: ['Fragile electronic components', 'Verify trailer tie-downs before departing'],
        documents: [
          { name: 'Bill of Lading.pdf', type: 'PDF', date: '06/18/2026', url: '#' },
          { name: 'Rate Confirmation.pdf', type: 'PDF', date: '06/18/2026', url: '#' }
        ],
        statusHistory: [
          { status: 'Draft', time: '2 days ago', note: 'Booking request filed' },
          { status: 'Planned', time: '1 day ago', note: 'Route optimal schedules generated' },
          { status: 'Assigned', time: '12 hours ago', note: 'Assigned to driver John D.' },
          { status: 'In Transit', time: '3 hours ago', note: 'Cargo picked up & departed origin' }
        ],
        activities: [
          { message: 'Departed Chicago terminal', user: 'System GPS', time: '3 hours ago' },
          { message: 'Load assignment accepted', user: 'John D. (Driver)', time: '12 hours ago' }
        ]
      },
      { 
        id: 2, 
        loadId: 'LD-1102', 
        cargo: 'Dry Grocery Pallets', 
        route: 'Houston TX ➔ Atlanta GA', 
        driver: 'Sarah R.', 
        contact: '555-8841', 
        weight: '1,200 lbs', 
        status: 'Planned', 
        eta: 'Tomorrow', 
        cost: '$850.00',
        customerName: 'HEB Distributors',
        customerEmail: 'dispatch@heb.com',
        customerPhone: '555-8841',
        customerRef: 'HEB-0941',
        pickupAddress: 'Houston Logistics Hub, Lane 4',
        pickupDate: '2026-06-19T09:00',
        pickupContact: 'Jerry Jones',
        pickupNotes: 'Verify temperature is ambient.',
        deliveryAddress: 'Atlanta Depot, 800 Peachtree St, Atlanta GA',
        deliveryDate: '2026-06-21T12:00',
        deliveryContact: 'Sarah Jenkins',
        deliveryNotes: 'Gate code 4022 at destination',
        stops: [],
        vehicle: 'IL-HAUL42',
        notes: ['Temp monitoring not required', 'Gate code 4022 at destination'],
        documents: [
          { name: 'Bill of Lading.pdf', type: 'PDF', date: '06/19/2026', url: '#' }
        ],
        statusHistory: [
          { status: 'Draft', time: '1 day ago', note: 'Grocery order list loaded' },
          { status: 'Planned', time: '5 hours ago', note: 'Scheduled for dispatch' }
        ],
        activities: [
          { message: 'Optimal route scheduled', user: 'Dispatch Planner', time: '5 hours ago' }
        ]
      },
      { 
        id: 3, 
        loadId: 'LD-4809', 
        cargo: 'Industrial Coils', 
        route: 'Seattle WA ➔ Portland OR', 
        driver: 'Donald S.', 
        contact: '555-9031', 
        weight: '8,500 lbs', 
        status: 'Delivered', 
        eta: 'Arrived', 
        cost: '$2,400.00',
        customerName: 'Seattle Metalworks',
        customerEmail: 'steel@seattlemetal.com',
        customerPhone: '555-9031',
        customerRef: 'MW-7402',
        pickupAddress: 'Seattle Metalworks Dock #4',
        pickupDate: '2026-06-17T06:00',
        pickupContact: 'Robert Patrick',
        pickupNotes: 'Requires overweight permits.',
        deliveryAddress: 'Portland Metal Distributors, Dock #2',
        deliveryDate: '2026-06-18T14:00',
        deliveryContact: 'Michael Douglas',
        deliveryNotes: 'Forklift operator on standby.',
        stops: [],
        vehicle: 'CA-CARRI7',
        notes: ['Requires flatbed trailer CA-77', 'Overweight permit required'],
        documents: [
          { name: 'Bill of Lading.pdf', type: 'PDF', date: '06/17/2026', url: '#' },
          { name: 'Proof of Delivery (POD).jpg', type: 'Image', date: '06/18/2026', url: '#' }
        ],
        statusHistory: [
          { status: 'Draft', time: '4 days ago', note: 'Coil cargo specs matched' },
          { status: 'Planned', time: '3 days ago', note: 'Assigned vehicle NY-VAN023' },
          { status: 'Assigned', time: '3 days ago', note: 'Assigned to driver Donald S.' },
          { status: 'In Transit', time: '2 days ago', note: 'In transit to Portland' },
          { status: 'Delivered', time: '1 day ago', note: 'Offloaded at Portland dock door #4' }
        ],
        activities: [
          { message: 'Signed POD uploaded', user: 'Donald S. (Driver)', time: '1 day ago' },
          { message: 'Offloaded complete', user: 'Warehouse Attendant', time: '1 day ago' }
        ]
      },
      { 
        id: 4, 
        loadId: 'LD-7712', 
        cargo: 'Cotton Reels', 
        route: 'New York NY ➔ Boston MA', 
        driver: 'Marcus A.', 
        contact: '555-2248', 
        weight: '18,000 lbs', 
        status: 'Draft', 
        eta: 'Unassigned', 
        cost: '$1,800.00',
        customerName: 'East Coast Textiles',
        customerEmail: 'textiles@eastcoast.com',
        customerPhone: '555-2248',
        customerRef: 'TX-2022',
        pickupAddress: 'East Coast Textiles Terminal',
        pickupDate: '2026-06-22T08:00',
        pickupContact: 'Danielle Brooks',
        pickupNotes: 'Verify moisture content.',
        deliveryAddress: 'Boston Fabric House, Boston MA',
        deliveryDate: '2026-06-23T12:00',
        deliveryContact: 'Gregory Peck',
        deliveryNotes: 'Check dimensions at pickup',
        stops: [],
        vehicle: 'NY-VAN023',
        notes: ['Check dimensions at pickup'],
        documents: [],
        statusHistory: [
          { status: 'Draft', time: '2 hours ago', note: 'Initial load entry saved as draft' }
        ],
        activities: [
          { message: 'Load saved as draft', user: 'Sales Rep', time: '2 hours ago' }
        ]
      }
    ],
    inventory: [
      { id: 1, sku: 'PLT-COMP-42', desc: 'Electronic Components', qty: '42 Pallets', bay: 'Bay A', status: 'Docked' },
      { id: 2, sku: 'PLT-AUTO-19', desc: 'Engine Gaskets', qty: '12 Pallets', bay: 'Bay B', status: 'Active' },
      { id: 3, sku: 'PLT-FOOD-90', desc: 'Organic Flour bags', qty: '80 Pallets', bay: 'Bay A', status: 'Docked' },
      { id: 4, sku: 'PLT-TEXT-05', desc: 'Industrial Cotton rolls', qty: '24 Pallets', bay: 'Bay C', status: 'Pending' }
    ],
    ledgers: [
      { id: 1, type: 'Invoice', payee: 'Global Retail Corp', amount: '$4,290.00', date: '2026-06-18', status: 'Paid', items: [{ name: 'Regional Carrier freight', qty: 1, rate: 4290 }], approvalNotes: '' },
      { id: 2, type: 'Driver Pay', payee: 'Donald S. (Driver)', amount: '$1,420.00', date: '2026-06-19', status: 'Pending', items: [{ name: 'LD-4809 Dispatch run payout', qty: 1, rate: 1420 }], approvalNotes: 'Awaiting toll receipt audits.' },
      { id: 3, type: 'Invoice', payee: 'Memphis Shippers Inc', amount: '$8,500.00', date: '2026-06-15', status: 'Paid', items: [{ name: 'Interstate Flatbed Freight run', qty: 1, rate: 8500 }], approvalNotes: '' },
      { id: 4, type: 'Factoring', payee: 'Apex Invoice Finance', amount: '$12,400.00', date: '2026-06-17', status: 'Active', items: [{ name: 'Pre-factoring bundle allocation', qty: 1, rate: 12400 }], approvalNotes: '' },
      { id: 5, type: 'Driver Pay', payee: 'Sarah R. (Driver)', amount: '$1,890.00', date: '2026-06-19', status: 'Pending', items: [{ name: 'LD-1102 Dispatch run payout', qty: 1, rate: 1890 }], approvalNotes: '' }
    ],
    notifications: [
      { id: 1, category: 'Dispatch', priority: 'Critical', title: 'Route Delay Warning', message: 'Truck TX-ROAD88 ETA threshold breached on route to Dallas.', time: '10 min ago', isRead: false },
      { id: 2, category: 'Dispatch', priority: 'High', title: 'POD Signature Uploaded', message: 'Donald S. submitted digital signature signoff for load #LD-9411.', time: '35 min ago', isRead: true },
      { id: 3, category: 'System', priority: 'Info', title: 'New Lead Created', message: 'Sales CRM lead Vance Refrigeration registered trial.', time: '2 hours ago', isRead: false }
    ],
    drivers: [
      { 
        id: 1, 
        name: 'John D.', 
        email: 'john@hero.com', 
        plate: 'TX-ROAD88', 
        rating: '4.95', 
        status: 'Active',
        contact: '555-0192',
        license: { number: 'DL-TX88291', state: 'TX', expires: '2026-07-15', status: 'Soon to Expire' },
        medicalCard: { expires: '2026-09-30', status: 'Valid' },
        hazmatCert: { expires: '2026-06-25', status: 'Soon to Expire' },
        trainingRecords: [
          { course: 'HAZMAT Cargo Handling', date: '2026-01-12', score: '95%' },
          { course: 'ELD Compliance Course', date: '2026-03-05', score: '100%' }
        ],
        complianceRecords: { eldViolations: 0, drugScreenClear: true, backgroundCheckDate: '2026-01-10' },
        safetyTrend: [98, 99, 95, 96, 100, 99],
        totalDeliveries: 142,
        onTimeRate: '98.5%'
      },
      { 
        id: 2, 
        name: 'Sarah R.', 
        email: 'sarah@hero.com', 
        plate: 'IL-HAUL42', 
        rating: '4.98', 
        status: 'Active',
        contact: '555-8841',
        license: { number: 'DL-IL40212', state: 'IL', expires: '2026-10-18', status: 'Valid' },
        medicalCard: { expires: '2026-12-15', status: 'Valid' },
        hazmatCert: { expires: '2026-11-20', status: 'Valid' },
        trainingRecords: [
          { course: 'Defensive Driving Certification', date: '2026-02-18', score: '98%' }
        ],
        complianceRecords: { eldViolations: 1, drugScreenClear: true, backgroundCheckDate: '2026-02-12' },
        safetyTrend: [99, 97, 98, 99, 98, 100],
        totalDeliveries: 89,
        onTimeRate: '99.1%'
      },
      { 
        id: 3, 
        name: 'Donald S.', 
        email: 'donald@hero.com', 
        plate: 'CA-CARRI7', 
        rating: '4.88', 
        status: 'Active',
        contact: '555-9031',
        license: { number: 'DL-CA09223', state: 'CA', expires: '2026-06-22', status: 'Soon to Expire' },
        medicalCard: { expires: '2026-07-10', status: 'Soon to Expire' },
        hazmatCert: { expires: '2026-08-01', status: 'Valid' },
        trainingRecords: [],
        complianceRecords: { eldViolations: 0, drugScreenClear: true, backgroundCheckDate: '2026-03-01' },
        safetyTrend: [95, 96, 94, 98, 95, 97],
        totalDeliveries: 231,
        onTimeRate: '96.8%'
      }
    ],
    trailers: [
      { id: 1, plate: 'TR-4022', type: 'Dry Van', status: 'Available', spot: 'Lane-1' },
      { id: 2, plate: 'TR-9118', type: 'Reefer (Cold)', status: 'Spotted', spot: 'Lane-2' },
      { id: 3, plate: 'TR-7422', type: 'Flatbed', status: 'Available', spot: 'Lane-3' }
    ],
    leaves: [
      { id: 1, employee: 'John D. (Driver)', start: '06/25/2026', end: '06/28/2026', type: 'Sick Leave', status: 'Pending' },
      { id: 2, employee: 'Sarah R. (Driver)', start: '07/02/2026', end: '07/05/2026', type: 'Vacation', status: 'Approved' }
    ],
    assets: [
      { id: 1, name: 'Forklift TR-01', type: 'Warehouse Crane', serial: 'SN-4029112', status: 'Active' },
      { id: 2, name: 'Zebra TC57 Scanner', type: 'Barcode Scan Terminal', serial: 'SN-9102381', status: 'Active' },
      { id: 3, name: 'Detroit diesel generator', type: 'Back-up Power Unit', serial: 'SN-1022384', status: 'Maintenance' }
    ],
    warehouseLanes: [
      { id: 'Lane-1', description: 'Inbound Unloading Dock', spotCapacity: '1 Trailer limit', activeTrailer: 'TR-9410' },
      { id: 'Lane-2', description: 'Holding Yard area', spotCapacity: '4 Trailers limit', activeTrailer: 'TR-1102' },
      { id: 'Lane-3', description: 'Cross-Dock Gate 4', spotCapacity: '1 Trailer limit', activeTrailer: 'TR-4809' }
    ],
    inboundQueue: [
      { id: 'INB-102', carrier: 'Falcon Logistics', cargo: 'Electric Engine parts', lane: 'Lane 2', status: 'Awaiting Offload' },
      { id: 'INB-103', carrier: 'Swift Cargo Express', cargo: 'Retail Groceries', lane: 'Lane 5', status: 'Unloading' }
    ],
    outboundQueue: [
      { id: 'OUT-401', carrier: 'Apex Carrier', cargo: 'Automotive Pallets', lane: 'Lane A1', status: 'Ready for Loading' },
      { id: 'OUT-402', carrier: 'Global Freight', cargo: 'Bulk Reels Cotton', lane: 'Lane C3', status: 'Scheduled' }
    ],
    chats: [
      { id: 1, sender: 'John D. (Driver)', msg: 'Toll plaza passed on I-35 TX. ETA on target.', time: '10 min ago' },
      { id: 2, sender: 'Sarah R. (Driver)', msg: 'Straps checked. Cargo secured. Departing terminal.', time: '35 min ago' },
      { id: 3, sender: 'System Node', msg: 'Dispatch Load LD-9411 geofence breached Dallas.', time: '2 hours ago' }
    ],
    supportTickets: [
      { id: 1, tenantName: 'Falcon Logistics LLC', title: 'Invoice Factoring Delay', msg: 'Cannot sync payroll with factoring payment rules.', status: 'Open', category: 'Accounts', priority: 'High', replies: [{ sender: 'Alexander Wright', msg: 'Checking billing logs.', date: '1 day ago' }] },
      { id: 2, tenantName: 'Swift Cargo Express', title: 'GPS Geofencing Issues', msg: 'Carrier coordinates not updating on interstate tracking map.', status: 'Open', category: 'Dispatch', priority: 'Medium', replies: [] }
    ]
  };

  // Read or Initialize Mock DB from local storage
  let mockDb = {};
  try {
    const storedDb = localStorage.getItem(LOCAL_STORAGE_DB_KEY);
    if (storedDb) {
      mockDb = JSON.parse(storedDb);
      // Fallback keys check if database template updated
      Object.keys(defaultDb).forEach(key => {
        if (!mockDb[key]) {
          mockDb[key] = defaultDb[key];
        }
      });
    } else {
      mockDb = defaultDb;
      localStorage.setItem(LOCAL_STORAGE_DB_KEY, JSON.stringify(mockDb));
    }
  } catch (e) {
    mockDb = defaultDb;
  }

  const saveDb = () => {
    try {
      localStorage.setItem(LOCAL_STORAGE_DB_KEY, JSON.stringify(mockDb));
    } catch (e) {
      console.error('Failed to save persistent mock database', e);
    }
  };

  // Custom Axios Adapter representing the Mock Laravel API Server
  apiClient.defaults.adapter = function (config) {
    return new Promise((resolve, reject) => {
      const url = config.url.replace(config.baseURL, '').replace(/^\/+/, '');
      const method = config.method.toUpperCase();
      let body = {};
      try {
        body = JSON.parse(config.data || '{}');
      } catch (e) {}

      // Latency simulation
      setTimeout(() => {
        
        // --- AUTH CONTROLLERS ---
        if (url === 'auth/login' && method === 'POST') {
          return resolve({
            status: 200,
            data: {
              token: 'mock-jwt-token-' + Date.now(),
              email: body.email,
              role: body.role || 'Company Admin',
              name: body.email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
              company: 'Apex Cargo Solutions LLC',
              joinedAt: new Date().toLocaleDateString()
            }
          });
        }

        if (url === 'auth/register' && method === 'POST') {
          return resolve({
            status: 201,
            data: {
              token: 'mock-jwt-token-' + Date.now(),
              email: body.email,
              role: 'Company Admin',
              name: body.fullName,
              company: body.companyName,
              joinedAt: new Date().toLocaleDateString()
            }
          });
        }

        if (url === 'auth/logout' && method === 'POST') {
          return resolve({ status: 200, data: { success: true } });
        }

        // --- DASHBOARDS DATA ---
        if (url.startsWith('dashboard/') && method === 'GET') {
          const role = url.split('/')[1];
          if (role === 'super-admin') {
            return resolve({
              status: 200,
              data: { tenants: mockDb.tenants, mrr: 42910, load: '14.2%', sla: '99.98%' }
            });
          }
          if (role === 'sales') {
            return resolve({
              status: 200,
              data: { leads: mockDb.leads, conversions: '14.8%', demos: 12, activeTrials: 8 }
            });
          }
          if (role === 'company') {
            return resolve({
              status: 200,
              data: { fleet: mockDb.fleet, branches: mockDb.branches.length, staff: mockDb.drivers.length + 4, customers: 14 }
            });
          }
          if (role === 'dispatch') {
            const drafts = mockDb.loads.filter(l => l.status === 'Draft').length;
            const transits = mockDb.loads.filter(l => l.status === 'In Transit').length;
            return resolve({
              status: 200,
              data: { 
                loads: mockDb.loads, 
                unassigned: drafts, 
                drivers: mockDb.drivers.length, 
                delays: mockDb.loads.filter(l => l.status === 'Delayed').length 
              }
            });
          }
          if (role === 'warehouse') {
            return resolve({
              status: 200,
              data: { inventory: mockDb.inventory, occupancy: '78%', scans: '142 Items', crossDock: '3 Trucks' }
            });
          }
          if (role === 'accounts') {
            const factoringAmt = mockDb.ledgers.filter(l => l.type === 'Factoring').reduce((acc, current) => acc + parseFloat(current.amount.replace(/[^0-9.]/g, '') || 0), 0);
            return resolve({
              status: 200,
              data: { ledgers: mockDb.ledgers, factoring: factoringAmt, payrollCount: mockDb.ledgers.filter(l => l.type === 'Driver Pay').length, balanceDue: 8500 }
            });
          }
        }

        // --- GLOBAL SEARCH ---
        if (url.startsWith('search') && method === 'GET') {
          const q = (config.params?.q || '').toLowerCase();
          const results = [];
          
          mockDb.fleet.forEach(v => {
            if (v.plate.toLowerCase().includes(q) || v.type.toLowerCase().includes(q)) {
              results.push({ type: 'Vehicle', title: v.plate, desc: `${v.type} • ${v.branch}` });
            }
          });

          mockDb.loads.forEach(l => {
            if (l.loadId.toLowerCase().includes(q) || l.route.toLowerCase().includes(q) || l.driver.toLowerCase().includes(q)) {
              results.push({ type: 'Load', title: l.loadId, desc: `${l.route} • Driver: ${l.driver}` });
            }
          });

          return resolve({ status: 200, data: { results } });
        }

        // --- NOTIFICATIONS SYSTEM ---
        if (url === 'notifications' && method === 'GET') {
          return resolve({ status: 200, data: { notifications: mockDb.notifications } });
        }
        if (url === 'notifications/read' && method === 'POST') {
          mockDb.notifications = mockDb.notifications.map(n => ({ ...n, isRead: true }));
          saveDb();
          return resolve({ status: 200, data: { success: true, notifications: mockDb.notifications } });
        }
        if (url === 'notifications/clear' && method === 'POST') {
          mockDb.notifications = [];
          saveDb();
          return resolve({ status: 200, data: { success: true, notifications: [] } });
        }

        // --- DYNAMIC DATA UPDATES (CRUD REST) ---
        // FLEET
        if (url === 'fleet' && method === 'GET') {
          return resolve({ status: 200, data: mockDb.fleet });
        }
        if (url === 'fleet' && method === 'POST') {
          const newV = { 
            id: Date.now(), 
            plate: body.plate, 
            type: body.type, 
            capacity: body.capacity || '40,000 lbs', 
            branch: 'Chicago HQ Terminal', 
            status: 'Active',
            mileage: '10,000 miles',
            efficiency: '7.2 mpg',
            maintenanceHistory: [],
            serviceSchedule: [],
            registration: { state: 'TX', expires: '2027-01-01', number: 'REG-NEW', status: 'Active' },
            insurance: { policy: 'POL-NEW', expires: '2027-01-01', provider: 'General Mutual', coverage: '$1,000,000' },
            inspections: []
          };
          mockDb.fleet.unshift(newV);
          saveDb();
          return resolve({ status: 201, data: newV });
        }
        if (url.startsWith('fleet/') && method === 'PUT') {
          const id = parseInt(url.split('/')[1]);
          const vehicleIdx = mockDb.fleet.findIndex(v => v.id === id);
          if (vehicleIdx !== -1) {
            mockDb.fleet[vehicleIdx] = { ...mockDb.fleet[vehicleIdx], ...body };
            saveDb();
            return resolve({ status: 200, data: mockDb.fleet[vehicleIdx] });
          }
          return reject({ status: 404, data: { message: 'Vehicle not found' } });
        }
        if (url.startsWith('fleet/') && method === 'DELETE') {
          const id = parseInt(url.split('/')[1]);
          mockDb.fleet = mockDb.fleet.filter(v => v.id !== id);
          saveDb();
          return resolve({ status: 200, data: { success: true } });
        }

        // DRIVERS
        if (url === 'drivers' && method === 'GET') {
          return resolve({ status: 200, data: { drivers: mockDb.drivers } });
        }
        if (url === 'drivers' && method === 'POST') {
          const newD = { 
            id: Date.now(), 
            name: body.name, 
            email: body.email, 
            plate: body.plate || 'Unassigned', 
            rating: '5.00', 
            status: 'Active',
            contact: body.phone || '555-0100',
            license: { number: body.licenseNumber || 'DL-NEW', state: 'TX', expires: body.licenseExpiry || '2027-01-01', status: 'Valid' },
            medicalCard: { expires: '2027-01-01', status: 'Valid' },
            hazmatCert: { expires: '2027-01-01', status: 'Valid' },
            trainingRecords: [],
            complianceRecords: { eldViolations: 0, drugScreenClear: true, backgroundCheckDate: new Date().toLocaleDateString() },
            safetyTrend: [100, 100, 100],
            totalDeliveries: 0,
            onTimeRate: '100%'
          };
          mockDb.drivers.unshift(newD);
          saveDb();
          return resolve({ status: 201, data: newD });
        }
        if (url.startsWith('drivers/') && method === 'PUT') {
          const id = parseInt(url.split('/')[1]);
          const driverIdx = mockDb.drivers.findIndex(d => d.id === id);
          if (driverIdx !== -1) {
            mockDb.drivers[driverIdx] = { ...mockDb.drivers[driverIdx], ...body };
            saveDb();
            return resolve({ status: 200, data: mockDb.drivers[driverIdx] });
          }
          return reject({ status: 404, data: { message: 'Driver not found' } });
        }
        if (url.startsWith('drivers/') && method === 'DELETE') {
          const id = parseInt(url.split('/')[1]);
          mockDb.drivers = mockDb.drivers.filter(d => d.id !== id);
          saveDb();
          return resolve({ status: 200, data: { success: true } });
        }

        // LOADS
        if (url === 'loads' && method === 'GET') {
          return resolve({ status: 200, data: mockDb.loads });
        }
        if (url === 'loads' && method === 'POST') {
          const newL = { 
            id: Date.now(), 
            loadId: `LD-${Math.floor(1000+Math.random()*9000)}`, 
            cargo: body.cargo, 
            route: body.route || `${body.pickupAddress || 'Origin'} ➔ ${body.deliveryAddress || 'Destination'}`, 
            driver: body.driver || 'John D.', 
            contact: '555-0019', 
            weight: body.weight || '38,000 lbs', 
            status: body.status || 'Draft', 
            eta: 'Calculating', 
            cost: body.cost || '$1,200.00',
            customerName: body.customerName || 'Standard Customer',
            customerEmail: body.customerEmail || 'cust@company.com',
            customerPhone: body.customerPhone || '555-0100',
            customerRef: body.customerRef || 'REF-001',
            pickupAddress: body.pickupAddress || 'Chicago HQ Terminal',
            pickupDate: body.pickupDate || '2026-06-20T08:00',
            pickupContact: body.pickupContact || 'Terminal Staff',
            pickupNotes: body.pickupNotes || '',
            deliveryAddress: body.deliveryAddress || 'Dallas Depot',
            deliveryDate: body.deliveryDate || '2026-06-22T17:00',
            deliveryContact: body.deliveryContact || 'Dock Staff',
            deliveryNotes: body.deliveryNotes || '',
            stops: body.stops || [],
            vehicle: body.vehicle || 'TX-ROAD88',
            notes: body.notes || [],
            documents: body.documents || [],
            statusHistory: [{ status: body.status || 'Draft', time: 'Just now', note: 'Load created' }],
            activities: [{ message: 'Load initialized in system', user: 'Dispatch Ops', time: 'Just now' }]
          };
          mockDb.loads.unshift(newL);
          saveDb();
          return resolve({ status: 201, data: newL });
        }

        if (url.startsWith('loads/') && method === 'PUT') {
          const id = parseInt(url.split('/')[1]);
          const loadIndex = mockDb.loads.findIndex(l => l.id === id);
          if (loadIndex !== -1) {
            const oldLoad = mockDb.loads[loadIndex];
            const updated = { ...oldLoad, ...body };
            
            // Log status change
            if (body.status && body.status !== oldLoad.status) {
              updated.statusHistory = [
                ...(oldLoad.statusHistory || []),
                { status: body.status, time: 'Just now', note: body.statusNote || `Status transitioned to ${body.status}` }
              ];
              updated.activities = [
                { message: `Load status changed from ${oldLoad.status} to ${body.status}`, user: 'System Adapter', time: 'Just now' },
                ...(oldLoad.activities || [])
              ];
            } else if (body.statusNote) {
              updated.activities = [
                { message: body.statusNote, user: 'Dispatch Ops', time: 'Just now' },
                ...(oldLoad.activities || [])
              ];
            }
            mockDb.loads[loadIndex] = updated;
            saveDb();
            return resolve({ status: 200, data: updated });
          }
          return reject({ status: 404, data: { message: 'Load not found' } });
        }
        if (url.startsWith('loads/') && method === 'DELETE') {
          const id = parseInt(url.split('/')[1]);
          mockDb.loads = mockDb.loads.filter(l => l.id !== id);
          saveDb();
          return resolve({ status: 200, data: { success: true } });
        }

        // LEADS (CRM)
        if (url === 'leads' && method === 'POST') {
          const newLead = {
            id: Date.now(),
            name: body.name,
            company: body.company,
            email: body.email,
            phone: body.phone,
            status: body.status || 'Pending',
            msg: body.msg || '',
            rate: body.rate || 1000,
            source: body.source || 'Direct',
            stage: body.stage || 'Prospect'
          };
          mockDb.leads.unshift(newLead);
          saveDb();
          return resolve({ status: 201, data: newLead });
        }
        if (url.startsWith('leads/') && method === 'PUT') {
          const id = parseInt(url.split('/')[1]);
          const idx = mockDb.leads.findIndex(l => l.id === id);
          if (idx !== -1) {
            mockDb.leads[idx] = { ...mockDb.leads[idx], ...body };
            saveDb();
            return resolve({ status: 200, data: mockDb.leads[idx] });
          }
        }

        // INVENTORY
        if (url === 'inventory' && method === 'POST') {
          const newI = { id: Date.now(), sku: body.sku, desc: body.desc || 'General Dry Cargo Pallets', qty: `${body.qty} Pallets`, bay: body.bay, status: 'Docked' };
          mockDb.inventory.unshift(newI);
          saveDb();
          return resolve({ status: 201, data: newI });
        }
        if (url.startsWith('inventory/') && method === 'PUT') {
          const id = parseInt(url.split('/')[1]);
          const invIdx = mockDb.inventory.findIndex(i => i.id === id);
          if (invIdx !== -1) {
            const oldItem = mockDb.inventory[invIdx];
            const updatedItem = { ...oldItem, ...body };
            if (body.bay && body.bay !== oldItem.bay) {
              if (!mockDb.inventoryMovements) {
                mockDb.inventoryMovements = [
                  { id: 1, sku: 'PLT-COMP-42', fromBay: 'Bay B', toBay: 'Bay A', worker: 'Jack Ryan', time: '10 mins ago' },
                  { id: 2, sku: 'PLT-AUTO-19', fromBay: 'Bay A', toBay: 'Bay B', worker: 'Tom Hardy', time: '1 hour ago' }
                ];
              }
              mockDb.inventoryMovements.unshift({
                id: Date.now(),
                sku: oldItem.sku,
                fromBay: oldItem.bay,
                toBay: body.bay,
                worker: 'Warehouse Manager',
                time: 'Just now'
              });
            }
            mockDb.inventory[invIdx] = updatedItem;
            saveDb();
            return resolve({ status: 200, data: updatedItem });
          }
        }
        if (url === 'inventory/movements' && method === 'GET') {
          if (!mockDb.inventoryMovements) {
            mockDb.inventoryMovements = [
              { id: 1, sku: 'PLT-COMP-42', fromBay: 'Bay B', toBay: 'Bay A', worker: 'Jack Ryan', time: '10 mins ago' },
              { id: 2, sku: 'PLT-AUTO-19', fromBay: 'Bay A', toBay: 'Bay B', worker: 'Tom Hardy', time: '1 hour ago' }
            ];
            saveDb();
          }
          return resolve({ status: 200, data: mockDb.inventoryMovements });
        }
        if (url === 'assets' && method === 'GET') {
          return resolve({ status: 200, data: mockDb.assets || [] });
        }

        // LEDGERS & FINANCE
        if (url === 'ledgers' && method === 'POST') {
          const newB = { 
            id: Date.now(), 
            type: body.type, 
            payee: body.payee, 
            amount: body.amount.startsWith('$') ? body.amount : `$${parseFloat(body.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 
            date: body.date || new Date().toISOString().split('T')[0], 
            status: body.status || 'Pending',
            items: body.items || [{ name: 'Invoice Fee', qty: 1, rate: parseFloat(body.amount) }],
            approvalNotes: body.approvalNotes || ''
          };
          mockDb.ledgers.unshift(newB);
          saveDb();
          return resolve({ status: 201, data: newB });
        }
        if (url.startsWith('ledgers/') && method === 'PUT') {
          const id = parseInt(url.split('/')[1]);
          const ledgerIdx = mockDb.ledgers.findIndex(l => l.id === id);
          if (ledgerIdx !== -1) {
            mockDb.ledgers[ledgerIdx] = { ...mockDb.ledgers[ledgerIdx], ...body };
            saveDb();
            return resolve({ status: 200, data: mockDb.ledgers[ledgerIdx] });
          }
        }

        // SUPPORT TICKETS
        if (url === 'support/tickets' && method === 'GET') {
          return resolve({ status: 200, data: mockDb.supportTickets });
        }
        if (url === 'support/tickets' && method === 'POST') {
          const newTicket = {
            id: Date.now(),
            tenantName: body.tenantName || 'Apex Logistics LLC',
            title: body.title,
            msg: body.msg,
            status: 'Open',
            category: body.category || 'General',
            priority: body.priority || 'Low',
            replies: []
          };
          mockDb.supportTickets.unshift(newTicket);
          saveDb();
          return resolve({ status: 201, data: newTicket });
        }
        if (url.startsWith('support/tickets/') && url.endsWith('/reply') && method === 'POST') {
          const id = parseInt(url.split('/')[2]);
          const ticketIdx = mockDb.supportTickets.findIndex(t => t.id === id);
          if (ticketIdx !== -1) {
            mockDb.supportTickets[ticketIdx].replies.push({
              sender: body.sender || 'Staff',
              msg: body.msg,
              date: 'Just now'
            });
            saveDb();
            return resolve({ status: 200, data: mockDb.supportTickets[ticketIdx] });
          }
        }

        // YARD AND WAREHOUSE LANES
        if (url === 'warehouse/lanes' && method === 'GET') {
          return resolve({ status: 200, data: mockDb.warehouseLanes });
        }
        if (url === 'warehouse/lanes' && method === 'PUT') {
          mockDb.warehouseLanes = body.lanes;
          saveDb();
          return resolve({ status: 200, data: mockDb.warehouseLanes });
        }

        if (url === 'tenants' && method === 'POST') {
          const newT = { id: Date.now(), name: body.name, plan: body.plan, status: 'Active', drivers: 0, joined: new Date().toLocaleDateString() };
          mockDb.tenants.unshift(newT);
          saveDb();
          return resolve({ status: 201, data: newT });
        }

        if (url === 'upload' && method === 'POST') {
          return resolve({ status: 200, data: { url: 'https://hero-mock-storage.s3.amazonaws.com/uploads/' + Date.now() + '.pdf' } });
        }

        // Catch-all response
        return resolve({ status: 200, data: { message: 'Mock endpoint resolved.' } });

      }, 400); // 400ms simulated latency
    });
  };
}

export default apiClient;
