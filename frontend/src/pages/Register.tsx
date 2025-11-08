import { useState } from 'react';
import { User, Lock, Calendar, ArrowLeft, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EyeToggle from '../components/EyeToggle';
import { api } from '../utils/api';
import Logo from '../components/Logo';
import Loading from '../components/Loading';
import { APIResponseType } from '../types';
import VerifyEmail from './VerifyEmail';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    birthday: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [showHide, setShowHide] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verify,setVerify] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (Object.values(formData).some(value => !value)) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try{
      setLoading(true);
      const data = await api.post<APIResponseType>('/auth/register',formData,{ skipAuth: true },'auth-register');

      if(data.verification_required){
        setVerify(true);
      }
    }catch(err){
      // console.log(err);
      setError((err as string).toString());
    }finally{
      setLoading(false);
    }
  };

  if(verify){
    return <VerifyEmail email={formData.email}/>
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12 min-h-screen">
      <div className="mx-auto max-w-xl">
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

          <h2 className="mb-2 font-bold text-gray-900 text-3xl text-center">Create Account</h2>
          <p className="mb-8 text-gray-600 text-center">Register to access your student portal</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="gap-6 grid md:grid-cols-2">
              <div>
                <label htmlFor="studentNumber" className="block mb-2 font-medium text-gray-700 text-sm">
                  Student Number
                </label>
                <div className="relative">
                  <User className="top-1/2 left-3 absolute w-5 h-5 text-gray-400 -translate-y-1/2 transform" />
                  <input
                    id="studentNumber"
                    name="studentNumber"
                    type="text"
                    value={formData.studentNumber}
                    onChange={handleChange}
                    placeholder="2021-00001"
                    className="py-3 pr-4 pl-11 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 w-full transition-all"
                    style={{ '--tw-ring-color': '#008ea2' } as React.CSSProperties}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block mb-2 font-medium text-gray-700 text-sm">
                  Email
                </label>
                <div className="relative">
                  <Mail className="top-1/2 left-3 absolute w-5 h-5 text-gray-400 -translate-y-1/2 transform" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="py-3 pr-4 pl-11 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 w-full transition-all"
                    style={{ '--tw-ring-color': '#008ea2' } as React.CSSProperties}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="firstName" className="block mb-2 font-medium text-gray-700 text-sm">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Juan"
                  className="px-4 py-3 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 w-full transition-all"
                  style={{ '--tw-ring-color': '#008ea2' } as React.CSSProperties}
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block mb-2 font-medium text-gray-700 text-sm">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Dela Cruz"
                  className="px-4 py-3 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 w-full transition-all"
                  style={{ '--tw-ring-color': '#008ea2' } as React.CSSProperties}
                />
              </div>
            </div>
            <div>
              <label htmlFor="birthday" className="block mb-2 font-medium text-gray-700 text-sm">
                Birthday
              </label>
              <div className="relative">
                <Calendar className="top-1/2 left-3 absolute w-5 h-5 text-gray-400 -translate-y-1/2 transform" />
                <input
                  id="birthday"
                  name="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={handleChange}
                  className="py-3 pr-4 pl-11 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 w-full transition-all"
                  style={{ '--tw-ring-color': '#008ea2' } as React.CSSProperties}
                />
              </div>
            </div>
            <div className="gap-6 grid md:grid-cols-2">
              <div>
                <label htmlFor="password" className="block mb-2 font-medium text-gray-700 text-sm">
                  Password
                </label>
                <div className="relative">
                  <Lock className="top-1/2 left-3 absolute w-5 h-5 text-gray-400 -translate-y-1/2 transform" />
                  <input
                    id="password"
                    name="password"
                    type={showHide ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    className="py-3 pr-9 pl-11 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 w-full transition-all"
                    style={{ '--tw-ring-color': '#008ea2' } as React.CSSProperties}
                  />
                  <EyeToggle flg={showHide} setToggle={setShowHide} />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block mb-2 font-medium text-gray-700 text-sm">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="top-1/2 left-3 absolute w-5 h-5 text-gray-400 -translate-y-1/2 transform" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showHide ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="py-3 pr-4 pl-11 border border-gray-300 focus:border-transparent rounded-lg focus:ring-2 w-full transition-all"
                    style={{ '--tw-ring-color': '#008ea2' } as React.CSSProperties}
                  />
                  <EyeToggle flg={showHide} setToggle={setShowHide} />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 px-4 py-3 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`flex justify-center items-center hover:opacity-90 shadow-sm py-3.5 rounded-lg w-full font-semibold text-white transition-all ${loading ? 'cursor-not-allowed opacity-45':''}`}
              style={{ backgroundColor: '#008ea2' }}
            >
              <Loading flg={loading} spinWidth={5} text="Create Account" processingText="Creating, please wait..." />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                disabled={loading}
                className={`font-medium hover:underline ${loading ? 'cursor-not-allowed':''}`}
                style={{ color: '#008ea2' }}
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
