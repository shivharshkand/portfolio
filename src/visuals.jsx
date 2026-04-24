import React, { useEffect, useRef, useState } from 'react';
// Shared visual primitives: icons, diagrams, and plot canvases.

/* =========================================================
   Minimal stroke iconography — no emoji, no clip-art
   ========================================================= */
export const Icon = ({ name, size = 16, stroke = 'currentColor' }) => {
  const s = { width: size, height: size, stroke, fill: 'none', strokeWidth: 1.25, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'arrow':
      return <svg viewBox="0 0 16 16" {...s}><path d="M4 12 L12 4 M7 4 H12 V9"/></svg>;
    case 'chev':
      return <svg viewBox="0 0 16 16" {...s}><path d="M6 4 L10 8 L6 12"/></svg>;
    case 'wave':
      return <svg viewBox="0 0 16 16" {...s}><path d="M1 8 Q3 2 5 8 T9 8 T13 8 T15 8"/></svg>;
    case 'chip':
      return <svg viewBox="0 0 16 16" {...s}><rect x="4" y="4" width="8" height="8" rx="1"/><path d="M6 2V4 M10 2V4 M6 12V14 M10 12V14 M2 6H4 M2 10H4 M12 6H14 M12 10H14"/></svg>;
    case 'chart':
      return <svg viewBox="0 0 16 16" {...s}><path d="M2 13V3 M2 13H14 M5 10L8 6 L10 9 L13 4"/></svg>;
    case 'arm':
      return <svg viewBox="0 0 16 16" {...s}><circle cx="4" cy="12" r="1.4"/><path d="M4 12 L8 6 L12 8"/><circle cx="8" cy="6" r="1.1"/><circle cx="12" cy="8" r="1"/></svg>;
    case 'orbit':
      return <svg viewBox="0 0 16 16" {...s}><ellipse cx="8" cy="8" rx="6" ry="3"/><circle cx="8" cy="8" r="1.5"/></svg>;
    case 'mail':
      return <svg viewBox="0 0 16 16" {...s}><rect x="2" y="4" width="12" height="9" rx="1"/><path d="M2 5 L8 10 L14 5"/></svg>;
    case 'link':
      return <svg viewBox="0 0 16 16" {...s}><path d="M7 9 A3 3 0 0 1 7 5 L9 3 A3 3 0 0 1 13 7 L11 9"/><path d="M9 7 A3 3 0 0 1 9 11 L7 13 A3 3 0 0 1 3 9 L5 7"/></svg>;
    case 'git':
      return <svg viewBox="0 0 16 16" {...s}><circle cx="4" cy="4" r="1.4"/><circle cx="4" cy="12" r="1.4"/><circle cx="12" cy="8" r="1.4"/><path d="M4 5.4V10.6 M5.4 4 Q12 4 12 6.6"/></svg>;
    case 'download':
      return <svg viewBox="0 0 16 16" {...s}><path d="M8 3V11 M5 8L8 11 L11 8 M3 13H13"/></svg>;
    case 'node':
      return <svg viewBox="0 0 16 16" {...s}><circle cx="8" cy="8" r="3"/><circle cx="8" cy="8" r="6"/></svg>;
    case 'image':
      return <svg viewBox="0 0 16 16" {...s}><rect x="2" y="3" width="12" height="10" rx="1"/><path d="M2 11 L6 7 L9 10 L11 8 L14 11"/><circle cx="11" cy="6" r="1"/></svg>;
    case 'close':
      return <svg viewBox="0 0 16 16" {...s}><path d="M4 4 L12 12 M12 4 L4 12"/></svg>;
    default:
      return null;
  }
};

/* =========================================================
   Robot canvas — SINGLE industrial 3-link arm (IK follower)
   Positioned bottom-right so the central hero copy stays clean.
   ========================================================= */
