/**
 * Derived spring values. duration/bounce use the SwiftUI model that Flutter's
 * SpringDescription.withDurationAndBounce reproduces: duration = 2*pi/omega,
 * bounce = 1 - zeta (under-damped) or 1/zeta - 1 (over-damped).
 * cssEasing samples the motion into a CSS linear() curve that lasts settleMs.
 */
export function deriveSpring({ mass, stiffness, damping }) {
  const omega = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const duration = (2 * Math.PI) / omega;
  const bounce = zeta < 1 ? 1 - zeta : 1 / zeta - 1;
  // Position of a spring released from 0 towards 1 at rest, at time t.
  const x = (t) => {
    if (zeta < 1) {
      const wd = omega * Math.sqrt(1 - zeta * zeta);
      return 1 - Math.exp(-zeta * omega * t) * (Math.cos(wd * t) + ((zeta * omega) / wd) * Math.sin(wd * t));
    }
    if (zeta === 1) return 1 - Math.exp(-omega * t) * (1 + omega * t);
    const r1 = -omega * (zeta - Math.sqrt(zeta * zeta - 1));
    const r2 = -omega * (zeta + Math.sqrt(zeta * zeta - 1));
    return 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1);
  };
  // Settled once it stays within 0.1% of the target.
  let settle = 0;
  for (let t = 0; t < 5; t += 0.001) if (Math.abs(1 - x(t)) > 0.001) settle = t;
  settle = Math.ceil(settle * 1000) / 1000;
  const steps = 40;
  const stops = Array.from({ length: steps + 1 }, (_, i) => +x((settle * i) / steps).toFixed(4));
  stops[steps] = 1;
  return {
    mass,
    stiffness,
    damping,
    dampingRatio: +zeta.toFixed(4),
    duration: +duration.toFixed(4),
    bounce: +bounce.toFixed(4),
    settleMs: Math.round(settle * 1000),
    cssEasing: `linear(${stops.join(', ')})`,
  };
}
