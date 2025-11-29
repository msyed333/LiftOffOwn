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

  const [errors, setErrors] = useState({});

  // State for stop details (airline name and code for each stop)
  const [stopDetails, setStopDetails] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFlight({ ...flight, [name]: value });
    // Clear error for this field when user starts editing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // 1. Check all required fields are not empty
    Object.keys(flight).forEach((key) => {
      if (!flight[key] || flight[key].toString().trim() === "") {
        newErrors[key] = "Required";
      }
    });

    // 2. Airport codes: exactly 3 uppercase letters (JFK, LAX, etc)
    if (flight.from && !/^[A-Z]{3}$/.test(flight.from.toUpperCase())) {
      newErrors.from = "3 letter code (JFK)";
    }
    if (flight.to && !/^[A-Z]{3}$/.test(flight.to.toUpperCase())) {
      newErrors.to = "3 letter code (LAX)";
    }

    // 3. Text fields: letters, spaces, hyphens, apostrophes only
    const textFields = {
      airline: "Airline",
      fromFull: "Airport name",
      toFull: "Airport name",
    };
    Object.entries(textFields).forEach(([key, label]) => {
      if (flight[key] && !/^[a-zA-Z\s'-]+$/.test(flight[key])) {
        newErrors[key] = `${label}: letters & spaces only`;
      }
    });

    // 4. Yes/No fields
    const yesNoFields = {
      hasUSBOutlets: "USB Outlets",
      hasPowerOutlets: "Power Outlets",
      hasLiveTV: "Live TV",
      personalItemAllowed: "Personal item",
    };
    Object.entries(yesNoFields).forEach(([key, label]) => {
      if (flight[key]) {
        const val = flight[key].toLowerCase().trim();
        if (val !== "yes" && val !== "no") {
          newErrors[key] = `${label}: yes or no only`;
        }
      }
    });

    // 5. Time format: HH:MM AM/PM
    const timeFields = ["depart", "arrive", "departureTimeLocal", "arrivalTimeLocal"];
    timeFields.forEach((field) => {
      if (flight[field] && !/^\d{1,2}:\d{2}\s?(AM|PM|am|pm)$/.test(flight[field])) {
        newErrors[field] = "Format: HH:MM AM";
      }
    });

    // 6. Numeric fields
    const numericFields = {
      flightNo: "Flight number",
      durationMin: "Duration",
      stops: "Stops",
      price: "Price",
      rating: "Rating",
      carryOnBagsAllowed: "Bags",
      carryOnWeightLimitKg: "Weight",
      checkedBagsAllowed: "Bags",
      checkedBagWeightLimitKg: "Weight",
      extraBagFeeUSD: "Fee",
      aircraftAgeYears: "Age",
      aircraftCapacity: "Capacity",
      seatLayout: "Seat layout",
      seatPitch: "Pitch",
      seatWidth: "Width",
      terminalFrom: "Terminal",
      gateFrom: "Gate",
      terminalTo: "Terminal",
      gateTo: "Gate",
      averageDelayMin: "Delay",
      onTimePercentage: "Percentage",
      cancellationRate: "Rate",
      weatherDelayRiskScore: "Score",
      safetyScore: "Score",
    };

    Object.entries(numericFields).forEach(([key, label]) => {
      if (flight[key] && isNaN(parseFloat(flight[key]))) {
        newErrors[key] = `${label}: numbers only`;
      }
    });

    // 7. Range validations
    if (flight.stops && (parseFloat(flight.stops) < 0 || parseFloat(flight.stops) > 5)) {
      newErrors.stops = "0–5 only";
    }
    if (flight.rating && (parseFloat(flight.rating) < 1 || parseFloat(flight.rating) > 5)) {
      newErrors.rating = "1–5 only";
    }
    if (flight.onTimePercentage && (parseFloat(flight.onTimePercentage) < 0 || parseFloat(flight.onTimePercentage) > 100)) {
      newErrors.onTimePercentage = "0–100 only";
    }
    if (flight.cancellationRate && (parseFloat(flight.cancellationRate) < 0 || parseFloat(flight.cancellationRate) > 100)) {
      newErrors.cancellationRate = "0–100 only";
    }
    if (flight.weatherDelayRiskScore && (parseFloat(flight.weatherDelayRiskScore) < 1 || parseFloat(flight.weatherDelayRiskScore) > 5)) {
      newErrors.weatherDelayRiskScore = "1–5 only";
    }
    if (flight.safetyScore && (parseFloat(flight.safetyScore) < 1 || parseFloat(flight.safetyScore) > 5)) {
      newErrors.safetyScore = "1–5 only";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log("Submitting Flight:", flight);
      alert("Flight Added Successfully!");
    }
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
                  style={{...styles.input, borderColor: errors.airline ? "#e25454" : "#ccc"}}
                />
                {errors.airline && <span style={styles.errorText}>{errors.airline}</span>}

                <label style={styles.label}>Flight Number</label>
                <input 
                  name="flightNo"
                  placeholder="DL245"
                  value={flight.flightNo}
                  onChange={handleChange}
                  style={{...styles.input, borderColor: errors.flightNo ? "#e25454" : "#ccc"}}
                />
                {errors.flightNo && <span style={styles.errorText}>{errors.flightNo}</span>}

                <label style={styles.label}>Rating ★</label>
                <input 
                  name="rating"
                  placeholder="4.6"
                  value={flight.rating}
                  onChange={handleChange}
                  style={{...styles.input, borderColor: errors.rating ? "#e25454" : "#ccc"}}
                />
                {errors.rating && <span style={styles.errorText}>{errors.rating}</span>}
              </div>

              {/* From / Depart */}
              <div>
                <label style={styles.label}>From (Airport Code)</label>
                <input 
                  name="from"
                  placeholder="JFK"
                  value={flight.from}
                  onChange={handleChange}
                  style={{...styles.input, borderColor: errors.from ? "#e25454" : "#ccc"}}
                />
                {errors.from && <span style={styles.errorText}>{errors.from}</span>}

                <label style={styles.label}>Departure Time</label>
                <input 
                  name="depart"
                  placeholder="08:30 AM"
                  value={flight.depart}
                  onChange={handleChange}
                  style={{...styles.input, borderColor: errors.depart ? "#e25454" : "#ccc"}}
                />
                {errors.depart && <span style={styles.errorText}>{errors.depart}</span>}
              </div>

              {/* Duration / Stops */}
              <div>
                <label style={styles.label}>Duration (min)</label>
                <input 
                  name="durationMin"
                  placeholder="180"
                  value={flight.durationMin}
                  onChange={handleChange}
                  style={{...styles.input, borderColor: errors.durationMin ? "#e25454" : "#ccc"}}
                />
                {errors.durationMin && <span style={styles.errorText}>{errors.durationMin}</span>}

                <label style={styles.label}>Stops</label>
                <select 
                  name="stops"
                  value={flight.stops}
                  onChange={handleChange}
                  style={{...styles.select, borderColor: errors.stops ? "#e25454" : "#ccc"}}
                >
                  <option value="">-- Select --</option>
                  <option value="0">0 Stops</option>
                  <option value="1">1 Stop</option>
                  <option value="2">2 Stops</option>
                  <option value="3">3 Stops</option>
                  <option value="4">4 Stops</option>
                  <option value="5">5 Stops</option>
                </select>
                {errors.stops && <span style={styles.errorText}>{errors.stops}</span>}
              </div>

              {/* To / Arrive */}
              <div>
                <label style={styles.label}>To (Airport Code)</label>
                <input 
                  name="to"
                  placeholder="LAX"
                  value={flight.to}
                  onChange={handleChange}
                  style={{...styles.input, borderColor: errors.to ? "#e25454" : "#ccc"}}
                />
                {errors.to && <span style={styles.errorText}>{errors.to}</span>}

                <label style={styles.label}>Arrival Time</label>
                <input 
                  name="arrive"
                  placeholder="11:15 AM"
                  value={flight.arrive}
                  onChange={handleChange}
                  style={{...styles.input, borderColor: errors.arrive ? "#e25454" : "#ccc"}}
                />
                {errors.arrive && <span style={styles.errorText}>{errors.arrive}</span>}
              </div>

              {/* Price */}
              <div>
                <label style={styles.label}>Price ($)</label>
                <input 
                  name="price"
                  placeholder="299"
                  value={flight.price}
                  onChange={handleChange}
                  style={{...styles.input, borderColor: errors.price ? "#e25454" : "#ccc"}}
                />
                {errors.price && <span style={styles.errorText}>{errors.price}</span>}
              </div>

            </div>
          </div>

          {/* -------------------------------- */}
          {/* STOP DETAILS */}
          {/* -------------------------------- */}
          {flight.stops && flight.stops > 0 && (
            <div style={styles.sectionCard}>
              <h3>Stop Information</h3>
              {[...Array(parseInt(flight.stops))].map((_, index) => {
                const stopKey = `stop_${index + 1}`;
                return (
                  <div key={index} style={styles.stopDetailsSection}>
                    <h4 style={styles.subheading}>Stop {index + 1}</h4>
                    <div style={styles.twoColumn}>
                      <div>
                        <label style={styles.label}>Airline Name</label>
                        <input 
                          placeholder="Delta Airlines"
                          value={stopDetails[`${stopKey}_airline`] || ""}
                          onChange={(e) => {
                            setStopDetails({
                              ...stopDetails,
                              [`${stopKey}_airline`]: e.target.value
                            });
                          }}
                          style={{...styles.input, borderColor: "#ccc"}}
                        />

                        <label style={styles.label}>Airline Code</label>
                        <input 
                          placeholder="DL"
                          value={stopDetails[`${stopKey}_code`] || ""}
                          onChange={(e) => {
                            setStopDetails({
                              ...stopDetails,
                              [`${stopKey}_code`]: e.target.value
                            });
                          }}
                          style={{...styles.input, borderColor: "#ccc"}}
                          maxLength="2"
                        />

                        <label style={styles.label}>Layover Duration (min)</label>
                        <input 
                          placeholder="45"
                          value={stopDetails[`${stopKey}_layover`] || ""}
                          onChange={(e) => {
                            setStopDetails({
                              ...stopDetails,
                              [`${stopKey}_layover`]: e.target.value
                            });
                          }}
                          style={{...styles.input, borderColor: "#ccc"}}
                        />
                      </div>

                      <div>
                        <label style={styles.label}>Destination Airport Code</label>
                        <input 
                          placeholder="ORD"
                          value={stopDetails[`${stopKey}_airportCode`] || ""}
                          onChange={(e) => {
                            setStopDetails({
                              ...stopDetails,
                              [`${stopKey}_airportCode`]: e.target.value
                            });
                          }}
                          style={{...styles.input, borderColor: "#ccc"}}
                          maxLength="3"
                        />

                        <label style={styles.label}>Airport Full Name</label>
                        <input 
                          placeholder="Chicago O'Hare International Airport"
                          value={stopDetails[`${stopKey}_airportName`] || ""}
                          onChange={(e) => {
                            setStopDetails({
                              ...stopDetails,
                              [`${stopKey}_airportName`]: e.target.value
                            });
                          }}
                          style={{...styles.input, borderColor: "#ccc"}}
                        />

                        <label style={styles.label}>Airport Address</label>
                        <input 
                          placeholder="10000 West O'Hare, Chicago, IL"
                          value={stopDetails[`${stopKey}_airportAddress`] || ""}
                          onChange={(e) => {
                            setStopDetails({
                              ...stopDetails,
                              [`${stopKey}_airportAddress`]: e.target.value
                            });
                          }}
                          style={{...styles.input, borderColor: "#ccc"}}
                        />
                      </div>
                    </div>
                    {index < parseInt(flight.stops) - 1 && <div style={styles.separator}></div>}
                  </div>
                );
              })}
            </div>
          )}

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
                  style={{...styles.input, borderColor: errors.fromFull ? "#e25454" : "#ccc"}}
                />
                {errors.fromFull && <span style={styles.errorText}>{errors.fromFull}</span>}

                <label style={styles.label}>Address</label>
                <input 
                  name="fromFullAddress"
                  placeholder="123 Airport Rd, New York, NY"
                  value={flight.fromFullAddress}
                  onChange={handleChange}
                  style={{...styles.input, borderColor: errors.fromFullAddress ? "#e25454" : "#ccc"}}
                />
                {errors.fromFullAddress && <span style={styles.errorText}>{errors.fromFullAddress}</span>}

                <label style={styles.label}>Terminal</label>
                <input 
                  name="terminalFrom"
                  placeholder="4"
                  value={flight.terminalFrom}
                  onChange={handleChange}
                  style={{...styles.input, borderColor: errors.terminalFrom ? "#e25454" : "#ccc"}}
                />
                {errors.terminalFrom && <span style={styles.errorText}>{errors.terminalFrom}</span>}

                <label style={styles.label}>Gate</label>
                <input 
                  name="gateFrom"
                  placeholder="B22"
                  value={flight.gateFrom}
                  onChange={handleChange}
                  style={{...styles.input, borderColor: errors.gateFrom ? "#e25454" : "#ccc"}}
                />
                {errors.gateFrom && <span style={styles.errorText}>{errors.gateFrom}</span>}
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
                  style={{...styles.input, borderColor: errors.toFull ? "#e25454" : "#ccc"}}
                />
                {errors.toFull && <span style={styles.errorText}>{errors.toFull}</span>}

                <label style={styles.label}>Address</label>
                <input 
                  name="toFullAddress"
                  placeholder="1 World Way, Los Angeles, CA"
                  value={flight.toFullAddress}
                  onChange={handleChange}
                  style={{...styles.input, borderColor: errors.toFullAddress ? "#e25454" : "#ccc"}}
                />
                {errors.toFullAddress && <span style={styles.errorText}>{errors.toFullAddress}</span>}

                <label style={styles.label}>Terminal</label>
                <input 
                  name="terminalTo"
                  placeholder="5"
                  value={flight.terminalTo}
                  onChange={handleChange}
                  style={{...styles.input, borderColor: errors.terminalTo ? "#e25454" : "#ccc"}}
                />
                {errors.terminalTo && <span style={styles.errorText}>{errors.terminalTo}</span>}

                <label style={styles.label}>Gate</label>
                <input 
                  name="gateTo"
                  placeholder="C19"
                  value={flight.gateTo}
                  onChange={handleChange}
                  style={{...styles.input, borderColor: errors.gateTo ? "#e25454" : "#ccc"}}
                />
                {errors.gateTo && <span style={styles.errorText}>{errors.gateTo}</span>}

                <label style={styles.label}>Baggage Claim</label>
                <input 
                  name="baggageClaim"
                  placeholder="Carousel 7"
                  value={flight.baggageClaim}
                  onChange={handleChange}
                  style={{...styles.input, borderColor: errors.baggageClaim ? "#e25454" : "#ccc"}}
                />
                {errors.baggageClaim && <span style={styles.errorText}>{errors.baggageClaim}</span>}
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
                  style={{...styles.input, borderColor: errors.departureTimeLocal ? "#e25454" : "#ccc"}}
                />
                {errors.departureTimeLocal && <span style={styles.errorText}>{errors.departureTimeLocal}</span>}
              </div>

              <div>
                <label style={styles.label}>Arrival Time (Local)</label>
                <input 
                  name="arrivalTimeLocal"
                  placeholder="11:15 AM PST"
                  value={flight.arrivalTimeLocal}
                  onChange={handleChange}
                  style={{...styles.input, borderColor: errors.arrivalTimeLocal ? "#e25454" : "#ccc"}}
                />
                {errors.arrivalTimeLocal && <span style={styles.errorText}>{errors.arrivalTimeLocal}</span>}
              </div>
            </div>

            <label style={styles.label}>Time Zone Change</label>
            <input 
              name="timezoneChange"
              placeholder="-3 hours"
              value={flight.timezoneChange}
              onChange={handleChange}
              style={{...styles.input, borderColor: errors.timezoneChange ? "#e25454" : "#ccc"}}
            />
            {errors.timezoneChange && <span style={styles.errorText}>{errors.timezoneChange}</span>}
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
                  style={{...styles.input, borderColor: errors.carryOnBagsAllowed ? "#e25454" : "#ccc"}}
                />
                {errors.carryOnBagsAllowed && <span style={styles.errorText}>{errors.carryOnBagsAllowed}</span>}

                <label style={styles.label}>Carry-On Weight (kg)</label>
                <input 
                  name="carryOnWeightLimitKg"
                  placeholder="10"
                  value={flight.carryOnWeightLimitKg}
                  onChange={handleChange}
                  style={{...styles.input, borderColor: errors.carryOnWeightLimitKg ? "#e25454" : "#ccc"}}
                />
                {errors.carryOnWeightLimitKg && <span style={styles.errorText}>{errors.carryOnWeightLimitKg}</span>}

                <label style={styles.label}>Personal Item Allowed?</label>
                <select 
                  name="personalItemAllowed"
                  value={flight.personalItemAllowed}
                  onChange={handleChange}
                  style={{...styles.select, borderColor: errors.personalItemAllowed ? "#e25454" : "#ccc"}}
                >
                  <option value="">-- Select --</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
                {errors.personalItemAllowed && <span style={styles.errorText}>{errors.personalItemAllowed}</span>}
              </div>

              <div>
                <label style={styles.label}>Checked Bags Allowed</label>
                <input 
                  name="checkedBagsAllowed"
                  placeholder="2"
                  value={flight.checkedBagsAllowed}
                  onChange={handleChange}
                  style={{...styles.input, borderColor: errors.checkedBagsAllowed ? "#e25454" : "#ccc"}}
                />
                {errors.checkedBagsAllowed && <span style={styles.errorText}>{errors.checkedBagsAllowed}</span>}

                <label style={styles.label}>Checked Bag Weight (kg)</label>
                <input 
                  name="checkedBagWeightLimitKg"
                  placeholder="23"
                  value={flight.checkedBagWeightLimitKg}
                  onChange={handleChange}
                  style={{...styles.input, borderColor: errors.checkedBagWeightLimitKg ? "#e25454" : "#ccc"}}
                />
                {errors.checkedBagWeightLimitKg && <span style={styles.errorText}>{errors.checkedBagWeightLimitKg}</span>}

                <label style={styles.label}>Extra Bag Fee ($)</label>
                <input 
                  name="extraBagFeeUSD"
                  placeholder="75"
                  value={flight.extraBagFeeUSD}
                  onChange={handleChange}
                  style={{...styles.input, borderColor: errors.extraBagFeeUSD ? "#e25454" : "#ccc"}}
                />
                {errors.extraBagFeeUSD && <span style={styles.errorText}>{errors.extraBagFeeUSD}</span>}
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
                  style={{...styles.input, borderColor: errors.aircraftModel ? "#e25454" : "#ccc"}}
                />
                {errors.aircraftModel && <span style={styles.errorText}>{errors.aircraftModel}</span>}

                <label style={styles.label}>Registration</label>
                <input 
                  name="aircraftCode"
                  placeholder="N123AB"
                  value={flight.aircraftCode}
                  onChange={handleChange}
                  style={{...styles.input, borderColor: errors.aircraftCode ? "#e25454" : "#ccc"}}
                />
                {errors.aircraftCode && <span style={styles.errorText}>{errors.aircraftCode}</span>}

                <label style={styles.label}>Age (years)</label>
                <input 
                  name="aircraftAgeYears"
                  placeholder="6"
                  value={flight.aircraftAgeYears}
                  onChange={handleChange}
                  style={{...styles.input, borderColor: errors.aircraftAgeYears ? "#e25454" : "#ccc"}}
                />
                {errors.aircraftAgeYears && <span style={styles.errorText}>{errors.aircraftAgeYears}</span>}

                <label style={styles.label}>Capacity</label>
                <input 
                  name="aircraftCapacity"
                  placeholder="180"
                  value={flight.aircraftCapacity}
                  onChange={handleChange}
                  style={{...styles.input, borderColor: errors.aircraftCapacity ? "#e25454" : "#ccc"}}
                />
                {errors.aircraftCapacity && <span style={styles.errorText}>{errors.aircraftCapacity}</span>}
              </div>

              <div>
                <label style={styles.label}>Seat Layout</label>
                <input 
                  name="seatLayout"
                  placeholder="3-3"
                  value={flight.seatLayout}
                  onChange={handleChange}
                  style={{...styles.input, borderColor: errors.seatLayout ? "#e25454" : "#ccc"}}
                />
                {errors.seatLayout && <span style={styles.errorText}>{errors.seatLayout}</span>}

                <label style={styles.label}>Seat Pitch (inches)</label>
                <input 
                  name="seatPitch"
                  placeholder="31"
                  value={flight.seatPitch}
                  onChange={handleChange}
                  style={{...styles.input, borderColor: errors.seatPitch ? "#e25454" : "#ccc"}}
                />
                {errors.seatPitch && <span style={styles.errorText}>{errors.seatPitch}</span>}

                <label style={styles.label}>Seat Width (inches)</label>
                <input 
                  name="seatWidth"
                  placeholder="17"
                  value={flight.seatWidth}
                  onChange={handleChange}
                  style={{...styles.input, borderColor: errors.seatWidth ? "#e25454" : "#ccc"}}
                />
                {errors.seatWidth && <span style={styles.errorText}>{errors.seatWidth}</span>}
              </div>
            </div>

            <hr style={styles.separator} />

            <div style={styles.twoColumn}>
              <div>
                <label style={styles.label}>USB Outlets?</label>
                <select 
                  name="hasUSBOutlets"
                  value={flight.hasUSBOutlets}
                  onChange={handleChange}
                  style={{...styles.select, borderColor: errors.hasUSBOutlets ? "#e25454" : "#ccc"}}
                >
                  <option value="">-- Select --</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
                {errors.hasUSBOutlets && <span style={styles.errorText}>{errors.hasUSBOutlets}</span>}
              </div>

              <div>
                <label style={styles.label}>Power Outlets?</label>
                <select 
                  name="hasPowerOutlets"
                  value={flight.hasPowerOutlets}
                  onChange={handleChange}
                  style={{...styles.select, borderColor: errors.hasPowerOutlets ? "#e25454" : "#ccc"}}
                >
                  <option value="">-- Select --</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
                {errors.hasPowerOutlets && <span style={styles.errorText}>{errors.hasPowerOutlets}</span>}
              </div>

              <div>
                <label style={styles.label}>Live TV?</label>
                <select 
                  name="hasLiveTV"
                  value={flight.hasLiveTV}
                  onChange={handleChange}
                  style={{...styles.select, borderColor: errors.hasLiveTV ? "#e25454" : "#ccc"}}
                >
                  <option value="">-- Select --</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
                {errors.hasLiveTV && <span style={styles.errorText}>{errors.hasLiveTV}</span>}
              </div>
            </div>
          </div>

          {/* -------------------------------- */}
          {/* PERFORMANCE */}
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
                  style={{...styles.input, borderColor: errors.onTimePercentage ? "#e25454" : "#ccc"}}
                />
                {errors.onTimePercentage && <span style={styles.errorText}>{errors.onTimePercentage}</span>}
              </div>

              <div>
                <label style={styles.label}>Average Delay (min)</label>
                <input 
                  name="averageDelayMin"
                  placeholder="12"
                  value={flight.averageDelayMin}
                  onChange={handleChange}
                  style={{...styles.input, borderColor: errors.averageDelayMin ? "#e25454" : "#ccc"}}
                />
                {errors.averageDelayMin && <span style={styles.errorText}>{errors.averageDelayMin}</span>}
              </div>

              <div>
                <label style={styles.label}>Cancellation Rate (%)</label>
                <input 
                  name="cancellationRate"
                  placeholder="1.5"
                  value={flight.cancellationRate}
                  onChange={handleChange}
                  style={{...styles.input, borderColor: errors.cancellationRate ? "#e25454" : "#ccc"}}
                />
                {errors.cancellationRate && <span style={styles.errorText}>{errors.cancellationRate}</span>}
              </div>

              <div>
                <label style={styles.label}>Weather Delay Risk (1–5)</label>
                <input 
                  name="weatherDelayRiskScore"
                  placeholder="2"
                  value={flight.weatherDelayRiskScore}
                  onChange={handleChange}
                  style={{...styles.input, borderColor: errors.weatherDelayRiskScore ? "#e25454" : "#ccc"}}
                />
                {errors.weatherDelayRiskScore && <span style={styles.errorText}>{errors.weatherDelayRiskScore}</span>}
              </div>
            </div>

            <label style={styles.label}>Safety Score (1–5)</label>
            <input 
              name="safetyScore"
              placeholder="5"
              value={flight.safetyScore}
              onChange={handleChange}
              style={{...styles.input, borderColor: errors.safetyScore ? "#e25454" : "#ccc"}}
            />
            {errors.safetyScore && <span style={styles.errorText}>{errors.safetyScore}</span>}
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
  stopCard: {
    background: "#f8fafb",
    border: "1px solid #e7ebf0",
    borderRadius: 8,
    padding: 15,
  },
  stopDetailsSection: {
    background: "#f8fafb",
    border: "1px solid #e7ebf0",
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
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
    marginBottom: "4px",
    fontSize: "14px",
  },
  select: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "4px",
    fontSize: "14px",
    fontFamily: "inherit",
    backgroundColor: "white",
    cursor: "pointer",
  },
  errorText: {
    color: "#e25454",
    fontSize: "11px",
    fontWeight: 600,
    display: "block",
    minHeight: "14px",
    marginBottom: "10px",
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
