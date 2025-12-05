const express = require('express');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const PORT = 3000;

// Replace this with the same Client ID you used in index.html
const GOOGLE_CLIENT_ID = '263458262056-276f49f77d1psg4tgt9pihjapg4kk7gl.apps.googleusercontent.com';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Middleware to parse JSON
app.use(express.json());

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// API route to verify Google token
app.post('/api/google-login', async (req, res) => {
  const token = req.body.token;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload(); // user info

    const user = {
      googleId: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture
    };

    // 👉 Here you could:
    // - Save user in database
    // - Create your own session
    // For now, just return the user info to frontend
    res.json(user);

  } catch (err) {
    console.error('Error verifying Google ID token:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
