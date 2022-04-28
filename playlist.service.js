const userFields = "id,display_name"
const trackFields = "album,artists,duration_ms,id,is_local,name";
const tracklistItemFields = `added_at,added_by,is_local,track(${trackFields})`
const tracklistFields = `items(${tracklistItemFields}),next,offset,limit`
const playlistFields = `id,name,owner(${userFields}),tracks(${tracklistFields})`

export function createPlaylistService(spotifyApi) {
    return {
        async getPlaylist(id) {
            const res = await spotifyApi.getPlaylist(id, { fields: playlistFields });
            return res.body;
        },

        async getPlaylistTracks(id, offset = 0, limit = 100) {
            const res = await spotifyApi.getPlaylistTracks(id, {
                offset, limit, fields: tracklistFields
            });

            return res.body;
        },

        async getPlaylistWithAllTracks(id) {
            const playlist = await this.getPlaylist(id);
            let tracks = playlist.tracks;
            let next;

            do {
                next = tracks.next;

                if (next) {
                    let { offset, limit } = tracks;
                    tracks = await this.getPlaylistTracks(playlist.id, offset + limit);
                    playlist.tracks.items = [ ...playlist.tracks.items, ...tracks.items ];
                }
            }
            while (next);

            return playlist;
        }
    }
}