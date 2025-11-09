<?php
// controllers/AuthController.php
declare(strict_types=1);

class AuthController {
    private function getJsonInput(): array {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }
    
    private function response(bool $success, string $message, array $data = [], int $code = 200): void {
        http_response_code($code);
        echo json_encode(array_merge(['success' => $success, 'message' => $message], $data));
        exit;
    }
    
    public function register(): void {
        $input = $this->getJsonInput();
        
        // Rate limiting
        $ip = $_SERVER['REMOTE_ADDR'];
        if (!Auth::checkRateLimit("register:{$ip}", 5, 3600)) {
            $this->response(false, 'Too many registration attempts. Try again later after an hour.', [], 429);
        }
        
        // Validate input
        $validator = new Validator();
        if (!$validator->validate($input, [
            'studentNumber' => 'required|alphanumeric',
            'firstName' => 'required|min:1',
            'lastName' => 'required|min:1',
            'birthday' => 'required|date',
            'email' => 'required|email',
            'password' => 'required|min:8',
            'confirmPassword' => 'required|same:password'
        ])) {
            $this->response(false, $validator->getFirstError(), ['errors' => $validator->getErrors()], 422);
        }
        
        // Sanitize inputs
        $studentNumber = Validator::sanitize($input['studentNumber']);
        $firstName = Validator::sanitize($input['firstName']);
        $lastName = Validator::sanitize($input['lastName']);
        $birthday = Validator::sanitize($input['birthday']);
        $email = filter_var($input['email'], FILTER_VALIDATE_EMAIL);
        
        // Check if already registered
        $existing = Database::fetch(
            "SELECT StudentNumber FROM student_credentials WHERE StudentNumber = ?",
            [$studentNumber]
        );
        
        if ($existing) {
            $this->response(false, 'This student number is already bound to another email', [], 409);
        }
        
        // Verify student exists in grades table with matching details
        $student = Database::fetch(
            "SELECT StudentNumber, FirstName, LastName, Birthday 
            FROM grades 
            WHERE StudentNumber = ? 
            AND LOWER(TRIM(FirstName)) = LOWER(?) 
            AND LOWER(TRIM(LastName)) = LOWER(?)
            AND Birthday = ?
            LIMIT 1",
            [$studentNumber, $firstName, $lastName, $birthday]
        );
        
        if (!$student) {
            $this->response(false, 'Your record haven\'t uploaded yet. You can register again later.', [], 404);
        }
        
        // Check if email already used
        $emailExists = Database::fetch(
            "SELECT Email FROM student_credentials WHERE Email = ?",
            [$email]
        );
        
        if ($emailExists) {
            $this->response(false, 'Email already registered', [], 409);
        }
        
        // Create credential record
        $verificationToken = Auth::generateVerificationToken();
        $passwordHash = Auth::hashPassword($input['password']);
        
        Database::insert('student_credentials', [
            'StudentNumber' => $studentNumber,
            'Email' => $email,
            'PasswordHash' => $passwordHash,
            'IsVerified' => 0,
            'VerificationToken' => $verificationToken,
            'CreatedAt' => date('Y-m-d H:i:s')
        ]);

        // Send verification email with proper error handling
        $emailSent = false;
        $emailError = '';
        
        try {
            $emailService = new EmailService();
            $emailSent = $emailService->sendVerificationEmail($email, $verificationToken, $firstName);
            
            if (!$emailSent) {
                $emailError = $emailService->getLastError();
            }
        } catch (Exception $e) {
            $emailError = $e->getMessage();
            error_log("EmailService Exception: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
        }

        // IMPORTANT: Always respond, don't have multiple response paths
        if (!$emailSent) {
            error_log("Failed to send verification email to {$email}: {$emailError}");
            
            $this->response(true, 'Registration successful. However, we had trouble sending the verification email. Please check your spam folder or contact support.', [
                'verification_required' => true,
                'email' => $email,
                'email_sent' => false
            ], 201);
            return; // Exit after response
        }

        // Only reached if email sent successfully
        $this->response(true, 'Registration successful. Please check your email to verify your account.', [
            'verification_required' => true,
            'email' => $email,
            'email_sent' => true
        ], 201);
    }

    public function resendEmailVerification(): void {
        $input = $this->getJsonInput();
        
        // Rate limiting
        $ip = $_SERVER['REMOTE_ADDR'];
        if (!Auth::checkRateLimit("register:{$ip}", 5, 180)) {
            $this->response(false, 'Too many resend attempts. Try again later after 3 minutes.', [], 429);
        }
        
        // Validate input
        $validator = new Validator();
        if (!$validator->validate($input, [
            'email' => 'required|email',
        ])) {
            $this->response(false, $validator->getFirstError(), ['errors' => $validator->getErrors()], 422);
        }
        
        // Sanitize inputs
        $email = filter_var($input['email'], FILTER_VALIDATE_EMAIL);
        
        // Check if already registered
        $user = Database::fetch(
            "SELECT StudentNumber, VerificationToken FROM student_credentials WHERE Email = ?",
            [$email]
        );

        if(!$user){
            $this->response(false, 'Your email cannot be found in our database.', [], 404);
            return; // Exit after response
        }

        $student = Database::fetch(
            "SELECT StudentNumber, FirstName, LastName, Birthday 
            FROM grades 
            WHERE StudentNumber = ?
            LIMIT 1",
            [$user['StudentNumber']]
        );

        // Send verification email with proper error handling
        $emailSent = false;
        $emailError = '';
        
        try {
            $emailService = new EmailService();
            $emailSent = $emailService->sendVerificationEmail($email, $user['VerificationToken'], $student['FirstName']);
            
            if (!$emailSent) {
                $emailError = $emailService->getLastError();
            }
        } catch (Exception $e) {
            $emailError = $e->getMessage();
            error_log("EmailService Exception: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
        }

        // IMPORTANT: Always respond, don't have multiple response paths
        if (!$emailSent) {
            error_log("Failed to send verification email to {$email}: {$emailError}");
            
            $this->response(false, 'We had trouble sending the verification email. Please check your spam folder or contact support.', [
                'verification_required' => true,
                'email' => $email,
                'email_sent' => false
            ], 200);
            return; // Exit after response
        }

        // Only reached if email sent successfully
        $this->response(true, 'Verification Code sent! Please check your email inbox/spam folder.', [
            'verification_required' => true,
            'email' => $email,
            'email_sent' => true
        ], 200);
    }
    
    public function login(): void {
        $input = $this->getJsonInput();
        
        // Rate limiting
        $ip = $_SERVER['REMOTE_ADDR'];
        if (!Auth::checkRateLimit("login:{$ip}", LOGIN_RATE_LIMIT, LOGIN_RATE_WINDOW)) {
            $this->response(false, 'Too many login attempts. Try again later.', [], 429);
        }
        
        // Validate
        $validator = new Validator();
        if (!$validator->validate($input, [
            'email' => 'required|email',
            'password' => 'required'
        ])) {
            $this->response(false, $validator->getFirstError(), [], 422);
        }
        
        $email = filter_var($input['email'], FILTER_VALIDATE_EMAIL);
        
        // Fetch user
        $user = Database::fetch(
            "SELECT StudentNumber, Email, PasswordHash, IsVerified 
             FROM student_credentials 
             WHERE Email = ?",
            [$email]
        );
        
        if (!$user || !Auth::verifyPassword($input['password'], $user['PasswordHash'])) {
            $this->response(false, 'Invalid email or password', [], 401);
        }
        
        if (!$user['IsVerified']) {
            $this->response(false, 'Please verify your email before logging in', [
                'verification_required' => true,
            ], 403);
        }
        
        // Generate tokens
        $accessToken = Auth::generateToken($user['StudentNumber']);
        $refreshToken = Auth::generateRefreshToken();
        
        // Store refresh token
        Database::insert('refresh_tokens', [
            'StudentNumber' => $user['StudentNumber'],
            'Token' => hash('sha256', $refreshToken),
            'ExpiresAt' => date('Y-m-d H:i:s', time() + REFRESH_TOKEN_EXPIRY),
            'CreatedAt' => date('Y-m-d H:i:s')
        ]);
        
        // Update last login
        Database::update(
            'student_credentials',
            ['LastLogin' => date('Y-m-d H:i:s')],
            'StudentNumber = :student_number',
            ['student_number' => $user['StudentNumber']]
        );
        
        $this->response(true, 'Login successful', [
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'token_type' => 'Bearer',
            'expires_in' => JWT_EXPIRY,
            'StudentNumber' => $user['StudentNumber']
        ]);
    }
    
    public function forgotPasswordOld(): void {
        $input = $this->getJsonInput();
        
        $validator = new Validator();
        if (!$validator->validate($input, ['email' => 'required|email'])) {
            $this->response(false, $validator->getFirstError(), [], 422);
        }
        
        $email = filter_var($input['email'], FILTER_VALIDATE_EMAIL);
        
        $user = Database::fetch(
            "SELECT StudentNumber, Email FROM student_credentials WHERE Email = ?",
            [$email]
        );
        
        // Always return success to prevent email enumeration
        if (!$user) {
            $this->response(true, 'If email exists, password reset link has been sent');
        }

        $student = Database::fetch(
            "SELECT FirstName FROM grades WHERE StudentNumber = ? LIMIT 1",
            [$user['StudentNumber']]
        );

        if(!$student){
            $student = Database::fetch(
                "SELECT FirstName FROM studeaccount WHERE StudentNumber = ? LIMIT 1",
                [$user['StudentNumber']]
            );
        }
        
        $resetToken = Auth::generateVerificationToken();
        
        Database::update(
            'student_credentials',
            ['ResetToken' => $resetToken],
            'StudentNumber = :student_number',
            ['student_number' => $user['StudentNumber']]
        );

        // Send verification email with proper error handling
        $emailSent = false;
        $emailError = '';
        
        try {
            $emailService = new EmailService();
            $emailSent = $emailService->sendPasswordResetEmail($email, $resetToken,$student['FirstName']);
            
            if (!$emailSent) {
                $emailError = $emailService->getLastError();
            }
        } catch (Exception $e) {
            $emailError = $e->getMessage();
            error_log("EmailService Exception: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
        }

        // IMPORTANT: Always respond, don't have multiple response paths
        if (!$emailSent) {
            error_log("Failed to send reset code to {$email}: {$emailError}");
            
            $this->response(false, 'We had trouble sending the reset code to your email. Please check your spam folder or contact support.', [
                'verification_required' => true,
                'email' => $email,
                'email_sent' => false
            ], 200);
            return; // Exit after response
        }

        // Only reached if email sent successfully
        $this->response(true, 'Reset Code sent! Please check your email inbox/spam folder.', [
            'verification_required' => true,
            'email' => $email,
            'email_sent' => true
        ], 200);
    }

    public function forgotPassword(): void {
        $input = $this->getJsonInput();
        
        $validator = new Validator();
        if (!$validator->validate($input, ['email' => 'required|email'])) {
            $this->response(false, $validator->getFirstError(), [], 422);
        }
        
        $email = filter_var($input['email'], FILTER_VALIDATE_EMAIL);
        
        $userInCreds = true;
        $user = Database::fetch(
            "SELECT StudentNumber, Email FROM student_credentials WHERE Email = ? LIMIT 1",
            [$email]
        );
        
        if (!$user) {

            $user = Database::fetch(
                "SELECT StudentNumber, Email FROM studeaccount WHERE Email = ? LIMIT 1",
                [$email]
            );

            $userInCreds = false;
        }

        if(!$user){
            $this->response(false, 'Your email is not yet exists in our database.');
        }

        $student = Database::fetch(
            "SELECT FirstName FROM grades WHERE StudentNumber = ? LIMIT 1",
            [$user['StudentNumber']]
        );

        if(!$student){
            $student = Database::fetch(
                "SELECT FirstName FROM studeaccount WHERE StudentNumber = ? LIMIT 1",
                [$user['StudentNumber']]
            );
        }
        
        $resetToken = Auth::generateVerificationToken();
        
        if($userInCreds){
            Database::update(
                'student_credentials',
                ['ResetToken' => $resetToken],
                'StudentNumber = :student_number',
                ['student_number' => $user['StudentNumber']]
            );
        }else{
            
            $passwordHash = Auth::hashPassword('password1234');
            
            Database::insert('student_credentials', [
                'StudentNumber' => $user['StudentNumber'],
                'Email' => $email,
                'PasswordHash' => $passwordHash,
                'IsVerified' => 1,
                'ResetToken' => $resetToken,
                'CreatedAt' => date('Y-m-d H:i:s'),
                'VerifiedAt' => date('Y-m-d H:i:s'),
            ]);
        }

        // Send verification email with proper error handling
        $emailSent = false;
        $emailError = '';
        
        try {
            $emailService = new EmailService();
            $emailSent = $emailService->sendPasswordResetEmail($email, $resetToken,$student['FirstName']);
            
            if (!$emailSent) {
                $emailError = $emailService->getLastError();
            }
        } catch (Exception $e) {
            $emailError = $e->getMessage();
            error_log("EmailService Exception: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
        }

        // IMPORTANT: Always respond, don't have multiple response paths
        if (!$emailSent) {
            error_log("Failed to send reset code to {$email}: {$emailError}");
            
            $this->response(false, 'We had trouble sending the reset code to your email. Please check your spam folder or contact support.', [
                'verification_required' => true,
                'email' => $email,
                'email_sent' => false
            ], 200);
            return; // Exit after response
        }

        // Only reached if email sent successfully
        $this->response(true, 'Reset Code sent! Please check your email inbox/spam folder.', [
            'verification_required' => true,
            'email' => $email,
            'email_sent' => true
        ], 200);
    }

    public function resendForgotPasswordOld(): void {
        $input = $this->getJsonInput();
        
        $validator = new Validator();
        if (!$validator->validate($input, ['email' => 'required|email'])) {
            $this->response(false, $validator->getFirstError(), [], 422);
        }
        
        $email = filter_var($input['email'], FILTER_VALIDATE_EMAIL);
        
        $user = Database::fetch(
            "SELECT StudentNumber, Email, ResetToken FROM student_credentials WHERE Email = ?",
            [$email]
        );
        
        // Always return success to prevent email enumeration
        if (!$user) {
            $this->response(true, 'If email exists, password reset link has been sent');
        }

        $student = Database::fetch(
            "SELECT FirstName FROM grades WHERE StudentNumber = ? LIMIT 1",
            [$user['StudentNumber']]
        );

        if(!$student){
            $student = Database::fetch(
                "SELECT FirstName FROM studeaccount WHERE StudentNumber = ? LIMIT 1",
                [$user['StudentNumber']]
            );
        }
        
        $resetToken = $user['ResetToken'];
        
        Database::update(
            'student_credentials',
            ['ResetToken' => $resetToken],
            'StudentNumber = :student_number',
            ['student_number' => $user['StudentNumber']]
        );

        // Send verification email with proper error handling
        $emailSent = false;
        $emailError = '';
        
        try {
            $emailService = new EmailService();
            $emailSent = $emailService->sendPasswordResetEmail($email, $resetToken,$student['FirstName'] ?? '');
            
            if (!$emailSent) {
                $emailError = $emailService->getLastError();
            }
        } catch (Exception $e) {
            $emailError = $e->getMessage();
            error_log("EmailService Exception: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
        }

        // IMPORTANT: Always respond, don't have multiple response paths
        if (!$emailSent) {
            error_log("Failed to ressend reset code to {$email}: {$emailError}");
            
            $this->response(false, 'We had trouble resending the reset code to your email. Please check your spam folder or contact support.', [
                'verification_required' => true,
                'email' => $email,
                'email_sent' => false
            ], 200);
            return; // Exit after response
        }

        // Only reached if email sent successfully
        $this->response(true, 'Reset Code resent! Please check your email inbox/spam folder.', [
            'verification_required' => true,
            'email' => $email,
            'email_sent' => true
        ], 200);
    }

    public function resendForgotPassword(): void {
        $input = $this->getJsonInput();
        
        $validator = new Validator();
        if (!$validator->validate($input, ['email' => 'required|email'])) {
            $this->response(false, $validator->getFirstError(), [], 422);
        }
        
        $email = filter_var($input['email'], FILTER_VALIDATE_EMAIL);
        
        $user = Database::fetch(
            "SELECT StudentNumber, Email, ResetToken FROM student_credentials WHERE Email = ? LIMIT 1",
            [$email]
        );
        
        if (!$user) {
            $this->response(false, 'Your email is not yet exists in our database.');
        }

        $student = Database::fetch(
            "SELECT FirstName FROM grades WHERE StudentNumber = ? LIMIT 1",
            [$user['StudentNumber']]
        );

        if(!$student){
            $student = Database::fetch(
                "SELECT FirstName FROM studeaccount WHERE StudentNumber = ? LIMIT 1",
                [$user['StudentNumber']]
            );
        }
        
        $resetToken = $user['ResetToken'];
    
        Database::update(
            'student_credentials',
            ['ResetToken' => $resetToken],
            'StudentNumber = :student_number',
            ['student_number' => $user['StudentNumber']]
        );

        // Send verification email with proper error handling
        $emailSent = false;
        $emailError = '';
        
        try {
            $emailService = new EmailService();
            $emailSent = $emailService->sendPasswordResetEmail($email, $resetToken,$student['FirstName'] ?? '');
            
            if (!$emailSent) {
                $emailError = $emailService->getLastError();
            }
        } catch (Exception $e) {
            $emailError = $e->getMessage();
            error_log("EmailService Exception: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
        }

        // IMPORTANT: Always respond, don't have multiple response paths
        if (!$emailSent) {
            error_log("Failed to ressend reset code to {$email}: {$emailError}");
            
            $this->response(false, 'We had trouble resending the reset code to your email. Please check your spam folder or contact support.', [
                'verification_required' => true,
                'email' => $email,
                'email_sent' => false
            ], 200);
            return; // Exit after response
        }

        // Only reached if email sent successfully
        $this->response(true, 'Reset Code resent successfully! Please check your email inbox/spam folder.', [
            'verification_required' => true,
            'email' => $email,
            'email_sent' => true
        ], 200);
    }
    
    public function resetPassword(): void {
        $input = $this->getJsonInput();
        
        $validator = new Validator();
        if (!$validator->validate($input, [
            'token' => 'required',
            'password' => 'required|min:8',
            'password_confirmation' => 'required|same:password'
        ])) {
            $this->response(false, $validator->getFirstError(), [], 422);
        }
        
        $token = Validator::sanitize($input['token']);
        
        $user = Database::fetch(
            "SELECT StudentNumber FROM student_credentials WHERE ResetToken = ?",
            [$token]
        );
        
        if (!$user) {
            $this->response(false, 'Invalid or expired reset token', [], 400);
        }
        
        $passwordHash = Auth::hashPassword($input['password']);
        
        Database::update(
            'student_credentials',
            [
                'PasswordHash' => $passwordHash,
                'ResetToken' => null
            ],
            'StudentNumber = :student_number',
            ['student_number' => $user['StudentNumber']]
        );
        
        $this->response(true, 'Password has been reset successfully');
    }
    
    public function verifyEmail(): void {
        $input = $this->getJsonInput();
        
        $validator = new Validator();
        if (!$validator->validate($input, ['token' => 'required'])) {
            $this->response(false, $validator->getFirstError(), [], 422);
        }
        
        $token = Validator::sanitize($input['token']);
        
        // Fetch user with verification token and creation timestamp
        $user = Database::fetch(
            "SELECT StudentNumber, CreatedAt, IsVerified FROM student_credentials 
            WHERE VerificationToken = ?",
            [$token]
        );
        
        if (!$user) {
            $this->response(false, 'Invalid verification token', [], 400);
        }
        
        // Check if already verified
        if ($user['IsVerified']) {
            $this->response(false, 'Email has already been verified', [], 400);
        }
        
        // Check if token has expired (24 hours from EMAIL_VERIFICATION_EXPIRY constant)
        $createdAt = strtotime($user['CreatedAt']);
        $currentTime = time();
        $expiryTime = $createdAt + EMAIL_VERIFICATION_EXPIRY; // 86400 seconds = 24 hours
        
        if ($currentTime > $expiryTime) {
            $this->response(false, 'Verification token has expired. Please request a new verification email.', [], 410);
        }
        
        // Update verification status
        Database::update(
            'student_credentials',
            [
                'IsVerified' => 1,
                'VerificationToken' => null,
                'VerifiedAt' => date('Y-m-d H:i:s') // Optional: track when verified
            ],
            'StudentNumber = :student_number',
            ['student_number' => $user['StudentNumber']]
        );
        
        // Optional: Send welcome email
        try {
            $student = Database::fetch(
                "SELECT Email, FirstName FROM student_credentials sc
                JOIN grades g ON sc.StudentNumber = g.StudentNumber
                WHERE sc.StudentNumber = ?
                LIMIT 1",
                [$user['StudentNumber']]
            );
            
            if ($student) {
                $emailService = new EmailService();
                $emailService->sendWelcomeEmail($student['Email'], $student['FirstName']);
            }
        } catch (Exception $e) {
            error_log("Failed to send welcome email: " . $e->getMessage());
            // Don't fail the verification if welcome email fails
        }
        
        $this->response(true, 'Email verified successfully. You can now log in to your account.', [
            'verified_at' => date('Y-m-d H:i:s')
        ]);
    }
    
    public function refresh(): void {
        $input = $this->getJsonInput();
        
        $validator = new Validator();
        if (!$validator->validate($input, ['refresh_token' => 'required'])) {
            $this->response(false, $validator->getFirstError(), [], 422);
        }
        
        $refreshToken = $input['refresh_token'];
        $tokenHash = hash('sha256', $refreshToken);
        
        $token = Database::fetch(
            "SELECT StudentNumber, ExpiresAt 
             FROM refresh_tokens 
             WHERE Token = ? AND ExpiresAt > NOW()",
            [$tokenHash]
        );
        
        if (!$token) {
            $this->response(false, 'Invalid or expired refresh token', [], 401);
        }
        
        $accessToken = Auth::generateToken($token['StudentNumber']);
        
        $this->response(true, 'Token refreshed', [
            'access_token' => $accessToken,
            'token_type' => 'Bearer',
            'expires_in' => JWT_EXPIRY
        ]);
    }
    
    public function logout(): void {
        $studentNumber = $GLOBALS['authenticated_student'] ?? null;
        
        if ($studentNumber) {
            // Delete all refresh tokens for this user
            Database::query(
                "DELETE FROM refresh_tokens WHERE StudentNumber = ?",
                [$studentNumber]
            );
        }
        
        $this->response(true, 'Logged out successfully');
    }

    public function clearRateLimitCache(): int {
        $files = glob(RATE_LIMIT_CACHE_PATH . '/*.json');
        $count = 0;
        foreach ($files as $file) {
            if (is_file($file)) {
                unlink($file);
                $count++;
            }
        }
        return $count;
    }
}