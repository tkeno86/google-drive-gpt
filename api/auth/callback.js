const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'https://google-drive-gpt-h5i4.vercel.app/api/auth/callback';

export default async function handler(req, res) {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send('Missing authorization code');
  }

  const tokenEndpoint = 'https://oauth2.googleapis.com/token';

  const params = new URLSearchParams();
  params.append('code', code);
  params.append('client_id', CLIENT_ID);
  params.append('client_secret', CLIENT_SECRET);
  params.append('redirect_uri', REDIRECT_URI);
  params.append('grant_type', 'authorization_code');

  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error, details: data });
    }

    // Optional: Display token for now
    return res.status(200).json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
    });
  } catch (err) {
    console.error('Error exchanging code for token:', err);
    res.status(500).send('Failed to exchange code for token');
  }
}

