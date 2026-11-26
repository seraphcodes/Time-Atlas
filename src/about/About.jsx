import Nav from '../home/Nav'
import Footer from '../site/Footer'
import { imageCredits, romeSources, softwareCredits } from '../site/credits'
import { how, imprint, intro, marks, privacy } from './about-content'
import bgWideWebp from '../home/img/second-wide.webp'
import bgWideJpg from '../home/img/second-wide.jpg'
import bgNarrowWebp from '../home/img/second-narrow.webp'
import bgNarrowJpg from '../home/img/second-narrow.jpg'

const ROOT = '../'

export default function About() {
  return (
    <div className="ab">
      <div className="backdrop" aria-hidden="true">
        <picture>
          <source media="(max-width: 700px)" srcSet={bgNarrowWebp} type="image/webp" />
          <source media="(max-width: 700px)" srcSet={bgNarrowJpg} />
          <source srcSet={bgWideWebp} type="image/webp" />
          <img src={bgWideJpg} alt="" draggable="false" />
        </picture>
      </div>

      <Nav root={ROOT} current="About" />

      <main id="main">
        <section className="ab-head">
          <h1>{intro.title}</h1>
          <p>{intro.lead}</p>
          <nav className="ab-jump" aria-label="On this page">
            <a href="#credits">Credits</a>
            <a href="#privacy">Privacy</a>
            <a href="#imprint">Imprint</a>
          </nav>
        </section>

        <section className="ab-marks" aria-labelledby="marks-h">
          <h2 id="marks-h">How we mark what we know.</h2>
          <ul className="marks-grid">
            {marks.map(([level, name, text]) => (
              <li key={level} className="glass">
                <i className={`mark-dot is-${level}`} aria-hidden="true" />
                <h3>{name}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="ab-how" aria-labelledby="how-h">
          <h2 id="how-h">How we work.</h2>
          <ol className="how-list">
            {how.map(([title, text]) => (
              <li key={title} className="glass">
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="doc" aria-labelledby="credits-h" id="credits">
          <div className="doc-in glass">
            <h2 id="credits-h">Credits and licences.</h2>
            <p className="doc-lead">Every picture and tool we did not make ourselves.</p>

            <table className="credits-table">
              <thead>
                <tr><th scope="col">Where</th><th scope="col">Work and author</th><th scope="col">Licence</th></tr>
              </thead>
              <tbody>
                {imageCredits.map((c) => (
                  <tr key={c.what}>
                    <th scope="row">{c.what}</th>
                    <td>{c.work}</td>
                    <td>{c.licence}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3>Sources for Rome</h3>
            <p className="doc-note">The books and web pages the Rome reconstruction and its texts are built from. Each Rome card and the evidence ledger on the Rome page say which source backs which claim.</p>
            <ul className="doc-list">
              {romeSources.map((s) => <li key={s}>{s}</li>)}
            </ul>

            <h3>Software</h3>
            <ul className="doc-list">
              {softwareCredits.map(([n, l]) => <li key={n}>{n}: {l}</li>)}
            </ul>
            <p className="doc-note">CC BY-SA means the picture may be shared and changed if the author is named and the same licence is kept. Our cropped versions keep that licence.</p>

            <h2 className="doc-h2" id="privacy">Privacy.</h2>
            {privacy.map((t) => <p key={t} className="doc-p">{t}</p>)}

            <h2 className="doc-h2" id="imprint">Imprint.</h2>
            <address className="doc-p imprint">
              {imprint.name}<br />
              {imprint.address}<br />
              {imprint.email}
            </address>
          </div>
        </section>
      </main>

      <Footer root={ROOT} note="Places shown in 3D are reconstructions. Each place says what is documented, inferred or invented." />
    </div>
  )
}
