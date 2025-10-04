# Agent Store System Documentation

## Overview
The UnlimitedData GH Agent Store System allows authorized agents to have their own personalized storefront where they can sell data bundles to customers and earn commissions.

## Features

### 1. Agent Registration
- **Multi-Step Registration Form** (`/agent-signup`)
  - Step 1: Basic Information (name, email, phone, password)
  - Step 2: Agent Information (territory, ID verification)
  - Step 3: Payment Details (bank account, mobile money)
  - Step 4: Terms & Agreement
- **Automatic Approval Workflow** - New agents have "pending" status
- **Unique Agent Code Generation** - Each agent gets a unique code (e.g., ABC123-AG)

### 2. Agent Dashboard
- **URL**: `/agent/dashboard`
- **Features**:
  - Overview with key metrics
  - My Store - Display catalog products
  - My Customers - Customer management
  - Commissions - Earnings tracking
  - Performance - Analytics
  - Profile Settings

### 3. Agent Store (Public)
- **URL**: `/agent-store/[agentCode]`
- **Features**:
  - Public storefront accessible to anyone
  - Displays agent's name and contact info
  - Shows only enabled products from agent catalog
  - Shopping cart functionality
  - Checkout process
  - Responsive design

### 4. Admin Management
- **Agent Management Page** (`/admin/agents`)
  - View all agents
  - Filter by status (pending, active, suspended, terminated)
  - Filter by level (bronze, silver, gold, platinum)
  - Approve/reject new agents
  - Update commission rates
  - Manage agent catalogs

### 5. Product Catalog Management
- **Admin Controls**:
  - Add products to agent catalogs
  - Set custom prices per agent
  - Enable/disable products
  - Remove products
  - View catalog statistics

## Database Schema

### Agent Metadata (in User Schema)
```javascript
agentMetadata: {
  agentCode: String (unique),          // Agent's unique code
  territory: String,                   // Geographic territory
  commissionRate: Number (5%),         // Commission percentage
  totalCommissions: Number,            // Total earned
  pendingCommissions: Number,          // Awaiting payment
  paidCommissions: Number,             // Already paid
  customerBase: Number,                // Total customers
  activeCustomers: Number,             // Active customers
  registeredCustomers: Array,          // Customer list
  performanceMetrics: {
    conversionRate: Number,
    averageTicketSize: Number,
    monthlyTarget: Number,
    monthlyAchievement: Number,
    quarterlyBonus: Number
  },
  bankDetails: {
    bankName: String,
    accountName: String,
    accountNumber: String,
    momoNumber: String
  },
  documents: {
    idType: String (enum),
    idNumber: String,
    idVerified: Boolean,
    idVerifiedAt: Date
  },
  agentStatus: String (pending/active/suspended/terminated),
  agentLevel: String (bronze/silver/gold/platinum),
  joinedAsAgent: Date,
  lastActivityAsAgent: Date
}
```

### Agent Catalog Schema
```javascript
{
  agentId: ObjectId (ref: User),
  items: [{
    id: ObjectId,
    network: String (YELLO/TELECEL/AT_PREMIUM/at),
    capacity: Number (GB),
    price: Number (GHS),
    enabled: Boolean,
    title: String,
    description: String,
    createdAt: Date,
    updatedAt: Date
  }],
  updatedAt: Date
}
```

## API Endpoints

### Public Endpoints (No Auth Required)
- `GET /api/public/agent-store/:agentCode` - Get agent store and catalog

### Agent Endpoints (Agent Auth Required)
- `GET /api/agent/catalog` - Get my catalog products

### Admin Endpoints (Admin Auth Required)
- `GET /api/agents` - List all agents
- `GET /api/agents/:id/catalog` - Get agent's catalog
- `POST /api/agents/:id/catalog/item` - Add product to agent catalog
- `PUT /api/agents/:id/catalog/item/:itemId` - Update catalog item
- `DELETE /api/agents/:id/catalog/item/:itemId` - Remove catalog item

## User Flows

### Agent Registration Flow
1. User visits `/agent-signup`
2. Fills multi-step form
3. Submits application
4. System creates agent with "pending" status
5. Admin receives notification
6. Admin reviews and approves/rejects
7. Agent receives notification of approval
8. Agent can access dashboard

### Product Assignment Flow
1. Admin navigates to `/admin/agents`
2. Clicks "Manage Catalog" on agent row
3. Clicks "Add Product" button
4. Selects network, capacity, and price
5. Product added to agent's catalog
6. Agent sees product in "My Store" tab
7. Product visible in public agent store

### Customer Purchase Flow
1. Customer visits agent store link (e.g., `/agent-store/ABC123-AG`)
2. Browses available products
3. Adds products to cart
4. Clicks checkout
5. Enters recipient phone number
6. Completes purchase
7. Agent earns commission
8. Customer receives data bundle

## Agent Levels

### Bronze (Default)
- Commission Rate: 5%
- No special benefits

### Silver
- Commission Rate: 6-7%
- Performance bonus eligible
- Priority support

### Gold
- Commission Rate: 8-9%
- Higher performance bonuses
- Featured in agent directory

