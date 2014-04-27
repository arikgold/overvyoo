
/*
Create overvyoo customer. 
The request should be something like:
	name: "Coca Cola",
	address: "Habarzel 1, Tel Aviv",
	lat: 32.453453,
	lng: 34.434233,
	phone: "054-555007",
	image: "http://www.example.com/statuc/image.png"
Described in http://api.overvyoo.com/apidocs/partner/customers/create.html

*/
exports.createCustomer = function(req, res) {
    var customer = req.body;
	var customerString = JSON.stringify(customer);
	
	console.log('--> overvyoo.createCustomer ' + customer);
	console.log('Adding customer: ' + customerString);
	
	sendCustomerRequest(customer);
	
	/*Iterate json*/
	for(var attributename in customer){
		console.log(attributename+": "+customer[attributename]);
	}
	
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Create Customer '+ JSON.stringify(customer));
};

exports.welcome = function(req, res) {
    console.log('--> overvyoo.welcome');
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Welcome\n');
};

var http = require('http');
var auth_token="9KyM7rAnDJNnV4tJRyfv";
var hmac_secret="BaHYVtokyrFVdJXPxkzL";


function sendCustomerRequest(customer) {
	var timestamp=new Date().toUTCString();
	customer["timestamp"] = timestamp;
	customer["access_token"] = auth_token;
	
	var querystring = require('querystring');
	var customerString = querystring.stringify(customer)
	console.log('TEST: '+ customerString);
	
	/*
	//chop the brackets
	var customerString = customerString.substring(1,customerString.length-1);
	
    var timestamp=new Date().toUTCString();
	customerString+=",\"timestamp\":\""+timestamp+"\"";
	customerString+=",\"\":\""+auth_token+"\"";
	*/

	//Add signature
	var crypto = require('crypto');
	var signature = crypto.createHmac('sha1', hmac_secret).update(customerString).digest('base64');
	
	//customerString+=",\"signature\":\""+signature+"\"";
	customer["signature"] = signature;
  
  // Build the post string from an object
  //var post_data = "{"+customerString+"}";
  var post_data = JSON.stringify(customer)

  // An object of options to indicate where to post to
  // TODO: use consts instead of hard coded
  var post_options = {
      host: 'api.overvyoo.com',
      port: '80',
      path: '/partner_api/customers',
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Content-Length': post_data.length
      }
  };

  // Set up the request
  var post_req = http.request(post_options, function(res) {
	  var body = '';
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
		  body += chunk;
          console.log('Chunk from overvyoo: ' + chunk);
      });
	  res.on('error', function(err) {
        console.log('Received error ' + err);
	});
	res.on('end', function() {
		var status=res.statusCode;	
		console.log('Response from overvyoo: ' + body);
		console.log('Response Status Code: ' + status);
	});
  });

  // post the data
  post_req.write(post_data);
  console.log('Http Request:' + post_req);
  //post_req.end();

}
