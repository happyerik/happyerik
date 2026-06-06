# Astrofy 项目深度架构解析（前端新手版）

> 本文用**最通俗的语言**，带你从零理解这个基于 Astro 的个人作品集网站是如何运作的。即使你刚接触前端，也能看懂每个模块的职责和协作方式。

---

## 一、项目是什么？能做什么？

**Astrofy** 是一个"开箱即用"的个人作品集网站模板。你可以把它想象成一个**已经装修好的样板房**——你不需要从零砌墙、铺地板，只需要换掉家具（文字、图片），就能快速拥有自己的博客+简历+作品展示站。

### 它包含哪些"房间"（页面功能）？

| 页面 | 用途 | 数据来源 |
|------|------|----------|
| 首页 (`/`) | 自我介绍 + 最新博客预览 | 混合（硬编码 + Markdown） |
| 博客 (`/blog`) | 文章列表，支持翻页 | Markdown 文件 |
| 博客详情 (`/blog/xxx`) | 单篇文章阅读 | Markdown 文件 |
| 标签页 (`/blog/tag/xxx`) | 按标签筛选文章 | Markdown 文件 |
| 项目 (`/projects`) | 作品展示 | 硬编码 |
| 服务 (`/services`) | 提供的服务列表 | 硬编码 |
| 商店 (`/store`) | 商品/服务售卖列表 | Markdown 文件 |
| 简历 (`/cv`) | 个人履历时间线 | 硬编码 |
| RSS (`/rss.xml`) | 供阅读器订阅的feed | Markdown 文件 |

---

## 二、核心技术栈（先认识"工具"）

在深入了解代码前，先认识项目用到的"工具箱"：

### 1. Astro —— 网站的"骨架工程师"
Astro 是一个**静态网站生成器**。你可以这样理解：
- 传统网站：用户每次访问，服务器都要"现场组装"页面（就像现场炒菜）
- Astro：开发时就把所有页面**提前预渲染成 HTML 文件**（就像提前做好便当），用户访问时直接拿走，速度极快
- 特别适合：博客、文档、作品集等**内容为主**的网站

### 2. TailwindCSS —— "原子化"化妆师
传统 CSS 写法：
```css
.card { padding: 16px; background: white; border-radius: 8px; }
```
Tailwind 写法：
```html
<div class="p-4 bg-white rounded-lg">...</div>
```
**好处**：不用写 CSS 文件，直接在 HTML 上"拼类名"，开发速度极快，而且不用担心类名冲突。

### 3. DaisyUI —— Tailwind 的"预制件库"
Tailwind 只提供"原子"（padding、color、font-size），DaisyUI 提供"组件"：
- `btn` = 已经调好的按钮样式
- `card` = 已经调好的卡片样式
- `badge` = 标签徽章
- `drawer` = 侧边抽屉菜单

这样你不需要自己设计按钮长什么样，直接用就行。

### 4. Markdown + Content Collections —— "内容仓库"
博客文章、商店商品都写在 Markdown 文件里（就是带 `---`  frontmatter 头部的纯文本）。Astro 会自动把这些 Markdown "编译"成网页。

---

## 三、项目整体结构（文件地图）

把项目想象成一家餐厅，不同区域负责不同工作：

```
astrofy/
├── public/                    # "仓库" — 存放原封不动搬到网站的素材
│   ├── favicon.svg            # 网站图标
│   ├── profile.webp           # 头像
│   └── robots.txt             # 告诉搜索引擎怎么爬取
│
├── src/
│   ├── components/            # "乐高积木" — 可复用的页面零件
│   │   ├── Header.astro       # 顶部导航栏（手机版可见）
│   │   ├── SideBar.astro      # 左侧边栏（头像+菜单）
│   │   ├── HorizontalCard.astro   # 横向卡片（文章/项目列表用）
│   │   └── ...
│   │
│   ├── content/               # "内容仓库" — Markdown 文章和商品
│   │   ├── blog/              # 博客文章（.md 文件）
│   │   ├── store/             # 商店商品（.md 文件）
│   │   └── config.ts          # 内容"安检规则"（Zod 校验）
│   │
│   ├── layouts/               # "房间模板" — 页面的整体框架
│   │   ├── BaseLayout.astro   # 最外层模板（HTML骨架+侧边栏+头部）
│   │   ├── PostLayout.astro   # 博客文章专用模板
│   │   └── StoreItemLayout.astro  # 商品详情专用模板
│   │
│   ├── pages/                 # "路由地图" — 一个文件 = 一个网页地址
│   │   ├── index.astro        # 首页（对应 /）
│   │   ├── blog/              # 博客相关路由
│   │   ├── store/             # 商店相关路由
│   │   └── rss.xml.js         # RSS 订阅源
│   │
│   ├── lib/                   # "工具箱" — 辅助函数
│   │   └── createSlug.ts      # 把标题转成 URL 友好的字符串
│   │
│   ├── styles/
│   │   └── global.css         # 少量全局样式修补
│   │
│   └── config.ts              # "全局配置" — 网站标题、描述等常量
│
├── astro.config.mjs           # Astro 的核心配置
├── tailwind.config.cjs        # Tailwind + DaisyUI 配置
└── package.json               # 项目依赖清单
```

