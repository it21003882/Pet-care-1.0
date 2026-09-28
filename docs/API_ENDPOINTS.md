# PetCare — Complete REST API Reference

All requests and responses use JSON (`Content-Type: application/json`) except file upload endpoints which use `multipart/form-data`.
Standard response envelope:
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {},
  "count": 1
}
```

---

## 1. Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register user account (`name`, `email`, `password`, `phone`, `role`) |
| `POST` | `/api/auth/login` | Public | Authenticate user and return JWT bearer token |
| `GET` | `/api/auth/me` | Protected (Any) | Get authenticated user profile |
| `PUT` | `/api/auth/profile` | Protected (Any) | Update profile information or upload avatar |

---

## 2. Function 1: Pets (`/api/pets`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/pets` | Protected (Owner/Admin) | Create pet profile with optional photo |
| `GET` | `/api/pets` | Protected (Any) | List pets owned by current user |
| `GET` | `/api/pets/:id` | Protected (Any) | Get single pet details |
| `PUT` | `/api/pets/:id` | Protected (Owner/Admin) | Update pet profile |
| `DELETE` | `/api/pets/:id` | Protected (Owner/Admin) | Delete pet profile |

---

## 3. Function 2: Veterinarians (`/api/veterinarians`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/veterinarians` | Public | List & search vets (`?search=`, `?specialization=`, `?location=`) |
| `GET` | `/api/veterinarians/:id` | Public | Get veterinarian schedule and profile details |
| `POST` | `/api/veterinarians` | Protected (Vet/Admin) | Create veterinarian profile |
| `PUT` | `/api/veterinarians/:id` | Protected (Vet/Admin) | Update clinic info or availability |
| `DELETE` | `/api/veterinarians/:id` | Protected (Admin) | Delete veterinarian profile |

---

## 4. Function 3: Appointments (`/api/appointments`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/appointments` | Protected (Owner/Admin) | Book appointment (`petId`, `veterinarianId`, `date`, `time`, `reason`) |
| `GET` | `/api/appointments` | Protected (Any) | List user appointments (`?status=`, `?veterinarianId=`) |
| `GET` | `/api/appointments/:id` | Protected (Any) | Get appointment breakdown |
| `PUT` | `/api/appointments/:id` | Protected (Any) | Update status (`pending`, `confirmed`, `completed`, `cancelled`) |
| `DELETE` | `/api/appointments/:id` | Protected (Any) | Cancel appointment |

---

## 5. Function 4: Medical Records (`/api/medical-records`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/medical-records` | Protected (Vet/Admin) | Create checkup record with medications & vaccines |
| `GET` | `/api/medical-records` | Protected (Any) | List clinical records (`?petId=`, `?veterinarianId=`) |
| `GET` | `/api/medical-records/:id` | Protected (Any) | Get record details |
| `PUT` | `/api/medical-records/:id` | Protected (Vet/Admin) | Update diagnosis or prescription |
| `DELETE` | `/api/medical-records/:id` | Protected (Admin) | Delete clinical entry |

---

## 6. Function 5: Services (`/api/services`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/services` | Public | Browse services (`?category=`, `?search=`, `?available=true`) |
| `GET` | `/api/services/:id` | Public | Get service specifications and duration |
| `POST` | `/api/services` | Protected (Admin) | Add new service (grooming, boarding, etc.) |
| `PUT` | `/api/services/:id` | Protected (Admin) | Update price, availability or details |
| `DELETE` | `/api/services/:id` | Protected (Admin) | Delete service |

---

## 7. Function 6: Bookings & Reviews (`/api/service-bookings` & `/api/reviews`)

### Bookings
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/service-bookings` | Protected (Any) | Reserve service slot (`serviceId`, `petId`, `date`, `time`) |
| `GET` | `/api/service-bookings` | Protected (Any) | List bookings for current user |
| `GET` | `/api/service-bookings/:id`| Protected (Any) | Get booking details |
| `PATCH`| `/api/service-bookings/:id`| Protected (Any) | Cancel or update status |
| `DELETE`| `/api/service-bookings/:id`| Protected (Any) | Remove booking entry |

### Reviews
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/reviews` | Public | List reviews (`?veterinarianId=`, `?serviceId=`) |
| `GET` | `/api/reviews/:id` | Public | Get single review |
| `POST` | `/api/reviews` | Protected (Any) | Submit 1-5 star review with comment |
| `PUT` | `/api/reviews/:id` | Protected (Owner/Admin)| Update review feedback |
| `DELETE`| `/api/reviews/:id` | Protected (Owner/Admin)| Delete review |
