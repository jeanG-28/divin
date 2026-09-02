const { AccessToken } = require('livekit-server-sdk');

module.exports = async function handler(req, res) {
    const q = req.method === 'GET' ? req.query : (req.body || {});
    const room = q.room;
    const identity = q.identity;
    const nom = q.nom || 'Membre';
    const publier = q.publier === '1' || q.publier === true;

    if (!room || !identity) {
          res.status(400).json({ error: 'room et identity requis' });
          return;
    }

    const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
          identity: String(identity),
          name: String(nom),
          ttl: '4h'
    });
    at.addGrant({
          room: String(room),
          roomJoin: true,
          canPublish: !!publier,
          canSubscribe: true,
          canPublishData: true
    });

    const token = await at.toJwt();
    res.status(200).json({ token: token, url: process.env.LIVEKIT_URL });
};
