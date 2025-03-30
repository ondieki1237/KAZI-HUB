import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import Payment from '../models/Payment.js'; // Adjust path
import { verifyToken } from '../middleware/auth.js';
import Job from '../models/Job.js';

// Load environment variables
dotenv.config();

const router = express.Router();

// Verify required environment variables
const requiredEnvVars = [
  'MPESA_CONSUMER_KEY',
  'MPESA_CONSUMER_SECRET',
  'MPESA_SHORT_CODE',
  'MPESA_PASSKEY'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const MPESA_SHORT_CODE = process.env.MPESA_SHORT_CODE;
const MPESA_PASSKEY = process.env.MPESA_PASSKEY;
const MPESA_INITIATOR_NAME = process.env.MPESA_INITIATOR_NAME;
const MPESA_SECURITY_CREDENTIAL = process.env.MPESA_SECURITY_CREDENTIAL;

const AUTH_URL = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
const STK_PUSH_URL = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
const B2C_URL = 'https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest';

// Get Access Token with better error handling
const getAccessToken = async () => {
  try {
    console.log('Getting M-Pesa access token...');
    
    // Create the auth string
    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
    
    // Make the request
    const response = await axios.get(AUTH_URL, { 
      headers: { 
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.data || !response.data.access_token) {
      throw new Error('Invalid response from M-Pesa API');
    }

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw new Error(`Failed to get M-Pesa access token: ${error.message}`);
  }
};

// STK Push (Deposit) with better error handling
router.post('/deposit', verifyToken, async (req, res) => {
  const { phoneNumber, amount } = req.body;
  const userId = req.user.id;

  try {
    // Input validation
    if (!phoneNumber || !amount) {
      return res.status(400).json({ message: 'Phone number and amount are required' });
    }

    // Phone number formatting
    const formattedPhone = phoneNumber.startsWith('+254') 
      ? phoneNumber.slice(1) 
      : phoneNumber.startsWith('0') 
        ? '254' + phoneNumber.slice(1) 
        : phoneNumber;

    console.log('Processing deposit:', {
      userId,
      phoneNumber: formattedPhone,
      amount
    });

    // Get access token
    const token = await getAccessToken();

    // Generate timestamp and password
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const password = Buffer.from(`${MPESA_SHORT_CODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');

    // Prepare STK push payload
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
      AccountReference: `KaziHub_${userId}`,
      TransactionDesc: 'Wallet Deposit'
    };

    console.log('Initiating STK push with payload:', stkPushPayload);

    // Make STK push request
    const response = await axios.post(STK_PUSH_URL, stkPushPayload, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('STK push response:', response.data);

    // Create payment record
    const payment = new Payment({
      userId,
      amount,
      type: 'deposit',
      status: 'pending',
      transactionId: response.data.CheckoutRequestID,
      paymentMethod: 'mpesa'
    });

    await payment.save();

    // Send success response
    res.json({ 
      message: 'STK Push sent successfully',
      paymentId: payment._id,
      checkoutRequestId: response.data.CheckoutRequestID
    });

  } catch (error) {
    console.error('Deposit error:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });

    res.status(500).json({ 
      message: 'Failed to initiate deposit',
      error: error.response?.data?.errorMessage || error.message
    });
  }
});

// STK Push Callback
router.post('/stk-callback', async (req, res) => {
  const { Body: { stkCallback } } = req.body;
  const { CheckoutRequestID, ResultCode, ResultDesc } = stkCallback;

  try {
    const payment = await Payment.findOneAndUpdate(
      { transactionId: CheckoutRequestID },
      {
        status: ResultCode === 0 ? 'completed' : 'failed',
        result: { ResultCode, ResultDesc },
      },
      { new: true }
    );

    if (ResultCode === 0) {
      // Update user's wallet balance here (e.g., in a User model)
      console.log('Deposit successful:', payment);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Callback error:', error);
    res.sendStatus(500);
  }
});

// B2C Withdrawal
router.post('/withdraw', verifyToken, async (req, res) => {
  const { phoneNumber, amount } = req.body;
  const userId = req.user.id;

  try {
    const token = await getAccessToken();
    const payload = {
      InitiatorName: MPESA_INITIATOR_NAME,
      SecurityCredential: MPESA_SECURITY_CREDENTIAL,
      CommandID: 'BusinessPayment',
      Amount: amount,
      PartyA: MPESA_SHORT_CODE,
      PartyB: phoneNumber,
      Remarks: 'Wallet Withdrawal',
      QueueTimeOutURL: `${process.env.SERVER_URL}/api/payments/timeout`,
      ResultURL: `${process.env.SERVER_URL}/api/payments/result`,
      Occasion: 'Withdrawal',
    };

    const response = await axios.post(B2C_URL, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const payment = await Payment.create({
      userId,
      amount,
      type: 'withdrawal',
      status: 'pending',
      transactionId: response.data.ConversationID,
    });

    res.json({ message: 'Withdrawal initiated', paymentId: payment._id });
  } catch (error) {
    console.error('Withdrawal error:', error.response?.data);
    res.status(500).json({ message: 'Failed to initiate withdrawal' });
  }
});

// B2C Callback
router.post('/result', async (req, res) => {
  const { Result } = req.body;
  const { TransactionID, ResultCode } = Result;

  try {
    await Payment.findOneAndUpdate(
      { transactionId: TransactionID },
      { status: ResultCode === '0' ? 'completed' : 'failed', result: Result }
    );
    res.sendStatus(200);
  } catch (error) {
    console.error('B2C Callback error:', error);
    res.sendStatus(500);
  }
});

router.post('/timeout', (req, res) => {
  console.log('Timeout:', req.body);
  res.sendStatus(200);
});

// Get Wallet Data
router.get('/wallet', verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const transactions = await Payment.find({ userId }).sort({ createdAt: -1 });
    const balance = transactions.reduce((acc, t) => 
      t.status === 'completed' ? (t.type === 'deposit' ? acc + t.amount : acc - t.amount) : acc, 0);
    res.json({ balance, transactions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch wallet data' });
  }
});

// Create a new payment
router.post('/', verifyToken, async (req, res) => {
  try {
    const { jobId, workerId, amount, rating } = req.body;

    // Verify job exists and is valid for payment
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'completed') {
      return res.status(400).json({ message: 'Job must be completed before payment' });
    }

    // Create payment record
    const payment = new Payment({
      jobId,
      workerId,
      employerId: req.user.id,
      amount,
      rating,
      status: 'pending'
    });

    await payment.save();

    res.status(201).json({
      message: 'Payment initiated successfully',
      payment
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ 
      message: 'Error creating payment',
      error: error.message
    });
  }
});

// Get payment history for a user
router.get('/history', verifyToken, async (req, res) => {
  try {
    const payments = await Payment.find({
      $or: [
        { workerId: req.user.id },
        { employerId: req.user.id }
      ]
    })
    .populate('jobId', 'title')
    .populate('workerId', 'name')
    .populate('employerId', 'name')
    .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching payment history',
      error: error.message
    });
  }
});

// Get payment details
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('jobId')
      .populate('workerId', 'name email phone')
      .populate('employerId', 'name email');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if user is authorized to view this payment
    if (payment.workerId._id.toString() !== req.user.id && 
        payment.employerId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this payment' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching payment details',
      error: error.message
    });
  }
});

// Update payment status (e.g., after M-Pesa callback)
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status, mpesaReference, transactionId } = req.body;
    
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        status,
        mpesaReference,
        transactionId,
        ...(status === 'completed' && { completedAt: new Date() })
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating payment status',
      error: error.message
    });
  }
});

export default router;