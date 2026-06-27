// ============================================================================
// SHARED CRM STORE & EVENT BUS
// ============================================================================
const DB_KEY = 'hero_mock_db';

// Simple pub-sub event bus
const listeners = new Set();

const publish = () => {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error in CRM Store subscriber callback', e);
    }
  });
};

// Listen to storage mutations from other tabs/processes
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === DB_KEY) {
      publish();
    }
  });
  window.addEventListener('hero-crm-db-updated', () => {
    publish();
  });
}

// Normalized Seeder to prepare data structures inside hero_mock_db
const seedNormalizedCrmData = (db) => {
  const reps = ['Alex Wright', 'Sarah K.', 'Michael Scott', 'Jan Levinson', 'Ryan Howard'];
  const niches = ['Car Carrying', 'General Freight', 'Dangerous Goods', 'Refrigerated', 'Flatbed', 'Container'];
  const industries = ['3PL Logistics', 'Cold Chain Food', 'Dry Bulk Ag', 'Intermodal Rail', 'Last Mile Parcel', 'Heavy Haul Steel', 'Liquid Fuel Trans'];
  const softwareList = ['Spreadsheets (Excel)', 'Legacy MS Access', 'Excel & WhatsApp', 'Salesforce (Too Costly)', 'HubSpot Basic', 'None (Paper Logs)'];
  
  const painPointsList = [
    'Manual route sheets take hours',
    'Frequent dispatch miscommunications',
    'Billing factoring delays cashflow',
    'No live mapping for recipients',
    'ELD driver hours audit scares',
    'Fuel tax calculation mistakes'
  ];
  
  const stages = [
    'New Lead', 'Contacted', 'Demo Booked', 'Demo Completed', 
    'Trial Started', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'
  ];

  const companies = [
    'Vance Refrigeration', 'Hudson Logistics Corp', 'Apex Freight Systems', 'Roadrunners 3PL',
    'Blue Sky Cargo', 'Polar Express Cold Chain', 'Dunder Mifflin Logistics', 'Schrute Farms Delivery',
    'Halpert Freight Services', 'Beesly Shipping', 'Scranton Logistics', 'Geller Shipping',
    'Bing Transport', 'Green Last-Mile', 'Buffay Intermodal', 'Tribbiani Flatbed',
    'Heller Logistics', 'Trillium Logistics', 'Swift Transporters', 'Vanguard Logistics',
    'Mercury Logistics', 'Titan Heavy Haul', 'Atlas Intermodal', 'Freight-A-Way',
    'QuickLoad Logistics', 'RedLine Carriers', 'Evergreen Freight', 'Pinnacle Transport',
    'Summit Cold Chain', 'Horizon Logistics', 'Blue Collar Movers', 'CrossCountry Freight',
    'FreightTrain Inc', 'CargoShift 3PL', 'EcoFreight Solutions', 'SafeVoyage Transport',
    'Apex Transports', 'Velocity Transport', 'RapidFire Carriers', 'BigWheel Logports',
    'ExpressWay Cargo', 'Milestone 3PL', 'Voyager Freight', 'Silverback Trucking',
    'SteelWheel Transport', 'DirectRoute Logistics', 'IronHorse Cargo', 'AlphaTrans Logistics',
    'Oceanic Shipping', 'AirWay Express'
  ];

  const contactsPool = [
    { role: 'Owner', name: 'Robert Vance' },
    { role: 'Operations Manager', name: 'Stanley Hudson' },
    { role: 'Accounts Manager', name: 'Phyllis Vance' },
    { role: 'Dispatch Manager', name: 'Oscar Martinez' },
    { role: 'Warehouse Manager', name: 'Jim Halpert' },
    { role: 'Primary Contact', name: 'Dwight Schrute' },
    { role: 'Owner', name: 'Michael Scott' },
    { role: 'Accounts Manager', name: 'Angela Martin' },
    { role: 'Operations Manager', name: 'Kevin Malone' },
    { role: 'Warehouse Manager', name: 'Darryl Philbin' }
  ];

  const leads = [];
  const contacts = [];
  const demos = [];
  const proposals = [];
  const trials = [];
  const tasks = [];
  const documents = [];
  const activities = [];
  const notes = [];
  const timeline = [];
  const auditLogs = [];
  const followups = [];
  const onboarding = [];

  for (let i = 0; i < 50; i++) {
    const leadId = `lead_${100 + i}`;
    const company = companies[i % companies.length];
    const rep = reps[i % reps.length];
    const niche = niches[i % niches.length];
    const industry = industries[i % industries.length];
    const software = softwareList[i % softwareList.length];
    const fleetSize = 12 + (i * 11) % 310;
    const revenue = Math.round(1500 + (fleetSize * 42));
    const score = 42 + (i * 13) % 55;
    const health = 50 + (i * 11) % 48;
    const engagement = 45 + (i * 9) % 52;
    const riskLevel = health > 80 ? 'Low' : (health > 55 ? 'Medium' : 'High');
    const stage = stages[i % stages.length];
    const createdDate = new Date(Date.now() - (i * 2.2) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const lastContact = new Date(Date.now() - (i % 6) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const nextFollowup = new Date(Date.now() + (i % 5 - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const primaryContactInfo = contactsPool[i % contactsPool.length];

    // Seed Leads Table
    leads.push({
      id: leadId,
      company,
      name: primaryContactInfo.name,
      phone: `555-0${100 + i}`,
      email: `${primaryContactInfo.name.toLowerCase().replace(/\s/g, '')}@${company.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      fleetSize,
      niche,
      currentSoftware: software,
      painPoints: painPointsList[i % painPointsList.length],
      score,
      engagementScore: engagement,
      healthScore: health,
      riskLevel,
      stageDays: 3 + (i * 7) % 24,
      priority: score > 75 ? 'High' : (score > 55 ? 'Medium' : 'Low'),
      stage,
      rep,
      revenue,
      createdDate,
      lastContact,
      nextFollowup,
      status: stage === 'Won' ? 'Won' : (stage === 'Lost' ? 'Lost' : 'Active')
    });

    // Seed Contacts Table
    contacts.push({
      id: `con_${100 + i}_1`,
      leadId,
      name: primaryContactInfo.name,
      role: primaryContactInfo.role,
      email: `${primaryContactInfo.name.toLowerCase().replace(/\s/g, '')}@${company.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      phone: `555-0${100 + i}`,
      isPrimary: true
    });
    contacts.push({
      id: `con_${100 + i}_2`,
      leadId,
      name: `Ops Officer ${String.fromCharCode(65 + i)}`,
      role: 'Operations Specialist',
      email: `ops@${company.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      phone: `555-900${i}`,
      isPrimary: false
    });

    // Seed Documents Table
    documents.push({ id: `doc_${100 + i}_1`, leadId, name: 'Company_Profile.pdf', type: 'Company Profile', size: '1.4 MB', date: createdDate });
    documents.push({ id: `doc_${100 + i}_2`, leadId, name: 'Brokerage_Quotation.pdf', type: 'Quotation', size: '840 KB', date: lastContact });

    // Seed Activities Table
    activities.push({ id: `act_${100 + i}_1`, leadId, type: 'Phone Call', date: lastContact, time: '10:00 AM', user: rep, outcome: 'Connected', notes: 'Discussed route scheduling bottlenecks.' });
    activities.push({ id: `act_${100 + i}_2`, leadId, type: 'Email', date: createdDate, time: '09:00 AM', user: rep, outcome: 'Sent', notes: 'Sent initial pricing proposal booklet.' });

    // Seed Tasks Table
    tasks.push({ id: `task_${100 + i}_1`, leadId, title: `Log client requirements on ${niche}`, type: 'Follow-up', dueDate: nextFollowup, status: i % 2 === 0 ? 'Completed' : 'Pending', priority: 'High' });

    // Seed Proposals Table
    if (['Proposal Sent', 'Negotiation', 'Won'].includes(stage)) {
      proposals.push({
        id: `prop_${400 + i}`,
        leadId,
        title: `SaaS License Core Agreement - ${company}`,
        company,
        value: revenue,
        discount: 5,
        tax: 10,
        total: Math.round((revenue * 0.95) * 1.1),
        validity: '30 Days',
        status: stage === 'Won' ? 'Accepted' : 'Sent',
        version: 'V1',
        createdDate,
        features: [
          'Real-Time GPS Telematics',
          'AI Route Optimizer',
          'Factoring & Billing API',
          'Driver Mobile App',
          'ELD Compliance Module',
          'Live Customer Portal',
          'Dispatch Board Pro',
          'Maintenance Scheduler'
        ],
        versionsList: [
          { version: 'V1', value: revenue, discount: 5, total: Math.round((revenue * 0.95) * 1.1), date: createdDate, status: stage === 'Won' ? 'Accepted' : 'Sent' }
        ]
      });
    }

    // Seed Trials Table
    if (['Trial Started', 'Proposal Sent', 'Negotiation', 'Won'].includes(stage)) {
      const daysRemaining = Math.max(0, 14 - (i % 6));
      trials.push({
        id: `trial_${300 + i}`,
        leadId,
        company,
        admin: primaryContactInfo.name,
        startDate: createdDate,
        expiryDate: new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        daysRemaining,
        usage: 10 + (i * 17) % 85,
        activeUsers: 3 + (i * 2) % 11,
        storage: `${(1.0 + (i * 0.4)).toFixed(1)} GB`,
        currentPlan: i % 3 === 0 ? 'Enterprise' : (i % 3 === 1 ? 'Professional' : 'Starter'),
        mostUsedModule: i % 2 === 0 ? 'Live GPS tracking' : 'Factoring Billing API',
        status: daysRemaining > 0 ? 'Active' : 'Expired'
      });
    }

    // Seed Notes Table
    notes.push({
      id: `note_${100 + i}_1`,
      leadId,
      text: `Client looking to automate ${niche} dispatch workflows. Currently using ${software}.`,
      author: rep,
      date: createdDate
    });

    // Seed Timeline Table
    timeline.push({ id: `time_${100 + i}_1`, leadId, date: createdDate, event: 'Lead Created', detail: 'Inbound workspace registration processed.', user: 'System Hub' });

    // Seed Audits Table
    auditLogs.push({ id: `audit_${100 + i}_1`, leadId, user: rep, date: createdDate, time: '09:00 AM', action: 'Lead Assigned', oldValue: 'None', newValue: rep });
  }

  // Scheduled Demos
  const demoLeads = leads.filter(l => ['Demo Booked', 'Demo Completed', 'Trial Started', 'Proposal Sent', 'Negotiation', 'Won'].includes(l.stage)).slice(0, 20);
  demoLeads.forEach((l, i) => {
    const date = new Date(Date.now() + (i - 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const status = i < 7 ? 'Completed' : (i === 7 ? 'Cancelled' : 'Upcoming');
    demos.push({
      id: `demo_${200 + i}`,
      leadId: l.id,
      company: l.company,
      contact: l.name,
      date,
      time: i % 2 === 0 ? '10:30 AM' : '03:00 PM',
      timezone: 'EST',
      presenter: l.rep,
      meetingLink: `https://zoom.us/j/981290312${i}`,
      notes: `Presenter: ${l.rep}. Focus on telematics module.`,
      status
    });
  });

  // Follow-ups agenda (Matches Lead Next Follow-ups)
  leads.forEach((lead, i) => {
    const dueTime = i % 2 === 0 ? '10:00 AM' : '03:30 PM';
    const status = i < 22 ? 'Completed' : (i === 22 ? 'Missed' : 'Pending');
    followups.push({
      id: `followup_${500 + i}`,
      leadId: lead.id,
      company: lead.company,
      contact: lead.name,
      type: i % 4 === 0 ? 'Call' : (i % 4 === 1 ? 'Email' : (i % 4 === 2 ? 'Meeting' : 'Task')),
      priority: i % 3 === 0 ? 'High' : (i % 3 === 1 ? 'Medium' : 'Low'),
      dueDate: lead.nextFollowup,
      dueTime,
      status,
      notes: `Touchpoint checklist regarding pain points: ${lead.painPoints}.`
    });
  });

  // Onboarding handovers
  const onboardingLeads = leads.filter(l => l.stage === 'Won').concat(leads.slice(0, 20));
  onboardingLeads.slice(0, 20).forEach((l, i) => {
    const isCompleted = i < 10;
    onboarding.push({
      id: `onboard_${600 + i}`,
      leadId: l.id,
      company: l.company,
      manager: l.name,
      owner: l.rep,
      dueDate: new Date(Date.now() + (i % 4 + 2) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: isCompleted ? 'Completed' : 'In Progress',
      risk: i % 4 === 0 ? 'High' : (i % 4 === 1 ? 'Medium' : 'Low'),
      pendingDocuments: i % 3 === 0 ? ['Signed SLA Contract', 'Company W-9 Tax File'] : [],
      checklist: [
        { name: 'Company Workspace Provisioned', completed: true },
        { name: 'SaaS Subscription Plan Activated', completed: true },
        { name: 'Company Admin User Registered', completed: true },
        { name: 'Role Permission Policies Assigned', completed: i % 3 !== 0 },
        { name: 'Mock Customer Inbound Data Importer', completed: isCompleted },
        { name: 'Roster & ELD System Training Complete', completed: isCompleted },
        { name: 'Sandbox Production Go-Live Scheduled', completed: isCompleted }
      ]
    });
  });

  // Notifications feed
  const notifications = [
    { id: 'notif_1', type: 'Lead Assigned', message: 'New high-value Lead Apex Transports assigned to Alex Wright.', time: '10 min ago', isRead: false, leadId: 'lead_136' },
    { id: 'notif_2', type: 'Proposal Accepted', message: 'SaaS Contract proposal signed off by Vance Refrigeration.', time: '45 min ago', isRead: false, leadId: 'lead_100' },
    { id: 'notif_3', type: 'Demo Tomorrow', message: 'Reminder: Video Demo call scheduled with Hudson Logistics tomorrow.', time: '2 hours ago', isRead: true, leadId: 'lead_101' },
    { id: 'notif_4', type: 'Trial Expiring', message: 'Sandbox workspace trial for Polar Express expires in 2 days.', time: '4 hours ago', isRead: false, leadId: 'lead_105' }
  ];

  // Write variables back into global DB object
  db.leads = leads;
  db.crmContacts = contacts;
  db.crmDemos = demos;
  db.crmProposals = proposals;
  db.crmTrials = trials;
  db.crmTasks = tasks;
  db.crmDocuments = documents;
  db.crmActivities = activities;
  db.crmNotes = notes;
  db.crmTimeline = timeline;
  db.crmAuditLogs = auditLogs;
  db.crmFollowups = followups;
  db.crmOnboarding = onboarding;
  db.crmNotifications = notifications;
};

// Store Core API Object
export const crmStore = {
  // Read database state directly from localStorage
  getDb: () => {
    let mockDb = {};
    try {
      const stored = localStorage.getItem(DB_KEY);
      if (stored) {
        mockDb = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse database from localStorage', e);
    }
    
    // Auto seed if normalized lists don't exist or are incomplete
    if (!mockDb.leads || mockDb.leads.length <= 4 || !mockDb.crmDemos || mockDb.crmDemos.length === 0) {
      seedNormalizedCrmData(mockDb);
      localStorage.setItem(DB_KEY, JSON.stringify(mockDb));
    } else {
      // Self-healing database sanitizer:
      // Strip nested arrays if they exist to keep the leads table normalized
      let modified = false;
      const nestedFields = ['contacts', 'activities', 'documents', 'tasks', 'proposals', 'notes', 'timeline', 'auditLogs', 'emails', 'calls'];
      
      mockDb.leads = mockDb.leads.map(lead => {
        let cleanedLead = { ...lead };
        nestedFields.forEach(field => {
          if (cleanedLead[field] !== undefined) {
            delete cleanedLead[field];
            modified = true;
          }
        });
        return cleanedLead;
      });

      if (modified) {
        localStorage.setItem(DB_KEY, JSON.stringify(mockDb));
      }

      // Migration: patch proposals missing the features array
      if (mockDb.crmProposals) {
        const defaultFeatures = [
          'Real-Time GPS Telematics',
          'AI Route Optimizer',
          'Factoring & Billing API',
          'Driver Mobile App',
          'ELD Compliance Module',
          'Live Customer Portal',
          'Dispatch Board Pro',
          'Maintenance Scheduler'
        ];
        let proposalsMigrated = false;
        mockDb.crmProposals = mockDb.crmProposals.map(p => {
          if (!p.features) {
            proposalsMigrated = true;
            return { ...p, features: defaultFeatures };
          }
          return p;
        });
        if (proposalsMigrated) {
          localStorage.setItem(DB_KEY, JSON.stringify(mockDb));
        }
      }
    }
    
    return mockDb;
  },

  // Update mockDb state and notify subscribers
  updateDb: (updaterFunc) => {
    const db = crmStore.getDb();
    const result = updaterFunc(db);
    
    // If function returns a new DB object altogether, save it, else save modified parameter
    const updatedDb = result || db;
    
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(updatedDb));
      
      // Dispatch events to reload components
      window.dispatchEvent(new Event('hero-crm-db-updated'));
    } catch (e) {
      console.error('Failed to save updated database to localStorage', e);
    }
    
    publish();
    return updatedDb;
  },

  // Subscribe to changes
  subscribe: (listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }
};
