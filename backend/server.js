const express = require('express');
const {Server} = require('socket.io');
const http = require('http');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./schema/User');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", }, });

// Middleware
app.use(cors());
app.use(express.json());

const SECRET_KEY = process.env.SECRET_KEY;
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

mongoose.connect(MONGODB_URI)
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((err) => {
    console.error('MongoDB connection error:', err);
});


app.post("/signup", async (req, res) => {
    const { username, password } = req.body;
    
    // Handle missing username or password
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }
    
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ error: "User already exists" });
        }
        
        // Create new user in MongoDB (hash password before saving)
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        
        return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }
    
    try {
        // Check if user exists and password is correct
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: "Invalid username or password" });
        }
        // Compare provided password with hashed password stored in DB
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Invalid username or password" });
        }
        
        // Generate JWT
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '24h' });
        
        return res.status(200).json({ token, message: "Login successful" });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
        return next(new Error("Authentication error"));
    }
    
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        socket.userId = decoded.username;
        next();
    } catch (err) {
        next(new Error("Authentication error"));
    }
});

io.on("connection", (socket) => {
    console.log(`User ${socket.userId} connected with socket id ${socket.id}`);
    
    // Notify all clients that a user has connected
    socket.broadcast.emit('user-connected', {
        username: socket.userId,
        message: `${socket.userId} joined the conversation`,
        type: 'system'
    });
    
    // Handle incoming messages
    socket.on('send-message', (data) => {
        // Broadcast to all clients except sender
        socket.broadcast.emit('receive-message', {
            username: socket.userId,
            message: data.message,
            type: 'user',
            timestamp: new Date().toLocaleTimeString()
        });
    });
    
    socket.on("disconnect", () => {
        console.log(`User ${socket.userId} disconnected`);
        // Notify all remaining clients that user left
        socket.broadcast.emit('user-disconnected', {
            username: socket.userId,
            message: `${socket.userId} left the convo`,
            type: 'system'
        });
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});