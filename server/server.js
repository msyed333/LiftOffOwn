
const express = require('express');
const cors = require('cors');
const app = express();
const User = require('./UserSchema')
const Flight = require("./FlightSchema");

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


