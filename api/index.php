<?php
// index.php - Main entry point
declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/core/Database.php';
require_once __DIR__ . '/core/Router.php';
require_once __DIR__ . '/core/Auth.php';
require_once __DIR__ . '/core/EmailService.php';
require_once __DIR__ . '/core/Validator.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/StudentController.php';
require_once __DIR__ . '/middleware/AuthMiddleware.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$router = new Router();

// Set the base path prefix - all routes will now be prefixed with this
// $router->setBasePath('/student-portal');

// Maintenance
$router->get('/api/clear-rate-limit-cache', [AuthController::class, 'clearRateLimitCache']);
$router->get('/api/clear-expired-tokens', [AuthController::class, 'clearExpiredTokensAndLoginAttempts']);

// Public routes
$router->post('/api/auth/register', [AuthController::class, 'register']);
$router->post('/api/auth/login', [AuthController::class, 'login']);
$router->post('/api/auth/forgot-password', [AuthController::class, 'forgotPassword']);
$router->post('/api/auth/resend-forgot-password', [AuthController::class, 'resendForgotPassword']);
$router->post('/api/auth/reset-password', [AuthController::class, 'resetPassword']);
$router->post('/api/auth/verify-email', [AuthController::class, 'verifyEmail']);
$router->post('/api/auth/resend-email-verification',[AuthController::class,'resendEmailVerification']);

// Protected routes (require authentication)
$router->get('/api/student/profile', [StudentController::class, 'getProfile'], [AuthMiddleware::class]);
$router->get('/api/student/grades', [StudentController::class, 'getGrades'], [AuthMiddleware::class]);
$router->get('/api/student/account', [StudentController::class, 'getAccount'], [AuthMiddleware::class]);
$router->post('/api/auth/logout', [AuthController::class, 'logout'], [AuthMiddleware::class]);
$router->post('/api/auth/refresh', [AuthController::class, 'refresh'], [AuthMiddleware::class]);

try {
    $router->dispatch();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error',
        'error' => DEBUG_MODE ? $e->getMessage() : null
    ]);
}