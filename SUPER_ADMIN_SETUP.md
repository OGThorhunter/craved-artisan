# Super Admin Account Setup

## Account Created

A super admin account has been created in the production database with the following details:

### Credentials
- **Email:** `support@cravedartisan.com`
- **Password:** `Bigbertha#1Secure`
- **Role:** `SUPER_ADMIN`
- **User ID:** `cmgwuw1y20000qus0z6ij5xjl`

### Security Features
- ✅ Strong password (16 characters with mixed case, numbers, special characters)
- ✅ Password hashed with bcrypt (12 rounds)
- ✅ Full system permissions (`scopes: ['*']`)
- ✅ Email verified and account active
- ✅ Created directly in production database

### Access
Once the deployment completes and the health check path is fixed (`/readyz` → `/api/health`), you can login with these credentials to access:

- Admin dashboard
- User management
- System settings
- Full application control

### Security Notes
- The creation script was deleted after use for security
- Password meets enterprise security standards
- Account has full administrative privileges
- Use responsibly and keep credentials secure

## Next Steps
1. Fix health check path in Render dashboard
2. Wait for deployment to complete
3. Test login with provided credentials
4. Access admin functionality as needed

---
*Created: October 18, 2025*
*Status: Ready for production use*
