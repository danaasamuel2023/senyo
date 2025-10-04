# UnlimitedData GH - Complete System Guide

## 🚀 System Overview

UnlimitedData GH is a comprehensive data bundle marketplace with three distinct user types:
1. **Customers** - Purchase data bundles
2. **Agents** - Sell data bundles and earn commissions
3. **Admins** - Manage the entire platform

---

## 📁 Project Structure

```
senyo/
├── Client/                          # Frontend (Next.js 13+)
│   ├── app/
│   │   ├── admin/                   # Admin panel
│   │   │   ├── dashboard/           # Main admin dashboard
│   │   │   ├── agents/              # Agent management
│   │   │   ├── products/            # Product management
│   │   │   ├── analytics/           # Analytics dashboard
│   │   │   └── transactions/        # Transaction management
│   │   ├── agent/                   # Agent portal
│   │   │   └── dashboard/           # Agent dashboard
│   │   ├── agent-store/[agentCode]/ # Public agent storefronts
│   │   ├── agent-signup/            # Agent registration
│   │   ├── SignIn/                  # Login page
│   │   ├── SignUp/                  # Customer registration
│   │   └── settings/                # User settings
│   ├── component/
│   │   └── nav.jsx                  # Main navigation
│   └── utils/
│       └── adminApi.js              # API client
├── server/                          # Backend (Express.js)
│   ├── admin-management/            # Admin routes
│   ├── AuthRoutes/                  # Authentication
│   ├── orderRou/                    # Order processing
│   ├── schema/                      # MongoDB schemas
│   └── scripts/                     # Utility scripts
└── Documentation files
```

---

## 🔐 User Roles & Access

### 1. Admin
- **Access**: Full platform control
- **Login**: sunumanfred14@gmail.com / Kingfred4190$
- **Dashboard**: `/admin/dashboard`
- **Capabilities**:
  - Manage all users
  - Approve/reject agents
  - Assign products to agents
  - View analytics
  - Process transactions
  - Update system settings

### 2. Agent
- **Registration**: `/agent-signup`
- **Dashboard**: `/agent/dashboard`
- **Store**: `/agent-store/[your-agent-code]`
- **Capabilities**:
  - View assigned products
  - Manage customers
  - Track commissions
  - Share store link
  - View performance metrics

### 3. Customer (Buyer)
- **Registration**: `/SignUp`
- **Dashboard**: `/`
- **Capabilities**:
  - Purchase data bundles
  - View transaction history
  - Manage wallet
  - Refer friends

---

## 🎯 Core Features

### Admin Panel Features

#### 1. Dashboard Overview
- Real-time statistics
- 7-day sales chart
- Recent activities
- Quick actions

#### 2. User Management
- View all users
- Search and filter
- Enable/disable accounts
- Add/deduct wallet funds
- Delete users

#### 3. Agent Management ⭐ NEW
- View all agents
- Approve new applications
- Manage agent catalogs
- Set commission rates
- Monitor performance
- Filter by status/level

#### 4. Product Management
- Network inventory control
- Stock status toggles
- API enable/disable
- View product analytics

#### 5. Order Management
- View all orders
- Update statuses
- Bulk operations
- Automatic refunds

#### 6. Transaction Management
- View transaction history
- Verify payments
- Update statuses
- Filter and search

#### 7. Analytics
- Revenue trends
- Order analytics
- User growth
- Network distribution
- Performance metrics

### Agent Store Features ⭐ NEW

#### 1. Agent Registration
- Multi-step form
- ID verification
- Bank details collection
- Terms acceptance
- Automatic approval workflow

#### 2. Agent Dashboard
- **Overview**: Key metrics, store link, performance
- **My Store**: View assigned products
- **Customers**: Customer management
- **Commissions**: Earnings tracking
- **Performance**: Analytics
- **Profile**: Settings

#### 3. Product Catalog
- Admin-assigned products
- Custom pricing per agent
- Enable/disable products
- Product descriptions
- Network variety

#### 4. Public Storefront
- Unique URL per agent
- Professional design
- Shopping cart
- Secure checkout
- Mobile responsive

#### 5. Commission System
- Percentage-based earnings
- Real-time tracking
- Monthly payments
- Performance bonuses
- Level-based rates

---

## 🗄️ Database Structure

### User Schema Extensions

