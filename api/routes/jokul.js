const express = require('express');
const router = express.Router();
const axios = require('axios');
const dokuLib = require('jokul-nodejs-library');

const Jokul = require('../../jokul/core');
const jokul = new Jokul();

router.get('/', (req, res) => {
	res.status(200).json({
    message: 'Run sever',
		'client-id': process.env.JOKUL_CLIENT_ID,
		'secret-key': process.env.JOKUL_SECRET_KEY
	})
});

router.post('/jokul', (req, res, next) => {
  //save details
  let random = jokul.randomData()
  let timeStamp = jokul.timeStamp()
  let requestTarget = '/checkout/v1/payment'
  let clientId = process.env.JOKUL_CLIENT_ID
  let secretKey = process.env.JOKUL_SECRET_KEY
  console.log('Client ID: ', clientId)
  console.log('Secret Key: ', secretKey)
  let url = 'https://api-sandbox.doku.com'+ requestTarget;

  //params body
  const body = JSON.stringify({
    order: {
        amount: req.body.amount,
        invoice_number: "INV-"+random+"-CHECKOUT",
        line_items: [
            {
                name: "INV-"+random+"-CHECKOUT",
                price: req.body.amount,
                quantity: 1
            }
        ],
        currency: "IDR",
        callback_url: "https://doku.com/",

    },
    payment: {
        payment_due_date: 60
    },
    customer: {
        id: "CUST-0001",
        name: "Agiel Nugraha",
        email: "email@testing.com"
    }
  });

  let digest = jokul.digest(body);

  let signature = jokul.signature(clientId, secretKey, random, timeStamp, requestTarget, digest)

  axios.post(url, body, {
    headers: {
      'Content-Type': 'application/json',
      'Client-Id': clientId,
      'Request-Id': random,
      'Request-Timestamp': timeStamp,
      'Signature': signature
    }
  }).then(response => {
      console.log(response.data)
      res.status(200).json({
        payment: response.data.response.payment.url
      })
  }).catch(error => {
      console.log(error.response)
  });
});

router.post('/notify', async (req, res, next) => {
  const rowHeader = req.headers;
  const requestBody = req.body;
  const requestTarget = '/jokul/notify';

  console.log('===Notification===');
  console.log('rowHeader: ', rowHeader);
  console.log('requestBody: ', requestBody);

  // const signature = await dokuLib.getSignature(
  //   rowHeader,
  //   requestBody,
  //   'SK-9RmEkLm4B24yonDMHWcu'
  // );

  const signature = jokul.signature(
    rowHeader["client-id"],
    process.env.JOKUL_SECRET_KEY,
    requestBody["request-id"],
    rowHeader["request-timestamp"],
    requestTarget
  )

  console.log('Signature: ', signature);
  console.log('Signature header notif: ', rowHeader.signature);

  if (signature === rowHeader.signature) {
    if (requestBody.transaction.status === "SUCCESS") {
      console.log("success");
    }
    res.status(200).json({
      header: req.headers,
      body: req.body
    })
  }else {
    res.status(400);
  }
});

module.exports = router
