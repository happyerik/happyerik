export interface Project {
  title: string;
  desc: string;
  url: string;
  badge?: string;
}

const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");

// 按新增时间倒序排列，最新项目放在最前面。
export const projects: Project[] = [
  {
    title: "AI灵魂画手 · 你画我猜",
    desc: "在浏览器里体验你画我猜小游戏。",
    url: `${base}games/ai-doodle/index.html`,
    badge: "3D Apps",
  },
  {
    title: "HRM²Avatar",
    desc: "手机拍手机看的3D真人数字人重建与驱动技术",
    url: "https://acennr-engine.github.io/HRM2Avatar/",
    badge: "Research Paper",
  },
];
