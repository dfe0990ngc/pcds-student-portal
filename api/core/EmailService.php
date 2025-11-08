<?php
// core/EmailService.php
declare(strict_types=1);

class EmailService {
    private string $smtpHost;
    private int $smtpPort;
    private string $smtpUser;
    private string $smtpPass;
    private string $fromEmail;
    private string $fromName;
    private string $lastError = '';
    
    public function __construct() {
        // Validate constants exist
        if (!defined('SMTP_HOST') || !defined('SMTP_PORT') || 
            !defined('SMTP_FROM') || !defined('SMTP_FROM_NAME')) {
            throw new Exception('SMTP configuration constants are not defined');
        }
        
        $this->smtpHost = SMTP_HOST;
        $this->smtpPort = (int)SMTP_PORT;
        $this->smtpUser = defined('SMTP_USER') ? SMTP_USER : '';
        $this->smtpPass = defined('SMTP_PASS') ? SMTP_PASS : '';
        $this->fromEmail = SMTP_FROM;
        $this->fromName = SMTP_FROM_NAME;
        
        // Validate configuration (allow empty user/pass for Mailpit)
        if (empty($this->smtpHost) || empty($this->fromEmail)) {
            throw new Exception('SMTP configuration is incomplete');
        }
    }
    
    /**
     * Get last error message
     */
    public function getLastError(): string {
        return $this->lastError;
    }
    
