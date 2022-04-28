import "dotenv/config";
import fs from "fs";
import config from "./config.js";
import SpotifyWebApi from "spotify-web-api-node";
import { createPlaylistService } from "./playlist.service.js";

const spotifyApi = new SpotifyWebApi();
const playlistService = createPlaylistService(spotifyApi);

async function main() {
    if (!config.spotifyToken) {
        throw new Error("No OAuth token.");
    }

    spotifyApi.setAccessToken(config.spotifyToken);
    await getPlaylists();
}

function getPlaylistIds() {
    return fs.readFileSync("./playlists", 'utf-8')
        .trim().replace("\r", "")
        .split("\n").filter(v => v);
}

async function getPlaylists() {
    for (const id of getPlaylistIds()) {
        try {
            const playlist = await playlistService.getPlaylistWithAllTracks(id);
            console.log(`Playlist "${playlist.name}" loaded successfully.`);
        }
        catch (error) {
            console.log(error);
            const { status, message } = error.response.data.error;

            if (status == 404 && !config.stopIfPlaylistNotFound) {
                console.error(`Playlist with id ${id} not found, skipping...`);
                continue;
            }

            throw new Error(`${message} (Status code: ${status})`);
        }
    }
}

main()
    .then(() => console.log("Done!"))
    .catch((error) => console.error(error))