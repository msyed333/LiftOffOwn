import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SellerFlightsPage() {
  const [flights, setFlights] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [flightToDelete, setFlightToDelete] = useState(null);

  const navigate = useNavigate();

  // Mock flights — Replace later with API request
  useEffect(() => {
    setFlights([
      {
        id: "FL001",
        airline: "Delta Airlines",
        flightNo: "DL245",
        from: "JFK",
        to: "LAX",
        depart: "08:30 AM",
        arrive: "11:15 AM",
        price: 299,
      },
      {
        id: "FL002",
        airline: "American Airlines",
        flightNo: "AA110",
        from: "ORD",
        to: "MIA",
        depart: "09:45 AM",
        arrive: "01:00 PM",
        price: 320,
      },
    ]);
  }, []);

  const openDeleteModal = (id) => {
    setFlightToDelete(id);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    setFlights(flights.filter((f) => f.id !== flightToDelete));
    setShowConfirm(false);
    setFlightToDelete(null);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setFlightToDelete(null);
  };

  const handleEdit = (id) => navigate(`/editflight/${id}`);
  const handleView = (id) => navigate(`/flightdetails/${id}`);
  const handleLogout = () => {
    // clear session and go to homepage (or login)
    try { localStorage.removeItem('liftoffUser'); } catch(e){}
    navigate('/');
  };

  return (
    <div style={styles.page}>

      {/* =======================
          SELLER HEADER
      ======================= */}
      <header style={styles.header}>
        <div style={{ ...styles.container, ...styles.headerFlex }}>
          
          <div style={styles.brand}>LiftOff Seller</div>

          <nav style={styles.nav}>
            <Link style={styles.link} to="/seller-manage-delays">Manage-Flights-Status</Link>
            <Link style={styles.link} to="/support">Customer-Support</Link>
          </nav>

          <div style={styles.authButtons}>
            <Link to="/seller-profile" className="nav-login-btn">Profile</Link>
            <button type="button" onClick={handleLogout} className="nav-signup-btn">Logout</button>
          </div>

        </div>
      </header>

      {/* =======================
          MAIN CONTENT
      ======================= */}
      <main style={styles.hero}>
        <div style={styles.heroInner}>

          <h2 style={styles.title}>Manage Your Flights</h2>

          <div style={styles.sectionCard}>
            <h3>Flights You Added</h3>

            {/* ===== TABLE ===== */}
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Airline</th>
                  <th style={styles.th}>Flight No</th>
                  <th style={styles.th}>Route</th>
                  <th style={styles.th}>Departure</th>
                  <th style={styles.th}>Arrival</th>
                  <th style={styles.th}>Price ($)</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {flights.map((f) => (
                  <tr key={f.id} style={styles.tr}>
                    <td style={styles.td}>{f.id}</td>
                    <td style={styles.td}>{f.airline}</td>
                    <td style={styles.td}>{f.flightNo}</td>
                    <td style={styles.td}>{f.from} → {f.to}</td>
                    <td style={styles.td}>{f.depart}</td>
                    <td style={styles.td}>{f.arrive}</td>
                    <td style={styles.td}>${f.price}</td>

                    <td style={styles.actionCol}>
                      <button style={styles.viewBtn} onClick={() => handleView(f.id)}>View</button>
                      <button style={styles.editBtn} onClick={() => handleEdit(f.id)}>Edit</button>
                      <button style={styles.deleteBtn} onClick={() => openDeleteModal(f.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ======================= */}
          {/* Add Flight Button BELOW */}
          {/* ======================= */}
          <button
            style={styles.addFlightBtn}
            onClick={() => navigate("/seller-add-flight")}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1.0)")}
          >
            + Add New Flight
          </button>

        </div>
      </main>

      {/* =======================
          DELETE CONFIRMATION
      ======================= */}
      {showConfirm && (
        <div style={styles.overlay}>
          <div style={styles.confirmCard}>
            <h3 style={{ marginTop: 0 }}>Delete Flight?</h3>
            <p>This action cannot be undone.</p>

            <div style={styles.confirmButtons}>
              <button style={styles.cancelBtn} onClick={cancelDelete}>Cancel</button>
              <button style={styles.confirmDeleteBtn} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/***************************
 *         STYLES
 ***************************/
const styles = {
  /* HEADER */
  header: {
    background: "white",
    borderBottom: "1px solid #e3e6ea",
    padding: "12px 0",
    position: "sticky",
    top: 0,
    zIndex: 900,
  },

  container: {
    width: "1200px",
    margin: "0 auto",
    padding: "0 20px",
  },

  headerFlex: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  brand: {
    fontSize: "22px",
    fontWeight: 700,
    color: "#1b4fba",
  },

  nav: {
    display: "flex",
    gap: "25px",
  },

  link: {
    fontSize: "15px",
    color: "#333",
    textDecoration: "none",
    fontWeight: 500,
  },

  authButtons: {
    display: "flex",
    gap: "15px",
  },

  /* PAGE WRAPPER */
  page: {
    fontFamily: "system-ui, sans-serif",
    color: "#111",
  },

  /* MAIN CONTAINER */
  hero: {
    background: "#f6f7fbce",
    padding: "30px 0",
    borderRadius: "20px",
    width: "1200px",
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

  /* WHITE CARD */
  sectionCard: {
    width: "1100px",
    background: "white",
    border: "1px solid #e7ebf0",
    borderRadius: 12,
    padding: 25,
    boxShadow: "0 1px 3px rgba(0,0,0,.05)",
  },

  /* TABLE */
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 15,
  },

  th: {
    textAlign: "left",
    padding: "12px 10px",
    background: "#f0f2f5",
    borderBottom: "1px solid #ddd",
    fontWeight: 600,
  },

  tr: {
    borderBottom: "1px solid #eee",
    height: "60px",
    verticalAlign: "middle",
  },

  td: {
    padding: "12px 10px",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
  },

  actionCol: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    width: "160px",
    paddingRight: "10px",
  },

  /* BUTTONS */
  viewBtn: {
    padding: "6px 12px",
    background: "#4b8ef7",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
  },

  editBtn: {
    padding: "6px 12px",
    background: "#f7b84b",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
  },

  deleteBtn: {
    padding: "6px 12px",
    background: "#e25454",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
  },

  /* DELETE POPUP */
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },

  confirmCard: {
    width: "400px",
    background: "white",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },

  confirmButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },

  cancelBtn: {
    padding: "8px 14px",
    borderRadius: 6,
    border: "1px solid #ccc",
    background: "#f7f7f7",
    cursor: "pointer",
  },

  confirmDeleteBtn: {
    padding: "8px 14px",
    borderRadius: 6,
    background: "#e25454",
    color: "white",
    border: "none",
    cursor: "pointer",
  },

  /* ADD FLIGHT BUTTON */
  addFlightBtn: {
    marginTop: "25px",
    marginBottom: "20px",
    background: "linear-gradient(135deg, #2f6feb, #1b4fba)",
    color: "white",
    padding: "16px 40px",
    border: "none",
    borderRadius: "12px",
    fontSize: "18px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "0.2s",
    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
  },
};
