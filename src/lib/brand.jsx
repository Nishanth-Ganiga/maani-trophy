// Google Translate turns "ಮಾಣಿ" into "waiter". These helpers keep the name as
// "Maani" / "Maani Trophy" when a visitor translates the page.
const RE = /(ಮಾಣಿ ಟ್ರೋಫಿ|ಮಾಣಿ)/g;
const EN = { "ಮಾಣಿ ಟ್ರೋಫಿ": "Maani Trophy", "ಮಾಣಿ": "Maani" };

function Brand({ kn }) {
  return (
    <>
      <span className="brand-kn notranslate" translate="no">{kn}</span>
      <span className="brand-en notranslate" translate="no">{EN[kn]}</span>
    </>
  );
}

export function brandify(text) {
  if (typeof text !== "string") return text;
  return text.split(RE).map((part, i) => (EN[part] ? <Brand key={i} kn={part} /> : part));
}
