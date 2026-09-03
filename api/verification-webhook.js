const Stripe = require('stripe');

const SUPABASE_URL = 'https://tsbllhsphusqnubvxyug.supabase.co';

module.exports.config = { api: { bodyParser: false } };

function lireCorpsBrut(req) {
  return new Promise(function (resolve, reject) {
    var morceaux = [];
    req.on('data', function (c) { morceaux.push(c); });
    req.on('end', function () { resolve(Buffer.concat(morceaux)); });
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).end(); return; }
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) { res.status(503).end(); return; }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const corpsBrut = await lireCorpsBrut(req);
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(corpsBrut, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    res.status(400).send('Signature invalide');
    return;
  }

  var debugSupabase = null;
  if (event.type === 'identity.verification_session.verified') {
    const session = event.data.object;
    const userId = session.metadata && session.metadata.user_id;
    if (userId && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const sbRes = await fetch(SUPABASE_URL + '/rest/v1/profiles?id=eq.' + encodeURIComponent(userId), {
        method: 'PATCH',
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify({ verifie: true })
      });
      const sbBody = await sbRes.text();
      debugSupabase = { status: sbRes.status, body: sbBody };
      if (!sbRes.ok) { console.error('Echec mise a jour Supabase:', sbRes.status, sbBody); }
      else { console.log('Mise a jour Supabase OK:', sbBody); }
    } else {
      debugSupabase = { skipped: true, hasUserId: !!userId, hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY };
    }
  }

  res.status(200).json({ received: true, debugSupabase: debugSupabase });
};
