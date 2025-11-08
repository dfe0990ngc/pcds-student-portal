# Lightweight PHP API Framework
### Secure PCDS - Student Portal API with JWT Authentication

## 📋 Features

✅ **Zero Dependencies** - Pure PHP 8.2+, no Composer required  
✅ **JWT Authentication** - Secure token-based auth  
✅ **Rate Limiting** - Built-in protection against brute force  
✅ **Password Security** - Argon2ID hashing  
✅ **Input Validation** - Comprehensive validation rules  
✅ **SQL Injection Protection** - PDO with prepared statements  
✅ **CORS Support** - Ready for frontend integration  
✅ **RESTful API** - Clean endpoint structure

---

## LINK
https://student-portal.pcds.edu.ph/

## 📁 Project Structure

```
/
├── index.php                    # Main entry point & router
├── config.php                   # Configuration settings
├── .htaccess                    # Apache rewrite rules
├── migrations.sql               # Database setup
│
├── core/
│   ├── Database.php            # PDO database wrapper
│   ├── Router.php              # HTTP router
│   ├── EmailService.php        # Email Feature
│   ├── Auth.php                # JWT & token management
│   └── Validator.php           # Input validation
│
├── middleware/
│   └── AuthMiddleware.php      # Auth protection
│
└── controllers/
    ├── AuthController.php      # Registration, login, etc.
    └── StudentController.php   # Student data endpoints
```

---

## 🚀 Installation

### 1. Upload Files to cPanel
Upload all files to your web directory (e.g., `/public_html/api/`)

### 2. Database Setup

Run the SQL migration script:
```sql
-- In phpMyAdmin, run migrations.sql
-- This creates: student_credentials, refresh_tokens, grades and studeaccounts tables
```

### 3. Configure Settings

Edit `config.php`:
```php
// Database
define('DB_HOST', 'localhost');
define('DB_NAME', 'db_kiosk');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_password');

// Security - IMPORTANT: Generate new secret!
define('JWT_SECRET', 'your-generated-secret-key');
// Generate with: php -r "echo bin2hex(random_bytes(32));"

// Email (for password reset)
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_USER', 'your-email@gmail.com');
define('SMTP_PASS', 'your-app-password');
```

### 4. Set Permissions
```bash
chmod 644 config.php
chmod 755 core/ controllers/ middleware/
```

---

## 🔌 API Endpoints

### Public Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "SecurePass123!"
}


Response Success:
{
  "success": true,
  "message": "Login successful",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "a1b2c3d4e5f6...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "StudentNumber": "2025-00001"
}

Response Error:
{
  "success": false,
  "message": "Please verify your email before logging in",
  "verification_required": true
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "juan@example.com"
}

Response Success:
{
  "success": true,
  "message": "Reset Code sent! Please check your email inbox/spam folder.",
  "verification_required": true,
  "email": "juan@example.com",
  "email_sent": true
}

Response Error 1:
{
  "success": false,
  "message": "Validation Error"
}

Response Error 2:
{
  "success": false,
  "message": "Your email is not yet exists in our database."
}

Response Error 3:
{
  "success": false,
  "message": "We had trouble sending the reset code to your email. Please check your spam folder or contact support.",
  "verification_required": true,
  "email": "juan@example.com",
  "email_sent": false
}
```

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "password": "NewSecurePass123!",
  "password_confirmation": "NewSecurePass123!"
}
```

#### Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification-token-from-email"
}
```

---

### Protected Endpoints (Require Authentication)

All protected endpoints require the `Authorization` header:
```http
Authorization: Bearer {access_token}
```

#### Get Profile
```http
GET /api/student/profile
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Profile retrieved successfully",
  "profile": {
    "StudentNumber": "2024-12345",
    "FirstName": "Juan",
    "MiddleName": "Santos",
    "LastName": "Dela Cruz",
    "Birthday": "2000-01-15",
    "Course": "BS Computer Science",
    "YearLevel": "3rd Year",
    "Email": "juan@example.com"
  }
}
```

#### Get Grades
```http
GET /api/student/grades?sy=2024-2025&sem=1st Semester
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Grades retrieved successfully",
  "grades": [...],
  "periods": [...],
  "gpa_per_semester": [
    {
      "sy": "2024-2025",
      "sem": "1st Semester",
      "gpa": 1.75,
      "units": 24
    }
  ],
  "total_records": 8
}
```

#### Get Account/Statement
```http
GET /api/student/account?sy=2024-2025&sem=1st Semester
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Account information retrieved successfully",
  "accounts": [...],
  "summary": {
    "total_balance": 15000.00,
    "total_payments": 10000.00
  },
  "total_records": 1
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "refresh_token": "a1b2c3d4e5f6..."
}

