import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';

// Extend session type to include adminId
declare module 'express-session' {
  interface SessionData {
    adminId?: string;
  }
}

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configure middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: 'ambulance-tracking-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 } // 1 hour
}));

// Valid admin credentials
const validAdmins = [
  { username: 'admin1', password: 'madiun123' },
  { username: 'admin2', password: 'madiun123' },
  { username: 'admin3', password: 'madiun123' }
];

// Store active ambulances
interface Ambulance {
  id: string;
  lat: number;
  lng: number;
  active: boolean;
  adminId: string;
}

const ambulances: Map<string, Ambulance> = new Map();

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/admin', (req, res) => {
  // Check if user is logged in
  if (req.session.adminId) {
    res.sendFile(path.join(__dirname, '../public/admin.html'));
  } else {
    res.redirect('/login');
  }
});

// API endpoints
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  const admin = validAdmins.find(a => a.username === username && a.password === password);
  
  if (admin) {
    // Set session
    req.session.adminId = username;
    req.session.save();
    
    // Initialize ambulance for this admin if not exists
    if (!ambulances.has(username)) {
      ambulances.set(username, {
        id: username,
        lat: -7.613, // Default location (Madiun area)
        lng: 111.513,
        active: false,
        adminId: username
      });
    }
    
    res.json({ success: true, adminId: username });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.get('/api/logout', (req, res) => {
  if (req.session.adminId) {
    const ambulance = ambulances.get(req.session.adminId);
    if (ambulance) {
      ambulance.active = false;
      io.emit('ambulanceUpdate', Array.from(ambulances.values()));
    }
    
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
    });
  }
  
  res.redirect('/');
});

app.post('/api/updateLocation', (req, res) => {
  const { lat, lng, active } = req.body;
  
  if (!req.session.adminId) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  
  const adminId = req.session.adminId;
  const ambulance = ambulances.get(adminId);
  
  if (ambulance) {
    ambulance.lat = parseFloat(lat) || ambulance.lat;
    ambulance.lng = parseFloat(lng) || ambulance.lng;
    ambulance.active = active !== undefined ? active : ambulance.active;
    
    // Broadcast updates to all clients
    io.emit('ambulanceUpdate', Array.from(ambulances.values()));
    
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, message: 'Ambulance not found' });
  }
});

app.get('/api/ambulances', (req, res) => {
  res.json(Array.from(ambulances.values()));
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Send current ambulances data to new client
  socket.emit('ambulanceUpdate', Array.from(ambulances.values()));
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});