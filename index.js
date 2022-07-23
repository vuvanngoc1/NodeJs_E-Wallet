const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const Router = require('./src/routes');
const mongoose = require('mongoose');
const session = require('express-session');
const favicon = require('serve-favicon');

app.use(session({
    resave: true, 
    saveUninitialized: true, 
    secret: 'somesecret', 
    cookie: { maxAge: 60000 }}));

mongoose.connect('mongodb://localhost/finallProject')
.then(()=>{
    app.use(bodyParser.urlencoded({ extended: false,parameterLimit:100000,limit:"500mb"}));
    app.use(bodyParser.json({parameterLimit:100000,limit:"500mb"}));

    app.use(express.static(path.join(__dirname, '/public')));
    app.use(favicon(path.join(__dirname, '/public','favicon.ico')));
    app.set("views",path.join(__dirname,'src/views'));
    app.set('view engine', 'ejs');

    Router(app);

    const port = process.env.PORT || 8080;
    app.listen(port,()=>console.log('listening on port: http://localhost:'+port));
})
.catch(e=>{
    console.error(e)
})

