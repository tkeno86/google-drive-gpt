// /api/drive.js
import { parse, serialize } from 'cookie';

export default async function handler(req, res) {
  const cookies = parse(req.headers.cookie || '');
  const tokenRaw = cookies.google_token;

  if (!tokenRaw) {
    return res.status(401).json({
      error: 'Not logged in. Please log in at /api/auth/login.'
    });
  }

  let tokenData;

  try {
    tokenData = JSON.parse(tokenRaw);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid token in cookie.' });
  }

  // Attempt Drive API request with access token
  let driveRes = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=10', {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`
    }
  });

  let data = await driveRes.json();

  // Token may be expired — try refreshing
  if (data.error?.code === 401 && tokenData.refresh_token) {
    const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: tokenData.refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    const refreshed = await refreshRes.json();

    if (refreshed.access_token) {
      // Update token and cookie
      tokenData.access_token = refreshed.access_token;

      res.setHeader('Set-Cookie', serialize('google_token', JSON.stringify(tokenData), {
        httpOnly: true,
        secure: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax'
      }));

      // Retry Drive API with new token
      driveRes = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=10', {
        headers: {
          Authorization: `Bearer ${refreshed.access_token}`
        }
      });

      data = await driveRes.json();
    } else {
      return res.status(401).json({
        error: 'Token refresh failed. Please log in again.',
        login_url: 'https://google-drive-gpt-h5i4.vercel.app/api/auth/login'
      });
    }
  }

  return res.status(200).json(data);
}





