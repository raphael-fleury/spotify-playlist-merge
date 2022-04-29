import "dotenv/config";
import config from "./config.js";
import SpotifyWebApi from "spotify-web-api-node";
import { createPlaylistService } from "./playlist.service.js";
import { readFileLines } from "./util/file-utils.js";

const spotifyApi = new SpotifyWebApi();
const playlistService = createPlaylistService(spotifyApi);

async function main() {
    if (!config.spotifyToken) {
        throw new Error("No OAuth token.");
    }

    spotifyApi.setAccessToken(config.spotifyToken);
    const playlists = await getPlaylists();
    const newPlaylist = await playlistService.createPlaylist(config.newPlaylistName);
    const tracks = concatPlaylistsTracks(playlists);
    const uris = tracks.map(t => "spotify:track:" + t.id);
    await playlistService.addTracksToPlaylist(newPlaylist.id, uris);
}

function getPlaylistIds() {
    return readFileLines("./playlists");
}

async function getPlaylists() {
    const playlists = [];

    for (const id of getPlaylistIds()) {
        try {
            const playlist = await playlistService.getPlaylistWithAllTracks(id);
            playlists.push(playlist);
            console.log(`Playlist "${playlist.name}" loaded successfully.`);
        }
        catch (error) {
            const { status, message } = error.response.data.error;

            if (status == 404 && !config.stopIfPlaylistNotFound) {
                console.error(`Playlist with id ${id} not found, skipping...`);
                continue;
            }

            throw new Error(`${message} (Status code: ${status})`);
        }
    }

    return playlists;
}

function concatPlaylistsTracks(playlists) {
    let tracks = [];
    for (const playlist of playlists) {
        tracks = tracks.concat(playlist.tracks.items.map(i => i.track));
    }

    return tracks;
}

main()
    .then(() => console.log("Done!"))
    .catch((error) => console.error(error))