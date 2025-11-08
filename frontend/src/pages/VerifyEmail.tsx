import { useEffect, useState } from 'react';
import { ArrowLeft, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Loading from '../components/Loading';
import { api } from '../utils/api';
import { APIResponseType } from '../types';

interface VerifyEmailProps {
  email: string;
  setVerification?: (flg: boolean) => void;
}

export default function VerifyEmail({email, setVerification = () => {}}: VerifyEmailProps) {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Auto clear message
  useEffect(() => {
    if(msg){
      const tm = setTimeout(() => {
        setMsg('');
      },3000);

      return () => {
        clearTimeout(tm);
      }
    }
  },[msg]);

  useEffect(() => {
    if(error){
      const tm2 = setTimeout(() => {
        setError('');
      },3000);

      return () => {
        clearTimeout(tm2);
      }
    }
  },[error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Verification Code required!');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post<APIResponseType>('/auth/verify-email',{email: email, token: token});

      if(response?.success || false){
        setMsg(response?.message || '');
        setTimeout(() => {
          setVerification(false);
          navigate('/login');
        },3000);
      }
      
    } catch (err) {
      setError((err as string).toString());
      console.log(err);
    }finally{
      setLoading(false);
    }
  };

  const handleResendVerificationCode = async () => {
    try {
      setResendLoading(true);
      const response = await api.post<APIResponseType>('/auth/resend-email-verification',{email: email});

      if(response?.success || false){
        setMsg(response?.message || '');
      }
      
    } catch (err) {
      setError((err as string).toString());
      console.log(err);
    }finally{
      setResendLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 min-h-screen">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 mb-8 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="bg-white shadow-lg p-8 rounded-2xl">
          <div className="flex justify-center mb-3">
            <div className="flex justify-center items-center rounded-full w-16 h-16" style={{ backgroundColor: '#008ea220' }}>
              <Logo className="w-16 h-16"/>
            </div>
          </div>

          <h2 className="mb-2 font-bold text-gray-900 text-3xl text-center">Verify Email</h2>
          <p className="mb-8 text-gray-600 text-center">Please verify your email using the code sent to your inbox/spam folder.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="token" className="block mb-2 font-medium text-gray-700 text-sm">
                Verification Code
              </label>
              <div className="relative">
                <Key className="top-1/2 left-3 absolute w-5 h-5 text-gray-400 -translate-y-1/2 transform" />
                <input
                  id="token"
                  type="text"
                  maxLength={8}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="********"
                  className="py-3 pr-4 pl-11 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 w-full transition-all"
                  style={{ '--tw-ring-color': '#008ea2' } as React.CSSProperties}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 px-4 py-3 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {msg && (
              <div className="bg-gray-50 px-4 py-3 border border-green-200 rounded-lg text-green-600 text-sm">
                {msg}
              </div>
            )}

            <div className="flex justify-end items-center">
              <button
                type="button"
                onClick={handleResendVerificationCode}
                disabled={loading || resendLoading}
                className={`flex justify-center items-center font-medium text-sm hover:underline ${loading || resendLoading ? 'cursor-not-allowed':''}`}
                style={{ color: '#008ea2' }}
              >
                <Loading flg={resendLoading} spinWidth={5} text="Resend Verification" processingText="Resending..."/>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || resendLoading}
              className={`hover:opacity-90 shadow-sm py-3.5 flex justify-center items-center rounded-lg w-full font-semibold text-white transition-all ${loading || resendLoading ? 'cursor-not-allowed opacity-45':''}`}
              style={{ backgroundColor: '#008ea2' }}
            >
              <Loading flg={loading} spinWidth={5} text="Verify" processingText="Verifying email..."/>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