export const RobotCanvas = ({ height = 520 }) => {
  const ref = useRef(null);
  const mouseRef = useRef({ x: 0.66, y: 0.30, active: false, gripping: false });

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    let W = 0, H = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;

    const resize = () => {
      const r = c.getBoundingClientRect();
      W = r.width;
      H = r.height;
      c.width = W * dpr;
      c.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);

    // Track pointer from the window instead of only the canvas.
    // Project cards sit above the canvas; this keeps the arm linked while hovering them.
    const onMove = (e) => {
      const r = c.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
      mouseRef.current = {
        x: clamp(x, 0, 1),
        y: clamp(y, 0, 1),
        active: inside || mouseRef.current.gripping,
        gripping: mouseRef.current.gripping,
      };
    };
    const onDown = (e) => {
      const r = c.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      if (x >= 0 && x <= 1 && y >= 0 && y <= 1) mouseRef.current.gripping = true;
    };
    const onUp = () => { mouseRef.current.gripping = false; };
    const onLeaveWindow = () => { mouseRef.current.active = false; mouseRef.current.gripping = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('blur', onLeaveWindow);

    const arm = { L1: 142, L2: 118, L3: 54, a1: -1.28, a2: 1.42, a3: -0.10, elbowSign: -1, yaw: 0, targetX: 0, targetY: 0 };
    let last = performance.now();

    const TAU = Math.PI * 2;
    const shortestDelta = (from, to) => {
      let d = (to - from) % TAU;
      if (d > Math.PI) d -= TAU;
      if (d < -Math.PI) d += TAU;
      return d;
    };
    const lerp = (a, b, k) => a + (b - a) * k;
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    const loop = (now) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, W, H);

      const cx = W * 0.53;
      const baseY = H * 0.70;
      const sx = cx;
      const sy = baseY - 92;
      const time = now / 1000;

      const floor = ctx.createRadialGradient(cx, baseY + 8, 8, cx, baseY + 8, Math.min(W, H) * 0.34);
      floor.addColorStop(0, 'rgba(158,203,255,0.14)');
      floor.addColorStop(0.45, 'rgba(158,203,255,0.045)');
      floor.addColorStop(1, 'rgba(158,203,255,0)');
      ctx.fillStyle = floor;
      ctx.beginPath(); ctx.ellipse(cx, baseY + 18, 230, 38, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(158,203,255,0.10)';
      ctx.lineWidth = 1;
      [0.45, 0.70, 0.95].forEach((m) => {
        ctx.beginPath(); ctx.ellipse(cx, baseY + 16, 160 * m, 28 * m, 0, 0, TAU); ctx.stroke();
      });

      let desiredX, desiredY;
      if (mouseRef.current.active) {
        desiredX = mouseRef.current.x * W;
        desiredY = mouseRef.current.y * H;
      } else {
        const orbit = 205;
        const a = time * 0.34;
        desiredX = sx + Math.cos(a) * orbit;
        desiredY = sy + Math.sin(a) * orbit * 0.64 - 22;
      }
      arm.targetX = arm.targetX ? lerp(arm.targetX, desiredX, Math.min(1, dt * 3.0)) : desiredX;
      arm.targetY = arm.targetY ? lerp(arm.targetY, desiredY, Math.min(1, dt * 3.0)) : desiredY;

      let dx = arm.targetX - sx;
      let dy = arm.targetY - sy;
      let d = Math.hypot(dx, dy) || 1;
      const maxReach = arm.L1 + arm.L2 - 18;
      const minReach = Math.abs(arm.L1 - arm.L2) + 36;
      const clampedD = clamp(d, minReach, maxReach);
      dx *= clampedD / d;
      dy *= clampedD / d;
      d = clampedD;

      const baseAngle = Math.atan2(dy, dx);
      const cosA2 = clamp((d*d - arm.L1*arm.L1 - arm.L2*arm.L2) / (2 * arm.L1 * arm.L2), -1, 1);
      const bend = Math.acos(cosA2);
      const a2Goal = arm.elbowSign * bend;
      const a1Goal = baseAngle - Math.atan2(arm.L2 * Math.sin(a2Goal), arm.L1 + arm.L2 * Math.cos(a2Goal));
      const toolGoal = baseAngle + 0.18 * Math.sin(time * 0.8);
      const a3Goal = toolGoal - (a1Goal + a2Goal);

      const smooth = Math.min(1, dt * 5.2);
      arm.a1 += shortestDelta(arm.a1, a1Goal) * smooth;
      arm.a2 += shortestDelta(arm.a2, a2Goal) * smooth;
      arm.a3 += shortestDelta(arm.a3, a3Goal) * smooth;
      arm.yaw += shortestDelta(arm.yaw, baseAngle) * Math.min(1, dt * 2.2);

      const ex = sx + Math.cos(arm.a1) * arm.L1;
      const ey = sy + Math.sin(arm.a1) * arm.L1;
      const wx = ex + Math.cos(arm.a1 + arm.a2) * arm.L2;
      const wy = ey + Math.sin(arm.a1 + arm.a2) * arm.L2;
      const toolAng = arm.a1 + arm.a2 + arm.a3;
      const gx = wx + Math.cos(toolAng) * arm.L3;
      const gy = wy + Math.sin(toolAng) * arm.L3;

      drawPremiumCable(ctx, sx - 26, sy + 52, ex + 18, ey + 26, wx - 18, wy + 36);
      drawPremiumBase(ctx, cx, baseY, arm.yaw);
      drawPremiumLink(ctx, sx, sy, ex, ey, 36, 'upper');
      drawPremiumLink(ctx, ex, ey, wx, wy, 30, 'forearm');
      drawPremiumHub(ctx, sx, sy, 36, arm.yaw + time * 0.2);
      drawPremiumHub(ctx, ex, ey, 29, arm.a2);
      drawPremiumHub(ctx, wx, wy, 22, toolAng);
      drawPremiumWrist(ctx, wx, wy, toolAng);
      drawPremiumGripper(ctx, wx, wy, toolAng, time, mouseRef.current.gripping);
      drawEndGlow(ctx, gx, gy, time);

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('blur', onLeaveWindow);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} style={{ width: '100%', height, display: 'block' }} />;
};

function premiumRoundRect(ctx, x, y, w, h, r) {
  if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); return; }
  const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function premiumMetal(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, '#07090d'); g.addColorStop(0.16, '#3d4650'); g.addColorStop(0.35, '#cfd5dc');
  g.addColorStop(0.50, '#f0f3f5'); g.addColorStop(0.66, '#68717b'); g.addColorStop(0.84, '#191d23'); g.addColorStop(1, '#030405');
  return g;
}

function drawPremiumBase(ctx, cx, y, yaw = 0) {
  ctx.save(); ctx.translate(cx, y);
  ctx.fillStyle = 'rgba(0,0,0,0.58)'; ctx.beginPath(); ctx.ellipse(0, 26, 132, 20, 0, 0, Math.PI * 2); ctx.fill();
  const plate = ctx.createLinearGradient(0, -18, 0, 28);
  plate.addColorStop(0, '#26303a'); plate.addColorStop(0.42, '#0e1116'); plate.addColorStop(1, '#050608');
  ctx.fillStyle = plate; premiumRoundRect(ctx, -122, -10, 244, 36, 10); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.24)'; ctx.lineWidth = 1; ctx.stroke();
  for (const [bx, by] of [[-96, 6], [-58, 10], [58, 10], [96, 6]]) {
    const b = ctx.createRadialGradient(bx - 1, by - 1, 1, bx, by, 6);
    b.addColorStop(0, '#e3e8ee'); b.addColorStop(0.45, '#65707c'); b.addColorStop(1, '#05070a');
    ctx.fillStyle = b; ctx.beginPath(); ctx.arc(bx, by, 5, 0, Math.PI * 2); ctx.fill();
  }
  // Fixed turntable stack: keep the base visually anchored while the arm sweeps 360°.
  for (let i = 0; i < 5; i++) {
    const yy = -22 - i * 14; const ww = 92 - i * 5;
    ctx.fillStyle = premiumMetal(ctx, -ww/2, yy, ww/2, yy);
    premiumRoundRect(ctx, -ww/2, yy, ww, 13, 6); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.stroke();
  }
  ctx.fillStyle = premiumMetal(ctx, -36, -104, 36, -104);
  premiumRoundRect(ctx, -36, -104, 72, 62, 14); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.26)'; ctx.stroke();
  ctx.restore();
}

