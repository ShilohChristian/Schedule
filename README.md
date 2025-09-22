# Shiloh Christian Schedule

A customizable schedule countdown website designed for students and faculty to track class periods in real time.

## Features

### 📅 Schedule Management
- Live countdown timer updating the current period and automatically switching schedules (Normal, Chapel, Late/Early Pep Rally, or Custom).
- Rename periods and create custom schedules tailored to your needs.
- Schedules are saved locally and synced using Firebase Firestore.

### 🎨 Background & Gradient Customization
- Choose to display a background image or a customizable gradient.
- Adjust gradient settings including colors, angle, and multiple color stops.
- Seamlessly toggle between gradient and image backgrounds.
- Chrome extension integration (Gradient Grabber) allows syncing custom gradient settings across devices.

### 🔧 Visual Customization
- Personalize the schedule box with custom background and text colors.
- Fine-tune timer shadow effects and overall typography.
- Real-time updates with persistence via localStorage and Firestore.

### 🔐 Secure Authentication & Settings Sync
- Authentication via Google using Firebase.
- User-specific settings (visual options, schedules, background, and gradient configurations) are securely stored and synced with Firestore.

## Usage
- Access the sidebar to modify schedule, background, gradient, and display settings.
- Use the Gradient Grabber Chrome extension to easily update gradient styles.
- Customizations persist across sessions and devices using Firebase.

## License
This project is licensed under the MIT License.

## Acknowledgments
- Developed by [Shiloh Christian](https://shilohchristian.github.io/Schedule/)
- Inspired by modern school scheduling needs.

Note: Fixed a runtime error where `loadGradientDirection` was missing from `script2.js` (added helper functions `loadGradientDirection` and `updateGradientDirection` to initialize and sync the gradient direction select control).

