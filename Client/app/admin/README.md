# Admin Panel Documentation

## Overview
The UnlimitedData GH Admin Panel is a comprehensive dashboard for managing users, orders, transactions, and system settings.

## Access
- **URL**: `http://localhost:3000/admin/dashboard`
- **Authentication**: Requires admin role
- **Default Admin**: Check with system administrator

## Features

### 1. Dashboard Overview
- **Real-time Statistics**: Total users, orders, revenue, and active users
- **Sales Chart**: 7-day sales visualization
- **Recent Activities**: Latest orders and transactions
- **Quick Actions**: Shortcuts to common tasks

### 2. User Management
- **View Users**: Browse all registered users with search and filter
- **User Actions**:
  - View user details and order history
  - Edit user information
  - Enable/Disable accounts
  - Delete users (with cascade deletion)
- **Wallet Management**:
  - Add money to user wallets
  - Deduct money with reason tracking
- **Filters**: By role (admin, buyer, seller, dealer)

### 3. Order Management
- **Order List**: View all data purchase orders
- **Status Management**: Update order status (pending, processing, completed, failed)
- **Filters**: By status, network, date range
- **Bulk Actions**: Update multiple orders at once
- **Automatic Refunds**: Failed orders trigger automatic wallet refunds

### 4. Transaction Management
- **Transaction History**: All financial transactions
- **Verification**: Paystack payment verification
- **Filters**: By type, status, gateway, date
- **Manual Updates**: Update transaction status with notes

### 5. Inventory Management
- **Network Status**: Toggle network availability
- **API Control**: Enable/disable Geonettech API per network
- **Stock Management**: Mark networks as in/out of stock

## API Endpoints

### User Management
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `PUT /api/users/:id/add-money` - Add wallet funds
- `PUT /api/users/:id/deduct-money` - Deduct wallet funds
- `PUT /api/users/:id/toggle-status` - Enable/disable user
- `DELETE /api/users/:id` - Delete user
- `GET /api/user-orders/:userId` - Get user orders

### Order Management
- `GET /api/orders` - Get all orders
- `PUT /api/orders/:id/status` - Update order status
- `POST /api/orders/bulk-status-update` - Bulk update orders

### Transaction Management
- `GET /api/admin/transactions` - Get all transactions
- `GET /api/admin/transactions/:id` - Get transaction details
- `GET /api/admin/verify-paystack/:reference` - Verify Paystack payment
- `PUT /api/admin/transactions/:id/update-status` - Update transaction

### Inventory Management
- `GET /api/inventory` - Get all inventory status
- `GET /api/inventory/:network` - Get network status
- `PUT /api/inventory/:network/toggle` - Toggle stock status
- `PUT /api/inventory/:network/toggle-geonettech` - Toggle API

### Dashboard & Statistics
- `GET /api/dashboard/statistics` - Get dashboard stats
- `GET /api/daily-summary` - Get daily summary

## Security Features
- JWT authentication required
- Admin role verification
- Session management
- Activity logging
- Secure API endpoints

## Best Practices
1. **Regular Monitoring**: Check dashboard daily for pending orders
2. **User Management**: Review new user registrations
3. **Order Processing**: Process pending orders promptly
4. **Refund Policy**: Failed orders automatically refund to wallet
5. **Inventory Updates**: Keep network availability current

## Troubleshooting

### Common Issues
1. **Login Failed**: Ensure user has admin role
2. **API Errors**: Check server logs and network connection
3. **Missing Data**: Verify database connection
4. **Slow Loading**: Check server performance

### Support
For technical support, contact the development team.

## Development

### Technologies
- **Frontend**: Next.js 13+, React, Tailwind CSS
- **Backend**: Express.js, MongoDB, Mongoose
- **Authentication**: JWT tokens
- **UI Components**: Custom React components with Lucide icons

### Local Development
```bash
# Frontend
cd Client
npm install
npm run dev

# Backend
cd server
npm install
npm start
```

### Environment Variables
```env
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000

# Backend (.env)
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

## Updates and Maintenance
- Regular security updates
- Feature enhancements based on feedback
- Performance optimizations
- Bug fixes and improvements

---

Last Updated: October 2024
Version: 1.0.0
