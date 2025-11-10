// src/components/pages/LoginPage.js
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import styles from '../../styles/styles';

const LoginPage = ({ setCurrentPage, handleLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Xóa lỗi khi người dùng bắt đầu nhập
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Vui lòng nhập tên đăng nhập';
    }
    
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      handleLogin(formData.username, formData.password);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem 0.875rem 3rem',
    border: '1px solid #dee2e6',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.3s, box-shadow 0.3s'
  };

  const inputWrapperStyle = {
    position: 'relative',
    marginBottom: '1.5rem'
  };

  const iconStyle = {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6c757d',
    pointerEvents: 'none'
  };

  const errorStyle = {
    color: '#dc3545',
    fontSize: '0.875rem',
    marginTop: '0.25rem'
  };

  return (
    <section style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem 0'
    }}>
      <div style={styles.container}>
        <div style={{ 
          maxWidth: '450px', 
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden'
        }}>
          
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '2rem',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              margin: '0 auto 1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <LogIn size={40} />
            </div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Đăng Nhập
            </h2>
            <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              Chào mừng trở lại với TechHub!
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
            
            {/* Username Field */}
            <div style={inputWrapperStyle}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '600',
                color: '#495057',
                fontSize: '0.875rem'
              }}>
                Tên đăng nhập
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} style={iconStyle} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Nhập tên đăng nhập hoặc email"
                  style={{
                    ...inputStyle,
                    borderColor: errors.username ? '#dc3545' : '#dee2e6'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = errors.username ? '#dc3545' : '#dee2e6'}
                />
              </div>
              {errors.username && <p style={errorStyle}>{errors.username}</p>}
            </div>

            {/* Password Field */}
            <div style={inputWrapperStyle}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '600',
                color: '#495057',
                fontSize: '0.875rem'
              }}>
                Mật khẩu
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={iconStyle} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  style={{
                    ...inputStyle,
                    paddingRight: '3rem',
                    borderColor: errors.password ? '#dc3545' : '#dee2e6'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = errors.password ? '#dc3545' : '#dee2e6'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6c757d',
                    padding: '0.25rem'
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p style={errorStyle}>{errors.password}</p>}
            </div>

            {/* Remember & Forgot Password */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1.5rem',
              fontSize: '0.875rem'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" style={{ cursor: 'pointer' }} />
                <span style={{ color: '#495057' }}>Ghi nhớ đăng nhập</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Chức năng quên mật khẩu đang được phát triển')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                marginBottom: '1rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Đăng Nhập
            </button>

            {/* Divider */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              margin: '1.5rem 0',
              color: '#6c757d',
              fontSize: '0.875rem'
            }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#dee2e6' }}></div>
              <span style={{ padding: '0 1rem' }}>hoặc</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#dee2e6' }}></div>
            </div>

            {/* Register Link */}
            <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#495057' }}>
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => setCurrentPage('register')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Đăng ký ngay
              </button>
            </div>

            {/* Back to Home */}
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setCurrentPage('home')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6c757d',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                ← Quay về trang chủ
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;