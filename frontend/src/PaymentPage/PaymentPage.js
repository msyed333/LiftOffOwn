// ==========================================================
//  PAYMENT PAGE COMPONENT
//  Handles the complete booking and payment flow for flights
//
//  This component allows users to:
//  1. View flight summary details
//  2. Specify number of passengers and seating preferences
//  3. Enter passenger information (name and age)
//  4. Enter payment details (card information)
//  5. Process the booking and create a reservation
// ==========================================================

// Import React hooks for state management and side effects
import React, { useState, useEffect } from "react";
// Import routing utilities to navigate and access passed state
import { useLocation, useNavigate } from "react-router-dom";
// Import axios for making HTTP requests to the backend
import axios from "axios";

// ==========================================================
// PAYMENT PAGE COMPONENT (Main Functional Component)
// ==========================================================
const PaymentPage = () => {
  // ========== ROUTING HOOKS ==========
  // Get the location object from React Router to access state passed from previous page
  const { state } = useLocation();
  // Extract flightId from the passed state (the flight the user selected)
  const { flightId } = state || {};
  // Get navigate function to redirect user after booking is complete
  const navigate = useNavigate();

  // ========== STATE FOR FLIGHT DATA ==========
  // Store the flight object retrieved from the database
  const [flight, setFlight] = useState(null);

  // ========== STATE FOR BOOKING DETAILS ==========
  // Track how many passengers are booking on this flight (1-10)
  const [passengerCount, setPassengerCount] = useState(1);
  // Store user's seating preference: "together" or "separate"
  const [seatingPreference, setSeatingPreference] = useState("together");
  // Get logged-in user from localStorage (or null for guest checkout)
  const user = JSON.parse(localStorage.getItem("liftoffUser"));
  // Extract user ID if user is logged in (null for guests)
  const userId = user ? user._id : null; // allow guest

  // ========== STATE FOR PASSENGER INFORMATION ==========
  // Array of passenger objects, each with fullName and age fields
  // Initialized with one empty passenger object
  const [passengerList, setPassengerList] = useState([
    { fullName: "", age: "" }
  ]);

  // ========== STATE FOR PAYMENT INFORMATION ==========
  // Email address where booking confirmation will be sent
  const [email, setEmail] = useState("");
  // Cardholder's name (from credit/debit card)
  const [cardName, setCardName] = useState("");
  // 16-digit credit/debit card number
  const [cardNumber, setCardNumber] = useState("");
  // Card expiration date (MM/YY format)
  const [expiry, setExpiry] = useState("");
  // 3-4 digit security code on back of card
  const [cvv, setCvv] = useState("");

  // ========== STATE FOR UI/UX FEEDBACK ==========
  // Track if payment is being processed (shows loading spinner)
  const [isLoading, setIsLoading] = useState(false);
  // Track if booking was successfully confirmed
  const [isConfirmed, setIsConfirmed] = useState(false);
  // Store error or success messages to display to user
  const [message, setMessage] = useState("");

  // ========== STATE FOR FIELD-LEVEL ERROR MESSAGES ==========
  // Track individual validation errors for each payment field
  // This allows showing specific error messages below each input
  const [errors, setErrors] = useState({
    email: "",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  // ==========================================================
  // EFFECT HOOK: FETCH FLIGHT DETAILS
  // Runs when component mounts or flightId changes
  // Retrieves the selected flight's information from MongoDB
  // ==========================================================
  useEffect(() => {
    // Early return if no flightId was passed (shouldn't happen in normal flow)
    if (!flightId) return;

    // Make GET request to fetch flight by ID from backend
    axios.get(`http://localhost:9000/flights/${flightId}`)
      // On success, store the flight data in state
      .then(res => setFlight(res.data))
      // On error, log to console for debugging
      .catch(err => console.error("Failed to fetch flight:", err));
  }, [flightId]); // Re-run if flightId changes

  // ==========================================================
  // EARLY RETURN: LOADING STATE
  // If flight hasn't been fetched yet, show loading message
  // This must come AFTER all hooks (React rule)
  // ==========================================================
  if (!flight) {
    return <div style={{ padding: 20 }}>Loading flight information...</div>;
  }

  // ==========================================================
  // PRICE CALCULATION
  // Calculate the total cost based on number of passengers
  // ==========================================================
  // Base price per passenger from the flight object
  const basePrice = flight.price;
  // Calculate 3% tax on total fare (base price × passenger count)
  const tax = basePrice * passengerCount * 0.03;
  // Calculate grand total: (base price × passengers) + tax, rounded to 2 decimals
  const total = ((basePrice * passengerCount) + tax).toFixed(2);

  // ==========================================================
  // HANDLER: UPDATE PASSENGER COUNT
  // When user changes the passenger count dropdown
  // This also dynamically adds/removes passenger input fields
  // ==========================================================
  const handlePassengerCountChange = (e) => {
    // Parse the selected value as an integer (1-10)
    const count = parseInt(e.target.value);
    // Update the passenger count state
    setPassengerCount(count);

    // Copy the current passenger list array
    let updated = [...passengerList];
    
    // If new count is more than current list, add empty passenger objects
    if (count > updated.length) {
      // Loop from current length to new count
      for (let i = updated.length; i < count; i++) {
        // Add new passenger with empty name and age
        updated.push({ fullName: "", age: "" });
      }
    } else {
      // If new count is less, trim the array to only include needed passengers
      updated = updated.slice(0, count);
    }
    // Update the passenger list state with new array
    setPassengerList(updated);
  };

  // ==========================================================
  // HANDLER: FORM SUBMISSION
  // Called when user clicks "Complete Purchase" button
  // Validates all required fields before processing payment
  // ==========================================================
  const handleSubmit = (e) => {
    // Prevent default form submission behavior (page reload)
    e.preventDefault();

    // Initialize errors object to track all validation errors
    let newErrors = {
      email: "",
      cardName: "",
      cardNumber: "",
      expiry: "",
      cvv: "",
    };

    // VALIDATION: Email field
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!email.includes("@")) {
      newErrors.email = "Please enter a valid email address.";
    }

    // VALIDATION: Cardholder name field
    if (!cardName) {
      newErrors.cardName = "Cardholder name is required.";
    } else if (cardName.trim().length < 2) {
      newErrors.cardName = "Please enter a valid cardholder name.";
    }

    // VALIDATION: Card number field
    if (!cardNumber) {
      newErrors.cardNumber = "Card number is required.";
    } else if (cardNumber.length !== 16) {
      newErrors.cardNumber = "Card number must be 16 digits.";
    }

    // VALIDATION: Expiration date field
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

    // VALIDATION: CVV field
    if (!cvv) {
      newErrors.cvv = "CVV is required.";
    } else if (cvv.length < 3 || cvv.length > 4) {
      newErrors.cvv = "CVV must be 3 or 4 digits.";
    }

    // Update the errors state with all validation results
    setErrors(newErrors);

    // VALIDATION: Check if all payment fields are filled and valid
    if (!email || !cardName || !cardNumber || !expiry || !cvv) {
      setMessage("⚠️ Please fill all fields.");
      return;
    }

    // VALIDATION: Check if any payment field has errors
    if (Object.values(newErrors).some(error => error !== "")) {
      setMessage("⚠️ Please fix the errors above.");
      return;
    }

    // VALIDATION: Check if all passenger information is complete
    for (let p of passengerList) {
      // If any passenger is missing name or age, show error
      if (!p.fullName || !p.age) {
        setMessage("⚠️ Complete all passenger details.");
        return;
      }
    }

    // All validations passed - start loading state
    setIsLoading(true);

    // Simulate payment processing delay (2 seconds)
    setTimeout(() => {
      // After 2 seconds, stop loading and save booking to database
      setIsLoading(false);
      saveBookingToDB();
    }, 2000);
  };

  // ==========================================================
  // FUNCTION: PROCESS BOOKING
  // Simulates booking completion by showing success message
  // No server call is made - purely frontend confirmation
  // ==========================================================

  const saveBookingToDB = async () => {
  // Get logged-in user (if exists)
  const user = JSON.parse(localStorage.getItem("liftoffUser"));

  const bookingData = {
    userId: user ? user._id : null,   // ✅ null => guest
    name: passengerList[0].fullName, // primary passenger name
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

    // Mark UI as confirmed
    setIsConfirmed(true);

    } catch (error) {
      console.error("❌ Booking failed:", error);
      setMessage("Something went wrong while booking. Please try again.");
    }
  };



  // ==========================================================
  // FUNCTION: GENERATE CONFIRMATION CODE
  // Creates a unique booking confirmation code
  // Format: "LIFT-" followed by 6 random alphanumeric characters
  // ==========================================================
  function generateCode() {
    // "LIFT-" + random string (takes chars 2-8 from Math.random().toString())
    return "LIFT-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  
  // ==========================================================
  // MAIN RETURN / JSX RENDERING
  // ==========================================================
  return (
    <div style={styles.page}>
      <main style={styles.hero}>
        <div style={styles.heroInner}>
          <h2 style={styles.title}>Complete Your Booking</h2>

          {/* ========== CONDITIONAL RENDERING ========== */}
          {/* Show different UI based on the current state of the form */}

          {/* CASE 1: LOADING STATE - Show spinner while processing payment */}
          {isLoading ? (
            <div style={styles.loadingCard}>
              <div style={styles.spinner}></div>
              <h2 style={{ marginTop: 20 }}>Processing your payment...</h2>
            </div>
          ) : /* CASE 2: CONFIRMED STATE - Show success message after payment */
          isConfirmed ? (
            <div style={styles.confirmCard}>
              <h1 style={{ color: "#28a745", marginBottom: 10 }}>Payment Successful!</h1>
              <p>A confirmation email has been sent to <strong>{email}</strong>.</p>
            </div>
          ) : /* CASE 3: NORMAL STATE - Show the full booking form */
          (
            <>
              {/* ========================= */}
              {/* SECTION 1: FLIGHT SUMMARY */}
              {/* ========================= */}
              {/* Displays flight details so user can confirm they're booking the right flight */}
              <div style={styles.sectionCard}>
                <h3 style={styles.sectionTitle}>Flight Summary</h3>

                <div style={{ lineHeight: "1.6", fontSize: "15px", marginLeft: 5 }}>
                  {/* AIRLINE AND FLIGHT NUMBER */}
                  <p>
                    <strong>Airline:</strong> {flight?.airline}  
                    <br />
                    <strong>Flight Number:</strong> {flight?.flightNo}
                  </p>

                  <hr style={styles.separator} />

                  {/* ROUTE INFORMATION */}
                  {/* Shows departure and arrival cities with airport codes */}
                  <p>
                    <strong>Route:</strong> {flight?.fromFull} ({flight?.from}) →{" "}
                    {flight?.toFull} ({flight?.to})
                  </p>

                  {/* DEPARTURE AND ARRIVAL TIMES */}
                  <p>
                    <strong>Departure Date:</strong> {flight?.date}
                    <br />
                    <strong>Departure:</strong> {flight?.depart}
                    <br />
                    <strong>Arrival:</strong> {flight?.arrive}
                  </p>

                  {/* FLIGHT DURATION AND STOPS */}
                  <p>
                    <strong>Duration:</strong> {flight?.durationMin} minutes
                    <br />
                    <strong>Stops:</strong>{" "}
                    {flight?.stops === 0 ? "Nonstop" : `${flight?.stops} stop(s)`}
                  </p>

                  {/* STOPOVER DETAILS - Only shown if flight has stops */}
                  {flight?.stops > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <strong>Stopover Details:</strong>
                      {/* Map through each stop and display information */}
                      {flight.stopInfo.map((stop, index) => (
                        <p key={index} style={{ marginLeft: 15 }}>
                          Stop {index + 1}: {stop.fullName} ({stop.code}) —{" "}
                          {stop.durationMin} min
                        </p>
                      ))}
                    </div>
                  )}

                  <hr style={styles.separator} />

                  {/* PRICING BREAKDOWN */}
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
              {/* SECTION 2: BOOKING DETAILS */}
              {/* ========================= */}
              {/* User selects number of passengers and seating preference */}
              <div style={styles.sectionCard}>
                <h3 style={styles.sectionTitle}>Booking Details</h3>

                <div style={styles.twoColumn}>
                  {/* PASSENGER COUNT DROPDOWN */}
                  <div>
                    <label>Number of Passengers</label>
                    <select
                      value={passengerCount}
                      onChange={handlePassengerCountChange}
                      style={styles.input}
                    >
                      {/* Create options for 1-10 passengers */}
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* SEATING PREFERENCE RADIO BUTTONS */}
                  <div>
                    <label>Seating Preference</label>
                    <div style={{ display: "flex", gap: "20px", marginTop: "6px" }}>
                      {/* Option 1: Sit Together - all passengers in same seating area */}
                      <label>
                        <input
                          type="radio"
                          value="together"
                          checked={seatingPreference === "together"}
                          onChange={(e) => setSeatingPreference(e.target.value)}
                        />
                        {" "}Sit Together
                      </label>

                      {/* Option 2: Sit Separate - passengers can sit in different areas */}
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
              {/* SECTION 3: PASSENGER INFORMATION */}
              {/* ========================= */}
              {/* User enters details for each passenger (name and age) */}
              <div style={styles.sectionCard}>
                <h3 style={styles.sectionTitle}>Passenger Information</h3>

                {/* Loop through each passenger and create input fields */}
                {passengerList.map((p, index) => (
                  <div key={index} style={styles.passengerCard}>
                    <h4>Passenger {index + 1}</h4>

                    <div style={styles.twoColumn}>
                      {/* FULL NAME INPUT */}
                      <div>
                        <label>Full Name</label>
                        <input
                          type="text"
                          style={styles.input}
                          value={p.fullName}
                          onChange={(e) => {
                            // Create copy of passenger list
                            const updated = [...passengerList];
                            // Update this passenger's full name
                            updated[index].fullName = e.target.value;
                            // Update state with modified list
                            setPassengerList(updated);
                          }}
                        />
                      </div>

                      {/* AGE INPUT */}
                      <div>
                        <label>Age</label>
                        <input
                          type="number"
                          style={styles.input}
                          value={p.age}
                          onChange={(e) => {
                            // Create copy of passenger list
                            const updated = [...passengerList];
                            // Update this passenger's age
                            updated[index].age = e.target.value;
                            // Update state with modified list
                            setPassengerList(updated);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ========================= */}
              {/* SECTION 4: PAYMENT INFORMATION */}
              {/* ========================= */}
              {/* User enters credit/debit card details and email */}
              <div style={styles.sectionCard}>
                <h3 style={styles.sectionTitle}>Payment Information</h3>

                {/* EMAIL FOR RECEIPT */}
                <div style={styles.formGroup}>
                  <label>Email for Receipt</label>
                  <input
                    type="email"
                    style={{ ...styles.input, borderColor: errors.email ? "#dc3545" : "#cfd7df" }}
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      // Clear error when user starts typing
                      if (errors.email) {
                        setErrors({ ...errors, email: "" });
                      }
                    }}
                  />
                  {/* Show error message below input if validation fails */}
                  {errors.email && (
                    <p style={styles.errorMessage}>{errors.email}</p>
                  )}
                </div>

                {/* NAME ON CARD */}
                <div style={styles.formGroup}>
                  <label>Name on Card</label>
                  <input
                    type="text"
                    style={{ ...styles.input, borderColor: errors.cardName ? "#dc3545" : "#cfd7df" }}
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => {
                      setCardName(e.target.value);
                      // Clear error when user starts typing
                      if (errors.cardName) {
                        setErrors({ ...errors, cardName: "" });
                      }
                    }}
                  />
                  {/* Show error message below input if validation fails */}
                  {errors.cardName && (
                    <p style={styles.errorMessage}>{errors.cardName}</p>
                  )}
                </div>

                {/* CARD NUMBER (max 16 digits) */}
                <div style={styles.formGroup}>
                  <label>Card Number</label>
                  <input
                    type="text"
                    style={{ ...styles.input, borderColor: errors.cardNumber ? "#dc3545" : "#cfd7df" }}
                    placeholder="1234 5678 9012 3456"
                    maxLength="16"
                    value={cardNumber}
                    onChange={(e) => {
                      // Only allow numbers
                      const value = e.target.value.replace(/\D/g, "");
                      setCardNumber(value);
                      // Clear error when user starts typing
                      if (errors.cardNumber) {
                        setErrors({ ...errors, cardNumber: "" });
                      }
                    }}
                  />
                  {/* Show error message below input if validation fails */}
                  {errors.cardNumber && (
                    <p style={styles.errorMessage}>{errors.cardNumber}</p>
                  )}
                </div>

                {/* EXPIRATION DATE AND CVV */}
                <div style={styles.twoColumn}>
                  {/* EXPIRATION DATE (MM/YY format, max 5 chars) */}
                  <div>
                    <label>Expiration</label>
                    <input
                      type="text"
                      style={{ ...styles.input, borderColor: errors.expiry ? "#dc3545" : "#cfd7df" }}
                      placeholder="MM/YY"
                      maxLength="5"
                      value={expiry}
                      onChange={(e) => {
                        // Allow only numbers and one forward slash
                        let value = e.target.value.replace(/\D/g, "");
                        
                        // Auto-format: MM/YY
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + "/" + value.slice(2, 4);
                        }
                        setExpiry(value);
                        // Clear error when user starts typing
                        if (errors.expiry) {
                          setErrors({ ...errors, expiry: "" });
                        }
                      }}
                    />
                    {/* Show error message below input if validation fails */}
                    {errors.expiry && (
                      <p style={styles.errorMessage}>{errors.expiry}</p>
                    )}
                  </div>

                  {/* CVV - SECURITY CODE (max 4 digits, hidden input) */}
                  <div>
                    <label>CVV</label>
                    <input
                      type="password"
                      style={{ ...styles.input, borderColor: errors.cvv ? "#dc3545" : "#cfd7df" }}
                      placeholder="123"
                      maxLength="4"
                      value={cvv}
                      onChange={(e) => {
                        // Only allow numbers
                        const value = e.target.value.replace(/\D/g, "");
                        setCvv(value);
                        // Clear error when user starts typing
                        if (errors.cvv) {
                          setErrors({ ...errors, cvv: "" });
                        }
                      }}
                    />
                    {/* Show error message below input if validation fails */}
                    {errors.cvv && (
                      <p style={styles.errorMessage}>{errors.cvv}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* ========================= */}
              {/* SECTION 5: BOOKING SUMMARY & SUBMIT */}
              {/* ========================= */}
              {/* Final review of booking details with purchase button */}
              <div style={styles.sectionCard}>
                <h3 style={styles.sectionTitle}>Summary</h3>

                {/* LIST OF ALL PASSENGERS */}
                <h4>Passengers</h4>
                {passengerList.map((p, i) => (
                  <p key={i} style={{ marginLeft: 15 }}>
                    {/* Show passenger name or placeholder, and age */}
                    {p.fullName || `Passenger ${i + 1}`} - Age {p.age || "—"}
                  </p>
                ))}

                <hr style={styles.separator} />

                {/* COST BREAKDOWN */}
                <h4>Cost Breakdown</h4>
                <p style={{ marginLeft: 15 }}>
                  Base Fare: ${basePrice} × {passengerCount}  
                  <br />
                  Tax: ${tax}
                  <br />
                  <strong>Total: ${total}</strong>
                </p>

                {/* SUBMIT BUTTON - Processes the booking */}
                <button style={styles.submitButton} onClick={handleSubmit}>
                  Complete Purchase
                </button>

                {/* ERROR OR SUCCESS MESSAGE */}
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
};

// Export component as default export for use in other files
export default PaymentPage;
