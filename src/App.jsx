import { lazy, Suspense, useEffect, useState } from "react";
import Hero from "./components/Hero";

const TeamRegistration = lazy(() => import("./pages/TeamRegistration"));
const PlayerRegistration = lazy(() => import("./pages/PlayerRegistration"));
const Admin = lazy(() => import("./pages/Admin"));

const prefetch = () => {
  import("./pages/TeamRegistration");
  import("./pages/PlayerRegistration");
};

const route = () => window.location.hash.replace(/^#/, "") || "/";

function App() {
  const [path, setPath] = useState(route());

  useEffect(() => {
    // warm up the form pages while the visitor reads the front page
    const t = window.requestIdleCallback ? window.requestIdleCallback(prefetch) : setTimeout(prefetch, 2500);
    return () => (window.cancelIdleCallback ? window.cancelIdleCallback(t) : clearTimeout(t));
  }, []);

  useEffect(() => {
    const onChange = () => { setPath(route()); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  let page = <Hero />;
  if (path === "/team") page = <TeamRegistration />;
  else if (path === "/player") page = <PlayerRegistration />;
  else if (path === "/admin") page = <Admin />;

  return (
    <Suspense fallback={<div style={{ minHeight: "100svh", background: "#060b1a" }} />}>
      {page}
    </Suspense>
  );
}

export default App;
