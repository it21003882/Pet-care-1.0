# PetCare — Production Deployment Guide

This guide covers deploying the PetCare backend to a cloud hosting platform (such as Render, Railway, Heroku, or AWS) and connecting the Expo frontend.

---

## 1. MongoDB Atlas Setup
1. Create a cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user with read/write permissions.
3. Under **Network Access**, add IP `0.0.0.0/0` (allow access from anywhere) or specific host IPs.
4. Copy the connection string format:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/petcare?retryWrites=true&w=majority
   ```

---

## 2. File & Pet Photo Storage
Pet photos are **completely optional**:
* **No external service needed**: No external image-storage service (like Cloudinary) is required.
* **No binary data in MongoDB**: The database stores only a string reference path (`imageUrl: string | null`, e.g. `"/uploads/pet-1712345678-abc.jpg"`) or `null`.
* **Zero broken images**: When no photo is provided, the application automatically displays clean, species-specific avatars.
* **Local disk storage**: Uploaded photos are stored on the server filesystem in `./uploads/` and served statically via Express at `/uploads`.

---

## 3. Backend Deployment (Render / Railway)

### Environment Variables
Configure the following in your deployment settings:
```ini
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pwd>@cluster0.xxxxx.mongodb.net/petcare?retryWrites=true&w=majority
JWT_SECRET=your_super_strong_production_secret_key_12345
JWT_EXPIRES_IN=30d
CORS_ORIGIN=*
```

### Build & Start Commands
- **Build Command:**
  ```bash
  npm install && npm run build
  ```
- **Start Command:**
  ```bash
  npm start
  ```
  *(Runs `node dist/server.js`)*

---

## 4. Mobile Frontend Configuration & Build

### Configure API Endpoint
In `frontend/.env`:
```ini
EXPO_PUBLIC_API_URL=https://your-deployed-backend.onrender.com/api
```

### Testing on Physical Phone with Expo Go
1. Install **Expo Go** from the Apple App Store or Google Play Store.
2. In the `frontend` directory:
   ```bash
   npx expo start --tunnel
   ```
3. Scan the QR code using your phone camera (iOS) or the Expo Go app (Android).

### Standalone Production App (EAS Build)
To generate an `.ipa` (iOS) or `.apk`/`.aab` (Android):
```bash
npm install -g eas-cli
eas login
eas build --platform all
```
