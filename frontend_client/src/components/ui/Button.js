import React from "react";

const buttonBase = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "0.75rem",
  fontWeight: 600,
  border: "none",
  cursor: "pointer",
  transition: "background-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease",
};

const variants = {
  primary: {
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    boxShadow: "0 12px 30px rgba(37, 99, 235, 0.35)",
  },
  secondary: {
    backgroundColor: "#1E293B",
    color: "#FFFFFF",
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.35)",
  },
  ghost: {
    backgroundColor: "transparent",
    color: "#0F172A",
    boxShadow: "none",
    border: "1px solid #E2E8F0",
  },
};

const sizes = {
  md: {
    padding: "0.75rem 1.25rem",
    fontSize: "0.95rem",
  },
  sm: {
    padding: "0.6rem 1rem",
    fontSize: "0.85rem",
  },
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  style,
  disabled,
  ...props
}) {
  const baseStyle = {
    ...buttonBase,
    ...(variants[variant] || variants.primary),
    ...(sizes[size] || sizes.md),
    width: fullWidth ? "100%" : undefined,
    opacity: disabled ? 0.7 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
    ...style,
  };

  return (
    <button disabled={disabled} style={baseStyle} {...props}>
      {children}
    </button>
  );
}
