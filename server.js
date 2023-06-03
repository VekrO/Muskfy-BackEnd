require('dotenv').config();
const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const cors = require('cors');
const routes = require('./routes');

app.use(cors({
    origin: 'http://localhost:4200'
}));

app.use(bodyparser.json());
app.use(routes);

app.listen(3000, ()=>{
    console.log('SERVIDOR RODANDO: ', 3000);
});