import "dotenv/config";
import fs from "fs";
import config from "./config.js";
import SpotifyWebApi from "spotify-web-api-node";

const userFields = "id,display_name"
const trackFields = "album,artists,duration_ms,id,is_local,name";
const tracklistItemFields = `added_at,added_by,is_local,track(${trackFields})`
const tracklistFields = `items(${tracklistItemFields}),next,offset,limit`
const playlistFields = `id,name,owner(${userFields}),tracks(${tracklistFields})`

const spotifyApi = new SpotifyWebApi();

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

async function getPlaylist(id) {
    const res = await spotifyApi.getPlaylist(id, { fields: playlistFields });
    return res.body;
}

async function getPlaylists() {
    for (const id of getPlaylistIds()) {
        try {
            const playlist = await getPlaylist(id);
            await fillPlaylistTracks(playlist);
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

async function fillPlaylistTracks(playlist) {
    let { items, next, offset, limit } = playlist.tracks;

    if (next) {
        const tracks = await getPlaylistTracks(playlist.id, offset + limit);
        playlist.tracks.items = [ ...items, ...tracks ];
    }
}

async function getPlaylistTracks(id, offset = 0) {
    const { body: data } = await spotifyApi.getPlaylistTracks(id, { offset, fields: tracklistFields });

    offset = data.offset;
    let { items, next, limit } = data;

    if (next) {
        const tracks = await getPlaylistTracks(id, offset + limit);
        items = [ ...items, ...tracks ]
    }

    return items;
}

main()
    .then(() => console.log("Done!"))
    .catch((error) => console.error(error))