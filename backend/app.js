const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const port=process.env.PORT || 5000;

const db=require('./connection');
db();


app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended:true}))

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})

