const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// productsProxy.js
router.get('/products', async (req, res) => {
    try {
      const response = await fetch('https://sandbox-api.paddle.com/prices', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 0ca5518f6c92283bb2600c0e9e2a967376935e0566a4676a19',
          'Vendor-Id': '24248',
        },
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch products from Paddle API:', errorText);
        return res.status(response.status).send('Failed to fetch products from Paddle API');
      }
  
      const data = await response.json();
      res.json(data.data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.unit_price.amount,
        currency: item.unit_price.currency_code,
        interval: item.billing_cycle.interval,
        frequency: item.billing_cycle.frequency,
      })));
    } catch (error) {
      console.error('Error fetching products from Paddle API:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  module.exports = router;
