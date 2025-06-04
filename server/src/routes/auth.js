// server/src/routes/auth.js
// MARCUS AI - Authentication Routes

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// JWT Secret - In production sollte das aus .env kommen
const JWT_SECRET = process.env.JWT_SECRET || 'marcus_ai_secret_key_change_in_production';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.userId = user.userId;
    next();
  });
};

// POST /api/auth/register - User Registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, company } = req.body;

    // Validation
    if (!email || !password || !firstName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and first name are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      company,
      role: 'user',
      trialStartDate: new Date(),
      trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
      subscriptionStatus: 'trial',
      createdAt: new Date()
    });

    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser._id);

    // Return user data (without password)
    const userResponse = {
      id: newUser._id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      company: newUser.company,
      role: newUser.role,
      subscriptionStatus: newUser.subscriptionStatus,
      trialEndDate: newUser.trialEndDate
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// POST /api/auth/login - User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user data (without password)
    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      company: user.company,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
      trialEndDate: user.trialEndDate,
      lastLogin: user.lastLogin
    };

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// GET /api/auth/me - Get Current User
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        trialEndDate: user.trialEndDate,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting user data'
    });
  }
});

// POST /api/auth/logout - Logout User
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In einer JWT-basierten App ist logout meist client-seitig
    // Hier können wir den Token zur Blacklist hinzufügen (optional)

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

// POST /api/auth/refresh - Refresh JWT Token
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new token
    const newToken = generateToken(user._id);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      token: newToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error refreshing token'
    });
  }
});

// POST /api/auth/forgot-password - Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Aus Sicherheitsgründen geben wir nicht preis, ob die Email existiert
      return res.json({
        success: true,
        message: 'If the email exists, a reset link has been sent'
      });
    }

    // TODO: Implement password reset email
    // Für jetzt loggen wir es nur
    console.log(`Password reset requested for: ${email}`);

    res.json({
      success: true,
      message: 'If the email exists, a reset link has been sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing request'
    });
  }
});

// GET /api/auth/trial-status - Check Trial Status
router.get('/trial-status', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const now = new Date();
    const trialDaysLeft = Math.max(0, Math.ceil((user.trialEndDate - now) / (1000 * 60 * 60 * 24)));
    const isTrialActive = now < user.trialEndDate && user.subscriptionStatus === 'trial';

    res.json({
      success: true,
      trialStatus: {
        isTrialActive,
        trialDaysLeft,
        trialEndDate: user.trialEndDate,
        subscriptionStatus: user.subscriptionStatus
      }
    });

  } catch (error) {
    console.error('Trial status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error checking trial status'
    });
  }
});

// Export router and middleware
module.exports = router;
module.exports.authenticateToken = authenticateToken;