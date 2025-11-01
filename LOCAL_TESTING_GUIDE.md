# Local Testing Guide for SMS Server

## 📍 Your Current Local IP Address

**Your Local IP:** `192.168.1.3`  
**SMS Server Port:** `8081` (default)  
**SMS Server URL:** `http://192.168.1.3:8081`

---

## 🧪 Testing Methods

### Method 1: Using the Test Script

1. **Run the test script:**
   ```bash
   cd sms-server
   node test-local.js
   ```

2. This will test:
   - ✅ Health check endpoint
   - ✅ Root endpoint
   - ✅ OTP generation endpoint

---

### Method 2: Using cURL (PowerShell)

**Health Check:**
```powershell
curl http://192.168.1.3:8081/health
```

**Root Endpoint:**
```powershell
curl http://192.168.1.3:8081/
```

**OTP Generation:**
```powershell
$body = @{
    entity_type = "user"
    entity_id = 999
    phone_code = "+91"
    phone_number = "9876543210"
    purpose = "registration"
} | ConvertTo-Json

curl -Method POST -Uri "http://192.168.1.3:8081/otp/generate" -Body $body -ContentType "application/json"
```

---

### Method 3: Using Browser

Open in browser:
- Health Check: `http://192.168.1.3:8081/health`
- Root: `http://192.168.1.3:8081/`

---

### Method 4: Testing from Main Server

If you want to test from your main server (which calls the SMS server):

1. **Update `server/.env`:**
   ```env
   SMS_SERVER_URL=http://192.168.1.3:8081
   ```

2. **Restart your main server**

3. **Test the signup flow** - it will call the SMS server at `http://192.168.1.3:8081`

---

## ⚠️ Important Notes

### If Your IP Changes
Your local IP might change if you:
- Disconnect/reconnect to WiFi
- Switch networks
- Restart your router

**To get your current IP again:**
```powershell
ipconfig | findstr /i "IPv4"
```

### Firewall
Make sure Windows Firewall allows connections on port 8081, or temporarily disable it for testing.

### Network Testing
- **Same machine:** Use `http://localhost:8081` or `http://127.0.0.1:8081`
- **Same network (other devices):** Use `http://192.168.1.3:8081`
- **From main server on same machine:** Use `http://localhost:8081` or `http://192.168.1.3:8081`

---

## 🔍 Quick Verification

1. **Make sure SMS server is running:**
   ```bash
   cd sms-server
   npm start
   ```

2. **In another terminal, test health:**
   ```powershell
   curl http://192.168.1.3:8081/health
   ```

3. **Expected response:**
   ```json
   {
     "status": "success",
     "message": "SMS Server is healthy",
     "data": null
   }
   ```

---

## 📝 Test Request Body for OTP

```json
{
  "entity_type": "user",
  "entity_id": 999,
  "phone_code": "+91",
  "phone_number": "9876543210",
  "purpose": "registration"
}
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "OTP generated and sent successfully",
  "data": {
    "id": 123,
    "expires_at": "2024-01-01T12:00:00.000Z",
    "otp_code": "1234"
  }
}
```

