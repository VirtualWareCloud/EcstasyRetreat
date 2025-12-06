# Ecstasy Retreat — Sensual Luxury Web Application  
A premium, mobile-first therapy booking platform designed for luxurious sensual wellness experiences.  
Built with **HTML, TailwindCSS, JavaScript, and Supabase**, with 2025-style luxury UI components.

---

# 🌟 Overview
Ecstasy Retreat is a modern high-end web application for discovering therapists, viewing image/video galleries, and making secure bookings.  
The platform delivers an ultra-luxury experience built around:

- Neon-pink highlights  
- Black glass UI  
- Blur and glassmorphism  
- Floating shadows  
- Smooth fading animations  
- Realtime Supabase updates  

The application is fully responsive and optimized for mobile-first browsing.

---

# 🧠 Core Features

## 1️⃣ Premium Glassmorphism Header  
- White milky transparent glass  
- Gloss reflection overlay  
- Smooth fade animation  
- Floating menu button  
- Responsive mobile navigation  

## 2️⃣ Hero Slider  
- Full-screen slideshow  
- Fade transitions every 3s  
- CTA buttons overlay  
- Buttons auto-fade in sequence  

---

# 👩‍💼 Therapist Profile System

The therapist profile is one of the flagship features of the application.  
Each profile includes:

## ⭐ High-End Profile Image Component  
- Circular therapist portrait  
- Neon-pink glow ring  
- Hover intensification effect  
- Smooth transitions  

## 🟢 Animated Availability Badge  
- Pulsing availability dot  
- “Available Now” indicator  
- Dynamic colour switching  

## 📖 Therapist Details  
- Name, speciality, location  
- Extended biography  
- Premium glass card layout  

## 💳 Rates Display  
- Dynamically generated  
- Pink neon pricing  
- Clean border separators  

---

# 🖼 IMAGE & VIDEO GALLERY (NEW — Now Documented)

Each therapist has a **full visual presentation system**, including:

## 📸 Image Gallery
- Grid layout (2–4 columns)  
- Hover zoom (scale + shadow)  
- Rounded corners  
- Border highlight  
- Dynamically loaded from:
  - Therapist JSON (localStorage)
  - Supabase (future-ready)

Code structure used:

```json
"gallery": [
  "images/sample1.jpg",
  "images/sample2.jpg"
]
```

## 🎥 Video Gallery
- Embedded MP4 / WebM support  
- Full-screen video playback  
- Clean card design  
- Autoplay disabled for safety  
- Supports:
  - Multiple videos
  - Long-form intro clips
  - Promotional teasers

Code structure:

```json
"videos": [
  "videos/intro1.mp4",
  "videos/promo2.mp4"
]
```

## 🔄 Dynamic Loading  
The profile page automatically loads images & videos:

```javascript
therapist.gallery?.forEach(img => { ... });
therapist.videos?.forEach(video => { ... });
```

This means you can add unlimited images and videos to any therapist without modifying HTML.

---

# 💬 WhatsApp Integration  
Therapists have personal WhatsApp links that auto-generate messages:

```
https://wa.me/<number>?text=Hi, I'd like to book a session with <name>.
```

---

# 💼 Booking System (Supabase Powered)
- Users can make bookings  
- Therapists can manage schedule  
- Admin can oversee all bookings  
- Realtime toast notifications:  
  - “Your booking has been updated”  
  - “Your booking has been accepted”  

---

# 🔐 Authentication + Role Control
Supabase handles:

- User accounts  
- Therapist accounts  
- Admin accounts  

On login:

| Role | Redirect |
|------|----------|
| admin | admin_dashboard.html |
| therapist | therapist_dashboard.html |
| user | user_profile.html |

---

# 📱 Mobile-First Navigation
## 🔽 Mobile Menu
- Dark blurred menu  
- Pink hover states  
- Fast toggle animation  

## ⬆ Bottom Navigation Bar
Includes:

- Home  
- Therapists  
- Book  
- Contact  
- Profile  

High-contrast icons for mobile accessibility.

---

# 🎨 Visual & UI/UX Design Principles
The entire app uses:

- Glassmorphism  
- Neon pink theme  
- Black luxury base  
- 3D card shadows  
- Smooth element transitions  
- Floating containers  
- Auto fade sequences  

---

# 🧰 Technology Stack

| Layer | Technology |
|------|------------|
| Frontend | HTML, TailwindCSS, JavaScript |
| Backend | Supabase (Auth, Database, Realtime) |
| Hosting | GitHub Pages / Vercel |
| Styling | Glassmorphism, Neon Luxury UI |

---

# 🗂 Project Structure

```
/images
/videos
/css
/js
index.html
Therapists_List.html
booking.html
Therapist_Profile.html
video_gallery.html
image_gallery.html
login.html
join.html
README.md
```

---

# 🧩 Therapist Data Structure Example

```json
{
  "name": "Lerato",
  "speciality": "Sensual Massage",
  "location": "Sandton",
  "bio": "Elegant, warm, skilled in energy-based touch.",
  "profile_image": "images/lerato_main.jpg",
  "whatsapp": "0820000000",

  "rates": [
    { "label": "45 minutes", "price": "R650" },
    { "label": "60 minutes", "price": "R800" }
  ],

  "gallery": [
    "images/lerato1.jpg",
    "images/lerato2.jpg"
  ],

  "videos": [
    "videos/lerato_intro.mp4"
  ]
}
```

---

# 🚀 Deployment Instructions

### GitHub Pages
1. Commit all files  
2. Go to **Settings → Pages**  
3. Select:
```
Branch: main
Folder: root
```
Your site auto-publishes.

---

# 🔮 Future Enhancements
- Integrated secure payments (PayFast / Stripe)  
- Therapist chat inbox  
- Ratings + reviews system  
- AI-powered therapist matching  
- Push notifications (PWA upgrade)  

---

# 🖤 Credits
Designed for:  
**Ecstasy Retreat — Sensual Luxury Experience**  
© 2025 Elite Companionship