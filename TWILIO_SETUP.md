# Twilio Integration Setup Guide

LocalAgent now supports real phone calls using Twilio! This guide walks you through setting up Twilio integration.

## Overview

With Twilio integration, you can:
- **Make outbound calls** to phone numbers
- **Use AI voice responses** in Arabic or English
- **Track call status** in real-time
- **Record calls** for quality assurance
- **Handle webhooks** for call events

## Prerequisites

1. A Twilio account (free tier available at [twilio.com](https://www.twilio.com))
2. A Twilio phone number (e.g., `+1234567890`)
3. Your Twilio Account SID and Auth Token
4. A public webhook URL (for Twilio callbacks)

## Setup Steps

### 1. Create a Twilio Account

1. Go to [twilio.com/console](https://www.twilio.com/console)
2. Sign up for a free account
3. Verify your phone number
4. Get a Twilio phone number (in the Phone Numbers section)

### 2. Get Your Credentials

1. Go to [twilio.com/console](https://www.twilio.com/console)
2. Copy your **Account SID**
3. Copy your **Auth Token**
4. Copy your **Twilio Phone Number** (the one you purchased, e.g., `+1234567890`)

### 3. Set Environment Variables

Add these to your `.env` file in the `backend/` directory:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WEBHOOK_URL=https://your-domain.com/api
```

### 4. Install Twilio SDK (Optional)

If you want to use the full Twilio integration, install the Twilio Python library:

```bash
cd backend
pip install twilio
```

The backend will automatically detect Twilio and enable call features.

### 5. Configure Webhook URL

If using real phone calls:

1. In [twilio.com/console](https://www.twilio.com/console), go to **Phone Numbers**
2. Click your phone number
3. Set the webhook URL for voice calls:
   - **Voice Configuration**: `POST https://your-domain.com/v1/twilio/twiml`
   - **Call Status Callbacks**: `POST https://your-domain.com/v1/twilio/status`

### 6. Deploy Backend

You can run LocalAgent backend locally or deploy it:

**Local (development):**
```bash
cd backend
source venv/bin/activate
python main.py
```

**Production (ngrok for testing):**
```bash
# In another terminal
ngrok http 8000
# Use the ngrok URL as your TWILIO_WEBHOOK_URL
```

## Testing

### Demo Mode (No Twilio)

If you skip Twilio setup:
1. The app runs in **demo mode**
2. Calls simulate the dialing → ringing → active → ended sequence
3. No real phone calls are made
4. Perfect for testing the UI

### Real Calls (With Twilio)

Once configured:

1. Open LocalAgent in your browser (localhost:3002)
2. Switch to the **Call** tab
3. Enter a phone number (e.g., `+1234567890`)
4. Click **Start Call**
5. Listen for the AI agent to greet you

## API Endpoints

### Initiate a Call
```bash
POST /v1/call/initiate?phone=%2B1234567890&language=en
```

**Response:**
```json
{
  "status": "initiated",
  "call_sid": "CA1234567890abcdef1234567890abcdef",
  "phone": "+1234567890"
}
```

### Check Call Status
```bash
GET /v1/call/status/{call_sid}
```

**Response:**
```json
{
  "call_sid": "CA1234567890abcdef1234567890abcdef",
  "status": "in-progress",
  "from": "+1234567890",
  "to": "+9876543210",
  "duration": 45
}
```

### End a Call
```bash
POST /v1/call/end/{call_sid}
```

## Call Status Values

- `queued` - Call is queued
- `ringing` - Phone is ringing
- `in-progress` - Call is active
- `completed` - Call ended normally
- `failed` - Call failed to connect
- `busy` - Number is busy
- `no-answer` - Call went to voicemail

## Language Support

The backend supports multiple languages for voice:

- **English**: Uses Polly.Joanna (female voice)
- **Arabic**: Uses Polly.Zeina (female voice)

To use a different language, add it to `VOICE_MAP` in `backend/twilio_hooks.py`.

## Frontend Integration

The frontend includes:

### Call Interface
- Dialing pad for entering phone numbers
- Quick dial buttons (Mom, Dad, Agent)
- Call status display
- Real-time call duration tracking
- Language selector

### Twilio Hooks Library
Located in `frontend/lib/twilio-hooks.ts`, provides:

```typescript
// Initiate a call
const result = await initiateCall("+1234567890", "en");

// Check call status
const status = await getCallStatus(callSid);

// End a call
const success = await endCall(callSid);

// Poll status changes
const stopPolling = pollCallStatus(callSid, (status) => {
  console.log("Call status:", status.status);
});
```

## Troubleshooting

### "Twilio not configured" Error

- Check that all `TWILIO_*` environment variables are set
- Restart the backend: `python main.py`
- Check the backend logs for errors

### Calls Not Connecting

- Verify your Twilio Account SID and Auth Token
- Check that you have credits in your Twilio account
- Verify the webhook URL is publicly accessible
- Check Twilio console logs for errors

### Can't Hear Audio

- Ensure `ELEVENLABS_API_KEY` is set
- Check your browser's microphone permissions
- Try a different language in the Language selector

### Missing `twilio` Package

Run in the `backend/` directory:
```bash
pip install twilio
```

## Development

To add custom Twilio features:

1. Edit `backend/twilio_hooks.py` to add backend logic
2. Edit `frontend/lib/twilio-hooks.ts` to add frontend utilities
3. Add endpoints to `backend/main.py`
4. Update `frontend/app/page.tsx` to use the new features

## Production Deployment

For production:

1. Use a real domain (not localhost)
2. Get a free SSL certificate (Let's Encrypt)
3. Set `TWILIO_WEBHOOK_URL` to your domain
4. Keep API keys in environment variables (never commit to git)
5. Consider using a database instead of in-memory call tracking

## Security Notes

⚠️ **Important:**
- Never commit `.env` files to git
- Keep your Twilio credentials secret
- Use strong webhook verification (check X-Twilio-Signature headers)
- Consider rate limiting call endpoints
- Log calls for compliance (PCI-DSS if handling payments)

## Next Steps

- [ ] Add call recording playback
- [ ] Implement call history database
- [ ] Add call forwarding
- [ ] Support conferencing
- [ ] Add IVR (Interactive Voice Response) trees
- [ ] Implement voicemail transcription

## Support

For issues with:
- **Twilio**: Check [twilio.com/docs](https://www.twilio.com/docs)
- **LocalAgent**: Check the project README
- **ElevenLabs**: Check [elevenlabs.io/docs](https://elevenlabs.io/docs)

---

Happy calling! 📞
