'use strict';
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
    });
}

module.exports.handler = function(transaction, context, callback) {
  if (isValid(transaction)) {
    store(transaction, callback)
  } else {
    callback(new Error('Mandatory field(s) missing'));
  }

};
