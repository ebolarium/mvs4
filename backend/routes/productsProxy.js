// productsProxy.js

const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// /api/products endpoint'i
router.get('/products', async (req, res) => {
  try {
    const response = await fetch('https://vendors.paddle.com/api/2.0/prices', { // Endpoint'i düzelttik
      method: 'POST', // Paddle prices endpoint'i POST olarak çalışır
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vendor_id: process.env.PADDLE_VENDOR_ID,
        auth_code: process.env.PADDLE_AUTH_CODE,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch products from Paddle API:', errorText);
      return res.status(response.status).send('Failed to fetch products from Paddle API');
    }

    const data = await response.json();
    console.log('Fetched products from Paddle API:', data);
    
    const formattedProducts = data.response.products.map(item => ({
      id: parseInt(item.id, 10), // Price ID (integer olmalı)
      name: item.name,
      description: item.description,
      price: item.unit_price.amount,
      currency: item.unit_price.currency_code,
      interval: item.billing_cycle.interval,
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products from Paddle API:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
