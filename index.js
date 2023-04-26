const cors = require("cors");
const express = require('express')
const request = require('request');
const { apiAccessClientAddresses } = require("./config/config");
const app = express() 

app.use(cors({
  origin: apiAccessClientAddresses,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
}));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Create or Update an item
app.post('/create-tickets', async (req, res) => {
    const {subject, description,externalId,email,displayName} = req.body; 
  var options = {
    'method': 'POST',
    'url': 'https://private6694.zendesk.com/api/v2/tickets',
    'headers': {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Basic dGFsc2hhbmk3ODlAZ21haWwuY29tL3Rva2VuOnI2VUtmMEg4a25UcXBHbFUyUXhKRmo4akM5TGFvcDNsTXZzSmFjUnM=', 
    },
    body: JSON.stringify({
      "ticket": {
        "status": "open",
        "custom_status_id": externalId,
        "recipient": email,
        "description": description,
        "subject": subject,
        "type": "incident",
        "external_id": externalId,
        "requester_id": externalId,
        "requester": {   "name": displayName, "email": email }
      }
    })
  };
  request(options, function (error, response) {
    if (error) {
        return res.status(500).json({'message': 'no data found'})
    }; 
    result = response.body
    return res.status(200).json({message: 'Ticket has been submitted'})
  }); 
   
   
})

 
// Get a single item
app.get('/get-tickets', async (req, res) => {
   const externalId = req.query.externalId
     if(!externalId){
        return res.status(404).json({'message': 'something is missing'})
    }
 var options = {
    'method': 'GET',
    'url': 'https://private6694.zendesk.com/api/v2/search?query=external_id:'+externalId,
    'headers': {
      'Accept': 'application/json',
      'Authorization': 'Basic dGFsc2hhbmk3ODlAZ21haWwuY29tL3Rva2VuOnI2VUtmMEg4a25UcXBHbFUyUXhKRmo4akM5TGFvcDNsTXZzSmFjUnM=',
    }
  };
  let result = null;
  request(options, function (error, response) {
    res.set({
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    if (error) {
        return res.status(500).json({'message': 'no data found'})
    }; 
    result = JSON.parse(response.body)
    if(result?.results?.length){
      const resultArray = result?.results.map(result => {
        return { subject: result.subject, description: result.description }
      })
      result.results =  resultArray ;
    }
      res.status(200).json({ data: result }).end(); 
  }); 
 
})

// Catch all handler for all other request.
app.use('*', (req, res) => {
  res.json({ msg: 'no route handler found' })
})

// Start the server
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`index.js listening on ${port}`)
})
