const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// productsProxy.js
router.get('/products', async (req, res) => {
    try {
      const response = await fetch('https://sandbox-api.paddle.com/prices', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 0ca5518f6c92283bb2600c0e9e2a967376935e0566a4676a19', // Özel token bilgisi
          'Vendor-Id': '24248'
        }
      });
  
      if (!response.ok) {
        return res.status(response.status).send('Failed to fetch products from Paddle API');
      }
  
      const data = await response.json();
      const products = data.data.map(item => ({
        id: item.data.id,
        name: item.data.name,
        description: item.data.description,
        price: item.data.unit_price.amount,
        currency: item.data.unit_price.currency_code,
        interval: item.data.billing_cycle.interval,
        frequency: item.data.billing_cycle.frequency
      }));
  
      res.json(products);
    } catch (error) {
      console.error('Error fetching products from Paddle API:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  