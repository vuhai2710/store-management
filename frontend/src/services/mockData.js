// Mock data for demo purposes
export const mockData = {
  orders: [
    {
      id: 'ORD-001',
      customerId: 1,
      customer: { name: 'Nguyễn Văn A', phone: '0123456789' },
      items: [
        { productId: 1, productName: 'iPhone 15', price: 25000000, quantity: 1, total: 25000000 },
        { productId: 2, productName: 'AirPods Pro', price: 5000000, quantity: 1, total: 5000000 }
      ],
      subtotal: 30000000,
      vat: 3000000,
      totalAmount: 33000000,
      paymentMethod: 'cash',
      status: 'completed',
      notes: 'Giao hàng tận nơi',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 'ORD-002',
      customerId: 2,
      customer: { name: 'Trần Thị B', phone: '0987654321' },
      items: [
        { productId: 3, productName: 'Samsung Galaxy S24', price: 22000000, quantity: 1, total: 22000000 }
      ],
      subtotal: 22000000,
      vat: 2200000,
      totalAmount: 24200000,
      paymentMethod: 'bank_transfer',
      status: 'processing',
      notes: '',
      createdAt: '2024-01-16T14:20:00Z'
    },
    {
      id: 'ORD-003',
      customerId: 3,
      customer: { name: 'Lê Văn C', phone: '0369852147' },
      items: [
        { productId: 4, productName: 'MacBook Pro M3', price: 45000000, quantity: 1, total: 45000000 }
      ],
      subtotal: 45000000,
      vat: 4500000,
      totalAmount: 49500000,
      paymentMethod: 'bank_transfer',
      status: 'pending',
      notes: 'Khách hàng VIP',
      createdAt: '2024-01-17T09:15:00Z'
    }
  ],

  products: [
    {
      id: 1,
      name: 'iPhone 15',
      sku: 'IPH15-128GB',
      category: 'smartphone',
      price: 25000000,
      cost: 22000000,
      stock: 25,
      minStock: 5,
      description: 'iPhone 15 128GB màu xanh',
      specifications: '{"storage": "128GB", "color": "Blue", "screen": "6.1 inch"}',
      status: 'active',
      image: null
    },
    {
      id: 2,
      name: 'AirPods Pro',
      sku: 'APP-GEN2',
      category: 'accessories',
      price: 5000000,
      cost: 4200000,
      stock: 50,
      minStock: 10,
      description: 'AirPods Pro thế hệ 2',
      specifications: '{"type": "Wireless", "battery": "6 hours"}',
      status: 'active',
      image: null
    },
    {
      id: 3,
      name: 'Samsung Galaxy S24',
      sku: 'SGS24-256GB',
      category: 'smartphone',
      price: 22000000,
      cost: 19000000,
      stock: 15,
      minStock: 5,
      description: 'Samsung Galaxy S24 256GB',
      specifications: '{"storage": "256GB", "color": "Black", "screen": "6.2 inch"}',
      status: 'active',
      image: null
    },
    {
      id: 4,
      name: 'MacBook Pro M3',
      sku: 'MBP-M3-512GB',
      category: 'laptop',
      price: 45000000,
      cost: 40000000,
      stock: 8,
      minStock: 3,
      description: 'MacBook Pro M3 512GB',
      specifications: '{"storage": "512GB", "ram": "16GB", "screen": "14 inch"}',
      status: 'active',
      image: null
    }
  ],

  customers: [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@email.com',
      phone: '0123456789',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      status: 'active',
      customerType: 'regular',
      createdAt: '2024-01-01T00:00:00Z',
      avatar: null
    },
    {
      id: 2,
      name: 'Trần Thị B',
      email: 'tranthib@email.com',
      phone: '0987654321',
      address: '456 Đường XYZ, Quận 2, TP.HCM',
      status: 'active',
      customerType: 'vip',
      createdAt: '2024-01-02T00:00:00Z',
      avatar: null
    },
    {
      id: 3,
      name: 'Lê Văn C',
      email: 'levanc@email.com',
      phone: '0369852147',
      address: '789 Đường DEF, Quận 3, TP.HCM',
      status: 'active',
      customerType: 'vip',
      createdAt: '2024-01-03T00:00:00Z',
      avatar: null
    }
  ],

  employees: [
    {
      id: 1,
      name: 'Phạm Thị D',
      email: 'phamthid@company.com',
      phone: '0123456789',
      department: 'Sales',
      position: 'Sales Manager',
      role: 'admin',
      username: 'phamthid',
      status: 'active',
      hireDate: '2023-01-01T00:00:00Z',
      avatar: null
    },
    {
      id: 2,
      name: 'Hoàng Văn E',
      email: 'hoangvane@company.com',
      phone: '0987654321',
      department: 'IT',
      position: 'Developer',
      role: 'sales',
      username: 'hoangvane',
      status: 'active',
      hireDate: '2023-02-01T00:00:00Z',
      avatar: null
    }
  ],

  suppliers: [
    {
      id: 1,
      name: 'Apple Vietnam',
      contact: 'John Smith',
      email: 'contact@apple.vn',
      phone: '0123456789',
      address: 'TP.HCM, Vietnam',
      status: 'active'
    },
    {
      id: 2,
      name: 'Samsung Electronics',
      contact: 'Jane Doe',
      email: 'contact@samsung.vn',
      phone: '0987654321',
      address: 'Hà Nội, Vietnam',
      status: 'active'
    }
  ],

  inventory: [
    {
      id: 1,
      productName: 'iPhone 15',
      warehouse: 'Kho chính',
      quantity: 25,
      value: 550000000
    },
    {
      id: 2,
      productName: 'AirPods Pro',
      warehouse: 'Kho chính',
      quantity: 50,
      value: 210000000
    },
    {
      id: 3,
      productName: 'Samsung Galaxy S24',
      warehouse: 'Kho phụ',
      quantity: 15,
      value: 285000000
    }
  ],

  financialData: {
    revenue: 1500000000,
    expenses: 1200000000,
    profit: 300000000,
    transactions: []
  },

  payroll: [
    {
      id: 1,
      employeeName: 'Phạm Thị D',
      baseSalary: 15000000,
      bonus: 3000000,
      totalSalary: 18000000,
      month: '2024-01'
    },
    {
      id: 2,
      employeeName: 'Hoàng Văn E',
      baseSalary: 20000000,
      bonus: 5000000,
      totalSalary: 25000000,
      month: '2024-01'
    }
  ]
};


