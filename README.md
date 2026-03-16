# 🚆 IRCTC Train Booking Application

A modern, high-performance web application for Indian railway train booking, live status tracking, and pantry cart ordering.

## 🎯 Tech Stack

- **Frontend:** React.js + TypeScript + Vite
- **Styling:** Tailwind CSS + ShadCN UI
- **Backend/API:** Node.js + Express
- **Data Source:** Real-time IRCTC API integration + JSON mock data

## ✨ Key Features

### 🔍 Train Search & Booking
- Real-time train search with station autocomplete
- Live seat availability and fare information
- Multi-class support (AC, Sleeper, General, Tatkal)
- Station interchange (swap from/to destinations)

### 🎫 Booking Flow
- Step-by-step booking process (Search → Trains → Seats → Passenger Details → Payment)
- Interactive seat selection with coach layout
- Passenger detail management

### 📊 Additional Features
- **Live Status** - Check train real-time status and delays
- **PNR Enquiry** - Track booking and ticket status
- **View Station** - Google Maps & Street View integration
- **Pantry Cart** - Order food/beverages to your seat
- **Ask Disha** - AI assistant for travel queries

## 📁 Project Structure

```
src/
├── pages/              # Main pages (BookTickets, Home, etc.)
├── components/         # Reusable components (Navigation, StationSelect, etc.)
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
└── assets/            # Images and static files

Backend/
├── stations.json      # Available railway stations database
├── trains.json        # Train information
└── main.js           # Backend entry point
```

## 🚀 Installation & Setup

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Start development server:**
   ```bash
   bun run dev
   ```

3. **Build for production:**
   ```bash
   bun run build
   ```

## 🎮 How to Use

1. **Search Trains** - Go to Home → select From/To stations → choose date → click "Search Trains"
2. **Select Train & Seats** - Pick a train class, select your seats
3. **Enter Passenger Details** - Provide name, age, and gender
4. **Make Payment** - Choose payment method (UPI/Card/Net Banking)
5. **Book Pantry** - Visit Pantry Cart page to order food
6. **Check Status** - Use Live Status or PNR Enquiry for booking updates

## 🔧 Key Components

- **StationSelect** - Autocomplete dropdown for station selection with real station data
- **Navigation** - Top navbar with active route highlighting
- **BookTickets** - Multi-step booking workflow
- **Home** - Landing page with multiple enquiry panels
- **PantryCart** - Food ordering interface with glassy UI design

## 🎨 Design Features

- **Glassmorphic UI** - Transparent, frosted glass effect buttons and cards
- **Dark Theme** - Professional dark interface with cyan/blue accents
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations** - Button hover effects and transition animations

## 💡 Recent Updates

- ✅ Station dropdown fetches real data from stations.json
- ✅ Interchange (swap) button fully functional
- ✅ All buttons styled with glassy transparent design
- ✅ Fixed navbar Home button active state
- ✅ Order confirmation popup with single hop animation
- ✅ Back button with smooth expand-on-hover animation

### 💨 Fast & Lightweight  
Built with Vite + React for lightning-fast load times and smooth transitions, ensuring a near-native feel on web.

### 🔐 Secure & Scalable  
Implements API security best practices, with modular design for future scaling or integration with IRCTC’s production systems.

---


## 🚀 Impact & Vision  
This project reimagines the IRCTC experience for a new generation of travelers — faster, smarter, and more intuitive.  
It not only demonstrates how real-time railway data can be harnessed effectively but also sets the foundation for a **next-gen railway ecosystem** integrating AI, predictive systems, and crowd management.

---

## 🏆 Built For  
**Smart India Hackathon (SIH)** — Problem Statement: *Enhancing Railway Passenger Experience through Real-Time Data and Intelligent UI Design.*

---

## 💡 Future Enhancements  
- Integrate **AI-based delay prediction** using historical data.  
- Enable **voice-based booking assistance** in multiple Indian languages.  
- Add **offline ticket view mode** and **QR-based verification**.  
- Include **crowd density visualization** for major routes and stations.  
- Enable **PNR-based personalized dashboards** for frequent travelers.

---
