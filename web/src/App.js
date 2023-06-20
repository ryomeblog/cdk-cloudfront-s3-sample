import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
  Link
} from "react-router-dom";

function NavigationHandler() {
  const navigate = useNavigate();
  useEffect(() => {
    if (window.location.hash.startsWith("")) {
      const path = window.location.hash.substr(2);
      const routes = ['/test', '/test2'];
      if (routes.some(route => route === path)) {
        navigate(path);
      }
    }
  }, []);

  return null;
}

export default function App() {
  return (
    <Router>
      <div>
        <NavigationHandler />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<Test />} />
          <Route path="/test2" element={<Test2 />} />
        </Routes>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div>
      <h2>Home</h2>
      <Link to="/test">Go to Test</Link>
    </div>
  );
}

function Test() {
  return (
    <div>
      <h2>Test</h2>
      <Link to="/">Go to Home</Link><br />
      <Link to="/test2">Go to Test2</Link>
    </div>
  );
}

function Test2() {
  return (
    <div>
      <h2>Test2</h2>
      <Link to="/test">Go to Test</Link>
    </div>
  );
}
