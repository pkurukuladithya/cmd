import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';
import User from '../models/UserModel.js';

// Ensure env variables are loaded even if this module is imported before server.js config
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const oauth2Client =
  GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_REDIRECT_URI
    ? new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI)
    : null;

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: '7d',
  });

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      provider: 'local',
    });

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        provider: user.provider,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        provider: user.provider,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  res.json({ user: req.user });
};

export const getGoogleAuthUrl = (req, res) => {
  if (!oauth2Client) {
    return res.status(500).json({ message: 'Google OAuth is not configured' });
  }

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['openid', 'email', 'profile'],
    redirect_uri: GOOGLE_REDIRECT_URI,
  });

  res.json({ url });
};

export const handleGoogleCallback = async (req, res) => {
  try {
    if (!oauth2Client) {
      return res.status(500).json({ message: 'Google OAuth is not configured' });
    }

    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ message: 'Missing Google authorization code' });
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: googleUser } = await oauth2.userinfo.get();

    if (!googleUser?.email) {
      return res.status(400).json({ message: 'Google account email is required' });
    }

    const existingUser = await User.findOne({
      $or: [{ googleId: googleUser.id }, { email: googleUser.email }],
    });

    let user = existingUser;
    if (user) {
      user.googleId = user.googleId || googleUser.id;
      user.provider = 'google';
      await user.save();
    } else {
      user = await User.create({
        name: googleUser.name || googleUser.email,
        email: googleUser.email,
        googleId: googleUser.id,
        provider: 'google',
        role: 'user',
      });
    }

    const token = generateToken(user);
    const redirectUrl = new URL(FRONTEND_URL);
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set('email', user.email);
    redirectUrl.searchParams.set('name', user.name);

    return res.redirect(redirectUrl.toString());
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const ensureAdminUser = async () => {
  const adminEmail = 'admin@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  const existing = await User.findOne({ email: adminEmail }).select('+password');
  if (existing) {
    let changed = false;
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      changed = true;
    }
    if (adminPassword && adminPassword.length >= 4) {
      existing.password = adminPassword; // will be hashed by pre-save hook
      changed = true;
    }
    existing.provider = existing.provider || 'local';
    if (changed) await existing.save();
    return existing;
  }

  const adminUser = await User.create({
    name: 'Administrator',
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
    provider: 'local',
  });

  return adminUser;
};