function drawPremiumLink(ctx, x1, y1, x2, y2, w, type) {
  const ang = Math.atan2(y2 - y1, x2 - x1); const len = Math.hypot(x2 - x1, y2 - y1);
  ctx.save(); ctx.translate(x1, y1); ctx.rotate(ang);
  ctx.fillStyle = 'rgba(0,0,0,0.38)'; premiumRoundRect(ctx, 8, -w/2 + 8, len - 16, w, w/2); ctx.fill();
  ctx.fillStyle = premiumMetal(ctx, 0, -w/2, 0, w/2); premiumRoundRect(ctx, -4, -w/2, len + 8, w, w/2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.30)'; ctx.lineWidth = 1; ctx.stroke();
  for (const sx of [15, len - 37]) {
    const collar = ctx.createLinearGradient(0, -w/2, 0, w/2);
    collar.addColorStop(0, '#020304'); collar.addColorStop(0.35, '#363d46'); collar.addColorStop(0.52, '#0d1015'); collar.addColorStop(1, '#010203');
    ctx.fillStyle = collar; premiumRoundRect(ctx, sx, -w/2 - 4, 24, w + 8, 11); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.stroke();
  }
  const strip = type === 'upper' ? 11 : 9;
  ctx.fillStyle = 'rgba(3,7,11,0.44)'; premiumRoundRect(ctx, 44, -strip/2, Math.max(28, len - 88), strip, 5); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.58)'; ctx.lineWidth = 1.1;
  ctx.beginPath(); ctx.moveTo(24, -w*0.32); ctx.lineTo(len - 26, -w*0.32); ctx.stroke();
  ctx.fillStyle = '#07090c'; ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  for (const sx of [52, len - 54]) for (const sy of [-w*0.27, w*0.27]) { ctx.beginPath(); ctx.arc(sx, sy, 3.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  ctx.restore();
}

function drawPremiumHub(ctx, x, y, r, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const outer = ctx.createRadialGradient(-r*0.34, -r*0.40, 2, 0, 0, r);
  outer.addColorStop(0, '#ffffff'); outer.addColorStop(0.22, '#d9dee4'); outer.addColorStop(0.52, '#66707c'); outer.addColorStop(0.84, '#06080c'); outer.addColorStop(1, '#000000');
  ctx.fillStyle = outer; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.42)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.beginPath(); ctx.arc(0, 0, r*0.78, 0, Math.PI*2); ctx.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.fillStyle = '#05070a'; ctx.beginPath(); ctx.arc(Math.cos(a)*r*0.78, Math.sin(a)*r*0.78, Math.max(1.6, r*0.055), 0, Math.PI*2); ctx.fill(); }
  const inner = ctx.createRadialGradient(-r*0.1, -r*0.15, 1, 0, 0, r*0.48);
  inner.addColorStop(0, '#2a343e'); inner.addColorStop(0.35, '#0c0f14'); inner.addColorStop(1, '#000');
  ctx.fillStyle = inner; ctx.beginPath(); ctx.arc(0, 0, r*0.50, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = 'rgba(158,203,255,0.22)'; ctx.stroke();
  ctx.fillStyle = 'rgba(158,203,255,0.95)'; ctx.beginPath(); ctx.arc(-r*0.10, -r*0.08, Math.max(1.5, r*0.06), 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawPremiumWrist(ctx, x, y, ang) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.fillStyle = premiumMetal(ctx, 0, -20, 0, 20); premiumRoundRect(ctx, -10, -20, 48, 40, 9); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,0.56)'; premiumRoundRect(ctx, 18, -24, 18, 48, 5); ctx.fill();
  ctx.restore();
}

function drawPremiumGripper(ctx, x, y, ang, time, gripping = false) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  const open = gripping ? 6 : 18 + Math.sin(time * 1.4) * 2.0;
  let g = ctx.createLinearGradient(34, -27, 34, 27);
  g.addColorStop(0, '#0b0d11'); g.addColorStop(0.35, '#59626d'); g.addColorStop(0.55, '#b3bbc5'); g.addColorStop(1, '#11151b');
  ctx.fillStyle = g; premiumRoundRect(ctx, 28, -25, 38, 50, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.stroke();
  ctx.fillStyle = '#090b0f'; premiumRoundRect(ctx, 62, -19, 17, 38, 4); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.stroke();
  const finger = (side) => {
    ctx.save(); ctx.translate(76, side * open); ctx.rotate(side * 0.20);
    ctx.fillStyle = premiumMetal(ctx, 0, -7, 0, 7); premiumRoundRect(ctx, 0, -7, 34, 14, 4); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.stroke();
    ctx.translate(33, 0); ctx.rotate(-side * 0.34);
    ctx.fillStyle = premiumMetal(ctx, 0, -6, 0, 6); premiumRoundRect(ctx, 0, -6, 30, 12, 4); ctx.fill();
    ctx.fillStyle = '#07090c'; premiumRoundRect(ctx, 24, -4, 9, 8, 2); ctx.fill();
    ctx.restore();
  };
  finger(-1); finger(1);
  ctx.fillStyle = 'rgba(158,203,255,0.95)'; ctx.beginPath(); ctx.arc(41, 0, 2.3, 0, Math.PI*2); ctx.fill();
  for (const yy of [-15, 15]) { ctx.fillStyle = '#06080b'; ctx.beginPath(); ctx.arc(55, yy, 3, 0, Math.PI*2); ctx.fill(); }
  ctx.restore();
}

function drawPremiumCable(ctx, x0, y0, x1, y1, x2, y2) {
  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0.72)'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.bezierCurveTo(x0 + 44, y0 - 58, x1 - 62, y1 + 50, x1, y1); ctx.bezierCurveTo(x1 + 48, y1 - 12, x2 - 42, y2 + 30, x2, y2); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.bezierCurveTo(x0 + 44, y0 - 58, x1 - 62, y1 + 50, x1, y1); ctx.bezierCurveTo(x1 + 48, y1 - 12, x2 - 42, y2 + 30, x2, y2); ctx.stroke();
  ctx.restore();
}

