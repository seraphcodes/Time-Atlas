// Visitors who ask their device for less motion get a calmer journey: the
// camera follows the scroll bar directly, the sun does not wheel round the
// sky, there is no streaking dust or film grain, and flames do not flicker.
export const calm = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
