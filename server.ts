import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  // Game state in memory
  const rooms: Record<string, any> = {};

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("create_room", ({ playerName }) => {
      const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const player = { id: socket.id, name: playerName, isHost: true, isReady: false };
      rooms[roomCode] = {
        code: roomCode,
        status: "LOBBY",
        players: [player],
        votes: [],
        createdAt: Date.now(),
      };
      socket.join(roomCode);
      socket.emit("room_joined", { room: rooms[roomCode], player });
      console.log(`Room created: ${roomCode} by ${playerName}`);
    });

    socket.on("join_room", ({ roomCode, playerName }) => {
      const room = rooms[roomCode];
      if (!room) {
        socket.emit("error", "Room not found!");
        return;
      }
      if (room.status !== "LOBBY") {
        socket.emit("error", "Game already started!");
        return;
      }
      const player = { id: socket.id, name: playerName, isHost: false, isReady: false };
      room.players.push(player);
      socket.join(roomCode);
      socket.emit("room_joined", { room, player });
      io.to(roomCode).emit("room_updated", room);
      console.log(`${playerName} joined room: ${roomCode}`);
    });

    socket.on("start_game", ({ roomCode }) => {
      const room = rooms[roomCode];
      if (room && room.players.find(p => p.id === socket.id)?.isHost) {
        room.status = "VOTING";
        io.to(roomCode).emit("room_updated", room);
        console.log(`Game started in room: ${roomCode}`);
      }
    });

    socket.on("submit_vote", ({ roomCode, targetId, traits }) => {
      const room = rooms[roomCode];
      if (room) {
        // Remove existing vote from this voter for this target
        room.votes = room.votes.filter((v: any) => !(v.voterId === socket.id && v.targetId === targetId));
        room.votes.push({ voterId: socket.id, targetId, traits });
        
        // Check if everyone has voted for everyone else
        const totalExpectedVotes = room.players.length * (room.players.length - 1);
        if (room.votes.length >= totalExpectedVotes) {
          room.status = "RESULT";
        }
        
        io.to(roomCode).emit("room_updated", room);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      // Optional: Handle player disconnection from rooms
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
