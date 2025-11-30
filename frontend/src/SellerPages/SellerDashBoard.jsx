import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SellerFlightsPage() {
  const [flights, setFlights] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [flightToDelete, setFlightToDelete] = useState(null);

  const navigate = useNavigate();

  // Mock flights — Replace later with API request
  useEffect(() => {
    async function load() {
      try {
        const raw = localStorage.getItem('liftoffUser');
        if (!raw) return setFlights([]);
        const session = JSON.parse(raw);
        const username = session.username;
        const id = session._id;
        const q = username ? `?sellerUsername=${encodeURIComponent(username)}` : `?sellerId=${encodeURIComponent(id)}`;
        const res = await fetch(`http://localhost:9000/seller/flights${q}`);
        const json = await res.json();
        setFlights((json && json.flights) || []);
      } catch (err) { console.error('Failed to load seller flights', err); setFlights([]); }
    }
    load();
  }, []);

  const openDeleteModal = (id) => {
    setFlightToDelete(id);
    setShowConfirm(true);
  };

  const [showView, setShowView] = useState(false);
  const [viewFlight, setViewFlight] = useState(null);

  const openViewModal = (flight) => {
    setViewFlight(flight);
    setShowView(true);
  };

  const closeViewModal = () => {
    setShowView(false);
    setViewFlight(null);
  };

  const confirmDelete = async () => {
    if (!flightToDelete) return;
    try {
      const res = await fetch(`http://localhost:9000/flights/${encodeURIComponent(flightToDelete)}`, { method: 'DELETE' });
      if (res.ok) {
        setFlights(prev => prev.filter((f) => (f._id || f.id) !== flightToDelete));
      } else {
        const json = await res.json().catch(() => ({}));
        console.error('Failed to delete flight', json);
        alert('Failed to delete flight');
      }
    } catch (err) {
      console.error('Delete request failed', err);
      alert('Error deleting flight');
    } finally {
      setShowConfirm(false);
      setFlightToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setFlightToDelete(null);
  };
  const handleView = (id) => {
    // find flight in local state and open modal
    const f = flights.find(x => (x._id || x.id) === id) || null;
    if (f) openViewModal(f);
    else navigate(`/flightdetails/${id}`); // fallback
  };
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
                    <th style={styles.th}>Departure</th>
                </tr>
              </thead>

              <tbody>
                {flights.map((f) => (
                  <tr key={f._id || f.id} style={styles.tr}>
                    <td style={styles.td}>{f._id || f.id}</td>
                    <td style={styles.td}>{f.airline}</td>
                    <td style={styles.td}>{f.flightNo}</td>
                    <td style={styles.td}>{f.from} → {f.to}</td>
                    <td style={styles.td}>{f.depart}</td>
                    <td style={styles.td}>{f.arrive}</td>
                    <td style={styles.td}>${f.price}</td>
                    <td style={styles.td}>{f.date ? new Date(f.date).toLocaleDateString() : '—'}</td>
                    <td style={styles.actionCol}>
                      <button style={styles.viewBtn} onClick={() => handleView(f._id || f.id)}>View</button>
                      <button style={styles.deleteBtn} onClick={() => openDeleteModal(f._id || f.id)}>Delete</button>
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
            <h3 style={{ marginTop: 0 }}>Are you sure you want to delete?</h3>
            <p>This action is permanent and can't be undone.</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 18 }}>
              <button style={styles.cancelBtn} onClick={cancelDelete}>Cancel</button>
              <button style={{ ...styles.confirmDeleteBtn, minWidth: 100 }} onClick={confirmDelete}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW FLIGHT DETAILS MODAL */}
      {showView && viewFlight && (
        <div style={styles.overlay}>
          <div style={styles.viewCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>{viewFlight.airline} — {viewFlight.flightNo}</h3>
              <button onClick={closeViewModal} style={{ ...styles.cancelBtn }}>Close</button>
            </div>

            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div><strong>Route:</strong> {viewFlight.from} → {viewFlight.to}</div>
              <div><strong>Date:</strong> {viewFlight.date ? new Date(viewFlight.date).toLocaleDateString() : '—'}</div>
              <div><strong>Price:</strong> ${viewFlight.price}</div>

              <div><strong>Depart:</strong> {viewFlight.depart}</div>
              <div><strong>Arrive:</strong> {viewFlight.arrive}</div>
              <div><strong>Duration:</strong> {viewFlight.durationMin ? `${viewFlight.durationMin} min` : '—'}</div>

              <div><strong>Rating:</strong> {viewFlight.rating || '—'}</div>
              <div><strong>Stops:</strong> {viewFlight.stops != null ? viewFlight.stops : '—'}</div>
              <div><strong>Unique:</strong> {viewFlight.uniqueKey || '—'}</div>
            </div>

            <hr style={{ margin: '12px 0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <h4 style={{ margin: '6px 0' }}>Departure Airport</h4>
                <div><strong>{viewFlight.fromFull || '—'}</strong> ({viewFlight.from})</div>
                <div>Terminal: {viewFlight.terminalFrom || '—'}</div>
                <div>Gate: {viewFlight.gateFrom || '—'}</div>
              </div>

              <div>
                <h4 style={{ margin: '6px 0' }}>Arrival Airport</h4>
                <div><strong>{viewFlight.toFull || '—'}</strong> ({viewFlight.to})</div>
                <div>Terminal: {viewFlight.terminalTo || '—'}</div>
                <div>Gate: {viewFlight.gateTo || '—'}</div>
                <div>Baggage: {viewFlight.baggageClaim || '—'}</div>
              </div>
            </div>

            <hr style={{ margin: '12px 0' }} />

            <div>
              <h4 style={{ margin: '6px 0' }}>Amenities</h4>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {/* amenities object */}
                {['wifi','meals','entertainment','chargingPorts'].map(k => (
                  Boolean(viewFlight.amenities && viewFlight.amenities[k]) ? (
                    <span key={k} style={styles.amenity}>{k === 'chargingPorts' ? 'Charging Ports' : k.charAt(0).toUpperCase() + k.slice(1)}</span>
                  ) : null
                ))}

                {/* other boolean fields */}
                {Boolean(viewFlight.hasUSBOutlets) && <span style={styles.amenity}>USB Outlets</span>}
                {Boolean(viewFlight.hasPowerOutlets) && <span style={styles.amenity}>Power Outlets</span>}
                {Boolean(viewFlight.hasLiveTV) && <span style={styles.amenity}>Live TV</span>}
              </div>

              {/* show explicit yes/no for non-badge fields */}
              <div style={{ marginTop: 8 }}>
                <div>USB Outlets: {viewFlight.hasUSBOutlets ? 'Yes' : 'No'}</div>
                <div>Power Outlets: {viewFlight.hasPowerOutlets ? 'Yes' : 'No'}</div>
                <div>Live TV: {viewFlight.hasLiveTV ? 'Yes' : 'No'}</div>
              </div>
            </div>

            <hr style={{ margin: '12px 0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <h4 style={{ margin: '6px 0' }}>Baggage</h4>
                <div>Carry-on: {viewFlight.carryOnBagsAllowed || '—'}</div>
                <div>Checked: {viewFlight.checkedBagsAllowed || '—'}</div>
                <div>Extra fee: ${viewFlight.extraBagFeeUSD || '—'}</div>
              </div>

              <div>
                <h4 style={{ margin: '6px 0' }}>Aircraft</h4>
                <div>Model: {viewFlight.aircraftModel || '—'}</div>
                <div>Capacity: {viewFlight.aircraftCapacity || '—'}</div>
                <div>Seat layout: {viewFlight.seatLayout || '—'}</div>
              </div>
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
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    width: "160px",
    paddingRight: "10px",
    padding: "12px 10px",
    verticalAlign: "middle",
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

  viewCard: {
  width: "1100px",
  maxWidth: "98vw",
  background: "white",
  borderRadius: "12px",
  padding: "28px",
  boxShadow: "0 12px 40px rgba(0,0,0,0.14)",
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
