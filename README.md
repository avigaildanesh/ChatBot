# ChatBot – Appointment Scheduling App

A full-stack chatbot web application that allows patients to book appointments with doctors. The appointments are saved in Google Calendar based on the doctor's email.

---

## 🔧 Prerequisites

* **Node.js**
* **MongoDB** (local or MongoDB Atlas)
* **Google Calendar API** enabled
* A **shared Google Calendar** from the doctor to the service account

---

## 📥 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/avigaildanesh/ChatBot.git
cd ChatBot
```

---

### 2. Install Dependencies

#### Backend:

```bash
cd server
npm install
```

#### Frontend:

```bash
cd ../client
npm install
```

---

## 🧠 Model Installation Steps

### MongoDB Setup

Ensure MongoDB is running on your machine or use MongoDB Atlas.

Update the connection string in `server/server.js`:

```js
mongoose.connect('mongodb://localhost:27017/appointments');
```

---

### Google Calendar Setup

This app uses a **Google Service Account** to insert events into a Google Calendar.

1. Enable **Google Calendar API** in Google Cloud Console

2. Download your `credentials.json` file and place it in:

   ```
   server/google/credentials.json
   ```

3. From the credentials file, copy the service account email. Example:

   ```json
   "client_email": "appointments@wise-coyote-455920-p2.iam.gserviceaccount.com"
   ```

4. **In your Google Calendar (doctor’s Gmail):**

   * Go to Settings → *Share with specific people* → Add:

     ```
     appointments@wise-coyote-455920-p2.iam.gserviceaccount.com
     ```
   * Grant **Editor** permissions.


---

## ▶️ Runtime Commands

### Start the Backend Server:

```bash
cd server
node server.js
```

### Start the React Frontend:

```bash
cd client
npm start
```

The app will be available at:

```
http://localhost:3000
```

---

## ✅ Features

* Doctor registration and login
* Patients can:
  * See available slots
  * Book appointments
  * View existing appointments
  * Cancel appointments
* Doctors can:

  * Define available slots
  * Automatically sync bookings with their Google Calendar

---

---

![image](https://github.com/user-attachments/assets/c4a9b349-a2b0-436d-960e-200a59523def)
![image](https://github.com/user-attachments/assets/c59a8140-7088-4a59-bcf1-4b5ad61ebb01)
![image](https://github.com/user-attachments/assets/8668818e-e5bb-4b74-986f-edf193cbd475)
![image](https://github.com/user-attachments/assets/42030e36-fe23-49ba-a825-d963088860fd)



