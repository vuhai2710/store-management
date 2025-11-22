import React from "react";

const wrapperStyleBase = {
  position: "relative",
  width: "100%",
};

const inputBase = {
  width: "100%",
  padding: "0.8rem 1rem",
  borderRadius: "0.75rem",
  border: "1px solid #E2E8F0",
  backgroundColor: "#FFFFFF",
  fontSize: "0.95rem",
  outline: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

export default function Input({
  leftIcon,
  rightIcon,
  error,
  style,
  inputStyle,
  ...props
}) {
  const hasLeftIcon = Boolean(leftIcon);

  const finalInputStyle = {
    ...inputBase,
    paddingLeft: hasLeftIcon ? "3rem" : inputBase.padding,
    borderColor: error ? "#DC2626" : "#E2E8F0",
    ...inputStyle,
  };

  return (
    <div style={wrapperStyleBase}>
      {leftIcon && (
        <div
          style={{
            position: "absolute",
            left: "1rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9CA3AF",
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {leftIcon}
        </div>
      )}
      <input
        style={finalInputStyle}
        onFocus={(e) => {
          e.target.style.borderColor = "#2563EB";
          e.target.style.boxShadow = "0 0 0 1px rgba(37,99,235,0.45)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? "#DC2626" : "#E2E8F0";
          e.target.style.boxShadow = "none";
        }}
        {...props}
      />
      {rightIcon && (
        <div
          style={{
            position: "absolute",
            right: "1rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9CA3AF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {rightIcon}
        </div>
      )}
      {error && (
        <p
          style={{
            color: "#DC2626",
            fontSize: "0.8rem",
            marginTop: "0.35rem",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
