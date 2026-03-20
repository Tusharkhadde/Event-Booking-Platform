"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface LaserPrecisionProps {
  className?: string;
  heroCenterX?: number;
  heroCenterY?: number;
  heroScale?: number;
}

export function LaserPrecision({ className, heroCenterX = 0.5, heroCenterY = 0.5, heroScale = 1.0 }: LaserPrecisionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Tunable parameters
    const DRAW_SPEED = 1.0;
    const BRIGHTNESS = 1.0;

    let width: number, height: number, dpr: number, cx: number, cy: number, minDim: number;
    let HERO_CENTER_X = heroCenterX;
    let HERO_CENTER_Y = heroCenterY;
    let HERO_SCALE = heroScale;

    // Offscreen burn layer
    const burnCanvas = document.createElement("canvas");
    const burnCtx = burnCanvas.getContext("2d");

    // Offscreen heat distortion layer
    const heatCanvas = document.createElement("canvas");
    const heatCtx = heatCanvas.getContext("2d");

    if (!burnCtx || !heatCtx) return;

    function resize() {
      if (!canvas || !burnCanvas || !heatCanvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);

      burnCanvas.width = Math.round(width * dpr);
      burnCanvas.height = Math.round(height * dpr);
      burnCtx?.setTransform(dpr, 0, 0, dpr, 0, 0);

      heatCanvas.width = Math.round(width * dpr);
      heatCanvas.height = Math.round(height * dpr);
      heatCtx?.setTransform(dpr, 0, 0, dpr, 0, 0);

      cx = HERO_SCALE > 0 ? width * HERO_CENTER_X : width / 2;
      cy = HERO_SCALE > 0 ? height * HERO_CENTER_Y : height / 2;
      minDim = Math.min(width, height);
    }

    window.addEventListener("resize", resize);
    resize();

    // Shape definitions
    function makeCircle(centerX: number, centerY: number, radius: number, segments: number) {
      const pts = [];
      for (let i = 0; i <= segments; i++) {
        const a = (i / segments) * Math.PI * 2 - Math.PI / 2;
        pts.push({ x: centerX + Math.cos(a) * radius, y: centerY + Math.sin(a) * radius });
      }
      return pts;
    }

    function makePolygon(centerX: number, centerY: number, radius: number, sides: number, rotation: number) {
      const pts = [];
      for (let i = 0; i <= sides; i++) {
        const a = (i / sides) * Math.PI * 2 + (rotation || 0);
        pts.push({ x: centerX + Math.cos(a) * radius, y: centerY + Math.sin(a) * radius });
      }
      return pts;
    }

    function makeStar(centerX: number, centerY: number, outerR: number, innerR: number, points: number, rotation: number) {
      const pts = [];
      const total = points * 2;
      for (let i = 0; i <= total; i++) {
        const a = (i / total) * Math.PI * 2 + (rotation || 0) - Math.PI / 2;
        const r = i % 2 === 0 ? outerR : innerR;
        pts.push({ x: centerX + Math.cos(a) * r, y: centerY + Math.sin(a) * r });
      }
      return pts;
    }

    function makeDiamond(centerX: number, centerY: number, w: number, h: number) {
      return [
        { x: centerX, y: centerY - h },
        { x: centerX + w, y: centerY },
        { x: centerX, y: centerY + h },
        { x: centerX - w, y: centerY },
        { x: centerX, y: centerY - h },
      ];
    }

    function makeSpiral(centerX: number, centerY: number, maxR: number, turns: number, segments: number) {
      const pts = [];
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const a = t * turns * Math.PI * 2 - Math.PI / 2;
        const r = t * maxR;
        pts.push({ x: centerX + Math.cos(a) * r, y: centerY + Math.sin(a) * r });
      }
      return pts;
    }

    let shapeIndex = 0;
    function generateShapeSet() {
      let scale = minDim * 0.45;
      if (HERO_SCALE > 0) scale *= HERO_SCALE;
      const set = [];

      // Generate nested hexagons to match the industrial/generative shader look
      set.push(makePolygon(cx, cy, scale * 0.9, 6, -Math.PI / 6)); // Outer hexagon
      set.push(makePolygon(cx, cy, scale * 0.7, 6, -Math.PI / 6)); // Middle hexagon
      set.push(makePolygon(cx, cy, scale * 0.5, 6, -Math.PI / 6)); // Inner hexagon
      set.push(makeCircle(cx, cy, scale * 0.8, 48)); // Connecting circle track

      shapeIndex++;
      return set;
    }

    let lasers: Laser[] = [];
    let sparks: any[] = [];
    let smokeParticles: any[] = [];
    let phase = "drawing";
    let phaseTimer = 0;
    let globalTime = 0;
    const HOLD_TIME = 2.5;
    const FADE_TIME = 1.8;
    let fadeAlpha = 1;
    const HOT_ZONE = 120;

    class Laser {
      points: { x: number; y: number }[];
      totalLength: number;
      segLengths: number[];
      drawnLength: number;
      speed: number;
      done: boolean;
      tipX: number;
      tipY: number;
      prevTipX: number;
      prevTipY: number;

      constructor(polyline: { x: number; y: number }[]) {
        this.points = polyline;
        this.totalLength = 0;
        this.segLengths = [];

        for (let i = 1; i < polyline.length; i++) {
          const dx = polyline[i].x - polyline[i - 1].x;
          const dy = polyline[i].y - polyline[i - 1].y;
          const len = Math.sqrt(dx * dx + dy * dy);
          this.segLengths.push(len);
          this.totalLength += len;
        }

        this.drawnLength = 0;
        this.speed = (180 + Math.random() * 120) * DRAW_SPEED;
        this.done = false;
        this.tipX = polyline[0].x;
        this.tipY = polyline[0].y;
        this.prevTipX = polyline[0].x;
        this.prevTipY = polyline[0].y;
      }

      posAt(dist: number) {
        let d = 0;
        for (let i = 0; i < this.segLengths.length; i++) {
          if (d + this.segLengths[i] >= dist) {
            const t = this.segLengths[i] > 0 ? (dist - d) / this.segLengths[i] : 0;
            const p0 = this.points[i];
            const p1 = this.points[i + 1];
            return { x: p0.x + (p1.x - p0.x) * t, y: p0.y + (p1.y - p0.y) * t };
          }
          d += this.segLengths[i];
        }
        const last = this.points[this.points.length - 1];
        return { x: last.x, y: last.y };
      }

      update(dt: number) {
        if (this.done) return;

        this.prevTipX = this.tipX;
        this.prevTipY = this.tipY;

        this.drawnLength += this.speed * dt;

        if (this.drawnLength >= this.totalLength) {
          this.drawnLength = this.totalLength;
          this.done = true;
        }

        const tip = this.posAt(this.drawnLength);
        this.tipX = tip.x;
        this.tipY = tip.y;

        burnScorch(this.prevTipX, this.prevTipY, this.tipX, this.tipY);

        if (Math.random() < 0.85) emitSparks(tip.x, tip.y, 2 + Math.floor(Math.random() * 4));
        if (Math.random() < 0.6) emitSmoke(tip.x, tip.y, 1 + Math.floor(Math.random() * 2));

        if (this.done) {
          emitSparks(tip.x, tip.y, 25);
          emitSmoke(tip.x, tip.y, 8);
        }
      }
    }

    function burnScorch(x1: number, y1: number, x2: number, y2: number) {
      if (!burnCtx) return;
      burnCtx.lineCap = "round";

      burnCtx.beginPath();
      burnCtx.moveTo(x1, y1);
      burnCtx.lineTo(x2, y2);
      burnCtx.strokeStyle = "rgba(10, 20, 15, 0.6)";
      burnCtx.lineWidth = 5;
      burnCtx.stroke();

      burnCtx.beginPath();
      burnCtx.moveTo(x1, y1);
      burnCtx.lineTo(x2, y2);
      burnCtx.strokeStyle = "rgba(15, 30, 22, 0.4)";
      burnCtx.lineWidth = 3;
      burnCtx.stroke();
    }

    function emitSparks(x: number, y: number, count: number) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 80 + Math.random() * 280;
        const life = 0.2 + Math.random() * 0.8;
        sparks.push({
          x: x + (Math.random() - 0.5) * 4,
          y: y + (Math.random() - 0.5) * 4,
          vx: Math.cos(angle) * speed * (0.5 + Math.random() * 0.5),
          vy: Math.sin(angle) * speed * (0.5 + Math.random() * 0.5),
          life: life,
          maxLife: life,
          size: 0.5 + Math.random() * 2.5,
          bright: Math.random() > 0.3,
        });
      }
    }

    function updateSparks(dt: number) {
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vx *= 0.96;
        s.vy *= 0.96;
        s.vy += 180 * dt;
        s.life -= dt;
        if (s.life <= 0) sparks.splice(i, 1);
      }
    }

    function drawSparks() {
      if (!ctx) return;
      for (let i = 0; i < sparks.length; i++) {
        const s = sparks[i];
        const t = s.life / s.maxLife;
        const alpha = t * BRIGHTNESS * fadeAlpha;
        const r = s.size * (0.3 + t * 0.7);

        const trailLen = Math.sqrt(s.vx * s.vx + s.vy * s.vy) * 0.015;
        if (trailLen > 1) {
          const nx = s.vx / (trailLen / 0.015);
          const ny = s.vy / (trailLen / 0.015);
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x - nx * trailLen, s.y - ny * trailLen);
          ctx.strokeStyle = s.bright
            ? "rgba(255, 255, 255, " + (alpha * 0.6).toFixed(4) + ")"
            : "rgba(52, 211, 153, " + (alpha * 0.5).toFixed(4) + ")"; // Emerald bright
          ctx.lineWidth = r * 0.7;
          ctx.lineCap = "round";
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fillStyle = s.bright
          ? "rgba(255, 255, 255, " + (alpha * 0.95).toFixed(4) + ")"
          : "rgba(52, 211, 153, " + (alpha * 0.9).toFixed(4) + ")"; // Emerald core
        ctx.fill();

        ctx.beginPath();
        ctx.arc(s.x, s.y, r * 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(36, 174, 124, " + (alpha * 0.15).toFixed(4) + ")"; // Emerald glow
        ctx.fill();
      }
    }

    function emitSmoke(x: number, y: number, count: number) {
      for (let i = 0; i < count; i++) {
        smokeParticles.push({
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 4,
          vx: (Math.random() - 0.5) * 20,
          vy: -(15 + Math.random() * 40),
          life: 0.8 + Math.random() * 1.5,
          maxLife: 0.8 + Math.random() * 1.5,
          size: 4 + Math.random() * 12,
          growRate: 8 + Math.random() * 16,
          opacity: 0.06 + Math.random() * 0.1,
        });
      }
    }

    function updateSmoke(dt: number) {
      for (let i = smokeParticles.length - 1; i >= 0; i--) {
        const s = smokeParticles[i];
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vx += (Math.random() - 0.5) * 10 * dt;
        s.vx *= 0.98;
        s.vy *= 0.985;
        s.size += s.growRate * dt;
        s.life -= dt;
        if (s.life <= 0) smokeParticles.splice(i, 1);
      }
    }

    function drawSmoke() {
      if (!ctx) return;
      for (let i = 0; i < smokeParticles.length; i++) {
        const s = smokeParticles[i];
        const t = s.life / s.maxLife;
        const fadeIn = Math.min(1, (1 - t) * 5);
        const fadeOut = t;
        const alpha = fadeIn * fadeOut * s.opacity * BRIGHTNESS * fadeAlpha;

        if (alpha < 0.002) continue;

        const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size);
        const warmth = t * 0.5;
        // Emerald tinted smoke
        const r = Math.round(30 + warmth * 40);
        const g = Math.round(90 + warmth * 80);
        const b = Math.round(70 + warmth * 60);

        grad.addColorStop(0, "rgba(" + r + ", " + g + ", " + b + ", " + (alpha * 0.8).toFixed(4) + ")");
        grad.addColorStop(0.5, "rgba(" + r + ", " + g + ", " + b + ", " + (alpha * 0.3).toFixed(4) + ")");
        grad.addColorStop(1, "rgba(" + r + ", " + g + ", " + b + ", 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawActiveBeam(laser: Laser) {
      if (!ctx) return;
      if (laser.drawnLength <= 0 || laser.done) return;

      const b = BRIGHTNESS * fadeAlpha;
      const hotStart = Math.max(0, laser.drawnLength - HOT_ZONE);
      const hotPath = [];
      let d = 0;

      for (let i = 0; i < laser.segLengths.length; i++) {
        const segEnd = d + laser.segLengths[i];
        if (segEnd <= hotStart) {
          d = segEnd;
          continue;
        }
        if (d >= laser.drawnLength) break;

        const clippedStart = Math.max(d, hotStart);
        const clippedEnd = Math.min(segEnd, laser.drawnLength);

        const t0 = laser.segLengths[i] > 0 ? (clippedStart - d) / laser.segLengths[i] : 0;
        const t1 = laser.segLengths[i] > 0 ? (clippedEnd - d) / laser.segLengths[i] : 0;

        const p0 = laser.points[i];
        const p1 = laser.points[i + 1];

        if (hotPath.length === 0) {
          hotPath.push({
            x: p0.x + (p1.x - p0.x) * t0,
            y: p0.y + (p1.y - p0.y) * t0,
            dist: clippedStart,
          });
        }
        hotPath.push({
          x: p0.x + (p1.x - p0.x) * t1,
          y: p0.y + (p1.y - p0.y) * t1,
          dist: clippedEnd,
        });

        d = segEnd;
      }

      if (hotPath.length < 2) return;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const layers = [
        { color: [20, 130, 80], alpha: 0.06, width: 40 },
        { color: [36, 174, 124], alpha: 0.12, width: 22 },
        { color: [52, 211, 153], alpha: 0.2, width: 12 },
        { color: [110, 231, 183], alpha: 0.4, width: 5 },
        { color: [209, 250, 229], alpha: 0.7, width: 2.2 },
        { color: [255, 255, 255], alpha: 0.9, width: 0.8 },
      ];

      for (let l = 0; l < layers.length; l++) {
        const layer = layers[l];
        for (let j = 1; j < hotPath.length; j++) {
          const fadeT0 = (hotPath[j - 1].dist - hotStart) / HOT_ZONE;
          const fadeT1 = (hotPath[j].dist - hotStart) / HOT_ZONE;
          let segAlpha = (fadeT0 + fadeT1) / 2;
          segAlpha = segAlpha * segAlpha;
          const a = b * layer.alpha * segAlpha;
          if (a < 0.002) continue;

          ctx.beginPath();
          ctx.moveTo(hotPath[j - 1].x, hotPath[j - 1].y);
          ctx.lineTo(hotPath[j].x, hotPath[j].y);
          ctx.strokeStyle =
            "rgba(" + layer.color[0] + ", " + layer.color[1] + ", " + layer.color[2] + ", " + a.toFixed(4) + ")";
          ctx.lineWidth = layer.width;
          ctx.stroke();
        }
      }
    }

    function drawLaserTip(x: number, y: number) {
      if (!ctx) return;
      const b = BRIGHTNESS * fadeAlpha;
      const flicker = 0.85 + Math.random() * 0.15;

      const grad5 = ctx.createRadialGradient(x, y, 0, x, y, 120);
      grad5.addColorStop(0, "rgba(36, 174, 124, " + (b * flicker * 0.12).toFixed(4) + ")");
      grad5.addColorStop(0.3, "rgba(20, 130, 80, " + (b * flicker * 0.05).toFixed(4) + ")");
      grad5.addColorStop(1, "rgba(10, 80, 50, 0)");
      ctx.fillStyle = grad5;
      ctx.beginPath();
      ctx.arc(x, y, 120, 0, Math.PI * 2);
      ctx.fill();

      const grad4 = ctx.createRadialGradient(x, y, 0, x, y, 60);
      grad4.addColorStop(0, "rgba(52, 211, 153, " + (b * flicker * 0.3).toFixed(4) + ")");
      grad4.addColorStop(0.4, "rgba(36, 174, 124, " + (b * flicker * 0.12).toFixed(4) + ")");
      grad4.addColorStop(1, "rgba(20, 130, 80, 0)");
      ctx.fillStyle = grad4;
      ctx.beginPath();
      ctx.arc(x, y, 60, 0, Math.PI * 2);
      ctx.fill();

      const grad3 = ctx.createRadialGradient(x, y, 0, x, y, 30);
      grad3.addColorStop(0, "rgba(110, 231, 183, " + (b * flicker * 0.55).toFixed(4) + ")");
      grad3.addColorStop(0.3, "rgba(52, 211, 153, " + (b * flicker * 0.3).toFixed(4) + ")");
      grad3.addColorStop(1, "rgba(36, 174, 124, 0)");
      ctx.fillStyle = grad3;
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.fill();

      const grad2 = ctx.createRadialGradient(x, y, 0, x, y, 14);
      grad2.addColorStop(0, "rgba(255, 255, 255, " + (b * flicker * 0.95).toFixed(4) + ")");
      grad2.addColorStop(0.25, "rgba(209, 250, 229, " + (b * flicker * 0.8).toFixed(4) + ")");
      grad2.addColorStop(0.5, "rgba(110, 231, 183, " + (b * flicker * 0.45).toFixed(4) + ")");
      grad2.addColorStop(1, "rgba(52, 211, 153, 0)");
      ctx.fillStyle = grad2;
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fill();

      const grad1 = ctx.createRadialGradient(x, y, 0, x, y, 5);
      grad1.addColorStop(0, "rgba(255, 255, 255, " + (b * flicker).toFixed(4) + ")");
      grad1.addColorStop(0.5, "rgba(255, 255, 255, " + (b * flicker * 0.7).toFixed(4) + ")");
      grad1.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = grad1;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();

      const speckleCount = 6 + Math.floor(Math.random() * 4);
      for (let i = 0; i < speckleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 6 + Math.random() * 18;
        const sx = x + Math.cos(angle) * dist;
        const sy = y + Math.sin(angle) * dist;
        const sr = 0.5 + Math.random() * 1.5;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(209, 250, 229, " + (b * flicker * (0.2 + Math.random() * 0.3)).toFixed(4) + ")";
        ctx.fill();
      }
    }

    function drawHeatDistortion(laser: Laser) {
      if (!ctx) return;
      if (laser.drawnLength <= 0) return;

      const b = BRIGHTNESS * fadeAlpha;
      const tipX = laser.tipX;
      const tipY = laser.tipY;

      for (let i = 0; i < 3; i++) {
        const offsetX = (Math.random() - 0.5) * 30;
        const startY = tipY - 5;
        const endY = tipY - 25 - Math.random() * 30;
        const waveAmp = 3 + Math.random() * 6;

        ctx.beginPath();
        for (let t = 0; t <= 1; t += 0.05) {
          const py = startY + (endY - startY) * t;
          const px = tipX + offsetX + Math.sin(t * Math.PI * 3 + globalTime * 8 + i * 2) * waveAmp * t;
          if (t === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        const distAlpha = b * (0.04 + Math.random() * 0.06);
        ctx.strokeStyle = "rgba(110, 231, 183, " + distAlpha.toFixed(4) + ")";
        ctx.lineWidth = 0.5 + Math.random() * 1;
        ctx.stroke();
      }
    }

    function startNewShape() {
      if (!burnCtx) return;
      const shapes = generateShapeSet();
      lasers = [];
      sparks = [];
      smokeParticles = [];
      phase = "drawing";
      phaseTimer = 0;
      fadeAlpha = 1;

      burnCtx.clearRect(0, 0, width, height);

      for (let i = 0; i < shapes.length; i++) {
        lasers.push(new Laser(shapes[i]));
      }
    }

    startNewShape();

    function drawSurface() {
      if (!ctx) return;
      if (Math.random() > 0.4) return;

      for (let i = 0; i < 60; i++) {
        const y = Math.random() * height;
        const x = Math.random() * width;
        const len = 3 + Math.random() * 12;
        const bright = Math.random() > 0.5;
        const alpha = 0.02 + Math.random() * 0.03;
        ctx.fillStyle = bright
          ? "rgba(90, 85, 80, " + alpha.toFixed(4) + ")"
          : "rgba(40, 38, 35, " + alpha.toFixed(4) + ")";
        ctx.fillRect(x, y, len, 1);
      }
    }

    function onBurstClick(e: MouseEvent | TouchEvent, clientX: number, clientY: number) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const bx = clientX - rect.left;
      const by = clientY - rect.top;
      emitSparks(bx, by, 30 + Math.floor(Math.random() * 20));
      emitSmoke(bx, by, 10 + Math.floor(Math.random() * 6));
      burnScorch(bx - 2, by - 2, bx + 2, by + 2);
      burnScorch(bx - 2, by + 2, bx + 2, by - 2);
    }

    let laserDown = false;
    const handleMouseDown = (e: MouseEvent) => {
      laserDown = true;
      onBurstClick(e, e.clientX, e.clientY);
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (laserDown) onBurstClick(e, e.clientX, e.clientY);
    };
    const handleMouseUp = () => {
      laserDown = false;
    };
    const handleTouchStart = (e: TouchEvent) => {
      laserDown = true;
      onBurstClick(e, e.touches[0].clientX, e.touches[0].clientY);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (laserDown) onBurstClick(e, e.touches[0].clientX, e.touches[0].clientY);
    };
    const handleTouchEnd = () => {
      laserDown = false;
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    let lastTime = 0;
    let animId: number;

    function render(timestamp: number) {
      if (!ctx || !burnCanvas) return;
      if (!lastTime) lastTime = timestamp;
      let dt = Math.min((timestamp - lastTime) / 1000, 0.05);
      lastTime = timestamp;
      globalTime += dt;

      if (prefersReduced) dt *= 0.15;

      ctx.clearRect(0, 0, width, height);

      // We want to make it look good on dark theme. 
      // The original background is #2a2a2a, but let's make it fully transparent 
      // so it integrates beautifully with the hero background
      // ctx.fillStyle = "rgba(0,0,0,0)";
      // ctx.fillRect(0, 0, width, height);

      drawSurface();

      switch (phase) {
        case "drawing":
          let allDone = true;
          for (let i = 0; i < lasers.length; i++) {
            lasers[i].update(dt);
            if (!lasers[i].done) allDone = false;
          }
          if (allDone) {
            phase = "holding";
            phaseTimer = 0;
          }
          break;
        case "holding":
          phaseTimer += dt;
          if (phaseTimer >= HOLD_TIME) {
            phase = "fading";
            phaseTimer = 0;
          }
          break;
        case "fading":
          phaseTimer += dt;
          fadeAlpha = Math.max(0, 1 - phaseTimer / FADE_TIME);
          if (phaseTimer >= FADE_TIME) {
            startNewShape();
          }
          break;
      }

      updateSparks(dt);
      updateSmoke(dt);

      ctx.save();
      ctx.globalAlpha = fadeAlpha;
      ctx.shadowOffsetX = -2;
      ctx.shadowOffsetY = -2;
      ctx.shadowBlur = 3;
      ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx.drawImage(burnCanvas, 0, 0, width, height);
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = fadeAlpha * 0.5;
      ctx.shadowOffsetX = 2.5;
      ctx.shadowOffsetY = 2.5;
      ctx.shadowBlur = 2;
      ctx.shadowColor = "rgba(255, 255, 250, 0.45)";
      ctx.drawImage(burnCanvas, 0, 0, width, height);
      ctx.restore();

      if (phase !== "fading") {
        const glowBase = phase === "drawing" ? 0.03 : 0.01;
        ctx.save();
        ctx.globalAlpha = (glowBase + Math.sin(globalTime * 2) * 0.01) * BRIGHTNESS * fadeAlpha;
        ctx.globalCompositeOperation = "screen";
        ctx.filter = "blur(8px)";
        ctx.drawImage(burnCanvas, 0, 0, width, height);
        ctx.filter = "none";
        ctx.restore();
      }

      drawSmoke();

      for (let i = 0; i < lasers.length; i++) {
        drawActiveBeam(lasers[i]);
      }

      if (phase === "drawing") {
        for (let i = 0; i < lasers.length; i++) {
          if (!lasers[i].done) {
            drawHeatDistortion(lasers[i]);
            drawLaserTip(lasers[i].tipX, lasers[i].tipY);
          }
        }
      }

      drawSparks();

      const maxDim = Math.max(width, height);
      const vig = ctx.createRadialGradient(cx, cy, maxDim * 0.15, cx, cy, maxDim * 0.72);
      vig.addColorStop(0, "rgba(0, 0, 0, 0)");
      vig.addColorStop(0.5, "rgba(0, 0, 0, 0.1)");
      vig.addColorStop(1, "rgba(0, 0, 0, 0.6)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, width, height);

      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        lastTime = 0;
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("resize", resize);
      if (canvas) {
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("touchstart", handleTouchStart);
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animId);
    };
  }, [heroCenterX, heroCenterY, heroScale]);

  return (
    <div className={cn("relative w-full h-full bg-transparent overflow-hidden", className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ touchAction: "none" }}
      />
    </div>
  );
}
