# PetCare — System Architecture & Design

## 🏛 Architectural Pattern
PetCare follows a clean **N-Tier Client-Server Architecture** decoupled via RESTful HTTP APIs.

```text
┌────────────────────────────────────────────────────────┐
│               PRESENTATION LAYER (Mobile)              │
│       React Native + Expo + TypeScript Frontend        │
│    Screens ─── Hooks ─── Context ─── Axios Client      │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / REST (JSON + JWT)
┌───────────────────────────▼────────────────────────────┐
│                API GATEWAY & ROUTING LAYER             │
│        Node.js + Express.js Router (TypeScript)        │
│   Middleware: Auth (JWT), Roles (RBAC), Upload, Errors │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                 BUSINESS LOGIC LAYER                   │
│          Services & Validation Controllers             │
│    Pet, Vet, Appointment, Record, Service, Review      │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                  PERSISTENCE LAYER                     │
│               Mongoose ODM + MongoDB Atlas             │
│        Backend File Storage (/uploads) for Photos      │
└────────────────────────────────────────────────────────┘
```

---

## 🔒 Security Architecture
1. **Transport Security:** All client-server communication transmits over TLS/HTTPS in production.
2. **Authentication Token Lifecycle:**
   - On valid credentials, server signs JWT with HMAC-SHA256 containing `{ id, role }`.
   - Client stores token in device storage via `AsyncStorage`.
   - Interceptors inject `Authorization: Bearer <token>` into outgoing requests.
   - Server decodes token, looks up active user, and populates `req.user`.
3. **Role-Based Authorization:**
   - Middleware `authorize(...roles)` gates access to specific administrative endpoints.
4. **Data Protection:**
   - Password fields hashed with bcrypt (salt cost factor: 10).
   - Passwords excluded by default from queries (`select: false`).

---

## 📦 Scalability & Maintenance Considerations
- **Function Isolation:** Developers can update individual functions (`function1-pets`, `function2-veterinarians`, etc.) without touching neighboring controllers.
- **Lightweight Storage Model:** Pet photos are completely optional. MongoDB stores only path references (`imageUrl: string | null`) without storing image binary data, and uploaded files reside on the backend filesystem.
