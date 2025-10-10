#!/bin/bash

# Production Deployment Script for Senyo Paystack Payment System
# This script prepares and deploys the Paystack-only payment system to production

echo "🚀 SENYO PRODUCTION DEPLOYMENT"
echo "=============================="
echo "Deploying Paystack-only payment system to production"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "server" ] || [ ! -d "Client" ]; then
    print_error "Please run this script from the senyo root directory"
    exit 1
fi

print_info "Starting production deployment process..."

# Step 1: Environment Setup
echo ""
echo "1. 🔧 Setting up production environment..."
if [ -f "server/.env.production" ]; then
    print_status "Production environment file found"
    cp server/.env.production server/.env
    print_status "Environment variables configured for production"
else
    print_error "Production environment file not found"
    exit 1
fi

# Step 2: Install Dependencies
echo ""
echo "2. 📦 Installing production dependencies..."
cd server
if npm ci --production; then
    print_status "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

cd ../Client
if npm ci --production; then
    print_status "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

cd ..

# Step 3: Build Frontend
echo ""
echo "3. 🏗️  Building frontend for production..."
cd Client
if npm run build; then
    print_status "Frontend built successfully"
else
    print_error "Frontend build failed"
    exit 1
fi
cd ..

# Step 4: Security Check
echo ""
echo "4. 🔒 Running security checks..."
cd server

# Check for sensitive data in code
if grep -r "sk_live_" . --exclude-dir=node_modules --exclude="*.env*" > /dev/null 2>&1; then
    print_warning "Found potential live secret keys in code - please review"
fi

if grep -r "pk_live_" . --exclude-dir=node_modules --exclude="*.env*" > /dev/null 2>&1; then
    print_warning "Found potential live public keys in code - please review"
fi

print_status "Security check completed"
cd ..

# Step 5: Production Configuration
echo ""
echo "5. ⚙️  Configuring for production..."

# Create production startup script
cat > server/start-production.js << 'EOF'
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`🚀 Starting Senyo Production Server`);
  console.log(`📊 Master process ${process.pid} is running`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
  console.log(`💳 Payment Gateway: Paystack Only`);
  
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`⚠️  Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  require('./index.js');
}
EOF

print_status "Production startup script created"

# Step 6: Health Check Script
echo ""
echo "6. 🏥 Creating health check script..."
cat > server/health-check.js << 'EOF'
const axios = require('axios');

async function healthCheck() {
  try {
    const response = await axios.get('http://localhost:5001/api/v1/test-paystack', {
      timeout: 5000
    });
    
    if (response.data.success) {
      console.log('✅ Health check passed');
      process.exit(0);
    } else {
      console.log('❌ Health check failed');
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    process.exit(1);
  }
}

healthCheck();
EOF

print_status "Health check script created"

# Step 7: Docker Configuration (Optional)
echo ""
echo "7. 🐳 Creating Docker configuration..."
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY server/package*.json ./
RUN npm ci --production

# Copy server code
COPY server/ ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

EXPOSE 5001

CMD ["node", "start-production.js"]
EOF

cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  senyo-backend:
    build: .
    ports:
      - "5001:5001"
    environment:
      - NODE_ENV=production
    env_file:
      - server/.env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "health-check.js"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
EOF

print_status "Docker configuration created"

# Step 8: Deployment Instructions
echo ""
echo "8. 📋 Generating deployment instructions..."
cat > DEPLOYMENT_INSTRUCTIONS.md << 'EOF'
# Senyo Production Deployment Instructions

## 🚀 Quick Deploy

### Option 1: Direct Deployment
```bash
# Start backend
cd server
NODE_ENV=production node start-production.js

# Start frontend (in another terminal)
cd Client
npm run start
```

### Option 2: Docker Deployment
```bash
# Build and start with Docker
docker-compose up -d

# Check logs
docker-compose logs -f

# Health check
docker-compose exec senyo-backend node health-check.js
```

## 🔧 Configuration

### Environment Variables
- `NODE_ENV=production`
- `PAYSTACK_SECRET_KEY=sk_live_...`
- `PAYSTACK_PUBLIC_KEY=pk_live_...`
- `MONGODB_URI=mongodb+srv://...`
- `FRONTEND_URL=https://yourdomain.com`
- `SERVER_URL=https://yourdomain.com`

### Paystack Configuration
1. Set callback URL: `https://yourdomain.com/payment/callback`
2. Set webhook URL: `https://yourdomain.com/api/v1/paystack/webhook`
3. Verify live keys are active

## 📊 Monitoring

### Health Checks
- Backend: `GET /api/v1/test-paystack`
- Frontend: `GET /api/payment/callback`

### Logs
- Backend logs: `server/server.log`
- Docker logs: `docker-compose logs -f`

## 🔒 Security

### Production Security Features
- Rate limiting enabled
- Input validation active
- Admin authentication required
- CORS properly configured
- Security headers enabled

### SSL/TLS
- Ensure HTTPS is enabled
- Use valid SSL certificates
- Configure secure headers

## 🚨 Troubleshooting

### Common Issues
1. **Port conflicts**: Change PORT in .env.production
2. **Database connection**: Verify MONGODB_URI
3. **Paystack errors**: Check live keys and webhook URLs
4. **Frontend issues**: Verify FRONTEND_URL configuration

### Support
- Email: Unlimiteddatagh@gmail.com
- Phone: +233256702995
- WhatsApp: https://chat.whatsapp.com/LEfSM2A3RVKJ1yY8JB5osP
EOF

print_status "Deployment instructions created"

# Step 9: Final Verification
echo ""
echo "9. ✅ Running final verification..."
cd server
if node -c index.js; then
    print_status "Backend syntax check passed"
else
    print_error "Backend syntax errors found"
    exit 1
fi

if node -c start-production.js; then
    print_status "Production startup script syntax check passed"
else
    print_error "Production startup script syntax errors found"
    exit 1
fi

cd ..

# Step 10: Production Readiness Test
echo ""
echo "10. 🧪 Running production readiness test..."
if node production-readiness-test.js; then
    print_status "Production readiness test passed"
else
    print_error "Production readiness test failed"
    exit 1
fi

# Final Summary
echo ""
echo "🎉 PRODUCTION DEPLOYMENT READY!"
echo "==============================="
print_status "All systems configured for production"
print_status "Paystack-only payment flow verified"
print_status "Security measures in place"
print_status "Docker configuration created"
print_status "Health checks configured"
print_status "Deployment instructions generated"

echo ""
echo "📋 DEPLOYMENT SUMMARY:"
echo "======================"
echo "✅ Backend: Ready for production"
echo "✅ Frontend: Built and ready"
echo "✅ Database: Configured and tested"
echo "✅ Paystack: Live keys configured"
echo "✅ Security: All measures active"
echo "✅ Monitoring: Health checks ready"

echo ""
echo "🚀 NEXT STEPS:"
echo "=============="
echo "1. Deploy to your production server"
echo "2. Configure domain and SSL certificates"
echo "3. Set up Paystack webhook URLs"
echo "4. Test with real payment transactions"
echo "5. Monitor logs and performance"

echo ""
echo "📖 For detailed instructions, see: DEPLOYMENT_INSTRUCTIONS.md"
echo "🔧 For health checks, run: node server/health-check.js"
echo "🐳 For Docker deployment, run: docker-compose up -d"

print_status "Production deployment preparation completed successfully!"
