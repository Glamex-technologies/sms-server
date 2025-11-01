# Unifonic Configuration Guide for .env File

This guide explains what values to add to your `sms-server/.env` file for Unifonic SMS integration.

## 📋 Required Environment Variables

Based on the Unifonic documentation you received, here's what you need to add to your `sms-server/.env` file:

```env
# ===========================================
# UNIFONIC SMS CONFIGURATION
# ===========================================

# API URL (Choose one based on your region/account)
# Option 1: Enterprise URL (recommended)
UNIFONIC_API_URL=https://el.cloud.unifonic.com/rest/SMS/messages

# Option 2: Basic URL (alternative)
# UNIFONIC_API_URL=https://basic.unifonic.com/rest/SMS/messages

# AppSid (REQUIRED - Get from Unifonic Portal)
# Steps to get: https://cloud.unifonic.com/applications/sms/https
UNIFONIC_APP_SID=your_actual_appsid_here

# Sender ID (REQUIRED - Get from Unifonic Portal)
# Steps to get: https://communication.cloud.unifonic.com/sendername
UNIFONIC_SENDER_ID=your_actual_sender_id_here
```

## 🔍 Where to Get Each Value

### 1. UNIFONIC_API_URL

**Default:** `https://el.cloud.unifonic.com/rest/SMS/messages` (already set as default)

**What it is:** The Unifonic API endpoint URL

**Where to find it:**
- Use `https://el.cloud.unifonic.com/rest/SMS/messages` (Enterprise URL) - **Recommended**
- Or `https://basic.unifonic.com/rest/SMS/messages` (Basic URL) - if your account uses the basic tier

**You probably don't need to change this** - the default should work.

---

### 2. UNIFONIC_APP_SID (Required)

**What it is:** Your Application ID (AppSid) - unique identifier for your SMS application

**Where to get it:**
1. Log in to Unifonic Cloud Portal: https://cloud.unifonic.com/applications/sms/https
2. Navigate to **Applications** → **SMS** → **HTTPS**
3. Find your SMS application (or create a new one)
4. Copy the **AppSid** value
5. It looks like: `xxxxx-xxxxx-xxxxx-xxxxx-xxxxx` or similar format

**Documentation:** https://docs.unifonic.com/articles/#!products-documentation/getting-sms-application-1

**Important:** 
- Must be created **AFTER** IP whitelisting is complete
- The SMS server's static IP must be whitelisted in Unifonic portal first

---

### 3. UNIFONIC_SENDER_ID (Required)

**What it is:** The name/number that appears as the sender of SMS messages

**Where to get it:**
1. Log in to Unifonic Communication Portal: https://communication.cloud.unifonic.com/sendername
2. Navigate to **Sender Names** section
3. Find your approved Sender ID (or request a new one)
4. Copy the **Sender ID** value
5. Can be:
   - Numeric: `123456` (for some countries)
   - Alphanumeric: `GLAMEX` (if approved for your country)

**Documentation:** https://docs.unifonic.com/articles/#!products-documentation/getting-a-sender-id-1

**Important:**
- Sender ID registration takes **24-48 hours** for approval
- Some countries require specific format or additional verification
- You'll receive email notification when approved

---

## 📝 Complete .env File Example

Here's a complete example of what your `sms-server/.env` file should look like:

```env
# SMS Server Configuration
SMS_SERVER_PORT=8081
NODE_ENV=production

# Database Configuration (copy from main server)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=glamex
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_DIALECT=mysql

# Unifonic SMS Configuration
UNIFONIC_API_URL=https://el.cloud.unifonic.com/rest/SMS/messages
UNIFONIC_APP_SID=abc123-def456-ghi789-jkl012-mno345
UNIFONIC_SENDER_ID=GLAMEX
```

## ✅ How to Verify Configuration

After adding the values, restart the SMS server and check the startup logs:

```
📱 [SMS Server] Unifonic SMS Helper Configuration:
   API URL: https://el.cloud.unifonic.com/rest/SMS/messages
   AppSid: ✅ Configured
   Sender ID: GLAMEX
```

**Success indicators:**
- ✅ AppSid: ✅ Configured
- ✅ Sender ID shows your actual sender ID (not "Not configured")

**Warning signs:**
- ❌ AppSid: ❌ Not configured → `UNIFONIC_APP_SID` is missing or incorrect
- ⚠️ Sender ID: Not configured → `UNIFONIC_SENDER_ID` is missing or incorrect

## 🔐 Security Notes

1. **Never commit `.env` file to Git** - it's already in `.gitignore`
2. **Keep your AppSid secret** - treat it like a password
3. **Use different values for development and production**
4. **Rotate credentials** if compromised

## 🚨 Troubleshooting

### Error: "UNIFONIC_APP_SID is not set"
- Check that `UNIFONIC_APP_SID=` line exists in `.env`
- Verify no spaces around the `=` sign
- Ensure no quotes around the value
- Restart the server after editing `.env`

### Error: "Invalid AppSid" or 401 Unauthorized
- Verify AppSid is correct (copy from Unifonic portal again)
- Check for typos or extra spaces
- Ensure your SMS server's **static IP is whitelisted** in Unifonic portal
- Verify your Unifonic account is active

### Error: SMS sending fails
- Verify Sender ID is approved and active
- Check phone number format (must be E.164: +countrycode+number)
- Review Unifonic portal for any account restrictions

## 📚 Related Documentation Links

- **Getting Started:** https://docs.unifonic.com/articles/#!products-documentation/sms-getting-started
- **Send First SMS:** https://docs.unifonic.com/articles/#!products-documentation/sending-your-first-sms-via-unifonic-api
- **IP Whitelisting:** https://docs.unifonic.com/articles/#!products-documentation/ip-whitelisting
- **AppSid Creation:** https://docs.unifonic.com/articles/#!products-documentation/getting-sms-application-1
- **Sender ID:** https://docs.unifonic.com/articles/#!products-documentation/getting-a-sender-id-1

---

**Last Updated:** Based on Unifonic documentation received from support team

