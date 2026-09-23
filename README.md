# EventIQ – Smart Event Ticket Booking & Capacity Management Platform

**Tagline**: *"Book Smarter. Manage Better. Predict Demand."*

EventIQ is a production-grade hackathon prototype for event booking and capacity management. It combines **concurrency-safe MongoDB atomic bookings**, **real-time Socket.IO capacity broadcasting**, and an **independent Python Scikit-Learn ML service** for predicting booking velocity, capacity risks, and sell-out timelines.

---

## System Architecture

```
React Frontend (Vite + Tailwind CSS + Recharts + Socket.IO Client)
       │
       │ REST API / WebSocket
       ▼
Node.js + Express Backend
       ├── JWT Authentication ({ id, role })
       ├── Role-Based Authorization Middleware (authenticateToken, authorizeRole)
       ├── Event & Booking Management
       ├── Concurrency-Safe Atomic Capacity Engine
       └── Socket.IO Real-Time Broadcasting
       │
       ▼
MongoDB Database
       ├── User (Role: 'user')
       ├── Organizer (Role: 'organizer')
       ├── Event (capacity, ticketsSold, availableTickets)
       ├── Booking (bookingId: EVT-2026-XXXXX, status, qrCode)
       └── Waitlist (position, status)
       │
       ▼
Python ML Service (FastAPI + scikit-learn + pandas)
       ├── Demand Forecast (RandomForestRegressor)
       ├── Capacity Risk & Demand Level (GradientBoostingClassifier)
       └── Sell-out Period Estimation
```

---

## Technical Novelty & Key Differentiators

### Why EventIQ is Different from Conventional Booking Systems:

1. **Concurrency-Safe Atomic Capacity Protection**:
   - Standard websites suffer from race conditions where simultaneous requests overbook events (`ticketsSold > capacity`).
   - EventIQ executes MongoDB conditional updates:
     ```javascript
     Event.findOneAndUpdate({ _id: eventId, availableTickets: { $gte: quantity } }, { $inc: { availableTickets: -quantity, ticketsSold: quantity } })
     ```
   - If capacity is exhausted at database level, the request fails atomically without partial state changes.

2. **AI/ML Demand Intelligence**:
   - Predicts future ticket demand velocity and calculates capacity risk (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) using trained machine learning models.
   - Computes expected sell-out timeline (e.g. *"Expected Sell-out: Within 2 days"*) to alert event organizers proactively.
   - Does **not** alter pricing or capacity automatically, preserving core deterministic security.

3. **Real-Time Live Capacity Synchronization**:
   - Integrated Socket.IO broadcasts `EVENT_CAPACITY_UPDATED` events instantly to all active frontend clients without requiring page refreshes.

4. **Strict Dual-Role Security**:
   - Distinct JWT experiences for `USER` and `ORGANIZER`.
   - Organizers cannot buy tickets accidentally; users cannot access event creation/modification APIs.

5. **Digital Pass QR Code Verification**:
   - Generates encrypted digital ticket QR codes upon confirmed booking for on-site scanning.

---

## Database Schema Overview

- **User**: `name`, `email` (unique), `password` (bcrypt hash), `role` (`'user'`)
- **Organizer**: `name`, `email` (unique), `password` (bcrypt hash), `role` (`'organizer'`), `organizationName`
- **Event**: `organizerId` (ref Organizer), `name`, `description`, `category`, `date`, `time`, `venue`, `ticketPrice`, `capacity`, `ticketsSold`, `availableTickets`, `image`, `status` (`ACTIVE`/`CANCELLED`)
- **Booking**: `bookingId` (unique `EVT-2026-XXXXX`), `userId` (ref User), `eventId` (ref Event), `quantity`, `totalAmount`, `status` (`CONFIRMED`/`CANCELLED`), `qrCode`
- **Waitlist**: `userId` (ref User), `eventId` (ref Event), `position`, `status` (`WAITING`/`NOTIFIED`/`CANCELLED`), `joinedAt`

---

## Quickstart & Installation

### Prerequisites
- **Node.js**: v18+
- **Python**: 3.9+
- **MongoDB**: Local instance running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

---

### Step 1: Start Backend Server

```bash
cd eventiq/backend
npm install
npm run seed     # Populates rich demo data (Users, Organizers, Events, Bookings)
npm run dev      # Runs server on http://localhost:5000
```

### Step 2: Start Python ML Service

```bash
cd eventiq/ml-service
pip install -r requirements.txt
python train_model.py  # Generates dataset and trains ML models
python app.py          # Runs FastAPI ML service on http://127.0.0.1:8000
```

### Step 3: Start Frontend Client

```bash
cd eventiq/frontend
npm install
npm run dev      # Opens client on http://localhost:3000
```

---

## Hackathon Demo Step-by-Step Flow

1. **Step 1: Organizer Login**:
   - Navigate to `http://localhost:3000/organizer/login`
   - Email: `organizer@eventiq.com` | Password: `password123`
2. **Step 2: Create Event**:
   - Click `+ Create Event` -> Create **"Tech Fest 2026"** (Capacity: `1000`, Ticket Price: `₹500`).
3. **Step 3: User Login**:
   - In another browser window, navigate to `http://localhost:3000/user/login`
   - Email: `user@eventiq.com` | Password: `password123`
4. **Step 4: Book Tickets**:
   - Browse to "Tech Fest 2026" (Available: 1000) -> Select `5` tickets -> Click `Confirm Booking`.
   - System generates Booking ID: `EVT-2026-A7F82K` with Digital Ticket QR Code.
   - Available capacity drops live to `995`.
5. **Step 5: Live Organizer Update**:
   - Check Organizer Dashboard: Tickets Sold = `5`, Available = `995`, Revenue = `₹2,500`.
6. **Step 6: AI Analytics**:
   - Open `/organizer/analytics` -> Review AI Event Demand Insight card, Demand Level (`HIGH`), Risk score, and 5 Recharts visualizations.
7. **Step 7: Sold Out & Waitlist Test**:
   - View "Symphony Night Concert" (Capacity: 350, Sold: 350).
   - System displays **"SOLD OUT – No tickets available"** and permits joining the Waitlist.

---

## API Summary

- **Auth**: `POST /api/auth/user/register`, `POST /api/auth/user/login`, `POST /api/auth/organizer/register`, `POST /api/auth/organizer/login`
- **Events**: `GET /api/events`, `GET /api/events/:id`, `POST /api/events` (Org), `PUT /api/events/:id` (Org), `DELETE /api/events/:id` (Org)
- **Bookings**: `POST /api/bookings` (User), `GET /api/bookings/my` (User), `DELETE /api/bookings/:id` (User - Cancellation)
- **Waitlist**: `POST /api/events/:id/waitlist`, `GET /api/events/:id/waitlist`
- **Organizer**: `GET /api/organizer/dashboard`, `GET /api/organizer/analytics`, `GET /api/organizer/events/:id/statistics`
- **ML Service**: `POST http://127.0.0.1:8000/predict`
