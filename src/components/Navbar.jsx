import React from 'react';
import './Navbar.css';
import { motion } from 'framer-motion';

const links = [
  { label: 'ಮುಖಪುಟ', href: '#/' },
  { label: 'ತಂಡ ನೋಂದಣಿ', href: '#/team' },
  { label: 'ಆಟಗಾರ ನೋಂದಣಿ', href: '#/player' },
];

const Navbar = () => {
  const container = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1 } },
  };
  const item = { hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  return (
    <motion.div className="navbar" initial="hidden" animate="visible" variants={container}>
      <a href="#/" className="logo">
        <motion.img
          src="./images/darkast-colony-sm.webp"
          alt="ದರ್ಖಾಸ್ತ್ ಕಾಲೋನಿ ಗೆಳೆಯರ ಬಳಗ"
          width="64" height="64"
          whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.3 }}
        />
      </a>

      <ul className="nav-links">
        {links.map((l) => (
          <motion.li key={l.href} variants={item} whileHover={{ y: -3 }} className="nav-item">
            <a href={l.href}>{l.label}</a>
            <span className="nav-underline" />
          </motion.li>
        ))}
      </ul>

      <motion.a
        href="#/admin"
        className="signin-btn"
        variants={item}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ನಿರ್ವಾಹಕ ಲಾಗಿನ್
      </motion.a>
    </motion.div>
  );
};

export default Navbar;
