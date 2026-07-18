# DevPulse Frontend

DevPulse Frontend is a React-based web application that provides GitHub Developer Analytics. It allows users to search GitHub profiles, analyze developer activity, generate developer cards, and create professional resumes.

---

## Features

- User Registration
- User Login with JWT Authentication
- Forgot Password using OTP
- GitHub Profile Search
- Reputation Score Calculation
- Repository Statistics
- Contribution Activity Chart
- Programming Language Analysis
- Developer Card Generator
- Download Dev Card as PNG
- Resume Generator
- Responsive User Interface
- Professional Error Handling
- Loading Indicators during API Calls

---

## Tech Stack

- React.js
- Tailwind CSS
- Axios
- React Router DOM
- Chart.js
- html2canvas

---

## Project Structure

```
devpulse-frontend/
│
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── assets/
│   ├── App.js
│   └── index.js
│
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## Installation

Clone the repository

```bash
git clone https://github.com/farihaabbasi06/DevPulse.git
```

Go to the frontend folder

```bash
cd DevPulse/devpulse-frontend
```

Install dependencies

```bash
npm install
```

Start the development server

```bash
npm start
```

The application will run on

```
http://localhost:3000
```

---

## Backend Requirement

The frontend requires the backend server to be running.

Backend URL (Development)

```
http://localhost:5000
```

If deploying, update the API URL to your deployed backend.

---

## Environment Variables

Create a `.env` file inside the frontend directory.

Example:

```env
REACT_APP_API_URL=http://localhost:5000
```

For deployment:

```env
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

---

## Available Scripts

Start development server

```bash
npm start
```

Build production version

```bash
npm run build
```

Run tests

```bash
npm test
```

---

## Main Pages

- Login
- Register
- Forgot Password
- Dashboard
- Developer Card
- Resume

---

## Main Components

- Language Chart
- Contribution Chart
- Score Ring
- Dev Card
- Resume Generator

---

## API Endpoints Used

```
POST /api/register
POST /api/login
POST /api/forgot-password
POST /api/reset-password

GET /api/user/:username
GET /api/repos/:username
GET /api/commits/:username
GET /api/pullrequests/:username
GET /api/contributions/:username
```

---

## Dependencies

Some important packages used in this project:

- React
- Axios
- React Router DOM
- Tailwind CSS
- html2canvas
- Chart.js

Install all packages using

```bash
npm install
```

---



## Future Improvements

- PDF Resume Export
- Dark/Light Theme
- More GitHub Analytics
- Profile Comparison
- Better Mobile Optimization

---

## Author

**Fariha Abbasi**

Software Engineering

COMSATS University Islamabad

Abbottabad Campus

---

## License

This project was developed for educational purposes