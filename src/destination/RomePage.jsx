import Nav from '../home/Nav'
import Footer from '../site/Footer'
import { LEVELS, intro, ledger, next, sources, stops, thenNow } from './rome-page'
import dawnWebp from '../site/img/rome-dawn.webp'
import dawnJpg from '../site/img/rome-dawn.jpg'
import dawnSmall from '../site/img/rome-dawn-s.webp'
import forumSmall from '../site/img/rome-forum-s.webp'
import then from '../site/img/rome-then.webp'
import today from '../site/img/rome-today.webp'

const ROOT = '../../'
const ENTER = ROOT + 'experience/rome-100-ad/'

function Mark({ level, children }) {
  return (
    <span className="mark">
      <i className={`mark-dot is-${level}`} aria-hidden="true" />
      <span><b>{LEVELS[level]}</b>{children ? <>. {children}</> : null}</span>
    </span>
  )
}

export default function RomePage() {
  return (
    <div className="gz">
      <div className="backdrop" aria-hidden="true">
        <picture>
          <source media="(max-width: 700px)" srcSet={dawnSmall} type="image/webp" />
          <source srcSet={dawnWebp} type="image/webp" />
          <img src={dawnJpg} alt="" draggable="false" />
        </picture>
      </div>

      <Nav root={ROOT} />

      <main id="main">
        <section className="gz-top">
          <nav className="crumbs" aria-label="Breadcrumb">
            <a href={ROOT + 'explore/'}>Explore</a><span aria-hidden="true">/</span><span aria-current="page">Rome</span>
          </nav>

          <div className="gz-grid">
            <aside className="gz-card glass" aria-labelledby="gz-h">
              <img className="gz-card-img" src={forumSmall} alt="The Roman Forum in 3D, with the Basilica Julia, temples and a crowd of people in the square." width="800" height="450" />
              <div className="gz-card-body">
                <p className="gz-date">{intro.date} <span aria-hidden="true">/</span> {intro.region}</p>
                <h1 id="gz-h">{intro.place}</h1>
                <a className="btn gz-enter" href={ENTER}>{intro.cta}</a>
                <p className="gz-note">{intro.note}</p>
                <dl className="gz-facts">
                  {intro.facts.map(([k, v]) => (
                    <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                  ))}
                </dl>
              </div>
            </aside>

            <div className="gz-story">
              <p className="gz-lead">{intro.lead}</p>
              <p className="gz-sub">{intro.part}</p>

              <h2>From the air to the street.</h2>
              <p className="gz-sub">Scrolling takes you down in four steps, then the city is yours. Each stop says how sure we are of what you see.</p>

              <ol className="stops">
                {stops.map((s, i) => (
                  <li key={s.title} className="stop">
                    <span className="stop-n glass" aria-hidden="true">{i + 1}</span>
                    <div className="stop-body">
                      <h3>{s.title}</h3>
                      <p>{s.text}</p>
                      {s.marks.length > 0 && (
                        <ul className="marks">
                          {s.marks.map(([level, why]) => (
                            <li key={why}><Mark level={level}>{why}</Mark></li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                ))}
              </ol>

              <h2>Then and now.</h2>
              <div className="pair">
                <figure className="glass">
                  <img src={then} alt="Our 3D reconstruction of the Colosseum in AD 100, with a crowd around it and the red roofs of Rome behind." width="1600" height="900" loading="lazy" />
                  <figcaption><b>{thenNow.then.label}</b>{thenNow.then.text}</figcaption>
                </figure>
                <figure className="glass">
                  <img src={today} alt="The Colosseum in Rome in evening light, seen today." width="800" height="533" loading="lazy" />
                  <figcaption><b>{thenNow.now.label}</b>{thenNow.now.text}</figcaption>
                </figure>
              </div>
              <p className="gz-credit">Left: a still from our own 3D reconstruction. Right: the Colosseum today, photo by Paris Orlando, CC BY-SA 4.0 (cropped).</p>
            </div>
          </div>
        </section>

        <section className="paper" aria-labelledby="ledger-h">
          <div className="paper-in">
            <h2 id="ledger-h">The evidence ledger.</h2>
            <p className="paper-lead">What the experience shows, how sure we are, and where it comes from.</p>
            <ul className="key" aria-label="What the three marks mean">
              <li><Mark level="documented">Backed by excavation or a surviving text</Mark></li>
              <li><Mark level="inferred">Scholars’ best reading of the evidence</Mark></li>
              <li><Mark level="invented">Added by us so the scene works</Mark></li>
            </ul>

            <table className="ledger">
              <thead>
                <tr><th scope="col">What you see</th><th scope="col">How sure</th><th scope="col">Where it comes from</th></tr>
              </thead>
              <tbody>
                {ledger.map(([claim, level, source]) => (
                  <tr key={claim}>
                    <th scope="row">{claim}</th>
                    <td><Mark level={level} /></td>
                    <td>{source}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3>Sources</h3>
            <ul className="sources">
              {sources.map((s) => <li key={s}>{s}</li>)}
            </ul>
            <p className="paper-note">Every figure was compared with at least two sources. Platner and Ashby was read through its online edition; the modern guides by Claridge and Coarelli were reached through sources that quote them, not read cover to cover by us. Treat this as careful, not peer-reviewed.</p>
          </div>
        </section>

        <section className="gz-end" aria-labelledby="end-h">
          <h2 id="end-h">Now walk into it.</h2>
          <a className="btn" href={ENTER}>{intro.cta}</a>
          <div className="gz-next glass">
            <span className="gz-next-ring" aria-hidden="true">{next.place[0]}</span>
            <p><span>{next.status}</span><b>{next.place}, {next.date}</b>The first place we built.</p>
            <a className="btn btn-ghost" href={ROOT + next.href}>Read the Giza guide</a>
          </div>
        </section>
      </main>

      <Footer root={ROOT} />
    </div>
  )
}
