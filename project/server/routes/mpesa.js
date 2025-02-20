import express from 'express';
import axios from 'axios';

const router = express.Router();

// Helper function to generate M-Pesa access token
const getMpesaAccessToken = async () => {
  const consumer_key = process.env.MPESA_CONSUMER_KEY;
  const consumer_secret = process.env.MPESA_CONSUMER_SECRET;
  const auth = Buffer.from(`${consumer_key}:${consumer_secret}`).toString('base64');

  try {
    const response = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    throw new Error('Failed to get M-Pesa access token');
  }
};

// Initiate M-Pesa STK Push
router.post('/stkpush', async (req, res) => {
  try {
    const { phone, amount, jobId } = req.body;

    const accessToken = await getMpesaAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const shortcode = process.env.MPESA_SHORT_CODE;
    const passkey = process.env.MPESA_PASSKEY;

    const password = Buffer.from(
      `${shortcode}${passkey}${timestamp}`
    ).toString('base64');

    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phone.replace(/^0/, '254'),
        PartyB: shortcode,
        PhoneNumber: phone.replace(/^0/, '254'),
        CallBackURL: `${process.env.API_URL}/api/mpesa/callback`,
        AccountReference: `Job-${jobId}`,
        TransactionDesc: 'Payment for job service'
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.json({
      message: 'STK push initiated',
      data: response.data
    });
  } catch (error) {
    console.error('M-Pesa error:', error);
    res.status(500).json({
      message: 'Failed to initiate payment',
      error: error.message
    });
  }
});

// M-Pesa callback URL
router.post('/callback', async (req, res) => {
  try {
    const { Body } = req.body;
    
    // Handle the callback response
    if (Body.stkCallback.ResultCode === 0) {
      // Payment successful
      // Update job payment status
      // Notify user
    } else {
      // Payment failed
      // Handle failure
    }

    res.json({ message: 'Callback received' });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    res.status(500).json({ message: 'Callback processing failed' });
  }
});

// Query payment status
router.get('/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    // Query payment status from your database
    res.json({ status: 'pending' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get payment status' });
  }
});

export default router;