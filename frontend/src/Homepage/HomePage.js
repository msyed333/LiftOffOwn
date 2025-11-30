import { Link, useNavigate } from "react-router-dom";
//import flightsData from "../Components/flightsData";
import { useMemo, useState, useEffect } from "react";
import axios from "axios";


export default function Homepage() {
  // ---- Query state ----
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [airline, setAirline] = useState("All");
  const [nonstopOnly, setNonstopOnly] = useState(false);
  const [sortBy, setSortBy] = useState("priceAsc");
  const navigate = useNavigate();


  //get data from mongodb
  const [flights, setFlights] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:9000/flights")
      .then((res) => {
        setFlights(res.data);
      })
      .catch((err) => {
        console.error("Error fetching flights:", err);
      });
  }, []);



  const airlineOptions = useMemo(
    () => ["All", ...Array.from(new Set(flights.map(f => f.airline)))],
    [flights]
  );

  const handleLogout = () => {
  localStorage.removeItem("liftoffUser");
  window.location.reload(); // refresh navbar instantly
  };

  // ---- Clear all search/filter fields ----
  const handleClearSearch = () => {
    setFrom("");
    setTo("");
    setDate("");
    setPassengers(1);
    setAirline("All");
    setNonstopOnly(false);
    setSortBy("priceAsc");
  };


  // ---- Helper function to map airport codes to city names ----
  const airportCityMap = {
    JFK: "New York",
    LGA: "New York",
    EWR: "Newark",
    LHR: "London",
    SFO: "San Francisco",
    MIA: "Miami",
    LAX: "Los Angeles",
    ALB: "Albany",
    DFW: "Dallas",
    DEN: "Denver",
    CDG: "Paris",
    MCO: "Orlando"
  };

  const results = useMemo(() => {
    let out = flights.filter(f => {
      // For FROM: check both airport code and city name
      const searchFromLower = from.trim().toLowerCase();
      const matchFrom = from ? (
        f.from.toLowerCase().includes(searchFromLower) || 
        airportCityMap[f.from]?.toLowerCase().includes(searchFromLower)
      ) : true;

      // For TO: check both airport code and city name
      const searchToLower = to.trim().toLowerCase();
      const matchTo = to ? (
        f.to.toLowerCase().includes(searchToLower) || 
        airportCityMap[f.to]?.toLowerCase().includes(searchToLower)
      ) : true;

      const matchDate = date ? f.date === date : true;
      const matchAirline = airline === "All" ? true : f.airline === airline;
      const matchStops = nonstopOnly ? f.stops === 0 : true;
      return matchFrom && matchTo && matchDate && matchAirline && matchStops;
    });

    switch (sortBy) {
      case "priceAsc": out.sort((a, b) => a.price - b.price); break;
      case "priceDesc": out.sort((a, b) => b.price - a.price); break;
      case "durationAsc": out.sort((a, b) => a.durationMin - b.durationMin); break;
      case "departAsc": out.sort((a, b) => toMinutes(a.depart) - toMinutes(b.depart)); break;
      case "ratingDesc": out.sort((a, b) => b.rating - a.rating); break;
      default: break;
    }
    return out;
  }, [flights, from, to, date, airline, nonstopOnly, sortBy]);

  return (
    <div style={styles.page}>
      {/* ======= Header ======= */}
      <header style={styles.header}>
        <div style={{ ...styles.container, ...styles.headerFlex }}>
          <div style={styles.brand}>LiftOff</div>

          <nav style={styles.nav}>
            <Link style={styles.link} to="/signup-seller">Seller</Link>
            <Link style={styles.link} to="/support">Customer-Support</Link> 
            <Link style={styles.link} to="/updates"> Updates</Link>
          </nav>

          {/* <div style={styles.authButtons}>
            <Link to="/Login" className="nav-login-btn">Login</Link>
            <Link to="/SignUpPage" className="nav-signup-btn">Sign Up</Link>
          </div> */}
          <nav style={styles.authButtons}>
            {localStorage.getItem("liftoffUser") ? (
              <>
                <Link style={styles.loginBtn} to="/UserDashboard">Your Profile</Link>
                <button onClick={handleLogout} style={styles.signupBtn}>Logout</button>
              </>
            ) : (
              <>
                <Link style={styles.loginBtn} to="/Login">Login</Link>
                <Link style={styles.signupBtn} to="/SignUpPage">Sign Up</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ======= Hero + Search ======= */}
      <main style={styles.hero}>
        <div style={{ ...styles.container, ...styles.heroInner }}>

          {/* Search card */}
          <form
            style={styles.card}
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div style={styles.row}>
              <label style={styles.label}>
                From
                <input
                  style={styles.input}
                  placeholder="e.g., JFK, EWR, ALB…"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </label>

              <label style={styles.label}>
                To
                <input
                  style={styles.input}
                  placeholder="e.g., LHR, SFO, MIA…"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </label>
            </div>

            <div style={styles.row}>
              <label style={styles.label}>
                Depart
                <input
                  type="date"
                  style={styles.input}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>

              <label style={styles.label}>
                Passengers
                <input
                  type="number"
                  min="1"
                  style={styles.input}
                  value={passengers}
                  onChange={(e) => setPassengers(parseInt(e.target.value || "1", 10))}
                />
              </label>
            </div>

            <div style={styles.row}>
              <label style={styles.label}>
                Airline
                <select
                  style={styles.select}
                  value={airline}
                  onChange={(e) => setAirline(e.target.value)}
                >
                  {airlineOptions.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </label>

              <label style={styles.label}>
                Sort by
                <select
                  style={styles.select}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="priceAsc">Price (low → high)</option>
                  <option value="priceDesc">Price (high → low)</option>
                  <option value="durationAsc">Duration (shortest)</option>
                  <option value="departAsc">Departure time (earliest)</option>
                  <option value="ratingDesc">Rating (best)</option>
                </select>
              </label>
            </div>

            <div style={styles.row}>
              <label style={styles.label}>
                Nonstop only
                <input
                  type="checkbox"
                  style={{ width: 18, height: 18 }}
                  checked={nonstopOnly}
                  onChange={(e) => setNonstopOnly(e.target.checked)}
                />
              </label>

              <div />
            </div>

            <button style={styles.button} type="button" onClick={handleClearSearch}>Clear Search</button>
          </form>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ color: "#666", }}>{results.length} flights found</div>
          </div>

          <div style={styles.resultsGrid}>
            {results.map(f => (
              <article key={f.id} style={styles.resultCard}>
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr auto", alignItems: "center", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{f.airline} <span style={styles.badge}>{f.flightNo}</span></div>
                    <div style={{ fontSize: 12, color: "#666" }}>{airportName(f.from)} → {airportName(f.to)}</div>
                  </div>
                  <div>
                    <div style={styles.time}>{f.depart}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>{cityFromCode(f.from)}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: "#666" }}>{formatDuration(f.durationMin)}</div>
                    <div style={{ fontSize: 12 }}>{f.stops === 0 ? "Nonstop" : `${f.stops} stop`}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={styles.time}>{f.arrive}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>{cityFromCode(f.to)}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={styles.price}>{f.price != null ? `$${Number(f.price).toFixed(2)}` : '—'}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>★ {f.rating != null ? Number(f.rating).toFixed(1) : '—'}</div>
                  </div>
                </div>

                <div style={{ marginTop: 8, display: "flex", gap: 12, alignItems: "center" }}>
                  {f.amenities?.wifi && <span style={styles.amenity}>WiFi</span>}
                  {f.amenities?.meals && <span style={styles.amenity}>Meals</span>}
                  {f.amenities?.entertainment && <span style={styles.amenity}>Entertainment</span>}
                  <button 
                    style={styles.selectBtn}
                    onClick={() => navigate(`/flight/${f._id}`, { state: { flight: f } })}
                  >
                    Select Flight
                  </button>

                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <footer style={styles.footer}>
        <div style={styles.container}>
          <small>Customer Support: +1 (518) 555-0123</small>
        </div>
      </footer>
    </div>
  );
}

