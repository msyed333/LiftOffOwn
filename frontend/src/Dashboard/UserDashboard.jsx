import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import "./UserDashboard.css";


export default function UserDashboard() {
  const [tab, setTab] = useState("info");

  return (
    <div className="user-page">
      <div className="user-header">
        <h1>Your Profile</h1>
        <p>Manage your profile, flights, and rewards</p>
      </div>

      <div className="user-tabs">
        {["info", "flights", "points", "checkin"].map((name) => (
          <button
            key={name}
            onClick={() => setTab(name)}
            className={`tab-btn ${tab === name ? "active" : ""}`}
          >
            {name === "info" && "My Info"}
            {name === "flights" && "My Flights"}
            {name === "points" && "My Points"}
            {name === "checkin" && "Check-In"}
          </button>
        ))}
      </div>

      <div className="user-content">
        {tab === "info" && <ProfileInfo />}
        {tab === "flights" && <FlightHistory />}
        {tab === "points" && <Points />}
        {tab === "checkin" && <CheckIn />}
      </div>
    </div>
  );
}

// ==========================================================

function ProfileInfo() {
  const user = JSON.parse(localStorage.getItem("liftoffUser"));

  const [isEditingCard, setIsEditingCard] = useState(false);
  const [cardInfo, setCardInfo] = useState(() => {
    const saved = localStorage.getItem("userCardInfo");
    return saved ? JSON.parse(saved) : { cardNumber: "", cardName: "", expiry: "", cvv: "" };
  });
  const [tempCardInfo, setTempCardInfo] = useState(cardInfo);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [showValidationModal, setShowValidationModal] = useState(false);

  useEffect(() => {
    if (!user) return;

    axios.get(`http://localhost:9000/userCard/${user._id}`)
      .then(res => {
        if (res.data) {
          const mappedCard = {
            cardNumber: res.data.cardNumber,
            cardName: res.data.cardHolder,
            expiry: res.data.expiry,
            cvv: ""
          };

          setCardInfo(mappedCard);
          setTempCardInfo(mappedCard);
        }
      })
      .catch(err => console.error("Fetch card error:", err));
  }, [user]);



  const saveCardToDB = async () => {
    if (!user) {
      setValidationMessage("Please log in");
      setShowValidationModal(true);
      return;
    }

    if (!tempCardInfo.cardNumber || !tempCardInfo.cardName || !tempCardInfo.expiry || !tempCardInfo.cvv) {
      setValidationMessage("All fields are required. Please fill in Card Number, Cardholder Name, Expiry, and CVV.");
      setShowValidationModal(true);
      return;
    }

    if (tempCardInfo.cardNumber.length !== 16 || !/^\d+$/.test(tempCardInfo.cardNumber)) {
      setValidationMessage("Card number must be 16 digits.");
      setShowValidationModal(true);
      return;
    }

    if (/\d/.test(tempCardInfo.cardName)) {
      setValidationMessage("Cardholder name cannot contain numbers.");
      setShowValidationModal(true);
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(tempCardInfo.expiry)) {
      setValidationMessage("Expiry must be in MM/YY format.");
      setShowValidationModal(true);
      return;
    }

    const [month, year] = tempCardInfo.expiry.split("/");
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (monthNum < 1 || monthNum > 12) {
      setValidationMessage("Month must be between 01 and 12.");
      setShowValidationModal(true);
      return;
    }

    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
      setValidationMessage("Expiry date must be in the future.");
      setShowValidationModal(true);
      return;
    }

    if (!/^\d{3,4}$/.test(tempCardInfo.cvv)) {
      setValidationMessage("CVV must be 3 or 4 digits.");
      setShowValidationModal(true);
      return;
    }

    try {
      await axios.post("http://localhost:9000/saveCard", {
        userId: user._id,
        cardNumber: tempCardInfo.cardNumber,
        cardHolder: tempCardInfo.cardName,
        expiry: tempCardInfo.expiry
      });

      setCardInfo(tempCardInfo);
      setIsEditingCard(false);
      setValidationMessage("Card saved successfully!");
      setShowValidationModal(true);

    } catch (err) {
      console.error("Card Save Error:", err);
      setValidationMessage("Failed to save card");
      setShowValidationModal(true);
    }
  };


  const handleCancelCard = () => {
    setTempCardInfo(cardInfo);
    setIsEditingCard(false);
  };

  const handleDeleteCard = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCard = async () => {
    try {
      await axios.delete(`http://localhost:9000/deleteCard/${user._id}`);

      const emptyCard = { cardNumber: "", cardName: "", expiry: "", cvv: "" };
      setCardInfo(emptyCard);
      setTempCardInfo(emptyCard);
      setShowDeleteConfirm(false);
      setValidationMessage("Card deleted successfully");
      setShowValidationModal(true);
    } catch (err) {
      console.error("Delete error:", err);
      setValidationMessage("Failed to delete card");
      setShowValidationModal(true);
    }
  };


  const cancelDeleteCard = () => {
    setShowDeleteConfirm(false);
  };

  const maskCardNumber = (cardNumber) => {
    if (!cardNumber) return "";
    return "**** **** **** " + cardNumber.slice(-4);
  };


  return (
    <div className="profile-card">
      <p>
        <strong className="highlight">Name:</strong> 
        {user ? ` ${user.firstName} ${user.lastName}` : " Not logged in"}
      </p>

      <p>
        <strong className="highlight">Email:</strong> 
        {user ? ` ${user.username}` : " Not logged in"}
      </p>

      <p>
        <strong className="highlight">Frequent Flyer #:</strong> 
        {user ? ` LIFT-${user._id.slice(-5).toUpperCase()}` : "N/A"} 
      </p>

      <p>
        <strong className="highlight">Upcoming Flight:</strong>  
        You currently have no upcoming flights.
      </p>

      <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "2px solid #f0f0f0" }}>
        <p style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: 700 }}>
          <strong className="highlight">Card Info</strong>
        </p>

        {isEditingCard ? (
          <div style={{ display: "grid", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#666" }}>
                Card Number (16 digits)
              </label>
              <input
                type="text"
                maxLength="16"
                placeholder="1234567890123456"
                value={tempCardInfo.cardNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setTempCardInfo({ ...tempCardInfo, cardNumber: value });
                }}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #cfd7df",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#666" }}>
                Cardholder Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={tempCardInfo.cardName}
                onChange={(e) => setTempCardInfo({ ...tempCardInfo, cardName: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #cfd7df",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#666" }}>
                Expiry (MM/YY)
              </label>
              <input
                type="text"
                maxLength="5"
                placeholder="12/25"
                value={tempCardInfo.expiry}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, "");
                  if (value.length >= 2) {
                    value = value.slice(0, 2) + "/" + value.slice(2, 4);
                  }
                  setTempCardInfo({ ...tempCardInfo, expiry: value });
                }}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #cfd7df",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "#666" }}>
                CVV (3-4 digits)
              </label>
              <input
                type="password"
                maxLength="4"
                placeholder="123"
                value={tempCardInfo.cvv}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setTempCardInfo({ ...tempCardInfo, cvv: value });
                }}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #cfd7df",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button
                onClick={saveCardToDB}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "14px"
                }}
              >
                Save Card
              </button>
              <button
                onClick={handleCancelCard}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  background: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "14px"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {cardInfo.cardNumber ? (
              <div style={{
                background: "#f8f9fa",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid #e7ebf0"
              }}>
                <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#666" }}>
                  <strong>Card Number:</strong> {maskCardNumber(cardInfo.cardNumber)}
                </p>
                <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#666" }}>
                  <strong>Cardholder:</strong> {cardInfo.cardName}
                </p>
                <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#666" }}>
                  <strong>Expires:</strong> {cardInfo.expiry}
                </p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={handleDeleteCard}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "14px"
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                background: "#f8f9fa",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid #e7ebf0",
                textAlign: "center"
              }}>
                <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#666" }}>
                  No card saved yet.
                </p>
                <button
                  onClick={() => setIsEditingCard(true)}
                  style={{
                    padding: "8px 16px",
                    background: "#2f6feb",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "14px"
                  }}
                >
                  Add Card
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showDeleteConfirm && (
        <>
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}>
            <div style={{
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
              textAlign: "center"
            }}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "18px", fontWeight: 700, color: "#111" }}>
                Delete Card?
              </h3>

              <p style={{ margin: "0 0 24px 0", fontSize: "14px", color: "#666", lineHeight: "1.5" }}>
                Are you sure you want to delete this card? This action cannot be undone.
              </p>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={cancelDeleteCard}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    background: "#e9ecef",
                    color: "#333",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "14px",
                    transition: "background 0.2s"
                  }}
                  onMouseOver={(e) => e.target.style.background = "#dee2e6"}
                  onMouseOut={(e) => e.target.style.background = "#e9ecef"}
                >
                  Cancel
                </button>

                <button
                  onClick={confirmDeleteCard}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    background: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "14px",
                    transition: "background 0.2s"
                  }}
                  onMouseOver={(e) => e.target.style.background = "#c82333"}
                  onMouseOut={(e) => e.target.style.background = "#dc3545"}
                >
                  Delete Card
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {showValidationModal && (
        <>
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1001
          }}>
            <div style={{
              background: "white",
              borderRadius: "12px",
              padding: "32px",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
              textAlign: "center"
            }}>
              <p style={{ margin: "0 0 24px 0", fontSize: "16px", color: "#333", lineHeight: "1.6" }}>
                {validationMessage}
              </p>

              <button
                onClick={() => setShowValidationModal(false)}
                style={{
                  padding: "10px 24px",
                  background: "#195cec",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "14px",
                  transition: "background 0.2s"
                }}
                onMouseOver={(e) => e.target.style.background = "#0f46b2"}
                onMouseOut={(e) => e.target.style.background = "#195cec"}
              >
                OK
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


