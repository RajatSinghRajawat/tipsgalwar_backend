require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const { connectDb } = require('./src/config/config');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
// Express 5 compatible mongo sanitize middleware to prevent NoSQL injection (strips keys starting with $ or containing .)
const mongoSanitize = () => {
  const clean = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          clean(obj[key]);
        }
      }
    }
  };
  return (req, res, next) => {
    if (req.body) clean(req.body);
    if (req.params) clean(req.params);
    if (req.query) clean(req.query);
    next();
  };
};

<<<<<<< HEAD
const batch_Router = require('./src/routes/batch');
const course_Router = require('./src/routes/course');
const employee_Router = require('./src/routes/employees');
const student_Router = require('./src/routes/students');
const auth_Router = require('./src/routes/auth');
const apply_Router = require('./src/routes/apply');
const contact_Router = require('./src/routes/contact');
const exam_Router = require('./src/routes/exam');
=======
const batch_Router = require('./src/routes/batch.js');
const course_Router = require('./src/routes/Course.js');
const employee_Router = require('./src/routes/employees.js');
const student_Router = require('./src/routes/students.js');
const apply_Router = require('./src/routes/apply.js');
const auth_Router = require('./src/routes/authroutes.js');
const contact_Router = require('./src/routes/contact.js');
const payment_Router = require('./src/routes/paymentRoutes.js');
>>>>>>> ed5cec7855c9b1c81d00c64538139545fe8b44fd

const port = process.env.PORT || 3005;
const app = express();

<<<<<<< HEAD
// Set security HTTP headers
app.use(helmet());

// Limit JSON request payload size to prevent DoS (LPDoS / huge payloads)
app.use(express.json({ limit: '10kb' }));

// Sanitize inputs to prevent NoSQL injection (strip characters starting with $ or containing .)
app.use(mongoSanitize());

// Restrict CORS to trusted origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like curl, postman or local tests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is a local development address
    const isLocalhost = origin.startsWith('http://localhost:') || 
                        origin.startsWith('http://127.0.0.1:') || 
                        origin === 'http://localhost' || 
                        origin === 'http://127.0.0.1';

    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*') || isLocalhost) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Apply Rate Limiting to all API endpoints to protect against Brute Force & Replay Attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { message: "Too many requests from this IP, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/apis', apiLimiter);
=======
// Upload folder
const uploadsDir = path.join(__dirname, 'public', 'Uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
>>>>>>> ed5cec7855c9b1c81d00c64538139545fe8b44fd

app.use('/uploads', express.static(uploadsDir));
app.use(express.static(uploadsDir));

// Routes
app.use('/apis/batch', batch_Router);
app.use('/apis/course', course_Router);
app.use('/apis/employee', employee_Router);
app.use('/apis/student', student_Router);
app.use('/apis/auth', auth_Router);
app.use('/apis/apply', apply_Router);
app.use('/apis/contact', contact_Router);
<<<<<<< HEAD
app.use('/apis/exam', exam_Router);
=======
app.use('/apis/payment', payment_Router);
>>>>>>> ed5cec7855c9b1c81d00c64538139545fe8b44fd

connectDb();

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
