import { useEffect } from 'react';
import Footer from './Footer';
import './TermsPage.css';

const TermsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="terms-page">
      <section className="terms-hero">
        <div className="container">
          <h1 className="terms-title">Termini di Servizio</h1>
          <p className="terms-subtitle">Sardegna Ricette – Condizioni di utilizzo della piattaforma</p>
        </div>
      </section>

      <main className="terms-content">
        <div className="container">
          <article className="terms-body">
            <section className="terms-section">
              <h2>1. Oggetto del servizio</h2>
              <p>Sardegna Ricette è una piattaforma online che consente agli utenti di condividere ricette e contenuti legati alla cucina.</p>
            </section>

            <section className="terms-section">
              <h2>2. Registrazione dell’utente</h2>
              <p>La registrazione è facoltativa ma necessaria per caricare ricette e commenti.</p>
              <p>L’utente garantisce che i dati forniti sono veritieri e aggiornati.</p>
            </section>

            <section className="terms-section">
              <h2>3. Contenuti caricati dagli utenti</h2>
              <p>L’utente è l’unico responsabile dei contenuti caricati (testi, immagini, ricette).</p>
              <p>È vietato pubblicare contenuti:</p>
              <ul>
                <li>Illegali, offensivi o diffamatori</li>
                <li>Coperti da copyright senza autorizzazione</li>
                <li>Che violino diritti di terzi</li>
                <li>Pubblicitari o spam</li>
              </ul>
              <p>Il Titolare si riserva il diritto di modificare o rimuovere contenuti non conformi senza preavviso.</p>
            </section>

            <section className="terms-section">
              <h2>4. Diritti sui contenuti</h2>
              <p>Caricando un contenuto, l’utente concede al Titolare una licenza non esclusiva, gratuita e revocabile per la pubblicazione e visualizzazione sul sito.</p>
              <p>L’utente mantiene la piena proprietà intellettuale dei contenuti caricati.</p>
            </section>

            <section className="terms-section">
              <h2>5. Responsabilità</h2>
              <p>Il Titolare non è responsabile:</p>
              <ul>
                <li>Dell’accuratezza delle ricette pubblicate dagli utenti</li>
                <li>Di eventuali danni derivanti dall’uso delle informazioni presenti sul sito</li>
                <li>Di contenuti pubblicati da terzi</li>
              </ul>
            </section>

            <section className="terms-section">
              <h2>6. Sospensione o cancellazione dell’account</h2>
              <p>Il Titolare può sospendere o cancellare l’account di un utente che violi i presenti Termini.</p>
            </section>

            <section className="terms-section">
              <h2>7. Modifiche ai Termini</h2>
              <p>Il Titolare si riserva il diritto di modificare i presenti Termini di Servizio in qualsiasi momento.</p>
            </section>

            <section className="terms-section">
              <h2>8. Legge applicabile e foro competente</h2>
              <p>I presenti Termini sono regolati dalla legge italiana.</p>
              <p>Per qualsiasi controversia è competente il Foro del luogo di residenza o domicilio del Titolare, salvo diversa disposizione di legge.</p>
            </section>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsPage;
