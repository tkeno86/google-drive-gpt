// /api/auth/callback.js
let userTokens = {}; // temporary store, replace with DB later

export default async function handler(req, res) {
  const code = req.query.code;

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

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
    // Save to memory under your email
    userTokens['thomas.kennedy986@gmail.com'] = tokenData;

    res.redirect('/api/drive'); // forward to Drive test
  } else {
    res.status(400).json(tokenData);
  }
}