function drawEndGlow(ctx, x, y, time) {
  const pulse = 1 + Math.sin(time * 2.4) * 0.08;
  const g = ctx.createRadialGradient(x, y, 0, x, y, 75 * pulse);
  g.addColorStop(0, 'rgba(158,203,255,0.28)'); g.addColorStop(1, 'rgba(158,203,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 75 * pulse, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(158,203,255,0.32)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 24, y); ctx.lineTo(x - 8, y); ctx.moveTo(x + 8, y); ctx.lineTo(x + 24, y); ctx.moveTo(x, y - 24); ctx.lineTo(x, y - 8); ctx.moveTo(x, y + 8); ctx.lineTo(x, y + 24); ctx.stroke();
}

function drawArmLink(ctx, x1, y1, x2, y2, w, isUpper) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const len = Math.hypot(x2 - x1, y2 - y1);
  ctx.save();
  ctx.translate(x1, y1);
  ctx.rotate(ang);
  // drop shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.roundRect(6, -w / 2 + 4, len - 12, w, w / 2); ctx.fill();
  // body
  const g = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
  g.addColorStop(0, '#2d3239');
  g.addColorStop(0.28, '#6d747c');
  g.addColorStop(0.5, '#b6bcc3');
  g.addColorStop(0.72, '#6d747c');
  g.addColorStop(1, '#1a1d22');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.roundRect(-w*0.25, -w / 2, len + w*0.5, w, w / 2); ctx.fill();
  // inner channel / plate detail
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.roundRect(w*0.4, -w * 0.22, len - w*0.8, w * 0.44, 3); ctx.fill();
  // highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(2, -w / 2 + 2);
  ctx.lineTo(len - 2, -w / 2 + 2);
  ctx.stroke();
  // screws (two each end)
  ctx.fillStyle = '#13161a';
  for (const sx of [w * 0.5, len - w * 0.5]) {
    ctx.beginPath(); ctx.arc(sx, -w * 0.28, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(sx, w * 0.28, 2.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawHub(ctx, x, y, r) {
  // outer ring
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, 1, x, y, r);
  g.addColorStop(0, '#dce1e6');
  g.addColorStop(0.45, '#7a8088');
  g.addColorStop(0.9, '#1e2125');
  g.addColorStop(1, '#0e1013');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(x, y, r - 0.5, 0, Math.PI * 2); ctx.stroke();
  // inner bearing
  ctx.fillStyle = '#0f1114';
  ctx.beginPath(); ctx.arc(x, y, r * 0.45, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.stroke();
  // center dot
  ctx.fillStyle = 'rgba(158,203,255,0.85)';
  ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill();
}

function drawGripper(ctx, wx, wy, gx, gy, ang) {
  ctx.save();
  ctx.translate(wx, wy);
  ctx.rotate(ang);
  // wrist block
  const bodyG = ctx.createLinearGradient(0, -12, 0, 12);
  bodyG.addColorStop(0, '#3a3f46');
  bodyG.addColorStop(0.5, '#8a9099');
  bodyG.addColorStop(1, '#20232a');
  ctx.fillStyle = bodyG;
  ctx.beginPath(); ctx.roundRect(0, -13, 22, 26, 4); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.stroke();
  // finger upper
  ctx.fillStyle = '#8a9099';
  ctx.beginPath();
  ctx.moveTo(22, -12);
  ctx.lineTo(36, -10);
  ctx.lineTo(40, -6);
  ctx.lineTo(34, -4);
  ctx.lineTo(22, -6);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.stroke();
  // finger lower
  ctx.beginPath();
  ctx.moveTo(22, 12);
  ctx.lineTo(36, 10);
  ctx.lineTo(40, 6);
  ctx.lineTo(34, 4);
  ctx.lineTo(22, 6);
  ctx.closePath(); ctx.fill();
  ctx.stroke();
  // small led
  ctx.fillStyle = 'rgba(158,203,255,0.9)';
  ctx.beginPath(); ctx.arc(6, 0, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawSegment(ctx, x1, y1, x2, y2, w) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const len = Math.hypot(x2 - x1, y2 - y1);
  ctx.save();
  ctx.translate(x1, y1);
  ctx.rotate(ang);
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.roundRect(0, -w / 2 + 3, len, w, w / 2);
  ctx.fill();
  // metal gradient
  const g = ctx.createLinearGradient(0, -w / 2, 0, w / 2);
  g.addColorStop(0, '#2a2f36');
  g.addColorStop(0.3, '#51585f');
  g.addColorStop(0.5, '#8a929b');
  g.addColorStop(0.7, '#51585f');
  g.addColorStop(1, '#1a1d22');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(0, -w / 2, len, w, w / 2);
  ctx.fill();
  // highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(2, -w / 2 + 2);
  ctx.lineTo(len - 2, -w / 2 + 2);
  ctx.stroke();
  ctx.restore();
}

function drawJoint(ctx, x, y, r) {
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r);
  g.addColorStop(0, '#c6ccd3');
  g.addColorStop(0.5, '#666d75');
  g.addColorStop(1, '#1b1e22');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath(); ctx.arc(x, y, r - 0.5, 0, Math.PI * 2); ctx.stroke();
}

function drawEE(ctx, x, y, ang, side) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  // gripper
  ctx.fillStyle = '#3a4149';
  ctx.fillRect(-3, -10, 16, 20);
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.strokeRect(-3, -10, 16, 20);
  // fingers
  ctx.fillStyle = '#8a929b';
  ctx.fillRect(11, -10, 4, 7);
  ctx.fillRect(11, 3, 4, 7);
  // soft glow
  const g = ctx.createRadialGradient(10, 0, 1, 10, 0, 22);
  g.addColorStop(0, 'rgba(158,203,255,0.35)');
  g.addColorStop(1, 'rgba(158,203,255,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(10, 0, 22, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/* =========================================================
   System diagrams (SVG) — one per system
   ========================================================= */
export const DIAGRAMS = {
  crutch: (
    <svg viewBox="0 0 500 180" width="100%" style={{ maxHeight: 200 }}>
      <defs>
        <marker id="ar" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0 L5 3 L0 6" fill="#9ecbff"/></marker>
      </defs>
      {[
        ['FSR·L', 30, 30], ['FSR·R', 30, 110],
        ['ESP32', 170, 70], ['Controller', 310, 70], ['Servo·L', 450, 30], ['Servo·R', 450, 110],
      ].map(([l, x, y]) => (
        <g key={l}>
          <rect x={x} y={y} width={80} height={40} rx={4} stroke="rgba(255,255,255,0.2)" fill="rgba(255,255,255,0.03)"/>
          <text x={x + 40} y={y + 24} fill="#e0e5eb" fontSize={11} textAnchor="middle" fontFamily="JetBrains Mono">{l}</text>
        </g>
      ))}
      <path d="M110 50 L170 85" stroke="#9ecbff" strokeDasharray="2 2" fill="none" markerEnd="url(#ar)"/>
      <path d="M110 130 L170 95" stroke="#9ecbff" strokeDasharray="2 2" fill="none" markerEnd="url(#ar)"/>
      <path d="M250 90 L310 90" stroke="#9ecbff" fill="none" markerEnd="url(#ar)"/>
      <path d="M390 85 L450 50" stroke="#9ecbff" strokeDasharray="2 2" fill="none" markerEnd="url(#ar)"/>
      <path d="M390 95 L450 130" stroke="#9ecbff" strokeDasharray="2 2" fill="none" markerEnd="url(#ar)"/>
      <text x={250} y={160} textAnchor="middle" fontFamily="JetBrains Mono" fontSize={9} fill="#8a939d" letterSpacing="2">CALIBRATE · FILTER · THRESHOLD · TAP</text>
    </svg>
  ),
  testbench: (
    <svg viewBox="0 0 500 180" width="100%" style={{ maxHeight: 200 }}>
      <defs>
        <marker id="ar2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0 L5 3 L0 6" fill="#9ecbff"/></marker>
      </defs>
      {[
        ['Arduino', 30, 30], ['VESC', 30, 110], ['Rotor', 170, 70], ['PCB Stator', 310, 70], ['ESP32 DAQ', 450, 30], ['ANSYS Fluent', 450, 110],
      ].map(([l, x, y]) => (
        <g key={l}>
          <rect x={x} y={y} width={80} height={40} rx={4} stroke="rgba(255,255,255,0.2)" fill="rgba(255,255,255,0.03)"/>
          <text x={x + 40} y={y + 24} fill="#e0e5eb" fontSize={11} textAnchor="middle" fontFamily="JetBrains Mono">{l}</text>
        </g>
      ))}
      <path d="M110 50 L170 85" stroke="#9ecbff" fill="none" markerEnd="url(#ar2)"/>
      <path d="M110 130 L170 95" stroke="#9ecbff" fill="none" markerEnd="url(#ar2)"/>
      <path d="M250 90 L310 90" stroke="#9ecbff" fill="none" markerEnd="url(#ar2)"/>
      <path d="M390 85 L450 50" stroke="#9ecbff" strokeDasharray="2 2" fill="none" markerEnd="url(#ar2)"/>
      <path d="M390 95 L450 130" stroke="#9ecbff" strokeDasharray="2 2" fill="none" markerEnd="url(#ar2)"/>
      <text x={250} y={160} textAnchor="middle" fontFamily="JetBrains Mono" fontSize={9} fill="#8a939d" letterSpacing="2">DRIVE · MEASURE · SIMULATE · CORRELATE</text>
    </svg>
  ),
  youbot: (
    <svg viewBox="0 0 500 180" width="100%" style={{ maxHeight: 200 }}>
      <defs>
        <marker id="ar3" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0 L5 3 L0 6" fill="#9ecbff"/></marker>
      </defs>
      {[
        ['Trajectory', 20, 70, 'SE(3) · 8-seg'],
        ['FF + PI', 150, 70, 'Xerr twist'],
        ['Jacobian⁻¹', 280, 70, 'Body-frame'],
        ['Integrator', 410, 70, 'Euler update'],
      ].map(([l, x, y, s]) => (
        <g key={l}>
          <rect x={x} y={y} width={90} height={42} rx={4} stroke="rgba(255,255,255,0.2)" fill="rgba(255,255,255,0.03)"/>
          <text x={x + 45} y={y + 18} fill="#e0e5eb" fontSize={11} textAnchor="middle" fontFamily="JetBrains Mono">{l}</text>
          <text x={x + 45} y={y + 33} fill="#8a939d" fontSize={9} textAnchor="middle" fontFamily="JetBrains Mono">{s}</text>
        </g>
      ))}
      <path d="M110 90 L150 90" stroke="#9ecbff" fill="none" markerEnd="url(#ar3)"/>
      <path d="M240 90 L280 90" stroke="#9ecbff" fill="none" markerEnd="url(#ar3)"/>
      <path d="M370 90 L410 90" stroke="#9ecbff" fill="none" markerEnd="url(#ar3)"/>
      <path d="M455 112 C 455 150, 195 150, 195 112" stroke="#9ecbff" strokeDasharray="3 3" fill="none" markerEnd="url(#ar3)"/>
      <text x={300} y={165} textAnchor="middle" fontFamily="JetBrains Mono" fontSize={9} fill="#8a939d" letterSpacing="2">FEEDBACK LOOP · CHASSIS + ARM CO-CONTROL</text>
    </svg>
  ),
  soniccar: (
    <svg viewBox="0 0 500 180" width="100%" style={{ maxHeight: 200 }}>
      <defs>
        <marker id="ar4" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0 L5 3 L0 6" fill="#9ecbff"/></marker>
      </defs>
      {[
        ['Mic', 30, 20], ['Gemini LLM', 30, 70], ['LiDAR', 30, 120],
        ['ROS 2', 200, 70], ['Safety', 200, 120],
        ['VESC', 370, 70],
      ].map(([l, x, y]) => (
        <g key={l}>
          <rect x={x} y={y} width={90} height={36} rx={4} stroke="rgba(255,255,255,0.2)" fill="rgba(255,255,255,0.03)"/>
          <text x={x + 45} y={y + 22} fill="#e0e5eb" fontSize={11} textAnchor="middle" fontFamily="JetBrains Mono">{l}</text>
        </g>
      ))}
      <path d="M120 38 L200 80" stroke="#9ecbff" strokeDasharray="2 2" fill="none" markerEnd="url(#ar4)"/>
      <path d="M120 88 L200 88" stroke="#9ecbff" fill="none" markerEnd="url(#ar4)"/>
      <path d="M120 138 L200 130" stroke="#f2c073" fill="none" markerEnd="url(#ar4)"/>
      <path d="M290 88 L370 88" stroke="#9ecbff" fill="none" markerEnd="url(#ar4)"/>
      <path d="M290 130 C 330 130, 340 100, 370 92" stroke="#f2c073" strokeDasharray="3 3" fill="none" markerEnd="url(#ar4)"/>
      <text x={430} y={40} fill="#f2c073" fontSize={9} fontFamily="JetBrains Mono" letterSpacing="1">OVERRIDE</text>
    </svg>
  ),
  twip: (
    <svg viewBox="0 0 500 180" width="100%" style={{ maxHeight: 200 }}>
      <defs>
        <marker id="ar5" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0 L5 3 L0 6" fill="#9ecbff"/></marker>
      </defs>
      {[
        ['x = [h,m,r]', 20, 70, 'Morphology'],
        ['A(x), B(x)', 150, 30, 'State-space'],
        ['LQR synth', 150, 110, 'K'],
        ['Nonlin sim', 290, 70, '∫ J dt'],
        ['SLSQP', 420, 70, '∇J'],
      ].map(([l, x, y, s]) => (
        <g key={l}>
          <rect x={x} y={y} width={90} height={42} rx={4} stroke="rgba(255,255,255,0.2)" fill="rgba(255,255,255,0.03)"/>
          <text x={x + 45} y={y + 18} fill="#e0e5eb" fontSize={11} textAnchor="middle" fontFamily="JetBrains Mono">{l}</text>
          <text x={x + 45} y={y + 33} fill="#8a939d" fontSize={9} textAnchor="middle" fontFamily="JetBrains Mono">{s}</text>
        </g>
      ))}
      <path d="M110 85 L150 55" stroke="#9ecbff" fill="none" markerEnd="url(#ar5)"/>
      <path d="M110 95 L150 125" stroke="#9ecbff" fill="none" markerEnd="url(#ar5)"/>
      <path d="M240 55 L290 85" stroke="#9ecbff" fill="none" markerEnd="url(#ar5)"/>
      <path d="M240 125 L290 95" stroke="#9ecbff" fill="none" markerEnd="url(#ar5)"/>
      <path d="M380 90 L420 90" stroke="#9ecbff" fill="none" markerEnd="url(#ar5)"/>
      <path d="M465 112 C 465 150, 65 150, 65 112" stroke="#9ecbff" strokeDasharray="3 3" fill="none" markerEnd="url(#ar5)"/>
      <text x={250} y={165} textAnchor="middle" fontFamily="JetBrains Mono" fontSize={9} fill="#8a939d" letterSpacing="2">NESTED MDO · OUTER MORPH · INNER CONTROL</text>
    </svg>
  ),
  franck: (
    <svg viewBox="0 0 500 180" width="100%" style={{ maxHeight: 200 }}>
      <g stroke="rgba(255,255,255,0.2)" fill="rgba(255,255,255,0.03)">
        <rect x="60" y="110" width="180" height="30" rx="3"/>
        <circle cx="90" cy="150" r="10"/><circle cx="210" cy="150" r="10"/>
        <rect x="140" y="60" width="20" height="55"/>
        <rect x="155" y="52" width="130" height="10"/>
        <rect x="275" y="35" width="40" height="30" rx="2"/>
        <rect x="310" y="42" width="15" height="15"/>
      </g>
      <g stroke="#9ecbff" fill="none">
        <path d="M150 140 L150 115" strokeDasharray="2 2"/>
        <path d="M170 62 L270 50" strokeDasharray="2 2"/>
      </g>
      <g fill="#e0e5eb" fontSize={10} fontFamily="JetBrains Mono">
        <text x={150} y={105}>Arm upright</text>
        <text x={175} y={48}>Parallel rail</text>
        <text x={280} y={30}>Clamp</text>
        <text x={150} y={172} textAnchor="middle">Chassis · DC-geared drive</text>
      </g>
    </svg>
  ),
  softrobot: (
    <svg viewBox="0 0 500 180" width="100%" style={{ maxHeight: 200 }}>
      <g fill="rgba(158,203,255,0.12)" stroke="#9ecbff">
        <path d="M40 110 L80 110 L85 90 L95 110 L105 90 L115 110 L125 90 L135 110 L175 110 Z"/>
        <text x={110} y={80} textAnchor="middle" fontFamily="JetBrains Mono" fontSize={10} fill="#9ecbff">Longitudinal · 4-tooth</text>
      </g>
      <g fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.35)">
        <path d="M210 110 L250 110 L260 90 L270 110 L280 90 L290 110 L300 90 L310 110 L350 110 Z"/>
        <text x={280} y={80} textAnchor="middle" fontFamily="JetBrains Mono" fontSize={10} fill="#c8cfd6">Christmas Tree</text>
      </g>
      <g fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.35)">
        <path d="M385 110 L465 110" strokeWidth="1.5"/>
        <text x={425} y={80} textAnchor="middle" fontFamily="JetBrains Mono" fontSize={10} fill="#c8cfd6">Flat control</text>
      </g>
      <g stroke="rgba(255,255,255,0.15)" strokeDasharray="2 3">
        <line x1="20" y1="130" x2="480" y2="130"/>
      </g>
      <text x={250} y={170} textAnchor="middle" fontFamily="JetBrains Mono" fontSize={9} fill="#8a939d" letterSpacing="2">GRANULAR SUBSTRATE · SAND</text>
    </svg>
  ),
  crutchonyou: (
    <svg viewBox="0 0 500 180" width="100%" style={{ maxHeight: 200 }}>
      <g stroke="rgba(255,255,255,0.25)" fill="rgba(255,255,255,0.04)">
        <circle cx="250" cy="40" r="14"/>
        <rect x="242" y="54" width="16" height="46" rx="3"/>
        <rect x="210" y="90" width="80" height="18" rx="4" fill="rgba(158,203,255,0.12)" stroke="#9ecbff"/>
        <line x1="220" y1="108" x2="210" y2="155"/>
        <line x1="280" y1="108" x2="290" y2="155"/>
        <line x1="205" y1="155" x2="215" y2="155"/>
        <line x1="285" y1="155" x2="295" y2="155"/>
      </g>
      <g fontFamily="JetBrains Mono" fontSize={10} fill="#9ecbff">
        <text x={310} y={100}>Waist support · 2-DOF anchor</text>
      </g>
      <g fontFamily="JetBrains Mono" fontSize={10} fill="#8a939d">
        <text x={310} y={140}>Forearm bipod</text>
        <text x={250} y={175} textAnchor="middle" letterSpacing="2">LOAD PATH · WAISTLINE, NOT ARMPIT</text>
      </g>
    </svg>
  ),
};

/* =========================================================
   Plot canvases — SVG-based per-system
   ========================================================= */
export const PLOTS = {
  tapTrain: (
    <PlotFrame title="ASYMMETRY · TAP EVENTS" ySeries={[{name:'Load Δ (kg)', color:'#9ecbff'},{name:'Tap', color:'#f2c073'}]}>
      {(W, H, p) => {
        const pts = [];
        for (let i = 0; i <= 60; i++) {
          const t = i / 60;
          const v = 4 + 4 * Math.sin(t * 8) * Math.exp(-t*0.8) + Math.sin(t * 23) * 0.8;
          pts.push([p.l + t * (W - p.l - p.r), p.t + ((8 - v) / 10) * (H - p.t - p.b)]);
        }
        const d = 'M' + pts.map(pp => pp.join(' ')).join(' L');
        const taps = [0.08,0.11,0.14,0.18,0.21,0.24,0.30,0.33,0.38,0.44,0.48,0.52,0.55,0.62,0.68,0.72,0.76,0.84,0.91].map(t => ({
          x: p.l + t * (W - p.l - p.r),
          y: p.t + ((8 - (4 + 4 * Math.sin(t * 8) * Math.exp(-t*0.8))) / 10) * (H - p.t - p.b),
        }));
        return (
          <>
            <path d={d} stroke="#9ecbff" strokeWidth="1.2" fill="none"/>
            {taps.map((tt, i) => <circle key={i} cx={tt.x} cy={tt.y} r={1.8} fill="#f2c073"/>)}
          </>
        );
      }}
    </PlotFrame>
  ),
  thermal: (
    <PlotFrame title="STATOR TEMP · RPM SWEEP" ySeries={[{name:'Baseline (°C)', color:'#c8cfd6'},{name:'Optimized', color:'#9ecbff'}]}>
      {(W, H, p) => {
        const curve = (t, amp) => 20 + amp * (1 - Math.exp(-t * 3));
        const a = [], b = [];
        for (let i = 0; i <= 60; i++) {
          const t = i / 60;
          a.push([p.l + t * (W - p.l - p.r), p.t + ((75 - curve(t, 55)) / 80) * (H - p.t - p.b)]);
          b.push([p.l + t * (W - p.l - p.r), p.t + ((75 - curve(t, 30)) / 80) * (H - p.t - p.b)]);
        }
        return (
          <>
            <path d={'M' + a.map(pp => pp.join(' ')).join(' L')} stroke="#c8cfd6" strokeWidth="1.2" fill="none" strokeDasharray="3 3"/>
            <path d={'M' + b.map(pp => pp.join(' ')).join(' L')} stroke="#9ecbff" strokeWidth="1.4" fill="none"/>
          </>
        );
      }}
    </PlotFrame>
  ),
  ffpi: (
    <PlotFrame title="ERROR TWIST · CONVERGENCE" ySeries={[{name:'||Xerr||', color:'#9ecbff'}]}>
      {(W, H, p) => {
        const pts = [];
        for (let i = 0; i <= 60; i++) {
          const t = i / 60;
          const v = 0.5 * Math.exp(-t * 3.5) + 0.04 * Math.sin(t * 25) * Math.exp(-t * 3);
          pts.push([p.l + t * (W - p.l - p.r), p.t + ((0.6 - v) / 0.6) * (H - p.t - p.b)]);
        }
        return <path d={'M' + pts.map(pp => pp.join(' ')).join(' L')} stroke="#9ecbff" strokeWidth="1.4" fill="none"/>;
      }}
    </PlotFrame>
  ),
  soniccar: (
    <PlotFrame title="LiDAR RANGE · OVERRIDE WINDOW" ySeries={[{name:'Distance (m)', color:'#9ecbff'},{name:'Threshold', color:'#f2c073'}]}>
      {(W, H, p) => {
        const pts = [];
        for (let i = 0; i <= 60; i++) {
          const t = i / 60;
          const v = 1.4 - 1.0 * t + 0.1 * Math.sin(t * 20);
          pts.push([p.l + t * (W - p.l - p.r), p.t + ((1.6 - Math.max(0,v)) / 1.6) * (H - p.t - p.b)]);
        }
        const yTh = p.t + ((1.6 - 0.4) / 1.6) * (H - p.t - p.b);
        return (
          <>
            <line x1={p.l} y1={yTh} x2={W - p.r} y2={yTh} stroke="#f2c073" strokeDasharray="3 3"/>
            <path d={'M' + pts.map(pp => pp.join(' ')).join(' L')} stroke="#9ecbff" strokeWidth="1.4" fill="none"/>
          </>
        );
      }}
    </PlotFrame>
  ),
  twip: (
    <PlotFrame title="PITCH RESPONSE · DISTURBANCE SWEEP" ySeries={[{name:'θ (°) — 5°', color:'#9ecbff'},{name:'θ (°) — 20°', color:'#f2c073'}]}>
      {(W, H, p) => {
        const a = [], b = [];
        for (let i = 0; i <= 60; i++) {
          const t = i / 60;
          a.push([p.l + t * (W - p.l - p.r), p.t + ((20 - (5 * Math.exp(-t*5) * Math.cos(t*14))) / 40) * (H - p.t - p.b)]);
          b.push([p.l + t * (W - p.l - p.r), p.t + ((20 - (20 * Math.exp(-t*3) * Math.cos(t*10))) / 40) * (H - p.t - p.b)]);
        }
        return (
          <>
            <path d={'M' + a.map(pp => pp.join(' ')).join(' L')} stroke="#9ecbff" strokeWidth="1.4" fill="none"/>
            <path d={'M' + b.map(pp => pp.join(' ')).join(' L')} stroke="#f2c073" strokeWidth="1.2" fill="none"/>
          </>
        );
      }}
    </PlotFrame>
  ),
  franck: (
    <PlotFrame title="LIFT · FBD vs MEASURED" ySeries={[{name:'Predicted (g)', color:'#c8cfd6'},{name:'Measured', color:'#9ecbff'}]}>
      {(W, H, p) => {
        const bars = [
          { x: 0.25, v: 128.7, c: '#c8cfd6' },
          { x: 0.65, v: 180, c: '#9ecbff' },
        ];
        const maxV = 200;
        return bars.map((b, i) => {
          const bx = p.l + b.x * (W - p.l - p.r);
          const by = p.t + ((maxV - b.v) / maxV) * (H - p.t - p.b);
          return (
            <g key={i}>
              <rect x={bx - 30} y={by} width={60} height={H - p.t - p.b - (by - p.t)} fill={b.c} opacity={0.2}/>
              <rect x={bx - 30} y={by} width={60} height={2} fill={b.c}/>
              <text x={bx} y={by - 6} textAnchor="middle" fontFamily="JetBrains Mono" fontSize={10} fill={b.c}>{b.v} g</text>
            </g>
          );
        });
      }}
    </PlotFrame>
  ),
  softrobot: (
    <PlotFrame title="FORWARD TRAVEL · GEOMETRY" ySeries={[{name:'Longitudinal', color:'#9ecbff'},{name:'Christmas Tree', color:'#c8cfd6'},{name:'Flat', color:'#5a6169'}]}>
      {(W, H, p) => {
        const groups = [['Solid', [3.2, 8.1, 5.4]], ['Sand', [9.0, 2.1, 3.8]]];
        const maxV = 10;
        const cols = ['#9ecbff','#c8cfd6','#5a6169'];
        return groups.flatMap((g, gi) => {
          const gx = p.l + (gi + 0.5) / groups.length * (W - p.l - p.r);
          return g[1].map((v, vi) => {
            const bw = 22;
            const bx = gx - ((g[1].length - 1) * bw) / 2 + vi * bw - bw / 2;
            const by = p.t + ((maxV - v) / maxV) * (H - p.t - p.b);
            return (
              <g key={`${gi}-${vi}`}>
                <rect x={bx} y={by} width={bw - 3} height={H - p.t - p.b - (by - p.t)} fill={cols[vi]} opacity={0.25}/>
                <rect x={bx} y={by} width={bw - 3} height={2} fill={cols[vi]}/>
              </g>
            );
          }).concat(
            <text key={`l-${gi}`} x={gx} y={H - p.b + 14} textAnchor="middle" fontFamily="JetBrains Mono" fontSize={10} fill="#8a939d">{g[0]}</text>
          );
        });
      }}
    </PlotFrame>
  ),
  crutchonyou: (
    <PlotFrame title="COMPETITIVE POSITIONING" ySeries={[{name:'Crutch On You', color:'#9ecbff'},{name:'Axillary', color:'#5a6169'},{name:'Forearm', color:'#c8cfd6'}]}>
      {(W, H, p) => {
        const axes = ['Comfort', 'Hand', 'Posture', 'Stability'];
        const cx = p.l + (W - p.l - p.r) / 2;
        const cy = p.t + (H - p.t - p.b) / 2;
        const R = Math.min((W - p.l - p.r), (H - p.t - p.b)) / 2 - 10;
        const polygon = (vals, color) => axes.map((_, i) => {
          const a = -Math.PI / 2 + (i / axes.length) * Math.PI * 2;
          return [cx + Math.cos(a) * R * vals[i], cy + Math.sin(a) * R * vals[i]];
        });
        const toPath = (pts) => 'M' + pts.map(pp => pp.join(' ')).join(' L') + ' Z';
        return (
          <>
            {[0.25,0.5,0.75,1].map(r => (
              <polygon key={r} points={axes.map((_, i) => {
                const a = -Math.PI / 2 + (i / axes.length) * Math.PI * 2;
                return `${cx + Math.cos(a) * R * r},${cy + Math.sin(a) * R * r}`;
              }).join(' ')} fill="none" stroke="rgba(255,255,255,0.06)"/>
            ))}
            <path d={toPath(polygon([0.45,0.3,0.4,0.55], '#5a6169'))} stroke="#5a6169" fill="#5a616922"/>
            <path d={toPath(polygon([0.7,0.55,0.6,0.7], '#c8cfd6'))} stroke="#c8cfd6" fill="#c8cfd61a"/>
            <path d={toPath(polygon([0.95,0.92,0.88,0.9], '#9ecbff'))} stroke="#9ecbff" fill="#9ecbff2a" strokeWidth={1.3}/>
            {axes.map((ax, i) => {
              const a = -Math.PI / 2 + (i / axes.length) * Math.PI * 2;
              return <text key={ax} x={cx + Math.cos(a) * (R + 12)} y={cy + Math.sin(a) * (R + 12) + 4} textAnchor="middle" fontFamily="JetBrains Mono" fontSize={10} fill="#8a939d">{ax}</text>;
            })}
          </>
        );
      }}
    </PlotFrame>
  ),
};

function PlotFrame({ title, ySeries, children }) {
  const ref = useRef(null);
  const [size, setSize] = useState({ W: 400, H: 220 });
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setSize({ W: e.contentRect.width, H: e.contentRect.height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  const p = { l: 38, r: 16, t: 10, b: 24 };
  return (
    <div ref={ref} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 200 }}>
      <div className="spread" style={{ marginBottom: 10 }}>
        <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '.2em', textTransform: 'uppercase' }}>{title}</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {ySeries.map((s, i) => (
            <div key={i} className="row" style={{ gap: 6 }}>
              <span style={{ width: 10, height: 1.5, background: s.color, display: 'inline-block' }}/>
              <span className="mono" style={{ fontSize: 9.5, color: 'var(--ink-2)' }}>{s.name}</span>
            </div>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${size.W} ${size.H}`} style={{ flex: 1, width: '100%', height: '100%' }}>
        {/* grid */}
        {[0.25, 0.5, 0.75].map((f, i) => (
          <line key={i} x1={p.l} x2={size.W - p.r} y1={p.t + f * (size.H - p.t - p.b)} y2={p.t + f * (size.H - p.t - p.b)} stroke="rgba(255,255,255,0.05)"/>
        ))}
        <line x1={p.l} y1={p.t} x2={p.l} y2={size.H - p.b} stroke="rgba(255,255,255,0.12)"/>
        <line x1={p.l} y1={size.H - p.b} x2={size.W - p.r} y2={size.H - p.b} stroke="rgba(255,255,255,0.12)"/>
        {children(size.W, size.H, p)}
      </svg>
    </div>
  );
}

/* =========================================================
   Notebook placeholder card
   ========================================================= */
export const NbPlaceholder = ({ label, kind = 'image' }) => (
  <div className="media">
    <div className="placeholder-grid"/>
    <div className="placeholder-label">
      <Icon name={kind} size={22} stroke="#c8cfd6"/>
      <span>{label}</span>
    </div>
  </div>
);

if (typeof window !== 'undefined') {
  window.Icon = Icon;
  window.RobotCanvas = RobotCanvas;
  window.DIAGRAMS = DIAGRAMS;
  window.PLOTS = PLOTS;
  window.NbPlaceholder = NbPlaceholder;
}
