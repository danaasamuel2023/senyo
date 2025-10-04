# How to Start the Server

## PowerShell (Windows)

PowerShell doesn't support the `&&` operator. Use these commands instead:

### Method 1: Separate Commands
```powershell
cd server
npm start
```

### Method 2: One Line (PowerShell syntax)
```powershell
cd server; npm start
```

### Method 3: Using Start-Process
```powershell
Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory ".\server"
```

## Command Prompt (Windows)

```cmd
cd server && npm start
```

## Bash/Git Bash (Windows/Mac/Linux)

```bash
cd server && npm start
```

## Verifying Server is Running

After starting the server, you should see:
```
MongoDB connected with optimized settings
Connected to MongoDB
Server running on port 5000
```

Check if port 5000 is listening (PowerShell):
```powershell
netstat -an | Select-String ":5000"
```

## Common Issues

### Issue: "Cannot find module"
**Solution**: Install dependencies first
```powershell
cd server
npm install
npm start
```

### Issue: "Missing script: start"
**Solution**: Check package.json has the start script
```json
{
  "scripts": {
    "start": "node index.js"
  }
}
```

### Issue: "MongoDB connection error"
**Solution**: Check MongoDB connection string in `server/DataBaseConnection/connection.js`

### Issue: "Port 5000 already in use"
**Solution**: Kill the existing process or use a different port
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process by PID
taskkill /PID <PID> /F
```

## Running Both Frontend and Backend

### Terminal 1 (Backend):
```powershell
cd server
npm start
```

### Terminal 2 (Frontend):
```powershell
cd Client
npm run dev
```

## Development URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Admin Dashboard**: http://localhost:3000/admin/dashboard
- **Agent Dashboard**: http://localhost:3000/agent/dashboard
- **Agent Signup**: http://localhost:3000/agent-signup
- **Example Agent Store**: http://localhost:3000/agent-store/ABC123-AG

## Testing the Admin Account

### Login Credentials
- **Email**: sunumanfred14@gmail.com
- **Password**: Kingfred4190$
- **Role**: admin

### After Login
- Automatically redirected to `/admin/dashboard`
- Can manage users, orders, agents, products

## Creating Additional Agents

### Method 1: Public Signup
1. Visit `/agent-signup`
2. Complete registration form
3. Admin approves in dashboard

### Method 2: Admin Creation
1. Login as admin
2. Go to "Users" tab
3. Create user with role="agent"
4. Set agentMetadata fields

### Method 3: Script
```powershell
cd server
node scripts/createAgent.js
```

## Tips

### Development Mode
- Frontend runs on port 3000 (Next.js)
- Backend runs on port 5000 (Express.js)
- API calls use `http://localhost:5000` in development

### Production Mode
- Update API URLs to production endpoints
- Set proper environment variables
- Enable HTTPS
- Use production MongoDB instance

### Debugging
1. Check browser console for frontend errors
2. Check terminal for backend logs
3. Use Network tab to inspect API calls
4. Verify localStorage for auth tokens

## Quick Commands Reference

```powershell
# Navigate to server
cd server

# Install dependencies
npm install

# Start server
npm start

# Check admin user
node scripts/checkAdmin.js

# Create admin user
node scripts/createAdmin.js

# Update user to admin
node scripts/updateToAdmin.js

# Clear node modules and reinstall
Remove-Item node_modules -Recurse -Force
npm install
```

## Monitoring

### Check Server Health
```powershell
# Check if server is running
curl http://localhost:5000

# Check specific endpoint
curl http://localhost:5000/api/dashboard/statistics
```

### View Logs
Server logs appear in the terminal where you ran `npm start`

## Stopping the Server

### PowerShell/Command Prompt
Press `Ctrl + C`

### If Running in Background
```powershell
# Find Node processes
Get-Process node

# Stop specific process
Stop-Process -Name node -Force

# Or by PID
Stop-Process -Id <PID>
```

---

**Need Help?** Check the console logs for detailed error messages.
