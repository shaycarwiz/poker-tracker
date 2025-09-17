# Security Guide

This document outlines the security measures implemented in the Poker Tracker application and provides guidance for secure deployment.

## 🔒 Security Features

### Environment Variables Security

The application now enforces secure configuration through required environment variables:

#### Required Environment Variables

- **`DB_PASSWORD`**: Database password (minimum 8 characters)
- **`JWT_SECRET`**: JWT signing secret (minimum 32 characters)
- **`DB_NAME`**: Database name (non-empty string)
- **`DB_USERNAME`**: Database username (non-empty string)
- **`DEFAULT_CURRENCY`**: Default currency code (3-letter format, e.g., USD, EUR)

#### Production-Required Variables

- **`CORS_ORIGIN`**: Allowed CORS origins (required in production)

### Security Validations

The application validates environment variables on startup:

1. **Database Password**: Must be at least 8 characters long
2. **JWT Secret**: Must be at least 32 characters long
3. **Currency Code**: Must be a valid 3-letter currency code
4. **CORS Origin**: Must be explicitly set in production

## 🛡️ Security Best Practices

### 1. Environment Variables

#### Development

```bash
# Generate secure environment variables
npm run generate:env

# Copy the output to your .env file
cp env.example .env
# Edit .env with the generated values
```

#### Production

```bash
# Set environment variables securely
export DB_PASSWORD="your-secure-database-password"
export JWT_SECRET="your-64-character-jwt-secret"
export CORS_ORIGIN="https://yourdomain.com,https://app.yourdomain.com"
export DEFAULT_CURRENCY="USD"
```

### 2. Database Security

- Use strong, unique passwords for database users
- Enable SSL connections in production (`DB_SSL=true`)
- Use dedicated database users with minimal required permissions
- Regularly rotate database passwords

### 3. JWT Security

- Generate strong JWT secrets (minimum 32 characters)
- Use cryptographically secure random strings
- Rotate JWT secrets regularly
- Set appropriate expiration times

### 4. CORS Configuration

- Never use `*` as CORS origin in production
- Specify exact allowed origins
- Use HTTPS in production

## 🚨 Security Warnings

### What Changed

The following security improvements have been implemented:

1. **Removed Default Credentials**: No more default passwords or secrets
2. **Added Validation**: Environment variables are validated on startup
3. **Production Safety**: CORS origin must be explicitly set in production
4. **Strong Requirements**: Minimum length requirements for sensitive values

### Migration Guide

If you're upgrading from a previous version:

1. **Update your `.env` file** with the new required variables
2. **Generate secure values** using `npm run generate:env`
3. **Set CORS_ORIGIN** for production deployments
4. **Update your deployment scripts** to include all required variables

## 🔧 Troubleshooting

### Common Errors

#### "Required environment variable X is not set"

- **Solution**: Add the missing environment variable to your `.env` file

#### "JWT secret must be at least 32 characters long"

- **Solution**: Generate a longer secret using `npm run generate:env`

#### "CORS_ORIGIN must be set in production environment"

- **Solution**: Set the `CORS_ORIGIN` environment variable with your allowed origins

#### "Database password must be at least 8 characters long"

- **Solution**: Use a longer, more secure password

### Environment Variable Reference

| Variable           | Required   | Min Length | Format | Description                    |
| ------------------ | ---------- | ---------- | ------ | ------------------------------ |
| `DB_PASSWORD`      | ✅         | 8 chars    | String | Database password              |
| `JWT_SECRET`       | ✅         | 32 chars   | String | JWT signing secret             |
| `DB_NAME`          | ✅         | 1 char     | String | Database name                  |
| `DB_USERNAME`      | ✅         | 1 char     | String | Database username              |
| `DEFAULT_CURRENCY` | ✅         | 3 chars    | String | Currency code (USD, EUR, etc.) |
| `CORS_ORIGIN`      | Production | -          | String | Allowed CORS origins           |

## 📚 Additional Resources

- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)

## 🆘 Support

If you encounter security-related issues:

1. Check this documentation first
2. Verify all required environment variables are set
3. Ensure values meet the minimum requirements
4. Check the application logs for specific error messages

---

**Remember**: Security is an ongoing process. Regularly review and update your security measures.
