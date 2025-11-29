
const express = require('express');
const cors = require('cors');
const app = express();
const User = require('./UserSchema')
const Flight = require("./FlightSchema");
const Booking = require("./BookingSchema");
const PaymentMethod = require("./PaymentMethod");
const Card = require("./CardSchema");
const SupportTicket = require("./SupportTicketSchema");
const SellerApplication = require("./SellerApplicationsSchema");



app.use(express.json());
app.use(cors())
app.listen(9000, ()=> { //listening on port 9000
    console.log('Server Started at ${9000}')
})

const mongoose = require('mongoose');
const mongoString = "mongodb+srv://malkasyed10:malkasyed@liftoffdata.6nmvpwo.mongodb.net/liftoff";
mongoose.connect(mongoString)
const database = mongoose.connection

database.on('error', (error) => console.log(error))

database.once('connected', () => console.log('Databased Connected'))


app.post('/createUser', async (req, res) => { //server side end point
    console.log(`SERVER: CREATE USER REQ BODY: ${req.body.username} ${req.body.firstName} ${req.body.lastName}`)
    const un = req.body.username //request object called req, contains all values in corresponding attirbutes while sending from client side to server side
    try {
        //Check if username already exists in database
        User.exists({username: un}).then(result => { //checks if user present in collection, if exists do nothing
            if(Object.is(result, null)) { //if not present, then create new user with recieved body from client side 
                const user = new User(req.body);
                user.save()
                console.log(`User created! ${user}`)
                res.send(user)
            }
            else { //if user present send message 
                console.log("Username already exists")
                res.status(500).send("Username already exists")
            }
        })
    }
    catch (error){
        res.status(500).send(error)
    }
})


// app.get('/getUser', async (req, res) => {
//     // console.log(`SERVER: GET USER REQ BODY: ${req.query}`)
//     console.log("SERVER: GET USER REQ QUERY:", req.query);
//     const username = req.query.username
//     const password = req.query.password
//     try {
//         const user = await User.findOne({ username, password })
//         res.send(user)
//     }
//     catch (error) {
//         res.status(500).send(error)
//     }
// })

app.get('/getUser', async (req, res) => {
  console.log("SERVER: GET USER REQ QUERY:", req.query);

  const username = req.query.username;
  const password = req.query.password;

  try {
    const user = await User.findOne({ username, password });

    if (!user) {
      // return null (200) so frontend can show "Wrong Credentials" message
      return res.json(null);
    }

    // Return user data including isSeller so frontend can redirect sellers
    res.json({
      _id: user._id,
      name: user.name || (user.firstName ? `${user.firstName} ${user.lastName||''}` : ''),
      username: user.username,
      email: user.username,
      role: user.role,
      isSeller: !!user.isSeller,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      totalPoints: user.totalPoints || 0
    });

  } catch (error) {
    res.status(500).send(error);
  }
});




app.get("/flights", async (req, res) => {
  try {
    const flights = await Flight.find();
    res.json(flights);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch flights" });
  }
});

app.get("/flights/:id", async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    res.json(flight);
  } catch (err) {
    res.status(404).json({ error: "Flight not found" });
  }
});


app.get("/myBookings/:userId", async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});




function generateGuestId() {
  return "GUEST-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

function generateConfirmationCode() {
  return "LIFT-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ✅ Booking endpoint
app.post("/bookFlight", async (req, res) => {
  try {
    const {
      userId,
      name,
      email,
      flightId,
      airline,
      from,
      to,
      depart,
      arrive,
      date,
      passengerCount,
      passengers,
      seatingPreference,
      price,
    } = req.body;

    const bookingData = {
      name,
      email,
      flightId,
      airline,
      from,
      to,
      depart,
      arrive,
      date,
      passengerCount,
      passengers,
      seatingPreference,
      price,
      confirmationCode: generateConfirmationCode()
    };

    // ✅ If user is logged in → save userId
    if (userId) {
      bookingData.userId = userId;
    } 
    // ✅ If guest → generate guestId
    else {
      bookingData.guestId = generateGuestId();
    }

    const booking = new Booking(bookingData);
    await booking.save();

        // If booked by a logged-in user, add earned points to their totalPoints and record history
        if (userId) {
          try {
            const paid = parseFloat(price) || 0;
            const earned = Math.round(paid * 10); // 10 points per dollar

            await User.findByIdAndUpdate(
              userId,
              { 
                $inc: { totalPoints: earned },
                $push: { pointsHistory: { change: `+${earned}`, points: earned, value: (earned/100), note: 'Earned from flight', flight: `${from} → ${to}` } }
              }
            );
          } catch (err) {
            console.error('Failed to add earned points to user:', err);
          }
        }

    res.status(201).json({
      message: "Booking successful ✅",
      booking
    });

  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ error: "Booking failed" });
  }
});


// Find booking by confirmation code
app.get('/booking/byCode/:code', async (req, res) => {
  try {
    const code = req.params.code.trim().toUpperCase();
    const booking = await Booking.findOne({ confirmationCode: code });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json({ booking });
  } catch (err) {
    console.error('Booking lookup error:', err);
    res.status(500).json({ error: 'Failed to lookup booking' });
  }
});

