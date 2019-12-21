const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;
require('dotenv').config()


app.get('/', (req, res) => {
    res.send("<h1>HEALTHY!</h1>")
});

app.listen(PORT, () => {
    console.log(`Brace server is listening on port ${PORT}!`)
})




