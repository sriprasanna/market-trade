'use strict';
const AWS = require('aws-sdk');
let sqs;

if (process.env.DEVELOPMENT) {
  sqs = new AWS.SQS({
    region : process.env.SERVERLESS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  });
} else {
  sqs = new AWS.SQS();
}

const dynamo = require('../../lib/dynamo');
const createTransaction = dynamo.createTransaction;
const mandatoryFields = dynamo.mandatoryFields;

function isValid(transaction) {
  let valid = true;
  mandatoryFields.forEach((field) => {
    if (!transaction[field]) {
      valid = false;
    }
  });
  return valid;
}

function store(transaction, callback) {
  createTransaction(transaction)
    .then((transaction) => {
      callback(null, transaction);
      let params = {
        MessageBody: JSON.stringify(transaction),
        QueueUrl:  process.env.QUEUE_URL
      };
      sqs.sendMessage(params, (error, data) => {});
    });
}

module.exports.handler = function(transaction, context, callback) {
  if (isValid(transaction)) {
    store(transaction, callback)
  } else {
    callback(new Error('Mandatory field(s) missing'));
  }

};