// Mark booking as checked in
app.post('/booking/checkin', async (req, res) => {
  try {
    const { confirmationCode } = req.body;
    if (!confirmationCode) return res.status(400).json({ error: 'Missing confirmationCode' });

    const code = confirmationCode.trim().toUpperCase();
    const booking = await Booking.findOneAndUpdate(
      { confirmationCode: code },
      { $set: { checkedIn: true } },
      { new: true }
    );

    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    res.json({ success: true, booking });
  } catch (err) {
    console.error('Checkin error:', err);
    res.status(500).json({ error: 'Failed to check in' });
  }
});

app.get("/user/points/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('totalPoints pointsHistory');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const history = (user.pointsHistory || []).map(h => ({
      flight: h.flight || '',
      date: h.date ? h.date.toISOString().split('T')[0] : '',
      change: h.change || '',
      note: h.note || ''
    }));

    res.json({ totalPoints: user.totalPoints || 0, history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch points" });
  }
});


app.post("/saveCard", async (req, res) => {
  try {
    const { userId, cardNumber, cardHolder, expiry } = req.body;

    const card = await Card.findOneAndUpdate(
      { userId },  
      { 
        cardNumber, 
        cardHolder, 
        expiry,
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, card });
  } catch (err) {
    console.error("Card Save Error:", err);
    res.status(500).json({ error: "Failed to save card" });
  }
});



app.get("/userCard/:userId", async (req, res) => {
  const card = await Card.findOne({ userId: req.params.userId });
  res.json(card);
});


app.delete("/deleteCard/:userId", async (req, res) => {
  try {
    await Card.deleteOne({ userId: req.params.userId });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete card" });
  }
});

// Get user by id (returns current totalPoints)
app.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Deduct points from user
app.post('/user/deductPoints', async (req, res) => {
  try {
    const { userId, pointsToDeduct } = req.body;
    if (!userId || !pointsToDeduct) return res.status(400).json({ error: 'Missing parameters' });

    const pts = Math.abs(pointsToDeduct);
    const updated = await User.findByIdAndUpdate(
      userId,
      { 
        $inc: { totalPoints: -pts },
        $push: { pointsHistory: { change: `-${pts}`, points: -pts, value: -(pts/100), note: 'Redeemed for purchase' } }
      },
      { new: true }
    ).select('-password');

    if (!updated) return res.status(404).json({ error: 'User not found' });

    res.json({ success: true, user: updated });
  } catch (err) {
    console.error('Deduct points error:', err);
    res.status(500).json({ error: 'Failed to deduct points' });
  }
});

// Set a user's totalPoints to a specific value (admin / maintenance)
app.post('/user/setPoints', async (req, res) => {
  try {
    const { userId, totalPoints, clearHistory } = req.body;
    if (!userId || totalPoints === undefined) return res.status(400).json({ error: 'Missing parameters' });

    const update = { totalPoints: Number(totalPoints) };
    if (clearHistory) update.pointsHistory = [];

    const updated = await User.findByIdAndUpdate(userId, update, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ error: 'User not found' });

    res.json({ success: true, user: updated });
  } catch (err) {
    console.error('Set points error:', err);
    res.status(500).json({ error: 'Failed to set points' });
  }
});

// Reset points to zero (convenience)
app.post('/user/resetPoints', async (req, res) => {
  try {
    const { userId, clearHistory } = req.body;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    const update = { totalPoints: 0 };
    if (clearHistory) update.pointsHistory = [];

    const updated = await User.findByIdAndUpdate(userId, update, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ error: 'User not found' });

    res.json({ success: true, user: updated });
  } catch (err) {
    console.error('Reset points error:', err);
    res.status(500).json({ error: 'Failed to reset points' });
  }
});


app.post("/submitTicket", async (req, res) => {
  try {
    const { name, email, message, userId } = req.body;

    const newTicket = new SupportTicket({
      name,
      email,
      message,
      userId: userId || null,
    });

    await newTicket.save();

    res.status(201).json({
      message: "Ticket submitted successfully ✅",
      ticket: newTicket
    });

  } catch (error) {
    console.error("Ticket Error:", error);
    res.status(500).json({ error: "Failed to submit ticket" });
  }
});

// --- Basic admin endpoints (no auth) ---
// --- Admin: Get pending seller applications ---
app.get("/admin/sellerApplications", async (req, res) => {
  try {
    const pending = await SellerApplication.find({ status: "pending" });
    res.json({ pending });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch seller applications" });
  }
});

// --- Admin: Get approved seller applications (from applications collection) ---
app.get('/admin/approvedSellerApplications', async (req, res) => {
  try {
    const approved = await SellerApplication.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.json({ approved });
  } catch (err) {
    console.error('Failed to fetch approved seller applications', err);
    res.status(500).json({ error: 'Failed to fetch approved seller applications' });
  }
});

