<?php
// config.php
declare(strict_types=1);

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'student_portal');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// Security Configuration
define('JWT_SECRET', '20dddabfd35b601723eff090046dbfb2624de1f29034f8799e2e8261928ab662');
define('JWT_ALGORITHM', 'HS256');
define('JWT_EXPIRY', 3600); // 1 hour
define('REFRESH_TOKEN_EXPIRY', 604800); // 7 days
define('PASSWORD_RESET_EXPIRY', 3600); // 1 hour
define('EMAIL_VERIFICATION_EXPIRY', 86400); // 24 hours

// Rate Limiting
define('RATE_LIMIT_REQUESTS', 100);
define('RATE_LIMIT_WINDOW', 3600);
define('LOGIN_RATE_LIMIT', 2);
define('LOGIN_RATE_WINDOW', 900);

// Email Configuration
// PROD
// define('SMTP_HOST', 'smtp.gmail.com');
// define('SMTP_PORT', 587);
// define('SMTP_USER', 'dfe0990ngc@gmail.com');
// define('SMTP_PASS', 'lasawubyvqbdfgrb');

// DEV - Mailpit
define('SMTP_HOST', 'localhost');
define('SMTP_PORT', 1025);
define('SMTP_USER', ''); // Changed from null to empty string
define('SMTP_PASS', ''); // Changed from null to empty string

define('SMTP_FROM', 'noreply@pcds.edu.ph');
define('SMTP_FROM_NAME', 'Student Portal');

// Application Configuration
define('APP_URL', 'http://localhost:8000');
define('FRONTEND_URL','http://localhost:5173');
define('DEBUG_MODE', true); // Set to true for development
define('TIMEZONE', 'Asia/Manila');

// Session Configuration
define('SESSION_LIFETIME', 1800);

date_default_timezone_set(TIMEZONE);

// Error reporting
if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
    ini_set('display_startup_errors', '1');
} else {
    error_reporting(0);
    ini_set('display_errors', '0');
}