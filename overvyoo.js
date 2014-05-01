/*
	Overvyoo Partner APIs
*/

//Dependencies
var http = require('http');
var request = require('request');
var FormData = require('form-data');
var querystring = require('querystring');


/**
*	The request should be something like:
*		name: "Coca Cola",
*		address: "Habarzel 1, Tel Aviv",
*		lat: 32.453453,
*		lng: 34.434233,
*		phone: "054-555007",
*		image: "http://www.example.com/statuc/image.png"
*	Described in http://api.overvyoo.com/apidocs/partner/customers/create.html
*/
exports.createCustomer = function(req, createCustomerResponse) {
	//Extract the customer from the request body
    var customer = req.body;
	
	//Call the actual function which makes the logic. pass the response from the caller
	var response = createOvervyooCustomer(customer,createCustomerResponse);
};

/**
* Creates a customer in overvyoo
* 1. Verifies input validity - valid fields
* 2. Signs the data 
* 3. Sends the request to overvyoo
* 
*/
function createOvervyooCustomer(customer,createCustomerResponse)
{
	//Check if the request is valid
	var errorMessage=[];
	if (!isValidCustomer(customer,errorMessage))
	{
		//Bad request
		sendError(createCustomerResponse,400,errorMessage);
		return;
	}
	
	//Sign the request
	signOvervyooRequest(customer);
	
	//Add the data to the form
	var form = new FormData();
	for(var attributename in customer){
		console.log("Adding to form: " +attributename+"="+customer[attributename]);
		form.append(attributename,customer[attributename]);
	}

	//Send the request. Pass the response from the original customer to the callback
	var r = request.post('http://api.overvyoo.com/partner_api/customers', function(err, res, body) {
		createCustomerCallBack(err,res,body,createCustomerResponse);
	});
	
	r._form = form;     

}

//The fields of overvyoo customers
var customerFields=["name","address","lat","lng","phone","image"];
/**
Checks if customer is a valid overvyoo customer
returns true if and only if customer is a valid customer
if customer is invalid - errorMessage is filled with the relevant data
*/
function isValidCustomer(customer,errorMessage)
{
	//Verify that customer is not null
	if (!customer)
	{
		errorMessage["error"] = 'empty customer';
		return false;
	}
	
	//Verify that all field names are valid
	for(var attributename in customer){
		if (customerFields.indexOf(attributename)==-1) {
			errorMessage["error"]='Invalid field: '+ attributename;
			return false;
		}
		return true;
	}

}


//Authentication Data for overview
var overvyooAccessToken="9KyM7rAnDJNnV4tJRyfv";
var overvyooHmacSecret="BaHYVtokyrFVdJXPxkzL";
var signatureAlgorithm='sha1';
var signatureEncoding='hex';
/**
* Signs request for overvyoo
* 1. Adds timestamp access_token then creates hmac signature
*/
function signOvervyooRequest(requestData)
{

	//Add timestamp and access_token to the object
	var timestamp=new Date().getTime();
	requestData["timestamp"] = timestamp;
	requestData["access_token"] = overvyooAccessToken;
	
	var requestDataString = encodeObject(requestData);
	console.log('Creating signature for:'+ requestDataString);
	
	//Create signature and add it to the object
	var crypto = require('crypto');
	var signature = crypto.createHmac(signatureAlgorithm, overvyooHmacSecret).update(requestDataString).digest(signatureEncoding);
	
	requestData["signature"] = signature;
}

/**
* Encodes object into a valid GET format.
* obj - The object to encode
* returns - GET formatted String represntation of the object
*/
function encodeObject(obj) {
	var str = [];

	//Creaye name=value elements
	for(var attribute in obj)
	{
		str.push(encodeURIComponent(attribute) + "=" + encodeURIComponent(obj[attribute]));
	}

	//Join the elements with '&' in between
	var encodedStringWithSpaces=str.join("&");

	//Replace spaces with pluses
	var encodedStringWithPluses=encodedStringWithSpaces.replace(/%20/g, "+");

	return encodedStringWithPluses;
}

/**
The callback of the overvyoo create customer API
err - The error from overvyoo
res - The http response from overvyoo
body - The http response body from overvyoo
createCustomerResponse - The response to return for my caller
*/
function createCustomerCallBack(err, res, body,createCustomerResponse) {
	//Success
	if (!err && res && res.statusCode==200)
	{
		console.log("Response Body:" + body);
		createCustomerResponse.send(body);
	}
	//Invalid status code or err
	else {
		var responseErrorMessage = 'Error updating customer';
		if (err) {
			responseErrorMessage+= ': '+err;
		}
		var errprMessage=[];
		errorMessage["error"] = responseErrorMessage;
		
		//Internal Error
		sendError(createCustomerResponse,500,errorMessage);
	}
}

/**
* Sends error message
* statusCode - The error status code
* errorMessage - Array. errorMessage["error"] contains the error message
* createCustomerResponse - The response to return
*/
function sendError(createCustomerResponse,statusCode,errorMessage)
{
	//Log message
	console.log('sending error: '+errorMessage+' ['+statusCode+']');
	
	//Add data to the response and send it
	createCustomerResponse.statusCode=statusCode;
	createCustomerResponse.send({'error': errorMessage["error"]});
	
}

