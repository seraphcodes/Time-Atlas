// The footer every page shares. `root` is the way back to the site root
// ('./', '../', '../../'). The painting behind it is set in site.css.
const ABOUT = 'about/'
const EXPLORE = 'explore/'
const TIMELINE = 'timeline/'
const GIZA = 'destinations/giza/'

// Plain line icons, drawn for this footer. Each one says what the link is:
// compass, hourglass, pyramid, info, camera, shield, scales.
const ICONS = {
  explore: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.6 8.4-2 5.2-5.2 2 2-5.2z" />
    </>
  ),
  timeline: (
    <>
      <path d="M6 3h12M6 21h12" />
      <path d="M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9" />
    </>
  ),
  giza: (
    <>
      <path d="M12 3.5 3 17l11 3.5 7-4.5z" />
      <path d="M12 3.5 14 20.5" />
    </>
  ),
  about: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="7.8" r="0.6" fill="currentColor" />
    </>
  ),
  credits: (
    <>
      <path d="M4 8a2 2 0 0 1 2-2h2l1.4-2h5.2L16 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
      <circle cx="12" cy="12.5" r="3.4" />
    </>
  ),
  privacy: (
    <>
      <path d="M12 3 5 5.8v5.4c0 4.3 2.9 7.9 7 9.8 4.1-1.9 7-5.5 7-9.8V5.8z" />
      <path d="m9 12 2.2 2.2L15.2 10" />
    </>
  ),
  imprint: (
    <>
      <path d="M12 4v16M8 20h8M5 7h14" />
      <path d="m5 7-2.6 6a3.1 3.1 0 0 0 5.2 0zM19 7l-2.6 6a3.1 3.1 0 0 0 5.2 0z" />
    </>
  ),
}

function Icon({ name }) {
  return (
    <span className="foot-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {ICONS[name]}
      </svg>
    </span>
  )
}

export default function Footer({ root = './', note }) {
  return (
    <footer className="foot">
      <div className="foot-in">
        <div className="foot-brand">
          <p className="foot-mark">TimeAtlas</p>
          <p className="foot-tag">Places rebuilt from what is known.</p>
          <p className="foot-credit">{note || 'Places shown in 3D are reconstructions. Each place says what is documented, inferred or invented.'}</p>
        </div>
        <nav className="foot-col" aria-label="Places">
          <p className="foot-h">Places</p>
          <a href={root + EXPLORE}><Icon name="explore" />Explore</a>
          <a href={root + TIMELINE}><Icon name="timeline" />Timeline</a>
          <a href={root + GIZA}><Icon name="giza" />Giza field guide</a>
        </nav>
        <nav className="foot-col" aria-label="About this site">
          <p className="foot-h">This site</p>
          <a href={root + ABOUT}><Icon name="about" />About</a>
          <a href={root + ABOUT + '#credits'}><Icon name="credits" />Credits</a>
          <a href={root + ABOUT + '#privacy'}><Icon name="privacy" />Privacy</a>
          <a href={root + ABOUT + '#imprint'}><Icon name="imprint" />Imprint</a>
        </nav>
      </div>
    </footer>
  )
}
