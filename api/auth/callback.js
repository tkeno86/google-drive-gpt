// /api/auth/callback.js
import { serialize } from 'cookie';

export default async function handler(req, res) {
  const code = req.query.code;

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  // Exchange the code for an access token
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
    // ✅ Store token securely in an HTTP-only cookie
    res.setHeader('Set-Cookie', serialize('google_token', JSON.stringify(tokenData), {
      httpOnly: true,
      secure: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax'
    }));

    // Redirect to home or a success page
    res.redirect('/');
  } else {
    console.error('❌ Token error:', tokenData);
    res.status(400).json(tokenData);
  }
}