    /**
     * Send email using PHP mail() function with SMTP
     */
    public function send(string $to, string $subject, string $htmlBody, string $plainTextBody = ''): bool {
        try {
            // Validate email address
            if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
                $this->lastError = "Invalid email address: {$to}";
                error_log($this->lastError);
                return false;
            }
            
            // Create boundary for multipart email
            $boundary = md5(uniqid((string)time()));
            
            // Headers
            $headers = [
                "From: {$this->fromName} <{$this->fromEmail}>",
                "Reply-To: {$this->fromEmail}",
                "MIME-Version: 1.0",
                "Content-Type: multipart/alternative; boundary=\"{$boundary}\"",
                "X-Mailer: PHP/" . phpversion()
            ];
            
            // Email body
            $body = $this->buildMultipartBody($boundary, $plainTextBody ?: strip_tags($htmlBody), $htmlBody);
            
            // Send email
            $result = @mail($to, $subject, $body, implode("\r\n", $headers));
            
            if (!$result) {
                $this->lastError = "mail() function failed. Check server mail configuration.";
                error_log($this->lastError);
                
                // Try SMTP as fallback
                error_log("Attempting to send via SMTP as fallback...");
                return $this->sendViaSMTP($to, $subject, $htmlBody, $plainTextBody);
            }
            
            return true;
        } catch (Exception $e) {
            $this->lastError = "Email send failed: " . $e->getMessage();
            error_log($this->lastError);
            return false;
        }
    }

    
    /**
     * Send email using socket connection (more reliable for SMTP)
     */
    public function sendViaSMTP(string $to, string $subject, string $htmlBody, string $plainTextBody = ''): bool {
        $socket = null;
        try {
            // Validate email address
            if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
                $this->lastError = "Invalid email address: {$to}";
                error_log($this->lastError);
                return false;
            }
            
            error_log("Attempting to send email to {$to} via {$this->smtpHost}:{$this->smtpPort}");
            
            // Determine if we need SSL/TLS
            $protocol = '';
            if ($this->smtpPort == 465) {
                $protocol = 'ssl://';
                error_log("Using SSL connection for port 465");
            } elseif ($this->smtpPort == 587) {
                error_log("Port 587 detected - will use STARTTLS");
            }
            
            // Connect to SMTP server with SSL if needed
            $context = stream_context_create([
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                ]
            ]);
            
            $socket = @stream_socket_client(
                "{$protocol}{$this->smtpHost}:{$this->smtpPort}",
                $errno,
                $errstr,
                30,
                STREAM_CLIENT_CONNECT,
                $context
            );
            
            if (!$socket) {
                $this->lastError = "Failed to connect to SMTP server {$this->smtpHost}:{$this->smtpPort} - $errstr ($errno)";
                error_log($this->lastError);
                return false;
            }
            
            error_log("Connected to SMTP server");
            
            // Set timeout
            stream_set_timeout($socket, 30);
            
            // Read server greeting
            $response = $this->readSMTPResponse($socket);
            error_log("Server greeting: {$response}");
            
            if (!$this->isSuccessResponse($response)) {
                throw new Exception("SMTP connection failed: {$response}");
            }
            
            // EHLO
            fputs($socket, "EHLO {$this->smtpHost}\r\n");
            $response = $this->readSMTPResponse($socket);
            error_log("EHLO response: {$response}");
            
            if (!$this->isSuccessResponse($response)) {
                throw new Exception("EHLO failed: {$response}");
            }
            
            // STARTTLS for port 587
            if ($this->smtpPort == 587) {
                error_log("Starting TLS negotiation...");
                fputs($socket, "STARTTLS\r\n");
                $response = $this->readSMTPResponse($socket);
                error_log("STARTTLS response: {$response}");
                
                if (!$this->isSuccessResponse($response)) {
                    throw new Exception("STARTTLS failed: {$response}");
                }
                
                // Enable crypto
                if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                    throw new Exception("Failed to enable TLS encryption");
                }
                
                error_log("TLS enabled successfully");
                
                // Send EHLO again after STARTTLS
                fputs($socket, "EHLO {$this->smtpHost}\r\n");
                $response = $this->readSMTPResponse($socket);
                error_log("EHLO after TLS response: {$response}");
            }
            
            // AUTH LOGIN (if credentials provided)
            if (!empty($this->smtpUsername) && !empty($this->smtpPassword)) {
                error_log("Authenticating with username: {$this->smtpUsername}");
                
                fputs($socket, "AUTH LOGIN\r\n");
                $response = $this->readSMTPResponse($socket);
                error_log("AUTH LOGIN response: {$response}");
                
                if (!$this->isSuccessResponse($response)) {
                    throw new Exception("AUTH LOGIN failed: {$response}");
                }
                
                // Send username
                fputs($socket, base64_encode($this->smtpUsername) . "\r\n");
                $response = $this->readSMTPResponse($socket);
                error_log("Username response: {$response}");
                
                if (!$this->isSuccessResponse($response)) {
                    throw new Exception("Username authentication failed: {$response}");
                }
                
                // Send password
                fputs($socket, base64_encode($this->smtpPassword) . "\r\n");
                $response = $this->readSMTPResponse($socket);
                error_log("Password response: {$response}");
                
                if (!$this->isSuccessResponse($response)) {
                    throw new Exception("Password authentication failed: {$response}");
                }
                
                error_log("Authentication successful");
            } else {
                error_log("Skipping authentication (no credentials provided)");
            }
            
            // MAIL FROM
            fputs($socket, "MAIL FROM: <{$this->fromEmail}>\r\n");
            $response = $this->readSMTPResponse($socket);
            error_log("MAIL FROM response: {$response}");
            
            if (!$this->isSuccessResponse($response)) {
                throw new Exception("MAIL FROM failed: {$response}");
            }
            
            // RCPT TO
            fputs($socket, "RCPT TO: <{$to}>\r\n");
            $response = $this->readSMTPResponse($socket);
            error_log("RCPT TO response: {$response}");
            
            if (!$this->isSuccessResponse($response)) {
                throw new Exception("RCPT TO failed: {$response}");
            }
            
            // DATA
            fputs($socket, "DATA\r\n");
            $response = $this->readSMTPResponse($socket);
            error_log("DATA response: {$response}");
            
            if (!$this->isSuccessResponse($response)) {
                throw new Exception("DATA command failed: {$response}");
            }
            
            // Email content
            $boundary = md5(uniqid((string)time()));
            $message = $this->buildEmailMessage($to, $subject, $htmlBody, $plainTextBody, $boundary);
            
            fputs($socket, $message);
            fputs($socket, "\r\n.\r\n");
            $response = $this->readSMTPResponse($socket);
            error_log("Message send response: {$response}");
            
            if (!$this->isSuccessResponse($response)) {
                throw new Exception("Message sending failed: {$response}");
            }
            
            // QUIT
            fputs($socket, "QUIT\r\n");
            fclose($socket);
            
            error_log("✅ Email sent successfully to {$to}");
            return true;
            
        } catch (Exception $e) {
            $this->lastError = "SMTP send failed: " . $e->getMessage();
            error_log($this->lastError);
            
            if ($socket && is_resource($socket)) {
                @fclose($socket);
            }
            
            return false;
        }
    }

    /**
     * Check if SMTP response indicates success
     */
    private function isSuccessResponse(string $response): bool {
        // SMTP success codes are 2xx and 3xx
        return preg_match('/^[23]\d{2}/', $response) === 1;
    }
    
    private function readSMTPResponse($socket): string {
        $response = '';
        $startTime = time();
        
        while ($line = fgets($socket, 515)) {
            $response .= $line;
            
            // Check for timeout
            if (time() - $startTime > 30) {
                throw new Exception("SMTP response timeout");
            }
            
            // Check if this is the last line (code followed by space)
            if (isset($line[3]) && $line[3] == ' ') {
                break;
            }
        }
        
        return trim($response);
    }
    
    private function buildMultipartBody(string $boundary, string $plainText, string $html): string {
        $body = "--{$boundary}\r\n";
        $body .= "Content-Type: text/plain; charset=UTF-8\r\n";
        $body .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
        $body .= $plainText . "\r\n\r\n";
        
        $body .= "--{$boundary}\r\n";
        $body .= "Content-Type: text/html; charset=UTF-8\r\n";
        $body .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
        $body .= $html . "\r\n\r\n";
        
        $body .= "--{$boundary}--";
        
        return $body;
    }
    
    private function buildEmailMessage(string $to, string $subject, string $html, string $plainText, string $boundary): string {
        $message = "From: {$this->fromName} <{$this->fromEmail}>\r\n";
        $message .= "To: <{$to}>\r\n";
        $message .= "Subject: {$subject}\r\n";
        $message .= "MIME-Version: 1.0\r\n";
        $message .= "Content-Type: multipart/alternative; boundary=\"{$boundary}\"\r\n\r\n";
        
        $message .= $this->buildMultipartBody($boundary, $plainText ?: strip_tags($html), $html);
        
        return $message;
    }
    
    /**
     * Send verification email
     */
    public function sendVerificationEmail(string $email, string $token, string $studentName): bool {
        $subject = "Verify Your Email - Student Portal";
        $htmlBody = $this->getVerificationEmailTemplate($studentName, $token);
        
        $plainTextBody = "Hello {$studentName},\n\n"
            . "Thank you for registering with Student Portal. We're excited to have you on board!\n\n"
            . "To complete your registration and access all portal features, please use the following verification code:\n\n"
            . "Verification Code: {$token}\n\n"
            . "Simply enter this code when prompted in the Student Portal to activate your account.\n\n"
            . "This verification code will expire in 24 hours.\n\n"
            . "If you did not create an account with Student Portal, please disregard this email.\n\n"
            . "Best regards,\n"
            . "Student Portal Team";
        
        // Try sendViaSMTP first (more reliable), fallback to send()
        $result = $this->sendViaSMTP($email, $subject, $htmlBody, $plainTextBody);
        
        if (!$result) {
            error_log("SMTP failed for verification email, error: " . $this->getLastError());
        }
        
        return $result;
    }
    
    /**
     * Send password reset email
     */
    public function sendPasswordResetEmail(string $email, string $token, string $studentName): bool {
        
        $subject = "Reset Your Password - Student Portal";
        
        $htmlBody = $this->getPasswordResetEmailTemplate($studentName, $token);
        
        $plainTextBody = "Hello {$studentName},\n\n"
            . "We received a request to reset the password for your Student Portal account.\n\n"
            . "To create a new password, please use the following reset code:\n"
            . "{$token}\n\n"
            . "This password reset link will expire in 1 hour.\n\n"
            . "SECURITY NOTICE:\n"
            . "If you did not request a password reset, please disregard this email. Your account remains secure, and no changes have been made. For additional security concerns, please contact our support team immediately.\n\n"
            . "Best regards,\n"
            . "Student Portal Team";
        
        return $this->send($email, $subject, $htmlBody, $plainTextBody);
    }
    
    /**
     * Send welcome email after verification
     */
    public function sendWelcomeEmail(string $email, string $studentName): bool {
        $loginUrl = FRONTEND_URL . "/login";
        
        $subject = "Welcome to PCDS - Student Portal!";
        
        $htmlBody = $this->getWelcomeEmailTemplate($studentName, $loginUrl);
        
        $plainTextBody = "Hello {$studentName},\n\n"
            . "Welcome to PCDS - Student Portal!\n\n"
            . "Your email has been successfully verified. You now have complete access to all Student Portal features and services.\n\n"
            . "Access your dashboard here: {$loginUrl}\n\n"
            . "What you can do now:\n"
            . "- View your grades and calculate your GPA by semester\n"
            . "- Check your account balance and review payment history\n"
            // . "- Update and manage your profile information\n"
            . "- Download academic reports and transcripts\n"
            // . "- Manage your account security settings\n\n"
            . "If you have any questions or need assistance getting started, please don't hesitate to reach out to our support team.\n\n"
            . "Best regards,\n"
            . "PCDS - Student Portal Team";
        
        return $this->send($email, $subject, $htmlBody, $plainTextBody);
    }
    
    /**
     * Email template for verification
     */
    private function getVerificationEmailTemplate(string $name, string $token): string {
        // Logo URL - use your actual logo URL
        $logoUrl = APP_URL . '/logo-120.png'; // Update this path
        
        return <<<HTML
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <!-- Header with Logo -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: left;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td width="20%" style="vertical-align: middle;text-align: left;">
                                            <img src="{$logoUrl}" alt="Student Portal Logo" style="max-width: 96px; height: auto;">
                                        </td>
                                        <td width="80%" style="vertical-align: middle;text-align: left;">
                                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">PCDS - Student Portal</h1>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        
                        <!-- Body -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Verify Your Email Address</h2>
                                
                                <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                    Hello <strong>{$name}</strong>,
                                </p>
                                
                                <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                    Thank you for registering with Student Portal. We're excited to have you on board!
                                </p>
                                
                                <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                    To complete your registration and access all portal features, please verify your email address using the verification code below:
                                </p>
                                
                                <!-- OTP Code -->
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td align="center" style="padding: 20px 0 30px 0;">
                                            <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px 40px; border-radius: 8px;">
                                                <p style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">{$token}</p>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                                
                                <p style="margin: 0 0 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                    Simply enter this verification code when prompted in the Student Portal to activate your account.
                                </p>
                                
                                <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px;">
                                    <p style="margin: 0; color: #856404; font-size: 14px;">
                                        <strong>⏱️ This verification code will expire in 24 hours.</strong>
                                    </p>
                                </div>
                                
                                <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                    If you did not create an account with Student Portal, please disregard this email.
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                                <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px;">
                                    This is an automated message. Please do not reply to this email.
                                </p>
                                <p style="margin: 0; color: #999999; font-size: 12px;">
                                    © 2025 PCDS - Student Portal. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    HTML;
    }
    
    /**
     * Email template for password reset
     */
    private function getPasswordResetEmailTemplate(string $name, string $code): string {
    // Logo URL - use your actual logo URL
    $logoUrl = APP_URL . '/logo-120.png'; // Update this path
    
    return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header with Logo -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: left;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td width="20%" style="vertical-align: middle;text-align: left;">
                                        <img src="{$logoUrl}" alt="Student Portal Logo" style="max-width: 96px; height: auto;">
                                    </td>
                                    <td width="80%" style="vertical-align: middle;text-align: left;">
                                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">PCDS - Student Portal</h1>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Password Reset Request</h2>
                            
                            <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                Hello <strong>{$name}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                We received a request to reset the password for your Student Portal account.
                            </p>
                            
                            <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                To reset your password, please use the verification code below:
                            </p>
                            
                            <!-- Reset Code -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 20px 0 30px 0;">
                                        <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px 40px; border-radius: 8px;">
                                            <p style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">{$code}</p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                Simply enter this verification code on the password reset page to create your new password.
                            </p>
                            
                            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px;">
                                <p style="margin: 0; color: #856404; font-size: 14px;">
                                    <strong>⏱️ This verification code will expire in 1 hour.</strong>
                                </p>
                            </div>
                            
                            <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin-bottom: 20px;">
                                <p style="margin: 0; color: #721c24; font-size: 14px; font-weight: bold;">
                                    🔒 Security Notice
                                </p>
                                <p style="margin: 10px 0 0 0; color: #721c24; font-size: 13px; line-height: 1.6;">
                                    If you did not request a password reset, please disregard this email. Your account remains secure, and no changes have been made.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px;">
                                This is an automated message. Please do not reply to this email.
                            </p>
                            <p style="margin: 0; color: #999999; font-size: 12px;">
                                © 2025 PCDS - Student Portal. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
HTML;
}
    
    /**
     * Email template for welcome message
     */
    private function getWelcomeEmailTemplate(string $name, string $loginUrl): string {
        // Logo URL - use your actual logo URL
        $logoUrl = APP_URL . '/logo-120.png'; // Update this path

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Student Portal</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 20px; text-align: left;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td width="20%" style="vertical-align: middle;text-align: left;">
                                        <img src="{$logoUrl}" alt="Student Portal Logo" style="max-width: 96px; height: auto;">
                                    </td>
                                    <td width="80%" style="vertical-align: middle;text-align: left;">
                                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🎉 Welcome!</h1>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Welcome to PCDS - Student Portal</h2>
                            
                            <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                Hello <strong>{$name}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                Your email has been successfully verified! You now have complete access to all Student Portal features and services.
                            </p>
                            
                            <!-- Features Box -->
                            <div style="background-color: #f8f9fa; border-radius: 6px; padding: 25px; margin-bottom: 30px;">
                                <h3 style="margin: 0 0 15px 0; color: #333333; font-size: 18px;">What you can do now:</h3>
                                <ul style="margin: 0; padding-left: 20px; color: #666666; font-size: 15px; line-height: 1.8;">
                                    <li>📊 View your grades and calculate your GPA by semester</li>
                                    <li>💰 Check your account balance and review payment history</li>
                                    <!-- <li>👤 Update and manage your profile information</li> -->
                                    <li>📄 Download academic reports and transcripts</li>
                                    <!-- <li>🔒 Manage your account security settings</li> -->
                                </ul>
                            </div>
                            
                            <!-- Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 0 0 30px 0;">
                                        <a href="{$loginUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">Access Dashboard</a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                If you have any questions or need assistance getting started, please don't hesitate to reach out to our support team.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px;">
                                Need help? Contact us at info@pcds.edu.ph
                            </p>
                            <p style="margin: 0; color: #999999; font-size: 12px;">
                                © 2025 PCDS - Student Portal. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
HTML;
    }
}