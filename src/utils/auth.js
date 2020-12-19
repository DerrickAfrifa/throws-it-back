import axios from "axios";
import SpotifyApi from "../spotifyApi";

import { getHashParams } from "../utils";
const stateKey = "spotify_auth_state";

export const authenticateUser = async () => {
  const params = getHashParams();

  const access_token = params.access_token,
    state = params.state,
    storedState = localStorage.getItem(stateKey);

  if (access_token && (state == null || state !== storedState)) {
    alert("There was an error during the authentication");
  } else {
    localStorage.removeItem(stateKey);
    if (access_token) {
      const response = await axios.get("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: "Bearer " + access_token,
        },
      });

      if (response.status === 200) {
        SpotifyApi.setAccessToken(access_token);
        console.log("success", response);
        return response;
      } else {
        alert("failure getting user");
      }
    } else {
      console.log("no access token");
    }
  }
  return false;
};