#### Agent Metadata
```javascript
{
  agentCode: "ABC123-AG",              // Unique identifier
  territory: "Accra",                  // Location
  commissionRate: 5,                   // Percentage
  totalCommissions: 2340.50,           // Total earned
  pendingCommissions: 450.00,          // Awaiting payment
  paidCommissions: 1890.50,            // Already paid
  customerBase: 45,                    // Total customers
  activeCustomers: 32,                 // Active customers
  agentStatus: "active",               // Status
  agentLevel: "silver",                // Tier level
  bankDetails: { ... },                // Payment info
  documents: { ... }                   // Verification
}
```

#### Agent Catalog Schema
```javascript
{
  agentId: ObjectId,
  items: [
    {
      network: "YELLO",
      capacity: 50,
      price: 45.00,
      enabled: true,
      title: "MTN 50GB Bundle",
      description: "Fast and reliable"
    }
  ]
}
```

---

## 🔄 User Workflows

### Agent Onboarding
1. Agent visits `/agent-signup`
2. Completes 4-step registration
3. System creates agent with status="pending"
4. Admin receives notification
5. Admin reviews in `/admin/agents`
6. Admin approves agent
7. Admin assigns products to agent catalog
8. Agent receives approval notification
9. Agent logs in to `/agent/dashboard`
10. Agent shares store link with customers

### Product Sale via Agent
1. Customer clicks agent's store link
2. Views agent's custom product catalog
3. Adds products to cart
4. Logs in (if not already)
5. Enters recipient phone number
6. Completes purchase
7. System processes order
8. Customer receives data
9. Agent earns commission
10. Commission tracked in agent dashboard

### Admin Product Assignment
1. Admin logs into dashboard
2. Navigates to "Agents" tab
3. Finds active agent
4. Clicks "Manage Catalog" icon
5. Clicks "Add Product"
6. Selects network, capacity, price
7. Submits form
8. Product appears in agent's catalog
9. Agent can see it in "My Store"
10. Product visible in public storefront

---

## 📡 API Routes

### Authentication
- `POST /api/v1/register` - User registration (supports agent role)
- `POST /api/v1/login` - User login
- `POST /api/create-admin` - Create admin (admin only)

### Admin - User Management
- `GET /api/users` - Get all users
- `PUT /api/users/:id` - Update user
- `PUT /api/users/:id/toggle-status` - Enable/disable user
- `DELETE /api/users/:id` - Delete user

### Admin - Agent Management ⭐
- `GET /api/agents` - List all agents
- `GET /api/agents/:id/catalog` - Get agent catalog
- `POST /api/agents/:id/catalog/item` - Add product
- `PUT /api/agents/:id/catalog/item/:itemId` - Update product
- `DELETE /api/agents/:id/catalog/item/:itemId` - Remove product

### Agent Routes ⭐
- `GET /api/agent/catalog` - Get my catalog (agent auth)

### Public Routes ⭐
- `GET /api/public/agent-store/:agentCode` - Public agent store (no auth)

### Orders
- `GET /api/orders` - Get all orders (admin)
- `PUT /api/orders/:id/status` - Update order status
- `POST /api/orders/bulk-status-update` - Bulk update

### Transactions
- `GET /api/transactions` - Get all transactions (admin)
- `GET /api/verify-paystack/:reference` - Verify payment
- `PUT /api/transactions/:id/update-status` - Update status

### Dashboard & Analytics
- `GET /api/dashboard/statistics` - Dashboard stats
- `GET /api/daily-summary` - Daily summary

---

## 🎨 UI Pages

### Admin Pages
| Page | Route | Purpose |
|------|-------|---------|
| Admin Dashboard | `/admin/dashboard` | Main control panel |
| Agents Management ⭐ | `/admin/agents` | Manage agents & catalogs |
| Products | `/admin/products` | Inventory control |
| Analytics | `/admin/analytics` | Business analytics |
| Transactions | `/admin/transactions` | Financial tracking |
| Users | (embedded in dashboard) | User management |
| Orders | (embedded in dashboard) | Order management |

### Agent Pages ⭐
| Page | Route | Purpose |
|------|-------|---------|
| Agent Signup | `/agent-signup` | Registration form |
| Agent Dashboard | `/agent/dashboard` | Agent control panel |
| Agent Store (Public) | `/agent-store/[code]` | Customer-facing store |

