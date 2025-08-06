import React, { useState, useEffect, useRef } from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { io, Socket } from 'socket.io-client';

interface Transaction {
  _id: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  description?: string;
}

function Wallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState<'deposit' | 'withdraw' | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!user?._id) return;

    const isProduction = import.meta.env.MODE === 'production';
    const SOCKET_URL = isProduction 
      ? 'https://kazi-hub.onrender.com'
      : (import.meta.env.VITE_API_URL || 'http://192.168.1.246:5000');

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    socketRef.current = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('token')
      },
      path: '/socket.io',
      transports: ['websocket'],
      withCredentials: true,
    });

    console.log('🟢 Connected to Socket:', SOCKET_URL);

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      socketRef.current?.emit('join', user._id);
    });

    socketRef.current.on('transaction_update', (transaction: Transaction) => {
      console.log('Received transaction update:', transaction);
      if (transaction.userId === user._id) {
        setTransactions(prev => [transaction, ...prev.filter(t => t._id !== transaction._id)]);
        setBalance(prev => 
          transaction.status === 'completed'
            ? transaction.type === 'deposit'
              ? prev + transaction.amount
              : prev - transaction.amount
            : prev
        );
        if (transaction.status === 'completed') {
          toast.success(`${transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'} completed successfully!`);
        } else if (transaction.status === 'failed') {
          toast.error(`Failed to process ${transaction.type}: ${transaction.description || 'Unknown error'}`);
        }
      }
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast.error('Failed to connect to real-time wallet updates');
    });

    socketRef.current.on('disconnect', () => {
      console.warn('🔌 Socket disconnected');
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('🛑 Socket disconnected on component unmount');
      }
    };
  }, [user?._id]);

  const fetchWalletData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const isProduction = import.meta.env.MODE === 'production';
      const API_URL = isProduction 
        ? 'https://kazi-hub.onrender.com'
        : (import.meta.env.VITE_API_URL || 'http://192.168.1.246:5000');

      const response = await axios.get(`${API_URL}/api/payments/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBalance(response.data.balance);
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to fetch wallet data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleDeposit = async () => {
    if (!phoneNumber || !amount) {
      toast.error('Please enter phone number and amount');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const isProduction = import.meta.env.MODE === 'production';
      const API_URL = isProduction 
        ? 'https://kazi-hub.onrender.com'
        : (import.meta.env.VITE_API_URL || 'http://192.168.1.246:5000');

      // Format phone number
      const formattedPhone = phoneNumber.startsWith('+254') 
        ? phoneNumber 
        : phoneNumber.startsWith('0') 
          ? '+254' + phoneNumber.slice(1) 
          : '+254' + phoneNumber;

      const response = await axios.post(
        `${API_URL}/api/payments/deposit`,
        { 
          phoneNumber: formattedPhone,
          amount: Number(amount)
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      toast.success('STK Push sent to your phone. Please complete the payment.');
      setAction(null);

      // Poll for payment status
      const checkPaymentStatus = async (paymentId: string) => {
        try {
          const statusResponse = await axios.get(
            `${API_URL}/api/payments/${paymentId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (statusResponse.data.status === 'completed') {
            toast.success('Payment completed successfully!');
            fetchWalletData();
            return;
          }

          if (statusResponse.data.status === 'failed') {
            toast.error('Payment failed');
            return;
          }

          // If still pending, check again after 5 seconds
          setTimeout(() => checkPaymentStatus(paymentId), 5000);
        } catch (error) {
          console.error('Error checking payment status:', error);
        }
      };

      // Start polling for payment status
      if (response.data.paymentId) {
        checkPaymentStatus(response.data.paymentId);
      }

    } catch (error: any) {
      console.error('Deposit error:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate deposit');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!phoneNumber || !amount) {
      toast.error('Please enter phone number and amount');
      return;
    }
    if (Number(amount) > balance) {
      toast.error('Insufficient balance');
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const isProduction = import.meta.env.MODE === 'production';
      const API_URL = isProduction 
        ? 'https://kazi-hub.onrender.com'
        : (import.meta.env.VITE_API_URL || 'http://192.168.1.246:5000');

      const response = await axios.post(
        `${API_URL}/api/payments/withdraw`,
        { phoneNumber: `254${phoneNumber.replace(/^0/, '')}`, amount: Number(amount) },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      toast.success('Withdrawal request sent. Processing...');
      setAction(null);
      // Note: No need for setTimeout(fetchWalletData) as socket will update in real-time
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate withdrawal');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading wallet...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-teal-dark to-teal-medium text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <WalletIcon className="h-8 w-8 mr-3" />
            <h1 className="text-2xl font-bold">My Wallet</h1>
          </div>
          
          <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
            <div className="text-sm opacity-80">Available Balance</div>
            <div className="text-3xl font-bold mt-1">
              KES {balance.toLocaleString()}
            </div>
            
            <div className="mt-6 flex gap-4">
              <button
                onClick={() => setAction('deposit')}
                className="flex-1 bg-white text-teal-dark px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Deposit Funds
              </button>
              <button
                onClick={() => setAction('withdraw')}
                className="flex-1 bg-white text-teal-dark px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Withdraw to M-Pesa
              </button>
            </div>
          </div>
        </div>
      </div>

      {action && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">
              {action === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
            </h3>
            <input
              type="tel"
              placeholder="Phone Number (07XX...)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
            />
            <input
              type="number"
              placeholder="Amount (KES)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setAction(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={action === 'deposit' ? handleDeposit : handleWithdraw}
                className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 disabled:bg-teal-300"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Transaction History</h2>
        
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction._id}
              className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between"
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-full ${
                  transaction.type === 'deposit'
                    ? 'bg-green-50 text-green-600'
                    : 'bg-red-50 text-red-600'
                }`}>
                  {transaction.type === 'deposit' ? (
                    <ArrowDownRight className="h-5 w-5" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5" />
                  )}
                </div>
                
                <div className="ml-4">
                  <div className="font-medium text-gray-800">
                    {transaction.description || `${transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'} via M-Pesa`}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(transaction.createdAt), 'MMM d, yyyy h:mm a')} • {transaction.status}
                  </div>
                </div>
              </div>
              
              <div className={`font-medium ${
                transaction.type === 'deposit'
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {transaction.type === 'deposit' ? '+' : '-'}
                KES {transaction.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Wallet;