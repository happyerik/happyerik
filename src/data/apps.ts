import type { Project } from "./projects";

const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");

export const apps: Project[] = [
  {
    title: "AI灵魂画手 · 你画我猜",
    desc: "在浏览器里体验你画我猜小游戏。",
    url: `${base}games/ai-doodle/index.html`,
    badge: "Unity Web",
  },
];
