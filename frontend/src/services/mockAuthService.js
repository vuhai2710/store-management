// Mock authentication service for demo purposes
export const mockAuthService = {
  login: async (credentials) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check credentials
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      return {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: 1,
          username: 'admin',
          name: 'Administrator',
          email: 'admin@erp-electronics.com',
          role: 'admin',
          avatar: null,
        }
      };
    } else {
      throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
    }
  },

  logout: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { message: 'Đăng xuất thành công' };
  },

  getCurrentUser: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id: 1,
      username: 'admin',
      name: 'Administrator',
      email: 'admin@erp-electronics.com',
      role: 'admin',
      avatar: null,
    };
  }
};


