<?php
// controllers/StudentController.php
declare(strict_types=1);

class StudentController {
    private function response(bool $success, string $message, array $data = [], int $code = 200): void {
        http_response_code($code);
        echo json_encode(array_merge(['success' => $success, 'message' => $message], $data));
        exit;
    }
    
    private function getAuthenticatedStudent(): string {
        return $GLOBALS['authenticated_student'] ?? '';
    }
    
    public function getProfile(): void {
        $studentNumber = $this->getAuthenticatedStudent();
        
        // Get student info from grades table (most complete data)
        $student = Database::fetch(
            "SELECT 
                StudentNumber,
                FirstName,
                MiddleName,
                LastName,
                Birthday,
                BirthPlace,
                Course,
                YearLevel
             FROM grades 
             WHERE StudentNumber = ?
             ORDER BY SY DESC, Sem DESC
             LIMIT 1",
            [$studentNumber]
        );
        
        if (!$student) {
            $this->response(false, 'Student profile not found', [], 404);
        }
        
        // Get email from credentials
        $credentials = Database::fetch(
            "SELECT Email FROM student_credentials WHERE StudentNumber = ?",
            [$studentNumber]
        );
        
        $student['Email'] = $credentials['Email'] ?? null;
        
        $this->response(true, 'Profile retrieved successfully', [
            'profile' => $student
        ]);
    }
    
    public function getGrades(): void {
        $studentNumber = $this->getAuthenticatedStudent();
        $sy = $_GET['sy'] ?? null;
        $sem = $_GET['sem'] ?? null;

        $sql = "SELECT 
                    SubjectCode,
                    Description,
                    LecUnit,
                    LabUnit,
                    Instructor,
                    Section,
                    PGrade,
                    PreMid,
                    MGrade,
                    PreFinal,
                    FGrade,
                    Average,
                    Sem,
                    SY,
                    Status,
                    Equivalent,
                    CreditUnits,
                    GradeStatus,
                    YearLevel,
                    Remarks
                FROM grades 
                WHERE StudentNumber = ?";
        $params = [$studentNumber];

        if ($sy) {
            $sql .= " AND SY = ?";
            $params[] = $sy;
        }

        if ($sem) {
            $sql .= " AND Sem = ?";
            $params[] = $sem;
        }

        $sql .= " ORDER BY SY DESC, Sem DESC, SubjectCode ASC";
        $grades = Database::fetchAll($sql, $params);

        $periods = Database::fetchAll(
            "SELECT DISTINCT SY, Sem 
            FROM grades 
            WHERE StudentNumber = ? 
            ORDER BY SY DESC, Sem DESC",
            [$studentNumber]
        );

        $gpaData = [];
        foreach ($periods as $period) {
            $semGrades = Database::fetchAll(
                "SELECT Average, CreditUnits 
                FROM grades 
                WHERE StudentNumber = ? AND SY = ? AND Sem = ? AND Average > 0",
                [$studentNumber, $period['SY'], $period['Sem']]
            );

            $totalPoints = 0;
            $totalUnits = 0;

            foreach ($semGrades as $grade) {
                $totalPoints += $grade['Average'] * $grade['CreditUnits'];
                $totalUnits += $grade['CreditUnits'];
            }

            $gpa = $totalUnits > 0 ? round($totalPoints / $totalUnits, 2) : 0;

            $gpaData[] = [
                'sy' => $period['SY'],
                'sem' => $period['Sem'],
                'gpa' => $gpa,
                'units' => $totalUnits
            ];
        }

        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => 'Grades retrieved successfully',
            'data' => [
                'grades' => $grades,
                'periods' => $periods,
                'gpa_per_semester' => $gpaData,
                'total_records' => count($grades)
            ]
        ]);
    }

    
    public function getAccount(): void {
        $studentNumber = $this->getAuthenticatedStudent();
        $sy = $_GET['sy'] ?? null;
        $sem = $_GET['sem'] ?? null;

        $sql = "SELECT 
                    StudentNumber,
                    FirstName,
                    MiddleName,
                    LastName,
                    Course,
                    YearLevel,
                    Status,
                    LecUnits,
                    LecRate,
                    TotalLec,
                    LabUnits,
                    LabRate,
                    TotalLab,
                    OldAccount,
                    FeesDesc,
                    FeesAmount,
                    TotalFees,
                    DiscPercentage,
                    Discount,
                    AcctTotal,
                    TotalPayments,
                    CurrentBalance,
                    Sem,
                    SY,
                    Term,
                    Desc1, Amount1,
                    Desc2, Amount2,
                    Desc3, Amount3,
                    Desc4, Amount4,
                    Desc5, Amount5,
                    RegFee,
                    Section,
                    PaymentMode,
                    InstallmentFee,
                    DateUpdated,
                    Refund,
                    DiscDesc1, DiscAmount1,
                    DiscDesc2, DiscAmount2,
                    DiscDesc3, DiscAmount3,
                    DiscDesc4, DiscAmount4,
                    DiscDesc5, DiscAmount5,
                    Others
                FROM studeaccount 
                WHERE StudentNumber = ?";
        $params = [$studentNumber];

        if ($sy) {
            $sql .= " AND SY = ?";
            $params[] = $sy;
        }

        if ($sem) {
            $sql .= " AND Sem = ?";
            $params[] = $sem;
        }

        $sql .= " ORDER BY SY DESC, Sem DESC";
        $accounts = Database::fetchAll($sql, $params);

        $periods = Database::fetchAll(
            "SELECT DISTINCT SY, Sem 
            FROM studeaccount 
            WHERE StudentNumber = ? 
            ORDER BY SY DESC, Sem DESC",
            [$studentNumber]
        );

        $totalBalance = array_sum(array_column($accounts, 'CurrentBalance'));
        $totalPayments = array_sum(array_column($accounts, 'TotalPayments'));

        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => 'Account information retrieved successfully',
            'data' => [
                'accounts' => $accounts,
                'periods' => $periods,
                'summary' => [
                    'total_balance' => round($totalBalance, 2),
                    'total_payments' => round($totalPayments, 2)
                ],
                'total_records' => count($accounts)
            ]
        ]);
    }

}