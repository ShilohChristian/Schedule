# Shiloh Christian Schedule

A modern, customizable schedule countdown tool designed for students, faculty, and staff to track class periods in real time with a clean, branded interface.

---

## Features

### 📅 Dynamic Schedule Management
- Live countdown timer that automatically updates as periods change  
- Supports **Normal**, **Chapel**, **Pep Rally**, **Late Start**, and fully **custom** schedules  
- Rename periods, adjust timings, and create personalized schedule sets  
- All schedule data is saved locally and synced through Firebase Firestore  

---

### 🎨 Background & Gradient Customization
- Choose between a **background image** or a **custom gradient**  
- Fine-tune gradient angle, color stops, and opacity  
- Smoothly switch between gradient and image modes  
- Chrome extension integration allows gradient styles to sync across devices  

---

### 🔧 Visual Customization Tools
- Customize the **schedule box** with your preferred background, opacity, and text color  
- Adjust **timer shadow** settings including blur, distance, and angle  
- Full typography controls including font selection and preview  
- All changes apply instantly and persist using localStorage and Firestore  

---

### 🔐 Secure Authentication & Cloud Sync
- Sign in with Google through Firebase Authentication  
- User-specific preferences (schedules, backgrounds, gradients, UI settings) sync securely across devices via Firestore  

---

### 🧩 Chrome Extension Integration
- The **Shiloh Schedule: Extension** provides:
  - Quick gradient adjustments  
  - Automatic syncing to the main site  
  - Background previews in new tabs  
  - One-click visual customization  


---

## Usage
- Open the sidebar to manage schedules, backgrounds, gradients, and display settings  
- Customize freely — changes save instantly and sync across sessions  
- Use the upcoming Chrome extension for faster gradient updates and multi-device consistency  

---

## Development Notes
- Fixed a runtime issue involving a missing `loadGradientDirection` function in `script2.js`  
- Added `loadGradientDirection` and `updateGradientDirection` helpers to synchronize the gradient direction selector  
- Added high-resolution `favicon.svg` (with PNG fallback) for improved branding across platforms  

---

## License
This project is licensed under the **MIT License**.

---

## Acknowledgments
- Developed by **Shiloh Christian**  
- Inspired by modern school scheduling needs  
- Designed with clarity, accessibility, and simplicity in mind  
