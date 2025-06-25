
---

### ✅ Folder Structure 

```
shopie/
├── backend/                  # NestJS API (Products, Auth, Cart)
│   ├── src/
│   ├── prisma/
│   ├── .env
│   └── ...
├── frontend/                 # Angular App (Shopie UI)
│   ├── src/
│   ├── angular.json
│   ├── package.json
│   └── ...
├── README.md
└── .gitignore
```

---

# 🛍️ Shopie

Shopie is a full-stack e-commerce platform that allows customers to browse, search, and buy products — while giving admins full control over product listings and inventory.

The application is built using :
- NestJS 
- PostgreSQL 
- Prisma
- Angular


## ✨ Features

### 👥 Users
- Register, log in, and reset passwords
- JWT-based authentication
- Roles: `Customer` and `Admin`

### 🛒 Shopping System
- View product listings
- View product details
- Add to cart (reduces stock)
- Cart reflects live product status

### 🛠️ Admin Panel
- Add, update, delete products
- Manage stock levels
- View all products

### 🔎 Global Features
- Product search
- Role-based access (guards)


## 🧱 Tech Stack

| Layer        | Technology                     |
|--------------|--------------------------------|
| Frontend     | Angular 17                     |
| Backend      | NestJS                         |
| Database     | PostgreSQL                     |
| ORM/DB Layer | Prisma                         |
| Auth         | JWT + Passport.js              |
| Styling      | Tailwind CSS                   |



## ⚙️ Getting Started

### 🔧 Backend Setup (NestJS)

```bash
cd shopie/backend
npm install

```

Create a `.env` file:

```env
Database config:

DATABASE_URL="postgresql://user:password@localhost:5432/shopie"

JWT config:

JWT_SECRET="your_secret_here"
JWT_EXPIRATION = 24h

email configurations:

MAIL_HOST=smtp.email.com
MAIL_PORT=587/465
MAIL_USER=your-email@email.com
MAIL_PASS=yourpassword  
MAIL_FROM=your-email@email.com
```

Generate and apply database migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Start the server:

```bash
npm run start:dev
```

The backend API will be running at `http://localhost:3000`

---

### 💻 Frontend Setup (Angular)

```bash
cd Grand Customs/frontend
npm install
```

Start the dev server:

```bash
ng serve
```

The Angular frontend will be running at `http://localhost:4200`

---

## 🧪 Sample Prisma Models

```prisma
model User {
  id       String     @id @default(uuid())
  email    String  @unique
  password String
  role     String
}

model Product {
  id          String     @id @default(uuid())
  name        String
  description String
  price       Float
  imageUrl    String
  stock       Int
}
```

---

