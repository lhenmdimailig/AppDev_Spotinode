const express = require('express');
const path = require('path');
const SpotifyRouter = require('../routes/SpotifyRouter'); // Adjusted path

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs'); 
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(express.urlencoded({ extended: true })); 
app.use(express.json());

app.use('/', SpotifyRouter);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});