### Customer Pages
| Page | Route | Purpose |
|------|-------|---------|
| Home | `/` | Main dashboard |
| Sign In | `/SignIn` | Login |
| Sign Up | `/SignUp` | Registration |
| Settings | `/settings` | User settings |

---

## 💰 Commission System

### Commission Rates by Level
- **Bronze**: 5% (default)
- **Silver**: 6-7%
- **Gold**: 8-9%
- **Platinum**: 10%+

### Calculation
```javascript
// For each completed order
commission = orderPrice * (commissionRate / 100)

// Example: Agent sells 50GB for GHS 45 at 5% rate
commission = 45 * (5 / 100) = GHS 2.25
```

### Payment Schedule
- **Frequency**: Monthly (1st of each month)
- **Minimum Payout**: GHS 50
- **Method**: Bank transfer or Mobile Money
- **Tracking**: Real-time in agent dashboard

### Agent Level Progression
Based on monthly performance:
- **Bronze → Silver**: 50+ sales/month
- **Silver → Gold**: 100+ sales/month
- **Gold → Platinum**: 200+ sales/month

---

## 🔧 How to Start the Server

### Step 1: Navigate to Server Directory
```powershell
cd server
```

### Step 2: Install Dependencies (First Time Only)
```powershell
npm install
```

### Step 3: Start the Server
```powershell
npm start
```

### Step 4: Verify Server is Running
You should see:
```
MongoDB Connected...
Server running on port 5000
```

### Step 5: Start Frontend (New Terminal)
```powershell
cd Client
npm install  # First time only
npm run dev
```

### Step 6: Access the Application
Open browser to: http://localhost:3000

---

## 📝 Getting Started Checklist

### Initial Setup
- [ ] Install Node.js (v18+)
- [ ] Clone repository
- [ ] Install backend dependencies (`cd server && npm install`)
- [ ] Install frontend dependencies (`cd Client && npm install`)
- [ ] Verify MongoDB connection

### Admin Setup
- [ ] Run `node server/scripts/checkAdmin.js` to verify admin exists
- [ ] Login at `/SignIn` with admin credentials
- [ ] Access admin dashboard at `/admin/dashboard`
- [ ] Familiarize with admin features

### Agent System Setup ⭐
- [ ] Test agent registration at `/agent-signup`
- [ ] Approve agent in admin dashboard
- [ ] Add products to agent catalog
- [ ] Verify agent can see products
- [ ] Test public agent store

### Testing Workflow
- [ ] Create test agent account
- [ ] Approve agent as admin
- [ ] Add 3-5 products to agent catalog
- [ ] Visit agent's public store
- [ ] Test purchase flow
- [ ] Verify commission tracking

---

## 🐛 Troubleshooting

### Server Won't Start

**Error**: "Cannot find module"
```powershell
cd server
npm install
```

**Error**: "Port already in use"
```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Login Issues

**"An error occurred"**
- Ensure server is running
- Check network tab in browser
- Verify API URL matches server

**"Access denied"**
- Check user role matches route requirement
- Verify auth token in localStorage
- Try logging out and back in

### Agent Store Not Loading

**404 Error**
- Verify agent code is correct
- Check agent status is "active"
- Ensure agent has products in catalog

**Products Not Showing**
- Admin must add products first
- Products must be enabled
- Agent must be approved

---

## 🌟 Key Highlights

### What's New in Agent Store

1. **Multi-Role Authentication**
   - Automatic role-based redirects
   - Separate dashboards for each role
   - Secure role verification

2. **Agent Onboarding**
   - Beautiful 4-step registration
   - ID verification system
   - Bank details collection
   - Automatic approval workflow

3. **Product Catalog Management**
   - Admin assigns products to agents
   - Custom pricing per agent
   - Enable/disable control
   - Real-time updates

4. **Public Storefronts**
   - Each agent gets unique URL
   - Branded with agent info
   - Shopping cart functionality
   - Mobile responsive

5. **Commission Tracking**
   - Real-time calculation
   - Performance metrics
   - Level progression
   - Payment management

---

## 📊 System Statistics

### Current Implementation
- ✅ 3 User roles (admin, agent, customer)
- ✅ 8 Admin dashboard pages
- ✅ 6 Agent dashboard sections
- ✅ 5 Network providers
- ✅ Unlimited product variations
- ✅ Real-time commission tracking
- ✅ 10+ API endpoints for agent system
- ✅ Complete approval workflow
- ✅ Public storefront system

---

## 🎓 Usage Examples

### Example 1: Admin Creates Agent Store

```bash
# 1. Login as admin
Visit: http://localhost:3000/SignIn
Email: sunumanfred14@gmail.com
Password: Kingfred4190$

