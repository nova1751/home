// 自定义鼠标（仅在精确指针设备上启用）
interface Point {
  x: number;
  y: number;
}

const OFFSET = 8;
const lerp = (a: number, b: number, n: number) => (Math.round(a) === b ? b : (1 - n) * a + n * b);

const cursorInit = () => {
  if (!window.matchMedia("(pointer: fine)").matches) return () => {};

  const cursor = document.createElement("div");
  cursor.id = "cursor";
  cursor.classList.add("xs-hidden", "hidden");
  document.body.append(cursor);

  const style = document.createElement("style");
  style.innerHTML = `* {cursor: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8' width='10px' height='10px'><circle cx='4' cy='4' r='4' fill='white' /></svg>") 4 4, auto !important}`;
  document.head.append(style);

  let curr: Point | null = null;
  let prev: Point | null = null;
  let frame = 0;

  const move = ({ x, y }: Point) => {
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
  };

  const render = () => {
    frame = 0;
    if (!curr) return;
    if (!prev) {
      prev = { ...curr };
    } else {
      prev.x = lerp(prev.x, curr.x, 0.35);
      prev.y = lerp(prev.y, curr.y, 0.35);
    }
    move(prev);
    if (prev.x !== curr.x || prev.y !== curr.y) frame = requestAnimationFrame(render);
  };

  const onMove = (e: MouseEvent) => {
    curr = { x: e.clientX - OFFSET, y: e.clientY - OFFSET };
    cursor.classList.remove("hidden");
    if (!frame) frame = requestAnimationFrame(render);
  };
  const onEnter = () => cursor.classList.remove("hidden");
  const onLeave = () => cursor.classList.add("hidden");
  const onDown = () => cursor.classList.add("active");
  const onUp = () => cursor.classList.remove("active");

  document.addEventListener("mousemove", onMove, { passive: true });
  document.documentElement.addEventListener("mouseenter", onEnter);
  document.documentElement.addEventListener("mouseleave", onLeave);
  document.addEventListener("mousedown", onDown);
  document.addEventListener("mouseup", onUp);

  return () => {
    cancelAnimationFrame(frame);
    document.removeEventListener("mousemove", onMove);
    document.documentElement.removeEventListener("mouseenter", onEnter);
    document.documentElement.removeEventListener("mouseleave", onLeave);
    document.removeEventListener("mousedown", onDown);
    document.removeEventListener("mouseup", onUp);
    cursor.remove();
    style.remove();
  };
};

export default cursorInit;
