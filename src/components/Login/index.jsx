import React from "react";
import { Button, Icon, Image } from "semantic-ui-react";
import { generateRandomString } from "../../utils";
// import { CLIENT_ID, REDIRECT_URI } from "../../config";
import logo from "../../branding/1.png";

import "./index.css";

const stateKey = "spotify_auth_state";

const Login = () => {
  const login = () => {
    const state = generateRandomString(16);

    localStorage.setItem(stateKey, state);

    const scope = "user-read-private user-read-email playlist-read-private";
    const redirectURI =
      process.env.NODE_ENV === "production"
        ? process.env.REACT_APP_REDIRECT_URI
        : "http://localhost:3000";

    let url = "https://accounts.spotify.com/authorize";
    url += "?response_type=token";
    url +=
      "&client_id=" +
      encodeURIComponent(process.env.REACT_APP_SPOTIFY_CLIENT_ID);
    url += "&scope=" + encodeURIComponent(scope);
    url += "&redirect_uri=" + encodeURIComponent(redirectURI);
    url += "&state=" + encodeURIComponent(state);
    url += "&show_dialog=" + encodeURIComponent("true");

    window.location = url;
  };

  return (
    <div
      id="background"
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          paddingRight: "20rem",
        }}
      >
        {process.env.NOT_SECRET_CODE}
        <Image src={logo} style={{ width: 150, marginRight: "5rem" }} />

        <Button
          onClick={login}
          size="medium"
          id="login-button"
          style={{ color: "white", marginTop: "8rem" }}
        >
          <Icon name="spotify" style={{ color: "white" }} /> Login With Spotify
        </Button>
      </div>
    </div>
  );
};

export default Login;
