import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function FlightStatusPage() {
  const navigate = useNavigate();

  const [flight, setFlight] = useState(null);

  // ⭐ MOCK DATA — replace with backend later
  useEffect(() => {
    const mockFlight = {
      id: "FL001",
      airline: "Delta Airlines",
      flightNo: "DL245",
      from: "JFK",
      to: "LAX",
      depart: "08:30 AM",
      arrive: "11:15 AM",
      price: 299,
      status: "On-Time",
    };

    setFlight(mockFlight);
  }, []);

  if (!flight) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={styles.page}>
      <main style={styles.hero}>
        <div style={styles.heroInner}>

          <h2 style={styles.title}>Flight Status</h2>

          <div style={styles.sectionCard}>

            {/* ⭐ Flight Information Section */}
            <div style={styles.infoGrid}>
              <p><strong>Flight ID:</strong> {flight.id}</p>
              <p><strong>Airline:</strong> {flight.airline}</p>
              <p><strong>Flight No:</strong> {flight.flightNo}</p>
              <p><strong>Route:</strong> {flight.from} → {flight.to}</p>
              <p><strong>Departure:</strong> {flight.depart}</p>
              <p><strong>Arrival:</strong> {flight.arrive}</p>
              <p><strong>Price:</strong> ${flight.price}</p>
              <p><strong>Current Status:</strong> {flight.status}</p>
            </div>

            <hr style={styles.separator} />

            {/* ⭐ Status Options (Styled Like Table Badges) */}
            <div style={styles.statusRow}>
              <span style={styles.badgeDelayed}>Delayed</span>
              <span style={styles.badgeCancelled}>Cancelled</span>
            </div>

            {/* ⭐ Update Status Button */}
            <button
              onClick={() => navigate("/flightstatus/update/FL001")}
              style={styles.updateBtn}
            >
              Update Status
            </button>

            {/* ⭐ Back Button */}
            <button
              onClick={() => navigate("/seller-profile")}
              style={styles.backBtn}
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
   STYLES — Matches Manage Flights Page
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
    gap: "12px 30px",
    fontSize: "16px",
    lineHeight: "26px",
  },

  separator: {
    margin: "20px 0",
    border: "none",
    borderBottom: "1px solid #ddd",
  },

  statusRow: {
    display: "flex",
    gap: 15,
    marginBottom: 20,
  },

  badgeDelayed: {
    padding: "6px 14px",
    background: "#f7b84b",
    color: "white",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
  },

  badgeCancelled: {
    padding: "6px 14px",
    background: "#e25454",
    color: "white",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
  },

  updateBtn: {
    width: "100%",
    padding: "16px",
    background: "linear-gradient(135deg, #2f6feb, #1b4fba)",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontSize: 17,
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: "10px",
  },

  backBtn: {
    width: "100%",
    padding: "14px",
    background: "#ddd",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontSize: 15,
  },
};
