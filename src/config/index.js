import { toBoolean } from "../util/env.utils.js";

const config = {
    spotifyToken: process.env.SPOTIFY_TOKEN,
    stopIfPlaylistNotFound: toBoolean(process.env.STOP_IF_PLAYLIST_NOT_FOUND, true),
    newPlaylistName: process.env.NEW_PLAYLIST_NAME || "Merge Result"
}

export default config;