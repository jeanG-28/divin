const { RoomServiceClient } = require('livekit-server-sdk');

module.exports = async function handler(req, res) {
    try {
          const svc = new RoomServiceClient(process.env.LIVEKIT_URL, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET);
          const rooms = await svc.listRooms();
          res.status(200).json({
                  rooms: rooms.map(function (r) {
                            return { nom: r.name, spectateurs: r.numParticipants, cree: Number(r.creationTime) * 1000 };
                  })
          });
    } catch (e) {
          res.status(200).json({ rooms: [] });
    }
};
