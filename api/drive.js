export default async function handler(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'Missing token in query' });
  }

  try {
    const driveRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await driveRes.json();

    if (data.error) {
      return res.status(400).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Drive fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

