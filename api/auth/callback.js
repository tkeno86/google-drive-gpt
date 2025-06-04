// /api/auth/callback.js
import { serialize } from 'cookie';

export default async function handler(req, res) {
  const code = req.query.code;

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  const redirect_uri = `${process.env.BASE_URL}/api/auth/callback`;

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenRes.ok && tokenData.access_token) {
      res.setHeader('Set-Cookie', serialize('google_token', JSON.stringify(tokenData), {
        httpOnly: true,
        secure: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax'
      }));

      res.redirect('/');
    } else {
      console.error('❌ Token error:', tokenData);
      res.status(400).json({ error: 'Failed to get token', details: tokenData });
    }

  } catch (err) {
    console.error('❌ Unexpected error during token exchange:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}





