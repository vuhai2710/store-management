
import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import styles from "../../styles/styles";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../common/LoadingSpinner";
import Button from "../ui/Button";
import Input from "../ui/Input";
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

        setCurrentPage("home");
      } catch (error) {
        console.error("Login error:", error);

        const errorMessage =
          error?.message || "Tài khoản hoặc mật khẩu không đúng";
        setApiError(errorMessage);
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
        "Vui lòng kiểm tra email để đặt lại mật khẩu."
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
    border: "1px solid #E2E8F0",
    borderRadius: "0.75rem",
    fontSize: "0.95rem",
    outline: "none",
    backgroundColor: "#FFFFFF",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  };

  const inputWrapperStyle = {
    position: "relative",
    marginBottom: "1.25rem",
  };

  const iconStyle = {
    position: "absolute",
    left: "1rem",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9CA3AF",
    pointerEvents: "none",
  };

  const errorStyle = {
    color: "#DC2626",
    fontSize: "0.8rem",
    marginTop: "0.35rem",
  };

  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top, rgba(37,99,235,0.12), transparent 55%), #F8FAFC",
        padding: "2.5rem 1rem",
      }}>
      <div style={styles.container}>
        <div
          style={{
            maxWidth: "480px",
            margin: "0 auto",
            backgroundColor: "white",
            borderRadius: "1rem",
            boxShadow: "0 24px 60px rgba(15, 23, 42, 0.16)",
            overflow: "hidden",
          }}>
          { }
          <div
            style={{
              background:
                "linear-gradient(135deg, #2563EB 0%, #1E293B 60%, #020617 100%)",
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
              Chào mừng trở lại với Electronics Store!
            </p>
          </div>

          { }
          <form onSubmit={handleSubmit} style={{ padding: "2rem" }}>
            { }
            <div style={inputWrapperStyle}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "600",
                  color: "#0F172A",
                  fontSize: "0.8rem",
                }}>
                Tên đăng nhập
              </label>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Nhập tên đăng nhập hoặc email"
                leftIcon={<Mail size={20} />}
                error={errors.username}
              />
            </div>

            { }
            <div style={inputWrapperStyle}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "600",
                  color: "#0F172A",
                  fontSize: "0.8rem",
                }}>
                Mật khẩu
              </label>
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                leftIcon={<Lock size={20} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#6c757d",
                      padding: "0.25rem",
                    }}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                }
                error={errors.password}
              />
            </div>

            { }
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
                  color: "#2563EB",
                  cursor: "pointer",
                  fontWeight: "600",
                }}>
                Quên mật khẩu?
              </button>
            </div>

            { }
            {apiError && (
              <div
                style={{
                  padding: "0.875rem 1rem",
                  marginBottom: "1rem",
                  backgroundColor: "#FEE2E2",
                  color: "#DC2626",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  border: "1px solid #FECACA",
                }}>
                <AlertCircle size={20} style={{ flexShrink: 0 }} />
                <span>{apiError}</span>
              </div>
            )}

            { }
            <Button
              type="submit"
              disabled={isLoading}
              fullWidth
              style={{ marginBottom: "1rem" }}>
              {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
            </Button>

            { }
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
                  backgroundColor: "#E2E8F0",
                }}></div>
              <span style={{ padding: "0 1rem" }}>hoặc</span>
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  backgroundColor: "#E2E8F0",
                }}></div>
            </div>

            { }
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

            { }
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

          { }
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
                  Nhập email đã đăng ký để nhận link đặt lại mật khẩu
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
                        border: "1px solid #E2E8F0",
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
                        border: "1px solid #E2E8F0",
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
