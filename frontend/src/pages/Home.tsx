import { BookOpen, Award, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <header className="top-0 sticky bg-white shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-7xl">
          <div className="flex sm:flex-row flex-col justify-start sm:justify-between items-start sm:items-center">
            <div className="flex items-center space-x-3">
              <Logo className="w-10 h-10"/>
              <div>
                <h1 className="font-bold text-gray-900 text-2xl">PCDS - Student Portal</h1>
                <p className="text-gray-600 text-sm">Sharpening your minds for better tomorrow</p>
              </div>
            </div>
            <div className="flex justify-center sm:justify-end space-x-3 mt-6 sm:mt-0 w-full sm:w-auto">
              <button
                onClick={() => navigate('/login')}
                className="hover:opacity-90 shadow-sm px-6 py-2.5 rounded-lg font-medium text-white transition-all"
                style={{ backgroundColor: '#008ea2' }}
              >
                Sign in
              </button>
              {/* <button
                onClick={() => navigate('/register')}
                className="hover:bg-gray-50 px-6 py-2.5 border-2 rounded-lg font-medium transition-all"
                style={{ borderColor: '#008ea2', color: '#008ea2' }}
              >
                Register
              </button> */}
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto px-4 sm:px-6 lg:px-8 py-20 max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-6 font-bold text-gray-900 text-5xl leading-tight">
              Welcome to Your Academic
              <br />
              <span style={{ color: '#008ea2' }}>Information Portal</span>
            </h2>
            <p className="mx-auto max-w-3xl text-gray-600 text-xl leading-relaxed">
              Access your academic records, view grades, manage your account, and stay connected with your educational journey all in one convenient location.
            </p>
          </div>

          <div className="gap-8 grid md:grid-cols-3 mb-16">
            <div className="bg-white shadow-sm hover:shadow-md p-8 rounded-xl transition-shadow">
              <div className="flex justify-center items-center mb-6 rounded-lg w-14 h-14" style={{ backgroundColor: '#008ea220' }}>
                <BookOpen className="w-7 h-7" style={{ color: '#008ea2' }} />
              </div>
              <h3 className="mb-3 font-semibold text-gray-900 text-xl">View Your Grades</h3>
              <p className="text-gray-600 leading-relaxed">
                Access comprehensive grade reports including prelim, midterm, and final grades for all your subjects across semesters.
              </p>
            </div>

            <div className="bg-white shadow-sm hover:shadow-md p-8 rounded-xl transition-shadow">
              <div className="flex justify-center items-center mb-6 rounded-lg w-14 h-14" style={{ backgroundColor: '#008ea220' }}>
                <Award className="w-7 h-7" style={{ color: '#008ea2' }} />
              </div>
              <h3 className="mb-3 font-semibold text-gray-900 text-xl">Account Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Monitor your tuition fees, payments, balances, and financial account details with complete transparency.
              </p>
            </div>

            <div className="bg-white shadow-sm hover:shadow-md p-8 rounded-xl transition-shadow">
              <div className="flex justify-center items-center mb-6 rounded-lg w-14 h-14" style={{ backgroundColor: '#008ea220' }}>
                <Users className="w-7 h-7" style={{ color: '#008ea2' }} />
              </div>
              <h3 className="mb-3 font-semibold text-gray-900 text-xl">Export Records</h3>
              <p className="text-gray-600 leading-relaxed">
                Download and print your academic records and financial statements in PDF format for your records or applications.
              </p>
            </div>
          </div>

          <div className="bg-white shadow-sm p-12 rounded-xl text-center">
            <h3 className="mb-4 font-bold text-gray-900 text-2xl">Ready to Get Started?</h3>
            <p className="mb-8 text-gray-600 text-lg">
              Create an account or login to access your student portal
            </p>
            <div className="flex sm:flex-row flex-col justify-center gap-4">
              {/* <button
                onClick={() => navigate('/register')}
                className="hover:opacity-90 shadow-sm px-8 py-3.5 rounded-lg font-medium text-white text-lg transition-all"
                style={{ backgroundColor: '#008ea2' }}
              >
                Create Account
              </button> */}
              <button
                onClick={() => navigate('/login')}
                className="hover:bg-gray-50 px-8 py-3.5 border-2 rounded-lg font-medium text-lg transition-all"
                style={{ borderColor: '#008ea2', color: '#008ea2' }}
              >
                Sign In
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white mt-20 border-gray-200 border-t">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          <div className="text-gray-600 text-center">
            <p>&copy; 2024 University of Excellence. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
