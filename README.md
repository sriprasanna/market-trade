# Market Trade

Currency trade transactions are sent to an endpoint in the following format:

```json
{
  "userId": "134256",
  "currencyFrom": "EUR",
  "currencyTo": "GBP",
  "amountSell": 1000,
  "amountBuy": 747.1,
  "rate": 0.7471,
  "timePlaced": "24-JAN-15 10:27:44",
  "originatingCountry": "FR"
}
```

## Architectural components
  - Message Processor
  - Dashboard

### Message Processor
The Message processor is built using [Serverless] framework. The API endpoint is built using AWS API Gateway, which triggers a AWS Lambda function when a HTTP POST request is sent. The Lambda function validates and persists the posted transaction in DynamoDB, and pushes the transaction to an AWS SQS Queue.

**Why DynamoDB?**
 - Fast and predictable performance
 - Very easy to scale
 - Support for easy integration with Elasticsearch, AWS EMR, Apache Spark and etc,.

![alt Message Processor Architecture](https://raw.githubusercontent.com/sriprasanna/market-trade/master/message-processor.png)

### Dashboard
The Dashboard is built using [ExpressJS].
#### Server
It runs on t2.micro EC2 instance and listens to the AWS SQS Transactions Queue. When received a message through the queue, the transaction is pushed to the browser via [Socket.io].
#### Browser
Upon receiving a transaction through websocket, the transaction is displayed on a table in the reverse chronological order and a [GeoChart] is rendered showing the countries and the corresponding transaction count.
![alt Dashboard Architecture](https://raw.githubusercontent.com/sriprasanna/market-trade/master/dashboard.png)


[Serverless]: <http://serverless.com/>
[ExpressJS]: <https://expressjs.com/>
[Socket.io]: <http://socket.io/>
[GeoChart]: <https://developers.google.com/chart/interactive/docs/gallery/geochart#region-geocharts>
