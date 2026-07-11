import { AccountType, RiskLevel } from "./types";

// Seed Accounts
export const initialAccounts = [
  {
    accountNumber: "910294810293",
    holderName: "Ananya Sharma",
    bankName: "State Bank of India",
    riskScore: 5,
    riskLevel: RiskLevel.LOW,
    type: AccountType.VICTIM,
    isActive: true,
    dormantPeriodDays: 2,
    phoneLinked: "+91 98765 43210",
    deviceFingerprint: "DEV-IOS-84920",
    location: "New Delhi, Delhi",
    createdAt: "2021-04-12",
    balance: 14500.00
  },
  {
    accountNumber: "420394819283",
    holderName: "Rajesh Kumar (Mule-A1)",
    bankName: "HDFC Bank",
    riskScore: 78,
    riskLevel: RiskLevel.HIGH,
    type: AccountType.MULE_L1,
    isActive: true,
    dormantPeriodDays: 45,
    phoneLinked: "+91 81234 56789",
    deviceFingerprint: "DEV-AND-19283",
    location: "Mumbai, Maharashtra",
    createdAt: "2025-01-10",
    balance: 125.50
  },
  {
    accountNumber: "551029384756",
    holderName: "Siddharth Patel (Mule-A2)",
    bankName: "ICICI Bank",
    riskScore: 82,
    riskLevel: RiskLevel.HIGH,
    type: AccountType.MULE_L1,
    isActive: true,
    dormantPeriodDays: 120, // Dormant awakening!
    phoneLinked: "+91 71029 38475",
    deviceFingerprint: "DEV-AND-44589",
    location: "Ahmedabad, Gujarat",
    createdAt: "2024-03-15",
    balance: 450.00
  },
  {
    accountNumber: "109283746501",
    holderName: "Karan Johar (Sleeper Core)",
    bankName: "Axis Bank",
    riskScore: 94,
    riskLevel: RiskLevel.CRITICAL,
    type: AccountType.MULE_L2,
    isActive: true,
    dormantPeriodDays: 210, // Highly dormant!
    phoneLinked: "+91 99911 22334",
    deviceFingerprint: "DEV-WEB-98273",
    location: "Jaipur, Rajasthan",
    createdAt: "2023-08-22",
    balance: 5120.00
  },
  {
    accountNumber: "882736451019",
    holderName: "Amit Singh (Mule-B1)",
    bankName: "Punjab National Bank",
    riskScore: 65,
    riskLevel: RiskLevel.HIGH,
    type: AccountType.MULE_L3,
    isActive: true,
    dormantPeriodDays: 12,
    phoneLinked: "+91 88776 65544",
    deviceFingerprint: "DEV-AND-10293",
    location: "Patna, Bihar",
    createdAt: "2025-02-18",
    balance: 1050.25
  },
  {
    accountNumber: "776102938475",
    holderName: "CoinX India (Escrow Node)",
    bankName: "Yes Bank",
    riskScore: 98,
    riskLevel: RiskLevel.CRITICAL,
    type: AccountType.EXIT,
    isActive: true,
    dormantPeriodDays: 1,
    phoneLinked: "+91 90000 11111",
    deviceFingerprint: "DEV-SERVER-COINX",
    location: "Bengaluru, Karnataka",
    createdAt: "2024-11-01",
    balance: 124500.50
  }
];

