// productsProxy.js
const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// Ürünleri çekmek için mevcut route
router.get('/products', async (req, res) => {
  try {
    const response = await fetch('https://sandbox-api.paddle.com/products', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 0ca5518f6c92283bb2600c0e9e2a967376935e0566a4676a19',
        'Vendor-Id': '24248'
      }
    });

    if (!response.ok) {
      return res.status(response.status).send('Failed to fetch products from Paddle API');
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching products from Paddle API:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Ürün fiyatlarını çekmek için yeni route
router.get('/products/:productId/prices', async (req, res) => {
  const { productId } = req.params;

  try {
    const response = await fetch(`https://sandbox-api.paddle.com/products/${productId}/prices`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 0ca5518f6c92283bb2600c0e9e2a967376935e0566a4676a19',
        'Vendor-Id': '24248'
      }
    });

    if (!response.ok) {
      return res.status(response.status).send('Failed to fetch product prices from Paddle API');
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching product prices from Paddle API:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
