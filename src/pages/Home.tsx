import { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type Variants,
} from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

/* ─────────────────────────────────────────
   Vintage copper-engraved SVG emblems
───────────────────────────────────────── */

/** Neural-network brain — etched line-art */
const IconBrain = () => (
  <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="19" cy="19" r="5.5" stroke="#B87333" strokeWidth="1.4" />
    <circle cx="7" cy="10" r="3.2" stroke="#B87333" strokeWidth="1.2" />
    <circle cx="31" cy="10" r="3.2" stroke="#B87333" strokeWidth="1.2" />
    <circle cx="7" cy="28" r="3.2" stroke="#B87333" strokeWidth="1.2" />
    <circle cx="31" cy="28" r="3.2" stroke="#B87333" strokeWidth="1.2" />
    <circle cx="19" cy="4"  r="2.4" stroke="#B87333" strokeWidth="1.1" />
    <circle cx="19" cy="34" r="2.4" stroke="#B87333" strokeWidth="1.1" />
    <line x1="13.5" y1="16.5" x2="10.2"  y2="12.2" stroke="#B87333" strokeWidth="1.1" strokeDasharray="1.5 1.5"/>
    <line x1="24.5" y1="16.5" x2="27.8"  y2="12.2" stroke="#B87333" strokeWidth="1.1" strokeDasharray="1.5 1.5"/>
    <line x1="13.5" y1="21.5" x2="10.2"  y2="25.8" stroke="#B87333" strokeWidth="1.1" strokeDasharray="1.5 1.5"/>
    <line x1="24.5" y1="21.5" x2="27.8"  y2="25.8" stroke="#B87333" strokeWidth="1.1" strokeDasharray="1.5 1.5"/>
    <line x1="19" y1="13.5" x2="19"  y2="6.4"  stroke="#B87333" strokeWidth="1.1" strokeDasharray="1.5 1.5"/>
    <line x1="19" y1="24.5" x2="19"  y2="31.6" stroke="#B87333" strokeWidth="1.1" strokeDasharray="1.5 1.5"/>
    <circle cx="19" cy="19" r="9.5" stroke="#B87333" strokeWidth="0.6" strokeDasharray="2 2" opacity="0.4"/>
  </svg>
);

/** Leaf + growth chart — engraved botanical */
const IconLeafChart = () => (
  <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 30 C10 20 14 10 28 8 C28 8 28 22 16 28 Z" stroke="#B87333" strokeWidth="1.3" strokeLinejoin="round"/>
    <path d="M16 28 C16 28 16 22 19 19" stroke="#B87333" strokeWidth="1.1" strokeLinecap="round" strokeDasharray="1.8 1.5"/>
    <polyline points="6,32 12,24 18,27 24,18 30,13" stroke="#B87333" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="6"  cy="32" r="1.5" fill="#B87333"/>
    <circle cx="12" cy="24" r="1.5" fill="#B87333"/>
    <circle cx="18" cy="27" r="1.5" fill="#B87333"/>
    <circle cx="24" cy="18" r="1.5" fill="#B87333"/>
    <circle cx="30" cy="13" r="1.5" fill="#B87333"/>
    <line x1="5" y1="34" x2="33" y2="34" stroke="#B87333" strokeWidth="1" opacity="0.5"/>
    <line x1="5" y1="34" x2="5"  y2="10" stroke="#B87333" strokeWidth="1" opacity="0.5"/>
  </svg>
);

