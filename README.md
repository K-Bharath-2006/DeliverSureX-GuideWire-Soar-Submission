# DeliverSureX-GuideWire-Submission

# 🚀 DeliverSure AI  
### AI-Powered Parametric Income Protection for Gig Workers

---

## 📌 Problem Statement

India’s gig delivery workers (Swiggy, Zomato, Zepto, Amazon, etc.) depend on daily earnings.
External disruptions such as extreme weather, pollution, traffic congestion, and curfews can significantly reduce their working hours, causing 20–30% income loss.

Currently, there is no insurance solution focused on income protection, leaving gig workers financially vulnerable.

---

## 💡 Solution Overview

DeliverSure AI is an AI-powered parametric insurance platform that provides automated income protection for gig workers.

- Weekly subscription-based insurance  
- Real-time disruption verification using APIs + AI  
- AI-based income prediction and loss calculation  
- Automatic payouts without manual claims  
- Fraud-resistant system with multi-signal validation  


## 💰 Core Business Model (Micro-Insurance Pool)

DeliverSure AI operates on a **micro-contribution model**:

- Every delivery contributes **₹2–₹3 per order**
- This creates a **shared insurance pool**
- The pool is used to compensate workers during disruptions

### Example

1000 workers × 20 orders/day × ₹2 = ₹40,000/day pool
---
### Payout Flow

Micro Contributions → Insurance Pool → Verified Claim → Instant Payout
---

### Risk Control Mechanisms

- Max payout cap (40–50% of weekly income)  
- AI-based risk scoring  
- Fraud detection layer  
- Dynamic premium adjustment  
---

## 👤 Persona-Based Scenario

**Rahul (Food Delivery Partner)**

1. Subscribes to a weekly insurance plan  
2. Experiences heavy rain and traffic congestion  
3. Reports disruption and uploads a real-time image  
4. System verifies:
   - Weather conditions  
   - Pollution levels  
   - Traffic congestion  
   - Crowd/curfew alerts  
   - Worker activity  
5. AI predicts expected income and calculates income loss  
6. Automatic payout is credited  

---

## 🔄 Application Workflow

→ Worker Registration  
→ Micro Contribution (₹2–₹3 per delivery)  
→ Insurance Pool Formation  
→ Worker Active in Delivery Zone  
→ Disruption Occurs  
→ Worker Reports + Uploads Image  
→ Disruption Verification (Weather + AQI + Traffic + Crowd + Curfew)  
→ Worker Activity Check  
→ AI Income Prediction  
→ Income Loss Calculation  
→ Claim Verification  
→ Automatic Payout from Pool  

<img width="1536" height="1024" alt="d6f5b4c5-efdd-4a13-852a-bd1cea96215d" src="https://github.com/user-attachments/assets/3bebafbd-f5e8-4e37-94f7-6a9d57f23fd4" />


---

## 💰 Weekly Premium Model

Premium is dynamically calculated:

Premium = Base Rate × Risk Score × Income Factor × Trust Modifier

### Factors

- **Risk Score**: Weather, pollution, traffic, historical disruptions  
- **Income Factor**: Weekly earnings, working hours, demand  
- **Trust Modifier**: Worker reliability and claim history  

### Example

Weekly Income = ₹5000
Risk Score = 0.5
Base Rate = ₹20

Premium = ₹40/week

## ⚙️ Parametric Triggers

| Parameter | Condition |
|----------|----------|
| Rainfall | > 80 mm/hr |
| AQI | > 350 |
| Traffic | > 85% congestion |
| Curfew | Active |
| Crowd Density | AI detected |

---

## 🔍 Disruption Verification Engine

DeliverSure AI validates disruptions using multi-source real-time data.

### Weather Verification
- Rainfall, temperature, storm alerts  
- API: OpenWeather  

### Pollution Verification
- AQI, PM2.5  

### Traffic Verification
- Congestion, road blockage  

### Social Verification
- Curfew, restrictions  

### Crowd Detection (AI)
- Image-based validation using Computer Vision  

### Worker Activity Verification
- GPS location  
- App activity  

### Final Decision Logic

if weather OR pollution OR traffic OR social OR crowd:
disruption_confirmed = True

### Confidence Score

score = (weather0.3 + pollution0.2 + traffic0.2 + crowd0.2 + social*0.1)

if score > 0.6:
approve_claim

---

## 🤖 AI/ML Integration

### Risk Prediction
- Model: XGBoost / Random Forest  
- Output: Risk score  

### Income Prediction
- Model: Regression / Gradient Boosting  
- Output: Expected hourly income  

### Fraud Detection
- Model: Isolation Forest  
- Output: Fraud score  

### Computer Vision
- Model: CNN / YOLO  
- Detects crowd, blockage, environment  

---
## 🛡️ Adversarial Defense & Anti-Spoofing Strategy

### Differentiation

Multi-signal trust model:

trust_score = movement + activity + image + network + peer_data

### Data Beyond GPS

- GPS movement history  
- Accelerometer (motion detection)  
- App activity logs  
- Image verification  
- Network signal  
- Peer comparison  

### UX Balance

- Suspicious claims → "Under Review"  
- Request additional proof  
- AI re-evaluation  

✔ Valid → payout  
✔ Fraud → rejected  

---

## 🛠️ Tech Stack

### Frontend
- React Native (Mobile App)  
- React.js / Next.js (Web)

### Backend
- Spring Boot (Java)

### Database
- MongoDB Atlas (Cloud)

### AI/ML
- Python (Scikit-learn, TensorFlow)

### Cloud
- Backend: Render / AWS  
- Database: MongoDB Atlas  
- Image Storage: Cloudinary / AWS S3  
- Frontend: Vercel  
---

## 📱 Platform Choice

Mobile-first approach:
- Supports GPS and camera  
- Real-time reporting  
- Optimized for gig workers
  
---
## 🌟 Conclusion

DeliverSure AI is a scalable, AI-driven parametric insurance platform that protects gig workers from income loss while ensuring fraud-resistant,
automated payouts through multi-layer verification and a self-sustaining micro-insurance pool model.
