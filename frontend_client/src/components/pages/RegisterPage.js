// src/components/pages/RegisterPage.js
import React, { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, UserPlus, Phone } from "lucide-react";
import styles from "../../styles/styles";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../common/LoadingSpinner";
import { isValidEmail, isValidPhone } from "../../utils/validationUtils";

const RegisterPage = ({ setCurrentPage }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    customerName: "",
    email: "",
    phoneNumber: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Vui lòng nhập tên đăng nhập";
    } else if (formData.username.trim().length < 4) {
      newErrors.username = "Tên đăng nhập phải có ít nhất 4 ký tự";
    }

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Vui lòng nhập họ và tên";
    } else if (formData.customerName.trim().length < 3) {
      newErrors.customerName = "Họ và tên phải có ít nhất 3 ký tự";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
    } else if (!isValidPhone(formData.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 4) {
      newErrors.password = "Mật khẩu phải có ít nhất 4 ký tự";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (!acceptTerms) {
      newErrors.terms = "Vui lòng đồng ý với điều khoản sử dụng";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (validateForm()) {
      try {
        setIsLoading(true);
        await register({
          username: formData.username.trim(),
          password: formData.password,
          email: formData.email.trim(),
          customerName: formData.customerName.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          address: formData.address.trim() || undefined,
        });
        // Redirect to home page after successful registration
        setCurrentPage("home");
      } catch (error) {
        console.error("Register error:", error);
        setApiError(error?.message || "Đăng ký thất bại. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "0.875rem 1rem 0.875rem 3rem",
    border: "1px solid #dee2e6",
    borderRadius: "0.5rem",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.3s, box-shadow 0.3s",
  };

  const inputWrapperStyle = {
    position: "relative",
    marginBottom: "1.5rem",
  };

  const iconStyle = {
    position: "absolute",
    left: "1rem",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#6c757d",
    pointerEvents: "none",
  };

  const errorStyle = {
    color: "#dc3545",
    fontSize: "0.875rem",
    marginTop: "0.25rem",
  };

  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "2rem 0",
      }}>
      <div style={styles.container}>
        <div
          style={{
            maxWidth: "450px",
            margin: "0 auto",
            backgroundColor: "white",
            borderRadius: "1rem",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
            overflow: "hidden",
          }}>
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              padding: "2rem",
              textAlign: "center",
              color: "white",
            }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                margin: "0 auto 1rem",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
              <UserPlus size={40} />
            </div>
            <h2
              style={{
                fontSize: "1.875rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
              }}>
              Đăng Ký Tài Khoản
            </h2>
            <p style={{ fontSize: "0.875rem", opacity: 0.9 }}>
              Tạo tài khoản để bắt đầu mua sắm tại Electronic Store
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: "2rem" }}>
            {/* Username Field */}
            <div style={inputWrapperStyle}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "600",
                  color: "#495057",
                  fontSize: "0.875rem",
                }}>
                Tên đăng nhập
              </label>
              <div style={{ position: "relative" }}>
                <User size={20} style={iconStyle} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Nhập tên đăng nhập (tối thiểu 4 ký tự)"
                  style={{
                    ...inputStyle,
                    borderColor: errors.username ? "#dc3545" : "#dee2e6",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = errors.username
                      ? "#dc3545"
                      : "#dee2e6")
                  }
                />
              </div>
              {errors.username && <p style={errorStyle}>{errors.username}</p>}
            </div>

            {/* Customer Name Field */}
            <div style={inputWrapperStyle}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "600",
                  color: "#495057",
                  fontSize: "0.875rem",
                }}>
                Họ và tên
              </label>
              <div style={{ position: "relative" }}>
                <User size={20} style={iconStyle} />
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên của bạn"
                  style={{
                    ...inputStyle,
                    borderColor: errors.customerName ? "#dc3545" : "#dee2e6",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = errors.customerName
                      ? "#dc3545"
                      : "#dee2e6")
                  }
                />
              </div>
              {errors.customerName && (
                <p style={errorStyle}>{errors.customerName}</p>
              )}
            </div>

            {/* Email Field */}
            <div style={inputWrapperStyle}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "600",
                  color: "#495057",
                  fontSize: "0.875rem",
                }}>
                Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={20} style={iconStyle} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ email"
                  style={{
                    ...inputStyle,
                    borderColor: errors.email ? "#dc3545" : "#dee2e6",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = errors.email
                      ? "#dc3545"
                      : "#dee2e6")
                  }
                />
              </div>
              {errors.email && <p style={errorStyle}>{errors.email}</p>}
            </div>

            {/* Phone Number Field */}
            <div style={inputWrapperStyle}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "600",
                  color: "#495057",
                  fontSize: "0.875rem",
                }}>
                Số điện thoại
              </label>
              <div style={{ position: "relative" }}>
                <Phone size={20} style={iconStyle} />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại (VD: 0123456789)"
                  style={{
                    ...inputStyle,
                    borderColor: errors.phoneNumber ? "#dc3545" : "#dee2e6",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = errors.phoneNumber
                      ? "#dc3545"
                      : "#dee2e6")
                  }
                />
              </div>
              {errors.phoneNumber && (
                <p style={errorStyle}>{errors.phoneNumber}</p>
              )}
            </div>

            {/* Address Field (Optional) */}
            <div style={inputWrapperStyle}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "600",
                  color: "#495057",
                  fontSize: "0.875rem",
                }}>
                Địa chỉ (Tùy chọn)
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ của bạn"
                  style={{
                    ...inputStyle,
                    paddingLeft: "1rem",
                    borderColor: errors.address ? "#dc3545" : "#dee2e6",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = errors.address
                      ? "#dc3545"
                      : "#dee2e6")
                  }
                />
              </div>
              {errors.address && <p style={errorStyle}>{errors.address}</p>}
            </div>

            {/* Password Field */}
            <div style={inputWrapperStyle}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "600",
                  color: "#495057",
                  fontSize: "0.875rem",
                }}>
                Mật khẩu
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={20} style={iconStyle} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Tạo mật khẩu (tối thiểu 4 ký tự)"
                  style={{
                    ...inputStyle,
                    paddingRight: "3rem",
                    borderColor: errors.password ? "#dc3545" : "#dee2e6",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = errors.password
                      ? "#dc3545"
                      : "#dee2e6")
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#6c757d",
                    padding: "0.25rem",
                  }}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p style={errorStyle}>{errors.password}</p>}
            </div>

            {/* Confirm Password Field */}
            <div style={inputWrapperStyle}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "600",
                  color: "#495057",
                  fontSize: "0.875rem",
                }}>
                Xác nhận mật khẩu
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={20} style={iconStyle} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu"
                  style={{
                    ...inputStyle,
                    paddingRight: "3rem",
                    borderColor: errors.confirmPassword ? "#dc3545" : "#dee2e6",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = errors.confirmPassword
                      ? "#dc3545"
                      : "#dee2e6")
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    right: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#6c757d",
                    padding: "0.25rem",
                  }}>
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p style={errorStyle}>{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}>
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => {
                    setAcceptTerms(e.target.checked);
                    if (errors.terms && e.target.checked) {
                      setErrors((prev) => ({ ...prev, terms: "" }));
                    }
                  }}
                  style={{
                    cursor: "pointer",
                    marginTop: "0.25rem",
                    accentColor: "#f5576c",
                  }}
                />
                <span style={{ color: "#495057" }}>
                  Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật
                </span>
              </label>
              {errors.terms && <p style={errorStyle}>{errors.terms}</p>}
            </div>

            {/* API Error Message */}
            {apiError && (
              <div
                style={{
                  padding: "0.75rem",
                  marginBottom: "1rem",
                  backgroundColor: "#f8d7da",
                  color: "#721c24",
                  borderRadius: "0.25rem",
                  fontSize: "0.875rem",
                }}>
                {apiError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "1rem",
                background: isLoading
                  ? "#6c757d"
                  : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                fontSize: "1rem",
                fontWeight: "bold",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                marginBottom: "1rem",
                opacity: isLoading ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}>
              {isLoading ? (
                <>
                  <LoadingSpinner size={20} color="white" />
                  <span>Đang đăng ký...</span>
                </>
              ) : (
                "Đăng Ký Ngay"
              )}
            </button>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                margin: "1.5rem 0",
                color: "#6c757d",
                fontSize: "0.875rem",
              }}>
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  backgroundColor: "#dee2e6",
                }}></div>
              <span style={{ padding: "0 1rem" }}>hoặc</span>
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  backgroundColor: "#dee2e6",
                }}></div>
            </div>

            {/* Login Link */}
            <div
              style={{
                textAlign: "center",
                fontSize: "0.875rem",
                color: "#495057",
              }}>
              Đã có tài khoản?{" "}
              <button
                type="button"
                onClick={() => setCurrentPage("login")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#667eea",
                  fontWeight: "bold",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}>
                Đăng nhập ngay
              </button>
            </div>

            {/* Back to Home */}
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button
                type="button"
                onClick={() => setCurrentPage("home")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#6c757d",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}>
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
