// CheckoutPage.js
import React, { useEffect } from 'react';

const CheckoutPage = () => {
  const VENDOR_ID = '207125'; // Replace with your actual Vendor ID
  const PRODUCT_ID = '123456'; // Replace with your actual Product ID

  useEffect(() => {
    if (!window.Paddle) {
      const script = document.createElement('script');
      script.src = 'https://cdn.paddle.com/paddle/paddle.js';
      script.async = true;
      script.onload = () => {
        window.Paddle.Setup({ vendor: VENDOR_ID });
        console.log('Paddle.js successfully set up');
      };
      document.body.appendChild(script);
    } else {
      window.Paddle.Setup({ vendor: VENDOR_ID });
      console.log('Paddle.js already loaded and set up');
    }
  }, [VENDOR_ID]);

  const initiateCheckout = () => {
    if (window.Paddle) {
      window.Paddle.Checkout.open({
        product: PRODUCT_ID,
        successCallback: (data) => {
          console.log('Payment Successful:', data);
        },
        closeCallback: () => {
          console.log('Checkout closed');
        },
        errorCallback: (error) => {
          console.error('Checkout Error:', error);
        },
      });
    } else {
      console.error('Paddle is not initialized');
    }
  };

  return (
    <div>
      <h1>Checkout Page</h1>
      <button onClick={initiateCheckout}>Buy Now</button>
    </div>
  );
};

export default CheckoutPage;
