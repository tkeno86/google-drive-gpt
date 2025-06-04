export default async function handler(req, res) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const driveRes = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=10', {
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



