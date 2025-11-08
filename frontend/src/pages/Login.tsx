import { useEffect, useState } from 'react';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import Loading from '../components/Loading';
import EyeToggle from '../components/EyeToggle';
import VerifyEmail from './VerifyEmail';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHide, setShowHide] = useState(false);

  const [verify, setVerify] = useState(false);
  
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

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await login(email, password);
      
      navigate('/dashboard');
    } catch (err) {
      const ss = (err as string).toString();
      if(ss.indexOf('Please verify your email before logging in') >= 0){
        setVerify(true);
      }

      setError((err as string).toString());
    }finally{
      setLoading(false);
    }
  };
  
  if(verify){
    return <VerifyEmail email={email} setVerification={setVerify}/>
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
          <div className="flex justify-center mb-6">
            <div className="flex justify-center items-center rounded-full w-16 h-16" style={{ backgroundColor: '#008ea220' }}>
              <Logo className="w-16 h-16"/>
            </div>
          </div>

          <h2 className="mb-2 font-bold text-gray-900 text-3xl text-center">Welcome Back</h2>
          <p className="mb-8 text-gray-600 text-center">Sign in to access your student portal</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block mb-2 font-medium text-gray-700 text-sm">
                Email
              </label>
              <div className="relative">
                <Mail className="top-1/2 left-3 absolute w-5 h-5 text-gray-400 -translate-y-1/2 transform" />
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  className="py-3 pr-4 pl-11 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 w-full transition-all"
                  style={{ '--tw-ring-color': '#008ea2' } as React.CSSProperties}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block mb-2 font-medium text-gray-700 text-sm">
                Password
              </label>
              <div className="relative">
                <Lock className="top-1/2 left-3 absolute w-5 h-5 text-gray-400 -translate-y-1/2 transform" />
                <input
                  id="password"
                  type={showHide ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="py-3 pr-4 pl-11 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 w-full transition-all"
                  style={{ '--tw-ring-color': '#008ea2' } as React.CSSProperties}
                />
                <EyeToggle flg={showHide} setToggle={setShowHide}/>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 px-4 py-3 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end items-center">
              {/* <label className="flex items-center">
                <input type="checkbox" className="border-gray-300 rounded w-4 h-4" style={{ accentColor: '#008ea2' }} />
                <span className="ml-2 text-gray-600 text-sm">Remember me</span>
              </label> */}
              <button
                type="button"
                onClick={() => navigate('/reset-password')}
                disabled={loading}
                className={`font-medium text-sm hover:underline ${loading ? 'cursor-not-allowed':''}`}
                style={{ color: '#008ea2' }}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`hover:opacity-90 shadow-sm py-3.5 flex justify-center items-center rounded-lg w-full font-semibold text-white transition-all ${loading ? 'cursor-not-allowed opacity-45':''}`}
              style={{ backgroundColor: '#008ea2' }}
            >
              <Loading flg={loading} spinWidth={5} text="Signin" processingText="Signing in..."/>
            </button>
          </form>

          {/* <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                disabled={loading}
                className={`font-medium hover:underline ${loading ? 'cursor-not-allowed':''}`}
                style={{ color: '#008ea2' }}
              >
                Register here
              </button>
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
}
