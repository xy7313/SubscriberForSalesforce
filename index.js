
const express = require('express')
const app = express()
const a = require('./app')
let subscriptionEmitter=a.subscriptionEmitter;

//console.log("Sales_Order_Event__e:",subscriptionEmitter);

app.get('/', function (req, res) {
    subscriptionEmitter.once('Sales_Order_Event__e', (message) => {
        console.log(message);
        res.send(message);
    })
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

// Log errors and blow up
subscriptionEmitter.on('error', (err)=>{
    console.log('call back err: ', err);
})

