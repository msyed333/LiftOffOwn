// ==========================================================
//  LiftOff Dashboard
//  Main user dashboard that manages multiple tabs:
//  My Info | My Flights | My Points | Check-In | Support
//
//  This is the primary dashboard page that users see after
//  logging in. It provides a tabbed interface with different
//  sections for managing user profile, flight history, rewards
//  points, and flight check-in functionality.
// ==========================================================

// Import React hooks for state management and performance
import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
// Import the associated CSS stylesheet for styling
import "./UserDashboard.css";


// ==========================================================
// 🧭 MAIN DASHBOARD COMPONENT
// 
// Purpose: Render the main dashboard layout with a tab-based
// navigation system that allows users to switch between
// different sections (Info, Flights, Points, Check-In)
// ==========================================================
export default function UserDashboard() {
  // State hook to track which tab is currently active/visible
  // Possible values: "info", "flights", "points", "checkin"
  const [tab, setTab] = useState("info");

  return (
    <div className="user-page">
      {/* ===== HEADER SECTION ===== */}
      {/* Displays the page title and subtitle for the dashboard */}
      <div className="user-header">
        <h1>Your Profile</h1>
        <p>Manage your profile, flights, and rewards</p>
      </div>

      {/* ===== NAVIGATION TABS SECTION ===== */}
      {/* Creates clickable tab buttons for switching between sections */}
      {/* Each tab corresponds to a different feature of the dashboard */}
      <div className="user-tabs">
        {/* Loop through all available tab options to create buttons */}
        {["info", "flights", "points", "checkin"].map((name) => (
          <button
            key={name}
            // When clicked, update the tab state to show that section
            onClick={() => setTab(name)}
            // Apply "active" class styling if this tab is currently selected
            className={`tab-btn ${tab === name ? "active" : ""}`}
          >
            {/* Display user-friendly label for each tab */}
            {name === "info" && "My Info"}
            {name === "flights" && "My Flights"}
            {name === "points" && "My Points"}
            {name === "checkin" && "Check-In"}
          </button>
        ))}
      </div>

      {/* ===== TAB CONTENT SECTION ===== */}
      {/* Render different components based on the active tab */}
      {/* Only one component is shown at a time */}
      <div className="user-content">
        {/* Show ProfileInfo component when "info" tab is selected */}
        {tab === "info" && <ProfileInfo />}
        {/* Show FlightHistory component when "flights" tab is selected */}
        {tab === "flights" && <FlightHistory />}
        {/* Show Points component when "points" tab is selected */}
        {tab === "points" && <Points />}
        {/* Show CheckIn component when "checkin" tab is selected */}
        {tab === "checkin" && <CheckIn />}
      </div>
    </div>
  );
}

// ==========================================================
// 🧍 MY INFO TAB / PROFILE INFO COMPONENT
//
// Purpose: Display the currently logged-in user's profile
// information including name, email, and frequent flyer number.
// Data is retrieved from localStorage where the user object
// is stored during authentication.
// 
// The component gracefully handles cases where the user is
// not logged in by displaying "Not logged in" messages.
// ==========================================================
// function ProfileInfo() {
//   return (
//     <div className="profile-card">
//       <p><strong className="highlight">Name:</strong> Saba Irfan</p>
//       <p><strong className="highlight">Email:</strong> saba.irfan@example.com</p>
//       <p><strong className="highlight">Frequent Flyer #:</strong> LIFT12345</p>
//       <p><strong className="highlight">Upcoming Flight:</strong> JFK → LHR on Nov 20, 2025</p>
//     </div>
//   );
// }

function ProfileInfo() {
  // Retrieve user object from browser's localStorage
  // The user data is stored as JSON when user logs in successfully
  // If not found, user will be null/undefined
  const user = JSON.parse(localStorage.getItem("liftoffUser"));

  // Return the profile card JSX structure
  return (
    <div className="profile-card">
      {/* Display User's Full Name */}
      {/* Shows "First Last" format if user is logged in, otherwise shows "Not logged in" */}
      <p>
        <strong className="highlight">Name:</strong> 
        {user ? ` ${user.firstName} ${user.lastName}` : " Not logged in"}
      </p>

      {/* Display User's Email */}
      {/* The username field stores the email address in this system */}
      <p>
        <strong className="highlight">Email:</strong> 
        {user ? ` ${user.username}` : " Not logged in"}
      </p>

      {/* Display Frequent Flyer Number */}
      {/* Generated from the user's unique ID (takes last 5 chars) */}
      <p>
        <strong className="highlight">Frequent Flyer #:</strong> 
        {user ? ` LIFT-${user._id.slice(-5).toUpperCase()}` : "N/A"} 
      </p>

      {/* Display Upcoming Flight Information */}
      {/* Currently shows placeholder message - would be updated with actual booking data */}
      <p>
        <strong className="highlight">Upcoming Flight:</strong>  
        You currently have no upcoming flights.
      </p>
    </div>
  );
}


