# NestJS Auth & API Key Kit

A production-ready NestJS portfolio kit demonstrating JWT authentication and secure API key management. Perfect for freelance client projects requiring flexible authentication strategies.

## 🎯 What Problem Does This Solve?

Many client projects need:
- **User authentication** with email/password and JWT tokens
- **API keys** for service-to-service communication or long-lived access
- **Flexible authentication** supporting both JWT Bearer tokens and API keys on the same endpoints
- **Security best practices** with password hashing and API key hashing
- **Rate limiting** to prevent abuse
- **Database connectivity monitoring** with health checks

This kit provides all of the above with clean NestJS architecture, ready to deploy and extend.

## ✨ Features

- ✅ Email/password signup and login with JWT access tokens
- ✅ Password hashing using bcrypt
- ✅ JWT-based authentication with Passport.js
- ✅ API key generation, listing, and revocation
- ✅ Secure API key storage (only hash + prefix stored, plaintext shown once)
- ✅ Flexible auth guard accepting EITHER JWT Bearer OR `X-API-Key` header
- ✅ Rate limiting on API key creation endpoint
- ✅ Health check endpoint with database connectivity status
- ✅ Prisma + PostgreSQL with User and ApiKey models
- ✅ TypeScript with strict configuration
- ✅ Input validation with class-validator

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted on Railway, Neon, Supabase, etc.)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd nestjs-auth-api-key-kit

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your actual database credentials and JWT secret
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Optional: Open Prisma Studio to view your data
npx prisma studio
```

### Run the Application

```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## 📖 API Usage Examples

### 1. Check Health

```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected"
}
```

### 2. User Signup

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

**Response:**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. User Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

**Response:**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. Create API Key (Requires JWT)

```bash
curl -X POST http://localhost:3000/api-keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Production API Key"
  }'
```

**Response:**
```json
{
  "id": "uuid-here",
  "name": "Production API Key",
  "keyPrefix": "a1b2c3d4",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "key": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"
}
```

⚠️ **Important:** Save the `key` value immediately - it will never be shown again!

### 5. List API Keys (Requires JWT)

```bash
curl http://localhost:3000/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
[
  {
    "id": "uuid-here",
    "name": "Production API Key",
    "keyPrefix": "a1b2c3d4",
    "lastUsedAt": "2024-01-15T11:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### 6. Access Protected Route with JWT

```bash
curl http://localhost:3000/protected/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "message": "This is a protected route",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "authenticatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### 7. Access Protected Route with API Key

```bash
curl http://localhost:3000/protected/profile \
  -H "X-API-Key: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"
```

**Response:**
```json
{
  "message": "This is a protected route",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "authenticatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### 8. Revoke API Key (Requires JWT)

```bash
curl -X DELETE http://localhost:3000/api-keys/KEY_UUID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "message": "API key revoked successfully"
}
```

## 🏗️ Project Structure

```
src/
├── auth/                   # Authentication module
│   ├── dto/               # Data transfer objects
│   ├── strategies/        # Passport JWT strategy
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/                  # Users module
│   ├── users.service.ts
│   └── users.module.ts
├── api-keys/              # API keys module
│   ├── dto/
│   ├── api-keys.controller.ts
│   ├── api-keys.service.ts
│   └── api-keys.module.ts
├── prisma/                # Database module
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── common/                # Shared resources
│   ├── guards/           # Auth guards
│   └── decorators/       # Custom decorators
├── app.controller.ts     # Health check & demo routes
├── app.module.ts         # Root module
└── main.ts              # Application entry point

prisma/
└── schema.prisma         # Database schema
```

## 🔒 Security Features

### Password Security
- Passwords hashed using bcrypt with 10 salt rounds
- Minimum 8 character password requirement
- Secure password validation on login

### API Key Security
- API keys are 64-character hexadecimal strings (256 bits of entropy)
- Only the hash is stored in the database (bcrypt)
- Key prefix stored for identification (first 8 characters)
- Plaintext key shown only once during creation
- Last used timestamp tracked for auditing

### Rate Limiting
- API key creation endpoint limited to 5 requests per minute per user
- Global rate limiting: 10 requests per minute per IP
- Configurable via `@nestjs/throttler`

### JWT Security
- Tokens expire after 7 days (configurable)
- Signed with secret key (store securely in production)
- Validated on every protected request

## 🚢 Deployment

### Environment Variables

Set these environment variables in your deployment platform:

```env
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
DIRECT_URL=postgresql://user:password@host:5432/database?schema=public
JWT_SECRET=<generate-a-strong-random-secret>
PORT=3000
```

**Generate a secure JWT secret:**
```bash
openssl rand -base64 32
```

### Deploy to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and initialize
railway login
railway init

# Add PostgreSQL
railway add --plugin postgresql

# Deploy
railway up
```

### Deploy to Render

1. Create new Web Service
2. Connect your repository
3. Set build command: `npm install && npx prisma generate && npm run build`
4. Set start command: `npx prisma db push && npm run start:prod`
5. Add environment variables
6. Add PostgreSQL database from Render dashboard

### Deploy to Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Initialize and deploy
fly launch
fly deploy
```

### Database Migration in Production

```bash
# After deploying, run migrations
npx prisma db push

# Or generate and apply migrations
npx prisma migrate deploy
```

## 🧪 Testing the API

You can use the included curl examples, or import this collection into Postman/Insomnia:

1. Create a user with `/auth/signup`
2. Copy the `accessToken` from the response
3. Use the token to create an API key at `/api-keys`
4. Copy the `key` from the response (save it - you won't see it again!)
5. Test the protected route with both JWT and API key

## 📝 Extending This Kit

### Add More Protected Routes

```typescript
@Get('your-route')
@UseGuards(FlexibleAuthGuard)
async yourRoute(@GetUser() user: any) {
  // Your logic here
  return { userId: user.id };
}
```

### Add Refresh Tokens

Extend the auth module to issue refresh tokens alongside access tokens for longer sessions.

### Add OAuth Social Login

Integrate Passport strategies for Google, GitHub, etc.

### Add Email Verification

Send verification emails after signup and verify email before allowing login.

### Add Role-Based Access Control

Extend the User model with roles and create role guards.

## 🛠️ Tech Stack

- **Framework:** NestJS 10.x
- **Language:** TypeScript 5.x
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Passport.js + JWT
- **Validation:** class-validator + class-transformer
- **Security:** bcrypt for hashing
- **Rate Limiting:** @nestjs/throttler

## 📄 License

MIT

## 🤝 Contributing

This is a portfolio project, but suggestions and improvements are welcome! Feel free to open issues or submit pull requests.

---

Built with ❤️ using NestJS
