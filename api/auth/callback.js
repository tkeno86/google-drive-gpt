// /api/auth/callback.js
import fs from 'fs';
import path from 'path';

const tokensPath = path.resolve('./tokens.json'); // File location

export default async function handler(req, res) {
  const code = req.query.code;

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: 'https://google-drive-gpt-h5i4.vercel.app/api/auth/callback',
      grant_type: 'authorization_code',
    }),
  });

  const tokenData = await tokenRes.json();

  if (tokenData.access_token) {
    try {
      // Write token data to file
      fs.writeFileSync(tokensPath, JSON.stringify(tokenData, null, 2));
      console.log('✅ Tokens saved to tokens.json');
    } catch (err) {
      console.error('❌ Failed to write tokens.json:', err);
      return res.status(500).json({ error: 'Failed to save token' });
    }

    res.redirect('/'); // Redirect to home or success page
  } else {
    console.error('❌ Token error:', tokenData);
    res.status(400).json(tokenData);
  }
}