---

## 四、核心模块详解

### 模块 1：配置系统 —— 网站的"身份证"

**文件**：`src/config.ts`

```typescript
export const SITE_TITLE = 'Astrofy | Personal Portfolio Website Template';
export const SITE_DESCRIPTION = '...';
export const GENERATE_SLUG_FROM_TITLE = true;  // 用文章标题生成网址
export const TRANSITION_API = true;            // 开启页面切换动画
```

**新手理解**：这就像网站的"身份证信息"。如果你想把网站标题从 "Astrofy" 改成 "我的个人站"，只需要改这里一处，全站都会同步更新。

`GENERATE_SLUG_FROM_TITLE` 是什么？比如你的文章标题是 "Hello World"，开启后网址会自动变成 `/blog/hello-world`，而不是用文件名。

---

### 模块 2：内容集合（Content Collections）— 博客/商品的"安检+仓库"

**文件**：`src/content/config.ts`

这是整个项目**最聪明的设计之一**。它做两件事：

#### ① 定义"内容长什么样"（Zod 校验）

```typescript
const blogSchema = z.object({
    title: z.string(),              // 标题必须是字符串
    description: z.string(),        // 描述必须是字符串
    pubDate: z.coerce.date(),       // 发布日期必须是日期
    heroImage: z.string().optional(), // 封面图可选
    tags: z.array(z.string()).optional(), // 标签数组可选
});
```

**通俗解释**：这就像是仓库的"入库检查单"。每篇博客文章（Markdown）顶部都有 frontmatter：

```markdown
---
title: "Demo Post 1"
description: "..."
pubDate: "Sep 10 2022"
heroImage: "/post_img.webp"
tags: ["tokio"]
---
```

如果有人把 `pubDate` 写成 `"明天"`，Zod 会在**编译时**就报错："日期格式不对！"，而不是让用户在网页上看到奇怪的错误。

#### ② 注册集合

```typescript
export const collections = {
    'blog': blogCollection,
    'store': storeCollection
};
```

注册后，Astro 就知道：`src/content/blog/` 下的所有 `.md` 文件都是"博客"，可以用 `getCollection("blog")` 一次性取出来。

---

### 模块 3：页面路由系统 —— "网址→文件"的自动映射

Astro 采用**文件即路由**（File-based Routing）机制。你不需要手动配置路由表，文件放在哪，网址就是什么。

#### 普通页面（固定网址）

| 文件路径 | 访问网址 | 说明 |
|---------|---------|------|
| `src/pages/index.astro` | `/` | 首页 |
| `src/pages/cv.astro` | `/cv` | 简历页 |
| `src/pages/projects.astro` | `/projects` | 项目展示 |

#### 动态路由（网址带变量）

**博客列表分页**：`src/pages/blog/[...page].astro`

```astro
---
export async function getStaticPaths({ paginate }) {
  const posts = await getCollection("blog");
  posts.sort((a, b) => b.data.pubDate - a.data.pubDate);
  return paginate(posts, { pageSize: 10 });  // 每页10篇
}
const { page } = Astro.props;
---
```

**通俗解释**：
- `[...page]` 中的方括号表示"这是动态部分"
- `getStaticPaths` 是 Astro 在**编译时**执行的函数，它会预先算出所有可能的页面
- `paginate` 是 Astro 自带的分页助手：如果博客有 25 篇，它会自动创建：
  - `/blog/` （第1页，显示前10篇）
  - `/blog/2/` （第2页，显示11-20篇）
  - `/blog/3/` （第3页，显示21-25篇）

**博客详情页**：`src/pages/blog/[slug].astro`

