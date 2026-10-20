# Thura Restaurant POS (Point of Sale) System

A modern, offline-capable Restaurant Point of Sale (POS) system built with **React 19**, **TypeScript**, **Vite**, **Zod**, and **PocketBase (Embedded SQLite)**. Designed for speed, reliability, zero recurring costs, and local network (LAN) operations.

---

## 🌟 Key Features

- **Table-Centric Ordering**:
  - Live visual table layout with occupied/available status.
  - Real-time WebSocket updates via PocketBase (`tables` collection).
  - Quick table switching and occupancy monitoring.
- **Dynamic POS & Cart System**:
  - Real-time product search and category filtering.
  - Cart item management (increment, decrement, remove, clear).
  - Multi-level draft persistence: local browser storage (`pos_cart_<tableId>`) + server pending orders.
  - Automatic tax calculation (5% configurable commercial tax).
- **Invoice & Thermal Printing**:
  - Post-checkout invoice summary with itemized breakdown.
  - Live kitchen order queue with sent, preparing, ready, and served states (screen based; no KOT paper printing).
- **Order Cancellation History**:
  - Pending orders can be cancelled with a required reason while preserving the sale record, staff name, and cancellation time.
- **Daily Closing**:
  - Admins can close a business date after all orders are completed or cancelled, compare expected cash with counted cash, and review payment totals and prior closings.
  - Optimized `@media print` layout tailored for standard 58mm / 80mm POS thermal receipt printers.
- **Product & Category Management**:
  - CRUD operations for restaurant menus and categories.
  - Foreign-key relational categorization with lazy-loaded image fallbacks.
- **Role-Based Access Control (RBAC)**:
  - Multi-tier authentication (`Admin` and `Staff`).
  - Protected route guards: Staff accounts are restricted to `/tables` and `/products`, while `/reports`, `/users`, and `/categories` are strictly Admin-only.
- **Sales Analytics & Reports**:
  - KPI cards: Today's Revenue, Order Volume, and Average Ticket Size.
  - 7-day revenue trend visualized with interactive Line Charts (Recharts).
  - Searchable transaction history with receipt IDs, payment methods, and timestamps.
- **Offline & Local Network Ready**:
  - Operates completely without internet on your restaurant's local Wi-Fi router (LAN).
  - Zero recurring cloud hosting fees.

---

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, Vite (v8) |
| **Application Types & Validation** | TypeScript, Zod |
| **Routing** | React Router DOM v7 (Route-level code splitting via `React.lazy`) |
| **Styling & UI** | Tailwind CSS v3.4, Lucide React, Sonner (Toast notifications) |
| **Server State & Caching**| TanStack React Query v5 |
| **Backend & Database** | PocketBase v0.40+ (Single executable, embedded SQLite in WAL mode) |
| **Data Visualization** | Recharts v3.7 |
| **Date & Time** | Moment.js |

---

## 📁 Project Directory Structure

```text
resturant-post/
├── backend/                  # PocketBase backend
│   ├── pb_data/              # SQLite database & uploaded files (git-ignored)
│   ├── pb_public/            # Production SPA build output (git-ignored)
│   └── pocketbase            # PocketBase executable binary
├── scripts/
│   └── setup_pocketbase.js   # Automated schema creation & data seeder
├── src/                      # TypeScript React application
│   ├── schemas/              # Zod runtime validation schemas
│   ├── types/                # Shared domain models and inferred form types
│   ├── assets/               # Static assets & icons
│   ├── components/           # UI and feature components
│   │   ├── ui/               # Reusable atomic UI (Button, Card, Modal, Table, Badge, Input)
│   │   ├── CartPanel.tsx     # POS cart panel
│   │   ├── CategoryForm.tsx  # Category modal form
│   │   ├── InvoiceModal.tsx  # Printable receipt voucher
│   │   ├── ProductCard.tsx   # Menu item card with image error fallback
│   │   ├── ProductForm.tsx   # Product modal form
│   │   ├── ProtectedRoute.tsx# Role-guarded route wrapper
│   │   ├── Sidebar.tsx       # Responsive navigation sidebar
│   │   └── UserForm.tsx      # Staff/Admin user modal form
│   ├── config/
│   │   └── constants.ts      # App configuration, tax rates & helper functions
│   ├── contexts/
│   │   ├── AuthContext.tsx   # Session provider
│   │   └── authContextDef.ts # Dedicated React context definition
│   ├── hooks/
│   │   ├── useAuth.ts        # Auth state hook
│   │   └── useCart.ts        # Cart management hook with local storage hydration
│   ├── layout/
│   │   └── MainLayout.tsx    # Dashboard layout wrapper
│   ├── pages/                # Lazy-loaded route views
│   │   ├── Categories.tsx    # Category management (Admin)
│   │   ├── DailyClosing.tsx  # Daily sales close and cash reconciliation (Admin)
│   │   ├── Login.tsx         # Sign-in page
│   │   ├── POS.tsx           # POS ordering interface
│   │   ├── Products.tsx      # Product management
│   │   ├── Reports.tsx       # Analytics & sales history (Admin)
│   │   ├── Tables.tsx        # Table layout view
│   │   └── Users.tsx         # User accounts management (Admin)
│   ├── services/             # API data services (PocketBase SDK)
│   │   ├── apiCategories.ts
│   │   ├── apiProducts.ts
│   │   ├── apiSaleItems.ts
│   │   ├── apiSales.ts
│   │   ├── apiTables.ts
│   │   ├── apiUsers.ts
│   │   └── pocketbase.ts     # PocketBase client instance
│   ├── utils/
│   │   └── format.ts         # Currency and datetime formatting utilities
│   ├── App.tsx               # Main routing & code-split definition
│   └── main.tsx              # React application entrypoint
├── .env                      # Environment configuration
├── package.json              # Dependencies and npm scripts
└── vite.config.js            # Vite bundler & Rollup chunking configuration
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### 2. Start the PocketBase Backend
Run the PocketBase server on port `8090` (accessible to local Wi-Fi devices):
```bash
npm run pocketbase
```
> *PocketBase will be running at `http://127.0.0.1:8090`.*

