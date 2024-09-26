const db = require('../config/db');
const multer = require('multer');
const path = require('path');

const getAlbumArt = async (songTitle, artistName) => {
    const fetch = await import('node-fetch'); 
    //eto po ay pangkuha ng image for example ang title ng song name is salamin salamin, then it will search po about that song and fetch that url thru the help of this api
    const response = await fetch.default(`https://itunes.apple.com/search?term=${encodeURIComponent(artistName + ' ' + songTitle)}&entity=song&limit=1`);
    const data = await response.json();
    return data.results[0]?.artworkUrl100 || '/path/to/default_album_art.jpg';
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

exports.getAllSongs = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM tblsongs');
        res.render('songs', { songs: rows });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.searchSong = async (req, res) => {
    const { query } = req.query;
    try {
        const [rows] = await db.query('SELECT * FROM tblsongs WHERE title LIKE ? OR artist LIKE ?', [`%${query}%`, `%${query}%`]);
        res.render('songs', { songs: rows });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};


exports.playSong = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM tblsongs WHERE id = ?', [id]);
        if (rows.length > 0) {
            const song = rows[0];
            const albumArtUrl = await getAlbumArt(song.title, song.artist);

             const [previousSong] = await db.query('SELECT id FROM tblsongs WHERE id < ? ORDER BY id DESC LIMIT 1', [id]);
             const [nextSong] = await db.query('SELECT id FROM tblsongs WHERE id > ? ORDER BY id ASC LIMIT 1', [id]);
 
             const previousSongId = previousSong[0] ? previousSong[0].id : song.id; 
             const nextSongId = nextSong[0] ? nextSong[0].id : song.id;
 
             res.render('player', { 
                 song, 
                 previousSongId, 
                 nextSongId,
                 albumArtUrl: albumArtUrl
             });

        } else {
            res.status(404).send('Song Not Found');
        }
        console.log(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.renderUploadPage = (req, res) => {
    res.render('upload');
};

exports.uploadSong = [
    upload.single('song'),
    async (req, res) => {
        const { title, artist, album } = req.body;
        const songUrl = `/uploads/${req.file.filename}`;

        try {
            const [result] = await db.query('INSERT INTO tblsongs (title, artist, album, song_url) VALUES (?, ?, ?, ?)', [title, artist, album, songUrl]);
            res.redirect('/songs'); 
        } catch (error) {
            console.error(error);
            res.status(500).send('Error uploading song');
        }
    }
];

exports.deleteSong = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM tblsongs WHERE id = ?', [id]);
        if (result.affectedRows > 0) {
            res.redirect('/songs'); // Redirect to songs list after deletion
        } else {
            res.status(404).send('Song Not Found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

