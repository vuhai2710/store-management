
import React, { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import styles from "../../styles/styles";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { authService } from "../../services/authService";

const ResetPasswordPage = ({ setCurrentPage }) => {
    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const [success, setSuccess] = useState(false);
    const [token, setToken] = useState("");

    useEffect(() => {

        const urlParams = new URLSearchParams(window.location.search);
        const tokenParam = urlParams.get("token");
        if (tokenParam) {
            setToken(tokenParam);
        } else {
            setApiError("Link đặt lại mật khẩu không hợp lệ");
        }
    }, []);

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

        if (!formData.newPassword) {
            newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");

        if (!token) {
            setApiError("Link đặt lại mật khẩu không hợp lệ");
            return;
        }

        if (validateForm()) {
            try {
                setIsLoading(true);
                const response = await authService.resetPassword(
                    token,
                    formData.newPassword,
                    formData.confirmPassword
                );
                setSuccess(true);
            } catch (error) {
                console.error("Reset password error:", error);
                const errorMessage =
                    error?.message || "Không thể đặt lại mật khẩu. Vui lòng thử lại.";
                setApiError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const inputWrapperStyle = {
        position: "relative",
        marginBottom: "1.25rem",
    };

    if (success) {
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
                        {}
                        <div
                            style={{
                                background:
                                    "linear-gradient(135deg, #22C55E 0%, #15803D 60%, #14532D 100%)",
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
                                <CheckCircle size={40} />
                            </div>
                            <h2
                                style={{
                                    fontSize: "1.875rem",
                                    fontWeight: "bold",
                                    marginBottom: "0.5rem",
                                }}>
                                Thành công!
                            </h2>
                            <p style={{ fontSize: "0.875rem", opacity: 0.9 }}>
                                Mật khẩu của bạn đã được đặt lại
                            </p>
                        </div>

                        {}
                        <div style={{ padding: "2rem", textAlign: "center" }}>
                            <p style={{ color: "#495057", marginBottom: "1.5rem" }}>
                                Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ.
                            </p>

                            <Button
                                onClick={() => setCurrentPage("login")}
                                fullWidth
                                style={{ marginBottom: "1rem" }}>
                                Đăng nhập
                            </Button>

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
                    </div>
                </div>
            </section>
        );
    }

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
                    {}
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
                            <Lock size={40} />
                        </div>
                        <h2
                            style={{
                                fontSize: "1.875rem",
                                fontWeight: "bold",
                                marginBottom: "0.5rem",
                            }}>
                            Đặt lại mật khẩu
                        </h2>
                        <p style={{ fontSize: "0.875rem", opacity: 0.9 }}>
                            Nhập mật khẩu mới cho tài khoản của bạn
                        </p>
                    </div>

                    {}
                    <form onSubmit={handleSubmit} style={{ padding: "2rem" }}>
                        {}
                        <div style={inputWrapperStyle}>
                            <label
                                style={{
                                    display: "block",
                                    marginBottom: "0.5rem",
                                    fontWeight: "600",
                                    color: "#0F172A",
                                    fontSize: "0.8rem",
                                }}>
                                Mật khẩu mới
                            </label>
                            <Input
                                type={showPassword ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
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
                                error={errors.newPassword}
                            />
                        </div>

                        {}
                        <div style={inputWrapperStyle}>
                            <label
                                style={{
                                    display: "block",
                                    marginBottom: "0.5rem",
                                    fontWeight: "600",
                                    color: "#0F172A",
                                    fontSize: "0.8rem",
                                }}>
                                Xác nhận mật khẩu
                            </label>
                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Nhập lại mật khẩu mới"
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
                                        {showConfirmPassword ? (
                                            <EyeOff size={20} />
                                        ) : (
                                            <Eye size={20} />
                                        )}
                                    </button>
                                }
                                error={errors.confirmPassword}
                            />
                        </div>

                        {}
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

                        {}
                        <Button
                            type="submit"
                            disabled={isLoading || !token}
                            fullWidth
                            style={{ marginBottom: "1rem" }}>
                            {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                        </Button>

                        {}
                        <div style={{ textAlign: "center" }}>
                            <button
                                type="button"
                                onClick={() => setCurrentPage("login")}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#2563EB",
                                    fontSize: "0.875rem",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                }}>
                                <ArrowLeft size={16} />
                                Quay lại đăng nhập
                            </button>
                        </div>

                        {}
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

export default ResetPasswordPage;
