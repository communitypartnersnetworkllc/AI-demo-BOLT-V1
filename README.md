# AI Demo BOLT V1 - Production Ready

A production-ready AI voice assistant demo with Gemini Live API integration.

## 🚀 Quick Start (Single Command)

From a fresh clone to production ready:

```bash
./start.sh
```

Or using npm:

```bash
npm run start
```

## 📋 What the Start Script Does

1. **Cleanup**: Kills any existing processes
2. **Dependencies**: Installs npm packages if needed
3. **Verification**: Checks all production changes are in place
4. **Port Management**: Finds available port automatically
5. **Configuration**: Updates server config for optimal performance
6. **Launch**: Starts the production server with full logging

## ✨ Production Features

### UI Improvements
- ✅ **Fixed AI Configuration Dropdown**: Dark background for better visibility
- ✅ **Clean Interface**: Removed "Click to Start" text from middle of page
- ✅ **Professional Debug Button**: Moved to bottom-right with hover effects
- ✅ **Enhanced Styling**: Professional appearance throughout

### Business Features
- ✅ **Auto-Population**: Company/Agent/Customer names in system instructions
- ✅ **Dynamic Personalization**: AI uses configured names in conversations
- ✅ **Persistent Configuration**: Settings saved to localStorage
- ✅ **7 Service Types**: Each with customizable system instructions

### Technical Features
- ✅ **4 Gemini Models**: All available and configured
- ✅ **CORS Enabled**: Works in iframe environments
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **Error Handling**: Comprehensive error management

## 🔧 Manual Setup (Alternative)

If you prefer manual setup:

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Access at http://localhost:12001 (or next available port)
```

## 📱 Access URLs

After running `./start.sh`, the application will be available at:

- **Local**: `http://localhost:[PORT]/`
- **Network**: `http://[YOUR_IP]:[PORT]/`
- **External**: `https://work-2-gfenbbccygflxpvq.prod-runtime.all-hands.dev`

## 🛠️ Configuration

### Business Information
Configure in the AI Configuration modal:
- **Company Name**: Default "Community Partners Network LLC"
- **Agent Name**: Default "Sarah"
- **Customer Name**: For personalized outbound sales

### AI Models
- Gemini 1.5 Flash
- Gemini 1.5 Pro
- Gemini 2.0 Flash Experimental
- Gemini 2.0 Flash Thinking Experimental

### Service Types
1. Customer Support
2. Sales Assistant
3. Technical Support
4. Appointment Scheduling
5. Lead Qualification
6. Product Information
7. Outbound Sales (with customer personalization)

## 📊 Monitoring

- **Server Logs**: `tail -f server.log`
- **Process Status**: Check PID displayed at startup
- **Stop Server**: `kill [PID]` or `pkill -f vite`

## 🔒 Security

- CORS enabled for iframe support
- No sensitive data in client-side code
- API keys handled securely
- Production-ready headers configured

## 🎯 Production Ready Checklist

- [x] UI improvements implemented
- [x] Business personalization working
- [x] All models configured and tested
- [x] Error handling in place
- [x] Responsive design verified
- [x] Performance optimized
- [x] Security headers configured
- [x] Logging and monitoring setup

## 📞 Support

For issues or questions:
1. Check `server.log` for error details
2. Verify all files are present with `./start.sh`
3. Ensure port is available (script handles this automatically)

---

**Ready for production deployment!** 🚀
