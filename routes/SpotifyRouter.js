const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const songsController = require('../controllers/songsController');
const uploadController = require('../controllers/uploadController');
const playlistController = require('../controllers/playlistController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.get('/', (req, res) => {
    res.redirect('/songs');  
});

router.get('/songs', songsController.getAllSongs);
router.get('/search', songsController.searchSong);
router.get('/play/:id', songsController.playSong);

router.get('/upload', uploadController.showUploadForm);
router.post('/upload', upload.single('song'), uploadController.uploadSong);

router.get('/playlist', playlistController.showPlaylists);
router.post('/playlist/create', playlistController.createPlaylist);
router.get('/playlist/:id', playlistController.viewPlaylist);

router.post('/playlist/:id/add-song', playlistController.addSongToPlaylist);
router.post('/playlist/:id/remove-song', playlistController.deleteSongFromPlaylist);
router.post('/playlist/:id/delete', playlistController.deletePlaylist);
router.post('/delete/:id', songsController.deleteSong);



module.exports = router;
