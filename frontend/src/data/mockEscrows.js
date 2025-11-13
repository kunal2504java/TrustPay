export const mockEscrows = [
  {
    id: 'ESC001',
    payee_vpa: 'priya@okbank',
    payer_vpa: 'merchant@okaxis',
    amount: 5000,
    status: 'HELD',
    description: 'UI design milestone 1',
    created_at: '2025-11-10T10:30:00Z',
    timeline: [
      { event: 'Escrow Created', timestamp: '2025-11-10T10:30:00Z' },
      { event: 'Funded by Payer', timestamp: '2025-11-10T11:00:00Z' },
      { event: 'Funds Held - Awaiting Confirmation', timestamp: '2025-11-10T11:00:00Z' }
    ]
  },
  {
    id: 'ESC002',
    payee_vpa: 'priya@okbank',
    payer_vpa: 'client@paytm',
    amount: 12000,
    status: 'HELD',
    description: 'Logo design project',
    created_at: '2025-11-09T14:20:00Z',
    timeline: [
      { event: 'Escrow Created', timestamp: '2025-11-09T14:20:00Z' },
      { event: 'Funded by Payer', timestamp: '2025-11-09T15:00:00Z' },
      { event: 'Funds Held - Awaiting Confirmation', timestamp: '2025-11-09T15:00:00Z' }
    ]
  },
  {
    id: 'ESC003',
    payee_vpa: 'priya@okbank',
    payer_vpa: 'startup@upi',
    amount: 8500,
    status: 'RELEASED',
    description: 'Website mockup delivery',
    created_at: '2025-11-05T09:15:00Z',
    timeline: [
      { event: 'Escrow Created', timestamp: '2025-11-05T09:15:00Z' },
      { event: 'Funded by Payer', timestamp: '2025-11-05T10:00:00Z' },
      { event: 'Funds Held', timestamp: '2025-11-05T10:00:00Z' },
      { event: 'Released to Payee', timestamp: '2025-11-08T16:30:00Z' }
    ]
  },
  {
    id: 'ESC004',
    payee_vpa: 'priya@okbank',
    payer_vpa: 'buyer@okicici',
    amount: 3000,
    status: 'DISPUTED',
    description: 'Social media graphics',
    created_at: '2025-11-01T11:00:00Z',
    timeline: [
      { event: 'Escrow Created', timestamp: '2025-11-01T11:00:00Z' },
      { event: 'Funded by Payer', timestamp: '2025-11-01T12:00:00Z' },
      { event: 'Funds Held', timestamp: '2025-11-01T12:00:00Z' },
      { event: 'Dispute Raised', timestamp: '2025-11-03T14:00:00Z' }
    ]
  }
];
