import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function SellerProfilePage() {
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);

  // ⭐ Mock seller data
  useEffect(() => {
    const mockSeller = {
      name: "John Anderson",
      airline: "Delta Airlines",
      employeeID: "DAL-EMP-1023",
      email: "john.anderson@deltaair.com",
      phone: "(555) 482-1294",
      role: "Flight Operations Manager",
      joined: "March 2022",
      location: "Atlanta, GA",
    };

    setSeller(mockSeller);
  }, []);

  if (!seller) return <div style={{ padding: 30 }}>Loading…</div>;

  return (
    <div style={styles.page}>
      <main style={styles.hero}>
        <div style={styles.heroInner}>

          <h2 style={styles.title}>Seller Profile</h2>

          <div style={styles.sectionCard}>

            <div style={styles.infoGrid}>
              <p><strong>Full Name:</strong> {seller.name}</p>
              <p><strong>Airline:</strong> {seller.airline}</p>
              <p><strong>Employee ID:</strong> {seller.employeeID}</p>
              <p><strong>Email:</strong> {seller.email}</p>
              <p><strong>Phone:</strong> {seller.phone}</p>
              <p><strong>Role:</strong> {seller.role}</p>
              <p><strong>Office Location:</strong> {seller.location}</p>
              <p><strong>Joined:</strong> {seller.joined}</p>
            </div>

            <button
              style={styles.backBtn}
              onClick={() => navigate("/seller-dashboard")}
            >
              ← Back to Flights
            </button>

          </div>
        </div>
      </main>
    </div>
  );
}


/* -------------------------------------
   STYLES — matches other seller pages
------------------------------------- */

const styles = {
  page: {
    fontFamily: "system-ui, sans-serif",
    color: "#111",
  },

  hero: {
    background: "#f6f7fbce",
    padding: "30px 0",
    borderRadius: "20px",
    width: "1100px",
    margin: "20px auto",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },

  heroInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 25,
  },

  title: {
    fontSize: 28,
    fontWeight: 700,
  },

  sectionCard: {
    width: "1000px",
    background: "white",
    borderRadius: 12,
    border: "1px solid #e7ebf0",
    padding: 25,
    boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "10px 30px",
    fontSize: "17px",
    lineHeight: "28px",
    marginBottom: 20,
  },

  editBtn: {
    width: "100%",
    padding: "15px",
    background: "linear-gradient(135deg, #2f6feb, #1b4fba)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "17px",
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: "10px",
  },

  backBtn: {
    width: "100%",
    padding: "13px",
    background: "#ddd",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: 15,
  },
};
