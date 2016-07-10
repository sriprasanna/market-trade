'use strict';

const dynamodb    = require('serverless-dynamodb-client');
const DB          = dynamodb.doc;
const Promise     = require('bluebird');
const uuid        = require('node-uuid');
const moment      = require('moment');

const mandatoryFields = [
                          'userId',
                          'currencyFrom',
                          'currencyTo',
                          'amountSell',
                          'amountBuy',
                          'rate',
                          'timePlaced',
                          'originatingCountry'
                        ];
const TableName = 'TradeTransactions';
const AttributesToGet = mandatoryFields.concat(['id']);

class Dynamo {
  constructor() {
    this.mandatoryFields = mandatoryFields;
  }

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