Response:
{
  "success": true,
  "message": "Token refreshed",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer {access_token}

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🔒 Security Features

### 1. Password Security
- **Argon2ID** hashing (most secure algorithm)
- Minimum 8 characters enforced
- Passwords never stored in plain text

### 2. JWT Security
- Short-lived access tokens (1 hour)
- Refresh tokens for extended sessions
- Signature verification on every request

### 3. Rate Limiting
- Login: 5 attempts per 2 minutes per IP
- Automatic lockout on abuse

### 4. Input Validation
- All inputs sanitized
- SQL injection prevention (PDO prepared statements)
- XSS protection (htmlspecialchars)

### 5. CORS Protection
- Configurable allowed origins
- Proper headers for cross-origin requests

### 6. Identity Verification
- Prevents unauthorized account claiming
- Email verification required

---

## 🧪 Testing with cURL

```bash
# Login
curl -X POST https://yourschool.edu/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "SecurePass123!"
  }'

# Get Profile (authenticated)
curl -X GET https://yourschool.edu/api/student/profile \
  -H "Authorization: Bearer {your_access_token}"
```

---

## 📧 Email Configuration

For password reset functionality, configure SMTP in `config.php`:

### Gmail Setup
1. Enable 2FA on your Gmail account
2. Generate App Password: [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Use App Password in `SMTP_PASS`

### Other SMTP Providers
- **SendGrid**: smtp.sendgrid.net:587
- **Mailgun**: smtp.mailgun.org:587
- **Amazon SES**: email-smtp.us-east-1.amazonaws.com:587

---

## 🔧 Maintenance

### Daily Import Handling
Since data imports at 5 PM daily:

1. **Data Sync**: Verification checks against latest import
2. **Credential Persistence**: Login credentials stored separately

### Cleanup Tasks (Cron Jobs)

```bash
# Clean expired tokens daily
0 2 * * * mysql -u user -p db_kiosk -e "DELETE FROM refresh_tokens WHERE ExpiresAt < NOW();"

# Clean old login attempts monthly
0 3 1 * * mysql -u user -p db_kiosk -e "DELETE FROM login_attempts WHERE AttemptedAt < DATE_SUB(NOW(), INTERVAL 30 DAY);"
```

---

## 🐛 Troubleshooting

### "Database connection failed"
- Check `config.php` credentials
- Verify MySQL server is running
- Check user permissions

### "Invalid or expired token"
- Token expired (1 hour lifetime)
- Use refresh token to get new access token
- Check JWT_SECRET matches

### "Too many attempts"
- Rate limit triggered
- Wait 2 minutes (login)
- Check IP address if behind proxy

### "Student verification failed"
- Check for email existence in the database

---

## 📈 Performance Tips

1. **Enable OPcache** in PHP for faster execution
2. **Use MySQL indexes** on frequently queried fields
3. **Implement Redis** for rate limiting (optional upgrade)
4. **Enable GZIP compression** in Apache
5. **Use CDN** for static assets

---

## 🔄 Future Enhancements

- [ ] Add Redis for better rate limiting
- [ ] Session management dashboard
- [ ] Two-factor authentication (2FA)
- [ ] IP whitelist/blacklist
- [ ] Audit logging
- [ ] API rate limiting per user per IP address

---

## 📄 License

MIT License - Free to use and modify

---

## 🆘 Support

For issues or questions:
- Check error logs: `/var/log/apache2/error.log`
- Enable DEBUG_MODE in config.php for detailed errors
- Review database logs in phpMyAdmin

---

**Security Note**: Never commit `config.php` with real credentials to version control!