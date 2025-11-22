// src/components/layout/Header.js
import React, { useState, useRef, useEffect } from "react";
import {
  ShoppingBag,
  Menu,
  X,
  Search,
  Mail,
  LogIn,
  User,
  LogOut,
  Settings,
  Package,
} from "lucide-react";
import styles from "../../styles/styles";

// User Dropdown Component
const UserDropdown = ({ userName, setCurrentPage, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.5rem 1rem",
          backgroundColor: isOpen ? "#F8FAFC" : "transparent",
          border: "1px solid #E2E8F0",
          borderRadius: "0.75rem",
          cursor: "pointer",
          color: "#0F172A",
          fontWeight: "600",
          transition: "all 0.3s",
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = "#F8FAFC";
            e.currentTarget.style.borderColor = "#2563EB";
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.borderColor = "#E2E8F0";
          }
        }}>
        <User size={18} />
        <span>
          👋 Xin chào, <span style={{ color: "#2563EB" }}>{userName}</span>
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "0.5rem",
            backgroundColor: "white",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            border: "1px solid #E2E8F0",
            minWidth: "220px",
            zIndex: 1000,
            overflow: "hidden",
          }}>
          <div
            style={{
              padding: "0.75rem 1rem",
              borderBottom: "1px solid #e9ecef",
              backgroundColor: "#F8FAFC",
              fontWeight: "600",
              color: "#495057",
              fontSize: "0.875rem",
            }}>
            {userName}
          </div>

          <button
            onClick={() => {
              setCurrentPage("profile");
              setIsOpen(false);
            }}
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              border: "none",
              backgroundColor: "transparent",
              textAlign: "left",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#495057",
              fontSize: "0.875rem",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#F8FAFC")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }>
            <Settings size={18} />
            <span>Quản lý tài khoản</span>
          </button>

          <button
            onClick={() => {
              setCurrentPage("orders");
              setIsOpen(false);
            }}
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              border: "none",
              backgroundColor: "transparent",
              textAlign: "left",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#495057",
              fontSize: "0.875rem",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f8f9fa")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }>
            <Package size={18} />
            <span>Đơn hàng của tôi</span>
          </button>

          <div style={{ borderTop: "1px solid #e9ecef", marginTop: "0.25rem" }}>
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                border: "none",
                backgroundColor: "transparent",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#dc3545",
                fontSize: "0.875rem",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#F8FAFC")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }>
              <LogOut size={18} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Header = ({
  currentPage,
  setCurrentPage,
  mobileMenuOpen,
  setMobileMenuOpen,
  cart,
  cartItemCount,
  searchTerm,
  setSearchTerm,
  isAuthenticated,
  user,
  handleLogout,
  cartIconRef,
}) => {
  const isLoggedIn = isAuthenticated;
  const userName =
    user?.customerName || user?.name || user?.username || "Guest";

  return (
    <header style={styles.headerMain}>
      {/* Top Bar */}
      <div style={styles.headerTopBar}>
        <div style={styles.container}>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              fontSize: "0.875rem",
            }}>
            {/* Right: Auth Actions */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.5rem",
                position: "relative",
              }}>
              {isLoggedIn ? (
                <>
                  {/* User Dropdown */}
                  <UserDropdown
                    userName={userName}
                    setCurrentPage={setCurrentPage}
                    handleLogout={handleLogout}
                  />
                </>
              ) : (
                <>
                  {/* Nút Login */}
                  <button
                    onClick={() => setCurrentPage("login")}
                    style={{
                      ...styles.navLink,
                      color: "#2563EB",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      transition: "color 0.3s",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#1D4ED8")}
                    onMouseLeave={(e) => (e.target.style.color = "#2563EB")}>
                    <LogIn size={16} /> Đăng nhập
                  </button>
                  {/* Nút Register */}
                  <button
                    onClick={() => setCurrentPage("register")}
                    style={{
                      ...styles.navLink,
                      color: "#1E293B",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      transition: "color 0.3s",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#020617")}
                    onMouseLeave={(e) => (e.target.style.color = "#1E293B")}>
                    <User size={16} /> Đăng ký
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div style={{ ...styles.container, padding: "1rem 1rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
          }}>
          {/* Logo */}
          <button
            onClick={() => setCurrentPage("home")}
            aria-label="Về trang chủ"
            style={{
              ...styles.logo,
              border: "none",
              background: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}>
            💻 Electronic Store
          </button>

          {/* Desktop Navigation */}
          <nav style={{ display: "flex", gap: "2rem" }}>
            <button
              onClick={() => setCurrentPage("home")}
              style={
                currentPage === "home" ? styles.navLinkActive : styles.navLink
              }>
              Trang chủ
            </button>
            <button
              onClick={() => setCurrentPage("shop")}
              style={
                currentPage === "shop" ? styles.navLinkActive : styles.navLink
              }>
              Cửa hàng
            </button>
            {isLoggedIn && (
              <button
                onClick={() => setCurrentPage("orders")}
                style={
                  currentPage === "orders"
                    ? styles.navLinkActive
                    : styles.navLink
                }>
                Đơn hàng
              </button>
            )}
          </nav>

          {/* Search Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flex: 1,
              margin: "0 1rem",
              maxWidth: "500px",
            }}>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              aria-label="Tìm kiếm sản phẩm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  setCurrentPage("shop");
                }
              }}
              style={{
                ...styles.inputField,
                width: "100%",
                borderRadius: "0.5rem 0 0 0.5rem",
                borderRight: "none",
                padding: "0.625rem 1rem",
              }}
            />
            <button
              onClick={() => setCurrentPage("shop")}
              aria-label="Tìm kiếm"
              style={{
                ...styles.buttonPrimary,
                padding: "0.625rem 1rem",
                borderRadius: "0 0.5rem 0.5rem 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
              <Search size={20} />
            </button>
          </div>

          {/* Icons & Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.25rem",
              flexShrink: 0,
            }}>
            {/* User Account Icon - CHÍNH */}

            {/* Cart Icon */}
            <button
              ref={cartIconRef}
              onClick={() => setCurrentPage("cart")}
              style={{
                position: "relative",
                color: "#495057",
                border: "none",
                background: "none",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.25rem",
                transition: "transform 0.2s",
              }}
              title="Giỏ hàng"
              aria-label="Giỏ hàng"
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }>
              <div style={{ position: "relative" }}>
                <ShoppingBag size={24} />
                {(cartItemCount > 0 || (cart && cart.length > 0)) && (
                  <span
                    style={{
                      backgroundColor: "#2563EB",
                      color: "#FFFFFF",
                      borderRadius: "50%",
                      width: "18px",
                      height: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      fontWeight: "bold",
                      position: "absolute",
                      top: "-8px",
                      right: "-8px",
                      border: "2px solid #F8FAFC",
                    }}>
                    {cartItemCount || cart.length}
                  </span>
                )}
              </div>
              <span style={{ fontSize: "0.75rem", fontWeight: "600" }}>
                Giỏ hàng
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
              style={{
                display: "none",
                color: "#495057",
                border: "none",
                background: "none",
                cursor: "pointer",
              }}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu (if needed) */}
        {mobileMenuOpen && (
          <nav
            id="mobile-nav"
            style={{
              display: "none",
              flexDirection: "column",
              gap: "1rem",
              marginTop: "1rem",
              padding: "1rem",
              backgroundColor: "#F8FAFC",
              borderRadius: "0.5rem",
            }}>
            <button
              onClick={() => {
                setCurrentPage("home");
                setMobileMenuOpen(false);
              }}
              style={styles.navLink}>
              Trang chủ
            </button>
            <button
              onClick={() => {
                setCurrentPage("shop");
                setMobileMenuOpen(false);
              }}
              style={styles.navLink}>
              Cửa hàng
            </button>
            {isLoggedIn && (
              <button
                onClick={() => {
                  setCurrentPage("orders");
                  setMobileMenuOpen(false);
                }}
                style={styles.navLink}>
                Đơn hàng
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
