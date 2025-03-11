import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { verifyToken } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();

// M-Pesa Credentials (loaded from .env in production)
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || 'gGUDIW6ZwFFLm6Q1Fi9n4TSdAWJs8Gdpd8aeB9MHWhA4QdAw';
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || 'JTZ6wZsUocHV3tyo0Uuz0Nde9A92tokszQs1Ao4s8oxPLbPC8tHfTJ15JoMEzDbB';
const MPESA_SHORT_CODE = process.env.MPESA_SHORT_CODE || '174379';
const MPESA_INITIATOR_NAME = process.env.MPESA_INITIATOR_NAME || 'testapi'; // Replace with your initiator name
const MPESA_SECURITY_CREDENTIAL = process.env.MPESA_SECURITY_CREDENTIAL || 'YOUR_SECURITY_CREDENTIAL'; // Replace with actual credential
const MPESA_PASSKEY = process.env.MPESA_PASSKEY || 'YOUR_PASSKEY'; // Replace with actual passkey

const AUTH_URL = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
const B2C_URL = 'https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest';
const STK_PUSH_URL = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

// Middleware to get M-Pesa access token
const getAccessToken = async () => {
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
  try {
    const response = await axios.get(AUTH_URL, {
      headers: { Authorization: `Basic ${auth}` },
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting token:', error.response?.data);
    throw new Error('Failed to get M-Pesa access token');
  }
};

// B2C Payment Endpoint
router.post('/send-payment', verifyToken, async (req, res) => {
  const { phoneNumber, amount, paymentId } = req.body;

  try {
    // Validate input
    if (!phoneNumber || !amount || !paymentId) {
      return res.status(400).json({ message: 'Phone number, amount and payment ID are required' });
    }

    // Format phone number
    const formattedPhone = phoneNumber.startsWith('+254') 
      ? phoneNumber.slice(1) 
      : phoneNumber.startsWith('0') 
        ? '254' + phoneNumber.slice(1) 
        : phoneNumber;

    const token = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const password = Buffer.from(`${MPESA_SHORT_CODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');

    const stkPushPayload = {
      BusinessShortCode: MPESA_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: MPESA_SHORT_CODE,
      PhoneNumber: formattedPhone,
      CallBackURL: `${process.env.API_URL}/api/payments/stk-callback`,
      AccountReference: `Job_Payment_${paymentId}`,
      TransactionDesc: 'Job Payment'
    };

    const response = await axios.post(STK_PUSH_URL, stkPushPayload, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ 
      message: 'Failed to initiate payment',
      error: error.response?.data || error.message
    });
  }
});

// Callback Endpoints
router.post('/result', (req, res) => {
  console.log('M-Pesa Result:', req.body);
  // TODO: Save payment result to database
  res.sendStatus(200);
});

router.post('/timeout', (req, res) => {
  console.log('M-Pesa Timeout:', req.body);
  // TODO: Handle timeout (e.g., retry logic)
  res.sendStatus(200);
});

export default router;