import React, { useState, useEffect } from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext'; // Assuming this provides user data

interface Transaction {
  _id: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  description?: string;
}

function Wallet() {
  const { user } = useAuth(); // Get authenticated user
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState<'deposit' | 'withdraw' | null>(null);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const token = localStorage.getItem('token'); // Adjust based on your auth setup
      const response = await axios.get('http://192.168.1.110:5000/api/payments/wallet', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBalance(response.data.balance);
      setTransactions(response.data.transactions);
    } catch (error) {
      toast.error('Failed to fetch wallet data');
    } finally {
      setLoading(false);
    }
  };

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

      // Format phone number
      const formattedPhone = phoneNumber.startsWith('+254') 
        ? phoneNumber 
        : phoneNumber.startsWith('0') 
          ? '+254' + phoneNumber.slice(1) 
          : '+254' + phoneNumber;

      const response = await axios.post(
        'http://192.168.1.110:5000/api/payments/deposit',
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
            `http://192.168.1.110:5000/api/payments/${paymentId}`,
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
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://192.168.1.110:5000/api/payments/withdraw',
        { phoneNumber: `254${phoneNumber.replace(/^0/, '')}`, amount: Number(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Withdrawal request sent. Processing...');
      setAction(null);
      setTimeout(fetchWalletData, 10000); // Refresh after 10s
    } catch (error) {
      toast.error('Failed to initiate withdrawal');
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