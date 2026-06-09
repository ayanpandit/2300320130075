# Affordmed Full Stack Assessment - Notification System

PLEASE READE THIS -------
I am using macOS, and during development, I ran into a major Axios Network Error / CORS issue. It turns out that on modern versions of macOS, Apple's built-in "AirPlay Receiver" service automatically occupies **port 5000** in the background. 

Since my backend proxy was initially trying to use port 5000, macOS was quietly intercepting the frontend's API calls and rejecting them with a 403 Forbidden error!

**How I fixed it:** I simply moved the backend Express proxy to run on **port 5001** instead, and updated the React frontend to fetch from `http://localhost:5001/api/notifications`. 

---

## How to Test and Run the Application

To test this project, you will need to open **two** separate terminal windows.

### STEP 1: Start the Backend Proxy
First, we need to start the backend server so it can securely fetch the notifications using my access token.
1. Open a terminal.
2. Navigate into the backend folder:
   ```bash
   cd notification_app_be
   ```
3. Start the server:
   ```bash
   node server.js
   ```
*(It should say: "Backend proxy running on http://localhost:5001")*

### STEP 2: Start the Frontend React App
Now, open a **second** terminal to start the UI.
1. Navigate into the frontend folder:
   ```bash
   cd notification_app_fe
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
*(It should say: "VITE ready in... Local: http://localhost:3000/")*

### STEP 3: View the Results!
Open your web browser and go to:
- **http://localhost:3000** -> Here you can see **All Notifications** (Filterable, visually distinguishing read/unread).
- **http://localhost:3000/priority** -> Here you can see the **Priority Inbox** (Strictly top 10 notifications ranked by Placement > Result > Event, and then by Timestamp recency).

*(Note: The JWT token expires very quickly by design. If the UI ever loads blank unexpectedly, the `ACCESS_TOKEN` inside `notification_app_be/.env` just needs to be refreshed!)*
