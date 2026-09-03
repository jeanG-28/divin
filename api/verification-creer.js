const SUPABASE_URL = 'https://tsbllhsphusqnubvxyug.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_3xQeMvR3Zw2u2VNFDpTzDw_7fE6jYHz';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Méthode non autorisée' }); return; }

  const auth = req.headers['authorization'] || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  if (!token) { res.status(401).json({ error: 'Non connecté' }); return; }

  let userId;
  try {
    const r = await fetch(SUPABASE_URL + '/auth/v1/user', {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: 'Bearer ' + token }
    });
    if (!r.ok) { res.status(401).json({ error: 'Session invalide' }); return; }
    const u = await r.json();
    userId = u.id;
  } catch (e) { res.status(401).json({ error: 'Session invalide' }); return; }
  if (!userId) { res.status(401).json({ error: 'Session invalide' }); return; }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PUBLISHABLE_KEY) {
    res.status(503).json({ error: 'Vérification pas encore configurée' });
    return;
  }

  try {
    const params = new URLSearchParams();
    params.set('type', 'document');
    params.set('options[document][require_matching_selfie]', 'true');
    params.set('metadata[user_id]', userId);

    const sr = await fetch('https://api.stripe.com/v1/identity/verification_sessions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.STRIPE_SECRET_KEY,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });
    const session = await sr.json();
    if (!sr.ok) {
      res.status(502).json({ error: (session.error && session.error.message) || 'Erreur Stripe' });
      return;
    }
    res.status(200).json({ client_secret: session.client_secret, publishable_key: process.env.STRIPE_PUBLISHABLE_KEY });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

