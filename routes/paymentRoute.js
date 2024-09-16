const express = require('express');
const Stripe = require('stripe');
const router = express.Router();
const dotenv= require('dotenv')

dotenv.config()
const stripe = Stripe(process.env.STRIPE_SECRET);

router.post('/create-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: err.message });
  }
});

module.exports = router;