```astro
---
export async function getStaticPaths() {
  const posts = await getCollection("blog");
  return posts.map((post) => ({
    params: { slug: createSlug(post.data.title, post.slug) },
    props: { entry: post },
  }));
}
---
```

**通俗解释**：编译时，Astro 会遍历所有博客文章，为每篇生成一个独立页面。如果博客有 5 篇文章，就会生成 5 个 HTML 文件。

**标签筛选页**：`src/pages/blog/tag/[tag]/[...page].astro`

这是**嵌套动态路由**的典范：
1. 先提取所有文章的所有标签（去重）
2. 对每个标签，筛选出包含该标签的文章
3. 对这些筛选结果再做分页

最终生成如 `/blog/tag/tokio/`、`/blog/tag/astro/` 等页面。

---

### 模块 4：布局系统（Layouts）— 页面的"精装修模板"

#### BaseLayout —— 所有页面的"毛坯房框架"

**文件**：`src/layouts/BaseLayout.astro`

```astro
---
import BaseHead from "../components/BaseHead.astro";
import Header from "../components/Header.astro";
import Footer from "../components/Footer.astro";
import SideBar from "../components/SideBar.astro";
---

<!doctype html>
<html lang="en" data-theme="lofi">
  <head>
    <BaseHead ... />
  </head>
  <body>
    <div class="bg-base-100 drawer lg:drawer-open">
      <!-- 手机版：点击汉堡菜单展开侧边栏 -->
      <input id="my-drawer" type="checkbox" class="drawer-toggle" />
      
      <div class="drawer-content">
        <Header />           <!-- 手机顶部导航 -->
        <main>
          <slot />           <!-- 这里会被具体页面内容替换 -->
        </main>
        <Footer />
      </div>
      
      <SideBar />            <!-- 左侧边栏（桌面常驻/手机抽屉） -->
    </div>
  </body>
</html>
```

**通俗解释**：
- `BaseLayout` 就像是所有房间的"户型框架"——每间房都有四面墙、一扇门、一扇窗
- `<slot />` 是一个**占位符**，具体页面（如 `cv.astro`）写的内容会插到这里
- `data-theme="lofi"` 是 DaisyUI 的主题设定，控制整站配色风格
- `drawer lg:drawer-open` 是响应式布局：大屏幕自动展开侧边栏，小屏幕隐藏为抽屉菜单

#### PostLayout —— 博客文章的"精装房"

**文件**：`src/layouts/PostLayout.astro`

它**继承**自 `BaseLayout`，并在 `<slot />` 位置填充了博客专属结构：

```astro
<BaseLayout title={title} description={description}>
  <article class="prose prose-lg">
    {heroImage && <Image src={heroImage} ... />}
    <h1>{title}</h1>
    <time>{displayDate}</time>
    {badge && <div class="badge">{badge}</div>}
    {tags.map(tag => <a href={`/blog/tag/${tag}`}>{tag}</a>)}
    <div class="divider"></div>
    <slot />    <!-- 这里插入 Markdown 渲染后的正文 -->
  </article>
</BaseLayout>
```

**通俗解释**：博客文章页不是一张白纸，而是已经摆好了"标题区、封面图、日期、标签、分割线"，正文内容自动填充到中间。

---

### 模块 5：组件系统 —— 可复用的"乐高积木"

#### HorizontalCard —— 万能横向卡片

**文件**：`src/components/HorizontalCard.astro`

这是项目里**使用频率最高**的组件。博客列表、项目列表、服务列表都用它。

```astro
---
const { title, img, desc, url, badge, tags } = Astro.props;
---

<div class="rounded-lg bg-base-100 hover:shadow-xl hover:scale-[102%]">
  <a href={url}>
    <div class="hero-content flex-col md:flex-row">
      {img && <Image src={img} ... class="max-w-[13rem] rounded-lg" />}
      <div class="grow">
        <h1 class="text-xl font-bold">
          {title}
          {badge && <div class="badge badge-secondary">{badge}</div>}
        </h1>
        <p>{desc}</p>
        <div class="card-actions justify-end">
          {tags?.map(tag => <span class="badge badge-outline">{tag}</span>)}
        </div>
      </div>
    </div>
  </a>
</div>
```

**新手看这里**：
- `Astro.props` 是**父页面传进来的参数**，就像给积木贴上不同的贴纸
- `hover:shadow-xl hover:scale-[102%]` 是 Tailwind 的**交互效果**：鼠标悬停时阴影变大、整体微微放大
- `flex-col md:flex-row` 是**响应式**：手机屏幕上图在上文在下，桌面屏幕图文并排

