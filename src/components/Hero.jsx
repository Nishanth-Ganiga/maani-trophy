import React, { useState } from "react";
import "./Hero.css";
import Navbar from "./Navbar";
import Countdown from "./Countdown";
import { PLACES } from "../lib/places";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.16, 1, 0.3, 1];

const slides = [
  {
    id: "tournament",
    ghost: "ಮಾಣಿ",
    gradient:
      "radial-gradient(circle at 72% 48%, #FF9A1F 0%, #C4510B 32%, #0E1A3D 72%, #050913 100%)",
    kicker: "ದರ್ಖಾಸ್ತ್ ಕಾಲೋನಿ ಗೆಳೆಯರ ಬಳಗ ಇವರ ಆಶ್ರಯದಲ್ಲಿ",
    title: "ಮಾಣಿ ಟ್ರೋಫಿ 🏆",
    text: null,
    image: "./images/darkast-colony.png",
    imageAlt: "ದರ್ಖಾಸ್ತ್ ಕಾಲೋನಿ ಗೆಳೆಯರ ಬಳಗ",
    contacts: [
      { name: "ರಮೇಶ್ ಲೋಬೋ", phone: "9353896918" },
      { name: "ಸುಜಯ್", phone: "9611971405" },
    ],
    cta: true,
  },
  {
    id: "memory",
    ghost: "ನೆನಪು",
    gradient:
      "radial-gradient(circle at 72% 48%, #5A3A1C 0%, #2B1A0C 45%, #0B0603 100%)",
    kicker: "ನಮ್ಮೆಲ್ಲರನ್ನು ಅಗಲಿದ ನಮ್ಮ ಪ್ರೀತಿಯ",
    title: "ಮಾಣಿ ಅವರ ನೆನಪಿನಲ್ಲಿ 🕯️",
    text:
      "ಅವರು ನಮ್ಮನ್ನು ಅಗಲಿದ್ದರೂ, ಅವರ ನಗು, ಸ್ನೇಹ ಮತ್ತು ಪ್ರೀತಿ ನಮ್ಮ ಹೃದಯದಲ್ಲಿ ಸದಾ ಜೀವಂತ. ಅವರ ಸವಿನೆನಪಿಗಾಗಿ, ಅವರ ಹೆಸರಿನಲ್ಲಿ ಈ ‘ಮಾಣಿ ಟ್ರೋಫಿ’ ಪಂದ್ಯಾವಳಿಯನ್ನು ದರ್ಖಾಸ್ತ್ ಕಾಲೋನಿ ಗೆಳೆಯರ ಬಳಗ ಆಯೋಜಿಸುತ್ತಿದೆ.",
    image: "./images/maani.png",
    imageAlt: "ಮಾಣಿ - ಸವಿನೆನಪು",
    memorial: true,
  },
  {
    id: "dates",
    ghost: "ಜನವರಿ",
    gradient:
      "radial-gradient(circle at 72% 48%, #1E51A4 0%, #0B2554 50%, #030A17 100%)",
    kicker: "ಪಂದ್ಯಾವಳಿಯ ದಿನಾಂಕಗಳು",
    title: "23 ಮತ್ತು 24 ಜನವರಿ 2027",
    text: "ಮಾಣಿ ಟ್ರೋಫಿ ಪಂದ್ಯಗಳು ಶನಿವಾರ ಮತ್ತು ಭಾನುವಾರ ನಡೆಯಲಿವೆ. ಇಂದೇ ನಿಮ್ಮ ತಂಡವನ್ನು ನೋಂದಾಯಿಸಿ!",
    dates: [
      { day: "23", week: "ಶನಿವಾರ" },
      { day: "24", week: "ಭಾನುವಾರ" },
    ],
    countdown: true,
    cta: true,
  },
  {
    id: "timing",
    ghost: "ಸಮಯ",
    gradient:
      "radial-gradient(circle at 72% 48%, #C2185B 0%, #6A0F3A 50%, #1A0310 100%)",
    kicker: "ಮಾಣಿ ಟ್ರೋಫಿ",
    title: "⏰ ಪಂದ್ಯದ ಸಮಯ ಮತ್ತು ಸ್ವರೂಪ",
    text: "ಸಮಯದ ಸಮಸ್ಯೆ ಉಂಟಾದಲ್ಲಿ, ಸಮಿತಿಯು ಓವರ್‌ಗಳ ಸಂಖ್ಯೆಯನ್ನು ಕಡಿಮೆ ಮಾಡಬಹುದು.",
    facts: [
      { icon: "🕗", label: "ಎಲ್ಲಾ ಪಂದ್ಯಗಳ ಆರಂಭ", value: "ಬೆಳಿಗ್ಗೆ 8:30" },
      { icon: "🕡", label: "ಪಂದ್ಯಗಳ ಮುಕ್ತಾಯ", value: "ಸಂಜೆ 6:30" },
      { icon: "🏏", label: "ಪ್ರತಿ ಪಂದ್ಯ", value: "ಗರಿಷ್ಠ 4 ಓವರ್" },
      { icon: "🎯", label: "ಒಬ್ಬ ಬೌಲರ್", value: "ಕೇವಲ 1 ಓವರ್" },
    ],
  },
  {
    id: "teams",
    ghost: "16",
    gradient:
      "radial-gradient(circle at 72% 48%, #1F8A4C 0%, #0B4A2A 50%, #02140A 100%)",
    kicker: "ಮಾಣಿ ಟ್ರೋಫಿ",
    title: "ಒಟ್ಟು 16 ತಂಡಗಳು",
    text: "ಬೈಂದೂರು ಪಟ್ಟಣ ಪಂಚಾಯತ್ ವ್ಯಾಪ್ತಿಯ 16 ತಂಡಗಳು ಈ ಮಾಣಿ ಟ್ರೋಫಿಯಲ್ಲಿ ಸೆಣಸಾಡಲಿವೆ.",
    teams: PLACES,
    cta: true,
  },
  {
    id: "prizes",
    ghost: "ಬಹುಮಾನ",
    gradient:
      "radial-gradient(circle at 72% 48%, #7A4DD8 0%, #3A1C7A 50%, #0C0420 100%)",
    kicker: "ಮಾಣಿ ಟ್ರೋಫಿ",
    title: "🏆 ಬಹುಮಾನಗಳು",
    text: "ಪಂದ್ಯಾವಳಿಯಲ್ಲಿ ಭಾಗವಹಿಸಲು ಬೈಂದೂರು ಪಟ್ಟಣ ಪಂಚಾಯತ್ ವ್ಯಾಪ್ತಿಯ ತಂಡಗಳಿಗೆ ಮಾತ್ರ ಅವಕಾಶ.\nಒಟ್ಟು 16 ತಂಡಗಳಿಗೆ ಮಾತ್ರ ಪ್ರವೇಶ.",
    feesTitle: "📝 ನೋಂದಣಿ ಶುಲ್ಕ",
    fees: [
      "ಆಟಗಾರರ ನೋಂದಣಿ ಶುಲ್ಕ: ₹200",
      "ಪ್ರತಿ ತಂಡದ ಪ್ರವೇಶ ಶುಲ್ಕ: ₹3,000",
      "ತಂಡ ನೋಂದಣಿಗಾಗಿ ತಂಡದ ಮಾಲೀಕರು ಮುಂಗಡವಾಗಿ ₹1,000 ಪಾವತಿಸಬೇಕು.",
    ],
    awardsTitle: "🌟 ವೈಯಕ್ತಿಕ ಪ್ರಶಸ್ತಿಗಳು",
    awards: [
      "ಸರಣಿಶ್ರೇಷ್ಠ ಆಟಗಾರ",
      "ಶ್ರೇಷ್ಠ ಬ್ಯಾಟ್ಸ್‌ಮನ್",
      "ಶ್ರೇಷ್ಠ ಬೌಲರ್",
      "ಶ್ರೇಷ್ಠ ಫೀಲ್ಡರ್",
      "ಉದಯೋನ್ಮುಖ ಆಟಗಾರ",
    ],
    prizes: [
      { rank: "ಪ್ರಥಮ ಬಹುಮಾನ", amount: "₹23,333", extra: "+ ಟ್ರೋಫಿ", tone: "gold" },
      { rank: "ದ್ವಿತೀಯ ಬಹುಮಾನ", amount: "₹13,333", extra: "+ ಟ್ರೋಫಿ", tone: "silver" },
      { rank: "ತೃತೀಯ ಬಹುಮಾನ", amount: "ಟ್ರೋಫಿ", extra: "", tone: "bronze" },
      { rank: "ಚತುರ್ಥ ಬಹುಮಾನ", amount: "ಟ್ರೋಫಿ", extra: "", tone: "bronze" },
    ],
  },
  {
    id: "rules",
    ghost: "ನಿಯಮ",
    gradient:
      "radial-gradient(circle at 72% 48%, #0F7C8A 0%, #084654 50%, #021218 100%)",
    kicker: "ಮಾಣಿ ಟ್ರೋಫಿ",
    title: "📌 ಪಂದ್ಯಾವಳಿಯ ನಿಯಮಗಳು",
    text: null,
    rules: [
      "ಪ್ರತಿ ತಂಡದಲ್ಲಿ ಒಬ್ಬ ಐಕಾನ್ ಆಟಗಾರ ಕಡ್ಡಾಯ.",
      "ಜೆರ್ಸಿ ಕಡ್ಡಾಯವಾಗಿದ್ದು, ಸಮಿತಿಯ ವತಿಯಿಂದ ಒದಗಿಸಲಾಗುವುದು.",
      "ತಂಡದ ನೋಂದಣಿಗೆ ಕೊನೆಯ ದಿನಾಂಕ: 25 ಡಿಸೆಂಬರ್ 2026.",
      "ಆಟಗಾರರ ನೋಂದಣಿಯ ಪ್ರತ್ಯೇಕ ವಿವರಗಳನ್ನು ನಂತರ ನೀಡಲಾಗುವುದು.",
      "ಸಮಿತಿ ಹಾಗೂ ಅಂಪೈರ್‌ಗಳ ನಿರ್ಧಾರವೇ ಅಂತಿಮ.",
    ],
    cta: true,
  },
  {
    id: "location",
    ghost: "ಮೈದಾನ",
    gradient:
      "radial-gradient(circle at 72% 48%, #8B1E3F 0%, #4A0E24 50%, #14030A 100%)",
    kicker: "ಪಂದ್ಯಾವಳಿಯ ಸ್ಥಳ 📍",
    title: "ಯೋಜನಾನಗರ ಶಾಲಾ ಮೈದಾನ",
    text: "ಯೋಜನಾನಗರ, ಬೈಂದೂರು · 13°52'42.8\"N 74°37'59.0\"E",
    location: {
      url: "https://maps.app.goo.gl/tTRjDRY4KFAqYj6K6",
      embed: "https://www.google.com/maps?q=13.878556,74.633056&z=16&output=embed",
    },
  },
];

