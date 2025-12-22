
import React from "react";
import styles from "../../styles/styles";

const Footer = () => (
  <footer
    style={{
      backgroundColor: "#020617",
      color: "#E5E7EB",
      padding: "3rem 0 2rem",
    }}>
    <div style={{ ...styles.container, marginBottom: "2rem" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "2rem",
          backgroundColor: "#020617",
          borderRadius: "1rem",
          padding: "2rem 2.5rem",
          boxShadow: "0 20px 45px rgba(15,23,42,0.55)",
        }}>
        <div>
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: "bold",
              marginBottom: "1rem",
              color: "#F9FAFB",
            }}>
            Electronics Store
          </h3>
          <p style={{ color: "#9CA3AF", fontSize: "0.875rem" }}>
            Address: số 3 Cầu Giấy
          </p>
          <p style={{ color: "#9CA3AF", fontSize: "0.875rem" }}>
            Phone: +84 123456789
          </p>
          <p style={{ color: "#9CA3AF", fontSize: "0.875rem" }}>
            Email: hello@electronicsstore.com
          </p>
        </div>
        <div>
          <h4 style={{ fontWeight: "bold", marginBottom: "1rem" }}>
            Useful Links
          </h4>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              fontSize: "0.875rem",
              color: "#9CA3AF",
            }}>
            <li>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                }}>
                About Us
              </button>
            </li>
            <li>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                }}>
                Secure Shopping
              </button>
            </li>
            <li>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                }}>
                Privacy Policy
              </button>
            </li>
          </ul>
        </div>
        <div>
          <h4 style={{ fontWeight: "bold", marginBottom: "1rem" }}>More</h4>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              fontSize: "0.875rem",
              color: "#adb5bd",
            }}>
            <li>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                }}>
                Who We Are
              </button>
            </li>
            <li>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                }}>
                Contact
              </button>
            </li>
            <li>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                }}>
                Testimonials
              </button>
            </li>
          </ul>
        </div>
        <div>
          <h4 style={{ fontWeight: "bold", marginBottom: "1rem" }}>
            Newsletter
          </h4>
          <p
            style={{
              color: "#9CA3AF",
              fontSize: "0.875rem",
              marginBottom: "0.75rem",
            }}>
            Get E-mail updates
          </p>
          <input
            type="email"
            placeholder="Enter your mail"
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.75rem",
              color: "#0F172A",
              marginBottom: "0.5rem",
              border: "1px solid #E2E8F0",
            }}
          />
          <button
            style={{
              ...styles.buttonSecondary,
              width: "100%",
              padding: "0.5rem",
            }}>
            Subscribe
          </button>
        </div>
      </div>
    </div>
    <div
      style={{
        borderTop: "1px solid #1F2937",
        paddingTop: "1.5rem",
        textAlign: "center",
        color: "#9CA3AF",
        fontSize: "0.875rem",
      }}>
      <p>Copyright © 2025 All rights reserved | Made with Nhóm 6</p>
    </div>
  </footer>
);

export default Footer;
