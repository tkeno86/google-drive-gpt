const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const REDIRECT_URI = 'https://google-drive-gpt-h5i4.vercel.app/api/auth/callback';

// Add both Drive and Email scopes
const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/userinfo.email'
];

export default function handler(req, res) {
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');

  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code'); // this ensures /callback gets a "code"
  authUrl.searchParams.set('scope', SCOPES.join(' '));
  authUrl.searchParams.set('access_type', 'offline'); // needed for refresh_token
  authUrl.searchParams.set('prompt', 'consent');      // forces scope prompt each time
  authUrl.searchParams.set('state', 'gpt-drive-flow'); // optional state tracking

  res.redirect(authUrl.toString());
}



