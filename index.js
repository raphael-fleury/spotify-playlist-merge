import fs from "fs";
import "dotenv/config";
import config from "./config.js";

async function main() {
    const playlistIds = getPlaylistIds();
    console.log(playlistIds)

    if (!config.spotifyToken) {
        throw new Error("No OAuth token.");
    }
}

function getPlaylistIds() {
    return fs.readFileSync("./playlists", 'utf-8')
        .trim().replace("\r", "")
        .split("\n").filter(v => v);
}

main()
    .then(() => console.log("Done!"))
    .catch((error) => console.error(error))