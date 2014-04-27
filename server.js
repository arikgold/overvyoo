var express = require('express'),
    overvyoo = require('./overvyoo');
 
var app = express();
/*Workaround the req.body=undefined*/
app.use(express.bodyParser());
 
app.post('/overvyoo/customers/create', overvyoo.createCustomer);
app.post('/overvyoo', overvyoo.welcome);
 
app.listen(3000);
console.log('Listening on port 3000...');