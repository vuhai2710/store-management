// src/components/pages/LoginPage.js
import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import styles from "../../styles/styles";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../common/LoadingSpinner";
import { authService } from "../../services/authService";

const LoginPage = ({ setCurrentPage }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Xóa lỗi khi người dùng bắt đầu nhập
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
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 4) {
      newErrors.password = "Mật khẩu phải có ít nhất 4 ký tự";
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
        await login(formData.username, formData.password, rememberMe);
        // Redirect to home page after successful login
        setCurrentPage("home");
      } catch (error) {
        console.error("Login error:", error);
        setApiError(
          error?.message ||
            "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordError("");
    setForgotPasswordSuccess("");

    if (!forgotPasswordEmail.trim()) {
      setForgotPasswordError("Vui lòng nhập email");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordEmail)) {
      setForgotPasswordError("Email không hợp lệ");
      return;
    }

    try {
      setForgotPasswordLoading(true);
      const response = await authService.forgotPassword(forgotPasswordEmail);
      setForgotPasswordSuccess(
        response?.message ||
          "Mật khẩu mới đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư."
      );
      setForgotPasswordEmail("");
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotPasswordSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Forgot password error:", error);
      setForgotPasswordError(
        error?.message || "Không thể gửi email. Vui lòng thử lại sau."
      );
    } finally {
      setForgotPasswordLoading(false);
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
              <LogIn size={40} />
            </div>
            <h2
              style={{
                fontSize: "1.875rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
              }}>
              Đăng Nhập
            </h2>
            <p style={{ fontSize: "0.875rem", opacity: 0.9 }}>
              Chào mừng trở lại với Electronic Store!
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
                <Mail size={20} style={iconStyle} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Nhập tên đăng nhập hoặc email"
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
                  placeholder="Nhập mật khẩu"
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

            {/* Remember & Forgot Password */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
                fontSize: "0.875rem",
              }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  cursor: "pointer",
                }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ cursor: "pointer" }}
                />
                <span style={{ color: "#495057" }}>Ghi nhớ đăng nhập</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#667eea",
                  cursor: "pointer",
                  fontWeight: "600",
                }}>
                Quên mật khẩu?
              </button>
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
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                fontSize: "1rem",
                fontWeight: "bold",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                marginBottom: "1rem",
                opacity: isLoading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow =
                    "0 4px 12px rgba(102, 126, 234, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }
              }}>
              {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
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

            {/* Register Link */}
            <div
              style={{
                textAlign: "center",
                fontSize: "0.875rem",
                color: "#495057",
              }}>
              Chưa có tài khoản?{" "}
              <button
                type="button"
                onClick={() => setCurrentPage("register")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#667eea",
                  fontWeight: "bold",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}>
                Đăng ký ngay
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

          {/* Forgot Password Modal */}
          {showForgotPassword && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: "2rem",
              }}
              onClick={() => {
                setShowForgotPassword(false);
                setForgotPasswordEmail("");
                setForgotPasswordError("");
                setForgotPasswordSuccess("");
              }}>
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "0.5rem",
                  padding: "2rem",
                  maxWidth: "400px",
                  width: "100%",
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
                }}
                onClick={(e) => e.stopPropagation()}>
                <h3
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    marginBottom: "1rem",
                  }}>
                  Quên mật khẩu
                </h3>
                <p
                  style={{
                    color: "#6c757d",
                    marginBottom: "1.5rem",
                    fontSize: "0.875rem",
                  }}>
                  Nhập email đã đăng ký để nhận mật khẩu mới
                </p>

                <form onSubmit={handleForgotPassword}>
                  <div style={{ marginBottom: "1rem" }}>
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
                    <input
                      type="email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      placeholder="Nhập email"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #dee2e6",
                        borderRadius: "0.5rem",
                        fontSize: "1rem",
                        outline: "none",
                      }}
                    />
                  </div>

                  {forgotPasswordError && (
                    <div
                      style={{
                        padding: "0.75rem",
                        marginBottom: "1rem",
                        backgroundColor: "#f8d7da",
                        color: "#721c24",
                        borderRadius: "0.25rem",
                        fontSize: "0.875rem",
                      }}>
                      {forgotPasswordError}
                    </div>
                  )}

                  {forgotPasswordSuccess && (
                    <div
                      style={{
                        padding: "0.75rem",
                        marginBottom: "1rem",
                        backgroundColor: "#d4edda",
                        color: "#155724",
                        borderRadius: "0.25rem",
                        fontSize: "0.875rem",
                      }}>
                      {forgotPasswordSuccess}
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      justifyContent: "flex-end",
                    }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordEmail("");
                        setForgotPasswordError("");
                        setForgotPasswordSuccess("");
                      }}
                      style={{
                        padding: "0.75rem 1.5rem",
                        border: "1px solid #dee2e6",
                        borderRadius: "0.5rem",
                        backgroundColor: "white",
                        color: "#495057",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                      }}>
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={forgotPasswordLoading}
                      style={{
                        padding: "0.75rem 1.5rem",
                        border: "none",
                        borderRadius: "0.5rem",
                        backgroundColor: forgotPasswordLoading
                          ? "#6c757d"
                          : "#667eea",
                        color: "white",
                        cursor: forgotPasswordLoading
                          ? "not-allowed"
                          : "pointer",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        opacity: forgotPasswordLoading ? 0.6 : 1,
                      }}>
                      {forgotPasswordLoading ? "Đang gửi..." : "Gửi"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