const Hero = () => {
  const [direction, setDirection] = useState(1);
  const [current, setCurrent] = useState(() => {
    const n = Number(new URLSearchParams(window.location.search).get("slide"));
    return Number.isInteger(n) && n >= 0 && n < slides.length ? n : 0;
  });
  const item = slides[current];

  const go = (dir) => {
    setDirection(dir);
    setCurrent((p) => (p + dir + slides.length) % slides.length);
  };

  const panelVariants = {
    initial: (d) => ({ x: d === 1 ? "100%" : "-100%" }),
    animate: { x: "0%" },
    exit: (d) => ({ x: d === 1 ? "-100%" : "100%" }),
  };

  const textIn = (d, delay = 0) => ({
    initial: { x: d === 1 ? 140 : -140, opacity: 0, filter: "blur(8px)" },
    animate: { x: 0, opacity: 1, filter: "blur(0px)" },
    exit: { x: d === 1 ? -140 : 140, opacity: 0, filter: "blur(8px)" },
    transition: { duration: 0.6, ease, delay },
  });

  return (
    <div className="hero">
      <div className="bg-slides-container">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-slide-track">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={item.id + "-" + i}
                custom={direction}
                variants={panelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.95, ease, delay: i * 0.08 }}
                className="bg-slide-panel"
                style={{ background: item.gradient }}
              />
            </AnimatePresence>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={item.id + "-ghost"}
          className="slide-bg-word"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {item.ghost}
        </motion.div>
      </AnimatePresence>

      <Navbar />

      <div className="hero-main-layout">
        <div className="hero-content">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={item.id + "-text"}
              className="hero-text-group"
              {...textIn(direction, 0.1)}
            >
              <p className="hero-presents">{item.kicker}</p>
              <h1 className={"hero-title" + (item.memorial ? " memorial-title" : "")}>
                {item.title}
              </h1>
              {item.text && <p className="hero-text">{item.text}</p>}
              {item.countdown && <Countdown />}
              {item.contacts && (
                <div className="contact-box">
                  <p>ಯಾವುದೇ ಸಂದೇಹಗಳಿದ್ದಲ್ಲಿ ಸಂಪರ್ಕಿಸಿ:</p>
                  <div className="contact-list">
                    {item.contacts.map((c) => (
                      <a key={c.phone} href={"tel:+91" + c.phone}>
                        <span>📞 {c.name}</span>
                        <b>{c.phone}</b>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {item.fees && (
                <div className="fees-box">
                  <h3>{item.feesTitle}</h3>
                  <ul>
                    {item.fees.map((fee) => <li key={fee}>{fee}</li>)}
                  </ul>
                </div>
              )}
              {item.location && (
                <div className="hero-cta-row">
                  <motion.a href={item.location.url} target="_blank" rel="noreferrer" className="cta-primary"
                    whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
                    📍 ಗೂಗಲ್ ಮ್ಯಾಪ್‌ನಲ್ಲಿ ನೋಡಿ
                  </motion.a>
                </div>
              )}
              {item.cta && (
                <div className="hero-cta-row">
                  <motion.a href="#/team" className="cta-primary"
                    whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
                    ತಂಡ ನೋಂದಣಿ
                  </motion.a>
                  <motion.a href="#/player" className="cta-secondary"
                    whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
                    ಆಟಗಾರ ನೋಂದಣಿ
                  </motion.a>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="hero-image-showcase">
          <div className="logo-glow" />
          <AnimatePresence mode="wait">
            {item.facts ? (
              <motion.div
                key={item.id + "-facts"}
                className="facts-list"
                initial={{ scale: 0.4, opacity: 0, y: 60 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ type: "spring", stiffness: 70, damping: 14 }}
              >
                {item.facts.map((fc, i) => (
                  <motion.div
                    key={fc.label}
                    className="fact-card"
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.12 }}
                    whileHover={{ scale: 1.04, x: -6 }}
                  >
                    <span className="fact-icon">{fc.icon}</span>
                    <span className="fact-label">{fc.label}</span>
                    <span className="fact-value">{fc.value}</span>
                  </motion.div>
                ))}
              </motion.div>
            ) : item.rules ? (
              <motion.ol
                key={item.id + "-rules"}
                className="rules-list"
                initial={{ scale: 0.4, opacity: 0, y: 60 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ type: "spring", stiffness: 70, damping: 14 }}
              >
                {item.rules.map((r, i) => (
                  <motion.li
                    key={r}
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.12 }}
                    whileHover={{ x: -6 }}
                  >
                    <b>{i + 1}</b>
                    <span>{r}</span>
                  </motion.li>
                ))}
              </motion.ol>
            ) : item.prizes ? (
              <motion.div
                key={item.id + "-prizes"}
                className="prize-list"
                initial={{ scale: 0.4, opacity: 0, y: 60 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ type: "spring", stiffness: 70, damping: 14 }}
              >
                {item.prizes.map((pz, i) => (
                  <motion.div
                    key={pz.rank}
                    className={"prize-card " + pz.tone}
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.12 }}
                    whileHover={{ scale: 1.04, x: -6 }}
                  >
                    <span className="prize-rank">{pz.rank}</span>
                    <span className="prize-amount">{pz.amount}</span>
                    {pz.extra && <span className="prize-extra">{pz.extra}</span>}
                  </motion.div>
                ))}
                <motion.div
                  className="awards-box"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85 }}
                >
                  <h3>{item.awardsTitle}</h3>
                  <div className="awards-chips">
                    {item.awards.map((a) => <span key={a}>{a}</span>)}
                  </div>
                </motion.div>
              </motion.div>
            ) : item.location ? (
              <motion.div
                key={item.id + "-map"}
                className="map-card"
                initial={{ scale: 0.4, opacity: 0, y: 60 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ type: "spring", stiffness: 70, damping: 14 }}
              >
                <iframe
                  title="ಯೋಜನಾನಗರ ಶಾಲಾ ಮೈದಾನ"
                  src={item.location.embed}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </motion.div>
            ) : item.teams ? (
              <motion.div
                key={item.id + "-teams"}
                className="team-chips"
                initial={{ scale: 0.4, opacity: 0, y: 60 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ type: "spring", stiffness: 70, damping: 14 }}
              >
                {item.teams.map((t, i) => (
                  <motion.span
                    key={t}
                    className="team-chip"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    whileHover={{ scale: 1.08, y: -4 }}
                  >
                    <b>📍</b> {t}
                  </motion.span>
                ))}
              </motion.div>
            ) : item.dates ? (
              <motion.div
                key={item.id + "-dates"}
                className="date-cards"
                initial={{ scale: 0.3, opacity: 0, rotate: direction === 1 ? 20 : -20 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.3, opacity: 0 }}
                transition={{ type: "spring", stiffness: 70, damping: 14 }}
              >
                {item.dates.map((d, i) => (
                  <motion.div
                    key={d.day}
                    className="date-card"
                    animate={{ y: [0, i ? 14 : -14, 0] }}
                    transition={{ repeat: Infinity, duration: 4 + i, ease: "easeInOut" }}
                  >
                    <span className="date-week">{d.week}</span>
                    <span className="date-day">{d.day}</span>
                    <span className="date-month">ಜನವರಿ 2027</span>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.img
                key={item.id + "-img"}
                src={item.image}
                alt={item.imageAlt}
                className={"hero-img" + (item.memorial ? " memorial-img" : "")}
                initial={{ scale: 0.2, rotate: direction === 1 ? 90 : -90, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1, y: [0, -18, 0] }}
                exit={{ scale: 0.2, rotate: direction === 1 ? -90 : 90, opacity: 0 }}
                transition={{
                  type: "spring", stiffness: 65, damping: 15,
                  y: { repeat: Infinity, duration: 4.5, ease: "easeInOut" },
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="arrows">
        <button className="arrow left" onClick={() => go(-1)} aria-label="ಹಿಂದಕ್ಕೆ">←</button>
        <button className="arrow right" onClick={() => go(1)} aria-label="ಮುಂದಕ್ಕೆ">→</button>
      </div>
    </div>
  );
};

export default Hero;
