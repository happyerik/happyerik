/** @type {import('tailwindcss').Config} */
const cjkSans = [
	'-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"PingFang SC"', '"Hiragino Sans GB"',
	'"Microsoft YaHei"', '"Noto Sans SC"', '"Source Han Sans SC"', 'sans-serif',
];

module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				sans: cjkSans,
				mono: ['"JetBrains Mono"', '"SF Mono"', 'Menlo', 'Consolas', 'monospace'],
			},
		},
	},
	plugins: [require("@tailwindcss/typography"), require("daisyui")],
	daisyui: {
		// 两套自定义主题：浅色 paper（暖白纸张）、深色 ink（墨色）。切换逻辑见 BaseLayout.astro。
		themes: [
			{
				paper: {
					"color-scheme": "light",
					"primary": "#2f6f62",
					"primary-content": "#ffffff",
					"secondary": "#b4693a",
					"accent": "#2f6f62",
					"neutral": "#2b2a27",
					"base-100": "#fbfaf7",
					"base-200": "#f3f1ec",
					"base-300": "#e6e2d9",
					"base-content": "#26241f",
					"--rounded-btn": "0.5rem",
					"--rounded-badge": "0.375rem",
				},
			},
			{
				ink: {
					"color-scheme": "dark",
					"primary": "#7cc4b2",
					"primary-content": "#10201c",
					"secondary": "#e0a275",
					"accent": "#7cc4b2",
					"neutral": "#d9d6cf",
					"base-100": "#17181a",
					"base-200": "#1f2124",
					"base-300": "#2c2f33",
					"base-content": "#e4e1da",
					"--rounded-btn": "0.5rem",
					"--rounded-badge": "0.375rem",
				},
			},
		],
		darkTheme: "ink",
		logs: false,
	},
}
