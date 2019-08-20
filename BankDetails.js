const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const convert = require('number-to-words')
const jwt = require('jsonwebtoken')
const Pool = require('pg')
const fs = require('fs')
const app = express();


const pool = new Pool.Pool({
  user: 'toqaqhmiwfeifg',
  host: 'ec2-54-83-201-84.compute-1.amazonaws.com',
  database: 'dbsbfsbvhp1epd',
  password: 'be3fa3aaef4dac208c3f10ea6b06aea938b1e9cc8084a024d93f0bf4e1b5188d',
  port: 5432,
});

app.use(bodyParser.json());

var server = app.listen(process.env.PORT || 3020, () => console.log('Listening at port %s',server.address().port ));


function isAuthenticated(req, res, next) {
    if (typeof req.headers.authorization != "undefined") 
    {
        var token = req.headers.authorization.split(" ")[1];
        var privateKey = fs.readFileSync('./key.pem', 'utf8');
        jwt.verify(token, privateKey, { algorithm: "HS256",expiresIn: "5d" }, (err, user) => {
            if (err) {  
                res.status(40).json({ error: "Not Authorized" });
            }
            return next();
        });
    } 
    else 
    {
        res.status(401).json({"Error": "Not Authorized" });
    }
}


app.post('/login', (req, res) => {

	//console.log("Login " + JSON.stringify(req.body));
	var usr = req.body.username;
	var pwd = req.body.password;
	if(usr == null || pwd == null)
	{
		res.status(400);
		res.json({"Error" : "Request body missing required property: Username/Password!!"});	
	}
	else if(pwd.toString() === "getDetails@123" && usr.toString() === "sandhi")
	{
		var privateKey = fs.readFileSync('./key.pem', 'utf8');
    	var token = jwt.sign(req.body, privateKey, { algorithm: 'HS256'});
    	res.status(200);
    	res.json({"username" : "sandhi","token" : token});
    	//res.send(token);
	}
	else
	{
		res.status(400);
		res.json({"Error" : "Incorrect Username/Password"});
	}
});

app.get('/getBankDetails',isAuthenticated,(req, res) => {

	console.log("IFSC CODE: "+req.query.ifsc);
	console.log("Limit: "+req.query.limit);
	var ifsc = req.query.ifsc;
	var limit = req.query.limit;
	var offset = req.query.offset;
	if(ifsc == null)
	{
		res.status(400).json({"Error": "IFSC Code cannot be blank!!"});		
	}
	else if(ifsc.toString() == "")
	{
		res.status(400).json({"Error": "IFSC Code cannot be blank!!"});		
	}
	else
	{
		pool.query('SELECT * FROM branches where ifsc=$1 LIMIT $2 OFFSET $3', [ifsc,limit,offset], (error, results) => {
    		if (error) 
    		{
      			res.status(500).json({"Error":error});
    		}
    		else
			{
				res.status(200).json(results.rows);
			}
		});
	}
	

});

app.get('/getBranches',isAuthenticated,(req, res) => {

	console.log("Bank Name: "+req.query.name);
	console.log("City: "+req.query.city);
	var bank = req.query.name;
	var city = req.query.city;
	var limit = req.query.limit;
	var offset = req.query.offset;
	if(bank == null || city == null)
	{
		res.status(400).json({"Error": "Bank name or city name cannot be blank!!"});
	}

	else if(bank.toString() == "" || city.toString() == "")
	{
		res.status(400).json({"Error": "Bank name or city name cannot be blank!!"});		
	}
	else
	{
		pool.query('SELECT * FROM branches where bank_name=$1 and city=$2 LIMIT $3 OFFSET $4', [bank,city,limit,offset], (error, results) => {
    		if (error) 
    		{
      			res.status(500).json({"Error":error});
    		}
    		else
			{	
				res.status(200).json(results.rows);
			}
		});
	}
	

});
