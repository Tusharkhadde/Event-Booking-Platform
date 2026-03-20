"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AuroraCurtainProps {
  className?: string;
}

export function AuroraCurtain({ className }: AuroraCurtainProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.className = "absolute inset-0 w-full h-full block";
    canvas.style.touchAction = "none";
    container.appendChild(canvas);

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pixelScale = 1;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    const vertSrc = [
      "attribute vec2 a_pos;",
      "void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }",
    ].join("\n");

    const fragSrc = [
      "precision highp float;",
      "uniform float u_time;",
      "uniform vec2 u_res;",
      "uniform float u_waveSpeed;",
      "uniform float u_lineCount;",
      "uniform float u_amplitude;",
      "uniform float u_rotation;",
      "uniform vec2 u_mouse;",
      "uniform float u_dragAngle;",
      "",
      "// ── Hash for noise ──",
      "float hash(vec2 p) {",
      "  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);",
      "}",
      "",
      "// ── Smooth value noise ──",
      "float noise(vec2 p) {",
      "  vec2 i = floor(p);",
      "  vec2 f = fract(p);",
      "  f = f * f * (3.0 - 2.0 * f);",
      "  float a = hash(i);",
      "  float b = hash(i + vec2(1.0, 0.0));",
      "  float c = hash(i + vec2(0.0, 1.0));",
      "  float d = hash(i + vec2(1.0, 1.0));",
      "  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);",
      "}",
      "",
      "#define S smoothstep",
      "",
      "mat2 rot2(float a) { float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }",
      "",
      "// ── Single vertical curtain line ──",
      "vec3 curtainLine(vec2 uv, float speed, float freq, vec3 c, float t) {",
      "  // Sine displacement on x based on y position (vertical flow)",
      "  uv.x += S(1.0, 0.0, abs(uv.y)) * sin(t * speed + uv.y * freq) * 0.2;",
      "  float lw = 0.06 * S(0.2, 0.9, abs(uv.y));",
      "  float l = S(lw, 0.0, abs(uv.x) - 0.004);",
      "  // Edge fade top/bottom instead of left/right",
      "  float fade = S(1.0, 0.3, abs(uv.y));",
      "  return l * c * fade;",
      "}",
      "",
      "void main() {",
      "  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res.xy) / u_res.y;",
      "  uv = rot2(u_dragAngle + u_rotation) * uv;",
      "  // Base from sliders, mouse modifies on top",
      "  float mouseAmp = u_amplitude;",
      "  float mouseFreq = 1.0;",
      "  if (u_mouse.x > 0.0) {",
      "    vec2 mUV = u_mouse / u_res;",
      "    mouseAmp *= 0.3 + mUV.y * 1.4;",
      "    mouseFreq = 0.5 + mUV.x * 1.0;",
      "  }",
      "  float t = u_time * u_waveSpeed;",
      "  int lineCount = int(u_lineCount);",
      "",
      "  vec3 col = vec3(0.0);",
      "",
      "  for (int i = 0; i < 12; i++) {",
      "    if (i >= lineCount) break;",
      "    float fi = float(i);",
      "    float frac = fi / max(u_lineCount - 1.0, 1.0);",
      "",
      "    float speed = (0.6 + frac * 0.5) * mouseFreq;",
      "    float freq = (4.0 + frac * 2.0) * mouseAmp;",
      "",
      "    // Color: warm amber at base (bottom), cool teal at top",
      "    vec3 warmAmber = vec3(0.85, 0.55, 0.25);",
      "    vec3 coolTeal = vec3(0.2, 0.6, 0.65);",
      "    // Blend per-line from amber to teal",
      "    vec3 lineCol = mix(warmAmber, coolTeal, frac) * (0.5 + frac * 0.5);",
      "",
      "    // Also blend per-pixel based on vertical position",
      "    float yBlend = S(-0.4, 0.5, uv.y);",
      "    vec3 pixelCol = mix(warmAmber, coolTeal, yBlend) * (0.4 + frac * 0.6);",
      "    lineCol = mix(lineCol, pixelCol, 0.6);",
      "",
      "    // Slow lateral drift",
      "    float drift = sin(t * 0.15 + fi * 1.3) * 0.03;",
      "",
      "    float nOff = noise(vec2(uv.y * 2.0 + fi * 3.7, t * 0.1 + fi)) * 0.015;",
      "",
      "    col += curtainLine(uv + vec2(nOff + drift, 0.0), speed, freq, lineCol, t);",
      "  }",
      "",
      "  // ── Vignette ──",
      "  float vig = 1.0 - dot(uv, uv) * 0.4;",
      "  col *= max(vig, 0.0);",
      "",
      "  gl_FragColor = vec4(col, 1.0);",
      "}",
    ].join("\n");

    function compile(type: number, src: string) {
      if (!gl) return null;
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(s));
      }
      return s;
    }

    const prog = gl.createProgram();
    if (!prog) return;
    const vs = compile(gl.VERTEX_SHADER, vertSrc);
    const fs = compile(gl.FRAGMENT_SHADER, fragSrc);
    if (!vs || !fs) return;

    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(prog));
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_res");
    const uWaveSpeed = gl.getUniformLocation(prog, "u_waveSpeed");
    const uLineCount = gl.getUniformLocation(prog, "u_lineCount");
    const uAmplitude = gl.getUniformLocation(prog, "u_amplitude");
    const uRotation = gl.getUniformLocation(prog, "u_rotation");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uDragAngle = gl.getUniformLocation(prog, "u_dragAngle");

    let mouseXVal = -1.0;
    let mouseYVal = -1.0;
    let dragAngle = 0;
    let mouseDown = false;
    let lastMX = 0;
    let waveSpeedVal = 1.0;
    let lineCountVal = 6.0;
    let amplitudeVal = 1.0;
    let rotationVal = 0.0;

    let dpr = Math.min(window.devicePixelRatio || 1, 2) * pixelScale;
    let needsResize = true;
    let running = true;
    let animId: number;

    function resize() {
      needsResize = false;
      if (!canvas || !gl || !container) return;
      const w = Math.round(container.clientWidth * dpr);
      const h = Math.round(container.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      }
    }

    function render(now: number) {
      if (!running || !gl || !container) {
        animId = requestAnimationFrame(render);
        return;
      }
      
      const w = Math.round(container.clientWidth * dpr);
      const h = Math.round(container.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        needsResize = true;
      }

      if (needsResize) resize();

      gl.uniform1f(uTime, prefersReduced ? 0.0 : now * 0.001);
      gl.uniform1f(uWaveSpeed, waveSpeedVal);
      gl.uniform1f(uLineCount, lineCountVal);
      gl.uniform1f(uAmplitude, amplitudeVal);
      gl.uniform1f(uRotation, rotationVal);
      gl.uniform2f(uMouse, mouseXVal, mouseYVal);
      gl.uniform1f(uDragAngle, dragAngle);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      animId = requestAnimationFrame(render);
    }

    const handleResize = () => {
      needsResize = true;
    };
    window.addEventListener("resize", handleResize);
    resize();
    animId = requestAnimationFrame(render);

    // Mouse and touch interaction
    const handleMouseDown = (e: MouseEvent) => {
      mouseDown = true;
      lastMX = e.clientX;
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      mouseXVal = e.clientX * dpr;
      mouseYVal = (canvas.clientHeight - e.clientY) * dpr;
      if (mouseDown) {
        dragAngle += (e.clientX - lastMX) * 0.004;
        lastMX = e.clientX;
      }
    };
    const handleMouseUp = () => {
      mouseDown = false;
    };
    const handleMouseLeave = () => {
      mouseXVal = -1.0;
      mouseYVal = -1.0;
      mouseDown = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!canvas) return;
      mouseDown = true;
      const touch = e.touches[0];
      lastMX = touch.clientX;
      mouseXVal = touch.clientX * dpr;
      mouseYVal = (canvas.clientHeight - touch.clientY) * dpr;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!canvas) return;
      const touch = e.touches[0];
      mouseXVal = touch.clientX * dpr;
      mouseYVal = (canvas.clientHeight - touch.clientY) * dpr;
      if (mouseDown) {
        dragAngle += (touch.clientX - lastMX) * 0.004;
        lastMX = touch.clientX;
      }
    };
    const handleTouchEnd = () => {
      mouseDown = false;
      mouseXVal = -1.0;
      mouseYVal = -1.0;
    };

    const handleVisibilityChange = () => {
      running = !document.hidden;
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    canvas.addEventListener("touchend", handleTouchEnd);
    canvas.addEventListener("touchcancel", handleTouchEnd);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("touchcancel", handleTouchEnd);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animId);
      
      // Cleanup WebGL context properly
      const err = gl.getError(); // Flush errors
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
      
      container.removeChild(canvas);
    };
  }, []);

  return (
    <div ref={containerRef} className={cn("relative w-full h-full bg-[#0a0a0a]", className)} />
  );
}
