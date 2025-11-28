import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const SellerSignUpPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    orgName: "",
    businessNumber: "",
    businessEmail: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword(!showPassword);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Seller Sign Up Data:", formData);
    alert("Seller account created successfully!");
  };

  return (
    <div className="seller-signup-wrapper">
      <div className="seller-message-frame">
        <h1 className="seller-welcome-title">Welcome to LiftOff</h1>
        <p className="seller-message-text">
          Are you interested in becoming a seller with us? Please complete the signup process using the link below. Our team will review your submission and respond within 2–3 business days.
        </p>
      </div>
      
      <div className="login-container">
      <div className="login-card" style={{ paddingBottom: "40px" }}>
        {/* ======= HEADER ======= */}
        <div className="login-header">
          <h2 className="logo-text">LiftOff</h2>
        </div>

        {/* ======= FORM ======= */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="form-group" style={{ marginBottom: "14px" }}>
            <label
              htmlFor="fullName"
              style={{
                display: "block",
                marginBottom: "5px",
                color: "#3d4468",
                fontWeight: "600",
              }}
            >
              Full Name
            </label>
            <div className="neu-input">
              <span className="input-icon">
                {/* 👤 User Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder=" "
                value={formData.fullName}
                onChange={handleChange}
                required
                style={{ paddingLeft: "50px" }}
              />
              <label htmlFor="fullName">First and Last Name</label>
            </div>
          </div>

          {/* Organization Name */}
          <div className="form-group" style={{ marginBottom: "14px" }}>
            <label
              htmlFor="orgName"
              style={{
                display: "block",
                marginBottom: "5px",
                color: "#3d4468",
                fontWeight: "600",
              }}
            >
              Organization Name
            </label>
            <div className="neu-input">
              <span className="input-icon">
                {/* 🏢 Building Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 21h18M4 21V3h7v18M13 13h7v8" />
                </svg>
              </span>
              <input
                type="text"
                id="orgName"
                name="orgName"
                placeholder=" "
                value={formData.orgName}
                onChange={handleChange}
                required
                style={{ paddingLeft: "50px" }}
              />
              <label htmlFor="orgName">Organization Name</label>
            </div>
          </div>

          {/* Business Number */}
          <div className="form-group" style={{ marginBottom: "14px" }}>
            <label
              htmlFor="businessNumber"
              style={{
                display: "block",
                marginBottom: "5px",
                color: "#3d4468",
                fontWeight: "600",
              }}
            >
              Business Number
            </label>
            <div className="neu-input">
              <span className="input-icon">
                {/* 🔢 Hash Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="4" y1="9" x2="20" y2="9" />
                  <line x1="4" y1="15" x2="20" y2="15" />
                  <line x1="10" y1="3" x2="8" y2="21" />
                  <line x1="16" y1="3" x2="14" y2="21" />
                </svg>
              </span>
              <input
                type="text"
                id="businessNumber"
                name="businessNumber"
                placeholder=" "
                value={formData.businessNumber}
                onChange={handleChange}
                required
                style={{ paddingLeft: "50px" }}
              />
              <label htmlFor="businessNumber">Business Number</label>
            </div>
          </div>

          {/* Business Email */}
          <div className="form-group" style={{ marginBottom: "14px" }}>
            <label
              htmlFor="businessEmail"
              style={{
                display: "block",
                marginBottom: "5px",
                color: "#3d4468",
                fontWeight: "600",
              }}
            >
              Business Email
            </label>
            <div className="neu-input">
              <span className="input-icon">
                {/* ✉️ Email Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4a2 2 0 0 1-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <input
                type="email"
                id="businessEmail"
                name="businessEmail"
                placeholder=" "
                value={formData.businessEmail}
                onChange={handleChange}
                required
                style={{ paddingLeft: "50px" }}
              />
              <label htmlFor="businessEmail">Business Email</label>
            </div>
          </div>

          {/* Password */}
          <div className="form-group" style={{ marginBottom: "14px" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "5px",
                color: "#3d4468",
                fontWeight: "600",
              }}
            >
              Password
            </label>
            <div className="neu-input password-group">
              <span className="input-icon">
                {/* 🔒 Lock Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder=" "
                value={formData.password}
                onChange={handleChange}
                required
                style={{ paddingLeft: "50px" }}
              />
              <label htmlFor="password">Password</label>

              <button
                type="button"
                className={`neu-toggle ${showPassword ? "show-password" : ""}`}
                onClick={togglePassword}
                aria-label="Toggle password visibility"
              >
                <svg
                  className="eye-open"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg
                  className="eye-closed"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="neu-button signup-btn"
            style={{ marginTop: "12px" }}
          >
            <span className="btn-text">Sign Up as Seller</span>
          </button>

          {/* Back to Home */}
          <button
            type="button"
            className="neu-button"
            onClick={() => navigate("/")}
            style={{
              background: "#e5e9ef",
              color: "#3d4468",
              fontWeight: "600",
              marginTop: "10px",
              padding: "12px 24px",
            }}
          >
            ← Back to Home Page
          </button>
        </form>
      </div>
      </div>
    </div>
  );
};

export default SellerSignUpPage;
