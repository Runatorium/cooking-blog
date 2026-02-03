import { Link } from 'react-router-dom';
import Footer from './Footer';
import './CouponsPage.css';

// Placeholder offers – in future can come from API
const OFFERS = [
  { id: 1, store: 'Eataly', discount: '15% sul primo ordine', code: 'SARDEGNA15', description: 'Ingredienti e specialità italiane' },
  { id: 2, store: 'Tigrella', discount: '10% su utensili da cucina', code: 'CUCINA10', description: 'Pentole e accessori' },
  { id: 3, store: 'Cuciniamo', discount: 'Spedizione gratuita', code: 'GRATIS', description: 'Ordini oltre 49€' },
  { id: 4, store: 'Sapori Sardi', discount: '20% formaggi e bottarga', code: 'SAPORI20', description: 'Prodotti tipici sardi' },
  { id: 5, store: "Bio c'è", discount: '5% prodotti bio', code: 'BIO5', description: 'Alimentari biologici' },
  { id: 6, store: 'La Dispensa', discount: '12% pasta e riso', code: 'DISPENSA12', description: 'Prima materia e dispensa' },
];

const CouponsPage = () => {
  return (
    <div className="coupons-page">
      <main className="coupons-main">
        <div className="coupons-container">
          <header className="coupons-header">
            <h1>Offerte per te</h1>
            <p className="coupons-subtitle">Coupon e sconti dai nostri partner. Usa i codici al checkout.</p>
          </header>

          <section className="coupons-grid">
            {OFFERS.map((offer) => (
              <article key={offer.id} className="coupon-card">
                <div className="coupon-card-inner">
                  <span className="coupon-store">{offer.store}</span>
                  <p className="coupon-discount">{offer.discount}</p>
                  {offer.code && (
                    <div className="coupon-code-wrap">
                      <span className="coupon-code-label">Codice</span>
                      <code className="coupon-code">{offer.code}</code>
                    </div>
                  )}
                  {offer.description && (
                    <p className="coupon-desc">{offer.description}</p>
                  )}
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CouponsPage;