### Platinum
- Commission Rate: 10%+
- Maximum bonuses
- Dedicated account manager
- Premium marketing support

## Commission Structure

### Commission Calculation
```javascript
commission = orderAmount * (commissionRate / 100)
```

### Commission States
1. **Pending** - Earned but not yet paid
2. **Paid** - Already transferred to agent

### Payment Schedule
- Monthly payments (1st of each month)
- Minimum payout: GHS 50
- Payment method: Bank transfer or Mobile Money

## Security Features

### Agent Authentication
- JWT token-based authentication
- Role-based access control
- Session management

### Data Protection
- Agent personal info not exposed publicly
- Secure payment processing
- Transaction logging

### Validation
- ID verification required
- Bank account validation
- Territory assignment

## Best Practices

### For Admins
1. **Agent Approval**:
   - Verify ID documents thoroughly
   - Check territory availability
   - Review bank details accuracy
   - Set appropriate commission rates

2. **Catalog Management**:
   - Start with popular products
   - Set competitive prices
   - Monitor product performance
   - Update regularly

3. **Agent Monitoring**:
   - Track sales performance
   - Review customer feedback
   - Adjust commission rates based on performance
   - Promote top performers to higher levels

### For Agents
1. **Store Promotion**:
   - Share store link on social media
   - Send to potential customers via WhatsApp
   - Print business cards with store link
   - Add to email signature

2. **Customer Service**:
   - Respond quickly to inquiries
   - Assist with purchases
   - Follow up after sales
   - Build long-term relationships

3. **Performance**:
   - Track daily sales
   - Monitor commission earnings
   - Set personal targets
   - Strive for level upgrades

## Troubleshooting

### Common Issues

#### Agent Can't Login
- Verify account is approved (agentStatus: 'active')
- Check credentials are correct
- Ensure agent role is set

#### Store Link Not Working
- Verify agent code exists
- Check agent status is "active"
- Ensure catalog has products
- Clear browser cache

#### Products Not Showing
- Admin must add products to catalog
- Products must be enabled
- Agent must be active

#### Commission Not Calculating
- Verify orders are completed
- Check commission rate is set
- Ensure agent-customer link exists

## Development

### Setup
```bash
# Backend
cd server
npm install
npm start

# Frontend
cd Client
npm install
npm run dev
```

### Environment Variables
```env
# Backend
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Testing

#### Test Agent Registration
1. Visit `/agent-signup`
2. Complete all steps
3. Check database for new agent with role="agent"
4. Verify agentMetadata is populated

#### Test Admin Approval
1. Login as admin
2. Navigate to `/admin/agents`
3. Find pending agent
4. Click approve
5. Verify status changes to "active"

#### Test Product Assignment
1. In `/admin/agents`, click "Manage Catalog"
2. Click "Add Product"
3. Fill form and submit
4. Verify product appears in modal
5. Check agent dashboard shows product

#### Test Public Store
1. Get agent code from agent dashboard
2. Visit `/agent-store/[agentCode]`
3. Verify products display
4. Test add to cart
5. Test checkout

## API Response Examples

### Get Agent Store
```json
{
  "success": true,
  "agent": {
    "name": "John Doe",
    "phoneNumber": "+233501234567",
    "agentCode": "ABC123-AG",
    "territory": "Accra",
    "agentLevel": "silver"
  },
  "catalog": [
    {
      "id": "507f1f77bcf86cd799439011",
      "network": "YELLO",
      "capacity": 50,
      "price": 45.00,
      "enabled": true,
      "title": "YELLO 50GB",
      "description": "Fast and reliable MTN data",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Add Catalog Item
```json
{
  "agentId": "507f1f77bcf86cd799439012",
  "items": [
    {
      "id": "507f1f77bcf86cd799439011",
      "network": "YELLO",
      "capacity": 50,
      "price": 45.00,
      "enabled": true,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

## Future Enhancements

### Planned Features
- [ ] Agent referral system
- [ ] Customer loyalty programs
- [ ] Automated commission withdrawals
- [ ] Agent training portal
- [ ] Performance analytics dashboard
- [ ] Customer review system
- [ ] Bulk product assignment
- [ ] Agent tier auto-promotion
- [ ] SMS marketing integration
- [ ] WhatsApp integration

### Potential Improvements
- Real-time notifications for new orders
- Agent leaderboard
- Gamification (badges, achievements)
- Advanced reporting tools
- Mobile app for agents
- API for third-party integrations

---

## Quick Start Guide

### For Admin
1. Login at `/admin/dashboard`
2. Go to "Agents" tab
3. Review and approve pending agents
4. Click "Manage Catalog" on approved agent
5. Add products with custom pricing
6. Monitor agent performance

### For Agents
1. Register at `/agent-signup`
2. Wait for admin approval
3. Login and access dashboard
4. View your store link in "Overview"
5. Share link with customers
6. Monitor sales and commissions

### For Customers
1. Visit agent store link (shared by agent)
2. Browse available products
3. Add products to cart
4. Login or sign up
5. Complete checkout
6. Receive data bundle instantly

---

**Version**: 1.0.0
**Last Updated**: October 2024
**Contact**: Development Team