// ==========================================================
// 🛫 MY FLIGHTS TAB / FLIGHT HISTORY COMPONENT
//
// Purpose: Display a list of flights the user has previously
// taken. Shows flight route information (departure and arrival
// airports) and dates. Currently uses hardcoded example data,
// but should be connected to a backend database in production.
// ==========================================================
// function FlightHistory() {
//   // Array of example/dummy flight records
//   // Each flight object contains:
//   // - id: unique identifier
//   // - from: departure airport (city name and airport code)
//   // - to: arrival airport (city name and airport code)
//   // - date: flight date in YYYY-MM-DD format
//   const flights = [
//     { id: 1, from: "New York (JFK)", to: "Los Angeles (LAX)", date: "2025-10-05" },
//     { id: 2, from: "Boston (BOS)", to: "Chicago (ORD)", date: "2025-09-22" },
//   ];

//   return (
//     <div>
//       {/* Section title for the flights list */}
//       <h2 className="section-title">Recent Flights</h2>
      
//       {/* Container for the flight list with styling from CSS */}
//       <ul className="flight-list">
//         {/* Map over each flight and render a list item for it */}
//         {flights.map((f) => (
//           <li key={f.id} className="flight-item">
//             {/* Left side: flight details (route and date) */}
//             <div>
//               {/* Flight route displayed in "FROM → TO" format */}
//               <p className="flight-route">{f.from} → {f.to}</p>
//               {/* Flight date shown below the route */}
//               <p className="flight-date">{f.date}</p>
//             </div>
//             {/* Right side: status badge showing flight is completed */}
//             <span className="flight-status">Completed</span>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

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
          {bookings.map((b) => (
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


// ==========================================================
// 💎 MY POINTS TAB / POINTS REWARDS COMPONENT
//
// Purpose: Display the user's accumulated reward points,
// progress toward the next reward milestone, and a history
// of all point transactions (both earned from flights and
// redeemed for upgrades or other benefits).
// ==========================================================
// function Points() {
//   // User's current point balance
//   const points = 8200;
  
//   // Points needed to unlock the next reward/benefit
//   const nextReward = 10000;
  
//   // Calculate the percentage of progress toward next reward
//   // Used for the visual progress bar (0-100%)
//   const percentage = (points / nextReward) * 100;

//   // Array of transaction history showing all point changes
//   // Each entry has:
//   // - id: unique identifier
//   // - flight: which flight the points were associated with
//   // - date: when the transaction occurred
//   // - change: amount (+earned or -redeemed)
//   // - note: description of why points changed
//   const history = [
//     { id: 1, flight: "JFK → LAX", date: "2025-10-05", change: "+10,000", note: "Earned from flight" },
//     { id: 2, flight: "LAX → ORD", date: "2025-09-15", change: "-2,000", note: "Redeemed for upgrade" },
//     { id: 3, flight: "BOS → CHI", date: "2025-08-20", change: "+5,000", note: "Earned from flight" },
//   ];

//   return (
//     <div>
//       {/* --- POINTS SUMMARY SECTION --- */}
//       {/* Shows total points and progress toward next reward */}
//       <div className="points-summary">
//         {/* Section heading */}
//         <h2 className="section-title">Your Rewards</h2>
        
//         {/* Display total points with highlighted styling */}
//         <p className="points-text">Total Points: <span className="highlight">{points}</span></p>

//         {/* --- PROGRESS BAR --- */}
//         {/* Visual representation of progress toward next reward */}
//         {/* The inner div fills from left to right based on percentage */}
//         <div className="progress-bar">
//           {/* Inner bar that fills proportionally to user's progress */}
//           <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
//         </div>

//         {/* Show how many points are needed until the next reward */}
//         <p className="points-subtext">
//           {nextReward - points} points to your next flight upgrade!
//         </p>
//       </div>

//       {/* --- POINTS HISTORY SECTION --- */}
//       {/* Lists all transactions that have affected the user's points */}
//       <h3 className="section-subtitle">Point History</h3>
//       <div className="points-history">
//         {/* Map over history array and create a card for each transaction */}
//         {history.map((item) => (
//           <div key={item.id} className="points-history-card">
//             {/* Left side: transaction details */}
//             <div>
//               {/* Flight associated with this transaction */}
//               <p className="points-flight">{item.flight}</p>
//               {/* Date of the transaction */}
//               <p className="points-date">{item.date}</p>
//               {/* Description of why points changed */}
//               <p className="points-note">{item.note}</p>
//             </div>

//             {/* Right side: point change amount */}
//             {/* Dynamically apply CSS class based on whether points were earned or used */}
//             <span
//               className={`points-change ${
//                 // Add "earned" class (green) if change starts with "+", else "used" (red)
//                 item.change.startsWith("+") ? "earned" : "used"
//               }`}
//             >
//               {/* Display the amount of points gained or lost */}
//               {item.change}
//             </span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

function Points() {
  const user = JSON.parse(localStorage.getItem("liftoffUser"));
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const nextReward = 10000;

  useEffect(() => {
    if (!user) return;

    axios.get(`http://localhost:9000/user/points/${user._id}`)
      .then(res => {
        setPoints(res.data.totalPoints);
        setHistory(res.data.history);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading points:", err);
        setLoading(false);
      });
  }, [user]);

  if (!user) return <p>Please log in to view your points.</p>;

  if (loading) return <p>Loading your points...</p>;

  const percentage = Math.min((points / nextReward) * 100, 100);

  return (
    <div>
      <div className="points-summary">
        <h2 className="section-title">Your Rewards</h2>

        <p className="points-text">
          Total Points: <span className="highlight">{points}</span>
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
          {history.map((item, index) => (
            <div key={index} className="points-history-card">
              <div>
                <p className="points-flight">{item.flight}</p>
                <p className="points-date">{item.date}</p>
                <p className="points-note">{item.note}</p>
              </div>

              <span className="points-change earned">
                {item.change}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// ==========================================================
// ✈️ CHECK-IN TAB / CHECK-IN COMPONENT
//
// Purpose: Provide flight check-in functionality for users.
// Users enter their confirmation code and last name to lookup
// their reservation. Once found, they can check in if they're
// within the 8-hour window before departure. The component
// validates inputs, searches for matching reservations, and
// allows the user to complete the check-in process.
// ==========================================================
function CheckIn() {
  // --- REACT STATE HOOKS ---
  // Stores the confirmation code entered by the user
  const [code, setCode] = useState("");
  
  // Stores the last name entered by the user
  const [last, setLast] = useState("");
  
  // Stores the matched reservation object when lookup is successful
  // Null if no reservation found yet or search hasn't been performed
  const [result, setResult] = useState(null);
  
  // Stores error message if reservation lookup fails
  const [error, setError] = useState("");

  // --- DUMMY FLIGHT RESERVATION DATA ---
  // Mock database of flight reservations
  // In production, this would come from an API call to the backend
  // useMemo prevents re-creation of this data on every render
  const reservations = useMemo(
    () => [
      {
        // Unique confirmation code for this reservation
        confirmation: "DL7K3Q",
        // Last name of passenger
        last: "Irfan",
        // First name of passenger
        first: "Saba",
        // Airline name
        airline: "Delta",
        // Flight number
        flightNo: "DL 1234",
        // Departure airport code
        from: "JFK",
        // Arrival airport code
        to: "LHR",
        // ISO 8601 datetime string including timezone info
        departIso: "2025-11-20T08:30:00-05:00",
        // Whether user has already checked in for this flight
        checkedIn: false,
      },
      {
        // Second example reservation
        confirmation: "UA55AA",
        last: "Syed",
        first: "Malka",
        airline: "United",
        flightNo: "UA 22",
        from: "EWR",
        to: "SFO",
        departIso: "2025-11-20T07:10:00-05:00",
        // This one is already checked in
        checkedIn: true,
      },
    ],
    []
  );

  // --- RESERVATION LOOKUP FUNCTION ---
  // Called when user submits the lookup form
  // Searches reservations array for a matching code + last name combination
  function findReservation(e) {
    // Prevent default form submission behavior
    e.preventDefault();
    
    // Clear any previous error messages
    setError("");

    // Search through reservations array for a match
    // Must match BOTH confirmation code AND last name (case-insensitive)
    const hit = reservations.find(
      r =>
        // Compare confirmation code (uppercase for consistency)
        r.confirmation.toUpperCase() === code.trim().toUpperCase() &&
        // Compare last name (lowercase for consistency)
        r.last.toLowerCase() === last.trim().toLowerCase()
    );

    // If no matching reservation found
    if (!hit) {
      // Clear any previous result
      setResult(null);
      // Set error message for user
      setError("No reservation found. Check your code and last name.");
      return;
    }

    // If match found, store the reservation in state
    setResult({ ...hit });
  }

  // --- CHECK-IN ELIGIBILITY FUNCTION ---
  // Determines if a flight is within the check-in window
  // Check-in is allowed up to 8 hours before departure
  function canCheckIn(depIso) {
    // Convert ISO datetime string to milliseconds since epoch
    const dep = new Date(depIso).getTime();
    
    // Get current time in milliseconds
    const now = Date.now();
    
    // Calculate check-in window start (8 hours before departure)
    // 8 * 60 * 60 * 1000 = 8 hours in milliseconds
    const open = dep - 8 * 60 * 60 * 1000;
    
    // Check-in is available if current time is after window opens
    // AND before departure time
    return now >= open && now < dep;
  }

  // --- DATETIME FORMATTING FUNCTION ---
  // Converts ISO 8601 datetime string to user-friendly local format
  // Example: "11/20/2025, 8:30 AM"
  function formatDT(depIso) {
    // Create Date object from ISO string
    const d = new Date(depIso);
    
    // Format using browser's locale settings
    // dateStyle: "medium" = "Nov 20, 2025"
    // timeStyle: "short" = "8:30 AM"
    return d.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  }

  // --- CHECK-IN ACTION FUNCTION ---
  // Simulates completing the check-in process
  // Updates the reservation to mark as checked in
  function handleCheckIn() {
    // Update result state to set checkedIn to true
    setResult(prev => ({ ...prev, checkedIn: true }));
  }

  // Determine if check-in button should be enabled
  // Only enabled if: reservation found AND check-in window is open
  const eligible = result ? canCheckIn(result.departIso) : false;

  // Return the check-in form and results UI
  return (
    <div className="checkin-card">
      <h2 className="checkin-title">Check-In</h2>
      <p className="checkin-instruction">
        Check in for your upcoming flight up to <strong>8 hours before departure</strong>.
      </p>

      {/* --- RESERVATION LOOKUP FORM --- */}
      {/* User enters confirmation code and last name to find their flight */}
      <form onSubmit={findReservation} className="checkin-form">
        {/* Input field for confirmation code */}
        <label>
          Confirmation Code
          <input
            placeholder="e.g., DL7K3Q"
            value={code}
            // Update state as user types
            onChange={e => setCode(e.target.value)}
          />
        </label>

        {/* Input field for last name */}
        <label>
          Last Name
          <input
            placeholder="e.g., Irfan"
            value={last}
            // Update state as user types
            onChange={e => setLast(e.target.value)}
          />
        </label>

        {/* Submit button to trigger reservation lookup */}
        <button type="submit">Find my trip</button>
        
        {/* Show error message if reservation lookup failed */}
        {error && <div className="error-msg">{error}</div>}
      </form>

      {/* --- RESERVATION DETAILS & CHECK-IN SECTION --- */}
      {/* Only displayed if a reservation was successfully found */}
      {result && (
        <div className="checkin-result">
          {/* Display airline name and flight number */}
          <p><strong>{result.airline}</strong> — {result.flightNo}</p>
          
          {/* Display flight route (departure airport → arrival airport) */}
          <p>{result.from} → {result.to}</p>
          
          {/* Display departure time in user's local timezone */}
          <p>Departure: {formatDT(result.departIso)}</p>

          {/* --- DYNAMIC CHECK-IN STATUS --- */}
          {/* Shows different messages based on check-in eligibility */}
          <p>
            Status:{" "}
            {/* If already checked in, show success message */}
            {result.checkedIn ? (
              <strong className="status-success">Checked in ✅</strong>
            ) : /* If check-in window is open, show available status */
            eligible ? (
              <strong className="status-open">Check-in available</strong>
            ) : /* If check-in window not open yet, show when it opens */
            (
              <span className="status-closed">Opens 8h before departure</span>
            )}
          </p>

          {/* --- CHECK-IN BUTTON --- */}
          {/* Only show button if: NOT already checked in AND check-in window is open */}
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
