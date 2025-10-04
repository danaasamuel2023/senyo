# Settings Page Documentation

## Overview
Comprehensive user settings management system with multiple configuration sections.

## Features

### 1. Account Settings
- **Profile Information**
  - Update full name
  - Change email address
  - Modify phone number
  
- **Password Management**
  - Change password with current password verification
  - Password strength requirements (minimum 8 characters)
  - Secure password hashing

### 2. Preferences
- **Theme Selection**
  - Light mode
  - Dark mode
  - Auto (system preference)

- **Language Support**
  - English (en)
  - Español (es)
  - Français (fr)
  - Twi (tw)
  - Hausa (ha)

- **Currency Options**
  - Ghana Cedi (GHS) ₵
  - US Dollar (USD) $
  - Euro (EUR) €
  - British Pound (GBP) £

- **Timezone Settings**
  - Multiple timezone support
  - Default: Africa/Accra

### 3. Notifications
- **Notification Channels**
  - Email notifications with frequency control (instant/daily/weekly)
  - Push notifications with sound control
  - SMS notifications (urgent only option)
  - In-app notifications

- **Notification Categories**
  - Purchase Updates
  - Deposit Notifications
  - Withdrawal Updates
  - Referral Bonuses
  - Security Alerts
  - Promotions & Offers
  - System Updates

- **Quiet Hours**
  - Enable/disable quiet hours
  - Configurable start and end times
  - Timezone-aware

### 4. Security
- **Two-Factor Authentication (2FA)**
  - Enable/disable 2FA
  - Backup codes generation
  - Enhanced account security

- **Session Management**
  - Configurable session timeout (15 min - 8 hours)
  - Login notifications
  - Device management

- **Trusted Devices**
  - View active sessions
  - Revoke device access
  - Monitor login history

### 5. API Keys
- **Key Management**
  - Generate new API keys
  - View existing keys
  - Enable/disable keys
  - Delete keys
  - Copy to clipboard functionality

- **Key Information**
  - Creation date
  - Last used timestamp
  - Active/inactive status

## API Endpoints

### Get Settings
```http
GET /api/user/settings
Authorization: Bearer {token}
```

### Update Account
```http
PUT /api/user/settings/account
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+233123456789",
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

### Update Preferences
```http
PUT /api/user/settings/preferences
Authorization: Bearer {token}
Content-Type: application/json

{
  "theme": "dark",
  "language": "en",
  "currency": "GHS",
  "timezone": "Africa/Accra"
}
```

### Update Notifications
```http
PUT /api/user/settings/notifications
Authorization: Bearer {token}
Content-Type: application/json

{
  "channels": {
    "email": {
      "enabled": true,
      "frequency": "instant"
    },
    "push": {
      "enabled": true,
      "sound": true
    }
  },
  "categories": {
    "purchases": true,
    "security": true
  }
}
```

### Update Security
```http
PUT /api/user/settings/security
Authorization: Bearer {token}
Content-Type: application/json

{
  "twoFactorEnabled": true,
  "sessionTimeout": 30,
  "loginNotifications": true
}
```

### Get Active Sessions
```http
GET /api/user/settings/sessions
Authorization: Bearer {token}
```

### Revoke Session
```http
DELETE /api/user/settings/sessions/{sessionId}
Authorization: Bearer {token}
```

### Export Data
```http
POST /api/user/settings/export-data
Authorization: Bearer {token}
```

### Update Privacy Settings
```http
PUT /api/user/settings/privacy
Authorization: Bearer {token}
Content-Type: application/json

{
  "profileVisibility": "private",
  "showOnlineStatus": true,
  "allowContactByEmail": true
}
```

## Database Schema Updates

### User Schema Enhancements

#### Two-Factor Authentication
```javascript
twoFactorEnabled: Boolean
twoFactorSecret: String (encrypted)
twoFactorBackupCodes: [String]
twoFactorSetupAt: Date
```

#### Security Settings
```javascript
securitySettings: {
  sessionTimeout: Number,
  loginNotifications: Boolean,
  deviceManagementEnabled: Boolean,
  requirePasswordForSensitiveActions: Boolean,
  allowMultipleSessions: Boolean
}
```

#### Active Sessions
```javascript
activeSessions: [{
  sessionId: String,
  deviceId: String,
  deviceName: String,
  ipAddress: String,
  userAgent: String,
  location: String,
  createdAt: Date,
  lastActivity: Date,
  isActive: Boolean
}]
```

#### Enhanced Preferences
```javascript
preferences: {
  language: String,
  currency: String,
  theme: String,
  timezone: String,
  dateFormat: String,
  numberFormat: String
}
```

#### Activity Log
```javascript
activityLog: [{
  action: String,
  details: String,
  ipAddress: String,
  userAgent: String,
  timestamp: Date
}]
```

#### Privacy Settings
```javascript
privacySettings: {
  profileVisibility: String,
  showOnlineStatus: Boolean,
  allowContactByEmail: Boolean,
  allowContactBySMS: Boolean,
  dataExportRequested: Date,
  dataExportCompletedAt: Date
}
```

## Mobile Responsiveness
- Fully responsive design
- Touch-optimized controls
- Mobile-friendly navigation
- Adaptive layouts for all screen sizes

## Security Features
- Password verification for sensitive changes
- Activity logging for security changes
- Secure password hashing (bcrypt)
- Session management
- Two-factor authentication support

## User Experience
- Real-time save status feedback
- Form validation
- Smooth transitions
- Dark mode support
- Intuitive tabbed interface
- Copy to clipboard for API keys
- Toggle visibility for sensitive data

## Future Enhancements
- Email verification for email changes
- Phone verification for phone changes
- Two-factor authentication QR code generation
- Biometric authentication support
- Advanced activity log viewer
- Data export in multiple formats (CSV, JSON, PDF)
- Account recovery options
- Backup and restore settings

## Usage Notes
1. Always verify current password before changing sensitive settings
2. Keep API keys secure and regenerate if compromised
3. Enable 2FA for enhanced security
4. Configure notification preferences to avoid spam
5. Regularly review active sessions and revoke suspicious ones
6. Export data periodically for backup purposes

## Support
For issues or questions regarding the settings page, please contact support or refer to the main documentation.

