// src/components/pages/RegisterPage.js
import React, { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, UserPlus, Phone } from "lucide-react";
import styles from "../../styles/styles";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../common/LoadingSpinner";
import { isValidEmail, isValidPhone } from "../../utils/validationUtils";
import Button from "../ui/Button";
import Input from "../ui/Input";

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
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const validateField = (name, value) => {
    const trimmedValue = value.trim();
    const newErrors = {};

    switch (name) {
      case "username": {
        if (!trimmedValue) {
          newErrors.username = "Vui lòng nhập tên đăng nhập";
        } else if (trimmedValue.length < 4) {
          newErrors.username = "Tên đăng nhập phải có ít nhất 4 ký tự";
        }
        break;
      }
      case "customerName": {
        if (!trimmedValue) {
          newErrors.customerName = "Vui lòng nhập họ và tên";
        } else if (trimmedValue.length < 3) {
          newErrors.customerName = "Họ và tên phải có ít nhất 3 ký tự";
        }
        break;
      }
      case "email": {
        if (!trimmedValue) {
          newErrors.email = "Vui lòng nhập email";
        } else if (!isValidEmail(trimmedValue)) {
          newErrors.email = "Email không hợp lệ";
        }
        break;
      }
      case "phoneNumber": {
        if (!trimmedValue) {
          newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
        } else if (!isValidPhone(trimmedValue)) {
          newErrors.phoneNumber = "Số điện thoại không hợp lệ";
        }
        break;
      }
      case "password": {
        if (!value) {
          newErrors.password = "Vui lòng nhập mật khẩu";
        } else if (value.length < 4) {
          newErrors.password = "Mật khẩu phải có ít nhất 4 ký tự";
        }
        break;
      }
      case "confirmPassword": {
        if (!value) {
          newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
        } else if (value !== formData.password) {
          newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }
        break;
      }
      default:
        break;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({
        ...prev,
        ...newErrors,
      }));
    } else if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password" || name === "confirmPassword") {
      const nextPassword = name === "password" ? value : formData.password;
      const nextConfirmPassword =
        name === "confirmPassword" ? value : formData.confirmPassword;
      validateField("password", nextPassword);
      validateField("confirmPassword", nextConfirmPassword);
    } else {
      validateField(name, value);
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
          {/* Header */}
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
                Tên đăng nhập *
              </label>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Nhập tên đăng nhập (tối thiểu 4 ký tự)"
                leftIcon={<User size={20} />}
                error={errors.username}
              />
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
                Họ và tên *
              </label>
              <Input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Nhập họ và tên của bạn"
                leftIcon={<User size={20} />}
                error={errors.customerName}
              />
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
                Email *
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Nhập địa chỉ email"
                leftIcon={<Mail size={20} />}
                error={errors.email}
              />
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
                Số điện thoại *
              </label>
              <Input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Nhập số điện thoại (VD: 0123456789)"
                leftIcon={<Phone size={20} />}
                error={errors.phoneNumber}
              />
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
              <Input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Nhập địa chỉ của bạn"
                error={errors.address}
              />
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
                Mật khẩu *
              </label>
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Tạo mật khẩu (tối thiểu 4 ký tự)"
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
                Xác nhận mật khẩu *
              </label>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
                leftIcon={<Lock size={20} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#6c757d",
                      padding: "0.25rem",
                    }}>
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                }
                error={errors.confirmPassword}
              />
            </div>

            {/* Terms and Conditions section removed: registration doesn't depend on checkbox */}

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
            <Button
              type="submit"
              disabled={isLoading}
              fullWidth
              style={{ marginBottom: "1rem" }}>
              {isLoading ? "Đang đăng ký..." : "Đăng Ký Ngay"}
            </Button>

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
