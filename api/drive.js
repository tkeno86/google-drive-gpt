// /api/drive.js
let userTokens = {}; // move this to a shared store eventually

export default async function handler(req, res) {
  const tokenData = userTokens['thomas.kennedy986@gmail.com'];

  if (!tokenData?.access_token) {
    return res.status(401).json({ error: 'No token found. Please log in.' });
  }

  const driveRes = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=10', {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  const data = await driveRes.json();

  if (data.error?.code === 401 && tokenData.refresh_token) {
    // Access token expired — try refreshing
    const newTokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: tokenData.refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    const newTokenData = await newTokenRes.json();

    if (newTokenData.access_token) {
      // Save new token
      userTokens['thomas.kennedy986@gmail.com'] = {
        ...tokenData,
        access_token: newTokenData.access_token,
      };

      // Retry Drive API
      const retry = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=10', {
        headers: {
          Authorization: `Bearer ${newTokenData.access_token}`,
        },
      });

      const retryData = await retry.json();
      return res.status(200).json(retryData);
    }
  }

  return res.status(200).json(data);
}




