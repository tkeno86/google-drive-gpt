const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const REDIRECT_URI = 'https://google-drive-gpt-h5i4.vercel.app/api/auth/callback';
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

export default function handler(req, res) {
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', SCOPES.join(' '));
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');

  res.redirect(authUrl.toString());
}

