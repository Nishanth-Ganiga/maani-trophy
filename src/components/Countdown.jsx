import { useEffect, useState } from "react";

const DAY = 24 * 60 * 60 * 1000;
const items = [
  {
    label: "ನೋಂದಣಿ ಮುಕ್ತಾಯಕ್ಕೆ",
    done: "ನೋಂದಣಿ ಮುಕ್ತಾಯವಾಗಿದೆ",
    target: new Date("2026-12-25T23:59:59+05:30"),
  },
  {
    label: "ಪಂದ್ಯಾವಳಿ ಆರಂಭಕ್ಕೆ",
    done: "ಪಂದ್ಯಾವಳಿ ಆರಂಭವಾಗಿದೆ",
    target: new Date("2027-01-23T08:30:00+05:30"),
  },
];

export default function Countdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="countdown">
      {items.map((it) => {
        const diff = it.target.getTime() - now;
        const days = Math.ceil(diff / DAY);
        return (
          <div className="countdown-card" key={it.label}>
            {diff > 0 ? (
              <>
                <span className="cd-label">{it.label}</span>
                <span className="cd-days">{days}</span>
                <span className="cd-unit">ದಿನಗಳು ಬಾಕಿ</span>
              </>
            ) : (
              <span className="cd-done">{it.done}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
