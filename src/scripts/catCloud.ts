/**
 * 首页头像：把猫咪照片采样成 3D 点云（WebGL）。
 * - 照片按网格采样，裁成圆形；z 由球面隆起 + 亮度微调得到，转动时有立体感
 * - 开场粒子从四周聚拢成图；平时缓慢摆动，跟随鼠标倾斜，靠近时粒子被推开
 * - 粒子位移全部在顶点着色器里算，CPU 每帧只更新几个 uniform
 */

const VERT = `
attribute vec3 aPos;
attribute vec3 aStart;
attribute vec3 aColor;
attribute float aRand;
uniform float uTime;
uniform float uIntro;
uniform vec2 uRot;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform float uPointSize;
uniform float uLight;
varying vec3 vColor;
varying float vAlpha;

void main() {
  // 每个粒子开场延迟不同，聚拢更有层次
  float t = clamp(uIntro * 1.4 - aRand * 0.4, 0.0, 1.0);
  t = 1.0 - pow(1.0 - t, 3.0);
  vec3 p = mix(aStart, aPos, t);
  p.z += sin(uTime * 1.3 + aRand * 6.2831) * 0.018;

  float cy = cos(uRot.y), sy = sin(uRot.y);
  p = vec3(cy * p.x + sy * p.z, p.y, -sy * p.x + cy * p.z);
  float cx = cos(uRot.x), sx = sin(uRot.x);
  p = vec3(p.x, cx * p.y - sx * p.z, sx * p.y + cx * p.z);

  float persp = 3.0 / (3.0 - p.z);
  vec2 proj = p.xy * 0.82 * persp;

  // 鼠标附近的粒子被柔和地推开，越近推得越远，并略微放大
  vec2 d = proj - uMouse;
  float dist = length(d);
  float push = uMouseStrength * pow(smoothstep(0.45, 0.0, dist), 2.0);
  proj += d / max(dist, 1e-4) * push * 0.07;

  gl_Position = vec4(proj, 0.0, 1.0);
  gl_PointSize = uPointSize * persp * (0.75 + aRand * 0.4) * (1.0 + push * 0.6);
  // 稍微提高对比度；浅色主题下整体压暗一点，避免和纸色背景糊在一起
  vColor = clamp((aColor - 0.5) * 1.15 + 0.5, 0.0, 1.0) * mix(1.0, 0.85, uLight);
  // 外圈渐隐，轮廓不是生硬的圆
  float edge = smoothstep(1.0, 0.72, length(aPos.xy));
  vAlpha = smoothstep(0.0, 0.25, t) * mix(0.15, 1.0, edge);
}
`;