function FlightHistory() {
  const user = JSON.parse(localStorage.getItem("liftoffUser"));
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    axios.get(`http://localhost:9000/myBookings/${user._id}`)
      .then(res => {
        setBookings(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading bookings:", err);
        setLoading(false);
      });
  }, [user]);

  if (!user) return <p>Please log in to see your flights.</p>;

  if (loading) return <p>Loading your flights...</p>;

  if (bookings.length === 0) {
    return <p>You haven’t booked any flights yet.</p>;
  }

    return (
      <div>
        <h2 className="section-title">My Booked Flights</h2>

        <ul className="flight-list">
          {[...bookings].reverse().map((b) => (
            <li key={b._id} className="flight-item">
              <div>
                <p className="flight-route">
                  {b.from} → {b.to}
                </p>

                <p className="flight-date">
                  {b.airline} — Departs at {b.depart} on {b.date}
                </p>

                <p>Confirmation Code: <strong>{b.confirmationCode}</strong></p>

                <p>Boooked on: <strong>{b.bookingDate}</strong></p>
                <p>Price: <strong>{b.price} per person</strong></p>
                <p>Number of Passengers: <strong>{b.passengerCount} per person</strong></p>
                <p>Total Price: <strong>${(Number(b.price) * b.passengerCount).toFixed(2)}</strong></p>
                <p>Points Earnes: <strong>{(Number(b.price) * b.passengerCount).toFixed(1)*10}</strong></p>
              </div>

            </li>
          ))}
        </ul>
      </div>
    );
  }


