import { Download, DollarSign, CreditCard, FileText } from 'lucide-react';
import { Account } from '../types';
import Logo from '../components/Logo';
import '../print.css';

interface AccountViewProps {
  account: Account;
}

export default function AccountView({ account }: AccountViewProps) {
  const handlePrint = () => {
    window.print();
  };

  const charges = [
    { desc: account.Desc1, amount: account.Amount1 },
    { desc: account.Desc2, amount: account.Amount2 },
    { desc: account.Desc3, amount: account.Amount3 },
    { desc: account.Desc4, amount: account.Amount4 },
    { desc: account.Desc5, amount: account.Amount5 },
  ].filter(item => item.desc && item.amount > 0);

  const hasOtherFees = charges.length > 0 || account.RegFee > 0 || account.InstallmentFee > 0 || account.Others > 0;

  const discounts = [
    { desc: account.DiscDesc1, amount: account.DiscAmount1 },
    { desc: account.DiscDesc2, amount: account.DiscAmount2 },
    { desc: account.DiscDesc3, amount: account.DiscAmount3 },
    { desc: account.DiscDesc4, amount: account.DiscAmount4 },
    { desc: account.DiscDesc5, amount: account.DiscAmount5 },
  ].filter(item => item.desc && item.amount > 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center no-print screen-header">
        <div>
          <h1 className="font-bold text-gray-900 text-3xl">Student Account</h1>
          <p className="mt-1 text-gray-600">Financial information and account details</p>
        </div>
      </div>

      <div id="printable-content">
        {/* Fixed header for print that appears on all pages */}
        <div className="print-header">
          <Logo className="hidden print:block logo"/>
          <h1 className="mb-4 font-semibold text-gray-900 text-xl" style={{ color: '#008ea2' }}>Student Account Statement</h1>
        </div>

        <div className="print-content">
          <div className="gap-6 grid md:grid-cols-3 print-grid-3 mb-6 page-break-avoid print-margin-lr print-section">
            <div className="bg-white shadow-sm p-6 border-l-4 rounded-xl" style={{ borderLeftColor: '#008ea2' }}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="mb-1 text-gray-600 text-sm">Total Amount Due</p>
                  <p className="font-bold text-gray-900 text-2xl">
                    ₱{account.AcctTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="flex justify-center items-center rounded-lg w-12 h-12 no-print" style={{ backgroundColor: '#008ea220' }}>
                  <DollarSign className="w-6 h-6" style={{ color: '#008ea2' }} />
                </div>
              </div>
            </div>

            <div className="bg-white shadow-sm p-6 border-l-4 border-l-green-500 rounded-xl">
              <div className="flex justify-between items-center">
                <div>
                  <p className="mb-1 text-gray-600 text-sm">Total Payments</p>
                  <p className="font-bold text-gray-900 text-2xl">
                    ₱{account.TotalPayments.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="flex justify-center items-center bg-green-100 rounded-lg w-12 h-12 no-print">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white shadow-sm p-6 border-l-4 border-l-orange-500 rounded-xl">
              <div className="flex justify-between items-center">
                <div>
                  <p className="mb-1 text-gray-600 text-sm">Current Balance</p>
                  <p className="font-bold text-gray-900 text-2xl">
                    ₱{account.CurrentBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="flex justify-center items-center bg-orange-100 rounded-lg w-12 h-12 no-print">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-sm mb-6 p-6 rounded-xl page-break-avoid print-section">
            <div className="flex justify-between gap-6">
              <h2 className="mb-4 font-semibold text-gray-900 text-xl" style={{ color: '#008ea2' }}>
                Student Information
              </h2>
            
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
                <p className="font-semibold text-gray-900 text-sm">{account.StudentNumber}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-1 font-medium text-gray-600 text-xs">Name</p>
                <p className="font-semibold text-gray-900 text-sm">
                  {account.FirstName} {account.MiddleName} {account.LastName}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-1 font-medium text-gray-600 text-xs">Course</p>
                <p className="font-semibold text-gray-900 text-sm">{account.Course}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-1 font-medium text-gray-600 text-xs">Year Level</p>
                <p className="font-semibold text-gray-900 text-sm">{account.YearLevel}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-1 font-medium text-gray-600 text-xs">Status</p>
                <p className="font-semibold text-gray-900 text-sm">{account.Status}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-1 font-medium text-gray-600 text-xs">Section</p>
                <p className="font-semibold text-gray-900 text-sm">{account.Section}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-1 font-medium text-gray-600 text-xs">School Year</p>
                <p className="font-semibold text-gray-900 text-sm">{account.SY}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-1 font-medium text-gray-600 text-xs">Semester</p>
                <p className="font-semibold text-gray-900 text-sm">{account.Sem}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-1 font-medium text-gray-600 text-xs">Payment Mode</p>
                <p className="font-semibold text-gray-900 text-sm">{account.PaymentMode}</p>
              </div>
              {account.Term && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="mb-1 font-medium text-gray-600 text-xs">Term</p>
                  <p className="font-semibold text-gray-900 text-sm">{account.Term}</p>
                </div>
              )}
              {account.Email && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="mb-1 font-medium text-gray-600 text-xs">Email</p>
                  <p className="font-semibold text-gray-900 text-sm">{account.Email}</p>
                </div>
              )}
              {account.DateUpdated && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="mb-1 font-medium text-gray-600 text-xs">Last Updated</p>
                  <p className="font-semibold text-gray-900 text-sm">{account.DateUpdated}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white shadow-sm mb-6 p-6 rounded-xl page-break-avoid print-section">
            <h2 className="mb-4 font-semibold text-xl" style={{ color: '#008ea2' }}>Tuition & Laboratory Fees</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-white" style={{ backgroundColor: '#008ea2' }}>
                    <th className="px-4 py-3 font-semibold text-sm text-left">Description</th>
                    <th className="px-4 py-3 font-semibold text-sm text-right">Units</th>
                    <th className="px-4 py-3 font-semibold text-sm text-right">Rate</th>
                    <th className="px-4 py-3 font-semibold text-sm text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">Lecture Units</td>
                    <td className="px-4 py-3 text-sm text-right">{account.LecUnits}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      ₱{account.LecRate.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-sm text-right">
                      ₱{account.TotalLec.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">Laboratory Units</td>
                    <td className="px-4 py-3 text-sm text-right">{account.LabUnits}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      ₱{account.LabRate.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-sm text-right">
                      ₱{account.TotalLab.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  {account.TotalComputerUnits > 0 && (
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">Computer Lab Units</td>
                      <td className="px-4 py-3 text-sm text-right">{account.TotalComputerUnits}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        ₱{account.ComputerRates.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 font-semibold text-sm text-right">
                        ₱{account.TotalComputerCharges.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                  {account.TotalCulinaryUnits > 0 && (
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">Culinary Lab Units</td>
                      <td className="px-4 py-3 text-sm text-right">{account.TotalCulinaryUnits}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        ₱{account.CulinaryRates.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 font-semibold text-sm text-right">
                        ₱{account.TotalCulinaryCharges.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {hasOtherFees && (
            <div className="bg-white shadow-sm mb-6 p-6 rounded-xl page-break-before print-section">
              <h2 className="mb-4 font-semibold text-xl" style={{ color: '#008ea2' }}>Other Fees & Charges</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-white" style={{ backgroundColor: '#008ea2' }}>
                      <th className="px-4 py-3 font-semibold text-sm text-left">Description</th>
                      <th className="px-4 py-3 font-semibold text-sm text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {charges.map((charge, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{charge.desc}</td>
                        <td className="px-4 py-3 font-semibold text-sm text-right">
                          ₱{charge.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                    {account.RegFee > 0 && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">Registration Fee</td>
                        <td className="px-4 py-3 font-semibold text-sm text-right">
                          ₱{account.RegFee.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    )}
                    {account.InstallmentFee > 0 && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">Installment Fee</td>
                        <td className="px-4 py-3 font-semibold text-sm text-right">
                          ₱{account.InstallmentFee.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    )}
                    {account.Others > 0 && (
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">Others</td>
                        <td className="px-4 py-3 font-semibold text-sm text-right">
                          ₱{account.Others.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {discounts.length > 0 && (
            <div className="bg-white shadow-sm mb-6 p-6 rounded-xl page-break-avoid print-section">
              <h2 className="mb-4 font-semibold text-xl" style={{ color: '#008ea2' }}>Discounts Applied</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-white" style={{ backgroundColor: '#008ea2' }}>
                      <th className="px-4 py-3 font-semibold text-sm text-left">Description</th>
                      <th className="px-4 py-3 font-semibold text-sm text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {discounts.map((discount, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{discount.desc}</td>
                        <td className="px-4 py-3 font-semibold text-green-600 text-sm text-right">
                          -₱{discount.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="bg-white shadow-sm p-6 border-2 rounded-xl page-break-avoid print-margin-lr print-section" style={{ borderColor: '#008ea2' }}>
            <h2 className="mb-4 font-semibold text-xl" style={{ color: '#008ea2' }}>Account Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-gray-200 border-b">
                <span className="text-gray-700">Total Tuition</span>
                <span className="font-semibold">
                  ₱{(account.TotalLec + account.TotalLab).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-2 border-gray-200 border-b">
                <span className="text-gray-700">Total Fees</span>
                <span className="font-semibold">
                  ₱{account.TotalFees.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {account.OldAccount > 0 && (
                <div className="flex justify-between py-2 border-gray-200 border-b">
                  <span className="text-gray-700">Previous Balance</span>
                  <span className="font-semibold text-red-600">
                    ₱{account.OldAccount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-2 border-gray-200 border-b">
                <span className="text-gray-700">Total Discount ({account.DiscPercentage}%)</span>
                <span className="font-semibold text-green-600">
                  -₱{account.Discount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-3 border-t-2" style={{ borderTopColor: '#008ea2' }}>
                <span className="font-bold text-gray-900 text-lg">Total Amount Due</span>
                <span className="font-bold text-lg" style={{ color: '#008ea2' }}>
                  ₱{account.AcctTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-2 border-gray-200 border-b">
                <span className="text-gray-700">Total Payments</span>
                <span className="font-semibold text-green-600">
                  -₱{account.TotalPayments.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {account.Refund > 0 && (
                <div className="flex justify-between py-2 border-gray-200 border-b">
                  <span className="text-gray-700">Refund</span>
                  <span className="font-semibold text-green-600">
                    ₱{account.Refund.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-3 border-t-2 border-t-orange-500">
                <span className="font-bold text-gray-900 text-lg">Current Balance</span>
                <span className="font-bold text-orange-600 text-lg">
                  ₱{account.CurrentBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}