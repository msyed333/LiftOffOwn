//mongoose.connect("mongodb+srv://malkasyed10:malkasyed@liftoffdata.6nmvpwo.mongodb.net/liftoff");
const mongoose = require("mongoose");
const Flight = require("./FlightSchema");
const flightsData = require("./flightsData");

const mongoString = "mongodb+srv://malkasyed10:malkasyed@liftoffdata.6nmvpwo.mongodb.net/liftoff";

(async function insertAllFlights() {
  try {
    await mongoose.connect(mongoString);
    console.log("✅ Connected to MongoDB");

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
