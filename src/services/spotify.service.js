import SpotifyWebApi from "spotify-web-api-node";
import config from "../config/index.js";

const spotifyService = new SpotifyWebApi();

if (!config.spotifyToken) {
    throw new Error("No OAuth token.");
}

spotifyService.setAccessToken(config.spotifyToken);

export default spotifyService;