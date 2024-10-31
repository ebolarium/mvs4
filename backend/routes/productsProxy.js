// productsProxy.js
const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const querystring = require('querystring'); // Import querystring module

// /api/products endpoint
router.get('/products', async (req, res) => {
  try {
    const body = querystring.stringify({
      vendor_id: '24248', // Replace with your actual vendor_id
      vendor_auth_code: '0ca5518f6c92283bb2600c0e9e2a967376935e0566a4676a19', // Replace with your actual vendor_auth_code
    });

    const response = await fetch('https://sandbox-vendors.paddle.com/api/2.0/product/get_products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded', // Correct Content-Type
      },
      body: body, // URL-encoded body
    });

    const data = await response.json();

    if (!data.success) {
      console.error('Paddle API returned an error:', data.error);
      return res.status(500).json({ error: data.error });
    }

    const products = data.response.products;

    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.base_price, // Ensure this is in the correct format
      currency: product.currency,
      // Include any additional fields you need
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products from Paddle API:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
