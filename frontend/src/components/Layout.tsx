import { ReactNode } from 'react';
import { LogOut, User, FileText } from 'lucide-react';
import Logo from './Logo';

interface LayoutProps {
  children: ReactNode;
  currentPage: 'account' | 'grades';
  onNavigate: (page: 'account' | 'grades') => void;
  onLogout: () => void;
  studentName: string;
}

export default function Layout({ children, currentPage, onNavigate, onLogout, studentName }: LayoutProps) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="top-0 sticky bg-white shadow-sm border-gray-200 border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Logo className="w-8 h-8"/>
              <h1 className="font-semibold text-gray-900 text-xl">PCDS - Student Portal</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="font-medium text-gray-900 text-sm">{studentName}</p>
                <p className="text-gray-500 text-xs">Student</p>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 hover:bg-gray-100 px-4 py-2 rounded-lg text-gray-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>

        <nav className="sm:top-3 sm:left-1/2 sm:absolute flex justify-center items-center space-x-6 mb-5 sm:mb-0 w-full sm:w-auto sm:-translate-x-1/2">
          <button
            onClick={() => onNavigate('account')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              currentPage === 'account'
                ? 'text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            style={currentPage === 'account' ? { backgroundColor: '#008ea2' } : {}}
          >
            <FileText className="w-4 h-4" />
            <span className="font-medium">Account</span>
          </button>

          <button
            onClick={() => onNavigate('grades')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              currentPage === 'grades'
                ? 'text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            style={currentPage === 'grades' ? { backgroundColor: '#008ea2' } : {}}
          >
            <User className="w-4 h-4" />
            <span className="font-medium">Grades</span>
          </button>
        </nav>
      </header>

      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">

        {children}
      </main>
    </div>
  );
}
