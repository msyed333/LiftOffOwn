import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function FlightDetails() {
  const { id } = useParams();   // MongoDB _id
  const [flight, setFlight] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:9000/flights/${id}`)
      .then(res => setFlight(res.data))
      .catch(err => console.error("Error loading flight:", err));
  }, [id]);

  if (!flight) {
    return <div style={{ padding: 20 }}>Loading flight details...</div>;
  }

  return (
    <div style={styles.page}>
      <main style={styles.hero}>
        <div style={styles.heroInner}>

          <h2 style={styles.title}>Flight Details</h2>

          {/* -------------------------------- */}
          {/* 1️⃣ SUMMARY CARD */}
          {/* -------------------------------- */}
          <div style={styles.summaryCard}>
            <div style={styles.summaryRow}>
              <div>
                <div style={styles.summaryAirline}>
                  {flight.airline} <span style={styles.badge}>{flight.flightNo}</span>
                </div>
                <div style={styles.subtext}>{flight.from} → {flight.to}</div>
              </div>

              <div>
                <div style={styles.time}>{flight.depart}</div>
                <div style={styles.subtext}>{flight.from}</div>
              </div>

              <div style={{ textAlign: "center" }}>
                <div style={styles.subtext}>{flight.durationMin} min</div>
                <div style={styles.subtext}>
                  {flight.stops === 0 ? "Nonstop" : `${flight.stops} stop(s)`}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={styles.time}>{flight.arrive}</div>
                <div style={styles.subtext}>{flight.to}</div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={styles.price}>${flight.price}</div>
                <div style={styles.subtext}>★ {flight.rating}</div>
              </div>
            </div>

            <div style={styles.amenitiesRow}>
              {flight.amenities.wifi && <span style={styles.amenity}>WiFi</span>}
              {flight.amenities.meals && <span style={styles.amenity}>Meals</span>}
              {flight.amenities.entertainment && <span style={styles.amenity}>Entertainment</span>}
              {flight.amenities.chargingPorts && <span style={styles.amenity}>Charging Ports</span>}
            </div>
          </div>

          {/* -------------------------------- */}
          {/* 2️⃣ AIRPORT & ROUTE — 2 columns */}
          {/* -------------------------------- */}
          <div style={styles.sectionCard}>
            <h3>Airport & Route Information</h3>

            <div style={styles.twoColumn}>
              {/* LEFT — FROM */}
              <div>
                <h4 style={styles.subheading}>Departure Airport</h4>
                <p><strong>{flight.fromFull}</strong> ({flight.from})</p>
                <p><strong>Address:</strong> {flight.fromFullAddress}</p>
                <p><strong>Terminal:</strong> {flight.terminalFrom}</p>
                <p><strong>Gate:</strong> {flight.gateFrom}</p>
              </div>

              {/* RIGHT — TO */}
              <div>
                <h4 style={styles.subheading}>Arrival Airport</h4>
                <p><strong>{flight.toFull}</strong> ({flight.to})</p>
                <p><strong>Address:</strong> {flight.toFullAddress}</p>
                <p><strong>Terminal:</strong> {flight.terminalTo}</p>
                <p><strong>Gate:</strong> {flight.gateTo}</p>
                <p><strong>Baggage Claim:</strong> {flight.baggageClaim}</p>
              </div>
            </div>

            <hr style={styles.separator} />

            <div style={styles.twoColumn}>
              <p><strong>Departure Time (Local):</strong> {flight.departureTimeLocal}</p>
              <p><strong>Arrival Time (Local):</strong> {flight.arrivalTimeLocal}</p>
            </div>

            <p><strong>Time Zone Change:</strong> {flight.timezoneChange}</p>

            {/* ----------------------- */}
            {/* STOP INFORMATION */}
            {/* ----------------------- */}
            {flight.stops > 0 && (
              <>
                <hr style={styles.separator} />
                <h4 style={styles.subheading}>Stopovers</h4>

                <div style={styles.stopGrid}>
                  {flight.stopInfo.map((stop, i) => (
                    <div key={i} style={styles.stopCard}>
                      <p><strong>Stop {i + 1}:</strong> {stop.fullName} ({stop.code})</p>
                      <p><strong>Address:</strong> {stop.address}</p>
                      <p><strong>Duration:</strong> {stop.durationMin} minutes</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* -------------------------------- */}
          {/* 3️⃣ BAGGAGE INFORMATION */}
          {/* -------------------------------- */}
          <div style={styles.sectionCard}>
            <h3>Baggage Information</h3>

            <div style={styles.twoColumn}>
              <div>
                <h4 style={styles.subheading}>Carry-On</h4>
                <p><strong>Bags Allowed:</strong> {flight.carryOnBagsAllowed}</p>
                <p><strong>Weight Limit:</strong> {flight.carryOnWeightLimitKg} kg</p>
                <p><strong>Personal Item:</strong> {flight.personalItemAllowed ? "Allowed" : "Not allowed"}</p>
              </div>

              <div>
                <h4 style={styles.subheading}>Checked Bags</h4>
                <p><strong>Bags Allowed:</strong> {flight.checkedBagsAllowed}</p>
                <p><strong>Weight Limit:</strong> {flight.checkedBagWeightLimitKg} kg</p>
                <p><strong>Extra Bag Fee:</strong> ${flight.extraBagFeeUSD}</p>
              </div>
            </div>
          </div>

          {/* -------------------------------- */}
          {/* 4️⃣ AIRCRAFT DETAILS — 2 columns */}
          {/* -------------------------------- */}
          <div style={styles.sectionCard}>
            <h3>Aircraft Information</h3>

            <div style={styles.twoColumn}>
              <div>
                <p><strong>Model:</strong> {flight.aircraftModel}</p>
                <p><strong>Registration:</strong> {flight.aircraftCode}</p>
                <p><strong>Age:</strong> {flight.aircraftAgeYears} years</p>
                <p><strong>Capacity:</strong> {flight.aircraftCapacity} seats</p>
              </div>

              <div>
                <p><strong>Seat Layout:</strong> {flight.seatLayout}</p>
                <p><strong>Seat Pitch:</strong> {flight.seatPitch}</p>
                <p><strong>Seat Width:</strong> {flight.seatWidth}</p>
              </div>
            </div>

            <hr style={styles.separator} />

            <div style={styles.twoColumn}>
              <p><strong>USB Outlets:</strong> {flight.hasUSBOutlets ? "Yes" : "No"}</p>
              <p><strong>Power Outlets:</strong> {flight.hasPowerOutlets ? "Yes" : "No"}</p>
              <p><strong>Live TV:</strong> {flight.hasLiveTV ? "Yes" : "No"}</p>
            </div>
          </div>

          {/* -------------------------------- */}
          {/* 5️⃣ PERFORMANCE METRICS */}
          {/* -------------------------------- */}
          <div style={styles.sectionCard}>
            <h3>Performance & Reliability</h3>

            <div style={styles.twoColumn}>
              <p><strong>On-Time Rate:</strong> {flight.onTimePercentage}%</p>
              <p><strong>Avg Delay:</strong> {flight.averageDelayMin} min</p>
              <p><strong>Cancellation Rate:</strong> {flight.cancellationRate}%</p>
              <p><strong>Weather Delay Risk:</strong> {flight.weatherDelayRiskScore}/5</p>
            </div>

            <p><strong>Safety Score:</strong> {flight.safetyScore}/5</p>
          </div>

          {/* -------------------------------- */}
          {/* 6️⃣ BOOKING BOX */}
          {/* -------------------------------- */}
          <div style={styles.bookBox}>
            <h3>Total Price: ${flight.price}</h3>
            <button 
            style={styles.bookBtn}
            onClick={() => navigate("/payment", { state: { flightId: flight._id } })}
            >
            Book Flight
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}

/* -------------------------------- */
/*              STYLES              */
/* -------------------------------- */

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
    alignItems: "center",
  },

  subheading: {
    marginTop: 0,
    marginBottom: 8,
    fontWeight: 700,
    fontSize: 15,
    color: "#333",
  },

  amenitiesRow: {
    marginTop: 10,
    display: "flex",
    gap: 10,
  },

  amenity: {
    fontSize: 12,
    background: "#f3f4f6",
    padding: "5px 10px",
    borderRadius: 6,
    color: "#444",
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
    border: "none",
    borderBottom: "1px solid #ddd",
  },

  /* ⭐ 2-COLUMN GRID FOR ANY TWO SIDE-BY-SIDE SECTIONS */
  twoColumn: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    alignItems: "start",
    marginBottom: 10,
  },

  /* ⭐ STOP GRID — 2 per row, wraps naturally */
  stopGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },

  stopCard: {
    padding: 15,
    border: "1px solid #eee",
    borderRadius: 10,
    background: "#fafafa",
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
  }
};
