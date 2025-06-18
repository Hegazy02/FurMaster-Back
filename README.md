# 🛠️ FurMaster Backend - Express.js API for Full Stack E-commerce

This is the **backend server** for the **FurMaster** e-commerce platform, built using **Express.js** and connected to **MongoDB**. It powers a full-featured e-commerce experience with features like authentication, product and order management, image uploading, secure payments, and OTP verification.

---

## 🚀 Tech Stack

- **Backend Framework:** Express.js (Node.js)
- **Database:** MongoDB (Mongoose ODM)
- **Authentication & Authorization:** JWT (JSON Web Token)
- **Cloud Storage:** Cloudinary (for product and banner images)
- **Payment Integration:** Stripe
- **OTP Service:** Twilio
- **API Testing:** Postman
- **Security:** bcrypt, CORS
- **Other Tools:** dotenv, morgan

---

## ✅ Main Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (`admin`, `user`)
- Encrypted password storage using bcrypt
- Forgot password with OTP via Twilio

### 🛒 E-commerce APIs
- **Products:** Create, read, update, delete; supports multiple colors and per-color quantity
- **Categories:** CRUD operations
- **Cart:** Add, update, and remove items
- **Orders:** Place orders, track order status, and update as admin
- **Banners:** Upload and manage homepage banners

### 📦 Admin Features
- Manage users (view, filter)
- Full CRUD for products, categories, banners
- View and manage orders
- All admin routes protected by JWT and role-check middleware

### 📤 Image Uploads
- Integration with **Cloudinary** to upload and store product images and banners

### 💳 Stripe Integration
- Secure payment session creation for user orders

### 📲 OTP via Twilio
- Users can reset their password using a secure OTP sent via **Twilio SMS**

---

## 📬 Postman Collection

You can test all the backend APIs using the following Postman collection:

🔗 [FurMaster Postman Collection](https://angular-proj.postman.co/workspace/angular-proj-Workspace~e8dd4cd0-4a00-4d31-8b89-eb03c7183e03/collection/26507427-d7b8fecb-0292-4113-9396-63366c8dd77f?action=share&creator=26507427&active-environment=26507427-7c58c67f-e62e-4d9b-908d-65711ed85bdb)

---
## 👨‍💻 Contributors

- **Abdelrahman Ibrahim Hegazy**  
  [GitHub](https://github.com/Hegazy02) • [LinkedIn](https://www.linkedin.com/in/abdelrhmanhegazy)

---

## 🔗 Repositories

- *Frontend Repository (Angular):* [FurMaster Frontend](https://github.com/Hegazy02/FurMaster-Front)
- *Backend Repository (Express.js):* [FurMaster Backend](https://github.com/Hegazy02/FurMaster-Back)

