// src/components/layout/Header.js
import React from 'react';
import { Heart, ShoppingBag, Menu, X, Search, Mail, LogIn, User, LogOut } from 'lucide-react'; 
import styles from '../../styles/styles';

const Header = ({ 
  currentPage, 
  setCurrentPage, 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  wishlist, 
  cart, 
  searchTerm, 
  setSearchTerm, 
  isLoggedIn, 
  user, 
  handleLogout 
}) => {
  
  // Xử lý khi click vào icon User/Login chính
 

  return (
    <header style={styles.headerMain}>
      {/* Top Bar */}
      <div style={styles.headerTopBar}>
        <div style={styles.container}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
            
            {/* Left: Contact Info */}
            <div style={{ display: 'flex', gap: '1.5rem', color: '#6c757d' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} /> hello@techhub.com
              </span>
              <span>📞 +84 123456789</span>
            </div>
            
            {/* Right: Auth Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              {isLoggedIn ? (
                <>
                  {/* Hiển thị tên user */}
                  <span style={{ color: '#495057', fontWeight: '600' }}>
                    👋 Xin chào, <span style={{ color: '#007bff' }}>{user.name}</span>
                  </span>
                  {/* Nút Logout */}
                  <button 
                    onClick={handleLogout}
                    style={{ 
                      ...styles.navLink, 
                      color: '#dc3545', 
                      fontWeight: '600', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.25rem',
                      transition: 'color 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#c82333'}
                    onMouseLeave={(e) => e.target.style.color = '#dc3545'}
                  >
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  {/* Nút Login */}
                  <button 
                    onClick={() => setCurrentPage('login')} 
                    style={{ 
                      ...styles.navLink, 
                      color: '#007bff', 
                      fontWeight: '600', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.25rem',
                      transition: 'color 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#0056b3'}
                    onMouseLeave={(e) => e.target.style.color = '#007bff'}
                  >
                    <LogIn size={16} /> Đăng nhập
                  </button>
                  {/* Nút Register */}
                  <button 
                    onClick={() => setCurrentPage('register')} 
                    style={{ 
                      ...styles.navLink, 
                      color: '#28a745', 
                      fontWeight: '600', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.25rem',
                      transition: 'color 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#218838'}
                    onMouseLeave={(e) => e.target.style.color = '#28a745'}
                  >
                    <User size={16} /> Đăng ký
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div style={{ ...styles.container, padding: '1rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          
          {/* Logo */}
          <button 
            onClick={() => setCurrentPage('home')}
            style={{ 
              ...styles.logo, 
              border: 'none', 
              background: 'none', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            💻 TechHub
          </button>
          
          {/* Desktop Navigation */}
          <nav style={{ display: 'flex', gap: '2rem' }}>
            <button 
              onClick={() => setCurrentPage('home')} 
              style={currentPage === 'home' ? styles.navLinkActive : styles.navLink}
            >
              Trang chủ
            </button>
            <button 
              onClick={() => setCurrentPage('shop')} 
              style={currentPage === 'shop' ? styles.navLinkActive : styles.navLink}
            >
              Cửa hàng
            </button>
            <button 
              onClick={() => setCurrentPage('blog')} 
              style={currentPage === 'blog' ? styles.navLinkActive : styles.navLink}
            >
              Blog
            </button>
            <button 
              onClick={() => setCurrentPage('contact')} 
              style={currentPage === 'contact' ? styles.navLinkActive : styles.navLink}
            >
              Liên hệ
            </button>
          </nav>

          {/* Search Bar */}
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, margin: '0 1rem', maxWidth: '500px' }}>
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  setCurrentPage('shop');
                }
              }}
              style={{ 
                ...styles.inputField, 
                width: '100%', 
                borderRadius: '0.5rem 0 0 0.5rem', 
                borderRight: 'none',
                padding: '0.625rem 1rem'
              }}
            />
            <button 
              onClick={() => setCurrentPage('shop')} 
              style={{ 
                ...styles.buttonPrimary, 
                padding: '0.625rem 1rem', 
                borderRadius: '0 0.5rem 0.5rem 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Search size={20} />
            </button>
          </div>

          {/* Icons & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
            
            {/* User Account Icon - CHÍNH */}
            

            {/* Wishlist Icon */}
            <button 
              onClick={() => setCurrentPage('wishlist')} 
              style={{ 
                position: 'relative', 
                color: '#495057', 
                border: 'none', 
                background: 'none', 
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                transition: 'transform 0.2s'
              }}
              title="Danh sách yêu thích"
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ position: 'relative' }}>
                <Heart size={24} style={{ fill: wishlist.length > 0 ? 'red' : 'none', stroke: wishlist.length > 0 ? 'red' : '#495057' }} />
                {wishlist.length > 0 && (
                  <span style={{ 
                    backgroundColor: 'red', 
                    color: 'white', 
                    borderRadius: '50%', 
                    width: '18px', 
                    height: '18px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '0.7rem', 
                    fontWeight: 'bold',
                    position: 'absolute', 
                    top: '-8px', 
                    right: '-8px',
                    border: '2px solid white'
                  }}>
                    {wishlist.length}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>Yêu thích</span>
            </button>
            
            {/* Cart Icon */}
            <button 
              onClick={() => setCurrentPage('cart')} 
              style={{ 
                position: 'relative', 
                color: '#495057', 
                border: 'none', 
                background: 'none', 
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                transition: 'transform 0.2s'
              }}
              title="Giỏ hàng"
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ position: 'relative' }}>
                <ShoppingBag size={24} />
                {cart.length > 0 && (
                  <span style={{ 
                    backgroundColor: '#007bff', 
                    color: 'white', 
                    borderRadius: '50%', 
                    width: '18px', 
                    height: '18px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '0.7rem', 
                    fontWeight: 'bold',
                    position: 'absolute', 
                    top: '-8px', 
                    right: '-8px',
                    border: '2px solid white'
                  }}>
                    {cart.length}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>Giỏ hàng</span>
            </button>
            
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              style={{ 
                display: 'none', 
                color: '#495057', 
                border: 'none', 
                background: 'none', 
                cursor: 'pointer' 
              }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu (if needed) */}
        {mobileMenuOpen && (
          <nav style={{ 
            display: 'none', 
            flexDirection: 'column', 
            gap: '1rem', 
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '0.5rem'
          }}> 
            <button onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }} style={styles.navLink}>
              Trang chủ
            </button>
            <button onClick={() => { setCurrentPage('shop'); setMobileMenuOpen(false); }} style={styles.navLink}>
              Cửa hàng
            </button>
            <button onClick={() => { setCurrentPage('blog'); setMobileMenuOpen(false); }} style={styles.navLink}>
              Blog
            </button>
            <button onClick={() => { setCurrentPage('contact'); setMobileMenuOpen(false); }} style={styles.navLink}>
              Liên hệ
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;