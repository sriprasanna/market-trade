"use strict";
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
require('dotenv').config();
const AWS = require('aws-sdk');

const Consumer = require('sqs-consumer');

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});


const queue = Consumer.create({
  queueUrl: process.env.QUEUE_URL,
  handleMessage: (message, done) => {
    let transaction = JSON.parse(message.Body);
    io.emit('transaction', transaction);
    done();
  }
});

queue.on('error', (error) => {
  console.log(error.message);
});

queue.start();

app.get('/', (req, res) => {
  res.sendfile('index.html');
});

const port = process.env.PORT;
http.listen(port, () => {
  console.log(`listening on *:${port}`);
});
