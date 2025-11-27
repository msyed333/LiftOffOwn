const mongoose = require('mongoose');
const User = require('../UserSchema');
const Booking = require('../BookingSchema');

// Use same mongoString as server.js
const mongoString = "mongodb+srv://malkasyed10:malkasyed@liftoffdata.6nmvpwo.mongodb.net/liftoff";

async function main() {
  await mongoose.connect(mongoString, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB for reconcile');

  const users = await User.find();
  console.log(`Found ${users.length} users`);

  let updatedCount = 0;

  for (const user of users) {
    try {
      // compute earned from bookings
      const bookings = await Booking.find({ userId: user._id });
      let earnedEntries = [];
      let earnedTotal = 0;

      for (const b of bookings) {
        const paid = parseFloat(b.price) || 0;
        const earned = Math.round(paid * 10);
        earnedTotal += earned;
        earnedEntries.push({
          change: `+${earned}`,
          points: earned,
          value: earned / 100,
          note: 'Earned from flight',
          flight: `${b.from} → ${b.to}`,
          date: b.date || new Date()
        });
      }

      // keep negative history (deductions) from user.pointsHistory if present
      const existingHistory = (user.pointsHistory || []).filter(h => (h.points || 0) < 0).map(h => ({
        change: h.change,
        points: h.points,
        value: h.value,
        note: h.note,
        flight: h.flight,
        date: h.date || new Date()
      }));

      const newHistory = [...earnedEntries, ...existingHistory];
      const newTotal = earnedTotal + existingHistory.reduce((sum, h) => sum + (h.points || 0), 0);

      // only update if different
      if ((user.totalPoints || 0) !== newTotal || JSON.stringify(user.pointsHistory || []) !== JSON.stringify(newHistory)) {
        await User.findByIdAndUpdate(user._id, { totalPoints: newTotal, pointsHistory: newHistory });
        console.log(`Updated user ${user._id}: totalPoints ${user.totalPoints} -> ${newTotal}`);
        updatedCount++;
      }

    } catch (err) {
      console.error('Failed reconciling user', user._id, err);
    }
  }

  console.log(`Reconcile complete. Updated ${updatedCount} users.`);
  mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
