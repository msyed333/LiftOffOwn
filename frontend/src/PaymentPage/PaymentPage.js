// import React, { useState, } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import axios from "axios";


// const PaymentPage = () => {
//   const { state } = useLocation();
//   const { flight } = state || {};
//   const navigate = useNavigate();

//   // Passenger Details
//   const [passengerCount, setPassengerCount] = useState(1);
//   const [seatingPreference, setSeatingPreference] = useState("together");
//   const user = JSON.parse(localStorage.getItem("liftoffUser"));


//   const [passengerList, setPassengerList] = useState([
//     { fullName: "", age: "" }
//   ]);

//   // Contact + Payment Details
//   const [email, setEmail] = useState("");
//   const [cardName, setCardName] = useState("");
//   const [cardNumber, setCardNumber] = useState("");
//   const [expiry, setExpiry] = useState("");
//   const [cvv, setCvv] = useState("");

//   // Confirm + Loader states
//   const [isLoading, setIsLoading] = useState(false);
//   const [isConfirmed, setIsConfirmed] = useState(false);
//   const [message, setMessage] = useState("");

//   // Base price
//   const basePrice = flight?.price || 108.99;
//   const tax = (basePrice * passengerCount * 0.03);
//   const total = ((basePrice * passengerCount) + tax).toFixed(2);

//   // ===== Handle passenger count change =====
//   const handlePassengerCountChange = (e) => {
//     const count = parseInt(e.target.value);
//     setPassengerCount(count);

//     let updated = [...passengerList];

//     if (count > updated.length) {
//       for (let i = updated.length; i < count; i++) {
//         updated.push({ fullName: "", age: "" });
//       }
//     } else {
//       updated = updated.slice(0, count);
//     }

//     setPassengerList(updated);
//   };

//   // ===== Submit Form =====
//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (!email || !cardName || !cardNumber || !expiry || !cvv) {
//       setMessage("⚠️ Please fill all required fields.");
//       return;
//     }

//     for (let p of passengerList) {
//       if (!p.fullName || !p.age) {
//         setMessage("⚠️ Please complete all passenger details.");
//         return;
//       }
//     }

//     setIsLoading(true);

//     setTimeout(() => {
//       setIsLoading(false);
//       saveBookingToDB();   // ⬅ SAVE to MongoDB + redirect
//     }, 2500);
//   };


// const saveBookingToDB = async () => {
//   const booking = {
//     userId: user._id,
//     flightId: flight._id,   // ✅ MongoDB ID

//     passengerCount,
//     passengers: passengerList,
//     seatingPreference,
//     email,

//     airline: flight.airline,
//     from: flight.from,
//     to: flight.to,
//     depart: flight.depart,
//     arrive: flight.arrive,

//     price: total,
//     confirmationCode: generateCode(),
//     bookingDate: new Date().toISOString()
//   };

//   try {
//     await axios.post("http://localhost:9000/bookFlight", booking);

//     navigate("/confirmation", { state: { booking } });

//   } catch (err) {
//     console.log("Booking Error →", err);
//   }
// };

