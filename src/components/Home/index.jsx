import React, { useState, useEffect, createRef } from "react";
import SpotifyApi from "../../spotifyApi";
import _ from "lodash";
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
} from "semantic-ui-react";
import logo from "../../branding/4.png";

const Home = ({ user }) => {
  const [spotifyPlaylists, setSpotifyPlaylists] = useState([]);
  const [playlistsTracks, setPlaylistsTracks] = useState([]);
  const [trackList, setTrackList] = useState([]);
  const [included, setIncluded] = useState({});
  const [loadingIntersection, setLoadingIntersection] = useState(false);
  const [playlistsVisible, setPlaylistsVisible] = useState(true);

  const contextRef = createRef();

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

  const handleCheckboxChange = (event, data, playlistId) => {
    const newIncluded = { ...included, [playlistId]: data.checked };
    setIncluded(newIncluded);
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        width: "100%",
        padding: "1rem",
        // backgroundColor: "#f5f6fa",
        backgroundColor: "#2d2d2d",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "2rem",
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
              paddingRight: "2rem",
            }}
          >
            <b>{user.display_name}</b>
          </span>
        </div>
      </div>

      <Ref innerRef={contextRef}>
        <Grid reversed="mobile" stackable columns={2} style={{ width: "100%" }}>
          <Grid.Column>
            <Segment inverted id="common-tracks-segment">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Header
                  as="h2"
                  style={{ color: "#1692a4" }}
                  className="segment-title"
                >
                  {/* <Header as="h2" style={{ color: "#1DB954" }}> */}
                  Tracks in Common
                </Header>
                {!loadingIntersection ? (
                  // <Item.Group>
                  //   {trackList.map((item) => {
                  //     const trackName = item.track.name;
                  //     const trackArtist = _.first(item.track.artists).name;
                  //     const trackImage = item.track.album.images
                  //       ? _.first(item.track.album.images).url
                  //       : "";
                  //     return (
                  //       <Item>
                  //         <Item.Image
                  //           size="tiny"
                  //           src={trackImage}
                  //           style={{ borderRadius: 100 }}
                  //           className="track-image"
                  //         />
                  //         <Item.Content verticalAlign="middle">
                  //           <Item.Header>{trackName}</Item.Header>
                  //           <Item.Meta>{trackArtist}</Item.Meta>
                  //         </Item.Content>
                  //       </Item>
                  //     );
                  //   })}
                  // </Item.Group>
                  <ul style={{ width: "100%", paddingLeft: 0 }}>
                    {trackList.map((item) => {
                      const trackName = item.track.name;
                      const trackArtist = _.first(item.track.artists).name;
                      const trackImage = item.track.album.images
                        ? _.first(item.track.album.images).url
                        : "";
                      return (
                        <li style={{ listStyle: "none", marginBottom: "1rem" }}>
                          <div
                            style={{
                              display: "flex",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                              }}
                            >
                              <Image
                                src={trackImage}
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  marginRight: "1rem",
                                  borderRadius: 100,
                                }}
                              />
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  marginLeft: "1.5rem",
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
          <Grid.Column>
            <Segment
              inverted
              id="playlist-segment"
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
                  style={{ color: "#1692a4" }}
                  className="segment-title"
                >
                  Playlists
                </Header>

                <div style={{ position: "absolute", right: 10, top: 10 }}>
                  <Button
                    icon
                    size="mini"
                    onClick={() => setPlaylistsVisible(!playlistsVisible)}
                  >
                    <Icon name={playlistsVisible ? "hide" : "unhide"} />
                  </Button>
                </div>

                {playlistsVisible && (
                  <ul style={{ width: "100%", paddingLeft: 0 }}>
                    {spotifyPlaylists.map((playlist) => {
                      const imageUrl = playlist.images
                        ? _.first(playlist.images).url
                        : "";
                      return (
                        <li style={{ listStyle: "none", marginBottom: "1rem" }}>
                          <div
                            style={{
                              display: "flex",
                            }}
                          >
                            <div style={{ display: "flex" }}>
                              <Image
                                src={imageUrl}
                                style={{
                                  width: "70px",
                                  height: "70px",
                                  marginRight: "1rem",
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
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {/* <Item.Group>
                  {spotifyPlaylists.map((playlist) => {
                    const imageUrl = playlist.images
                      ? _.first(playlist.images).url
                      : "";
                    return (
                      <Item className="playlist-item" style={{ width: "550px" }}>
                        <Item.Image size="tiny" src={imageUrl} />
                        <Item.Content verticalAlign="middle">
                          <Item.Header>{playlist.name}</Item.Header>
                          <Item.Extra>
                            <Checkbox
                              slider
                              checked={included[playlist.id]}
                              onChange={(event, data) =>
                                handleCheckboxChange(event, data, playlist.id)
                              }
                            />
                          </Item.Extra>
                        </Item.Content>
                      </Item>
                    );
                  })}
                </Item.Group> */}
              </div>
              <Sticky
                context={contextRef}
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "flex-end",
                }}
              >
                {/* <div
                  style={{
                    height: 50,
                    width: 50,
                    backgroundColor: "#ecf0f1",
                    borderRadius: 50,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Icon name="angle double up" />
                </div> */}
                <Button
                  icon
                  size="mini"
                  circular
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                >
                  <Icon name="angle double up" />
                </Button>
              </Sticky>
            </Segment>

            {/* <div
            id="relative-layer"
            style={{ width: 50, height: 50, backgroundColor: "grey", right: 0 }}
          >
            <div id="fixed-layer">Back to top</div>
          </div> */}
          </Grid.Column>
        </Grid>
      </Ref>
    </div>
  );
};

export default Home;
