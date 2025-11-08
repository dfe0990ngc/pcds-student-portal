import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import AccountView from './AccountView';
import GradesView from './GradesView';
import { useEffect, useState } from 'react';
import { Account, APIResponseType, Grade, Student } from '../types';
import { api } from '../utils/api'; // adjust the import path as needed
import Logo from '../components/Logo';

export default function Dashboard() {
  const { studentNumber, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [student, setStudent] = useState<Student | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentNumber) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // --- Get Account Info ---
        const accountRes = await api.get<APIResponseType>(`/student/account`,{skipAuth: false},'get-account');

        if (accountRes.success && accountRes.data.accounts?.length > 0) {
          const acc = accountRes.data.accounts[0];
          setAccount(acc);

          // build student info from account
          setStudent({
            StudentNumber: acc.StudentNumber,
            FirstName: acc.FirstName,
            MiddleName: acc.MiddleName,
            LastName: acc.LastName,
            Course: acc.Course,
            YearLevel: acc.YearLevel,
            Status: acc.Status,
            Birthday: '',
            BirthPlace: '',
          });
        }

        // --- Get Grades ---
        const gradesRes = await api.get<APIResponseType>(`/student/grades`,{ skipAuth: false },'get-grades');

        if (gradesRes.success) {
          // Convert string numbers to actual numbers
          const transformedGrades = (gradesRes.data.grades ?? []).map(grade => ({
            ...grade,
            CreditUnits: Number(grade.CreditUnits) || 0,
            PGrade: Number(grade.PGrade) || 0,
            PreMid: Number(grade.PreMid) || 0,
            MGrade: Number(grade.MGrade) || 0,
            PreFinal: Number(grade.PreFinal) || 0,
            FGrade: Number(grade.FGrade) || 0,
            Average: Number(grade.Average) || 0,
          }));
          setGrades(transformedGrades);
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentNumber]);

  if (loading) {
    return (
      <div className="flex justify-center items-center bg-gray-50 min-h-screen">
        <p className="text-gray-600">Loading student data...</p>
      </div>
    );
  }

  if (!student || !account) {
    return (
      <div className="flex flex-col justify-center items-center space-y-4 bg-gray-50 min-h-screen">
        <Logo className="w-16 h-16" />
        
        <div className="text-center">
          <h2 className="mb-2 font-bold text-gray-900 text-2xl">No Data Found</h2>
          <p className="mb-4 text-gray-600">Unable to find student information.</p>
          <button
            onClick={logout}
            className="hover:opacity-90 px-6 py-2.5 rounded-lg font-medium text-white transition-all"
            style={{ backgroundColor: '#008ea2' }}
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const studentName = `${student.FirstName} ${student.LastName}`;
  const currentPage = location.pathname.includes('grades') ? 'grades' : 'account';

  const handleNavigate = (page: 'account' | 'grades') => {
    navigate(`/dashboard/${page}`);
  };

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      onLogout={logout}
      studentName={studentName}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard/account" replace />} />
        <Route path="/account" element={<AccountView account={account} />} />
        <Route path="/grades" element={<GradesView grades={grades} student={student} />} />
      </Routes>
    </Layout>
  );
}
