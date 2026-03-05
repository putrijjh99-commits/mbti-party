export enum MBTIPole {
  E = "E",
  I = "I",
  S = "S",
  N = "N",
  T = "T",
  F = "F",
  J = "J",
  P = "P",
}

export interface MBTITrait {
  label: string;
  pole: MBTIPole;
}

export interface Player {
  id: string;
  name: string;
  avatarUrl?: string;
  isHost: boolean;
  isReady: boolean;
}

export interface Vote {
  voterId: string;
  targetId: string;
  traits: MBTIPole[]; // List of poles voted for this target
}

export interface Room {
  id: string;
  code: string;
  status: "LOBBY" | "VOTING" | "RESULT";
  players: Player[];
  votes: Vote[];
  createdAt: number;
}
