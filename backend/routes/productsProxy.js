// routes/productsProxy.js

const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// Paddle API Credentials (Hardcoded for demo purposes)
const PADDLE_AUTH_TOKEN = '0ca5518f6c92283bb2600c0e9e2a967376935e0566a4676a19'; // Replace with your actual token
const PADDLE_VENDOR_ID = '24248'; // Replace with your actual Vendor ID

// /api/products endpoint'i için GET isteğini işliyoruz
router.get('/', async (req, res) => {
  try {
    console.log('Fetching products from Paddle API...');

    const response = await fetch('https://sandbox-api.paddle.com/api/2.0/pricing/list', {
      method: 'POST', // POST methodu kullanılıyor
      headers: {
        'Content-Type': 'application/json',
        'Paddle-Auth-Token': PADDLE_AUTH_TOKEN, // Hardcoded Auth Token
        'Vendor-Id': PADDLE_VENDOR_ID, // Hardcoded Vendor ID
      },
      body: JSON.stringify({
        // Gerekli parametreler eklendi
        // Eğer tüm ürünleri listelemek istiyorsanız, product_ids parametresini kullanmanıza gerek yoktur
        // Ancak, spesifik ürünler listelemek isterseniz, aşağıdaki gibi product_ids ekleyebilirsiniz
        // product_ids: ['your_product_id_1', 'your_product_id_2']
      }),
    });

    console.log('Paddle API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch products from Paddle API:', errorText);
      return res.status(response.status).json({ error: 'Failed to fetch products from Paddle API' });
    }

    const data = await response.json();
    console.log('Fetched products from Paddle API:', data);

    // Paddle API yanıtını frontend için uygun formata dönüştürme
    if (data.response && data.response.prices) {
      const formattedProducts = data.response.prices.map(item => ({
        id: item.id, // 'pri_...' formatında priceId
        name: item.name,
        description: item.description,
        price: item.unit_price.amount, // Fiyatı cent cinsinden alıyorsunuz
        currency: item.unit_price.currency_code,
        interval: item.billing_cycle.interval,
        frequency: item.billing_cycle.frequency,
      }));

      res.json(formattedProducts);
    } else {
      console.error('Unexpected Paddle API response structure:', data);
      res.status(500).json({ error: 'Unexpected Paddle API response structure' });
    }
  } catch (error) {
    console.error('Error fetching products from Paddle API:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
