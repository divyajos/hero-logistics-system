import { crmStore } from './crmStore';

// Unique ID Generator
export const generateId = (prefix) => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

// Denormalize helper to reconstruct lead structures for legacy UI compatibility
export const denormalizeLead = (lead, db) => {
  if (!lead) return null;
  return {
    ...lead,
    revenue: Number(lead.revenue) || 0,
    fleetSize: Number(lead.fleetSize) || 0,
    contacts: (db.crmContacts || []).filter(c => c.leadId === lead.id),
    activities: (db.crmActivities || []).filter(a => a.leadId === lead.id),
    documents: (db.crmDocuments || []).filter(d => d.leadId === lead.id),
    tasks: (db.crmTasks || []).filter(t => t.leadId === lead.id),
    proposals: (db.crmProposals || []).filter(p => p.leadId === lead.id),
    notes: (db.crmNotes || []).filter(n => n.leadId === lead.id),
    timeline: (db.crmTimeline || []).filter(t => t.leadId === lead.id),
    auditLogs: (db.crmAuditLogs || []).filter(a => a.leadId === lead.id),
    emails: (db.crmEmails || []).filter(e => e.leadId === lead.id),
    calls: (db.crmCalls || []).filter(c => c.leadId === lead.id)
  };
};

export const crmRepository = {
  // --- DATABASE ---
  getCrmDatabase: () => {
    const db = crmStore.getDb();
    
    // Ensure compatibility collections exist
    if (!db.crmEmails) db.crmEmails = [];
    if (!db.crmCalls) db.crmCalls = [];
    
    // Build list of denormalized leads
    const denormalizedLeads = db.leads.map(l => denormalizeLead(l, db));
    
    return {
      leads: denormalizedLeads,
      demos: db.crmDemos || [],
      trials: db.crmTrials || [],
      proposals: db.crmProposals || [],
      followups: db.crmFollowups || [],
      onboarding: db.crmOnboarding || [],
      notifications: db.crmNotifications || []
    };
  },

  // --- LEADS ---
  getLeads: () => {
    const db = crmStore.getDb();
    return db.leads.map(l => denormalizeLead(l, db));
  },

  getLeadById: (id) => {
    const db = crmStore.getDb();
    const lead = db.leads.find(l => l.id === id);
    return denormalizeLead(lead, db);
  },

  createLead: (leadData) => {
    crmStore.updateDb((db) => {
      const leadId = generateId('lead');
      const newLead = {
        id: leadId,
        company: leadData.company,
        name: leadData.name,
        phone: leadData.phone || '555-0100',
        email: leadData.email,
        fleetSize: parseInt(leadData.fleetSize) || 10,
        niche: leadData.niche || 'General Freight',
        currentSoftware: leadData.currentSoftware || 'Spreadsheets (Excel)',
        painPoints: leadData.painPoints || '',
        score: leadData.score || 60,
        engagementScore: leadData.engagementScore || 50,
        healthScore: leadData.healthScore || 70,
        riskLevel: leadData.riskLevel || 'Medium',
        stageDays: 0,
        priority: leadData.priority || 'Medium',
        stage: leadData.stage || 'New Lead',
        rep: leadData.rep || 'Alex Wright',
        revenue: parseInt(leadData.revenue) || 1500,
        createdDate: new Date().toISOString().split('T')[0],
        lastContact: new Date().toISOString().split('T')[0],
        nextFollowup: leadData.nextFollowup || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Active',
        tags: leadData.tags || ''
      };

      db.leads.unshift(newLead);

      // Create primary contact
      if (!db.crmContacts) db.crmContacts = [];
      db.crmContacts.push({
        id: generateId('con'),
        leadId,
        name: leadData.name,
        role: 'Primary Contact',
        email: leadData.email,
        phone: leadData.phone || '555-0100',
        isPrimary: true
      });

      // Create initial timeline
      if (!db.crmTimeline) db.crmTimeline = [];
      db.crmTimeline.unshift({
        id: generateId('time'),
        leadId,
        date: new Date().toISOString().split('T')[0],
        event: 'Lead Created',
        detail: leadData.notes || 'Initial lead entry saved.',
        user: 'System Hub'
      });

      // Create initial audit log
      if (!db.crmAuditLogs) db.crmAuditLogs = [];
      db.crmAuditLogs.unshift({
        id: generateId('audit'),
        leadId,
        user: 'System Hub',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: 'Lead Created',
        oldValue: 'None',
        newValue: leadData.rep || 'Alex Wright'
      });
      
      // Auto seed blank compatibility lists
      if (!db.crmEmails) db.crmEmails = [];
      if (!db.crmCalls) db.crmCalls = [];
      if (!db.crmDocuments) db.crmDocuments = [];
      if (!db.crmTasks) db.crmTasks = [];
      if (!db.crmActivities) db.crmActivities = [];
      if (!db.crmNotes) db.crmNotes = [];

      if (leadData.notes) {
        db.crmNotes.unshift({
          id: generateId('note'),
          leadId,
          text: leadData.notes,
          author: leadData.rep || 'Alex Wright',
          date: new Date().toISOString().split('T')[0]
        });
      }
    });
    
    // Return newly created lead
    const freshDb = crmStore.getDb();
    return denormalizeLead(freshDb.leads[0], freshDb);
  },

  updateLead: (leadId, leadData) => {
    crmStore.updateDb((db) => {
      const index = db.leads.findIndex(l => l.id === leadId);
      if (index !== -1) {
        db.leads[index] = {
          ...db.leads[index],
          company: leadData.company,
          name: leadData.name,
          phone: leadData.phone,
          email: leadData.email,
          fleetSize: parseInt(leadData.fleetSize) || 10,
          niche: leadData.niche,
          currentSoftware: leadData.currentSoftware,
          painPoints: leadData.painPoints,
          revenue: parseInt(leadData.revenue) || 1500,
          priority: leadData.priority,
          rep: leadData.rep,
          tags: leadData.tags || ''
        };
      }
    });
  },

  deleteLead: (leadId) => {
    crmStore.updateDb((db) => {
      db.leads = db.leads.filter(l => l.id !== leadId);
      db.crmContacts = (db.crmContacts || []).filter(c => c.leadId !== leadId);
      db.crmDemos = (db.crmDemos || []).filter(d => d.leadId !== leadId);
      db.crmProposals = (db.crmProposals || []).filter(p => p.leadId !== leadId);
      db.crmTrials = (db.crmTrials || []).filter(t => t.leadId !== leadId);
      db.crmTasks = (db.crmTasks || []).filter(t => t.leadId !== leadId);
      db.crmDocuments = (db.crmDocuments || []).filter(d => d.leadId !== leadId);
      db.crmActivities = (db.crmActivities || []).filter(a => a.leadId !== leadId);
      db.crmNotes = (db.crmNotes || []).filter(n => n.leadId !== leadId);
      db.crmTimeline = (db.crmTimeline || []).filter(t => t.leadId !== leadId);
      db.crmAuditLogs = (db.crmAuditLogs || []).filter(a => a.leadId !== leadId);
      db.crmEmails = (db.crmEmails || []).filter(e => e.leadId !== leadId);
      db.crmCalls = (db.crmCalls || []).filter(c => c.leadId !== leadId);
      db.crmFollowups = (db.crmFollowups || []).filter(f => f.leadId !== leadId);
      db.crmOnboarding = (db.crmOnboarding || []).filter(o => o.leadId !== leadId);
    });
  },

  // --- CONTACTS ---
  addContact: (leadId, contact) => {
    crmStore.updateDb((db) => {
      if (!db.crmContacts) db.crmContacts = [];
      
      // If primary check, disable primary on other contacts of this lead
      if (contact.isPrimary) {
        db.crmContacts.forEach(c => {
          if (c.leadId === leadId) c.isPrimary = false;
        });
      }
      
      db.crmContacts.push({
        id: generateId('con'),
        leadId,
        name: contact.name,
        role: contact.role,
        email: contact.email,
        phone: contact.phone,
        isPrimary: !!contact.isPrimary
      });
    });
  },

  updateContact: (contactId, contact) => {
    crmStore.updateDb((db) => {
      const index = db.crmContacts.findIndex(c => c.id === contactId);
      if (index !== -1) {
        const leadId = db.crmContacts[index].leadId;
        
        if (contact.isPrimary) {
          db.crmContacts.forEach(c => {
            if (c.leadId === leadId) c.isPrimary = false;
          });
        }
        
        db.crmContacts[index] = {
          ...db.crmContacts[index],
          name: contact.name,
          role: contact.role,
          email: contact.email,
          phone: contact.phone,
          isPrimary: !!contact.isPrimary
        };
      }
    });
  },

  deleteContact: (contactId) => {
    crmStore.updateDb((db) => {
      db.crmContacts = (db.crmContacts || []).filter(c => c.id !== contactId);
    });
  },

  // --- TASKS ---
  createTask: (leadId, task) => {
    crmStore.updateDb((db) => {
      if (!db.crmTasks) db.crmTasks = [];
      db.crmTasks.unshift({
        id: generateId('task'),
        leadId,
        title: task.title,
        type: task.type || 'Follow-up',
        dueDate: task.dueDate,
        status: 'Pending',
        priority: task.priority || 'Medium'
      });
    });
  },

  toggleTask: (taskId) => {
    crmStore.updateDb((db) => {
      const index = db.crmTasks.findIndex(t => t.id === taskId);
      if (index !== -1) {
        db.crmTasks[index].status = db.crmTasks[index].status === 'Completed' ? 'Pending' : 'Completed';
      }
    });
  },

  deleteTask: (taskId) => {
    crmStore.updateDb((db) => {
      db.crmTasks = (db.crmTasks || []).filter(t => t.id !== taskId);
    });
  },

  // --- DOCUMENTS ---
  uploadDocument: (leadId, doc) => {
    crmStore.updateDb((db) => {
      if (!db.crmDocuments) db.crmDocuments = [];
      db.crmDocuments.unshift({
        id: generateId('doc'),
        leadId,
        name: doc.name,
        type: doc.type || 'SLA Contract',
        size: doc.size || '1.2 MB',
        date: new Date().toISOString().split('T')[0]
      });
    });
  },

  deleteDocument: (docId) => {
    crmStore.updateDb((db) => {
      db.crmDocuments = (db.crmDocuments || []).filter(d => d.id !== docId);
    });
  },

  // --- DEMOS ---
  scheduleDemo: (leadId, demo) => {
    crmStore.updateDb((db) => {
      if (!db.crmDemos) db.crmDemos = [];
      
      const lead = db.leads.find(l => l.id === leadId);
      const company = lead ? lead.company : 'Unknown';
      const contact = lead ? lead.name : 'Unknown';

      const newDemo = {
        id: generateId('demo'),
        leadId,
        company,
        contact,
        date: demo.date,
        time: demo.time,
        timezone: 'EST',
        presenter: demo.presenter || 'Alex Wright',
        meetingLink: demo.meetingLink || 'https://zoom.us/j/9812903100',
        notes: demo.notes || 'Scheduled',
        status: 'Upcoming'
      };

      db.crmDemos.unshift(newDemo);

      // Move lead stage to Demo Booked
      if (lead) {
        lead.stage = 'Demo Booked';
        lead.lastContact = new Date().toISOString().split('T')[0];
      }
    });
  },

  updateDemo: (demoId, demoData) => {
    crmStore.updateDb((db) => {
      const index = db.crmDemos.findIndex(d => d.id === demoId);
      if (index !== -1) {
        db.crmDemos[index] = {
          ...db.crmDemos[index],
          ...demoData
        };
      }
    });
  },

  completeDemo: (demoId) => {
    crmStore.updateDb((db) => {
      const demo = db.crmDemos.find(d => d.id === demoId);
      if (demo) {
        demo.status = 'Completed';
        const lead = db.leads.find(l => l.id === demo.leadId);
        if (lead) {
          lead.stage = 'Demo Completed';
          lead.lastContact = new Date().toISOString().split('T')[0];
        }
      }
    });
  },

  // --- PROPOSALS ---
  createProposal: (leadId, prop) => {
    crmStore.updateDb((db) => {
      if (!db.crmProposals) db.crmProposals = [];
      
      const lead = db.leads.find(l => l.id === leadId);
      const company = lead ? lead.company : 'Unknown';

      const newProposal = {
        id: generateId('prop'),
        leadId,
        title: prop.title,
        company,
        value: prop.value,
        discount: prop.discount,
        tax: prop.tax || 10,
        total: prop.total,
        validity: prop.validity || '30 Days',
        features: prop.features || ['Real-Time GPS Telematics', 'AI Route Optimizer'],
        status: 'Sent',
        version: prop.version || 'V1',
        versionsList: prop.versionsList || [
          { version: prop.version || 'V1', value: prop.value, discount: prop.discount, total: prop.total, date: new Date().toISOString().split('T')[0], status: 'Sent' }
        ],
        createdDate: new Date().toISOString().split('T')[0]
      };

      db.crmProposals.unshift(newProposal);

      if (lead) {
        lead.stage = 'Proposal Sent';
        lead.lastContact = new Date().toISOString().split('T')[0];
      }
    });
  },

  updateProposal: (proposalId, proposalData) => {
    crmStore.updateDb((db) => {
      const index = db.crmProposals.findIndex(p => p.id === proposalId);
      if (index !== -1) {
        db.crmProposals[index] = {
          ...db.crmProposals[index],
          ...proposalData
        };
      }
    });
  },

  // --- TRIALS ---
  startTrial: (leadId, trialData = {}) => {
    crmStore.updateDb((db) => {
      if (!db.crmTrials) db.crmTrials = [];
      
      const lead = db.leads.find(l => l.id === leadId);
      if (!lead) return;

      const startDate = new Date().toISOString().split('T')[0];
      const expiryDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const newTrial = {
        id: generateId('trial'),
        leadId,
        company: lead.company,
        admin: lead.name,
        startDate,
        expiryDate,
        daysRemaining: 14,
        usage: 5,
        activeUsers: 1,
        storage: '0.1 GB',
        currentPlan: trialData.plan || 'Professional',
        mostUsedModule: 'Live GPS tracking',
        status: 'Active'
      };

      db.crmTrials.unshift(newTrial);
      lead.stage = 'Trial Started';
      lead.lastContact = startDate;
    });
  },

  extendTrial: (trialId, days) => {
    crmStore.updateDb((db) => {
      const trial = db.crmTrials.find(t => t.id === trialId);
      if (trial) {
        trial.daysRemaining += days;
        trial.expiryDate = new Date(new Date(trial.expiryDate).getTime() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }
    });
  },

  // --- NOTIFICATIONS ---
  getNotifications: () => {
    const db = crmStore.getDb();
    return db.crmNotifications || [];
  },

  markNotificationRead: (id) => {
    crmStore.updateDb((db) => {
      const index = (db.crmNotifications || []).findIndex(n => n.id === id);
      if (index !== -1) {
        db.crmNotifications[index].isRead = true;
      }
    });
  },

  clearNotifications: () => {
    crmStore.updateDb((db) => {
      db.crmNotifications = [];
    });
  },

  // --- INTERACTION LOGS ---
  logActivity: (leadId, act) => {
    crmStore.updateDb((db) => {
      if (!db.crmActivities) db.crmActivities = [];
      db.crmActivities.unshift({
        id: generateId('act'),
        leadId,
        type: act.type,
        date: act.date || new Date().toISOString().split('T')[0],
        time: act.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: act.user || 'Sales Rep',
        outcome: act.outcome || 'Logged',
        notes: act.notes || ''
      });
      
      const lead = db.leads.find(l => l.id === leadId);
      if (lead) {
        lead.lastContact = act.date || new Date().toISOString().split('T')[0];
      }
    });
  },

  logEmail: (leadId, email) => {
    crmStore.updateDb((db) => {
      if (!db.crmEmails) db.crmEmails = [];
      db.crmEmails.unshift({
        id: generateId('email'),
        leadId,
        subject: email.subject,
        body: email.body,
        template: email.template || 'Manual Email',
        status: email.status || 'Sent',
        date: email.date || new Date().toISOString().split('T')[0],
        time: email.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      // Also create an activity touchpoint
      if (!db.crmActivities) db.crmActivities = [];
      db.crmActivities.unshift({
        id: generateId('act'),
        leadId,
        type: 'Email',
        date: email.date || new Date().toISOString().split('T')[0],
        time: email.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: email.user || 'Sales Rep',
        outcome: email.status === 'Sent' ? 'Sent' : 'Draft Saved',
        notes: `Subject: ${email.subject}`
      });

      const lead = db.leads.find(l => l.id === leadId);
      if (lead) {
        lead.lastContact = email.date || new Date().toISOString().split('T')[0];
      }
    });
  },

  logCall: (leadId, call) => {
    crmStore.updateDb((db) => {
      if (!db.crmCalls) db.crmCalls = [];
      db.crmCalls.unshift({
        id: generateId('call'),
        leadId,
        type: call.type || 'Outgoing',
        duration: call.duration || '0m',
        outcome: call.outcome || 'Connected',
        notes: call.notes || '',
        date: call.date || new Date().toISOString().split('T')[0],
        time: call.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      // Also create an activity touchpoint
      if (!db.crmActivities) db.crmActivities = [];
      db.crmActivities.unshift({
        id: generateId('act'),
        leadId,
        type: 'Phone Call',
        date: call.date || new Date().toISOString().split('T')[0],
        time: call.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: call.user || 'Sales Rep',
        outcome: call.outcome || 'Connected',
        notes: `Duration: ${call.duration}. ${call.notes}`
      });

      const lead = db.leads.find(l => l.id === leadId);
      if (lead) {
        lead.lastContact = call.date || new Date().toISOString().split('T')[0];
      }
    });
  },

  addNote: (leadId, noteText, author) => {
    crmStore.updateDb((db) => {
      if (!db.crmNotes) db.crmNotes = [];
      db.crmNotes.unshift({
        id: generateId('note'),
        leadId,
        text: noteText,
        author: author || 'Sales Agent',
        date: new Date().toISOString().split('T')[0]
      });
    });
  },

  logTimeline: (leadId, event, detail, user = 'System') => {
    crmStore.updateDb((db) => {
      if (!db.crmTimeline) db.crmTimeline = [];
      db.crmTimeline.unshift({
        id: generateId('time'),
        leadId,
        date: new Date().toISOString().split('T')[0],
        event,
        detail,
        user
      });
    });
  },

  logAudit: (leadId, user, action, oldValue, newValue) => {
    crmStore.updateDb((db) => {
      if (!db.crmAuditLogs) db.crmAuditLogs = [];
      db.crmAuditLogs.unshift({
        id: generateId('audit'),
        leadId,
        user: user || 'System',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action,
        oldValue: oldValue || 'None',
        newValue: newValue || 'Updated'
      });
    });
  },

  // --- FOLLOW-UPS ---
  completeFollowup: (id) => {
    crmStore.updateDb((db) => {
      const followup = db.crmFollowups.find(f => f.id === id);
      if (followup) {
        followup.status = 'Completed';
      }
    });
  },

  // --- ONBOARDING ---
  completeOnboardingTask: (onboardId, checklistIdx) => {
    crmStore.updateDb((db) => {
      const onboardItem = db.crmOnboarding.find(o => o.id === onboardId);
      if (onboardItem && onboardItem.checklist[checklistIdx]) {
        onboardItem.checklist[checklistIdx].completed = !onboardItem.checklist[checklistIdx].completed;
        const allCompleted = onboardItem.checklist.every(c => c.completed);
        onboardItem.status = allCompleted ? 'Completed' : 'In Progress';
      }
    });
  },

  // --- WIZARD / PROVISIONING ---
  provisionCompany: (tenantData) => {
    let newTenant = null;
    crmStore.updateDb((db) => {
      if (!db.tenants) db.tenants = [];
      
      newTenant = {
        id: Date.now(),
        name: tenantData.legalName,
        plan: tenantData.tier || 'Professional',
        status: 'Active',
        branches: 1,
        users: 3,
        drivers: 5,
        vehicles: 5,
        activeLoads: 0,
        revenue: tenantData.revenue || 2500,
        lastLogin: 'Never logged',
        trialExpiry: 'N/A',
        joined: new Date().toLocaleDateString(),
        manager: tenantData.adminName,
        country: 'USA',
        subscriptionId: `SUB-${1000 + db.tenants.length}`,
        billingPeriod: tenantData.frequency || 'Monthly',
        startDate: new Date().toLocaleDateString(),
        nextRenewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        autoRenewal: true,
        invoices: [],
        payments: [],
        audits: [
          { id: 1, action: 'Company Created', detail: 'SaaS Workspace provisioned via Conversion Wizard.', time: new Date().toLocaleString() }
        ]
      };
      
      db.tenants.unshift(newTenant);
    });
    return newTenant;
  }
};
