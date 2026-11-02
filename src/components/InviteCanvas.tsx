import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { TextField } from "@/data/invites";

export const W = 768;
export const H = 1344;

export type InviteCanvasHandle = { canvas: HTMLCanvasElement | null };

function drawText(ctx: CanvasRenderingContext2D, f: TextField) {
  let size = (f.size / 100) * W;
  const maxW = (f.maxW / 100) * W;
  const font = () => `${f.weight ?? 400} ${size}px "${f.font}"`;
  ctx.font = font();
  while (ctx.measureText(f.value).width > maxW && size > 8) {
    size -= 1;
    ctx.font = font();
  }
  const x = (f.x / 100) * W;
  const y = (f.y / 100) * H;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  if (f.shadow) {
    ctx.shadowColor = f.shadow;
    ctx.shadowBlur = size * 0.25;
    ctx.shadowOffsetY = size * 0.06;
  }
  if (f.stroke) {
    ctx.strokeStyle = f.stroke;
    ctx.lineWidth = ((f.strokeW ?? 1) / 100) * W * 2;
    ctx.strokeText(f.value, x, y);
  }
  ctx.fillStyle = f.color;
  ctx.fillText(f.value, x, y);
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

type Props = { image: string; video?: string; fields: TextField[] };

export const InviteCanvas = forwardRef<InviteCanvasHandle, Props>(function InviteCanvas(
  { image, video, fields },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const vidRef = useRef<HTMLVideoElement | null>(null);
  const fieldsRef = useRef(fields);
  fieldsRef.current = fields;
  useImperativeHandle(ref, () => ({ get canvas() { return canvasRef.current; } }));

  const render = () => {
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const v = vidRef.current;
    const src = v && v.readyState >= 2 ? v : imgRef.current;
    ctx.clearRect(0, 0, W, H);
    if (src) ctx.drawImage(src, 0, 0, W, H);
    fieldsRef.current.forEach((f) => drawText(ctx, f));
  };

  useEffect(() => {
    let raf = 0;
    let alive = true;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image;
    img.onload = render;
    imgRef.current = img;
    const fonts = Array.from(new Set(fieldsRef.current.map((f) => `${f.weight ?? 400} 40px "${f.font}"`)));
    Promise.all(fonts.map((f) => document.fonts.load(f))).then(() => alive && render());
    if (video) {
      const v = document.createElement("video");
      v.src = video;
      v.crossOrigin = "anonymous";
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.play().catch(() => {});
      vidRef.current = v;
      const loop = () => {
        render();
        raf = requestAnimationFrame(loop);
      };
      loop();
    }
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      vidRef.current?.pause();
      vidRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, video]);

  useEffect(() => {
    if (!video) render();
  });

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="h-auto w-full rounded-lg shadow-[var(--shadow-elegant)]"
    />
  );
});
