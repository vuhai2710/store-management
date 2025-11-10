// src/components/pages/RegisterPage.js
import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import styles from '../../styles/styles';

const RegisterPage = ({ setCurrentPage, handleRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ và tên';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Họ và tên phải có ít nhất 3 ký tự';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (!acceptTerms) {
      newErrors.terms = 'Vui lòng đồng ý với điều khoản sử dụng';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      handleRegister(formData.name, formData.email, formData.password);
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
              <UserPlus size={40} />
            </div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Đăng Ký Tài Khoản
            </h2>
            <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              Tạo tài khoản để bắt đầu mua sắm tại TechHub
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
            
            {/* Name Field */}
            <div style={inputWrapperStyle}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '600',
                color: '#495057',
                fontSize: '0.875rem'
              }}>
                Họ và tên
              </label>
              <div style={{ position: 'relative' }}>
                <User size={20} style={iconStyle} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên của bạn"
                  style={{
                    ...inputStyle,
                    borderColor: errors.name ? '#dc3545' : '#dee2e6'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = errors.name ? '#dc3545' : '#dee2e6'}
                />
              </div>
              {errors.name && <p style={errorStyle}>{errors.name}</p>}
            </div>

            {/* Email Field */}
            <div style={inputWrapperStyle}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '600',
                color: '#495057',
                fontSize: '0.875rem'
              }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} style={iconStyle} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ email"
                  style={{
                    ...inputStyle,
                    borderColor: errors.email ? '#dc3545' : '#dee2e6'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = errors.email ? '#dc3545' : '#dee2e6'}
                />
              </div>
              {errors.email && <p style={errorStyle}>{errors.email}</p>}
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
                  placeholder="Tạo mật khẩu (tối thiểu 6 ký tự)"
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

            {/* Confirm Password Field */}
            <div style={inputWrapperStyle}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '600',
                color: '#495057',
                fontSize: '0.875rem'
              }}>
                Xác nhận mật khẩu
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={iconStyle} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu"
                  style={{
                    ...inputStyle,
                    paddingRight: '3rem',
                    borderColor: errors.confirmPassword ? '#dc3545' : '#dee2e6'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = errors.confirmPassword ? '#dc3545' : '#dee2e6'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && <p style={errorStyle}>{errors.confirmPassword}</p>}
            </div>

            {/* Terms and Conditions */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '0.75rem', 
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}>
                <input 
                  type="checkbox" 
                  checked={acceptTerms}
                  onChange={(e) => {
                    setAcceptTerms(e.target.checked);
                    if (errors.terms && e.target.checked) {
                      setErrors(prev => ({ ...prev, terms: '' }));
                    }
                  }}
                  style={{ 
                    cursor: 'pointer', 
                    marginTop: '0.25rem',
                    accentColor: '#f5576c'
                  }} 
                />
                <span style={{ color: '#495057' }}>
                  Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật
                </span>
              </label>
              {errors.terms && <p style={errorStyle}>{errors.terms}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                marginBottom: '1rem'
              }}
            >
              Đăng Ký Ngay
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

            {/* Login Link */}
            <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#495057' }}>
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => setCurrentPage('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Đăng nhập ngay
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

export default RegisterPage;