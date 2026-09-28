# PetCare — Application Workflow & User Journeys

This document illustrates the end-to-end user workflows from onboarding to clinical and service bookings.

---

## 1. User Onboarding & Authentication Journey

```mermaid
sequenceDiagram
    autonumber
    actor User as Pet Owner
    participant App as Mobile App
    participant API as Express API
    participant DB as MongoDB

    User->>App: Opens App
    App->>App: Checks AsyncStorage for JWT
    alt No Token Found
        App->>User: Renders LoginScreen
        User->>App: Submits Registration / Login credentials
        App->>API: POST /api/auth/login
        API->>DB: Query user & verify bcrypt hash
        DB-->>API: User verified
        API-->>App: Returns { token, user }
        App->>App: Stores token in AsyncStorage
    else Valid Token Found
        App->>API: GET /api/auth/me (Validates session)
        API-->>App: Returns User Profile
    end
    App->>User: Navigates to HomeScreen Dashboard
```

---

## 2. Veterinary Consultation Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Pet Owner
    participant App as Mobile App
    participant API as Express API
    actor Vet as Veterinarian
    participant DB as MongoDB

    Owner->>App: Selects "Find Vets" / "Book Vet"
    App->>API: GET /api/veterinarians
    API-->>App: List of certified doctors & clinics
    Owner->>App: Chooses Doctor, Pet, Date, Time & Reason
    App->>API: POST /api/appointments
    API->>DB: Insert Appointment (Status: Pending)
    DB-->>API: Confirmed creation
    API-->>App: 201 Created

    Vet->>API: PUT /api/appointments/:id (Status: Confirmed)
    Note over Vet,Owner: Consultation takes place

    Vet->>API: POST /api/medical-records (Diagnosis + Medications)
    API->>DB: Store Clinical History
    Vet->>API: PUT /api/appointments/:id (Status: Completed)
    Owner->>App: Views updated Medical Timeline for Pet
```

---

## 3. Pet Service Booking & Review Flow

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Pet Owner
    participant App as Mobile App
    participant API as Express API
    participant DB as MongoDB

    Owner->>App: Browses Pet Services (e.g. Grooming)
    App->>API: GET /api/services
    API-->>App: Catalog of services
    Owner->>App: Selects Pet, Date & Time slot
    App->>API: POST /api/service-bookings
    API->>DB: Create ServiceBooking (Status: Pending)
    API-->>App: Booking Confirmed

    Note over Owner: Grooming session completed
    Owner->>App: Navigates to My Bookings
    Owner->>App: Taps "Leave Review"
    Owner->>App: Submits 5-star rating & comment
    App->>API: POST /api/reviews
    API->>DB: Save Review
    API-->>App: 201 Created
```
