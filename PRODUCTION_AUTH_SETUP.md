# Production Auth Setup

## Client (Vercel)

Set this environment variable in Vercel:

```env
VITE_API_URL=https://smartcareer-api.onrender.com/api
```

## Server (Render)

Set these environment variables in Render:

```env
CLIENT_URL=https://careerai-com.vercel.app
SERVER_URL=https://smartcareer-api.onrender.com
GOOGLE_CALLBACK_URL=https://smartcareer-api.onrender.com/api/auth/google/callback
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_google_app_password
```

## Google Cloud OAuth Client

### Authorized JavaScript origins

```text
http://localhost:5173
http://localhost:5174
https://careerai-com.vercel.app
```

### Authorized redirect URIs

```text
http://localhost:5000/api/auth/google/callback
https://smartcareer-api.onrender.com/api/auth/google/callback
```
