# Trainyard

A bidirectional task queue built on amqp

## Examples

```js
const { Trainyard, Railcar } = require("trainyard");

const trainyard = new Trainyard("amqp://justin:password@localhost");

(async function () {
  await trainyard.connect();
  console.log("Connected to Trainyard");

  let data = {
    status: 200,
    message: "Hello World",
  };

  let payload = new Railcar()
    .setData(data)
    .setFormat(Railcar.formats.OBJECT)
    .setDestination("world");

  await trainyard.send(payload);
})();
```

```js
const { Trainyard, Railcar } = require("trainyard");

const trainyard = new Trainyard("amqp://justin:password@localhost");

trainyard.connect().then(() => {
  console.log("Connected to Trainyard");

  trainyard.alight("world", async (message) => {
    let payload = new Railcar()
      .setData("Hello World")
      .setFormat(Railcar.formats.STRING)
      .setSecret(message.getSecret())
      .setDestination("earth");

    trainyard.send(payload);
  });
});
```