// Seed Alerts
export const initialAlerts = [
  {
    id: "AL-8921",
    sourceAccount: "910294810293",
    sourceHolder: "Ananya Sharma",
    destAccount: "420394819283",
    destHolder: "Rajesh Kumar (Mule-A1)",
    amount: 150000,
    timestamp: "2026-07-09T21:45:00Z",
    riskScore: 78,
    riskLevel: RiskLevel.HIGH,
    type: "RAPID_CHAIN",
    status: "NEW"
  },
  {
    id: "AL-8922",
    sourceAccount: "420394819283",
    sourceHolder: "Rajesh Kumar (Mule-A1)",
    destAccount: "109283746501",
    destHolder: "Karan Johar (Sleeper Core)",
    amount: 145000,
    timestamp: "2026-07-09T21:48:30Z",
    riskScore: 94,
    riskLevel: RiskLevel.CRITICAL,
    type: "DORMANT_AWAKENING",
    status: "INVESTIGATING"
  },
  {
    id: "AL-8923",
    sourceAccount: "109283746501",
    sourceHolder: "Karan Johar (Sleeper Core)",
    destAccount: "776102938475",
    destHolder: "CoinX India (Escrow Node)",
    amount: 290000,
    timestamp: "2026-07-09T21:55:00Z",
    riskScore: 98,
    riskLevel: RiskLevel.CRITICAL,
    type: "VELOCITY_SPIKE",
    status: "NEW"
  },
  {
    id: "AL-8924",
    sourceAccount: "551029384756",
    sourceHolder: "Siddharth Patel (Mule-A2)",
    destAccount: "109283746501",
    destHolder: "Karan Johar (Sleeper Core)",
    amount: 140000,
    timestamp: "2026-07-09T21:50:15Z",
    riskScore: 82,
    riskLevel: RiskLevel.HIGH,
    type: "SMURF_FUNNEL",
    status: "NEW"
  }
];

