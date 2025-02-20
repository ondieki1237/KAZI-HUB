import React, { useState, useEffect } from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format } from 'date-fns';
import { payments } from '../services/api';
import toast from 'react-hot-toast';

interface Transaction {
  id: string;
  amount: number;
  type: 'payment' | 'withdrawal';
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  description: string;
}

function Wallet() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      // In a real app, these would be actual API calls
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          amount: 5000,
          type: 'payment',
          status: 'completed',
          createdAt: new Date().toISOString(),
          description: 'Payment for Plumbing Job #123'
        },
        {
          id: '2',
          amount: 3000,
          type: 'withdrawal',
          status: 'completed',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          description: 'Withdrawal to M-Pesa'
        }
      ];
      
      setTransactions(mockTransactions);
      setBalance(8000); // Mock balance
    } catch (error) {
      toast.error('Failed to fetch wallet data');
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
              <button className="flex-1 bg-white text-teal-dark px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                Withdraw to M-Pesa
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Transaction History</h2>
        
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between"
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-full ${
                  transaction.type === 'payment'
                    ? 'bg-green-50 text-green-600'
                    : 'bg-red-50 text-red-600'
                }`}>
                  {transaction.type === 'payment' ? (
                    <ArrowDownRight className="h-5 w-5" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5" />
                  )}
                </div>
                
                <div className="ml-4">
                  <div className="font-medium text-gray-800">
                    {transaction.description}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(transaction.createdAt), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
              </div>
              
              <div className={`font-medium ${
                transaction.type === 'payment'
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {transaction.type === 'payment' ? '+' : '-'}
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