#### SideBarMenu —— 侧边栏导航

**文件**：`src/components/SideBarMenu.astro`

```astro
<ul class="menu">
  <li><a id="home" href="/">Home</a></li>
  <li><a id="projects" href="/projects">Projects</a></li>
  <li><a id="services" href="/services">Services</a></li>
  <!-- ... -->
</ul>

<script define:vars={{ sideBarActiveItemID, activeClass }}>
  const activeItemElem = document.getElementById(sideBarActiveItemID);
  activeItemElem && activeItemElem.classList.add(activeClass);
</script>
```

**通俗解释**：
- 每个菜单项有一个 `id`（如 `home`、`projects`）
- 页面通过 `sideBarActiveItemID` 告诉菜单："我现在在 Projects 页面"
- 底部的 `<script>` 会在浏览器中执行，给当前页面对应的菜单项加上高亮背景色 (`bg-base-300`)
- `define:vars` 是 Astro 的特殊语法，把服务器端的变量"注入"到客户端脚本中

---

### 模块 6：样式方案 —— Tailwind + DaisyUI 如何协作

**文件**：`tailwind.config.cjs`

```javascript
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  plugins: [
    require("@tailwindcss/typography"),  // 文章排版美化
    require("daisyui")                   // UI 组件预制件
  ],
  daisyui: {
    themes: true,      // 启用所有主题
    darkTheme: "dark", // 暗黑模式主题名
    logs: false,
  }
}
```

#### 类名速查表（常用）

| 类名 | 作用 | 来源 |
|------|------|------|
| `bg-base-100` | 页面主背景色 | DaisyUI 主题变量 |
| `bg-base-200` | 次级背景色（侧边栏） | DaisyUI 主题变量 |
| `text-base-content` | 主文字颜色 | DaisyUI 主题变量 |
| `btn` / `btn-primary` / `btn-outline` | 按钮样式 | DaisyUI |
| `badge` / `badge-secondary` | 徽章标签 | DaisyUI |
| `drawer` / `drawer-overlay` | 抽屉菜单 | DaisyUI |
| `prose` / `prose-lg` | 文章排版（自动美化 h1/h2/p/ul 等） | @tailwindcss/typography |
| `p-4` / `m-2` / `mb-5` | padding / margin | Tailwind |
| `flex` / `flex-col` / `justify-center` | Flexbox 布局 | Tailwind |
| `lg:max-w-[900px]` | 大屏时最大宽度 900px | Tailwind 响应式前缀 |
| `hover:scale-[102%]` | 悬停时放大 2% | Tailwind 状态变体 |

**通俗解释**：
- DaisyUI 的 `base-100`、`base-200` 等不是固定颜色，而是**主题变量**。换成其他主题时，这些值会自动改变，实现"一键换肤"
- `prose` 是文章排版的"魔法类名"：它会自动给 `<h1>` `<p>` `<ul>` 等标签加上合适的间距、字号、行高，让文章可读性大幅提升

---

### 模块 7：图片处理 —— `astro:assets` 自动优化

项目中所有图片都使用 Astro 的 `<Image />` 组件：

```astro
import { Image } from "astro:assets";

<Image 
  width={750} 
  height={422} 
  format="webp" 
  src={heroImage} 
  alt={title} 
/>
```

**通俗解释**：
- 普通 `<img>` 标签就是原封不动地把图片发给用户
- Astro 的 `<Image />` 会在**编译时**自动：
  1. 把图片转成 `webp` 格式（体积更小）
  2. 按指定尺寸生成多版本
  3. 在 HTML 中插入合适的 `srcset`，让浏览器根据屏幕大小选择合适版本
- 这对提升网页加载速度非常重要，尤其是手机用户

---

### 模块 8：Slug 生成器 —— 友好的网址翻译官

**文件**：`src/lib/createSlug.ts`

```typescript
export default function (title: string, staticSlug: string) {
  return (!GENERATE_SLUG_FROM_TITLE) 
    ? staticSlug 
    : title
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')      // 空格变连字符
        .replace(/[^\w-]/g, '')    // 移除特殊字符
        .replace(/^-+|-+$/g, '');  // 去掉首尾连字符
}
```

**举例**：
- 标题：`"Hello World! My First Post"`
- 生成的 slug：`"hello-world-my-first-post"`
- 最终网址：`/blog/hello-world-my-first-post`

