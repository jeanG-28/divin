const SUPABASE_URL = 'https://tsbllhsphusqnubvxyug.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_3xQeMvR3Zw2u2VNFDpTzDw_7fE6jYHz';
const EMAIL_ADMIN = 'jeandu28120@hotmail.fr';

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
    userEmail = (u.email || '').toLowerCase();
  } catch (e) { res.status(401).json({ error: 'Session invalide' }); return; }
  if (!userId) { res.status(401).json({ error: 'Session invalide' }); return; }

  if (userEmail !== EMAIL_ADMIN.toLowerCase()) {
    res.status(403).json({ error: 'Compte non autorisé' });
    return;
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    res.status(503).json({ error: 'Configuration manquante' });
    return;
  }

  try {
    const sbRes = await fetch(SUPABASE_URL + '/rest/v1/profiles?id=eq.' + encodeURIComponent(userId), {
      method: 'PATCH',
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify({ admin: true, verifie: true, paye: true })
    });
    const body = await sbRes.text();
    if (!sbRes.ok) { res.status(502).json({ error: 'Erreur base de données', detail: body }); return; }
    res.status(200).json({ ok: true, profil: JSON.parse(body) });
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