function Points() {
  const user = JSON.parse(localStorage.getItem("liftoffUser"));
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const nextReward = 10000;

  useEffect(() => {
    if (!user) return;

    // Fetch latest user (to get current totalPoints) and also fetch points history
    const fetch = async () => {
      try {
        const userRes = await axios.get(`http://localhost:9000/user/${user._id}`);
        if (userRes.data && userRes.data.user) {
          setPoints(userRes.data.user.totalPoints || 0);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }

      try {
        const ptsRes = await axios.get(`http://localhost:9000/user/points/${user._id}`);
        if (ptsRes.data) {
          setHistory(ptsRes.data.history || []);
        }
      } catch (err) {
        console.error('Error loading points history:', err);
      }

      setLoading(false);
    };

    fetch();
    // listen for global user updates
    const onUserUpdated = (e) => {
      // re-run fetch when payment page updates localStorage
      fetch();
    };
    window.addEventListener('liftoffUserUpdated', onUserUpdated);

    // fallback: listen for localStorage changes by other tabs
    const onStorage = (ev) => {
      if (ev.key === 'liftoffUserUpdatedAt') fetch();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('liftoffUserUpdated', onUserUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, [user]);

  if (!user) return <p>Please log in to view your points.</p>;

  if (loading) return <p>Loading your points...</p>;

  const percentage = Math.min((points / nextReward) * 100, 100);

  return (
    <div>
      <div className="points-summary">
        <h2 className="section-title">Your Rewards</h2>

        <p className="points-text">
          Total Points: <span className="highlight">{points} of 10,000</span>
        </p>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
        </div>

        <p className="points-subtext">
          {Math.max(nextReward - points, 0)} points to your next flight upgrade!
        </p>
      </div>

      <h3 className="section-subtitle">Point History</h3>

      {history.length === 0 ? (
        <p>No points activity yet.</p>
      ) : (
        <div className="points-history">
          {[...history].reverse().map((item, index) => (
            <div key={index} className="points-history-card">
              <div>
                <p className="points-flight">{item.flight}</p>
                <p className="points-date">{item.date}</p>
                <p className="points-note">{item.note}</p>
              </div>

              <span className={`points-change ${item.change && item.change.startsWith('-') ? 'redeemed' : 'earned'}`}>
                {item.change}
                {item.value !== undefined && (
                  <div style={{ fontSize: 12, color: '#666' }}>
                    {Number(item.value) >= 0 ? '+' : ''}${Number(item.value).toFixed(2)}
                  </div>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function CheckIn() {
  const [code, setCode] = useState("");
  const [last, setLast] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const reservations = useMemo(
    () => [
      {
        confirmation: "DL7K3Q",
        last: "Irfan",
        first: "Saba",
        airline: "Delta",
        flightNo: "DL 1234",
        from: "JFK",
        to: "LHR",
        departIso: "2025-11-20T08:30:00-05:00",
        checkedIn: false,
      },
      {
        confirmation: "UA55AA",
        last: "Syed",
        first: "Malka",
        airline: "United",
        flightNo: "UA 22",
        from: "EWR",
        to: "SFO",
        departIso: "2025-11-20T07:10:00-05:00",
        checkedIn: true,
      },
    ],
    []
  );

  function findReservation(e) {
    e.preventDefault();
    setError("");

    const hit = reservations.find(
      r =>
        r.confirmation.toUpperCase() === code.trim().toUpperCase() &&
        r.last.toLowerCase() === last.trim().toLowerCase()
    );

    if (!hit) {
      setResult(null);
      setError("No reservation found. Check your code and last name.");
      return;
    }

    setResult({ ...hit });
  }

  function canCheckIn(depIso) {
    const dep = new Date(depIso).getTime();
    const now = Date.now();
    const open = dep - 8 * 60 * 60 * 1000;
    return now >= open && now < dep;
  }

  function formatDT(depIso) {
    const d = new Date(depIso);
    return d.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  }

  function handleCheckIn() {
    setResult(prev => ({ ...prev, checkedIn: true }));
  }

  const eligible = result ? canCheckIn(result.departIso) : false;

  return (
    <div className="checkin-card">
      <h2 className="checkin-title">Check-In</h2>
      <p className="checkin-instruction">
        Check in for your upcoming flight up to <strong>8 hours before departure</strong>.
      </p>

      <form onSubmit={findReservation} className="checkin-form">
        <label>
          Confirmation Code
          <input
            placeholder="e.g., DL7K3Q"
            value={code}
            onChange={e => setCode(e.target.value)}
          />
        </label>

        <label>
          Last Name
          <input
            placeholder="e.g., Irfan"
            value={last}
            onChange={e => setLast(e.target.value)}
          />
        </label>

        <button type="submit">Find my trip</button>
        
        {error && <div className="error-msg">{error}</div>}
      </form>

      {result && (
        <div className="checkin-result">
          <p><strong>{result.airline}</strong> — {result.flightNo}</p>
          
          <p>{result.from} → {result.to}</p>
          
          <p>Departure: {formatDT(result.departIso)}</p>

          <p>
            Status:{" "}
            {result.checkedIn ? (
              <strong className="status-success">Checked in ✅</strong>
            ) : eligible ? (
              <strong className="status-open">Check-in available</strong>
            ) : (
              <span className="status-closed">Opens 8h before departure</span>
            )}
          </p>

          {!result.checkedIn && eligible && (
            <button className="checkin-now" onClick={handleCheckIn}>
              Check in now
            </button>
          )}
        </div>
      )}
    </div>
  );
}
