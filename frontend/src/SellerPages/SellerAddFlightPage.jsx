import { useState } from "react";

export default function AddFlight() {
  const [flight, setFlight] = useState({
    airline: "",
    flightNo: "",
    from: "",
    to: "",
    depart: "",
    arrive: "",
    durationMin: "",
    stops: "",
    price: "",
    rating: "",

    // Airport info
    fromFull: "",
    fromFullAddress: "",
    terminalFrom: "",
    gateFrom: "",
    toFull: "",
    toFullAddress: "",
    terminalTo: "",
    gateTo: "",
    baggageClaim: "",

    // Local Times
    departureTimeLocal: "",
    arrivalTimeLocal: "",
    timezoneChange: "",

    // Baggage
    carryOnBagsAllowed: "",
    carryOnWeightLimitKg: "",
    personalItemAllowed: "",
    checkedBagsAllowed: "",
    checkedBagWeightLimitKg: "",
    extraBagFeeUSD: "",

    // Aircraft
    aircraftModel: "",
    aircraftCode: "",
    aircraftAgeYears: "",
    aircraftCapacity: "",
    seatLayout: "",
    seatPitch: "",
    seatWidth: "",
    hasUSBOutlets: "",
    hasPowerOutlets: "",
    hasLiveTV: "",

    // Performance
    onTimePercentage: "",
    averageDelayMin: "",
    cancellationRate: "",
    weatherDelayRiskScore: "",
    safetyScore: "",
  });

  const handleChange = (e) => {
    setFlight({ ...flight, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log("Submitting Flight:", flight);
    alert("Flight Added Successfully!");
  };

  return (
    <div style={styles.page}>
      <main style={styles.hero}>
        <div style={styles.heroInner}>
          
          <h2 style={styles.title}>Add New Flight</h2>

          {/* -------------------------------- */}
          {/* 1️⃣ SUMMARY CARD */}
          {/* -------------------------------- */}
          <div style={styles.summaryCard}>
            <div style={styles.summaryRow}>

              {/* Airline / Flight No / Rating */}
              <div>
                <label style={styles.label}>Airline</label>
                <input 
                  name="airline" 
                  placeholder="Delta Airlines"
                  value={flight.airline} 
                  onChange={handleChange} 
                  style={styles.input} 
                />

                <label style={styles.label}>Flight Number</label>
                <input 
                  name="flightNo"
                  placeholder="DL245"
                  value={flight.flightNo}
                  onChange={handleChange}
                  style={styles.input} 
                />

                <label style={styles.label}>Rating ★</label>
                <input 
                  name="rating"
                  placeholder="4.6"
                  value={flight.rating}
                  onChange={handleChange}
                  style={styles.input} 
                />
              </div>

              {/* From / Depart */}
              <div>
                <label style={styles.label}>From (Airport Code)</label>
                <input 
                  name="from"
                  placeholder="JFK"
                  value={flight.from}
                  onChange={handleChange}
                  style={styles.input} 
                />

                <label style={styles.label}>Departure Time</label>
                <input 
                  name="depart"
                  placeholder="08:30 AM"
                  value={flight.depart}
                  onChange={handleChange}
                  style={styles.input} 
                />
              </div>

              {/* Duration / Stops */}
              <div>
                <label style={styles.label}>Duration (min)</label>
                <input 
                  name="durationMin"
                  placeholder="180"
                  value={flight.durationMin}
                  onChange={handleChange}
                  style={styles.input} 
                />

                <label style={styles.label}>Stops</label>
                <input 
                  name="stops"
                  placeholder="0"
                  value={flight.stops}
                  onChange={handleChange}
                  style={styles.input} 
                />
              </div>

              {/* To / Arrive */}
              <div>
                <label style={styles.label}>To (Airport Code)</label>
                <input 
                  name="to"
                  placeholder="LAX"
                  value={flight.to}
                  onChange={handleChange}
                  style={styles.input} 
                />

                <label style={styles.label}>Arrival Time</label>
                <input 
                  name="arrive"
                  placeholder="11:15 AM"
                  value={flight.arrive}
                  onChange={handleChange}
                  style={styles.input} 
                />
              </div>

              {/* Price */}
              <div>
                <label style={styles.label}>Price ($)</label>
                <input 
                  name="price"
                  placeholder="299"
                  value={flight.price}
                  onChange={handleChange}
                  style={styles.input} 
                />
              </div>

            </div>
          </div>

          {/* -------------------------------- */}
          {/* 2️⃣ AIRPORT & ROUTE INFO */}
          {/* -------------------------------- */}
          <div style={styles.sectionCard}>
            <h3>Airport & Route Information</h3>

            <div style={styles.twoColumn}>
              <div>
                <h4 style={styles.subheading}>Departure Airport</h4>

                <label style={styles.label}>Full Name</label>
                <input 
                  name="fromFull"
                  placeholder="John F. Kennedy International Airport"
                  value={flight.fromFull}
                  onChange={handleChange}
                  style={styles.input} 
                />

                <label style={styles.label}>Address</label>
                <input 
                  name="fromFullAddress"
                  placeholder="123 Airport Rd, New York, NY"
                  value={flight.fromFullAddress}
                  onChange={handleChange}
                  style={styles.input} 
                />

                <label style={styles.label}>Terminal</label>
                <input 
                  name="terminalFrom"
                  placeholder="4"
                  value={flight.terminalFrom}
                  onChange={handleChange}
                  style={styles.input} 
                />

                <label style={styles.label}>Gate</label>
                <input 
                  name="gateFrom"
                  placeholder="B22"
                  value={flight.gateFrom}
                  onChange={handleChange}
                  style={styles.input} 
                />
              </div>

              {/* Arrival */}
              <div>
                <h4 style={styles.subheading}>Arrival Airport</h4>

                <label style={styles.label}>Full Name</label>
                <input 
                  name="toFull"
                  placeholder="Los Angeles International Airport"
                  value={flight.toFull}
                  onChange={handleChange}
                  style={styles.input} 
                />

                <label style={styles.label}>Address</label>
                <input 
                  name="toFullAddress"
                  placeholder="1 World Way, Los Angeles, CA"
                  value={flight.toFullAddress}
                  onChange={handleChange}
                  style={styles.input} 
                />

                <label style={styles.label}>Terminal</label>
                <input 
                  name="terminalTo"
                  placeholder="5"
                  value={flight.terminalTo}
                  onChange={handleChange}
                  style={styles.input} 
                />

                <label style={styles.label}>Gate</label>
                <input 
                  name="gateTo"
                  placeholder="C19"
                  value={flight.gateTo}
                  onChange={handleChange}
                  style={styles.input} 
                />

                <label style={styles.label}>Baggage Claim</label>
                <input 
                  name="baggageClaim"
                  placeholder="Carousel 7"
                  value={flight.baggageClaim}
                  onChange={handleChange}
                  style={styles.input} 
                />
              </div>
            </div>

            <hr style={styles.separator} />

            <div style={styles.twoColumn}>
              <div>
                <label style={styles.label}>Departure Time (Local)</label>
                <input 
                  name="departureTimeLocal"
                  placeholder="08:30 AM EST"
                  value={flight.departureTimeLocal}
                  onChange={handleChange}
                  style={styles.input} 
                />
              </div>

              <div>
                <label style={styles.label}>Arrival Time (Local)</label>
                <input 
                  name="arrivalTimeLocal"
                  placeholder="11:15 AM PST"
                  value={flight.arrivalTimeLocal}
                  onChange={handleChange}
                  style={styles.input} 
                />
              </div>
            </div>

            <label style={styles.label}>Time Zone Change</label>
            <input 
              name="timezoneChange"
              placeholder="-3 hours"
              value={flight.timezoneChange}
              onChange={handleChange}
              style={styles.input} 
            />
          </div>

          {/* -------------------------------- */}
          {/* 3️⃣ BAGGAGE */}
          {/* -------------------------------- */}
          <div style={styles.sectionCard}>
            <h3>Baggage Information</h3>

            <div style={styles.twoColumn}>
              <div>
                <label style={styles.label}>Carry-On Bags Allowed</label>
                <input 
                  name="carryOnBagsAllowed"
                  placeholder="1"
                  value={flight.carryOnBagsAllowed}
                  onChange={handleChange}
                  style={styles.input} 
                />

                <label style={styles.label}>Carry-On Weight (kg)</label>
                <input 
                  name="carryOnWeightLimitKg"
                  placeholder="10"
                  value={flight.carryOnWeightLimitKg}
                  onChange={handleChange}
                  style={styles.input} 
                />

                <label style={styles.label}>Personal Item Allowed?</label>
                <input 
                  name="personalItemAllowed"
                  placeholder="Yes"
                  value={flight.personalItemAllowed}
                  onChange={handleChange}
                  style={styles.input} 
                />
              </div>

              <div>
                <label style={styles.label}>Checked Bags Allowed</label>
                <input 
                  name="checkedBagsAllowed"
                  placeholder="2"
                  value={flight.checkedBagsAllowed}
                  onChange={handleChange}
                  style={styles.input} 
                />

                <label style={styles.label}>Checked Bag Weight (kg)</label>
                <input 
                  name="checkedBagWeightLimitKg"
                  placeholder="23"
                  value={flight.checkedBagWeightLimitKg}
                  onChange={handleChange}
                  style={styles.input} 
                />

                <label style={styles.label}>Extra Bag Fee ($)</label>
                <input 
                  name="extraBagFeeUSD"
                  placeholder="75"
                  value={flight.extraBagFeeUSD}
                  onChange={handleChange}
                  style={styles.input} 
                />
              </div>
            </div>
          </div>

          {/* -------------------------------- */}
          {/* 4️⃣ AIRCRAFT */}
          {/* -------------------------------- */}
          <div style={styles.sectionCard}>
            <h3>Aircraft Information</h3>

            <div style={styles.twoColumn}>
              <div>
                <label style={styles.label}>Model</label>
                <input 
                  name="aircraftModel"
                  placeholder="Boeing 737"
                  value={flight.aircraftModel}
                  onChange={handleChange}
                  style={styles.input} 
                />

                <label style={styles.label}>Registration</label>
                <input 
                  name="aircraftCode"
                  placeholder="N123AB"
                  value={flight.aircraftCode}
                  onChange={handleChange}
                  style={styles.input} 
                />

                <label style={styles.label}>Age (years)</label>
                <input 
                  name="aircraftAgeYears"
                  placeholder="6"
                  value={flight.aircraftAgeYears}
                  onChange={handleChange}
                  style={styles.input} 
                />

                <label style={styles.label}>Capacity</label>
                <input 
                  name="aircraftCapacity"
                  placeholder="180"
                  value={flight.aircraftCapacity}
                  onChange={handleChange}
                  style={styles.input} 
                />
              </div>

              <div>
                <label style={styles.label}>Seat Layout</label>
                <input 
                  name="seatLayout"
                  placeholder="3-3"
                  value={flight.seatLayout}
                  onChange={handleChange}
                  style={styles.input} 
                />

                <label style={styles.label}>Seat Pitch (inches)</label>
                <input 
                  name="seatPitch"
                  placeholder="31"
                  value={flight.seatPitch}
                  onChange={handleChange}
                  style={styles.input} 
                />

                <label style={styles.label}>Seat Width (inches)</label>
                <input 
                  name="seatWidth"
                  placeholder="17"
                  value={flight.seatWidth}
                  onChange={handleChange}
                  style={styles.input} 
                />
              </div>
            </div>

            <hr style={styles.separator} />

            <div style={styles.twoColumn}>
              <div>
                <label style={styles.label}>USB Outlets?</label>
                <input 
                  name="hasUSBOutlets"
                  placeholder="Yes"
                  value={flight.hasUSBOutlets}
                  onChange={handleChange}
                  style={styles.input} 
                />
              </div>

              <div>
                <label style={styles.label}>Power Outlets?</label>
                <input 
                  name="hasPowerOutlets"
                  placeholder="Yes"
                  value={flight.hasPowerOutlets}
                  onChange={handleChange}
                  style={styles.input} 
                />
              </div>

              <div>
                <label style={styles.label}>Live TV?</label>
                <input 
                  name="hasLiveTV"
                  placeholder="Yes"
                  value={flight.hasLiveTV}
                  onChange={handleChange}
                  style={styles.input} 
                />
              </div>
            </div>
          </div>

          {/* -------------------------------- */}
          {/* 5️⃣ PERFORMANCE */}
          {/* -------------------------------- */}
          <div style={styles.sectionCard}>
            <h3>Performance & Reliability</h3>

            <div style={styles.twoColumn}>
              <div>
                <label style={styles.label}>On-Time Rate (%)</label>
                <input 
                  name="onTimePercentage"
                  placeholder="88"
                  value={flight.onTimePercentage}
                  onChange={handleChange}
                  style={styles.input} 
                />
              </div>

              <div>
                <label style={styles.label}>Average Delay (min)</label>
                <input 
                  name="averageDelayMin"
                  placeholder="12"
                  value={flight.averageDelayMin}
                  onChange={handleChange}
                  style={styles.input} 
                />
              </div>

              <div>
                <label style={styles.label}>Cancellation Rate (%)</label>
                <input 
                  name="cancellationRate"
                  placeholder="1.5"
                  value={flight.cancellationRate}
                  onChange={handleChange}
                  style={styles.input} 
                />
              </div>

              <div>
                <label style={styles.label}>Weather Delay Risk (1–5)</label>
                <input 
                  name="weatherDelayRiskScore"
                  placeholder="2"
                  value={flight.weatherDelayRiskScore}
                  onChange={handleChange}
                  style={styles.input} 
                />
              </div>
            </div>

            <label style={styles.label}>Safety Score (1–5)</label>
            <input 
              name="safetyScore"
              placeholder="5"
              value={flight.safetyScore}
              onChange={handleChange}
              style={styles.input} 
            />
          </div>

          {/* -------------------------------- */}
          {/* SUBMIT BUTTON */}
          {/* -------------------------------- */}
          <div style={styles.bookBox}>
            <button style={styles.bookBtn} onClick={handleSubmit}>
              Save Flight
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}

/*************  STYLES  *************/

const styles = {
  page: {
    fontFamily: "system-ui, sans-serif",
    color: "#111",
  },
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
  summaryCard: {
    width: "1100px",
    background: "white",
    border: "1px solid #e7ebf0",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 1px 2px rgba(0,0,0,.04)",
  },
  summaryRow: {
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr 1fr 1fr auto",
    gap: 20,
  },
  sectionCard: {
    width: "1100px",
    background: "white",
    border: "1px solid #e7ebf0",
    borderRadius: 12,
    padding: 25,
    boxShadow: "0 1px 3px rgba(0,0,0,.05)",
  },
  separator: {
    margin: "18px 0",
    borderBottom: "1px solid #ddd",
  },
  subheading: {
    fontWeight: 700,
    fontSize: 15,
    marginBottom: 10,
    color: "#333",
  },
  twoColumn: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },
  label: {
    fontSize: "14px",
    fontWeight: 600,
    marginBottom: "6px",
    marginTop: "6px",
    display: "block",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "10px",
    fontSize: "14px",
  },
  bookBox: {
    width: "1100px",
    background: "white",
    border: "1px solid #d4d8e0",
    borderRadius: 12,
    padding: 24,
    textAlign: "center",
    boxShadow: "0 1px 2px rgba(0,0,0,.05)",
  },
  bookBtn: {
    marginTop: 12,
    height: 46,
    background: "#2f6feb",
    border: "none",
    color: "white",
    width: "100%",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
  },
};
