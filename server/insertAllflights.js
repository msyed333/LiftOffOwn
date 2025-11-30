//mongoose.connect("mongodb+srv://malkasyed10:malkasyed@liftoffdata.6nmvpwo.mongodb.net/liftoff");
const mongoose = require("mongoose");
const Flight = require("./FlightSchema");
// flightsData.js is an ES module (export default). Load it dynamically below using import()

const mongoString = "mongodb+srv://malkasyed10:malkasyed@liftoffdata.6nmvpwo.mongodb.net/liftoff";

(async function insertAllFlights() {
  try {
    await mongoose.connect(mongoString);
    console.log("✅ Connected to MongoDB");

    // Load flights data. The source file is an ES module (export default). Try multiple strategies:
    // 1) CommonJS require (works if flightsData was converted),
    // 2) dynamic import (works if package.json marks modules),
    // 3) fallback: write a temporary CommonJS copy and require it.
    const fs = require('fs');
    const path = require('path');
  const { pathToFileURL } = require('url');
    let flightsData;

    // Try require() first (fast path)
    try {
      flightsData = require('./flightsData');
      // If the module used `export default`, require will return the namespace object; handle both shapes
      if (flightsData && flightsData.default) flightsData = flightsData.default;
      console.log('Loaded flightsData via require(), items:', Array.isArray(flightsData) ? flightsData.length : typeof flightsData);
    } catch (requireErr) {
      console.warn('require(./flightsData) failed, trying dynamic import — reason:', requireErr && requireErr.message);
      // Try dynamic import()
      try {
        const mod = await import(pathToFileURL(path.join(__dirname, 'flightsData.js')).href);
        flightsData = mod && mod.default ? mod.default : mod;
        console.log('Loaded flightsData via dynamic import(), items:', Array.isArray(flightsData) ? flightsData.length : typeof flightsData);
      } catch (impErr) {
        console.warn('dynamic import failed — attempting fallback convert+require, reason:', impErr && impErr.message);
        // Fallback: create a temporary CommonJS copy by replacing `export default` with `module.exports =`
        try {
          const srcPath = path.join(__dirname, 'flightsData.js');
          const src = fs.readFileSync(srcPath, 'utf8');
          const transformed = src.replace(/export\s+default\s+/m, 'module.exports = ');
          const tmpPath = path.join(__dirname, '__flightsData_tmp.cjs');
          fs.writeFileSync(tmpPath, transformed, 'utf8');
          try {
            flightsData = require(tmpPath);
            if (flightsData && flightsData.default) flightsData = flightsData.default;
            console.log('Loaded flightsData via temporary CommonJS copy, items:', Array.isArray(flightsData) ? flightsData.length : typeof flightsData);
          } finally {
            try { fs.unlinkSync(tmpPath); } catch (e) { /* ignore */ }
          }
        } catch (finalErr) {
          console.error('Failed to load flightsData.js (all methods):', finalErr);
          process.exit(1);
        }
      }
    }

    if (!Array.isArray(flightsData)) {
      console.error('flightsData is not an array; aborting. Type:', typeof flightsData);
      process.exit(1);
    }

    let insertedCount = 0;
    let skippedCount = 0;

    for (let flight of flightsData) {

      const uniqueKey = `${flight.flightNo}_${flight.date}`;

      const exists = await Flight.findOne({ uniqueKey });

      if (exists) {
        console.log("Skipping duplicate flight:", uniqueKey);
        skippedCount++;
        continue;
      }

      const newFlight = new Flight({
        ...flight,
        uniqueKey
      });

      await newFlight.save();
      insertedCount++;
    }

    console.log("✅ Inserted flights:", insertedCount);
    console.log("⚠ Skipped duplicates:", skippedCount);

    process.exit();

  } catch (err) {
    console.error("❌ Error inserting flights:", err);
    process.exit(1);
  }
})();
