import "dotenv/config";
import fs from "fs";
import config from "./config.js";
import axios from "axios";

async function main() {
    const playlistIds = getPlaylistIds();

    if (!config.spotifyToken) {
        throw new Error("No OAuth token.");
    }

    for (const id of playlistIds) {
        try {
            const res = await getPlaylist(id);
            console.log(`Playlist ${res.data.name} found successfully.`)
            // console.log(res.data);
        }
        catch ({ response }) {
            const { status, message } = response.data.error;

            if (status == 404 && !config.stopIfPlaylistNotFound) {
                console.error(`Playlist with id ${id} not found, skipping...`);
                continue;
            }

            throw new Error(`${message} (Status code: ${status})`);
        }
    }
}

function getPlaylistIds() {
    return fs.readFileSync("./playlists", 'utf-8')
        .trim().replace("\r", "")
        .split("\n").filter(v => v);
}

async function getPlaylist(id) {
    const fields = "name,owner,tracks(items,next,offset,limit)";
    const url = `https://api.spotify.com/v1/playlists/${id}?fields=${fields}`;

    return await axios.get(url, {
        headers: { 'Authorization': `Bearer ${config.spotifyToken}` }
    })
}

main()
    .then(() => console.log("Done!"))
    .catch((error) => console.error(error))