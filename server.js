/**
The server framework. 
Listens for requests
Using express
*/

//The web server framework
var express = require('express');

//The overvyoo partner APIs
var overvyoo = require('./overvyoo');
 
var app = express();
var port=3000;

/*Workaround the req.body=undefined*/
app.use(express.bodyParser());

//Publish the API
app.post('/overvyoo/customers/create', overvyoo.createCustomer);

//Listen to requests
app.listen(port);
console.log('Listening on port '+port+'...');