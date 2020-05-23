const functions = require('firebase-functions');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
var bodyParser = require('body-parser')

const {
    buildTokensInfo,
    generateTokens,
    parseToDataObject,
    reomveUnnecessaryTokens
} = require('./helper')

const app = express();
var jsonParser = bodyParser.json()

app.use(cors({ origin: true }));


app.post('/analysis/lexical', jsonParser, (req, res) => {
    
    var buffer = new Buffer(req.body.htmlFile,'base64')

    var data = parseToDataObject({
        content: buffer.toString('utf-8')
    })
    
    generateTokens(data)
    buildTokensInfo(data)

    return res.jsonp({tokens : reomveUnnecessaryTokens(data.tokens)})
});


exports.api = functions.https.onRequest(app);