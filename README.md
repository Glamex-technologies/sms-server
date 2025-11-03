# SMS Server - Glamex OTP Service

Dedicated SMS server for Glamex OTP generation and delivery. This server handles all OTP-related operations and SMS sending via Unifonic API.

## 🎯 Purpose

This server is designed to be deployed on a **static IP address** to work with Unifonic SMS service IP whitelisting requirements. The main Glamex server (which has dynamic IP) calls this SMS server via API to generate and send OTPs.

## 📋 Features

- ✅ Single API endpoint for OTP generation
- ✅ Automatic SMS sending via Unifonic
- ✅ Random 4-digit OTP generation
- ✅ Database integration (same database as main server)
- ✅ Comprehensive logging
- ✅ Health check endpoint

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20
- MySQL database (shared with main Glamex server)
- Unifonic account with AppSid and Sender ID configured

### Installation

```bash

# Install nginx and node
sudo apt update
sudo apt install nginx node npm

# Install pm2
sudo npm install pm2 -g

# Install dependencies
cd sms-server
npm install

# Configure environment variables (see Configuration section)
# Start server
pm2 start src/app.js --name "sms-server"

# Test Server

sudo ss -ltnp | grep 8081

# NGINX conf

sudo nano /etc/nginx/sites-available/default


server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Save and test
sudo nginx -t
sudo systemctl restart nginx


```

## ⚙️ Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
SMS_SERVER_PORT=8081
NODE_ENV=production

# Database Configuration (same as main server)
DB_HOST=your_db_host
DB_PORT=3306
DB_NAME=glamex
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_DIALECT=mysql

# Unifonic SMS Configuration
UNIFONIC_API_URL=https://el.cloud.unifonic.com/rest/SMS/messages
UNIFONIC_APP_SID=your_appsid_here
UNIFONIC_SENDER_ID=your_sender_id_here
```

## 📡 API Endpoints

### 1. Generate OTP

**Endpoint:** `POST /otp/generate`

**Request Body:**
```json
{
  "entity_type": "user",
  "entity_id": "550e8400-e29b-41d4-a716-446655440000",
  "phone_code": "1",
  "phone_number": "1234567890",
  "purpose": "registration"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "OTP generated and sent successfully via SMS",
  "success": true,
  "data": {
    "otp_id": "550e8400-e29b-41d4-a716-446655440001",
    "entity_type": "user",
    "entity_id": "550e8400-e29b-41d4-a716-446655440000",
    "phone_code": "1",
    "phone_number": "1234567890",
    "purpose": "registration",
    "expires_at": "2024-01-15T10:35:00.000Z",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `entity_type` | string | Yes | Entity type: `user`, `provider`, or `admin` |
| `entity_id` | UUID | Yes | UUID of the entity (user/provider/admin) |
| `phone_code` | string | Yes | Country code (1-4 digits) |
| `phone_number` | string | Yes | Phone number (6-15 digits) |
| `purpose` | string | Yes | OTP purpose: `registration`, `login`, `password_reset`, or `phone_verification` |

### 2. Health Check

**Endpoint:** `GET /health` or `GET /`

**Response:**
```json
{
  "statusCode": 200,
  "message": "SMS Server is healthy",
  "success": true,
  "data": {
    "status": "ok",
    "database": "connected",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## 🔗 Integration with Main Server

The main Glamex server should call this SMS server API instead of directly creating OTPs. See the main server's updated code for integration examples.

**Example API Call from Main Server:**
```javascript
const axios = require('axios');

// Replace OtpVerification.createForEntity() calls with:
const response = await axios.post(`${process.env.SMS_SERVER_URL}/otp/generate`, {
  entity_type: "user",
  entity_id: user.id,
  phone_code: data.phone_code,
  phone_number: data.phone_number,
  purpose: "registration"
});
```

## 📊 Architecture

```
Main Server (Dynamic IP)
    ↓
    HTTP API Call
    ↓
SMS Server (Static IP) ←→ Unifonic SMS API
    ↓
    Database (MySQL)
    ↓
    OTP Record Created + SMS Sent
```

## 📁 Project Structure

```
sms-server/
├── src/
│   ├── app.js                    # Main application file
│   ├── config/
│   │   ├── database.js          # Database configuration
│   │   └── database.config.js   # Sequelize config
│   ├── startup/
│   │   └── model.js             # Database models initialization
│   └── application/
│       ├── controller/
│       │   └── otp.controller.js    # OTP controller
│       ├── validator/
│       │   └── otp.validator.js     # Request validation
│       ├── routes/
│       │   └── otp.routes.js        # Route definitions
│       ├── models/
│       │   └── otpVerification.model.js  # OTP model
│       └── helpers/
│           ├── unifonicSms.helpers.js    # Unifonic SMS integration
│           ├── response.helpers.js       # Response helper
│           └── joiHelper.helpers.js     # Joi validation helper
├── package.json
├── .env                          # Environment variables
└── README.md
```

## 🔒 Security

- Keep `UNIFONIC_APP_SID` and `UNIFONIC_SENDER_ID` secret
- Use HTTPS in production
- Deploy SMS server on static IP for Unifonic whitelisting
- Validate all incoming requests
- Rate limiting recommended (implement in main server or via reverse proxy)

## 🧪 Testing

### Test OTP Generation

```bash
curl -X POST http://localhost:8081/otp/generate \
  -H "Content-Type: application/json" \
  -d '{
    "entity_type": "user",
    "entity_id": "550e8400-e29b-41d4-a716-446655440000",
    "phone_code": "1",
    "phone_number": "1234567890",
    "purpose": "registration"
  }'
```

### Test Health Check

```bash
curl http://localhost:8081/health
```

## 📝 Logging

The server provides detailed logging for:
- OTP generation process
- SMS sending attempts
- Database operations
- Error handling

All logs are prefixed with `[SMS Server]` for easy identification.

## 🚢 Deployment

1. **Deploy on Static IP Server**
   - Use cloud provider with static IP (AWS Elastic IP, Google Cloud Static IP, etc.)
   - Ensure IP is whitelisted in Unifonic portal

2. **Environment Setup**
   - Copy `.env` file to server
   - Configure all environment variables
   - Ensure database connection works

3. **Start Server**
   ```bash
   npm start
   # Or use PM2 for process management
   pm2 start src/app.js --name sms-server
   ```

4. **Update Main Server**
   - Set `SMS_SERVER_URL` in main server `.env`
   - Update main server code to call SMS server API

## 🔄 Migration from Direct OTP Calls

The main server needs to be updated to call this SMS server API instead of directly calling `OtpVerification.createForEntity()`. See the main server's updated code for details.

## 📞 Support

For issues related to:
- **SMS Server**: Check this README and server logs
- **Unifonic Integration**: See `server/README_UNIFONIC_SMS_OTP.md`
- **Database**: Ensure database credentials are correct
- **Network**: Verify SMS server is accessible from main server

## 📄 License

Same as main Glamex project.

