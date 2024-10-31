// productsProxy.js

const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const querystring = require('querystring');

router.get('/products', async (req, res) => {
  try {
    const params = {
      vendor_id: '24248', // Kendi Vendor ID'nizi buraya yazın
      vendor_auth_code: 'SENİN_VENDOR_AUTH_CODE', // Kendi Vendor Auth Code'unuzu buraya yazın
    };

    const response = await fetch('https://sandbox-vendors.paddle.com/api/2.0/subscription/plans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: querystring.stringify(params),
    });

    const data = await response.json();

    if (data.success) {
      // Planları konsola yazdır
      console.log('Fetched Plans:', data.response);

      const products = data.response.map((plan) => {
        return {
          id: plan.product_id, // Ürün ID'si (pro_... şeklinde)
          name: plan.name,
          description: plan.description || '',
          price: plan.recurring_price.usd, // Fiyat bilgisini al
          currency: 'USD',
          price_id: plan.prices && plan.prices.length > 0 ? plan.prices[0].price_id : null, // Fiyat ID'si (pri_... şeklinde)
        };
      });

      res.json(products);
    } else {
      console.error('Failed to fetch plans:', data.error);
      res.status(500).json({ error: 'Failed to fetch plans' });
    }
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
