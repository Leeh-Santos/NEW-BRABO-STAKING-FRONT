import { useEffect, useRef } from "react";

const PITCH = 22; // px between samples
const SPEED = 11; // px per second, leftward — slower than a price tape; accrual is patient
const MAX_DPR = 1.5; // beyond this the fidelity is invisible and the fill cost is not

/** Rolling series state. Created per mount (never module-scoped) so React's
 * StrictMode double-invoke can't leave two walks fighting over one series. */
interface Walk {
  i: number;
}

/** One sample of the accrual curve, in 0..1.
 *
 * Three incommensurable periods, the longest dominant. That long period is what
 * makes this read as *accrual* rather than as price: its wavelength is several
 * viewports wide, so within any one screen the curve is a gentle arc climbing or
 * cresting, never the jagged reversals of a candle series. The two shorter terms
 * keep it from looking like a plotted sine. */
function sample(w: Walk): number {
  w.i += 1;
  const t = w.i;
  const v =
    0.52 + 0.3 * Math.sin(t / 118) + 0.1 * Math.sin(t / 27.4) + 0.04 * Math.sin(t / 7.9);
  return Math.min(0.95, Math.max(0.06, v));
}

/** The live background: a slow accrual curve.
 *
 * Brabo Markets stands on a candlestick field, because Markets is a trading
 * product and price action is what it is about. Staking is not: nothing here
 * ticks up and down against you, it accrues. So the same floor is drawn as a
 * single rising curve with the area beneath it filled — one colour, the
 * product's mint, with no red, because an accrual has no down bar.
 *
 * The cost model is Markets' and deliberately tiny: one canvas, one path per
 * redraw, capped at 1.5× DPR, and it never touches React state, never reflows,
 * and stops entirely when the tab is hidden or reduced motion is asked for. */
export function AccrualField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const walk: Walk = { i: Math.floor(Math.random() * 400) };
    let points: number[] = [];
    let offset = 0;
    let width = 0;
    let height = 0;
    let frame = 0;
    let last = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

      // Clamp to the viewport. This layer is `position: fixed; inset: 0`, so it
      // can never legitimately be larger — and the clamp is what makes the
      // pathological case impossible rather than merely unlikely. Writing
      // `canvas.width` sets the element's *intrinsic* size; if the CSS size is
      // ever missing, layout falls back to that intrinsic size, the
      // ResizeObserver below fires again, and the canvas grows by `dpr` on every
      // pass until the browser refuses to allocate it and paints a broken image
      // across the page. Bounding the read breaks that cycle at the source.
      // The element is one pitch wider than the viewport (see background.css):
      // that overhang is what the drift slides in from.
      const w = Math.min(canvas.clientWidth, window.innerWidth + PITCH);
      const h = Math.min(canvas.clientHeight, window.innerHeight);
      if (w === width && h === height) return; // nothing to do, and no realloc

      width = w;
      height = h;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Two extra samples so the curve enters and leaves off-screen, never popping.
      const needed = Math.ceil(width / PITCH) + 2;
      while (points.length < needed) points.push(sample(walk));
      points = points.slice(-needed);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Baseline sits low: the field is a floor the page stands on, and the
      // upper viewport (where the copy lives) stays clear.
      const base = height * 0.9;
      const amp = Math.min(height * 0.5, 420);
      const y = (v: number) => base - v * amp;

      // Faint level rules, the way a yield chart is ruled. Drawn first so the
      // area fill sits over them.
      ctx.strokeStyle = "rgba(47, 212, 182, 0.06)";
      ctx.lineWidth = 1;
      for (const level of [0.25, 0.55, 0.85]) {
        const ly = Math.round(y(level)) + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, ly);
        ctx.lineTo(width, ly);
        ctx.stroke();
      }

      if (points.length < 2) return;

      // Samples sit at fixed positions; the drift is the element's transform,
      // not a per-frame offset baked into the geometry.
      const px = (i: number) => i * PITCH;

      // Built once as a Path2D and reused: the area is the same curve with a
      // floor closed under it, so tracing the quadratics twice would be both
      // slower and a chance for the two to drift apart.
      const curve = new Path2D();
      curve.moveTo(px(0), y(points[0]));
      for (let i = 1; i < points.length; i++) {
        // Midpoint quadratics: a smooth curve through every sample without the
        // overshoot a Catmull-Rom spline would give on the steeper stretches.
        const cx = (px(i - 1) + px(i)) / 2;
        curve.quadraticCurveTo(
          px(i - 1),
          y(points[i - 1]),
          cx,
          (y(points[i - 1]) + y(points[i])) / 2,
        );
      }
      curve.lineTo(px(points.length - 1), y(points[points.length - 1]));

      // The area under the curve, fading out downward so it dissolves into the
      // ground rather than ending on a hard edge.
      const area = new Path2D(curve);
      area.lineTo(px(points.length - 1), base);
      area.lineTo(px(0), base);
      area.closePath();

      const fill = ctx.createLinearGradient(0, y(1), 0, base);
      fill.addColorStop(0, "rgba(47, 212, 182, 0.10)");
      fill.addColorStop(1, "rgba(47, 212, 182, 0)");
      ctx.fillStyle = fill;
      ctx.fill(area);

      // The curve itself, brightening slightly toward the right so the eye reads
      // a direction of travel without any of it becoming legible.
      const stroke = ctx.createLinearGradient(0, 0, width, 0);
      stroke.addColorStop(0, "rgba(47, 212, 182, 0.14)");
      stroke.addColorStop(1, "rgba(47, 212, 182, 0.34)");
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1.5;
      ctx.stroke(curve);

      // A tick dropped at each sample — the discrete accrual events under the
      // continuous curve.
      for (let i = 0; i < points.length; i++) {
        const x = Math.round(px(i)) + 0.5;
        if (x < -PITCH || x > width + PITCH) continue;
        const top = y(points[i]);
        ctx.strokeStyle = `rgba(47, 212, 182, ${0.04 + (x / Math.max(width, 1)) * 0.07})`;
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, base);
        ctx.stroke();
      }
    };

    /* The drift is a compositor transform, and the pixels are only redrawn when
     * a sample actually leaves.
     *
     * The field travels at SPEED px/s, so at 60fps a frame moves it a fifth of a
     * pixel. Repainting a full-viewport canvas to move it that far — sixty times
     * a second, forever — would be by a distance the most expensive thing on the
     * page. Translating the element instead costs no raster at all, and the
     * geometry only changes when the offset passes one PITCH: every
     * PITCH / SPEED = 2s. That takes the redraw rate from 60/s to 0.5/s while
     * looking exactly the same. */
    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      offset += SPEED * dt;

      let shifted = false;
      while (offset >= PITCH) {
        offset -= PITCH;
        points.push(sample(walk));
        points.shift();
        shifted = true;
      }
      if (shifted) draw();

      canvas.style.transform = `translate3d(${-offset}px, 0, 0)`;
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frame || reduced.matches || document.hidden) return;
      last = 0;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    // rAF is already throttled in a background tab, but stopping outright means
    // a backgrounded tab burns nothing at all.
    const onVisibility = () => (document.hidden ? stop() : start());
    const onMotionChange = () => {
      stop();
      draw();
      start();
    };

    resize();
    draw();
    start();

    const observer = new ResizeObserver(() => {
      resize();
      draw();
    });
    observer.observe(canvas);
    document.addEventListener("visibilitychange", onVisibility);
    reduced.addEventListener("change", onMotionChange);

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", onMotionChange);
    };
  }, []);

  return <canvas ref={canvasRef} className="accrual-field" aria-hidden="true" />;
}
