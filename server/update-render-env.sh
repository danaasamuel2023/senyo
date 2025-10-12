#!/bin/bash

# Update Render Environment Variables
# This script helps update the Render service with correct environment variables

echo "🚀 Updating Render Environment Variables..."

# Check if we're in the right directory
if [ ! -f "index.js" ]; then
    echo "❌ Error: index.js not found. Please run this script from the server directory."
    exit 1
fi

echo "📋 Environment Variables to Update:"
echo ""
echo "🔑 Paystack Configuration:"
echo "   PAYSTACK_SECRET_KEY=sk_live_d5228090985d3b7d9f8df6de2921b02615ccf73b"
echo "   PAYSTACK_PUBLIC_KEY=pk_live_6c2f71cb00f87a32fb593bc0c679cfd28f5ab2d3"
echo "   PAYSTACK_WEBHOOK_SECRET=sk_live_d5228090985d3b7d9f8df6de2921b02615ccf73b"
echo ""
echo "📡 Data Mart API Configuration:"
echo "   DATAMART_API_KEY=6b44260b0877209a9c9fc98f0dd719806adeddc1dd8d0418bd7963eacf4b6b"
echo ""
echo "🗄️  Database Configuration:"
echo "   MONGODB_URI=mongodb+srv://dajounimarket:0246783840Sa@cluster0.kp8c2.mongodb.net/unlimiteddata?retryWrites=true&w=majority&appName=Cluster0"
echo ""
echo "🔐 Security Configuration:"
echo "   JWT_SECRET=DatAmArt_Production_Secure_Key_2024"
echo ""
echo "🌐 Application URLs:"
echo "   FRONTEND_URL=https://www.unlimiteddatagh.com"
echo "   SERVER_URL=https://unlimitedata.onrender.com"
echo ""
echo "⚙️  Server Configuration:"
echo "   NODE_ENV=production"
echo "   PORT=3000"
echo ""

echo "📝 Instructions:"
echo "1. Go to https://render.com/dashboard"
echo "2. Navigate to your 'unlimitedata' service"
echo "3. Click on 'Environment' tab"
echo "4. Add/Update the environment variables listed above"
echo "5. Click 'Save Changes'"
echo "6. The service will automatically restart with new variables"
echo ""

echo "🧪 After updating, test the service:"
echo "   curl https://unlimitedata.onrender.com/api/v1/health"
echo "   curl -X POST https://unlimitedata.onrender.com/api/v1/deposit \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"userId\":\"VALID_USER_ID\",\"amount\":100,\"email\":\"test@example.com\"}'"
echo ""

echo "📊 Monitor deployment progress in the Render dashboard."
echo "⏱️  Deployment typically takes 2-5 minutes."
echo ""

read -p "Press Enter to continue..."
