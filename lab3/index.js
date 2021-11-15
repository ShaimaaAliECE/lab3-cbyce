const express = require('express');

const app = express();

// serve static contents
app.use(express.static('static'));

// dynamic handling
app.get('/guest', (req, res) => {

});

app.get('/login', (req, res) => {
    res.send('<div>Hello</div>');
});

//app.listen(2000);