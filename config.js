const config = {
    spotifyToken: process.env.SPOTIFY_TOKEN,
    stopIfPlaylistNotFound: toBoolean(process.env.STOP_IF_PLAYLIST_NOT_FOUND, true)
}

function toBoolean(stringValue, defaultValue = false) {
    if (stringValue === "true") { return true }
    if (stringValue === "false") { return false }
    return defaultValue;
}

export default config;