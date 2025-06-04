export default function handler(req, res) {
  res.status(302).redirect('https://accounts.google.com/o/oauth2/v2/auth?...');
}
