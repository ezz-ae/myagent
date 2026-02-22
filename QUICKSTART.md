# LocalAgent - Quick Start Guide

Get LocalAgent running in 5 minutes! 🚀

## Prerequisites

- Python 3.8+
- Node.js 16+
- Ollama running locally (`ollama serve`)
- ElevenLabs API key (optional, for voice)
- Twilio account (optional, for phone calls)

## 1️⃣ Setup Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
OLLAMA_BASE_URL=http://localhost:11434/v1
ELEVENLABS_API_KEY=sk-your-key-here
# Optional Twilio:
# TWILIO_ACCOUNT_SID=AC...
# TWILIO_AUTH_TOKEN=...
# TWILIO_PHONE_NUMBER=+1234567890
EOF

# Run backend
python main.py
```

Backend starts on **http://localhost:8000** ✅

## 2️⃣ Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend starts on **http://localhost:3002** ✅

## 3️⃣ Start Ollama (Separate Terminal)

```bash
ollama serve
```

Or pull a model if not already done:
```bash
ollama pull llama3.2
```

## 4️⃣ Open in Browser

Visit **http://localhost:3002** in your browser 🌐

## 🎤 Chat with Voice

1. Type a message or click the 🎤 button to speak
2. Click send or press Enter
3. Hear the response with 🔊 button

## 📞 Make a Call (Demo Mode)

1. Click **Call** tab
2. Enter a name (e.g., "Mom")
3. Click **Start Call**
4. See call progress in real-time

## 🌍 Change Language

- Use dropdown in header: 🇬🇧 English or 🇸🇦 العربية
- Voice will respond in selected language

## ✅ Verify It's Working

### Check Backend Health
```bash
curl http://localhost:8000/health
```

Should return:
```json
{
  "status": "ok",
  "voice_enabled": true,
  "calls_enabled": false
}
```

### Test Voice
```bash
curl http://localhost:8000/v1/speech \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","language":"en"}' \
  > test.mp3
```

### Test Chat
```bash
curl http://localhost:8000/v1/chat \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"message":"What is 2+2?","session_id":"test","model":"llama3.2"}'
```

## 🐛 Troubleshooting

### Backend won't start
- Make sure virtual environment is activated
- Check that Ollama is running: `curl http://localhost:11434/api/tags`
- Check `.env` file has correct Ollama URL

### Frontend shows blank page
- Check browser console for errors (F12)
- Make sure backend is running: `curl http://localhost:8000/health`
- Try hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

### Voice not working
- Check ElevenLabs API key is correct
- Grant browser microphone permission
- Check browser console for errors

### Ollama pulling models too slow
- Models can be several GB
- Download happens in background
- Check progress: `ollama list`

## 📚 Full Documentation

- **Detailed Setup**: See `IMPLEMENTATION_SUMMARY.md`
- **Twilio Integration**: See `TWILIO_SETUP.md` (optional)
- **Architecture**: See source code comments

## 🎯 What's Included

✅ AI chat with Ollama (Llama 3.2, DeepSeek R1)
✅ Voice I/O with ElevenLabs (English & Arabic)
✅ Visual canvas for chat visualization
✅ Call interface UI (demo mode included)
✅ Twilio hooks (optional phone calling)
✅ Model selection in UI
✅ Session persistence
✅ Multi-language support

## 🚀 Next Steps

1. **Try different models**: Switch between Llama 3.2 and DeepSeek R1 in UI
2. **Enable voice**: Set your ElevenLabs API key
3. **Try different languages**: Switch between English and Arabic
4. **Add Twilio** (optional): Follow `TWILIO_SETUP.md` for real phone calls
5. **Customize**: Edit files to add your own features

## 📞 Optional: Enable Real Phone Calls

To make actual phone calls (requires Twilio account):

1. Get Twilio credentials at [twilio.com](https://www.twilio.com)
2. Add to `.env`:
   ```bash
   TWILIO_ACCOUNT_SID=AC...
   TWILIO_AUTH_TOKEN=...
   TWILIO_PHONE_NUMBER=+1234567890
   ```
3. Restart backend
4. Call interface will now make real calls

See `TWILIO_SETUP.md` for full instructions.

## 🛑 Stop Everything

```bash
# Backend: Ctrl+C in backend terminal
# Frontend: Ctrl+C in frontend terminal
# Ollama: Ctrl+C in ollama terminal
```

## 💡 Tips

- **Faster responses**: Use Llama 3.2 (smaller model)
- **Better reasoning**: Use DeepSeek R1 (larger model, slower)
- **Multiple chats**: Each session_id keeps separate history
- **Record your conversations**: Check browser's Network tab
- **Debug**: Open DevTools (F12) to see API calls

## 🎓 Learning Path

1. **Start here**: This file (you're reading it!)
2. **Explore UI**: Click around, try chat and voice
3. **Read code**: Check `frontend/app/page.tsx` and `backend/main.py`
4. **Modify**: Add your own features
5. **Deploy**: Use your favorite platform (Vercel, Heroku, AWS, etc.)

## 📊 System Architecture

```
┌─────────────────────────────────────────┐
│  Browser (localhost:3002)               │
│  ┌───────────────────────────────────┐  │
│  │ Next.js Frontend                  │  │
│  │ - Chat UI + Canvas                │  │
│  │ - Voice input/output              │  │
│  │ - Call interface                  │  │
│  └───────────────────────────────────┘  │
└──────────────────┬──────────────────────┘
                   │ HTTP/JSON
┌──────────────────▼──────────────────────┐
│  http://localhost:8000                  │
│  ┌───────────────────────────────────┐  │
│  │ FastAPI Backend                   │  │
│  │ - /v1/chat (Ollama)               │  │
│  │ - /v1/speech (ElevenLabs)         │  │
│  │ - /v1/languages                   │  │
│  │ - /v1/call/* (Twilio)             │  │
│  │ - /v1/twilio/* (Webhooks)         │  │
│  └───────────────────────────────────┘  │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
    ┌───▼──┐  ┌───▼──┐  ┌──▼────┐
    │Ollama│  │Eleven│  │Twilio │
    │      │  │Labs  │  │       │
    │(Chat)│  │(Voice)  │(Calls)│
    └──────┘  └──────┘  └───────┘
```

## ✨ Enjoy!

You're all set! Start chatting and calling with LocalAgent! 🎉

Questions? Check the code comments or read full docs in `IMPLEMENTATION_SUMMARY.md`.

---

**Happy hacking!** 🚀
