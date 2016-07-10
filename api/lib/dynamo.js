'use strict';

const dynamodb    = require('serverless-dynamodb-client');
const DB          = dynamodb.doc;
const Promise     = require('bluebird');
const uuid        = require('node-uuid');
const moment      = require('moment');

const TableName = 'TradeTransactions';
const AttributesToGet = [
                          'id',
                          'userId',
                          'currencyFrom',
                          'currencyTo',
                          'amountSell',
                          'amountBuy',
                          'rate',
                          'timePlaced',
                          'originatingCountry'
                        ];

class Dynamo {
  createTransaction(transaction) {
    const id = uuid.v4();
    transaction.id = id;
    transaction.timePlaced = moment(transaction.timePlaced, 'DD-MMM-YY hh:mm:ss')
                                .toDate()
                                .toISOString();
    return new Promise((resolve, reject) => {
      let params = {
        TableName: TableName,
        Item: transaction
      };
      DB.put(params, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve({ id });
        }
      });
    });
  }

  getTransaction(id) {
    return new Promise((resolve, reject) => {
      let params = {
        TableName: TableName,
        Key: { id },
        AttributesToGet: AttributesToGet
      };
      DB.get(params, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data.Item);
        }
      });
    });
  }
}

module.exports = new Dynamo();
