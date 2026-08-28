import React from 'react';
import './CalendarMedallions.scss';

/* Heraldic sigil paths — stylized house emblems */
const SIGILS = {
  wolf: (
    <path d="M50 12 L60 26 L57 29 L69 44 L61 46 L71 60 L56 55 L50 72 L44 55 L29 60 L39 46 L31 44 L43 29 L40 26 Z M42 33 L38 37 M58 33 L62 37" />
  ),
  dragon: (
    <path d="M28 18 Q44 8 50 24 L66 12 Q60 28 72 32 Q56 38 62 48 Q46 46 42 60 Q32 56 26 66 L23 50 Q14 44 20 34 Q10 28 18 20 Q24 24 28 18 Z M50 24 L46 40" />
  ),
  stag: (
    <path d="M38 14 L40 32 M62 14 L60 32 M40 32 L32 20 M40 32 L28 26 M40 32 L30 36 M62 32 L70 20 M62 32 L74 26 M62 32 L72 36 M50 36 L50 58 M43 58 L50 70 L57 58 M46 40 L50 46 L54 40" />
  ),
  lion: (
    <path d="M50 16 L59 27 L70 24 L65 37 L73 48 L61 51 L59 66 L50 58 L41 66 L39 51 L27 48 L35 37 L30 24 L41 27 Z M44 42 L42 44 M56 42 L58 44" />
  ),
  kraken: (
    <path d="M50 20 Q62 26 59 40 Q68 44 64 56 L59 49 Q62 62 52 65 L52 55 Q50 68 45 64 L47 53 Q38 60 36 50 L44 46 Q35 43 41 36 Q38 26 50 20 Z" />
  ),
  flames: (
    <path d="M50 14 Q58 28 66 34 Q74 42 68 56 Q64 66 54 68 Q60 58 56 50 Q50 58 44 52 Q36 60 40 68 Q28 62 28 48 Q28 36 38 28 Q46 22 50 14 Z" />
  )
};

/* Layout mirrors the reference: 3 along the top, rows down each side */
const TOP_MEDALLIONS = ['wolf', 'dragon', 'stag'];
const LEFT_MEDALLIONS = ['lion', 'dragon', 'lion', 'kraken'];
const RIGHT_MEDALLIONS = ['stag', 'kraken', 'flames', 'dragon'];

const Medallion = ({ sigil, className }) => (
  <div className={`sigil-medallion ${className || ''}`}>
    <div className="medallion-ring">
      <div className="medallion-face">
        <svg viewBox="0 0 100 100" className="medallion-sigil" aria-hidden="true">
          <g
            fill="none"
            stroke="url(#medallionInk)"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {SIGILS[sigil]}
          </g>
          <defs>
            <linearGradient id="medallionInk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e8c877" />
              <stop offset="55%" stopColor="#a67c2e" />
              <stop offset="100%" stopColor="#5f4416" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  </div>
);

const CalendarMedallions = () => (
  <div className="calendar-medallions" aria-hidden="true">
    {TOP_MEDALLIONS.map((s, i) => (
      <Medallion key={`top-${i}`} sigil={s} className={`med-top med-top-${i}`} />
    ))}
    {LEFT_MEDALLIONS.map((s, i) => (
      <Medallion key={`left-${i}`} sigil={s} className={`med-left med-left-${i}`} />
    ))}
    {RIGHT_MEDALLIONS.map((s, i) => (
      <Medallion key={`right-${i}`} sigil={s} className={`med-right med-right-${i}`} />
    ))}
  </div>
);

export default CalendarMedallions;