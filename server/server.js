
const express = require('express');
const cors = require('cors');
const app = express();
const User = require('./UserSchema')
const Flight = require("./FlightSchema");
const Booking = require("./BookingSchema");
const PaymentMethod = require("./PaymentMethod");
const Card = require("./CardSchema");



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


app.get('/getUser', async (req, res) => {
    // console.log(`SERVER: GET USER REQ BODY: ${req.query}`)
    console.log("SERVER: GET USER REQ QUERY:", req.query);
    const username = req.query.username
    const password = req.query.password
    try {
        const user = await User.findOne({ username, password })
        res.send(user)
    }
    catch (error) {
        res.status(500).send(error)
    }
})

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

    res.status(201).json({
      message: "Booking successful ✅",
      booking
    });

  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ error: "Booking failed" });
  }
});

app.get("/user/points/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const bookings = await Booking.find({ userId });

    let totalPoints = 0;
    let history = [];

    bookings.forEach(booking => {
      const earned = Math.round(booking.price * 10);  // ✅ 10 points per dollar

      totalPoints += earned;

      history.push({
        flight: `${booking.from} → ${booking.to}`,
        date: booking.date,
        change: `+${earned}`,
        note: "Earned from flight"
      });
    });

    res.json({
      totalPoints,
      history
    });

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

