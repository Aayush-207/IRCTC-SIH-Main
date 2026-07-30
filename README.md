# 🚆 SIH - IRCTC Train Booking Application

> A modern, high-performance IRCTC-style web app to search trains, book tickets, track live status, and order pantry food in one place.

<p align="center">
  <a href="https://irctcprototype.netlify.app/">
    <img src="https://img.shields.io/badge/Live%20Demo-Netlify-00C7B7?logo=netlify&style=for-the-badge" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&style=for-the-badge" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&style=for-the-badge" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&style=for-the-badge" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&style=for-the-badge" />
  <img src="https://img.shields.io/badge/shadcn%2Fui-Components-000000?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&style=for-the-badge" />
</p>

---

## ☁️ Deployment Netlify – [irctcprototype.netlify.app](https://irctcprototype.netlify.app/)

---

## 🧩 Tech Stack

| Layer | Tech |
|-------|------|
| 🖥️ **Frontend** | React, TypeScript, Vite |
| 🎨 **UI & Styling** | Tailwind CSS, ShadCN UI, glassmorphism components |
| 🧠 **Backend/API** | Node.js, Express |
| 📡 **Data** | IRCTC real-time API (concept) + JSON mock data |


---

## ✨ Core Features

### 🔍 Train Search & Booking

- Station autocomplete with real station data  
- Live seat availability, fares, and class selection (AC, Sleeper, General, Tatkal)  
- Swap button to interchange From/To stations  
- Guided flow: **Search → Trains → Seats → Passenger → Payment**

### 📊 Travel Utilities

- 🕒 **Live Status** – Real-time train running and delay info  
- 🔢 **PNR Enquiry** – View ticket and booking status  
- 📍 **View Station** – Google Maps & Street View integration  
- 🍱 **Pantry Cart** – Order food and beverages to your seat  
- 🤖 **Ask Disha** – AI-like assistant for quick travel queries  

---

## 📁 Project Structure

```bash
src/
├── pages/          # BookTickets, Home, Status, Pantry, etc.
├── components/     # Navigation, StationSelect, TrainCard, etc.
├── hooks/          # Custom React hooks
├── lib/            # Utils and helpers
└── assets/         # Images / static files

Backend/
├── stations.json   # Station master data
├── trains.json     # Train schedules and details
└── main.js         # Express backend entry
```

---

## 🎮 Usage Flow

1. **Search Trains** → Select From/To stations + date + class, then hit **Search**
2. **Choose Train & Seats** → Pick a train and select seats from the coach layout
3. **Fill Passenger Details** → Enter name, age, gender, and berth preferences
4. **Proceed to Payment** → Simulated **UPI / Card / Net Banking** flow
5. **Order Food** → Use **Pantry Cart** to place food orders to your seat
6. **Track Journey** → Use **Live Status** and **PNR Enquiry** for live updates

---

## 🎨 UX Highlights

- 🧊 Glassmorphic cards and buttons with subtle blur and transparency  
- 🌙 Dark theme with blue/cyan accents inspired by modern dashboards  
- 📱 Fully responsive layout (desktop, tablet, and mobile)  
- 🎞️ Smooth hover states and transitions for a near-native feel  

---


<p align="center"> Built for <b>Smart India Hackathon (SIH)</b> — reimagining the IRCTC experience for the next generation of Indian rail travelers. </p>