# 2. Go to Agents tab
Click "Agents" in sidebar

# 3. Find pending agent
Look for agents with yellow "pending" badge

# 4. Approve agent
Click eye icon → "Approve Agent"

# 5. Add products
Click package icon → "Add Product"
Network: YELLO
Capacity: 50
Price: 45.00

# 6. Agent can now sell
Agent sees product in "My Store"
```

### Example 2: Agent Shares Store

```bash
# 1. Agent logs in
Visit: http://localhost:3000/SignIn
Use agent credentials

# 2. View store link
Dashboard shows unique store link
Example: http://localhost:3000/agent-store/ABC123-AG

# 3. Copy link
Click copy button

# 4. Share with customers
WhatsApp, SMS, Email, Social Media

# 5. Monitor sales
"My Customers" and "Commissions" tabs
```

### Example 3: Customer Purchases

```bash
# 1. Click agent's store link
Example: http://localhost:3000/agent-store/ABC123-AG

# 2. Browse products
See all available data bundles

# 3. Add to cart
Click "Add to Cart" on desired products

# 4. Checkout
Click floating cart button
Enter recipient phone number

# 5. Complete purchase
Order processed immediately
Agent earns commission
```

---

## 📈 Performance & Scalability

### Database Optimization
- Indexed fields for fast queries
- Compound indexes for common queries
- Sparse indexes for optional fields
- Lean queries for read operations

### Frontend Optimization
- Server-side rendering (Next.js)
- Code splitting
- Lazy loading
- Optimized images

### API Optimization
- Connection pooling
- Query optimization
- Caching strategies
- Batch operations

---

## 🔒 Security Features

### Authentication
- JWT tokens (7-day expiry)
- Password hashing (bcrypt, 12 rounds)
- Role-based access control
- Session management

### Data Protection
- Input validation
- SQL injection prevention
- XSS protection
- CSRF tokens

### Agent Verification
- ID document verification
- Bank account validation
- Admin approval required
- Territory assignment

---

## 📱 Mobile Responsiveness

All pages are fully responsive:
- ✅ Admin dashboard (tablet & mobile)
- ✅ Agent dashboard (mobile-first)
- ✅ Agent storefront (mobile optimized)
- ✅ Signup forms (touch-friendly)

---

## 🚦 Status & Next Steps

### Completed ✅
- [x] Admin panel with full CRUD
- [x] Agent role and schema
- [x] Agent registration flow
- [x] Agent approval system
- [x] Product catalog management
- [x] Agent dashboard
- [x] Public agent storefronts
- [x] Commission tracking
- [x] Multi-role authentication
- [x] All navigation and routing

### Pending ⏳
- [ ] Real commission payment processing
- [ ] Agent withdrawal requests
- [ ] Customer review system
- [ ] Advanced analytics
- [ ] Email notifications
- [ ] SMS integration for agents
- [ ] Agent training materials
- [ ] Automated level progression

---

## 🎉 Quick Start

### 1. Start Backend (Terminal 1)
```powershell
cd server
npm install
npm start
```

### 2. Start Frontend (Terminal 2)
```powershell
cd Client
npm install
npm run dev
```

### 3. Access System
- **Main App**: http://localhost:3000
- **Admin**: http://localhost:3000/admin/dashboard
- **Agent Signup**: http://localhost:3000/agent-signup

### 4. Test Admin Features
- Login with admin credentials
- Navigate to "Agents" tab
- Review pending agents
- Manage catalogs

### 5. Test Agent Features
- Register new agent at `/agent-signup`
- Approve in admin dashboard
- Add products to agent catalog
- Login as agent
- View store link
- Visit public storefront

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review `AGENT_STORE_DOCUMENTATION.md`
3. Check `START_SERVER_GUIDE.md`
4. Review browser console logs
5. Check server terminal logs

---

**System Version**: 2.0.0
**Last Updated**: October 2024
**Agent Store Feature**: ✅ Complete
