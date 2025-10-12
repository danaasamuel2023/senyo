# Senyo Server - Production Deployment Guide

## 🚀 Quick Start

### Option 1: Simple Production Start
```bash
cd /Users/samtech/Senyo1/senyo/server
NODE_ENV=production PORT=3001 node index.js
```

### Option 2: Auto-Restart Script
```bash
cd /Users/samtech/Senyo1/senyo/server
./start-production.sh
```

### Option 3: PM2 Process Manager (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
cd /Users/samtech/Senyo1/senyo/server
pm2 start ecosystem.config.js

# View logs
pm2 logs senyo-server

# Monitor
pm2 monit

# Restart
pm2 restart senyo-server

# Stop
pm2 stop senyo-server
```

### Option 4: Systemd Service (Linux)
```bash
# Copy service file
sudo cp senyo-server.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable and start service
sudo systemctl enable senyo-server
sudo systemctl start senyo-server

# Check status
sudo systemctl status senyo-server

# View logs
sudo journalctl -u senyo-server -f
```

## 🔧 Environment Configuration

### Required Environment Variables
```env
NODE_ENV=production
PORT=3001
PAYSTACK_SECRET_KEY=sk_live_d5228090985d3b7d9f8df6de2921b02615ccf73b
PAYSTACK_PUBLIC_KEY=pk_live_6c2f71cb00f87a32fb593bc0c679cfd28f5ab2d3
PAYSTACK_WEBHOOK_SECRET=sk_live_d5228090985d3b7d9f8df6de2921b02615ccf73b
MONGODB_URI=mongodb+srv://dajounimarket:0246783840Sa@cluster0.kp8c2.mongodb.net/unlimiteddata?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=DatAmArt_Production_Secure_Key_2024
```

## 📊 Monitoring

### Health Check Endpoint
```bash
curl http://localhost:3001/api/v1/health
```

### Deposit Endpoint Test
```bash
curl -X POST http://localhost:3001/api/v1/deposit \
  -H "Content-Type: application/json" \
  -d '{"userId":"VALID_USER_ID","amount":100,"email":"test@example.com"}'
```

## 🔒 Security Features

- Rate limiting enabled in production
- CORS configured for production domains
- Security headers enabled
- Paystack webhook signature verification
- JWT authentication
- Input validation and sanitization

## 📝 Logs

- Server logs: `./logs/server.log`
- Error logs: `./logs/err.log` (PM2)
- Access logs: `./logs/out.log` (PM2)
- Combined logs: `./logs/combined.log` (PM2)

## 🚨 Troubleshooting

### Server Won't Start
1. Check if port 3001 is available: `lsof -i :3001`
2. Verify environment variables are set
3. Check MongoDB connection
4. Review logs for specific errors

### Deposit Endpoint Issues
1. Verify Paystack keys are correct
2. Test Paystack API directly
3. Check user ID format (must be valid ObjectId)
4. Review server logs for detailed errors

### Performance Issues
1. Monitor memory usage with `pm2 monit`
2. Check database connection pool
3. Review rate limiting settings
4. Monitor external API calls (Paystack)

## 🔄 Updates

### Deploying Updates
1. Stop the server: `pm2 stop senyo-server`
2. Pull latest changes: `git pull`
3. Install dependencies: `npm install`
4. Restart server: `pm2 restart senyo-server`

### Database Migrations
```bash
# Run any database migrations
node scripts/migrate.js
```

## 📞 Support

- Server Status: `pm2 status`
- Logs: `pm2 logs senyo-server`
- Health Check: `curl http://localhost:3001/api/v1/health`
- Paystack Test: `curl -X POST https://api.paystack.co/transaction/initialize -H "Authorization: Bearer sk_live_d5228090985d3b7d9f8df6de2921b02615ccf73b" -H "Content-Type: application/json" -d '{"email":"test@example.com","amount":10000,"currency":"GHS","reference":"test"}'`
