const express = require('express');
require('dotenv').config();

const app = express();



// Middleware for parsing JSON data
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});