// Public: Get seller application by email (used by seller profile)
app.get('/seller/application/byEmail', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Missing email' });
    // match businessEmail field
    const application = await SellerApplication.findOne({ businessEmail: email });
    if (!application) return res.json(null);
    res.json({ application });
  } catch (err) {
    console.error('Failed to fetch seller application by email', err);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// --- Admin: Approve seller application ---
app.post("/admin/seller/approve", async (req, res) => {
  try {
    const { applicationId } = req.body;

    // Mark application approved
    const application = await SellerApplication.findByIdAndUpdate(
      applicationId,
      { status: "approved" },
      { new: true }
    );

    // Create user account for seller
    const newSeller = new User({
      name: application.fullName,
      username: application.businessEmail,   // seller logs in with this
      password: application.password,       // password they chose
      isSeller: true
    });

    await newSeller.save();

    res.json({
      success: true,
      message: "Seller approved and user account created.",
      newSeller,
      application
    });

  } catch (err) {
    console.error("Seller approval error:", err);
    res.status(500).json({ error: "Failed to approve seller" });
  }
});

// List all users (exclude password)
app.get('/admin/users', async (req, res) => {
  try {
    const { q } = req.query;
    let filter = {};
    if (q && q.trim()) {
      const r = new RegExp(q.trim(), 'i');
      filter = { $or: [ { username: r }, { firstName: r }, { lastName: r }, { _id: r } ] };
    }
    const users = await User.find(filter).select('-password').sort({ username: 1 });
    res.json({ users });
  } catch (err) {
    console.error('Admin list users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// List all bookings
app.get('/admin/bookings', async (req, res) => {
  try {
    // Populate user basic info and flight basic info for admin display
    const { q } = req.query;
    const r = q && q.trim() ? new RegExp(q.trim(), 'i') : null;
    const baseFilter = r ? { $or: [ { confirmationCode: r }, { name: r }, { email: r }, { from: r }, { to: r } ] } : {};

    const bookings = await Booking.find(baseFilter)
      .populate({ path: 'userId', select: 'username firstName lastName totalPoints' })
      .populate({ path: 'flightId', select: 'airline flightNo from to depart arrive date price' })
      .sort({ bookingDate: -1 });

    res.json({ bookings });
  } catch (err) {
    console.error('Admin list bookings error:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// List all tickets
app.get('/admin/tickets', async (req, res) => {
  try {
  const tickets = await SupportTicket.find().sort({ createdAt: -1 });
  res.json({ tickets });
  } catch (err) {
    console.error('Admin list tickets error:', err);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Toggle ticket completion
app.post('/admin/ticket/:id/toggleComplete', async (req, res) => {
  try {
    const id = req.params.id;
    const ticket = await SupportTicket.findById(id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    ticket.completed = !ticket.completed;
    await ticket.save();
    res.json({ success: true, ticket });
  } catch (err) {
    console.error('Toggle ticket completion error:', err);
    res.status(500).json({ error: 'Failed to toggle ticket' });
  }
});

// List all sellers (users with isSeller flag)
app.get('/admin/sellers', async (req, res) => {
  try {
    const { q } = req.query;
    let filter = { isSeller: true };
    if (q && q.trim()) {
      const r = new RegExp(q.trim(), 'i');
      filter = { isSeller: true, $or: [ { username: r }, { firstName: r }, { lastName: r }, { _id: r } ] };
    }
    const sellers = await User.find(filter).select('-password').sort({ username: 1 });
    res.json({ sellers });
  } catch (err) {
    console.error('Admin list sellers error:', err);
    res.status(500).json({ error: 'Failed to fetch sellers' });
  }
});

// Delete a seller by id
app.delete('/admin/seller/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await User.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    console.error('Admin delete seller error:', err);
    res.status(500).json({ error: 'Failed to delete seller' });
  }
});

// Delete a seller application (by application _id). If the application was approved,
// also attempt to delete the linked User account (matched by businessEmail).
app.delete('/admin/sellerApplication/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const application = await SellerApplication.findById(id);
    if (!application) return res.status(404).json({ error: 'Application not found' });

    // If this application had been approved, try to remove the corresponding user account
    if (application.status === 'approved' && application.businessEmail) {
      try {
        await User.findOneAndDelete({ username: application.businessEmail });
      } catch (err) {
        console.error('Failed to delete linked user for application', id, err);
        // continue to delete application even if user removal fails
      }
    }

    await SellerApplication.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    console.error('Admin delete seller application error:', err);
    res.status(500).json({ error: 'Failed to delete seller application' });
  }
});

// Delete a user by id
app.delete('/admin/user/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await User.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    console.error('Admin delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Delete a booking by id
app.delete('/admin/booking/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await Booking.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    console.error('Admin delete booking error:', err);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});


app.post("/seller/apply", async (req, res) => {
  try {
    const application = new SellerApplication(req.body);
    await application.save();

    res.json({
      success: true,
      message: "Seller application submitted successfully!",
      application
    });
  } catch (err) {
    console.error("Seller Application Error:", err);
    res.status(500).json({ error: "Failed to submit application" });
  }
});
