const db = require('../config/db');

// Show all playlists
exports.showPlaylists = async (req, res) => {
    try {
        const [playlists] = await db.query('SELECT * FROM playlists');
        res.render('playlist', { playlists });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// Create a new playlist
exports.createPlaylist = async (req, res) => {
    const { name } = req.body;
    try {
        await db.query('INSERT INTO playlists (name) VALUES (?)', [name]);
        res.redirect('/playlist');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating playlist');
    }
};

exports.viewPlaylist = async (req, res) => {
    const { id } = req.params;
    try {
        const [playlist] = await db.query('SELECT * FROM playlists WHERE id = ?', [id]);
        const [songs] = await db.query(
            `SELECT tblsongs.* FROM tblsongs 
             JOIN playlist_songs ON tblsongs.id = playlist_songs.song_id 
             WHERE playlist_songs.playlist_id = ?`, [id]
        );

        // Retrieve all songs that can be added
        const [allSongs] = await db.query('SELECT * FROM tblsongs');

        res.render('view_playlist', { playlist: playlist[0], songs, allSongs });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving playlist');
    }
};


// Add a song to a playlist
exports.addSongToPlaylist = async (req, res) => {
    const { id } = req.params;  // Playlist ID
    const { song_id } = req.body;  // Song ID

    try {
        // Add song to the playlist
        await db.query('INSERT INTO playlist_songs (playlist_id, song_id) VALUES (?, ?)', [id, song_id]);
        res.redirect(`/playlist/${id}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding song to playlist');
    }
};
// Delete a song from a playlist
exports.deleteSongFromPlaylist = async (req, res) => {
    const { id } = req.params; // Playlist ID
    const { song_id } = req.body; // Song ID to delete

    try {
        await db.query('DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?', [id, song_id]);
        res.redirect(`/playlist/${id}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting song from playlist');
    }
};
exports.deletePlaylist = async (req, res) => {
    const { id } = req.params; // Get the playlist ID from the route parameters

    try {
        // Execute the delete query
        await db.query('DELETE FROM playlists WHERE id = ?', [id]);
        res.redirect('/playlist'); // Redirect to the playlists page after deletion
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting playlist');
    }
};
