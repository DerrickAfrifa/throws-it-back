import React, { useState, useEffect, createRef } from "react";
import SpotifyApi from "../../spotifyApi";
import _ from "lodash";
import { ToastContainer, toast } from "react-toastify";
import { animateScroll as scroll } from "react-scroll";
import helpImage from "../../images/help.png";
import "./index.css";

import {
  Header,
  Checkbox,
  Segment,
  Loader,
  Dimmer,
  Image,
  Grid,
  Sticky,
  Icon,
  Ref,
  Button,
  Transition,
  Modal,
} from "semantic-ui-react";
import logo from "../../branding/4.png";

const Home = ({ user }) => {
  const [spotifyPlaylists, setSpotifyPlaylists] = useState([]);
  const [playlistsTracks, setPlaylistsTracks] = useState([]);
  const [trackList, setTrackList] = useState([]);
  const [included, setIncluded] = useState({});
  const [loadingIntersection, setLoadingIntersection] = useState(false);
  const [playlistsVisible, setPlaylistsVisible] = useState(true);
  const [scrollButtonStuck, setScrollButtonStuck] = useState(false);
  const [openHelpModal, setOpenHelpModal] = useState(false);

  const contextRef = createRef();

  const notifyPlaying = (trackName) => toast.dark(`Now playing: ${trackName}`);
  const notifyError = (errorMessage) => {
    let message = errorMessage;
    switch (errorMessage) {
      case "The access token expired":
        message = "You need to sign back in. Refresh the page.";
        break;
      default:
        break;
    }
    return toast.error(message, {});
  };

  useEffect(() => {
    setLoadingIntersection(true);
    const includedTracks = playlistsTracks.filter((tracksObject) => {
      const playlistId = tracksObject.href.split("/")[5];
      return included[playlistId];
    });
    const trackItems = includedTracks.map((trackObject) => trackObject.items);
    const commonTracks = getCommonTracksInPlaylists(trackItems);
    console.log(
      "🚀 ~ file: index.jsx ~ line 20 ~ useEffect ~ commonTracks",
      commonTracks
    );
    setTrackList(commonTracks);
    setTimeout(() => setLoadingIntersection(false), 200 * 2);
  }, [included, playlistsTracks]);

  const getCommonTracksInPlaylists = (tracks) => {
    console.log("beggining common");
    return _.intersectionWith(...tracks, (value, other) =>
      _.isEqual(value.track.id, other.track.id)
    );
  };

  useEffect(() => {
    const initialiseCommonTracks = async () => {
      try {
        const playlists = await SpotifyApi.getUserPlaylists({ limit: 50 });
        console.log("User playlists", playlists);
        let spotifyPlaylists = playlists.items.filter(
          (item) =>
            item.owner.id === "spotify" &&
            item.name.startsWith("Your Top Songs")
        );
        console.log(
          "🚀 ~ file: index.jsx ~ line 55 ~ initialiseCommonTracks ~ spotifyPlaylists",
          spotifyPlaylists
        );

        spotifyPlaylists = spotifyPlaylists.sort((a, b) =>
          a.name < b.name ? 1 : -1
        );
        console.log(
          "🚀 ~ file: index.jsx ~ line 61 ~ initialiseCommonTracks ~ spotifyPlaylists SORTED ***",
          spotifyPlaylists
        );

        setSpotifyPlaylists(spotifyPlaylists);
        const included = {};
        spotifyPlaylists.forEach((playlist) => {
          included[playlist.id] = true;
        });

        setIncluded(included);

        const playlistIds = spotifyPlaylists.map((playlist) => playlist.id);

        const playlistsTracksPromises = playlistIds.map((playlistId) =>
          SpotifyApi.getPlaylistTracks(playlistId)
        );
        let playlistsTracks = (await Promise.all(playlistsTracksPromises)).map(
          (playlistTracks) => playlistTracks
        );

        const includedTracks = playlistsTracks.filter((tracksObject) => {
          const playlistId = tracksObject.href.split("/")[5];
          return included[playlistId];
        });
        const trackItems = includedTracks.map(
          (trackObject) => trackObject.items
        );
        const commonTracks = getCommonTracksInPlaylists(trackItems);

        setTrackList(commonTracks);

        console.log(
          "🚀 ~ file: index.jsx ~ line 35 ~ initialiseCommonTracks ~ playlistsTracks",
          playlistsTracks
        );
        setPlaylistsTracks(playlistsTracks);
      } catch (error) {
        console.error(error);
      }
    };

    initialiseCommonTracks();
  }, []);

  const handleScrollButtonStuck = (event, data) => {
    if (!scrollButtonStuck) {
      setScrollButtonStuck(true);
    }
  };

  const handleScrollButtonUnstuck = (event, data) => {
    if (scrollButtonStuck) {
      setScrollButtonStuck(false);
    }
  };

  const handleCheckboxChange = (event, data, playlistId) => {
    const newIncluded = { ...included, [playlistId]: data.checked };
    setIncluded(newIncluded);
  };

  const handlePlayClicked = (trackUri, trackName) => {
    // console.log(
    //   "🚀 ~ file: index.jsx ~ line 137 ~ handlePlayClicked ~ trackUri",
    //   trackUri
    // );
    SpotifyApi.play({ uris: [trackUri] }, (error, value) => {
      if (!error) {
        console.log("value", value);
        notifyPlaying(trackName);
      } else {
        // console.log("was error", error);
        notifyError(JSON.parse(error.response).error.message);
        console.log(JSON.parse(error.response));
      }
    });
  };

  const scrollToTop = () => {
    scroll.scrollToTop();
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        width: "100%",
        paddingTop: "1rem",
        // backgroundColor: "#f5f6fa",
        backgroundColor: "#121212",
      }}
    >
      <ToastContainer
        position="top-center"
        autoClose={2.5 * 1000}
        pauseOnHover
        hideProgressBar
        style={{ textAlign: "center" }}
        progressStyle={{ backgroundColor: "#1692a4" }}
      />
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1rem",
        }}
      >
        <div>
          <Image src={logo} style={{ width: 40, marginLeft: "1rem" }} />
        </div>

        <div>
          <span
            style={{
              fontSize: "1.2rem",
              color: "white",
              fontFamily: "Josefin Sans",
              paddingRight: "1rem",
              marginLeft: "1rem",
            }}
          >
            <b>{user.display_name}</b>
          </span>
          <Modal
            onClose={() => setOpenHelpModal(false)}
            onOpen={() => setOpenHelpModal(true)}
            open={openHelpModal}
            trigger={
              <Button
                icon
                size="mini"
                inverted
                circular
                onClick={() => setOpenHelpModal(true)}
                style={{ marginRight: "1rem" }}
              >
                <Icon name="help" />
              </Button>
            }
          >
            <Modal.Header>Help</Modal.Header>
            <Modal.Content image>
              <Image size="small" src={helpImage} wrapped />
              <Modal.Description>
                <h3>Please complete the following steps</h3>
                <p>1. Search for your Spotify wrapped playlists</p>
                <p>
                  2. Add the playlists to your library by pressing the like
                  button
                </p>
              </Modal.Description>
            </Modal.Content>
            <Modal.Actions>
              <Button onClick={() => setOpenHelpModal(false)} positive>
                Ok
              </Button>
            </Modal.Actions>
          </Modal>
        </div>
      </div>

      <Ref innerRef={contextRef}>
        <Grid
          id="main-grid"
          reversed="mobile"
          stackable
          columns={2}
          style={{ width: "100%" }}
        >
          <Grid.Column id="common-tracks-column">
            <Segment
              inverted
              id="common-tracks-segment"
              className="segment-panel"
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Header
                  as="h2"
                  // style={{ color: "#1692a4" }}
                  style={{ color: "white" }}
                  className="segment-title"
                >
                  {/* <Header as="h2" style={{ color: "#1DB954" }}> */}
                  Tracks in Common
                </Header>
                {!loadingIntersection ? (
                  <ul style={{ width: "100%", paddingLeft: 0 }}>
                    {trackList.map((item, index) => {
                      const trackName = item.track.name;
                      const trackArtist = _.first(item.track.artists).name;
                      const trackImage = item.track.album.images
                        ? _.first(item.track.album.images).url
                        : "";
                      const trackUri = item.track.uri;
                      return (
                        <li
                          key={index}
                          style={{ listStyle: "none", marginBottom: "1rem" }}
                        >
                          <div
                            style={{
                              display: "flex",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                width: "100%",
                              }}
                            >
                              <div style={{ width: "25%" }}>
                                <Image
                                  src={trackImage}
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    marginRight: "1rem",
                                    borderRadius: 100,
                                  }}
                                />
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  width: "60%",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "1.2rem",
                                  }}
                                >
                                  {trackName}
                                </span>
                                <span>{trackArtist}</span>
                              </div>

                              <div style={{ width: "15%" }}>
                                <Button
                                  icon="play"
                                  size="mini"
                                  circular
                                  inverted
                                  onClick={() =>
                                    handlePlayClicked(trackUri, trackName)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <Dimmer active>
                    <Loader>Loading</Loader>
                  </Dimmer>
                )}
              </div>
            </Segment>
          </Grid.Column>
          <Grid.Column id="playlist-column">
            <Segment
              inverted
              id="playlist-segment"
              className="segment-panel"
              // style={{ paddingLeft: "3rem", paddingRight: "3rem" }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Header
                  as="h2"
                  style={{ color: "white" }}
                  className="segment-title"
                >
                  Playlists
                </Header>

                <div style={{ position: "absolute", right: 10, top: "1.5rem" }}>
                  <Button
                    icon
                    size="mini"
                    inverted
                    circular
                    onClick={() => setPlaylistsVisible(!playlistsVisible)}
                  >
                    <Icon name={playlistsVisible ? "hide" : "unhide"} />
                  </Button>
                </div>

                <Transition
                  visible={playlistsVisible}
                  animation="slide down"
                  duration={500}
                >
                  <ul style={{ width: "100%", paddingLeft: 0 }}>
                    {spotifyPlaylists.map((playlist, index) => {
                      const imageUrl = playlist.images
                        ? _.first(playlist.images).url
                        : "";
                      return (
                        <li
                          key={index}
                          style={{ listStyle: "none", marginBottom: "1rem" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <div style={{ display: "flex" }}>
                              <Image
                                src={imageUrl}
                                style={{
                                  width: "70px",
                                  height: "70px",
                                  marginRight: "1rem",
                                  borderRadius: "5px",
                                }}
                              />
                              <span
                                style={{
                                  fontSize: "1.2rem",
                                  paddingRight: "1rem",
                                }}
                              >
                                {playlist.name}
                              </span>
                            </div>
                            <Checkbox
                              slider
                              checked={included[playlist.id]}
                              onChange={(event, data) =>
                                handleCheckboxChange(event, data, playlist.id)
                              }
                              style={{ height: "fit-content" }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </Transition>
              </div>
              <Sticky
                context={contextRef}
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "flex-end",
                  paddingRight: scrollButtonStuck ? "4rem" : null,
                }}
                offset={10}
                onStick={handleScrollButtonStuck}
                onUnstick={handleScrollButtonUnstuck}
              >
                <Button
                  icon
                  // inverted
                  color="teal"
                  size={scrollButtonStuck ? "huge" : "mini"}
                  circular
                  onClick={() => scrollToTop()}
                  style={{ marginRight: 0 }}
                >
                  <Icon name="angle double up" />
                </Button>
              </Sticky>
            </Segment>
          </Grid.Column>
        </Grid>
      </Ref>
    </div>
  );
};

export default Home;
