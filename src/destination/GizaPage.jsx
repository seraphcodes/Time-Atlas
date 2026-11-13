import Nav from '../home/Nav'
import Footer from '../site/Footer'
import { LEVELS, intro, ledger, next, sources, stops, thenNow } from './giza-page'
import dawnWebp from '../site/img/giza-dawn.webp'
import dawnJpg from '../site/img/giza-dawn.jpg'
import dawnSmall from '../site/img/giza-dawn-s.webp'
import finished from '../site/img/giza-finished.webp'
import finishedSmall from '../site/img/giza-finished-s.webp'
import today from '../site/img/giza-today.webp'
import todaySmall from '../site/img/giza-today-s.webp'

const ROOT = '../../'
const ENTER = ROOT + 'experience/giza/'

function Mark({ level, children }) {
  return (
    <span className="mark">
      <i className={`mark-dot is-${level}`} aria-hidden="true" />
      <span><b>{LEVELS[level]}</b>{children ? <>. {children}</> : null}</span>
    </span>
  )
}

export default function GizaPage() {
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
            <a href={ROOT + 'explore/'}>Explore</a><span aria-hidden="true">/</span><span aria-current="page">Giza</span>
          </nav>

          <div className="gz-grid">
            <aside className="gz-card glass" aria-labelledby="gz-h">
              <img className="gz-card-img" src={finishedSmall} alt="The finished Great Pyramid with three small pyramids beside it, rendered in 3D." width="800" height="450" />
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

              <h2>Six stops, one scroll.</h2>
              <p className="gz-sub">Scrolling moves you through the place in this order. Each stop says how sure we are of what you see.</p>

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
                  <img src={finished} alt="The Great Pyramid as it looked when new: smooth and white, with three small pyramids beside it." width="1600" height="900" loading="lazy" />
                  <figcaption><b>{thenNow.then.label}</b>{thenNow.then.text}</figcaption>
                </figure>
                <figure className="glass">
                  <img src={today} alt="The three pyramids of Giza today, seen from above, with a sketch of Cairo reaching the edge of the plateau." width="1600" height="900" loading="lazy" />
                  <figcaption><b>{thenNow.now.label}</b>{thenNow.now.text}</figcaption>
                </figure>
              </div>
              <p className="gz-credit">Both pictures are stills from our own 3D reconstruction, not photographs.</p>
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
            <p className="paper-note">The figures were checked against published summaries of these works. The books themselves have not been read cover to cover by us, so treat this as careful, not peer-reviewed.</p>
          </div>
        </section>

        <section className="gz-end" aria-labelledby="end-h">
          <h2 id="end-h">Now walk into it.</h2>
          <a className="btn" href={ENTER}>{intro.cta}</a>
          <div className="gz-next glass">
            <span className="gz-next-ring" aria-hidden="true">{next.place[0]}</span>
            <p><span>{next.status}</span><b>{next.place}, {next.date}</b>Not built yet.</p>
            <a className="btn btn-ghost" href={ROOT + 'explore/'}>See all places</a>
          </div>
        </section>
      </main>

      <Footer root={ROOT} />
    </div>
  )
}