**为什么不用中文做网址？** 因为 URL 中的中文会被浏览器编码成 `%E4%BD%A0%E5%A5%BD` 这种乱码，分享和记忆都不方便。

---

### 模块 9：RSS 订阅 —— 让阅读器能"追更"

**文件**：`src/pages/rss.xml.js`

```javascript
export async function get(context) {
  const blog = await getCollection("blog");
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: import.meta.env.SITE,
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
    })),
  });
}
```

**通俗解释**：RSS 是一种"内容订阅协议"。用户把 `/rss.xml` 地址添加到 RSS 阅读器（如 Feedly）后，每次你发新博客，阅读器会自动提醒用户。这个文件会在编译时生成一个标准的 XML 文件。

---

## 五、数据流全景图（从文件到网页）

以访问一篇博客文章为例，数据是怎么流动的？

```
1. 你写的内容
   src/content/blog/post1.md
   └── frontmatter (标题/日期/标签) + Markdown 正文

2. Astro 编译时
   └── Content Collection 读取 + Zod 校验
   └── getStaticPaths() 为每篇文章生成路由参数
   └── Markdown → HTML 转换
   └── Image 组件 → 图片压缩/转 webp

3. 页面组装
   [slug].astro 接收 entry → 提取数据
   └── PostLayout 包裹（加标题/日期/封面/标签）
       └── BaseLayout 再包裹（加 HTML 骨架/侧边栏/头部/底部）

4. 最终输出
   dist/blog/hello-world/index.html  （纯静态文件）
```

---

## 六、响应式设计 —— 一套代码，适配手机+平板+电脑

项目采用**移动优先**（Mobile First）策略，关键断点由 Tailwind 的 `lg:` 前缀控制：

```astro
<!-- 默认（手机）：flex-col 纵向排列，w-full 全宽 -->
<!-- lg（≥1024px，桌面）：flex-row 横向排列，max-w-[900px] 限制最大宽度 -->
<div class="md:flex md:justify-center">
  <main class="p-6 pt-10 lg:max-w-[900px] max-w-[100vw]">
    ...
  </main>
</div>
```

**侧边栏的"变形术"**：
- 桌面端（`lg:drawer-open`）：侧边栏始终展开，像传统后台管理界面
- 手机端（`drawer`）：侧边栏隐藏，顶部出现汉堡菜单按钮，点击后像抽屉一样滑出

---

## 七、给新手的改站指南

如果你想基于这个模板做自己的网站，建议按这个顺序修改：

### Step 1：改全局信息
- `src/config.ts` — 网站标题、描述
- `src/components/Header.astro` — 顶部导航栏的名字
- `src/components/SideBar.astro` — 头像图片路径
- `src/components/SideBarFooter.astro` — 社交链接改成你的

### Step 2：写内容
- 博客：在 `src/content/blog/` 下新建 `.md` 文件，参照 frontmatter 格式
- 商店：在 `src/content/store/` 下新建 `.md` 文件
- 简历：直接编辑 `src/pages/cv.astro`
- 项目/服务：直接编辑对应 `.astro` 文件

### Step 3：换主题色
- `src/layouts/BaseLayout.astro` 中把 `data-theme="lofi"` 换成其他 DaisyUI 主题（如 `cupcake`、`cyberpunk`、`dark`）

### Step 4：构建部署
```bash
pnpm install      # 安装依赖（第一次）
pnpm run dev      # 本地预览
pnpm run build    # 生成 dist/ 文件夹
dist/ 里的内容可以上传到任何静态托管平台（Vercel/Netlify/GitHub Pages）
```

---

## 八、总结：这个项目教会我们什么？

| 知识点 | 体现位置 |
|--------|----------|
| **静态网站生成** | Astro 编译时预渲染所有页面 |
| **组件化思维** | 复用 HorizontalCard、TimeLine 等组件 |
| **类型安全** | TypeScript + Zod 校验内容数据 |
| **内容驱动** | Markdown + Content Collections 分离内容与样式 |
| **响应式布局** | Tailwind 的断点前缀 + DaisyUI 的 drawer |
| **SEO 友好** | BaseHead 自动输出 OG/Twitter Card 元数据 |
| **性能优化** | Image 组件自动压缩，SSG 输出纯 HTML |

---

> 如果你读到这里，应该已经能看懂这个项目的每一行代码在做什么了。剩下的就是动手改、动手试——这是学习前端最高效的方式。祝你改站愉快！
