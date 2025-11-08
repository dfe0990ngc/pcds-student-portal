import { useEffect, useState } from 'react';
import { Mail, ArrowLeft, KeyRound, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Loading from '../components/Loading';
import { api } from '../utils/api';
import EyeToggle from '../components/EyeToggle';
import { APIResponseType } from '../types';

export default function PasswordReset() {
  const navigate = useNavigate();

  // Initialize state from sessionStorage
  const [email, setEmail] = useState(() => {
    return sessionStorage.getItem('reset_email') || '';
  });
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [error, setError] = useState('');
  const [resetStage, setResetStage] = useState<'request' | 'verify'>(() => {
    return (sessionStorage.getItem('reset_stage') as 'request' | 'verify') || 'request';
  });
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');

  const [showHide, setShowHide] = useState(false);

  // Persist email and stage to sessionStorage
  useEffect(() => {
    if (email) {
      sessionStorage.setItem('reset_email', email);
    }
  }, [email]);

  useEffect(() => {
    sessionStorage.setItem('reset_stage', resetStage);
  }, [resetStage]);

  useEffect(() => {
    if (error) {
      const tm = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(tm);
    }
  }, [error]);

  useEffect(() => {
    if (message) {
      const tm2 = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(tm2);
    }
  }, [message]);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      const data = await api.post<APIResponseType>('/auth/forgot-password', { email });

      if (data.success) {
        setResetStage('verify');
        setMessage('A reset code has been sent to your email.');
      } else {
        setError(data.message || 'Something went wrong.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to send reset instructions.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setMessage('');
    try {
      const data = await api.post('/auth/resend-forgot-password', { email });
      if (data.success) {
        setMessage('Reset code resent successfully.');
      } else {
        setError(data.message || 'Failed to resend reset code.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to resend code.');
    } finally {
      setResending(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token.trim()) {
      setError('Please enter your reset token.');
      return;
    }
    if (!password.trim() || password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const data = await api.post<APIResponseType>('/auth/reset-password', {
        token,
        password,
        password_confirmation: passwordConfirm,
      });

      if (data.success) {
        setMessage('Password has been reset successfully!');
        
        sessionStorage.removeItem('reset_email');
        sessionStorage.removeItem('reset_stage');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setError(err ? (err as string).toString() : 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    // Clear sessionStorage when going back to login
    sessionStorage.removeItem('reset_email');
    sessionStorage.removeItem('reset_stage');
    navigate('/login');
  };

  return (
    <div className="flex justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 min-h-screen">
      <div className={`w-full ${resetStage === 'verify' ? 'max-w-lg':'max-w-md'}`}>
        <button
          onClick={handleBackToLogin}
          className="flex items-center space-x-2 mb-8 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </button>

        <div className="bg-white shadow-lg p-8 rounded-2xl">
          <div className="flex justify-center mb-6">
            <div
              className="flex justify-center items-center rounded-full w-16 h-16"
              style={{ backgroundColor: '#008ea220' }}
            >
              <Logo className="w-16 h-16" />
            </div>
          </div>

          <h2 className="mb-2 font-bold text-gray-900 text-3xl text-center">Reset Password</h2>
          <p className="mb-8 text-gray-600 text-center">
            {resetStage === 'request'
              ? 'Enter your registered email to receive a password reset code.'
              : 'Check your email for the reset code, then set your new password below.'}
          </p>

          {error && (
            <div className="bg-red-50 mb-4 px-4 py-3 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 mb-4 px-4 py-3 border border-green-200 rounded-lg text-green-700 text-sm">
              {message}
            </div>
          )}

          {resetStage === 'request' && (
            <form onSubmit={handleRequest} className="space-y-6">
              <div>
                <label htmlFor="email" className="block mb-2 font-medium text-gray-700 text-sm">
                  Email
                </label>
                <div className="relative">
                  <Mail className="top-1/2 left-3 absolute w-5 h-5 text-gray-400 -translate-y-1/2 transform" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="my-email@example.com"
                    className="py-3 pr-4 pl-11 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 w-full transition-all"
                    style={{ '--tw-ring-color': '#008ea2' } as React.CSSProperties}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`flex justify-center items-center hover:opacity-90 shadow-sm py-3.5 rounded-lg w-full font-semibold text-white transition-all ${
                  loading ? 'cursor-not-allowed opacity-45' : ''
                }`}
                style={{ backgroundColor: '#008ea2' }}
              >
                <Loading
                  flg={loading}
                  text="Send Reset Code"
                  spinWidth={5}
                  processingText="Sending Reset Code..."
                />
              </button>
            </form>
          )}

          {resetStage === 'verify' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label htmlFor="token" className="block mb-2 font-medium text-gray-700 text-sm">
                  Reset Token
                </label>
                <input
                  id="token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter the code from your email"
                  className="px-4 py-3 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 w-full transition-all"
                  style={{ '--tw-ring-color': '#008ea2' } as React.CSSProperties}
                />
              </div>

              <div>
                <label htmlFor="password" className="block mb-2 font-medium text-gray-700 text-sm">
                  New Password
                </label>
                <div className="relative">
                  <KeyRound className="top-1/2 left-3 absolute w-5 h-5 text-gray-400 -translate-y-1/2 transform" />
                  <input
                    id="password"
                    type={showHide ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="py-3 pr-11 pl-11 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 w-full transition-all"
                    style={{ '--tw-ring-color': '#008ea2' } as React.CSSProperties}
                  />
                  <EyeToggle flg={showHide} setToggle={setShowHide}/>
                </div>
              </div>

              <div>
                <label
                  htmlFor="passwordConfirm"
                  className="block mb-2 font-medium text-gray-700 text-sm"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <KeyRound className="top-1/2 left-3 absolute w-5 h-5 text-gray-400 -translate-y-1/2 transform" />
                  <input
                    id="passwordConfirm"
                    type={showHide ? 'text' : 'password'}
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="Confirm new password"
                    className="py-3 pr-11 pl-11 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 w-full transition-all"
                    style={{ '--tw-ring-color': '#008ea2' } as React.CSSProperties}
                  />
                  <EyeToggle flg={showHide} setToggle={setShowHide}/>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`flex justify-center items-center hover:opacity-90 shadow-sm py-3.5 rounded-lg w-full font-semibold text-white transition-all ${
                  loading ? 'cursor-not-allowed opacity-45' : ''
                }`}
                style={{ backgroundColor: '#008ea2' }}
              >
                <Loading
                  flg={loading}
                  text="Reset Password"
                  spinWidth={5}
                  processingText="Resetting..."
                />
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="flex justify-center items-center mt-3 w-full font-medium text-gray-600 hover:text-gray-900 text-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'Resending...' : 'Resend Code'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}