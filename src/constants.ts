import { MBTIPole, MBTITrait } from "./types";

export const MBTI_INDICATORS: MBTITrait[] = [
  { label: "Ekspresif", pole: MBTIPole.E },
  { label: "Berenergi Sosial", pole: MBTIPole.E },
  { label: "Pendiam", pole: MBTIPole.I },
  { label: "Reflektif", pole: MBTIPole.I },
  { label: "Detail", pole: MBTIPole.S },
  { label: "Praktis", pole: MBTIPole.S },
  { label: "Imajinatif", pole: MBTIPole.N },
  { label: "Visioner", pole: MBTIPole.N },
  { label: "Logis", pole: MBTIPole.T },
  { label: "Objektif", pole: MBTIPole.T },
  { label: "Empati", pole: MBTIPole.F },
  { label: "Harmonis", pole: MBTIPole.F },
  { label: "Terstruktur", pole: MBTIPole.J },
  { label: "Disiplin", pole: MBTIPole.J },
  { label: "Fleksibel", pole: MBTIPole.P },
  { label: "Spontan", pole: MBTIPole.P },
];

export const MBTI_PAIRS = [
  { pole1: MBTIPole.E, pole2: MBTIPole.I },
  { pole1: MBTIPole.S, pole2: MBTIPole.N },
  { pole1: MBTIPole.T, pole2: MBTIPole.F },
  { pole1: MBTIPole.J, pole2: MBTIPole.P },
];

export const COLORS = {
  bg: "bg-yellow-50",
  primary: "text-pink-500",
  secondary: "bg-blue-400",
  accent: "bg-purple-600",
  mint: "bg-mint-100",
};