// function generateCode() {
//   return "LIFT" + Math.random().toString(36).substring(2, 8).toUpperCase();
// }

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const PaymentPage = () => {
  const { state } = useLocation();
  const { flightId } = state || {};
  const navigate = useNavigate();

  const [flight, setFlight] = useState(null);

  const [passengerCount, setPassengerCount] = useState(1);
  const [seatingPreference, setSeatingPreference] = useState("together");
  const user = JSON.parse(localStorage.getItem("liftoffUser"));

  const [passengerList, setPassengerList] = useState([
    { fullName: "", age: "" }
  ]);

  const [email, setEmail] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Fetch flight from MongoDB
  useEffect(() => {
    if (!flightId) return;

    axios.get(`http://localhost:9000/flights/${flightId}`)
      .then(res => setFlight(res.data))
      .catch(err => console.error("Failed to fetch flight:", err));
  }, [flightId]);

  // ✅ Now safe to early return AFTER hooks
  if (!flight) {
    return <div style={{ padding: 20 }}>Loading flight information...</div>;
  }

  const basePrice = flight.price;
  const tax = basePrice * passengerCount * 0.03;
  const total = ((basePrice * passengerCount) + tax).toFixed(2);

  const handlePassengerCountChange = (e) => {
    const count = parseInt(e.target.value);
    setPassengerCount(count);

    let updated = [...passengerList];
    if (count > updated.length) {
      for (let i = updated.length; i < count; i++) {
        updated.push({ fullName: "", age: "" });
      }
    } else {
      updated = updated.slice(0, count);
    }
    setPassengerList(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !cardName || !cardNumber || !expiry || !cvv) {
      setMessage("⚠️ Please fill all fields.");
      return;
    }

    for (let p of passengerList) {
      if (!p.fullName || !p.age) {
        setMessage("⚠️ Complete all passenger details.");
        return;
      }
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      saveBookingToDB();
    }, 2000);
  };

  const saveBookingToDB = async () => {
    const booking = {
      userId: user._id,
      flightId: flight._id,
      passengerCount,
      passengers: passengerList,
      seatingPreference,
      email,
      airline: flight.airline,
      from: flight.from,
      to: flight.to,
      depart: flight.depart,
      arrive: flight.arrive,
      price: total,
      confirmationCode: generateCode(),
      bookingDate: new Date().toISOString()
    };

    try {
      await axios.post("http://localhost:9000/bookFlight", booking);
      setIsConfirmed(true);
      navigate("/confirmation", { state: { booking } });
    } catch (err) {
      console.error("Booking Error:", err);
    }
  };

  function generateCode() {
    return "LIFT-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  
  return (
    <div style={styles.page}>
      <main style={styles.hero}>
        <div style={styles.heroInner}>
          <h2 style={styles.title}>Complete Your Booking</h2>

          {/* ========== LOADING SCREEN ========== */}
          {isLoading ? (
            <div style={styles.loadingCard}>
              <div style={styles.spinner}></div>
              <h2 style={{ marginTop: 20 }}>Processing your payment...</h2>
            </div>
          ) : isConfirmed ? (
            <div style={styles.confirmCard}>
              <h1 style={{ color: "#28a745", marginBottom: 10 }}>Payment Successful!</h1>
              <p>A confirmation email has been sent to <strong>{email}</strong>.</p>
            </div>
          ) : (
            <>
              {/* ========================= */}
              {/* FLIGHT SUMMARY */}
              {/* ========================= */}
              <div style={styles.sectionCard}>
                <h3 style={styles.sectionTitle}>Flight Summary</h3>

                <div style={{ lineHeight: "1.6", fontSize: "15px", marginLeft: 5 }}>
                  <p>
                    <strong>Airline:</strong> {flight?.airline}  
                    <br />
                    <strong>Flight Number:</strong> {flight?.flightNo}
                  </p>

                  <hr style={styles.separator} />

                  <p>
                    <strong>Route:</strong> {flight?.fromFull} ({flight?.from}) →{" "}
                    {flight?.toFull} ({flight?.to})
                  </p>

                  <p>
                    <strong>Departure Date:</strong> {flight?.date}
                    <br />
                    <strong>Departure:</strong> {flight?.depart}
                    <br />
                    <strong>Arrival:</strong> {flight?.arrive}
                  </p>

                  <p>
                    <strong>Duration:</strong> {flight?.durationMin} minutes
                    <br />
                    <strong>Stops:</strong>{" "}
                    {flight?.stops === 0 ? "Nonstop" : `${flight?.stops} stop(s)`}
                  </p>

                  {/* STOP DETAILS */}
                  {flight?.stops > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <strong>Stopover Details:</strong>
                      {flight.stopInfo.map((stop, index) => (
                        <p key={index} style={{ marginLeft: 15 }}>
                          Stop {index + 1}: {stop.fullName} ({stop.code}) —{" "}
                          {stop.durationMin} min
                        </p>
                      ))}
                    </div>
                  )}

                  <hr style={styles.separator} />

                  <p>
                    <strong>Base Fare:</strong> ${basePrice} × {passengerCount}
                    <br />
                    <strong>Tax:</strong> ${tax}
                    <br />
                    <strong style={{ fontSize: "17px" }}>Total: ${total}</strong>
                  </p>
                </div>
              </div>

              {/* ========================= */}
              {/* PASSENGER COUNT & SEATING */}
              {/* ========================= */}
              <div style={styles.sectionCard}>
                <h3 style={styles.sectionTitle}>Booking Details</h3>

                <div style={styles.twoColumn}>
                  <div>
                    <label>Number of Passengers</label>
                    <select
                      value={passengerCount}
                      onChange={handlePassengerCountChange}
                      style={styles.input}
                    >
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Seating Preference</label>
                    <div style={{ display: "flex", gap: "20px", marginTop: "6px" }}>
                      <label>
                        <input
                          type="radio"
                          value="together"
                          checked={seatingPreference === "together"}
                          onChange={(e) => setSeatingPreference(e.target.value)}
                        />
                        {" "}Sit Together
                      </label>

                      <label>
                        <input
                          type="radio"
                          value="separate"
                          checked={seatingPreference === "separate"}
                          onChange={(e) => setSeatingPreference(e.target.value)}
                        />
                        {" "}Sit Separate
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* ========================= */}
              {/* PASSENGER INFORMATION */}
              {/* ========================= */}
              <div style={styles.sectionCard}>
                <h3 style={styles.sectionTitle}>Passenger Information</h3>

                {passengerList.map((p, index) => (
                  <div key={index} style={styles.passengerCard}>
                    <h4>Passenger {index + 1}</h4>

                    <div style={styles.twoColumn}>
                      <div>
                        <label>Full Name</label>
                        <input
                          type="text"
                          style={styles.input}
                          value={p.fullName}
                          onChange={(e) => {
                            const updated = [...passengerList];
                            updated[index].fullName = e.target.value;
                            setPassengerList(updated);
                          }}
                        />
                      </div>

                      <div>
                        <label>Age</label>
                        <input
                          type="number"
                          style={styles.input}
                          value={p.age}
                          onChange={(e) => {
                            const updated = [...passengerList];
                            updated[index].age = e.target.value;
                            setPassengerList(updated);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ========================= */}
              {/* PAYMENT INFORMATION */}
              {/* ========================= */}
              <div style={styles.sectionCard}>
                <h3 style={styles.sectionTitle}>Payment Information</h3>

                <div style={styles.formGroup}>
                  <label>Email for Receipt</label>
                  <input
                    type="email"
                    style={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label>Name on Card</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label>Card Number</label>
                  <input
                    type="text"
                    style={styles.input}
                    maxLength="16"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>

                <div style={styles.twoColumn}>
                  <div>
                    <label>Expiration</label>
                    <input
                      type="text"
                      style={styles.input}
                      maxLength="5"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                    />
                  </div>

                  <div>
                    <label>CVV</label>
                    <input
                      type="password"
                      style={styles.input}
                      maxLength="4"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* ========================= */}
              {/* SUMMARY */}
              {/* ========================= */}
              <div style={styles.sectionCard}>
                <h3 style={styles.sectionTitle}>Summary</h3>

                <h4>Passengers</h4>
                {passengerList.map((p, i) => (
                  <p key={i} style={{ marginLeft: 15 }}>
                    {p.fullName || `Passenger ${i + 1}`} - Age {p.age || "—"}
                  </p>
                ))}

                <hr style={styles.separator} />

                <h4>Cost Breakdown</h4>
                <p style={{ marginLeft: 15 }}>
                  Base Fare: ${basePrice} × {passengerCount}  
                  <br />
                  Tax: ${tax}
                  <br />
                  <strong>Total: ${total}</strong>
                </p>

                <button style={styles.submitButton} onClick={handleSubmit}>
                  Complete Purchase
                </button>

                {message && (
                  <p style={{ marginTop: 10, textAlign: "center" }}>{message}</p>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};


/* ========================================= */
/*                 STYLES                    */
/* ========================================= */

const styles = {
  page: {
    fontFamily: "system-ui, sans-serif",
    background: "#f4f6fbcf",
    paddingBottom: 40,
    borderRadius: "20px",
  },

  hero: {
  width: "1200px",
  margin: "20px auto",
  padding: "30px 0",
},


  heroInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 25,
  },

  title: {
    fontSize: 30,
    fontWeight: 700,
  },

  sectionCard: {
    width: "1100px",
    background: "white",
    border: "1px solid #e7ebf0",
    borderRadius: 12,
    padding: 25,
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },

  sectionTitle: {
    fontSize: 22,
    marginBottom: 15,
    fontWeight: 700,
  },

  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #cfd7df",
    fontSize: 14,
    marginTop: 4,
  },

  formGroup: {
    marginBottom: 15,
  },

  twoColumn: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },

  passengerCard: {
    background: "#fafbff",
    padding: 20,
    borderRadius: 10,
    border: "1px solid #e1e5eb",
    marginBottom: 20,
  },

  separator: {
    border: 0,
    borderBottom: "1px solid #ddd",
    margin: "15px 0",
  },

  submitButton: {
    marginTop: 20,
    width: "100%",
    background: "#2f6feb",
    padding: "12px",
    borderRadius: 8,
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    border: "none",
  },

  loadingCard: {
    width: "1100px",
    background: "white",
    padding: 80,
    borderRadius: 12,
    textAlign: "center",
    border: "1px solid #e7ebf0",
  },

  spinner: {
    width: 60,
    height: 60,
    border: "6px solid #cfd4db",
    borderTop: "6px solid #2f6feb",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto",
  },

  confirmCard: {
    width: "1100px",
    background: "white",
    padding: 80,
    borderRadius: 12,
    textAlign: "center",
    border: "1px solid #e7ebf0",
  },
};

export default PaymentPage;
