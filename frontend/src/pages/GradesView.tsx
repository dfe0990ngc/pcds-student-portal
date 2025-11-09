import { Download, Award, BookOpen } from 'lucide-react';
import { Grade } from '../types';
import '../print.css';
import Logo from '../components/Logo';

interface GradesViewProps {
  grades: Grade[];
  student: {
    StudentNumber: string;
    FirstName: string;
    MiddleName: string;
    LastName: string;
    Course: string;
    YearLevel: string;
    Birthday: string;
    BirthPlace: string;
    Gender: string;
  };
}

export default function GradesView({ grades, student }: GradesViewProps) {
  
  const handlePrint = () => {
    window.print();
  };

  const totalUnits = grades.reduce((sum, grade) => sum + grade.CreditUnits, 0);
  const weightedSum = grades.reduce((sum, grade) => sum + (grade.Average * grade.CreditUnits), 0);
  const gwa = totalUnits > 0 ? weightedSum / totalUnits : 0;

  const getGradeColor = (status: string) => {
    return (status === 'Passed' || status === 'Posted') ? 'text-green-600' : 'text-red-600';
  };

  const getEquivalentGrade = (avg: number) => {
    if (avg >= 97) return '1.00';
    if (avg >= 94) return '1.25';
    if (avg >= 91) return '1.50';
    if (avg >= 88) return '1.75';
    if (avg >= 85) return '2.00';
    if (avg >= 82) return '2.25';
    if (avg >= 79) return '2.50';
    if (avg >= 76) return '2.75';
    if (avg >= 75) return '3.00';
    return '5.00';
  };

  return (
    <div className="space-y-6">
      <div className="screen-header">
          <h1 className="font-bold text-gray-900 text-3xl">Student Grades</h1>
          <p className="mt-1 text-gray-600">Academic performance and grade reports</p>
      </div>

      <div id="printable-content">
        {/* Fixed header for print that appears on all pages */}
        <div className="print-header">
          <Logo className="hidden print:block logo"/>
          <h1 className="mb-4 font-semibold text-gray-900 text-xl" style={{ color: '#008ea2' }}>Student Grades Report</h1>
        </div>

        <div className="print-content">
          <div className="gap-6 grid md:grid-cols-3 mb-6 page-break-avoid print-margin-lr print-section">
            <div className="bg-white shadow-sm p-6 border-l-4 rounded-xl" style={{ borderLeftColor: '#008ea2' }}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="mb-1 text-gray-600 text-sm">General Weighted Average</p>
                  <p className="font-bold text-gray-900 text-3xl">{gwa.toFixed(2)}</p>
                  <p className="mt-1 text-gray-500 text-xs">Equivalent: {getEquivalentGrade(gwa)}</p>
                </div>
                <div className="flex justify-center items-center rounded-lg w-12 h-12" style={{ backgroundColor: '#008ea220' }}>
                  <Award className="w-6 h-6" style={{ color: '#008ea2' }} />
                </div>
              </div>
            </div>

            <div className="bg-white shadow-sm p-6 border-l-4 border-l-green-500 rounded-xl">
              <div className="flex justify-between items-center">
                <div>
                  <p className="mb-1 text-gray-600 text-sm">Total Subjects</p>
                  <p className="font-bold text-gray-900 text-3xl">{grades.length}</p>
                  <p className="mt-1 text-gray-500 text-xs">Current semester</p>
                </div>
                <div className="flex justify-center items-center bg-green-100 rounded-lg w-12 h-12">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white shadow-sm p-6 border-l-4 border-l-blue-500 rounded-xl">
              <div className="flex justify-between items-center">
                <div>
                  <p className="mb-1 text-gray-600 text-sm">Total Units</p>
                  <p className="font-bold text-gray-900 text-3xl">{totalUnits}</p>
                  <p className="mt-1 text-gray-500 text-xs">Credit units earned</p>
                </div>
                <div className="flex justify-center items-center bg-blue-100 rounded-lg w-12 h-12">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm mb-6 p-6 rounded-xl page-break-avoid print-section">
            <div className="flex justify-between gap-6">
              <h2 className="mb-4 font-semibold text-gray-900 text-xl" style={{ color: '#008ea2' }}>Student Information</h2>
              
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 hover:opacity-90 shadow-sm px-4 py-2 rounded-sm h-8 font-medium text-white transition-all no-print"
                style={{ backgroundColor: '#008ea2' }}
              >
                <Download className="w-5 h-5" />
                <span>Print</span>
              </button>
            </div>
            <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-3 print-grid-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-1 font-medium text-gray-600 text-xs">Student Number</p>
                <p className="font-semibold text-gray-900 text-sm">{student.StudentNumber}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-1 font-medium text-gray-600 text-xs">Name</p>
                <p className="font-semibold text-gray-900 text-sm">
                  {student.FirstName} {student.MiddleName} {student.LastName}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-1 font-medium text-gray-600 text-xs">Gender</p>
                <p className="font-semibold text-gray-900 text-sm">
                  {student.Gender}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-1 font-medium text-gray-600 text-xs">Course</p>
                <p className="font-semibold text-gray-900 text-sm">{student.Course}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-1 font-medium text-gray-600 text-xs">Year Level</p>
                <p className="font-semibold text-gray-900 text-sm">{student.YearLevel}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-1 font-medium text-gray-600 text-xs">Birthday</p>
                <p className="font-semibold text-gray-900 text-sm">{student.Birthday}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-1 font-medium text-gray-600 text-xs">Birth Place</p>
                <p className="font-semibold text-gray-900 text-sm">{student.BirthPlace}</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm mb-6 p-6 rounded-xl page-break-avoid print-section">
            <h2 className="mb-4 font-semibold text-xl" style={{ color: '#008ea2' }}>Grade Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white" style={{ backgroundColor: '#008ea2' }}>
                    <th className="px-3 py-3 font-semibold text-left">Subject Code</th>
                    <th className="px-3 py-3 font-semibold text-left">Description</th>
                    <th className="px-3 py-3 font-semibold text-center">Units</th>
                    <th className="px-3 py-3 font-semibold text-center">Prelim</th>
                    <th className="px-3 py-3 font-semibold text-center">Midterm</th>
                    <th className="px-3 py-3 font-semibold text-center">Final</th>
                    <th className="px-3 py-3 font-semibold text-center">Average</th>
                    <th className="px-3 py-3 font-semibold text-center">Equiv.</th>
                    <th className="px-3 py-3 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {grades.map((grade) => (
                    <tr key={grade.GradeID} className="hover:bg-gray-50">
                      <td className="px-3 py-3 font-medium text-gray-900">{grade.SubjectCode}</td>
                      <td className="px-3 py-3 text-gray-700">{grade.Description}</td>
                      <td className="px-3 py-3 text-center">{grade.CreditUnits}</td>
                      <td className="px-3 py-3 text-center">{grade.PGrade.toFixed(0)}</td>
                      <td className="px-3 py-3 text-center">{grade.MGrade.toFixed(0)}</td>
                      <td className="px-3 py-3 text-center">{grade.FGrade.toFixed(0)}</td>
                      <td className="px-3 py-3 font-semibold text-center">{grade.Average.toFixed(2)}</td>
                      <td className="px-3 py-3 font-semibold text-center">{grade.Equivalent}</td>
                      <td className={`px-3 py-3 text-center font-semibold ${getGradeColor(grade.GradeStatus)}`}>
                        {grade.GradeStatus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white shadow-sm mb-6 p-6 rounded-xl detailed-grades-section">
            <h2 className="mb-4 font-semibold text-xl" style={{ color: '#008ea2' }}>Detailed Grade Breakdown</h2>
            <div className="space-y-4">
              {grades.map((grade) => (
                <div key={grade.GradeID} className="hover:shadow-md p-4 border border-gray-200 rounded-lg page-break-avoid transition-shadow">
                  <div className="flex sm:flex-row flex-col justify-start sm:justify-between items-start gap-4 mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{grade.SubjectCode} - {grade.Description}</h3>
                      <p className="mt-1 text-gray-600 text-sm">
                        {grade.Instructor} | Section: {grade.Section} | {grade.CreditUnits} Units
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-2xl" style={{ color: '#008ea2' }}>{grade.Average.toFixed(2)}</p>
                      <p className="text-gray-600 text-sm">Equiv: {grade.Equivalent}</p>
                    </div>
                  </div>

                  <div className="gap-4 grid grid-cols-1 sm:grid-cols-4 mt-4 pt-4 border-gray-200 border-t">
                    <div>
                      <p className="mb-1 text-gray-600 text-xs">Prelim</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="rounded-full h-2"
                            style={{
                              width: `${(grade.PGrade / 100) * 100}%`,
                              backgroundColor: '#008ea2'
                            }}
                          />
                        </div>
                        <span className="font-semibold text-sm">{grade.PGrade.toFixed(0)}</span>
                      </div>
                    </div>

                    <div>
                      <p className="mb-1 text-gray-600 text-xs">Pre-Mid</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="rounded-full h-2"
                            style={{
                              width: `${(grade.PreMid / 100) * 100}%`,
                              backgroundColor: '#008ea2'
                            }}
                          />
                        </div>
                        <span className="font-semibold text-sm">{grade.PreMid.toFixed(0)}</span>
                      </div>
                    </div>

                    <div>
                      <p className="mb-1 text-gray-600 text-xs">Midterm</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="rounded-full h-2"
                            style={{
                              width: `${(grade.MGrade / 100) * 100}%`,
                              backgroundColor: '#008ea2'
                            }}
                          />
                        </div>
                        <span className="font-semibold text-sm">{grade.MGrade.toFixed(0)}</span>
                      </div>
                    </div>

                    <div>
                      <p className="mb-1 text-gray-600 text-xs">Pre-Final</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="rounded-full h-2"
                            style={{
                              width: `${(grade.PreFinal / 100) * 100}%`,
                              backgroundColor: '#008ea2'
                            }}
                          />
                        </div>
                        <span className="font-semibold text-sm">{grade.PreFinal.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-gray-200 border-t">
                    <div className="flex sm:flex-row flex-col justify-start sm:justify-between items-start sm:items-center gap-4">
                      <div className="flex sm:flex-row flex-col justify-start sm:items-center gap-4 text-gray-600 text-sm">
                        <span>Final Grade: <span className="font-semibold text-gray-900">{grade.FGrade.toFixed(0)}</span></span>
                        <span>Status: <span className={`font-semibold ${getGradeColor(grade.GradeStatus)}`}>{grade.GradeStatus}</span></span>
                        <span>Ref No: <span className="font-semibold text-gray-900">{grade.GradRefNo}</span></span>
                      </div>
                      {grade.Remarks && (
                        <span className="text-gray-600 text-sm italic">{grade.Remarks}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white shadow-sm mt-16 p-6 border-2 rounded-xl print-margin-lr print-section" style={{ borderColor: '#008ea2' }}>
            <h2 className="mb-4 font-semibold text-xl" style={{ color: '#008ea2' }}>Academic Summary</h2>
            <div className="gap-6 grid md:grid-cols-3">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="mb-2 text-gray-600 text-sm">School Year</p>
                <p className="font-bold text-gray-900 text-xl">{grades[0]?.SY}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="mb-2 text-gray-600 text-sm">Semester</p>
                <p className="font-bold text-gray-900 text-xl">{grades[0]?.Sem}</p>
              </div>
              <div className="p-4 rounded-lg text-center" style={{ backgroundColor: '#008ea220' }}>
                <p className="mb-2 text-gray-600 text-sm">General Weighted Average</p>
                <p className="font-bold text-2xl" style={{ color: '#008ea2' }}>{gwa.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}