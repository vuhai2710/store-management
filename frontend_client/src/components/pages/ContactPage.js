// src/components/pages/ContactPage.js
import React, { useState } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import styles from "../../styles/styles";

// Component NHẬN các props chung (như setCurrentPage)
const ContactPage = ({ setCurrentPage }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill in all fields.");
      return;
    }

    // Logic gửi form giả lập
    console.log("Sending message:", formData);
    alert("Message sent successfully! Thank you for contacting us.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <section style={{ padding: "4rem 0", backgroundColor: "#F8FAFC" }}>
      <div style={styles.container}>
        <h2
          style={{
            fontSize: "1.875rem",
            fontWeight: "bold",
            marginBottom: "3rem",
          }}>
          Contact Us
        </h2>

        {/* Contact Info Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1.5rem",
            marginBottom: "4rem",
          }}>
          {[
            { icon: Phone, title: "Phone", text: "+84 123456789" },
            { icon: MapPin, title: "Address", text: "số 3 Cầu Giấy" },
            { icon: Clock, title: "Open Time", text: "10:00 am to 23:00 pm" },
            { icon: Mail, title: "Email", text: "hello@electronicstore.com" },
          ].map((item, index) => (
            <div
              key={index}
              style={{
                textAlign: "center",
                padding: "1.5rem",
                background: "linear-gradient(135deg, #EFF6FF, #DBEAFE)",
                borderRadius: "0.75rem",
                boxShadow: "0 10px 25px rgba(15,23,42,0.08)",
              }}>
              <item.icon
                style={{ margin: "0 auto 1rem", color: "#2563EB" }}
                size={40}
              />
              <h3
                style={{
                  fontWeight: "bold",
                  fontSize: "1.125rem",
                  marginBottom: "0.5rem",
                }}>
                {item.title}
              </h3>
              <p style={{ color: "#495057" }}>{item.text}</p>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            maxWidth: "640px",
            margin: "0 auto",
            backgroundColor: "#FFFFFF",
            padding: "2rem",
            borderRadius: "0.75rem",
            boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
            border: "1px solid #E2E8F0",
          }}>
          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}>
            Leave Message
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input
              type="text"
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleFormChange}
              style={{
                ...styles.inputField,
              }}
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleFormChange}
              style={{
                ...styles.inputField,
                border: "1px solid #E2E8F0",
                borderRadius: "0.25rem",
              }}
            />
            <textarea
              name="message"
              placeholder="Your message"
              rows="5"
              value={formData.message}
              onChange={handleFormChange}
              style={{
                ...styles.inputField,
                resize: "none",
              }}
            />
            <button
              type="submit"
              style={{
                ...styles.buttonSecondary,
                width: "100%",
                padding: "0.75rem",
                marginTop: "1rem",
              }}>
              SEND MESSAGE
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ContactPage;