/** Antique sun + cloud — vintage meteorology */
const IconSunCloud = () => (
  <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="15" cy="14" r="6.5" stroke="#B87333" strokeWidth="1.4"/>
    <line x1="15" y1="4"   x2="15" y2="6.5" stroke="#B87333" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="15" y1="21.5" x2="15" y2="24" stroke="#B87333" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="5"  y1="14"   x2="7.5" y2="14" stroke="#B87333" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="22.5" y1="14" x2="25" y2="14" stroke="#B87333" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="8.1"  y1="7.1" x2="9.8" y2="8.8" stroke="#B87333" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="20.2" y1="19.2" x2="21.9" y2="20.9" stroke="#B87333" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="21.9" y1="7.1" x2="20.2" y2="8.8" stroke="#B87333" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M20 22 C17 19 13 19 11 21 C8 21 6 23 6 25.5 C6 28 8 30 11 30 H26 C29 30 31 28 31 25.5 C31 23 29 21 27 21 C26 20 24 19 22 20 Z"
      stroke="#B87333" strokeWidth="1.3" strokeLinejoin="round"/>
    <path d="M13 30 L13 34 M19 30 L19 34 M25 30 L25 34" stroke="#B87333" strokeWidth="1" strokeLinecap="round" opacity="0.6" strokeDasharray="1.5 1.5"/>
  </svg>
);

/** Heraldic shield — engraved filigree */
const IconShield = () => (
  <svg width="52" height="58" viewBox="0 0 52 58" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M26 3 L48 12 L48 30 C48 42 36 53 26 57 C16 53 4 42 4 30 L4 12 Z" stroke="#B87333" strokeWidth="1.6" strokeLinejoin="round"/>
    <path d="M26 8 L43 15.5 L43 30 C43 39.5 34 48.5 26 52 C18 48.5 9 39.5 9 30 L9 15.5 Z" stroke="#B87333" strokeWidth="0.8" strokeLinejoin="round" strokeDasharray="2 1.5" opacity="0.6"/>
    <path d="M16 28 L22 34 L36 20" stroke="#B87333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="26" cy="12" r="2" fill="#B87333" opacity="0.7"/>
    <path d="M20 10 Q26 8 32 10" stroke="#B87333" strokeWidth="0.8" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

/** Clasped hands — bilingual emblem */
const IconHandshake = () => (
  <svg width="64" height="44" viewBox="0 0 64 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 30 C4 30 10 20 18 20 L24 20 L30 14 C31 13 33 13 34 14 L38 18" stroke="#B87333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M60 30 C60 30 54 20 46 20 L40 20 L38 18" stroke="#B87333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 20 L18 36 C18 38 20 40 22 40 L42 40 C44 40 46 38 46 36 L46 20" stroke="#B87333" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M26 20 L28 26 M32 18 L34 24 M38 20 L36 26" stroke="#B87333" strokeWidth="1.1" strokeLinecap="round" opacity="0.7"/>
    <path d="M4 30 L4 38 C4 39 5 40 6 40 L18 40" stroke="#B87333" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M60 30 L60 38 C60 39 59 40 58 40 L46 40" stroke="#B87333" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M30 8 C30 8 28 4 32 4 C36 4 34 8 34 8" stroke="#B87333" strokeWidth="1.1" strokeLinecap="round" opacity="0.6"/>
    <ellipse cx="32" cy="16" rx="5" ry="3" stroke="#B87333" strokeWidth="1" opacity="0.4"/>
  </svg>
);

/* ─────────────────────────────────────────
   Magnetic Button hook
───────────────────────────────────────── */
function useMagnet(strength = 0.35) {
  const x = useSpring(0, { stiffness: 160, damping: 20 });
  const y = useSpring(0, { stiffness: 160, damping: 20 });

  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return { x, y, handleMove, handleLeave };
}

/* ─────────────────────────────────────────
   Stagger animation variants
───────────────────────────────────────── */
const heroStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const heroItem: Variants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

const cardVariant: Variants = {
  hidden: { y: 60, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: i * 0.15,
      duration: 0.75,
      type: 'spring',
      stiffness: 80,
      damping: 18,
    },
  }),
};

const trustVariant: Variants = {
  hidden: { y: 40, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: i * 0.18,
      duration: 0.8,
      type: 'spring',
      stiffness: 70,
      damping: 16,
    },
  }),
};

