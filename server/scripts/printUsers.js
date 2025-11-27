const mongoose = require('mongoose');
const User = require('../UserSchema');

const mongoString = "mongodb+srv://malkasyed10:malkasyed@liftoffdata.6nmvpwo.mongodb.net/liftoff";

async function main() {
  await mongoose.connect(mongoString);
  console.log('Connected to MongoDB');

  const users = await User.find().select('-password').lean();
  console.log(`Found ${users.length} users`);

  users.forEach(u => {
    console.log('---');
    console.log(`_id: ${u._id}`);
    console.log(`username: ${u.username}`);
    console.log(`totalPoints: ${u.totalPoints || 0}`);
    console.log(`pointsHistory entries: ${ (u.pointsHistory || []).length }`);
    // print last 5 history items
    const last = (u.pointsHistory || []).slice(-5).map(h => ({ change: h.change, points: h.points, value: h.value, note: h.note, flight: h.flight, date: h.date }));
    console.log('recentHistory:', JSON.stringify(last, null, 2));
  });

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
