import { useState, useEffect } from "react";
// import "./App.css";
import "semantic-ui-css/semantic.min.css";
import "react-toastify/dist/ReactToastify.css";

import { authenticateUser } from "./utils/auth";

import Home from "./components/Home";
import Login from "./components/Login";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleAuth = async () => {
      const response = await authenticateUser();
      setUser(response.data);
      setLoggedIn(response.status === 200);
    };

    handleAuth();
  }, []);

  return (
    <div className="App">{loggedIn ? <Home user={user} /> : <Login />}</div>
  );
}

export default App;