const FRAG = `
precision mediump float;
varying vec3 vColor;
varying float vAlpha;

void main() {
  float r = length(gl_PointCoord - 0.5);
  if (r > 0.5) discard;
  gl_FragColor = vec4(vColor, vAlpha * smoothstep(0.5, 0.3, r));
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || "shader error");
  return sh;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** 把照片居中裁成正方形后按 grid×grid 采样，只保留圆内的点 */
function samplePhoto(img: HTMLImageElement, grid: number) {
  const c = document.createElement("canvas");
  c.width = c.height = grid;
  const ctx = c.getContext("2d")!;
  const side = Math.min(img.width, img.height);
  ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, grid, grid);
  const data = ctx.getImageData(0, 0, grid, grid).data;

  const pos: number[] = [], start: number[] = [], color: number[] = [], rand: number[] = [];
  for (let y = 0; y < grid; y++) {
    for (let x = 0; x < grid; x++) {
      // 隔行错开半格并加一点随机抖动，避免规整的网格感
      const jitter = () => (Math.random() - 0.5) * 0.6;
      const nx = ((x + (y % 2) * 0.5 + jitter()) / (grid - 1)) * 2 - 1;
      const ny = 1 - ((y + jitter()) / (grid - 1)) * 2;
      const r2 = nx * nx + ny * ny;
      if (r2 > 1) continue;

      const i = (y * grid + x) * 4;
      const [r, g, b] = [data[i] / 255, data[i + 1] / 255, data[i + 2] / 255];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      pos.push(nx, ny, 0.38 * Math.sqrt(1 - r2) + (lum - 0.5) * 0.12);
      color.push(r, g, b);

      // 起点：随机散布在外围的球壳上
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 1.6 + Math.random() * 1.2;
      start.push(radius * Math.sin(phi) * Math.cos(theta), radius * Math.sin(phi) * Math.sin(theta), radius * Math.cos(phi) * 0.5);
      rand.push(Math.random());
    }
  }
  return { pos, start, color, rand, count: rand.length };
}

/** 初始化点云，返回销毁函数；不支持 WebGL 时返回 null（页面保留静态头像） */
export async function mountCatCloud(canvas: HTMLCanvasElement, photoUrl: string, onReady: () => void) {
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: true });
  if (!gl) return null;

  const img = await loadImage(photoUrl);
  const small = window.matchMedia("(max-width: 640px)").matches;
  const cloud = samplePhoto(img, small ? 56 : 84);

  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const attr = (name: string, data: number[], size: number) => {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, name);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
  };
  attr("aPos", cloud.pos, 3);
  attr("aStart", cloud.start, 3);
  attr("aColor", cloud.color, 3);
  attr("aRand", cloud.rand, 1);

  const u = (name: string) => gl.getUniformLocation(prog, name);
  const uTime = u("uTime"), uIntro = u("uIntro"), uRot = u("uRot");
  const uMouse = u("uMouse"), uMouseStrength = u("uMouseStrength"), uPointSize = u("uPointSize");
  const uLight = u("uLight");

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    const { width } = canvas.getBoundingClientRect();
    canvas.width = canvas.height = Math.round(width * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    // 点径略小于点间距，留出缝隙，看得出是一颗颗粒子
    gl.uniform1f(uPointSize, (width / (small ? 56 : 84)) * 0.9 * dpr);
  };
  resize();

  // 鼠标/触摸：位置换算到画布的裁剪空间（-1..1），画布外也用于倾斜
  const pointer = { x: 0, y: 0, inside: false };
  const onPointer = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = 1 - ((e.clientY - r.top) / r.height) * 2;
    pointer.inside = Math.abs(pointer.x) < 1.1 && Math.abs(pointer.y) < 1.1;
  };
  const onLeave = () => (pointer.inside = false);
  // 触摸抬起后没有后续 pointermove，需要主动结束推开效果
  const onPointerEnd = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") onLeave();
  };
  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("pointerup", onPointerEnd, { passive: true });
  window.addEventListener("pointercancel", onPointerEnd, { passive: true });
  document.addEventListener("pointerleave", onLeave);
  window.addEventListener("resize", resize);

  // 滚出视野时暂停
  let visible = true;
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(frame);
  });
  io.observe(canvas);

  const state = { mx: 0, my: 0, strength: 0, tiltX: 0, tiltY: 0 };
  const t0 = performance.now();
  let raf = 0;
  let readyCalled = false;

  function frame(now: number) {
    raf = 0;
    if (!visible) return;
    const t = (now - t0) / 1000;
    const k = 0.08;
    state.mx += (pointer.x - state.mx) * k;
    state.my += (pointer.y - state.my) * k;
    state.strength += ((pointer.inside ? 1 : 0) - state.strength) * 0.06;
    const clamp = (v: number) => Math.max(-1.5, Math.min(1.5, v));
    state.tiltY += (clamp(pointer.x) * 0.35 - state.tiltY) * 0.05;
    state.tiltX += (-clamp(pointer.y) * 0.25 - state.tiltX) * 0.05;

    gl!.clear(gl!.COLOR_BUFFER_BIT);
    gl!.uniform1f(uTime, t);
    gl!.uniform1f(uIntro, Math.min(1, t / 2.2));
    gl!.uniform2f(uRot, Math.sin(t * 0.35) * 0.12 + state.tiltX, Math.sin(t * 0.45) * 0.3 + state.tiltY);
    gl!.uniform2f(uMouse, state.mx, state.my);
    gl!.uniform1f(uMouseStrength, state.strength);
    gl!.uniform1f(uLight, document.documentElement.dataset.theme === "ink" ? 0 : 1);
    gl!.drawArrays(gl!.POINTS, 0, cloud.count);

    if (!readyCalled) {
      readyCalled = true;
      onReady();
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    window.removeEventListener("pointermove", onPointer);
    window.removeEventListener("pointerup", onPointerEnd);
    window.removeEventListener("pointercancel", onPointerEnd);
    document.removeEventListener("pointerleave", onLeave);
    window.removeEventListener("resize", resize);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };
}
