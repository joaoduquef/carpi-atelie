"use client";

import { useEffect, useRef } from "react";

/** Desenho que imita um QR Code. NÃO é um Pix de verdade (o real vem do intermediador na Fase 4). */
export function QrDemo() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const N = 29, t = cv.width / N;
    let s = 7;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280), s / 233280);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = "#3a2228";
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++) {
        const canto = (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
        if (!canto && rnd() > 0.52) ctx.fillRect(x * t, y * t, t, t);
      }
    for (const [x, y] of [[0, 0], [N - 7, 0], [0, N - 7]]) {
      ctx.fillRect(x * t, y * t, 7 * t, 7 * t);
      ctx.fillStyle = "#fff";
      ctx.fillRect((x + 1) * t, (y + 1) * t, 5 * t, 5 * t);
      ctx.fillStyle = "#3a2228";
      ctx.fillRect((x + 2) * t, (y + 2) * t, 3 * t, 3 * t);
    }
  }, []);
  return <canvas ref={ref} width={174} height={174} aria-label="QR Code de exemplo" className="rounded-xl bg-white p-2.5" />;
}