// Sandbox Scenarios
export const sandboxScenarios = [
  {
    id: "sc-gold-smurf",
    title: "Operation Gold-Smurf (Phishing Outflow)",
    description: "Classic phishing heist targeting high-value retail accounts. The compromised funds are rapidly layered through digital-mule layers and funneled into a centralized merchant sleeper account, before exiting via P2P cryptocurrency brokers.",
    riskPattern: "Victim (100%) → Layer-1 Mules (50% Split) → Layer-2 Sleeper Consolidation (95%) → Layer-3 Cash Mule → Exit Escrow Node",
    metrics: {
      duration: "18 minutes total",
      muleCount: 5,
      layerLevel: 3,
      totalAmount: 500000
    },
    accounts: [
      {
        accountNumber: "910294810293",
        holderName: "Ananya Sharma",
        bankName: "State Bank of India",
        riskScore: 5,
        riskLevel: RiskLevel.LOW,
        type: AccountType.VICTIM,
        isActive: true,
        dormantPeriodDays: 2,
        phoneLinked: "+91 98765 43210",
        deviceFingerprint: "DEV-IOS-84920",
        location: "New Delhi, Delhi",
        createdAt: "2021-04-12",
        balance: 14500.00
      },
      {
        accountNumber: "420394819283",
        holderName: "Rajesh Kumar (Mule-A1)",
        bankName: "HDFC Bank",
        riskScore: 78,
        riskLevel: RiskLevel.HIGH,
        type: AccountType.MULE_L1,
        isActive: true,
        dormantPeriodDays: 45,
        phoneLinked: "+91 81234 56789",
        deviceFingerprint: "DEV-AND-19283",
        location: "Mumbai, Maharashtra",
        createdAt: "2025-01-10",
        balance: 125.50
      },
      {
        accountNumber: "551029384756",
        holderName: "Siddharth Patel (Mule-A2)",
        bankName: "ICICI Bank",
        riskScore: 82,
        riskLevel: RiskLevel.HIGH,
        type: AccountType.MULE_L1,
        isActive: true,
        dormantPeriodDays: 120,
        phoneLinked: "+91 71029 38475",
        deviceFingerprint: "DEV-AND-44589",
        location: "Ahmedabad, Gujarat",
        createdAt: "2024-03-15",
        balance: 450.00
      },
      {
        accountNumber: "109283746501",
        holderName: "Karan Johar (Sleeper Core)",
        bankName: "Axis Bank",
        riskScore: 94,
        riskLevel: RiskLevel.CRITICAL,
        type: AccountType.MULE_L2,
        isActive: true,
        dormantPeriodDays: 210,
        phoneLinked: "+91 99911 22334",
        deviceFingerprint: "DEV-WEB-98273",
        location: "Jaipur, Rajasthan",
        createdAt: "2023-08-22",
        balance: 5120.00
      },
      {
        accountNumber: "882736451019",
        holderName: "Amit Singh (Mule-B1)",
        bankName: "Punjab National Bank",
        riskScore: 65,
        riskLevel: RiskLevel.HIGH,
        type: AccountType.MULE_L3,
        isActive: true,
        dormantPeriodDays: 12,
        phoneLinked: "+91 88776 65544",
        deviceFingerprint: "DEV-AND-10293",
        location: "Patna, Bihar",
        createdAt: "2025-02-18",
        balance: 1050.25
      },
      {
        accountNumber: "776102938475",
        holderName: "CoinX India (Escrow Node)",
        bankName: "Yes Bank",
        riskScore: 98,
        riskLevel: RiskLevel.CRITICAL,
        type: AccountType.EXIT,
        isActive: true,
        dormantPeriodDays: 1,
        phoneLinked: "+91 90000 11111",
        deviceFingerprint: "DEV-SERVER-COINX",
        location: "Bengaluru, Karnataka",
        createdAt: "2024-11-01",
        balance: 124500.50
      }
    ],
    transactions: [
      {
        id: "TX-9011",
        sourceAccount: "910294810293",
        sourceHolder: "Ananya Sharma",
        sourceBank: "State Bank of India",
        destAccount: "420394819283",
        destHolder: "Rajesh Kumar (Mule-A1)",
        destBank: "HDFC Bank",
        amount: 250000,
        timestamp: "2026-07-09T21:45:00Z",
        method: "IMPS",
        status: "FLAGGED",
        riskScore: 78,
        flags: ["Phishing Outflow Target", "Rapid Exfiltration", "First transaction to counterparty"]
      },
      {
        id: "TX-9012",
        sourceAccount: "910294810293",
        sourceHolder: "Ananya Sharma",
        sourceBank: "State Bank of India",
        destAccount: "551029384756",
        destHolder: "Siddharth Patel (Mule-A2)",
        destBank: "ICICI Bank",
        amount: 250000,
        timestamp: "2026-07-09T21:46:15Z",
        method: "IMPS",
        status: "FLAGGED",
        riskScore: 82,
        flags: ["Split Payment Pattern", "Dormant Recipient Awakening", "Mule-Signature Inbound"]
      },
      {
        id: "TX-9013",
        sourceAccount: "420394819283",
        sourceHolder: "Rajesh Kumar (Mule-A1)",
        sourceBank: "HDFC Bank",
        destAccount: "109283746501",
        destHolder: "Karan Johar (Sleeper Core)",
        destBank: "Axis Bank",
        amount: 245000,
        timestamp: "2026-07-09T21:48:30Z",
        method: "RTGS",
        status: "FLAGGED",
        riskScore: 92,
        flags: ["Pass-Through Transaction", "Zeroing Account Outflow", "Consolidation Stream"]
      },
      {
        id: "TX-9014",
        sourceAccount: "551029384756",
        sourceHolder: "Siddharth Patel (Mule-A2)",
        sourceBank: "ICICI Bank",
        destAccount: "109283746501",
        destHolder: "Karan Johar (Sleeper Core)",
        destBank: "Axis Bank",
        amount: 240000,
        timestamp: "2026-07-09T21:50:15Z",
        method: "RTGS",
        status: "FLAGGED",
        riskScore: 94,
        flags: ["Funneling Outflow", "High Velocity Inbound", "Dormant Awakening"]
      },
      {
        id: "TX-9015",
        sourceAccount: "109283746501",
        sourceHolder: "Karan Johar (Sleeper Core)",
        sourceBank: "Axis Bank",
        destAccount: "882736451019",
        destHolder: "Amit Singh (Mule-B1)",
        destBank: "Punjab National Bank",
        amount: 480000,
        timestamp: "2026-07-09T21:52:45Z",
        method: "NEFT",
        status: "FLAGGED",
        riskScore: 89,
        flags: ["Layer 2 Structuring", "High-Volume Immediate Outbound"]
      },
      {
        id: "TX-9016",
        sourceAccount: "882736451019",
        sourceHolder: "Amit Singh (Mule-B1)",
        sourceBank: "Punjab National Bank",
        destAccount: "776102938475",
        destHolder: "CoinX India (Escrow Node)",
        destBank: "Yes Bank",
        amount: 475000,
        timestamp: "2026-07-09T21:55:00Z",
        method: "UPI",
        status: "COMPLETED",
        riskScore: 98,
        flags: ["Crypto Exchange Purchase Escrow", "Laundering Chain Exit Node"]
      }
    ],
    traceNodes: [
      { id: "node-victim", label: "SBI ...10293", type: AccountType.VICTIM, riskScore: 5, riskLevel: RiskLevel.LOW, bank: "SBI", amount: 500000, holderName: "Ananya Sharma", timestamp: "21:45" },
      { id: "node-l1-a", label: "HDFC ...19283", type: AccountType.MULE_L1, riskScore: 78, riskLevel: RiskLevel.HIGH, bank: "HDFC", amount: 250000, holderName: "Rajesh Kumar (Mule-A1)", timestamp: "21:45" },
      { id: "node-l1-b", label: "ICICI ...38475", type: AccountType.MULE_L1, riskScore: 82, riskLevel: RiskLevel.HIGH, bank: "ICICI", amount: 250000, holderName: "Siddharth Patel (Mule-A2)", timestamp: "21:46" },
      { id: "node-l2", label: "Axis ...74650", type: AccountType.MULE_L2, riskScore: 94, riskLevel: RiskLevel.CRITICAL, bank: "Axis Bank", amount: 485000, holderName: "Karan Johar (Sleeper Core)", timestamp: "21:50" },
      { id: "node-l3", label: "PNB ...45101", type: AccountType.MULE_L3, riskScore: 89, riskLevel: RiskLevel.HIGH, bank: "PNB", amount: 480000, holderName: "Amit Singh (Mule-B1)", timestamp: "21:52" },
      { id: "node-exit", label: "Yes ...38475", type: AccountType.EXIT, riskScore: 98, riskLevel: RiskLevel.CRITICAL, bank: "Yes Bank (CoinX)", amount: 475000, holderName: "CoinX India", timestamp: "21:55" }
    ],
    traceEdges: [
      { id: "edge-1", source: "node-victim", target: "node-l1-a", amount: 250000, method: "IMPS", timestamp: "21:45", isSuspicious: true },
      { id: "edge-2", source: "node-victim", target: "node-l1-b", amount: 250000, method: "IMPS", timestamp: "21:46", isSuspicious: true },
      { id: "edge-3", source: "node-l1-a", target: "node-l2", amount: 245000, method: "RTGS", timestamp: "21:48", isSuspicious: true },
      { id: "edge-4", source: "node-l1-b", target: "node-l2", amount: 240000, method: "RTGS", timestamp: "21:50", isSuspicious: true },
      { id: "edge-5", source: "node-l2", target: "node-l3", amount: 480000, method: "NEFT", timestamp: "21:52", isSuspicious: true },
      { id: "edge-6", source: "node-l3", target: "node-exit", amount: 475000, method: "UPI", timestamp: "21:55", isSuspicious: true }
    ]
  },
  {
    id: "sc-sleeper-awaken",
    title: "Sleeper-Reactivation (Dormancy Wakeup)",
    description: "A legitimate-looking commercial merchant account that had no activity for over 6 months suddenly awakens. Within hours, it handles multiple high-value incoming deposits, immediately transferring 99% of funds out via automated scripts.",
    riskPattern: "Victim (100%) → Layer-1 Merchant Sleeper Account → Multiple Outbound UPI Layer-2 Accounts → ATM Exit Node",
    metrics: {
      duration: "4 hours total",
      muleCount: 4,
      layerLevel: 2,
      totalAmount: 1200000
    },
    accounts: [
      {
        accountNumber: "220293847561",
        holderName: "Arun Deshmukh (Victim 2)",
        bankName: "State Bank of India",
        riskScore: 2,
        riskLevel: RiskLevel.LOW,
        type: AccountType.VICTIM,
        isActive: true,
        dormantPeriodDays: 1,
        phoneLinked: "+91 99887 76655",
        deviceFingerprint: "DEV-MAC-20293",
        location: "Pune, Maharashtra",
        createdAt: "2018-02-14",
        balance: 45000.00
      },
      {
        accountNumber: "109283746501",
        holderName: "Karan Johar (Sleeper Core)",
        bankName: "Axis Bank",
        riskScore: 94,
        riskLevel: RiskLevel.CRITICAL,
        type: AccountType.MULE_L1, // Acting as L1 in this scenario
        isActive: true,
        dormantPeriodDays: 210, // Dormant!
        phoneLinked: "+91 99911 22334",
        deviceFingerprint: "DEV-WEB-98273",
        location: "Jaipur, Rajasthan",
        createdAt: "2023-08-22",
        balance: 5120.00
      },
      {
        accountNumber: "882736451019",
        holderName: "Amit Singh (Mule-B1)",
        bankName: "Punjab National Bank",
        riskScore: 65,
        riskLevel: RiskLevel.HIGH,
        type: AccountType.MULE_L2,
        isActive: true,
        dormantPeriodDays: 12,
        phoneLinked: "+91 88776 65544",
        deviceFingerprint: "DEV-AND-10293",
        location: "Patna, Bihar",
        createdAt: "2025-02-18",
        balance: 1050.25
      },
      {
        accountNumber: "665102938475",
        holderName: "ATM Outflow (Cash Withdrawal)",
        bankName: "SBM Bank ATM",
        riskScore: 99,
        riskLevel: RiskLevel.CRITICAL,
        type: AccountType.EXIT,
        isActive: true,
        dormantPeriodDays: 0,
        phoneLinked: "N/A",
        deviceFingerprint: "ATM-MUM-492",
        location: "Borivali ATM, Mumbai",
        createdAt: "2026-01-01",
        balance: 0
      }
    ],
    transactions: [
      {
        id: "TX-8801",
        sourceAccount: "220293847561",
        sourceHolder: "Arun Deshmukh (Victim 2)",
        sourceBank: "State Bank of India",
        destAccount: "109283746501",
        destHolder: "Karan Johar (Sleeper Core)",
        destBank: "Axis Bank",
        amount: 1200000,
        timestamp: "2026-07-09T18:00:00Z",
        method: "RTGS",
        status: "FLAGGED",
        riskScore: 94,
        flags: ["Massive Inbound on Dormant Account", "KYC High Variance Alert", "Corporate Impersonation Outflow"]
      },
      {
        id: "TX-8802",
        sourceAccount: "109283746501",
        sourceHolder: "Karan Johar (Sleeper Core)",
        sourceBank: "Axis Bank",
        destAccount: "882736451019",
        destHolder: "Amit Singh (Mule-B1)",
        destBank: "Punjab National Bank",
        amount: 1190000,
        timestamp: "2026-07-09T18:15:00Z",
        method: "NEFT",
        status: "FLAGGED",
        riskScore: 88,
        flags: ["Rapid Outbound Splitting", "Zeroing Account Flow"]
      },
      {
        id: "TX-8803",
        sourceAccount: "882736451019",
        sourceHolder: "Amit Singh (Mule-B1)",
        sourceBank: "Punjab National Bank",
        destAccount: "665102938475",
        destHolder: "ATM Outflow (Cash Withdrawal)",
        destBank: "SBM Bank ATM",
        amount: 1180000,
        timestamp: "2026-07-09T22:00:00Z",
        method: "ATM",
        status: "COMPLETED",
        riskScore: 99,
        flags: ["Anomalous ATM Withdrawal Velocity", "Immediate Cash Exfiltration"]
      }
    ],
    traceNodes: [
      { id: "node-victim-2", label: "SBI ...47561", type: AccountType.VICTIM, riskScore: 2, riskLevel: RiskLevel.LOW, bank: "SBI", amount: 1200000, holderName: "Arun Deshmukh", timestamp: "18:00" },
      { id: "node-sleeper", label: "Axis ...74650", type: AccountType.MULE_L1, riskScore: 94, riskLevel: RiskLevel.CRITICAL, bank: "Axis Bank", amount: 1200000, holderName: "Karan Johar (Sleeper)", timestamp: "18:15" },
      { id: "node-l2-b1", label: "PNB ...45101", type: AccountType.MULE_L2, riskScore: 88, riskLevel: RiskLevel.HIGH, bank: "PNB", amount: 1190000, holderName: "Amit Singh", timestamp: "18:15" },
      { id: "node-exit-atm", label: "ATM Withdrawal", type: AccountType.EXIT, riskScore: 99, riskLevel: RiskLevel.CRITICAL, bank: "SBM ATM", amount: 1180000, holderName: "Borivali Cash-out", timestamp: "22:00" }
    ],
    traceEdges: [
      { id: "edge-s1", source: "node-victim-2", target: "node-sleeper", amount: 1200000, method: "RTGS", timestamp: "18:00", isSuspicious: true },
      { id: "edge-s2", source: "node-sleeper", target: "node-l2-b1", amount: 1190000, method: "NEFT", timestamp: "18:15", isSuspicious: true },
      { id: "edge-s3", source: "node-l2-b1", target: "node-exit-atm", amount: 1180000, method: "ATM", timestamp: "22:00", isSuspicious: true }
    ]
  },
  {
    id: "sc-structuring-smurf",
    title: "Micro-Structuring / Smurfing",
    description: "Fraudsters deploy a swarm of small mule accounts to send micro-transfers (all kept under ₹50,000 to avoid regulatory triggers and PAN card checks) which pool into a central collector account, which is then emptied into an offshore shell bank.",
    riskPattern: "5+ Swarm Inbound Mules (<₹50k UPI) → 1 Central Collector Mule → Exit Offshore Node",
    metrics: {
      duration: "45 minutes total",
      muleCount: 6,
      layerLevel: 2,
      totalAmount: 245000
    },
    accounts: [
      {
        accountNumber: "102938475612",
        holderName: "Diverse Swarm (5 Accounts)",
        bankName: "Various Digital Banks",
        riskScore: 70,
        riskLevel: RiskLevel.HIGH,
        type: AccountType.MULE_L1,
        isActive: true,
        dormantPeriodDays: 5,
        phoneLinked: "+91 Multiple",
        deviceFingerprint: "DEV-SWARM-99",
        location: "Kolkata, West Bengal",
        createdAt: "2025-05-12",
        balance: 100
      },
      {
        accountNumber: "420394819283",
        holderName: "Rajesh Kumar (Mule-A1)",
        bankName: "HDFC Bank",
        riskScore: 82,
        riskLevel: RiskLevel.HIGH,
        type: AccountType.MULE_L2, // Collector
        isActive: true,
        dormantPeriodDays: 45,
        phoneLinked: "+91 81234 56789",
        deviceFingerprint: "DEV-AND-19283",
        location: "Mumbai, Maharashtra",
        createdAt: "2025-01-10",
        balance: 245000
      },
      {
        accountNumber: "991029384756",
        holderName: "Offshore Shell Ltd",
        bankName: "Global Offshore Bank",
        riskScore: 99,
        riskLevel: RiskLevel.CRITICAL,
        type: AccountType.EXIT,
        isActive: true,
        dormantPeriodDays: 3,
        phoneLinked: "+44 207 946 0192",
        deviceFingerprint: "DEV-PROXY-UK",
        location: "London, UK",
        createdAt: "2022-04-18",
        balance: 890450.00
      }
    ],
    transactions: [
      {
        id: "TX-SM-01",
        sourceAccount: "Digital Swarm (Ac 1)",
        sourceHolder: "Mule Smurf 1",
        sourceBank: "Airtel Payments Bank",
        destAccount: "420394819283",
        destHolder: "Rajesh Kumar (Mule-A1)",
        destBank: "HDFC Bank",
        amount: 49000,
        timestamp: "2026-07-09T20:00:00Z",
        method: "UPI",
        status: "FLAGGED",
        riskScore: 75,
        flags: ["Structuring threshold evasion (<50k)", "UPI Swarm Pooling"]
      },
      {
        id: "TX-SM-02",
        sourceAccount: "Digital Swarm (Ac 2)",
        sourceHolder: "Mule Smurf 2",
        sourceBank: "Paytm Payments Bank",
        destAccount: "420394819283",
        destHolder: "Rajesh Kumar (Mule-A1)",
        destBank: "HDFC Bank",
        amount: 49000,
        timestamp: "2026-07-09T20:05:00Z",
        method: "UPI",
        status: "FLAGGED",
        riskScore: 75,
        flags: ["Structuring threshold evasion (<50k)", "UPI Swarm Pooling"]
      },
      {
        id: "TX-SM-03",
        sourceAccount: "Digital Swarm (Ac 3)",
        sourceHolder: "Mule Smurf 3",
        sourceBank: "Jio Payments Bank",
        destAccount: "420394819283",
        destHolder: "Rajesh Kumar (Mule-A1)",
        destBank: "HDFC Bank",
        amount: 49000,
        timestamp: "2026-07-09T20:10:00Z",
        method: "UPI",
        status: "FLAGGED",
        riskScore: 75,
        flags: ["Structuring threshold evasion (<50k)", "UPI Swarm Pooling"]
      },
      {
        id: "TX-SM-04",
        sourceAccount: "Digital Swarm (Ac 4)",
        sourceHolder: "Mule Smurf 4",
        sourceBank: "IPPB Bank",
        destAccount: "420394819283",
        destHolder: "Rajesh Kumar (Mule-A1)",
        destBank: "HDFC Bank",
        amount: 49000,
        timestamp: "2026-07-09T20:15:00Z",
        method: "UPI",
        status: "FLAGGED",
        riskScore: 75,
        flags: ["Structuring threshold evasion (<50k)", "UPI Swarm Pooling"]
      },
      {
        id: "TX-SM-05",
        sourceAccount: "Digital Swarm (Ac 5)",
        sourceHolder: "Mule Smurf 5",
        sourceBank: "Fino Payments Bank",
        destAccount: "420394819283",
        destHolder: "Rajesh Kumar (Mule-A1)",
        destBank: "HDFC Bank",
        amount: 49000,
        timestamp: "2026-07-09T20:20:00Z",
        method: "UPI",
        status: "FLAGGED",
        riskScore: 75,
        flags: ["Structuring threshold evasion (<50k)", "UPI Swarm Pooling"]
      },
      {
        id: "TX-SM-06",
        sourceAccount: "420394819283",
        sourceHolder: "Rajesh Kumar (Mule-A1)",
        sourceBank: "HDFC Bank",
        destAccount: "991029384756",
        destHolder: "Offshore Shell Ltd",
        destBank: "Global Offshore Bank",
        amount: 240000,
        timestamp: "2026-07-09T20:45:00Z",
        method: "NEFT",
        status: "COMPLETED",
        riskScore: 99,
        flags: ["International wire from micro-pooled funds", "Immediate overseas exfiltration"]
      }
    ],
    traceNodes: [
      { id: "swarm-1", label: "Smurf Swarm", type: AccountType.VICTIM, riskScore: 65, riskLevel: RiskLevel.HIGH, bank: "UPI Swarm", amount: 245000, holderName: "5x Micro Mules", timestamp: "20:00" },
      { id: "collector", label: "HDFC Collector", type: AccountType.MULE_L1, riskScore: 82, riskLevel: RiskLevel.HIGH, bank: "HDFC Bank", amount: 245000, holderName: "Rajesh Kumar (Mule-A1)", timestamp: "20:20" },
      { id: "exit-offshore", label: "Offshore Exit", type: AccountType.EXIT, riskScore: 99, riskLevel: RiskLevel.CRITICAL, bank: "Global Bank (UK)", amount: 240000, holderName: "Offshore Shell Ltd", timestamp: "20:45" }
    ],
    traceEdges: [
      { id: "sm-edge-1", source: "swarm-1", target: "collector", amount: 245000, method: "UPI (5x)", timestamp: "20:20", isSuspicious: true },
      { id: "sm-edge-2", source: "collector", target: "exit-offshore", amount: 240000, method: "NEFT Int", timestamp: "20:45", isSuspicious: true }
    ]
  }
];
