import { useEffect } from 'react';
import Footer from './Footer';
import './PrivacyPage.css';

const PrivacyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="privacy-page">
      <section className="privacy-hero">
        <div className="container">
          <h1 className="privacy-title">Informativa sulla Privacy</h1>
          <p className="privacy-subtitle">Sardegna Ricette – Trattamento dei dati personali</p>
        </div>
      </section>

      <main className="privacy-content">
        <div className="container">
          <article className="privacy-body">
            <section className="privacy-section">
              <h2>1. Tipologie di dati raccolti</h2>
              <p>Il sito raccoglie i seguenti dati personali:</p>
              <h3>Dati forniti volontariamente dall’utente</h3>
              <ul>
                <li>Nome o nickname</li>
                <li>Indirizzo email</li>
                <li>Contenuti caricati (ricette, commenti, immagini, descrizioni)</li>
              </ul>
              <h3>Dati di navigazione</h3>
              <ul>
                <li>Indirizzo IP</li>
                <li>Dati tecnici (browser, sistema operativo)</li>
                <li>Cookie (vedi Cookie Policy, se presente)</li>
              </ul>
            </section>

            <section className="privacy-section">
              <h2>2. Finalità del trattamento</h2>
              <p>I dati personali sono trattati per le seguenti finalità:</p>
              <ul>
                <li>Registrazione e gestione degli account utenti</li>
                <li>Pubblicazione e condivisione delle ricette</li>
                <li>Moderazione dei contenuti caricati dagli utenti</li>
                <li>Risposta a richieste di contatto</li>
                <li>Miglioramento del sito e delle funzionalità</li>
                <li>Adempimento di obblighi legali</li>
              </ul>
            </section>

            <section className="privacy-section">
              <h2>3. Base giuridica del trattamento</h2>
              <p>Il trattamento dei dati si basa su:</p>
              <ul>
                <li>Consenso dell’utente</li>
                <li>Esecuzione di un contratto o misure precontrattuali</li>
                <li>Adempimento di obblighi legali</li>
                <li>Legittimo interesse del Titolare</li>
              </ul>
            </section>

            <section className="privacy-section">
              <h2>4. Modalità di trattamento</h2>
              <p>Il trattamento avviene con strumenti informatici e telematici, nel rispetto delle misure di sicurezza previste dal GDPR, per prevenire accessi non autorizzati, perdita o uso illecito dei dati.</p>
            </section>

            <section className="privacy-section">
              <h2>5. Conservazione dei dati</h2>
              <p>I dati personali sono conservati:</p>
              <ul>
                <li>Per il tempo necessario alle finalità per cui sono stati raccolti</li>
                <li>Fino alla richiesta di cancellazione dell’account da parte dell’utente</li>
                <li>Nei limiti imposti dalla legge</li>
              </ul>
            </section>

            <section className="privacy-section">
              <h2>6. Comunicazione e diffusione dei dati</h2>
              <p>I dati non saranno diffusi, ma potranno essere comunicati a:</p>
              <ul>
                <li>Fornitori di servizi tecnici (hosting, manutenzione del sito)</li>
                <li>Autorità competenti, se richiesto dalla legge</li>
              </ul>
            </section>

            <section className="privacy-section">
              <h2>7. Diritti dell’utente</h2>
              <p>L’utente ha diritto di:</p>
              <ul>
                <li>Accedere ai propri dati</li>
                <li>Chiederne la rettifica o cancellazione</li>
                <li>Limitare o opporsi al trattamento</li>
                <li>Richiedere la portabilità dei dati</li>
                <li>Revocare il consenso in qualsiasi momento</li>
                <li>Proporre reclamo al Garante per la Protezione dei Dati Personali</li>
              </ul>
              <p>Le richieste possono essere inviate a: <a href="mailto:privacy@sardegnaricette.it">privacy@sardegnaricette.it</a></p>
            </section>

            <section className="privacy-section">
              <h2>8. Modifiche alla Privacy Policy</h2>
              <p>Il Titolare si riserva il diritto di modificare la presente Privacy Policy. Le modifiche saranno pubblicate su questa pagina.</p>
            </section>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPage;
