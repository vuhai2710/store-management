/**
 * Constants - User Roles
 */

export const USER_ROLES = {
  ADMIN: "ADMIN",
  EMPLOYEE: "EMPLOYEE",
  CUSTOMER: "CUSTOMER",
};

export const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: "Quản trị viên",
  [USER_ROLES.EMPLOYEE]: "Nhân viên",
  [USER_ROLES.CUSTOMER]: "Khách hàng",
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: {
    canManageUsers: true,
    canManageEmployees: true,
    canManageCustomers: true,
    canManageProducts: true,
    canManageOrders: true,
    canManageInventory: true,
    canManageFinance: true,
    canViewReports: true,
    canManageSuppliers: true,
  },
  [USER_ROLES.EMPLOYEE]: {
    canManageUsers: false,
    canManageEmployees: false,
    canManageCustomers: true,
    canManageProducts: true,
    canManageOrders: true,
    canManageInventory: true,
    canManageFinance: false,
    canViewReports: false,
    canManageSuppliers: true,
  },
  [USER_ROLES.CUSTOMER]: {
    canManageUsers: false,
    canManageEmployees: false,
    canManageCustomers: false,
    canManageProducts: false,
    canManageOrders: false,
    canManageInventory: false,
    canManageFinance: false,
    canViewReports: false,
    canManageSuppliers: false,
  },
};
