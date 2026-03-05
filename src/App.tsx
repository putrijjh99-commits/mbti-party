import React, { useState, useEffect, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "motion/react";
import { Users, Rocket, Trophy, Heart, Zap, Eye, Target, Sparkles, LogOut, ChevronRight } from "lucide-react";
import { MBTIPole, Room, Player, Vote } from "./types";
import { MBTI_INDICATORS, MBTI_PAIRS } from "./constants";

const socket: Socket = io();

export default function App() {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [room, setRoom] = useState<Room | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [error, setError] = useState("");
  const [votingTargetIndex, setVotingTargetIndex] = useState(0);
  const [selectedTraits, setSelectedTraits] = useState<MBTIPole[]>([]);

  useEffect(() => {
    socket.on("room_joined", ({ room, player }) => {
      setRoom(room);
      setCurrentPlayer(player);
      setError("");
    });

    socket.on("room_updated", (updatedRoom) => {
      setRoom(updatedRoom);
    });

    socket.on("error", (msg) => {
      setError(msg);
    });

    return () => {
      socket.off("room_joined");
      socket.off("room_updated");
      socket.off("error");
    };
  }, []);

  const handleCreateRoom = () => {
    if (!playerName.trim()) return setError("Nama harus diisi!");
    socket.emit("create_room", { playerName });
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) return setError("Nama harus diisi!");
    if (!roomCode.trim()) return setError("Kode Room harus diisi!");
    socket.emit("join_room", { roomCode: roomCode.toUpperCase(), playerName });
  };

  const handleStartGame = () => {
    if (room) socket.emit("start_game", { roomCode: room.code });
  };

  const toggleTrait = (pole: MBTIPole) => {
    setSelectedTraits((prev) =>
      prev.includes(pole) ? prev.filter((p) => p !== pole) : [...prev, pole]
    );
  };

  const handleSubmitVote = () => {
    if (!room || !currentPlayer) return;
    const target = votingTargets[votingTargetIndex];
    socket.emit("submit_vote", {
      roomCode: room.code,
      targetId: target.id,
      traits: selectedTraits,
    });

    if (votingTargetIndex < votingTargets.length - 1) {
      setVotingTargetIndex((prev) => prev + 1);
      setSelectedTraits([]);
    }
  };

  const votingTargets = useMemo(() => {
    if (!room || !currentPlayer) return [];
    return room.players.filter((p) => p.id !== currentPlayer.id);
  }, [room, currentPlayer]);

  const calculateResults = (targetId: string) => {
    if (!room) return "XXXX";
    const targetVotes = room.votes.filter((v) => v.targetId === targetId);
    if (targetVotes.length === 0) return "XXXX";

    const counts: Record<MBTIPole, number> = {
      E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0
    };

    targetVotes.forEach((v) => {
      v.traits.forEach((trait) => {
        counts[trait]++;
      });
    });

    const result = MBTI_PAIRS.map((pair) => {
      return counts[pair.pole1] >= counts[pair.pole2] ? pair.pole1 : pair.pole2;
    }).join("");

    return result;
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center p-6 font-sans text-gray-800">
        <motion.header 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-black text-pink-500 tracking-tight mb-2 flex items-center justify-center gap-3">
            MBTI PARTY! <Sparkles className="text-yellow-400" />
          </h1>
          <p className="text-xl text-gray-500 font-medium italic">Guess the Vibe of Your Friends! ✨</p>
        </motion.header>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-md border-b-8 border-blue-400"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 ml-2">Siapa Namamu?</label>
              <input
                className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-3xl text-center text-2xl font-bold focus:border-blue-400 focus:outline-none transition-all"
                placeholder="Ketik Nama..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>

            <div className="h-px bg-gray-100 my-4" />

            <div className="space-y-4">
              <button
                onClick={handleCreateRoom}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-black py-5 rounded-3xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 text-xl"
              >
                <Rocket size={24} /> BUAT ROOM BARU
              </button>

              <div className="relative flex items-center justify-center py-2">
                <span className="bg-white px-4 text-gray-400 font-bold text-sm z-10">ATAU GABUNG</span>
                <div className="absolute w-full h-px bg-gray-100" />
              </div>

              <div className="flex gap-3">
                <input
                  className="flex-1 p-5 bg-gray-50 border-2 border-gray-100 rounded-3xl text-center text-2xl font-bold focus:border-blue-400 focus:outline-none transition-all uppercase"
                  placeholder="KODE"
                  maxLength={6}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                />
                <button
                  onClick={handleJoinRoom}
                  className="bg-blue-400 hover:bg-blue-500 text-white p-5 rounded-3xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <ChevronRight size={32} />
                </button>
              </div>
            </div>
          </div>
          {error && <p className="text-red-500 text-center mt-6 font-bold animate-pulse">{error}</p>}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50 p-6 font-sans text-gray-800">
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-pink-500 tracking-tight">MBTI PARTY! ✨</h1>
        <div className="flex items-center gap-4">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border-2 border-blue-100 font-bold text-blue-500">
            ROOM: {room.code}
          </div>
          <button onClick={() => window.location.reload()} className="text-gray-400 hover:text-red-500 transition-colors">
            <LogOut size={24} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {room.status === "LOBBY" && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border-b-8 border-purple-400 text-center">
                <h2 className="text-4xl font-black text-purple-600 mb-4">Lobby Menunggu...</h2>
                <p className="text-gray-500 font-medium">Bagikan kode room ke teman-temanmu!</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {room.players.map((player) => (
                  <motion.div
                    key={player.id}
                    layout
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className={`bg-white p-6 rounded-3xl shadow-md border-2 ${player.isHost ? 'border-yellow-400' : 'border-gray-100'} text-center relative overflow-hidden`}
                  >
                    {player.isHost && <div className="absolute top-0 left-0 right-0 bg-yellow-400 text-xs font-black py-1">HOST</div>}
                    <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
                      {player.name[0].toUpperCase()}
                    </div>
                    <p className="font-black text-xl truncate">{player.name}</p>
                    {player.id === currentPlayer?.id && <p className="text-xs text-blue-500 font-bold mt-1">(KAMU)</p>}
                  </motion.div>
                ))}
              </div>

              {currentPlayer?.isHost && (
                <button
                  onClick={handleStartGame}
                  disabled={room.players.length < 2}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-black py-6 rounded-3xl shadow-2xl text-2xl hover:scale-[1.02] transition-all"
                >
                  MULAI GAME! 🚀
                </button>
              )}
            </motion.div>
          )}

          {room.status === "VOTING" && (
            <motion.div
              key="voting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border-b-8 border-purple-400">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400 uppercase font-black tracking-widest">Menilai Profile:</p>
                  <p className="text-sm font-black text-purple-500">{votingTargetIndex + 1} / {votingTargets.length}</p>
                </div>
                <h2 className="text-5xl font-black text-purple-600">{votingTargets[votingTargetIndex]?.name}</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {MBTI_INDICATORS.map((item, idx) => {
                  const isSelected = selectedTraits.includes(item.pole);
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleTrait(item.pole)}
                      className={`p-5 rounded-3xl border-2 font-bold transition-all flex items-center justify-between text-lg ${
                        isSelected 
                          ? 'bg-green-500 border-green-600 text-white shadow-lg scale-105' 
                          : 'bg-white border-gray-100 text-gray-700 hover:border-green-300'
                      }`}
                    >
                      {item.label} <span>{isSelected ? '✅' : '+'}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleSubmitVote}
                disabled={selectedTraits.length === 0}
                className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 text-white py-6 rounded-3xl font-black text-2xl shadow-2xl hover:scale-[1.02] transition-all"
              >
                {votingTargetIndex === votingTargets.length - 1 ? 'LIHAT HASIL! 🏁' : 'LANJUT ➡️'}
              </button>
            </motion.div>
          )}

          {room.status === "RESULT" && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              <div className="text-center">
                <h2 className="text-5xl font-black text-pink-500 mb-2">HASIL AKHIR! 🏆</h2>
                <p className="text-gray-500 font-bold">Inilah Vibe Kalian Menurut Teman-Teman!</p>
              </div>

              <div className="grid gap-8">
                {room.players.map((player, idx) => {
                  const mbti = calculateResults(player.id);
                  return (
                    <motion.div
                      key={player.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white rounded-[2rem] p-8 shadow-xl border-l-8 border-blue-400 flex flex-col md:flex-row items-center gap-8"
                    >
                      <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-4xl font-black text-blue-500 border-4 border-blue-100">
                        {player.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-3xl font-black text-gray-800">{player.name}</h3>
                        <p className="text-gray-400 font-bold uppercase tracking-widest">The Vibe Type</p>
                      </div>
                      <div className="bg-gradient-to-br from-pink-500 to-purple-600 text-white px-8 py-4 rounded-3xl shadow-lg">
                        <span className="text-5xl font-black tracking-tighter">{mbti}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-400 hover:bg-blue-500 text-white py-6 rounded-3xl font-black text-xl shadow-xl transition-all"
              >
                MAIN LAGI? 🔄
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
