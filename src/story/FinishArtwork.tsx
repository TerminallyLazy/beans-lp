import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// Deterministic halftone ink: quiet at the edges, with an airy coral current.
// Decorative care symbols carry the grid reference without product claims.
const dots = Array.from({ length: 44 * 40 }, (_, i) => {
  const x = i % 44 * 12, y = Math.floor(i / 44) * 12;
  const dx = (x - 265) / 190, dy = (y - 240) / 170;
  const ink = Math.exp(-(dx * dx + dy * dy) * 1.3) * (.7 + .3 * Math.sin(x * .018 + y * .012));
  return { x, y, ink };
}).filter(dot => dot.ink > .055);

export default function FinishArtwork() {
  const root = useRef<SVGSVGElement>(null);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion:no-preference)', () => {
      const motion = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } });
      motion.fromTo('.finish-ink', { y: 12, rotation: -3, transformOrigin: '50% 50%' }, { y: -10, rotation: 2, ease: 'none' }, 0);
      motion.fromTo('.finish-token', { y: i => i % 2 ? -6 : 6 }, { y: i => i % 2 ? 5 : -5, ease: 'none' }, 0);
    });
    return () => media.revert();
  }, { scope: root });

  return <svg ref={root} className="finish-artwork" viewBox="0 0 520 480" fill="none" aria-hidden="true" focusable="false">
    <g className="finish-ink">
      {dots.map(({ x, y, ink }) => <circle key={`${x}-${y}`} cx={x} cy={y} r={.55 + ink * 1.5} fill={x + y > 520 ? '#e77f70' : '#365766'} opacity={.035 + ink * .2} />)}
    </g>
    <g stroke="#dce2dc" strokeOpacity=".46">
      <rect x="204" y="50" width="52" height="52" rx="13" />
      <rect x="40" y="221" width="52" height="52" rx="13" />
      <rect x="427" y="231" width="52" height="52" rx="13" />
      <rect x="282" y="407" width="52" height="52" rx="13" />
    </g>
    <g transform="translate(105 122)"><g className="finish-token">
      <rect width="64" height="64" rx="17" fill="#fdfdfa" stroke="#dce2dc" />
      <g fill="#b5947c" opacity=".8">
        <ellipse cx="24" cy="23" rx="4.3" ry="5.7" transform="rotate(-24 24 23)" />
        <ellipse cx="36" cy="21" rx="4.3" ry="5.7" transform="rotate(8 36 21)" />
        <ellipse cx="45" cy="29" rx="4" ry="5.3" transform="rotate(27 45 29)" />
        <ellipse cx="17" cy="33" rx="3.7" ry="5" transform="rotate(-32 17 33)" />
        <path d="M22 43c0-5 4-11 9-11s12 7 12 12c0 7-7 4-11 4s-10 3-10-5Z" />
      </g>
    </g></g>
    <g transform="translate(365 95)"><g className="finish-token">
      <rect width="64" height="64" rx="17" fill="#fdfdfa" stroke="#dce2dc" />
      <path d="M32 45 20 33c-11-12 4-22 12-11 8-11 23-1 12 11L32 45Z" stroke="#d8988b" strokeWidth="2" strokeLinejoin="round" />
    </g></g>
    <g transform="translate(94 336)"><g className="finish-token">
      <rect width="64" height="64" rx="17" fill="#fdfdfa" stroke="#dce2dc" />
      <g stroke="#8b9f90" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="18" y="20" width="28" height="27" rx="5" />
        <path d="M18 28h28M25 17v7m14-7v7m-14 12 5 5 9-9" />
      </g>
    </g></g>
    <g transform="translate(365 351)"><g className="finish-token">
      <rect width="64" height="64" rx="17" fill="#fdfdfa" stroke="#dce2dc" />
      <g stroke="#8c9da6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 18h20v29H22a5 5 0 0 1-5-5V23a5 5 0 0 1 5-5Zm0 0v29m6-19h8m-8 6h8m-8 6h5" />
      </g>
    </g></g>
    <g className="finish-mobile-mark">
      <rect x="222" y="202" width="76" height="76" rx="21" fill="#fdfdfa" stroke="#dce2dc" />
      <image href="/assets/beans-mark-light.png" x="245" y="222" width="30" height="36" />
    </g>
  </svg>;
}
