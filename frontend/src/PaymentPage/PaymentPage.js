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
  const userId = user ? user._id : null;

  const [passengerList, setPassengerList] = useState([
    { fullName: "", age: "" }
  ]);

  const [email, setEmail] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [savedCard, setSavedCard] = useState(null);
  const [useSavedCard, setUseSavedCard] = useState(false);
  const [prevCardValues, setPrevCardValues] = useState(null);
  const [savePaymentChecked, setSavePaymentChecked] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [message, setMessage] = useState("");
  const [rewards, setRewards] = useState(null);
  const [rewardsLoading, setRewardsLoading] = useState(false);
  const [useRewards, setUseRewards] = useState(false);
  const [rewardsToUse, setRewardsToUse] = useState(0);

  const [errors, setErrors] = useState({
    email: "",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  useEffect(() => {
    if (!flightId) return;

    axios.get(`http://localhost:9000/flights/${flightId}`)
      .then(res => setFlight(res.data))
      .catch(err => console.error("Failed to fetch flight:", err));
  }, [flightId]);

  // Fetch saved card for logged-in user (if any)
  useEffect(() => {
    if (!userId) return;

    axios.get(`http://localhost:9000/userCard/${userId}`)
      .then(res => {
        if (res.data) {
          setSavedCard(res.data);
        }
      })
      .catch(err => {
        console.error("Failed to fetch saved card:", err);
      });
  }, [userId]);

  // Fetch rewards for logged-in user
  useEffect(() => {
    if (!userId) return;

    setRewardsLoading(true);
    axios.get(`http://localhost:9000/user/points/${userId}`)
      .then(res => {
        if (res.data) {
          setRewards(res.data);
        }
      })
      .catch(err => {
        console.error("Failed to fetch rewards:", err);
      })
      .finally(() => setRewardsLoading(false));
  }, [userId]);

  if (!flight) {
    return <div style={{ padding: 20 }}>Loading flight information...</div>;
  }

  const basePrice = flight.price;
  const tax = basePrice * passengerCount * 0.03;
  let subtotal = (basePrice * passengerCount) + tax;
  
  // Calculate discount from rewards (100 points = $1, so divide by 100)
  let rewardsDiscount = 0;
  if (useRewards && rewardsToUse > 0) {
    rewardsDiscount = (rewardsToUse / 10000) * 100; // 10,000 points = $100 off
    rewardsDiscount = Math.min(rewardsDiscount, subtotal); // Can't discount more than total
  }
  
  const total = (subtotal - rewardsDiscount).toFixed(2);

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

    let newErrors = {
      email: "",
      cardName: "",
      cardNumber: "",
      expiry: "",
      cvv: "",
    };

    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!email.includes("@")) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!cardName) {
      newErrors.cardName = "Cardholder name is required.";
    } else if (cardName.trim().length < 2) {
      newErrors.cardName = "Please enter a valid cardholder name.";
    }

    if (!cardNumber) {
      newErrors.cardNumber = "Card number is required.";
    } else if (cardNumber.length !== 16) {
      newErrors.cardNumber = "Card number must be 16 digits.";
    }

    if (!expiry) {
      newErrors.expiry = "Expiration date is required.";
    } else if (!expiry.includes("/")) {
      newErrors.expiry = "Expiration must be in MM/YY format.";
    } else {
      const month = parseInt(expiry.split("/")[0]);
      if (month < 1 || month > 12) {
        newErrors.expiry = "Invalid expiration month (01-12).";
      }
    }

    if (!cvv) {
      newErrors.cvv = "CVV is required.";
    } else if (cvv.length < 3 || cvv.length > 4) {
      newErrors.cvv = "CVV must be 3 or 4 digits.";
    }

    setErrors(newErrors);

    if (!email || !cardName || !cardNumber || !expiry || !cvv) {
      setMessage("⚠️ Please fill all fields.");
      return;
    }

    if (Object.values(newErrors).some(error => error !== "")) {
      setMessage("⚠️ Please fix the errors above.");
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
    const user = JSON.parse(localStorage.getItem("liftoffUser"));

    const bookingData = {
      userId: user ? user._id : null,
      name: passengerList[0].fullName,
      email: email,

      flightId: flight._id,
      airline: flight.airline,
      from: flight.from,
      to: flight.to,
      depart: flight.depart,
      arrive: flight.arrive,
      date: flight.date,

      passengerCount,
      passengers: passengerList,
      seatingPreference,
      price: total,
    };

    try {
      const response = await axios.post(
        "http://localhost:9000/bookFlight",
        bookingData
      );

      console.log("✅ Booking saved:", response.data.booking);

      setIsConfirmed(true);

      // Deduct points on server if user used rewards and update localStorage so other pages see the changed balance
      if (user && user._id && useRewards && rewardsToUse > 0) {
        try {
          const deductRes = await axios.post('http://localhost:9000/user/deductPoints', {
            userId: user._id,
            pointsToDeduct: rewardsToUse
          });

          if (deductRes.data && deductRes.data.user) {
            // update localStorage with fresh user object (preserve unchanged fields from stored user)
            const updatedUser = { ...user, ...deductRes.data.user };
            localStorage.setItem('liftoffUser', JSON.stringify(updatedUser));
            // update rewards state used in this page
            setRewards(prev => ({ ...prev, totalPoints: updatedUser.totalPoints }));
            // notify other parts of the app (e.g., dashboard) that user data changed
            try {
              window.dispatchEvent(new CustomEvent('liftoffUserUpdated', { detail: updatedUser }));
            } catch (e) {
              // older browsers fallback: set an ephemeral localStorage flag
              localStorage.setItem('liftoffUserUpdatedAt', Date.now());
            }
          }
        } catch (err) {
          console.error('Failed to deduct points:', err);
        }
      }

      // After booking succeeds, if user opted to save payment and they don't already have a saved card,
      // persist card details (excluding CVV) to the database and update local state.
      if (user && user._id && savePaymentChecked && !savedCard) {
        try {
          const cardPayload = {
            userId: user._id,
            cardNumber,
            cardHolder: cardName,
            expiry,
          };

          const saveRes = await axios.post("http://localhost:9000/saveCard", cardPayload);
          if (saveRes.data && saveRes.data.card) {
            setSavedCard(saveRes.data.card);
            // clear the checkbox after saving
            setSavePaymentChecked(false);
          }
        } catch (err) {
          console.error("Failed to save card:", err);
        }
      }

    } catch (error) {
      console.error("❌ Booking failed:", error);
      setMessage("Something went wrong while booking. Please try again.");
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

              <div style={styles.sectionCard}>
                <h3 style={styles.sectionTitle}>Payment Information</h3>

                {userId && savedCard && (
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={useSavedCard}
                        onChange={(e) => {
                          const checked = e.target.checked;

                          if (checked) {
                            // keep a copy of current values to restore when unchecked
                            setPrevCardValues({ cardName, cardNumber, expiry, cvv });
                            setCardName(savedCard.cardHolder || "");
                            setCardNumber(savedCard.cardNumber || "");
                            setExpiry(savedCard.expiry || "");
                            setCvv("");
                            setUseSavedCard(true);
                          } else {
                            // restore previous values or clear
                            if (prevCardValues) {
                              setCardName(prevCardValues.cardName || "");
                              setCardNumber(prevCardValues.cardNumber || "");
                              setExpiry(prevCardValues.expiry || "");
                              setCvv(prevCardValues.cvv || "");
                            } else {
                              setCardName("");
                              setCardNumber("");
                              setExpiry("");
                              setCvv("");
                            }
                            setUseSavedCard(false);
                          }
                        }}
                      />
                      <span>Use saved payment info for the payment details</span>
                      <small style={{ marginLeft: 12, color: "#6c757d" }}>
                        (card ending in {savedCard.cardNumber ? savedCard.cardNumber.slice(-4) : "—"})
                      </small>
                    </label>
                  </div>
                )}

                <div style={styles.formGroup}>
                  <label>Email for Receipt</label>
                  <input
                    type="email"
                    style={{ ...styles.input, borderColor: errors.email ? "#dc3545" : "#cfd7df" }}
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) {
                        setErrors({ ...errors, email: "" });
                      }
                    }}
                  />
                  {errors.email && (
                    <p style={styles.errorMessage}>{errors.email}</p>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label>Name on Card</label>
                  <input
                    type="text"
                    style={{ ...styles.input, borderColor: errors.cardName ? "#dc3545" : "#cfd7df" }}
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => {
                      setCardName(e.target.value);
                      if (errors.cardName) {
                        setErrors({ ...errors, cardName: "" });
                      }
                    }}
                    disabled={useSavedCard}
                  />
                  {errors.cardName && (
                    <p style={styles.errorMessage}>{errors.cardName}</p>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label>Card Number</label>
                  <input
                    type="text"
                    style={{ ...styles.input, borderColor: errors.cardNumber ? "#dc3545" : "#cfd7df" }}
                    placeholder="1234 5678 9012 3456"
                    maxLength="16"
                    value={cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setCardNumber(value);
                      if (errors.cardNumber) {
                        setErrors({ ...errors, cardNumber: "" });
                      }
                    }}
                    disabled={useSavedCard}
                  />
                  {errors.cardNumber && (
                    <p style={styles.errorMessage}>{errors.cardNumber}</p>
                  )}
                </div>

                <div style={styles.twoColumn}>
                  <div>
                    <label>Expiration</label>
                    <input
                      type="text"
                      style={{ ...styles.input, borderColor: errors.expiry ? "#dc3545" : "#cfd7df" }}
                      placeholder="MM/YY"
                      maxLength="5"
                      value={expiry}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, "");
                        
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + "/" + value.slice(2, 4);
                        }
                        setExpiry(value);
                        if (errors.expiry) {
                          setErrors({ ...errors, expiry: "" });
                        }
                      }}
                      disabled={useSavedCard}
                    />
                    {errors.expiry && (
                      <p style={styles.errorMessage}>{errors.expiry}</p>
                    )}
                  </div>

                  <div>
                    <label>CVV</label>
                    <input
                      type="password"
                      style={{ ...styles.input, borderColor: errors.cvv ? "#dc3545" : "#cfd7df" }}
                      placeholder="123"
                      maxLength="4"
                      value={cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setCvv(value);
                        if (errors.cvv) {
                          setErrors({ ...errors, cvv: "" });
                        }
                      }}
                    />
                    {errors.cvv && (
                      <p style={styles.errorMessage}>{errors.cvv}</p>
                    )}
                  </div>
                </div>
                {/* Save payment details checkbox (show when user logged in but no saved card) */}
                {userId && !savedCard && (
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={savePaymentChecked}
                        onChange={(e) => setSavePaymentChecked(e.target.checked)}
                      />
                      <span style={{ fontSize: 14 }}>Save payment details</span>
                    </label>
                  </div>
                )}
              </div>

              {userId && (
                <div style={styles.sectionCard}>
                  <h3 style={styles.sectionTitle}>Your Rewards</h3>

                  {rewardsLoading ? (
                    <p style={{ textAlign: "center", color: "#666" }}>Loading rewards...</p>
                  ) : rewards ? (
                    <div>
                      <div style={styles.rewardsHeader}>
                        <div style={styles.pointsDisplay}>
                          <p style={{ fontSize: 14, color: "#666", margin: "0 0 5px 0" }}>Total Points</p>
                          <p style={{ fontSize: 32, fontWeight: 700, color: "#2f6feb", margin: 0 }}>
                            {rewards.totalPoints}
                          </p>
                        </div>
                        <p style={{ color: "#666", fontSize: 13, marginLeft: 20 }}>
                          Earn 10 points per dollar spent on flights
                        </p>
                      </div>

                      {rewards.totalPoints >= 10000 && (
                        <div style={{ marginTop: 20 }}>
                          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <input
                              type="checkbox"
                              checked={useRewards}
                              onChange={(e) => {
                                setUseRewards(e.target.checked);
                                if (!e.target.checked) {
                                  setRewardsToUse(0);
                                }
                              }}
                            />
                            <span style={{ fontSize: 14, fontWeight: 500 }}>Use my rewards points</span>
                          </label>

                          {useRewards && (
                            <div style={{ marginTop: 12, marginLeft: 28, padding: "12px 14px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e1e5eb" }}>
                              <label style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
                                Select Points to Redeem (in multiples of 10,000)
                              </label>
                              <input
                                type="number"
                                min="10000"
                                step="10000"
                                max={rewards.totalPoints}
                                value={rewardsToUse}
                                onChange={(e) => {
                                  let value = parseInt(e.target.value) || 0;
                                  // Ensure it's a multiple of 10,000
                                  if (value > 0) {
                                    value = Math.round(value / 10000) * 10000;
                                  }
                                  // Ensure it doesn't exceed available points
                                  value = Math.min(value, rewards.totalPoints);
                                  setRewardsToUse(value);
                                }}
                                style={{
                                  width: "100%",
                                  padding: "8px 10px",
                                  borderRadius: 6,
                                  border: "1px solid #cfd7df",
                                  fontSize: 14,
                                  boxSizing: "border-box"
                                }}
                              />
                              <p style={{ fontSize: 12, color: "#666", marginTop: 8, marginBottom: 0 }}>
                                Discount: ${((rewardsToUse / 10000) * 100).toFixed(2)} off
                              </p>
                            </div>
                          )}

                          <p style={{ fontSize: 12, color: "#666", marginLeft: 28, marginTop: 8 }}>
                            Every 10,000 points = $100 off
                          </p>
                        </div>
                      )}

                      {rewards.totalPoints < 10000 && (
                        <p style={{ fontSize: 13, color: "#999", marginTop: 15, fontStyle: "italic" }}>
                          You need at least 10,000 points to redeem rewards. You currently have {rewards.totalPoints} points.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p style={{ color: "#666", textAlign: "center" }}>
                      No rewards yet. Start booking flights to earn points!
                    </p>
                  )}
                </div>
              )}

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
                  {useRewards && rewards && rewards.totalPoints >= 10000 && (
                    <>
                      Rewards Discount: -${rewardsDiscount}
                      <br />
                    </>
                  )}
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


// ==========================================================
// STYLESHEET OBJECT
// Contains all inline CSS styling for the Payment Page
// Using JavaScript objects instead of separate CSS file
// ==========================================================

const styles = {
  // MAIN PAGE CONTAINER
  page: {
    // Use system default font stack for consistent appearance
    fontFamily: "system-ui, sans-serif",
    // Light blue background color
    background: "#f4f6fbcf",
    // Add padding at bottom for spacing
    paddingBottom: 40,
    // Rounded corners on container
    borderRadius: "20px",
  },

  // MAIN CONTENT AREA
  hero: {
    // Maximum width to prevent content from stretching too wide
    width: "1200px",
    // Center the container horizontally
    margin: "20px auto",
    // Vertical padding for spacing
    padding: "30px 0",
  },

  // INNER FLEX CONTAINER
  heroInner: {
    // Use flexbox layout
    display: "flex",
    // Stack items vertically
    flexDirection: "column",
    // Center items horizontally
    alignItems: "center",
    // Space between flex items (25px gap)
    gap: 25,
  },

  // MAIN PAGE TITLE
  title: {
    fontSize: 30,
    fontWeight: 700,
  },

  // SECTION CARDS (used for each form section)
  sectionCard: {
    // Width of card content
    width: "1100px",
    // White background
    background: "white",
    // Light gray border
    border: "1px solid #e7ebf0",
    // Rounded corners
    borderRadius: 12,
    // Internal spacing
    padding: 25,
    // Subtle shadow for depth
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },

  // SECTION TITLE (within cards)
  sectionTitle: {
    fontSize: 22,
    marginBottom: 15,
    fontWeight: 700,
  },

  // INPUT FIELD STYLING
  input: {
    // Expand to fill parent width
    width: "100%",
    // Internal padding
    padding: "10px 12px",
    // Rounded corners on input
    borderRadius: 8,
    // Light gray border
    border: "1px solid #cfd7df",
    fontSize: 14,
    // Space above input
    marginTop: 4,
  },

  // ERROR MESSAGE STYLING (appears below invalid input fields)
  errorMessage: {
    // Red color to indicate error
    color: "#dc3545",
    // Smaller font size for error text
    fontSize: 12,
    // Space above error message
    marginTop: 4,
    // Space below error message
    marginBottom: 10,
  },

  // FORM GROUP (wrapper for label + input)
  formGroup: {
    marginBottom: 15,
  },

  // TWO COLUMN LAYOUT (for side-by-side fields)
  twoColumn: {
    // Use CSS Grid for columns
    display: "grid",
    // Two equal-width columns (1fr = equal portion)
    gridTemplateColumns: "1fr 1fr",
    // Space between columns
    gap: 20,
  },

  // PASSENGER INFORMATION CARD
  passengerCard: {
    // Light background to distinguish from main card
    background: "#fafbff",
    // Internal padding
    padding: 20,
    // Rounded corners
    borderRadius: 10,
    // Light border
    border: "1px solid #e1e5eb",
    // Space below each passenger card
    marginBottom: 20,
  },

  // HORIZONTAL SEPARATOR LINE
  separator: {
    // Remove default border
    border: 0,
    // Add bottom border instead (more control)
    borderBottom: "1px solid #ddd",
    // Vertical spacing
    margin: "15px 0",
  },

  // SUBMIT BUTTON STYLING
  submitButton: {
    // Space above button
    marginTop: 20,
    // Fill the width of container
    width: "100%",
    // Blue background color
    background: "#2f6feb",
    // Internal padding
    padding: "12px",
    // Rounded corners
    borderRadius: 8,
    // White text
    color: "white",
    // Bold text
    fontWeight: 700,
    // Pointer cursor on hover
    cursor: "pointer",
    // Remove default button border
    border: "none",
  },

  // LOADING CARD (shown while processing payment)
  loadingCard: {
    width: "1100px",
    background: "white",
    // Extra padding for centered content
    padding: 80,
    borderRadius: 12,
    // Center the content
    textAlign: "center",
    border: "1px solid #e7ebf0",
  },

  // LOADING SPINNER ANIMATION
  spinner: {
    // Size of spinner circle
    width: 60,
    height: 60,
    // Light gray border all around
    border: "6px solid #cfd4db",
    // Blue top border (creates rotating effect)
    borderTop: "6px solid #2f6feb",
    // Make it circular
    borderRadius: "50%",
    // CSS animation (defined elsewhere or using keyframes)
    animation: "spin 1s linear infinite",
    // Center the spinner
    margin: "0 auto",
  },

  // CONFIRMATION CARD (shown after successful booking)
  confirmCard: {
    width: "1100px",
    background: "white",
    // Extra padding for centered message
    padding: 80,
    borderRadius: 12,
    // Center text
    textAlign: "center",
    border: "1px solid #e7ebf0",
  },

  // REWARDS HEADER (displays total points)
  rewardsHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: 30,
    padding: "15px",
    background: "#f0f7ff",
    borderRadius: 8,
    border: "1px solid #cfe2ff",
  },

  // POINTS DISPLAY (shows total points number)
  pointsDisplay: {
    flex: 1,
  },
};

// Export component as default export for use in other files
export default PaymentPage;
