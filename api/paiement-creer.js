const SUPABASE_URL = 'https://tsbllhsphusqnubvxyug.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_3xQeMvR3Zw2u2VNFDpTzDw_7fE6jYHz';
const MONTANT_CENTIMES = 350;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Méthode non autorisée' }); return; }

  const auth = req.headers['authorization'] || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  if (!token) { res.status(401).json({ error: 'Non connecté' }); return; }

  let userId, userEmail;
  try {
    const r = await fetch(SUPABASE_URL + '/auth/v1/user', {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: 'Bearer ' + token }
    });
    if (!r.ok) { res.status(401).json({ error: 'Session invalide' }); return; }
    const u = await r.json();
    userId = u.id;
    userEmail = u.email;
  } catch (e) { res.status(401).json({ error: 'Session invalide' }); return; }
  if (!userId) { res.status(401).json({ error: 'Session invalide' }); return; }

  if (!process.env.STRIPE_SECRET_KEY) {
    res.status(503).json({ error: 'Paiement pas encore configuré' });
    return;
  }

  try {
    const origine = req.headers.origin || ('https://' + req.headers.host);
    const params = new URLSearchParams();
    params.set('mode', 'payment');
    params.set('success_url', origine + '/verification?paye=1');
    params.set('cancel_url', origine + '/verification');
    params.set('client_reference_id', userId);
    params.set('metadata[user_id]', userId);
    if (userEmail) params.set('customer_email', userEmail);
    params.set('line_items[0][quantity]', '1');
    params.set('line_items[0][price_data][currency]', 'eur');
    params.set('line_items[0][price_data][unit_amount]', String(MONTANT_CENTIMES));
    params.set('line_items[0][price_data][product_data][name]', "Validation d'inscription Divin");

    const sr = await fetch('https://api.stripe.com/v1/checkout/sessions', {
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
    res.status(200).json({ url: session.url });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
