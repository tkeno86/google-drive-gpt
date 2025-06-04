// /api/drive.js
import fs from 'fs';
import path from 'path';

const tokensPath = path.resolve('./tokens.json');

export default async function handler(req, res) {
  // Check if token file exists
  if (!fs.existsSync(tokensPath)) {
    return res.status(401).json({
      error: 'No token found. Please log in first.',
      login_url: 'https://google-drive-gpt-h5i4.vercel.app/api/auth/login'
    });
  }

  // Load token from file
  let tokenData = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));

  // Try Drive API request with existing token
  let driveRes = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=10', {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`
    }
  });

  let data = await driveRes.json();

  // Token might be expired — refresh it
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
      // Save updated token to file
      tokenData.access_token = refreshed.access_token;
      fs.writeFileSync(tokensPath, JSON.stringify(tokenData, null, 2));

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




