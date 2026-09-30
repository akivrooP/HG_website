
# 🐄 HerdGuard AI

### Smart India Hackathon 2026

**AI/ML-Based Early Warning and Decision-Support System for Subclinical Mastitis**

> **Project Type: Mostly Software**

HerdGuard is an IoT + AI early-warning system designed to identify increasing mastitis risk in dairy cattle by analysing longitudinal cow-level data.

The core of HerdGuard is a machine-learning pipeline that transforms sensor and farm data into:

**Individual Baseline → Anomaly Detection → Risk Prediction → Explainable AI → Decision Support**

IoT sensors act as the data-acquisition layer that supplies the software platform with real-world cattle and farm measurements.

---

## 📌 Problem Statement

Mastitis is a major challenge in dairy farming. The subclinical stage can develop before obvious clinical symptoms appear, making early identification difficult.

Traditional observation may detect the problem only after changes in milk quality, production or animal behaviour become noticeable.

HerdGuard proposes a software-driven AI system that continuously analyses cow-level measurements and identifies deviations from an individual animal's normal behaviour.

The goal is to provide an early-warning signal that can support farmers and veterinary personnel in deciding when further inspection or clinical confirmation may be appropriate.

---

## 🛠️ Tech Stack

### 💻 Software & Backend

- **Python** — Core AI/ML and data-processing language
- **FastAPI** — Backend/API layer
- **MQTT over TLS** — Secure IoT data communication
- **PostgreSQL** — Primary database
- **TimescaleDB** — Time-series sensor data storage
- **PostGIS** — Geospatial data and herd hotspot mapping

### 🤖 AI / Machine Learning

- **XGBoost** — Primary risk prediction model
- **LightGBM** — Alternative gradient-boosting model
- **Scikit-learn** — Data preprocessing and model evaluation
- **SHAP** — Explainable AI and feature contribution analysis
- **LSTM / GRU** — Planned Phase-2 sequence modelling
- **MLflow** — Model tracking and experiment management

### 📊 Data & Analytics

- **Pandas** — Data manipulation and analysis
- **NumPy** — Numerical computation
- **Matplotlib** — Data visualization
- **Joblib** — Model serialization
- **Longitudinal time-series analysis** — Individual cow behaviour and anomaly detection

### 🌐 Frontend & Applications

- **React** — Web dashboard
- **GIS Mapping** — Herd-level risk and hotspot visualization
- **Flutter** — Farmer, veterinarian and field-worker mobile application
- **Bhashini API** — Multilingual text and voice support
- **SMS Alerts** — Farmer and veterinary notifications

### 📡 IoT & Hardware

- **ESP32** — Cow tag and farm gateway
- **DS18B20** — Temperature sensing
- **MPU-6050** — Motion/activity sensing
- **LoRa** — Long-range sensor communication
- **DHT22** — Environmental temperature and humidity
- **Milk Conductivity Probe** — Milk conductivity measurement
- **Load Cell** — Milk-yield measurement
- **RFID / Barcode** — Cow identification
- **GPS** — Location tracking
- **SD Card + GSM** — Offline storage and communication backup

> **Note:** The current repository primarily implements the Python-based AI/ML prototype. FastAPI, React, Flutter, databases, IoT hardware and communication components represent the proposed broader HerdGuard system architecture.

---

## 💡 Proposed Solution

HerdGuard combines longitudinal data processing, anomaly detection, machine learning and explainable AI.

### HerdGuard Pipeline

**Sense → Establish Baseline → Detect Anomaly → Predict Risk → Explain → Act**

```text
Cow / Farm Data
       ↓
Data Ingestion
       ↓
Data Processing
       ↓
Individual Cow Baseline
       ↓
Sensor Deviation Detection
       ↓
Feature Normalization
       ↓
XGBoost Risk Prediction
       ↓
Risk Score
       ↓
Risk Classification
       ↓
SHAP Explanation
       ↓
Farmer / Veterinary Decision Support

## Procedure to run the website 

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
