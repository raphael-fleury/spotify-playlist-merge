import "dotenv/config";
import config from "./src/config/index.js";
import spotifyService from "./src/services/spotify.service.js";
import { createPlaylistService } from "./src/services/playlist.service.js";
import { readFileLines } from "./src/util/file.utils.js";

const playlistService = createPlaylistService(spotifyService);

async function main() {
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

    if (config.skipDuplicates) {
        tracks = tracks.filter((track, index, self) => {
            const firstIndex = self.findIndex(v => v.id === track.id);
            return [-1, index].includes(firstIndex);
        })
    }

    return tracks;
}

main()
    .then(() => console.log("Done!"))
    .catch((error) => console.error(error))