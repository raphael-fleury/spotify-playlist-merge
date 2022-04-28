import "dotenv/config";
import fs from "fs";
import config from "./config.js";
import axios from "axios";

const userFields = "id,display_name"
const trackFields = "album,artists,duration_ms,id,is_local,name";
const tracklistItemFields = `added_at,added_by,is_local,track(${trackFields})`
const tracklistFields = `items(${tracklistItemFields}),next,offset,limit`
const playlistFields = `id,name,owner(${userFields}),tracks(${tracklistFields})`

const playlistsUrl = "https://api.spotify.com/v1/playlists";

async function main() {
    if (!config.spotifyToken) {
        throw new Error("No OAuth token.");
    }

    await getPlaylists();
}

function getPlaylistIds() {
    return fs.readFileSync("./playlists", 'utf-8')
        .trim().replace("\r", "")
        .split("\n").filter(v => v);
}

async function getPlaylist(id) {
    const url = `${playlistsUrl}/${id}?fields=${playlistFields}`;

    return await axios.get(url, {
        headers: { 'Authorization': `Bearer ${config.spotifyToken}` }
    })
}

async function getPlaylists() {
    for (const id of getPlaylistIds()) {
        try {
            const { data: playlist } = await getPlaylist(id);
            await fillPlaylistTracks(playlist);
            console.log(`Playlist "${playlist.name}" loaded successfully.`);
            console.log(playlist.tracks.items.reverse().map(i => i.track.name))
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

async function fillPlaylistTracks(playlist) {
    let { items, next, offset, limit } = playlist.tracks;

    if (next) {
        const tracks = await getPlaylistTracks(playlist.id, offset + limit);
        playlist.tracks.items = [ ...items, ...tracks ];
    }
}

async function getPlaylistTracks(id, offset = 0) {
    const url = `${playlistsUrl}/${id}/tracks?offset=${offset}`;

    const { data } = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${config.spotifyToken}` }
    })

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