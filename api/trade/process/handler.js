'use strict';
const dynamo = require('../../lib/dynamo');
const createTransaction = dynamo.createTransaction;

module.exports.handler = function(transaction, context, callback) {
  createTransaction(transaction)
    .then((transaction) => {
      callback(null, transaction);
    });
};
