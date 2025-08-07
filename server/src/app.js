const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// Fixed: Add security middleware
app.use(helmet()); // Adds various HTTP headers for security
app.use(express.json({ limit: '10mb' })); // Limit request body size
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting to prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// In-memory user storage (for demo purposes)
let users = [
  { id: 1, email: 'admin@example.com', password: '$2b$10$hashedpassword', role: 'admin' }
];

// Bug 2: SQL Injection vulnerability - no input sanitization
app.get('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  
  // Fixed: Add input validation and use strict equality
  if (isNaN(userId) || userId <= 0) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  const user = users.find(u => u.id === userId); // Using === for strict equality
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Bug 3: Weak password hashing - using synchronous bcrypt
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Weak password hashing - should use async version
    const hashedPassword = bcrypt.hashSync(password, 10); // Using sync version
    
    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      role: 'user'
    };
    
    users.push(newUser);
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bug 4: Insecure JWT secret - hardcoded in code
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Fixed: Use environment variable for JWT secret
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret-change-in-production', // Use environment variable
      { expiresIn: '24h' }
    );
    
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bug 5: No rate limiting - vulnerable to brute force attacks
app.get('/api/protected', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-change-in-production');
    res.json({ message: 'Protected data', user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;