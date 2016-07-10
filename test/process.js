'use strict';

process.env.IS_OFFLINE = true; // To use local DynamoDB instance
const mod         = require('../api/trade/process/handler.js');
const mochaPlugin = require('serverless-mocha-plugin');
const wrapper     = mochaPlugin.lambdaWrapper;
const expect      = mochaPlugin.chai.expect;
const Chance      = require('chance');
const chance      = new Chance();
const _           = require('lodash');
const dynamo      = require('../api/lib/dynamo');
const moment      = require('moment');


const liveFunction = {
  region: process.env.SERVERLESS_REGION,
  lambdaFunction: process.env.SERVERLESS_PROJECT + '-process'
}

describe('process', () => {
  before(function () {
    wrapper.init(mod);
  });

  it('should store a transaction', (done) => {
    let date = getDateString(new Date(chance.hammertime()));
    let transaction = getTransactionSeed(date);
    wrapper.run(transaction, (error, response) => {
      dynamo.getTransaction(response.id)
        .then((persistedTransaction) => {
          expect(persistedTransaction.id).to.equal(response.id);
          expect(persistedTransaction.userId).to.equal(transaction.userId);
          expect(persistedTransaction.currencyFrom).to.equal(transaction.currencyFrom);
          expect(persistedTransaction.currencyTo).to.equal(transaction.currencyTo);
          expect(persistedTransaction.amountSell).to.equal(transaction.amountSell);
          expect(persistedTransaction.amountBuy).to.equal(transaction.amountBuy);
          expect(persistedTransaction.rate).to.equal(transaction.rate);
          expect(persistedTransaction.originatingCountry).to.equal(transaction.originatingCountry);
          expect(getDateString(persistedTransaction.timePlaced)).to.equal(date);
        })
        .then(done);
    });
  });

  it('should not store a transaction when all the mandatory fields are missing', (done) => {
    let transaction = getTransactionSeed();
    let fieldToDelete = chance.pick(_.keys(transaction));
    _.unset(transaction, fieldToDelete);
    wrapper.run(transaction, (error, response) => {
      expect(error instanceof Error).to.equal(true);
      expect(error.message).to.equal('Mandatory field(s) missing');
      done();
    });
  });

  function getTransactionSeed(date) {
    let currencies = chance.currency_pair();
    date = date || getDateString(new Date(chance.hammertime()));
    let transaction = {
      'userId': chance.natural().toString(),
      'currencyFrom': _.first(currencies).code,
      'currencyTo': _.last(currencies).code,
      'amountSell': chance.natural(),
      'amountBuy': chance.natural(),
      'rate': chance.natural(),
      'timePlaced': date,
      'originatingCountry': chance.country()
    };
    return transaction;
  }

  function getDateString(date) {
    return moment(date).format('DD-MMM-YY hh:mm:ss');
  }
});
