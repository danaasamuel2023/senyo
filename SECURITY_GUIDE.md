# Security Configuration Guide

## Environment Variables Setup

To secure your application, create a `.env` file in the server directory with the following variables:

```bash
# JWT Configuration
JWT_SECRET_VERIFYNOW=your_strong_jwt_secret_key_here
JWT_EXPIRES_IN_VERIFYNOW=7d

# MongoDB Configuration
MONGODB_USERNAME=your_mongodb_username
MONGODB_PASSWORD=your_mongodb_password
MONGODB_CLUSTER=your_mongodb_cluster.mongodb.net

# Server Configuration
PORT=5001
NODE_ENV=development

# Paystack Configuration (if using Paystack)
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
```

## Security Improvements Made

1. **Database Credentials**: Moved hardcoded MongoDB credentials to environment variables
2. **JWT Secrets**: Using environment variables for JWT secret keys
3. **API Keys**: All sensitive API keys should be stored in environment variables
4. **Script Security**: Updated all database scripts to use environment variables

## Important Security Notes

- Never commit `.env` files to version control
- Use strong, unique passwords for all services
- Regularly rotate API keys and secrets
- Use different credentials for development and production
- Enable MongoDB authentication and network access controls
- Use HTTPS in production
- Implement rate limiting for API endpoints
- Validate all user inputs
- Use proper error handling to avoid information leakage

## Agent System Security

The agent system includes:
- Role-based authentication
- Secure withdrawal requests
- Commission tracking
- Store customization with validation
- Public store pages with limited information exposure

## Next Steps for Production

1. Set up proper SSL certificates
2. Implement rate limiting middleware
3. Add request logging and monitoring
4. Set up database backups
5. Implement proper error handling
6. Add input validation and sanitization
7. Set up monitoring and alerting
8. Regular security audits
