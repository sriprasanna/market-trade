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

  it('it should store the transaction', (done) => {
    let currencies = chance.currency_pair();
    let date = getDateString(new Date(chance.hammertime()));
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

  function getDateString(date) {
    return moment(date).format('DD-MMM-YY hh:mm:ss');
  }
});
