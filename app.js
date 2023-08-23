const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { Client } = require('ssh2');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Global Variables
HOSTNAME="100.26.97.148"
PORT=22
USERNAME="ubuntu"
PRIVATE_PATH="/home/popeye/Documents/ssh/topps sandbox/Hamza.pem"

wss.on('connection', ws => {
    const ssh = new Client();
    ssh.on('ready', () => {
        ssh.shell({ term: 'xterm' }, (err, stream) => {
            if (err) throw err;
            
            // Handle user input from the terminal
            ws.on('message', data => {
                stream.write(data);
            });

            // Pipe SSH output to WebSocket
            stream.on('data', data => {
                ws.send(data.toString());
            });

            stream.on('close', () => {
                ws.send('Connection closed.');
                ws.close();
            });
        });
    });


    ssh.connect({
        host: HOSTNAME,
        port: PORT,
        username: USERNAME,
        privateKey: require('fs').readFileSync(PRIVATE_PATH)
    });
});

server.listen(8000, () => {
    console.log('Server is listening on port 8000');
});