/* ─────────────────────────────────────────
   Component
───────────────────────────────────────── */
export default function Home() {
  const { t } = useLanguage();

  /* Parallax */
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  /* Magnetic CTAs */
  const magnet1 = useMagnet();
  const magnet2 = useMagnet(0.25);

  const features = [
    {
      icon: <IconBrain />,
      title: t.home.feature1Title,
      desc: t.home.feature1Desc,
    },
    {
      icon: <IconLeafChart />,
      title: t.home.feature2Title,
      desc: t.home.feature2Desc,
    },
    {
      icon: <IconSunCloud />,
      title: t.home.feature3Title,
      desc: t.home.feature3Desc,
    },
  ];

  return (
    <div>
      {/* ════════════════════════════════
          HERO SECTION
      ════════════════════════════════ */}
      <div ref={heroRef} className="hero-parallax-wrapper">
        {/* Parallax background */}
        <motion.div
          className="hero-parallax-bg"
          style={{ y: parallaxY }}
        />
        <div className="hero-gradient-overlay" />

        {/* Hero text — staggered entrance */}
        <motion.div
          className="hero-content-wrapper"
          style={{ opacity: heroOpacity }}
          variants={heroStagger}
          initial="hidden"
          animate="visible"
        >
          {/* Headline */}
          <motion.h1 variants={heroItem} className="hero-headline">
            {t.home.heroTitleLine1}
            <br />
            <em className="hero-headline-accent">{t.home.heroTitleLine2}</em>
          </motion.h1>

          {/* Sub-description */}
          <motion.p variants={heroItem} className="hero-subline">
            {t.home.heroDesc}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={heroItem} className="hero-cta-group">
            {/* Primary — magnetic + shimmer */}
            <motion.div
              style={{ x: magnet1.x, y: magnet1.y }}
              onMouseMove={magnet1.handleMove}
              onMouseLeave={magnet1.handleLeave}
            >
              <Link to="/signup" className="btn-hero-primary">
                {t.home.startFree}
              </Link>
            </motion.div>

            {/* Ghost — magnetic */}
            <motion.div
              style={{ x: magnet2.x, y: magnet2.y }}
              onMouseMove={magnet2.handleMove}
              onMouseLeave={magnet2.handleLeave}
            >
              <Link to="/features" className="btn-hero-ghost">
                {t.home.exploreFeatures} &thinsp;→
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* ════════════════════════════════
          FEATURES SECTION
      ════════════════════════════════ */}
      <section className="features-section">
        {/* Header */}
        <motion.div
          className="features-section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="section-label">Platform Capabilities</span>
          <h2 className="section-title-serif">{t.home.featuresTitle}</h2>
          <p className="section-subtitle">{t.home.featuresDesc}</p>
        </motion.div>

        {/* Cards */}
        <div className="feature-cards-grid">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="feature-card-premium"
              custom={i}
              variants={cardVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
            >
              <div className="feature-icon-emblem">
                {f.icon}
              </div>
              <h3 className="feature-card-title">{f.title}</h3>
              <p className="feature-card-desc">{f.desc}</p>
              <Link to="/features" className="feature-learn-more">
                {t.home.learnMore}
                <span className="arrow">→</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════
          TRUST SECTION
      ════════════════════════════════ */}
      <section className="trust-section">
        <div className="trust-inner">
          {/* Ornamental divider */}
          <motion.div
            className="ornament-divider"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <span className="ornament-gem">⬡</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="section-label">Built on Trust</span>
            <h2 className="section-title-serif">{t.home.trustTitle}</h2>
          </motion.div>

          <div className="trust-cards-grid">
            {[
              {
                icon: <IconShield />,
                title: t.home.trust1Title,
                desc: t.home.trust1Desc,
              },
              {
                icon: <IconHandshake />,
                title: t.home.trust2Title,
                desc: t.home.trust2Desc,
              },
            ].map((tc, i) => (
              <motion.div
                key={i}
                className="trust-card"
                custom={i}
                variants={trustVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
              >
                <div className="trust-icon-wrap">{tc.icon}</div>
                <h3 className="trust-card-title">{tc.title}</h3>
                <p className="trust-card-desc">{tc.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
