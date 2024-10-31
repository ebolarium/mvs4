const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();
const querystring = require('querystring');

router.get('/products', async (req, res) => {
  try {
    const params = {
      vendor_id: '24248',
      vendor_auth_code: '0ca5518f6c92283bb2600c0e9e2a967376935e0566a4676a19', // Kendi vendor_auth_code'unuzu ekleyin
    };

    const response = await fetch('https://sandbox-vendors.paddle.com/api/2.0/product/get_products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: querystring.stringify(params),
    });

    const data = await response.json();

    if (!data.success) {
      console.error('Failed to fetch products:', data.error);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }

    res.json(
      data.response.products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.base_price, // veya uygun fiyat alanı
        currency: product.currency,
        interval: product.billing_type, // Ödeme sıklığı (aylık/yıllık vb.)
      }))
    );
  } catch (error) {
    console.error('Error fetching products from Paddle API:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
