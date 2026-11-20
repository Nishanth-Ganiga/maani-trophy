import { useEffect, useState } from "react";
import Hero from "./components/Hero";
import TeamRegistration from "./pages/TeamRegistration";
import PlayerRegistration from "./pages/PlayerRegistration";
import Admin from "./pages/Admin";

const route = () => window.location.hash.replace(/^#/, "") || "/";

function App() {
  const [path, setPath] = useState(route());

  useEffect(() => {
    const onChange = () => { setPath(route()); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  if (path === "/team") return <TeamRegistration />;
  if (path === "/player") return <PlayerRegistration />;
  if (path === "/admin") return <Admin />;
  return <Hero />;
}

export default App;