// ---- Helper functions ----
function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
function formatDuration(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
}
function cityFromCode(code) {
  const map = { JFK: "New York (JFK)", LGA: "New York (LGA)", EWR: "Newark (EWR)", LHR: "London (LHR)", SFO: "San Francisco (SFO)", MIA: "Miami (MIA)", LAX: "Los Angeles (LAX)", ALB: "Albany (ALB)", DFW: "Dallas (DFW)", DEN: "Denver (DEN)", CDG: "Paris (CDG)", MCO: "Orlando (MCO)" };
  return map[code] || code;
}
function airportName(code) { return code; }

// ---- Styles ----
const styles = {
  page: { fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", color: "#111", width: "100vw", overflow: "hidden" },
  container: { maxWidth: 1000, margin: "0 auto", padding: "0 18px", width: "100%", boxSizing: "border-box" },
  header: {
  background: "#faf9f9ff",
  border: "1px solid #e9eef5",
  borderRadius: "20px",          // 💡 curves all corners (top + bottom)
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",  // adds soft depth
  margin: "12px auto",           // centers and adds breathing room
  maxWidth: 1000,                  // optional: gives space from window edges
  padding: "4px 0",              // keeps internal layout nice
  width: "100%",                 // full width to avoid shrinking
  boxSizing: "border-box",       // include padding/border in width
  },
  headerFlex: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 10px" },
  brand: { fontWeight: 800, fontSize: 28, padding: "16px 0" },
  nav: { display: "flex", gap: 18 },
  link: { textDecoration: "none", color: "#333", padding: "14px 0" },
  authButtons: { display: "flex", gap: "10px", alignItems: "center" },
  loginBtn: { border: "1px solid #2f6feb", color: "#2f6feb", background: "white", padding: "8px 16px", borderRadius: "8px", textDecoration: "none", fontWeight: 600 },
  signupBtn: { border: "1px solid #2f6feb", background: "#2f6feb", color: "white", padding: "8px 16px", borderRadius: "8px", textDecoration: "none", fontWeight: 600 },

  //color of background
  hero: {
  background: "#f6f7fbce",
  padding: "28px 0 40px",
  borderRadius: "20px",                     // 💡 curved edges all around
  maxWidth: 1000,                             // match header width
  margin: "20px auto",                      // center it with spacing
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)", // subtle depth shadow
  width: "100%",                             // full width to avoid shrinking
  boxSizing: "border-box",                   // include padding/border in width
  overflow: "hidden",                         // lock width, prevent expansion
    },
  heroInner: { display: "grid", gap: 16, width: "100%", boxSizing: "border-box" },
  title: { margin: 0, fontSize: 24 },

  //color of filtering section
  card: { background: "#ffffffff", border: "1px solid #e6e6e6", borderRadius: 12, padding: 16, display: "grid", gap: 12, boxShadow: "0 1px 2px rgba(0,0,0,.04)", width: "100%", boxSizing: "border-box", overflow: "hidden" },
  row: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 12, overflow: "hidden" },
  label: { display: "grid", gap: 6, fontSize: 12, color: "#444", minWidth: 0, overflow: "hidden" },
  input: { height: 38, padding: "0 10px", borderRadius: 8, border: "1px solid #cfd7df", fontSize: 14, background: "#fff", width: "100%", boxSizing: "border-box", minWidth: 0 },
  select: { height: 38, padding: "0 10px", borderRadius: 8, border: "1px solid #cfd7df", fontSize: 14, background: "#fff", width: "100%", boxSizing: "border-box", minWidth: 0 },
  button: { height: 40, border: "1px solid #2f6feb", background: "#2f6feb", color: "white", borderRadius: 8, fontWeight: 600, cursor: "pointer", width: "100%", boxSizing: "border-box" },

  //color of the flight data card
  resultCard: { background: "#ffffffff", border: "1px solid #e7ebf0", borderRadius: 12, padding: 16, boxShadow: "0 1px 2px rgba(0,0,0,.04)", overflow: "hidden" },
  time: { fontSize: 16, fontWeight: 700 },
  price: { fontSize: 18, fontWeight: 800 },
  badge: { fontSize: 12, background: "#eef3ff", color: "#2f6feb", padding: "2px 6px", borderRadius: 6, marginLeft: 6 },
  amenity: { fontSize: 12, color: "#4b5563", background: "#f3f4f6", padding: "4px 8px", borderRadius: 6 },
  selectBtn: { marginLeft: "auto", border: "1px solid #2f6feb", background: "#2f6feb", color: "#fff", borderRadius: 8, height: 34, padding: "0 12px", cursor: "pointer" },
  resultsGrid: { display: "grid", gap: 12, overflow: "hidden", width: "100%", boxSizing: "border-box" },
  footer: { borderTop: "1px solid #eee", padding: "16px 0", color: "#666", background: "#fff", display: "none" },
};