### 3. Initialize Database Schema & Seed Data (First-time only)
In a separate terminal window, run the database setup script to create all collections and seed initial tables, products, and default users:
```bash
npm run setup:db
```

### 4. Start the Frontend Development Server
```bash
npm run dev
```

Run the TypeScript check with `npm run typecheck`.
Open your browser at `http://localhost:5173`.

---

## 🚀 Single-Port Production Build & Deployment

In production, PocketBase can serve **both** the React frontend application and the backend API from a single port (`8090`):

```bash
# 1. Build the frontend directly into PocketBase's public directory
npm run build:prod

# 2. Run PocketBase
npm run pocketbase
```

Now open `http://127.0.0.1:8090` (or `http://<your-lan-ip>:8090`) to access the full application without running any separate Node.js server!

---

## 🐳 Docker Deployment (Recommended for Local Server & Production)

To deploy the entire POS system in a restaurant with zero manual dependency setups, use Docker Compose:

```bash
# 1. Build and run backend (PocketBase) and frontend (Nginx) in background
docker compose up -d --build

# 2. (First-time only) Initialize database schema & seed initial accounts:
npm run setup:db
```

- **Frontend Application**: `http://localhost` (or `http://<local-lan-ip>`)
- **PocketBase Admin UI**: `http://localhost:8090/_/` (or via `/api/` reverse-proxy on port 80)
- **Data Persistence**: Database records, receipts, and images are securely mounted in the `pb_data` Docker volume.
- **Auto-Restart**: Configured with `restart: unless-stopped` to resume automatically after power outages.

To stop the containers:
```bash
docker compose down
```

---

## 📜 Available CLI Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server on port `5173`. |
| `npm run build` | Compiles and optimizes the frontend into the `dist/` folder. |
| `npm run build:prod` | Compiles the frontend directly into `backend/pb_public/` for single-port delivery. |
| `npm run lint` | Runs ESLint on the JavaScript configuration and utility scripts. |
| `npm run typecheck` | Checks the TypeScript modules without emitting files. |
| `npm run preview` | Previews the compiled production build locally. |
| `npm run pocketbase` | Launches the PocketBase executable server on `0.0.0.0:8090`. |
| `npm run setup:db` | Seeds default tables, categories, products, and admin/staff accounts. |

---

## 🔑 Default Credentials

### POS Application (`/login`)
| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@pos.com` | `admin12345` | Full access (POS, Reports, Users, Menu, Categories) |
| **Staff** | `staff@pos.com` | `staff12345` | POS Ordering, Table management, Menu view |

### PocketBase Admin Dashboard (`http://127.0.0.1:8090/_/`)
| User Type | Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Superuser** | `admin@pos.com` | `1234567890` | Database management, backups, schema inspection |

---

## 🛡 Production Service Setup (Auto-Start on Boot)

### Linux (Systemd Service)
Create a service file at `/etc/systemd/system/restaurant-pos.service`:
```ini
[Unit]
Description=Restaurant POS PocketBase Server
After=network.target

[Service]
Type=simple
User=thura
WorkingDirectory=/home/thura/Hobby/resturant-post/backend
ExecStart=/home/thura/Hobby/resturant-post/backend/pocketbase serve --http=0.0.0.0:8090
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```
Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable restaurant-pos
sudo systemctl start restaurant-pos
```

### Windows (Task Scheduler or NSSM)
1. Download [NSSM (Non-Sucking Service Manager)](https://nssm.cc/).
2. Run `nssm install RestaurantPOS`.
3. Set the application path to `C:\path\to\backend\pocketbase.exe` with arguments `serve --http="0.0.0.0:8090"`.
4. Start the service. It will automatically launch in the background whenever Windows boots.

---

## 💾 Database Backups
- Automated daily backups can be enabled directly from the PocketBase Admin UI under **Settings → Backups**.
- Backups are stored in `backend/pb_data/backups/`. It is strongly recommended to sync this folder weekly to an external USB drive or cloud storage.
