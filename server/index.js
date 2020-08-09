const env = require('dotenv').config({ path: '.env' });
const app = require("express")();
const cors = require("cors");
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 8000;

app.use( cors() );
app.use( bodyParser.json() ); // to support JSON-encoded bodies
app.use( bodyParser.urlencoded({  extended: true }) );  // to support URL-encoded bodies


const server = require('http').createServer(app);
const io = require('socket.io')(server);
const ss = require('socket.io-stream');
const path = require('path');
const fs = require('fs');
const df = require('./service/dialogflowService');
//const df = require('./service/dialogFlowText');          uncomment for dialogFlow text test with response
const LOG_TAG = "Server :: index.js :: "; 

io.on('connection', (client) => {
    console.log("client connected");

    client.on('message', async function(data) {
        const dataURL = data.audio.dataURL.split(',').pop();
        let fileBuffer = Buffer.from(dataURL, 'base64');
        
        // const results = await detectIntent(fileBuffer);
        // client.emit('results', results);    
    });

    ss(client).on('stream', function(stream, data) {
        const filename = path.basename(data.name);
        stream.on('data', (results) => {
            console.log(LOG_TAG, results);
            stream.pipe(fs.createWriteStream(filename));
        });

        stream.on('error', (err) => {
            console.log(LOG_TAG + 'error --------------->', err);
        });
      
        df.detectIntentStreamDialogFlow(stream, function(results){
            console.log("results ==========> ", results);
            client.emit('results', results);
        });
        // detectIntentStream(stream, function(results){
        //     client.emit('results', results);
        // });
    });
});

console.log(env);
console.log("Server ::");

server.listen(PORT);