import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, LogOut, CheckCircle, QrCode } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { insertData, fetchData, authAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface Payment {
  id: string;
  amount: number;
  description?: string;
  status: string;
  transaction_id?: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Payment form state
  const [paymentType, setPaymentType] = useState('');
  const [amount, setAmount] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [upiLink, setUpiLink] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [currentPaymentId, setCurrentPaymentId] = useState('');

  const UPI_ID = '9963721999@ybl';

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const response = await fetchData();
      setPayments(response.data);
    } catch (error) {
      console.error('Load payments error:', error);
    }
  };

  const handleGeneratePayment = async () => {
    if (!paymentType) {
      toast.error('Please select payment type');
      return;
    }
    
    if (!amount || parseFloat(amount) < 1 || parseFloat(amount) > 9999) {
      toast.error('Please enter amount between ₹1 and ₹9999');
      return;
    }

    setIsLoading(true);

    try {
      // Create payment record
      const response = await insertData({
        amount: parseFloat(amount),
        description: paymentType,
        status: 'pending'
      });

      setCurrentPaymentId(response.data.id);

      // Generate UPI link
      const upiString = `upi://pay?pa=${UPI_ID}&pn=Payment&am=${amount}&cu=INR&tn=${paymentType}`;
      setUpiLink(upiString);

      // Generate QR code using Google Charts API
      const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chl=${encodeURIComponent(upiString)}&chs=300x300&choe=UTF-8`;
      setQrCodeUrl(qrUrl);

      setShowQR(true);
      toast.success('UPI payment link generated!');
    } catch (error: any) {
      toast.error('Failed to generate payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      toast.success('Payment marked as completed!');
      setShowQR(false);
      setPaymentType('');
      setAmount('');
      setCurrentPaymentId('');
      await loadPayments();
    } catch (error) {
      toast.error('Failed to update payment status');
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">💳 Payment System</h1>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Payment Form */}
        {!showQR && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Make a Payment</h2>
            
            {/* Payment Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Payment Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentType('Consultation Fees')}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    paymentType === 'Consultation Fees'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-2xl mb-2">👨‍⚕️</div>
                  <div className="font-semibold">Consultation Fees</div>
                </button>
                
                <button
                  onClick={() => setPaymentType('Lab')}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    paymentType === 'Lab'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🧪</div>
                  <div className="font-semibold">Lab</div>
                </button>
                
                <button
                  onClick={() => setPaymentType('Medicine')}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    paymentType === 'Medicine'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-2xl mb-2">💊</div>
                  <div className="font-semibold">Medicine</div>
                </button>
                
                <button
                  onClick={() => setPaymentType('Scan')}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    paymentType === 'Scan'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🏥</div>
                  <div className="font-semibold">Scan</div>
                </button>
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Amount (₹1 - ₹9999)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500 text-lg">₹</span>
                <input
                  type="number"
                  min="1"
                  max="9999"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter amount"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">Minimum: ₹1 | Maximum: ₹9,999</p>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleGeneratePayment}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Confirm & Generate UPI
                </>
              )}
            </button>
          </div>
        )}

        {/* UPI QR Code Display */}
        {showQR && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <QrCode className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Scan & Pay</h2>
              <p className="text-gray-600 mb-6">
                Pay ₹{amount} for {paymentType}
              </p>

              {/* QR Code */}
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block mb-6">
                <img 
                  src={qrCodeUrl} 
                  alt="UPI QR Code" 
                  className="w-64 h-64"
                />
                <p className="text-sm text-gray-600 mt-2">UPI ID: {UPI_ID}</p>
              </div>

              {/* UPI Link Button */}
              <div className="mb-6">
                <a
                  href={upiLink}
                  className="inline-block w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-purple-700 transition-colors"
                >
                  💳 Pay with UPI App
                </a>
                <p className="text-sm text-gray-500 mt-2">Click to open UPI app</p>
              </div>

              {/* Paid Button */}
              <button
                onClick={handleMarkAsPaid}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                I Have Paid
              </button>

              <button
                onClick={() => {
                  setShowQR(false);
                  setPaymentType('');
                  setAmount('');
                }}
                className="mt-3 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Payment History */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Payment History</h3>
          
          {payments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No payments yet</p>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div 
                  key={payment.id} 
                  className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{payment.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(payment.created_at).toLocaleDateString()} at{' '}
                      {new Date(payment.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">₹{payment.amount}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      payment.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
