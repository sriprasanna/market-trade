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
Message processor is built on top [Serverless] framework. API endpoint is built using AWS API Gateway, which triggers a AWS Lambda function when a HTTP POST request is sent. Lambda function validates and persists the posted transaction, and pushes transaction to an AWS SQS Queue.


![alt Message Processor Architecture](https://raw.githubusercontent.com/sriprasanna/market-trade/master/message-processor.png)

[Serverless]: <http://serverless.com/>
