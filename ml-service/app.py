import os
import joblib
import numpy as np
import pandas as pd
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Global model state
models = None

def load_models():
    global models
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_file = os.path.join(base_dir, 'models', 'eventiq_ml_model.joblib')
    
    if os.path.exists(model_file):
        try:
            models = joblib.load(model_file)
            print(f"[FastAPI ML] Successfully loaded trained model from {model_file}")
        except Exception as e:
            print(f"[FastAPI ML Error]: Failed loading model file: {e}")
            models = None
    else:
        print("[FastAPI ML Warning]: Model file not found. Auto-training now...")
        try:
            from train_model import train_and_save_models
            train_and_save_models()
            models = joblib.load(model_file)
        except Exception as e:
            print(f"[FastAPI ML Error]: Failed to auto-train model: {e}")
            models = None

# Eager load on module initialization
load_models()

@asynccontextmanager
async def lifespan(app: FastAPI):
    if models is None:
        load_models()
    yield

app = FastAPI(
    title="EventIQ - AI Demand Intelligence Service",
    description="Machine Learning service predicting event ticket demand velocity, sell-out timelines, and capacity risk metrics.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EventPredictRequest(BaseModel):
    category: str = Field(default="Technology", json_schema_extra={"example": "Technology"})
    days_remaining: int = Field(default=14, ge=0, json_schema_extra={"example": 14})
    capacity: int = Field(default=1000, gt=0, json_schema_extra={"example": 1000})
    tickets_sold: int = Field(default=820, ge=0, json_schema_extra={"example": 820})
    available_tickets: int = Field(default=180, ge=0, json_schema_extra={"example": 180})
    ticket_price: float = Field(default=500.0, ge=0, json_schema_extra={"example": 500.0})
    booking_velocity_24h: int = Field(default=40, ge=0, json_schema_extra={"example": 40})

class EventPredictResponse(BaseModel):
    predicted_additional_demand: int
    demand_level: str
    capacity_risk: str
    estimated_sellout_days: str
    current_capacity_utilization: str
    recommendation: str
    source: str = "trained_ml_model"

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "EventIQ AI Service",
        "model_loaded": models is not None
    }

@app.post("/predict", response_model=EventPredictResponse)
def predict_event_demand(req: EventPredictRequest):
    fill_rate = req.tickets_sold / req.capacity if req.capacity > 0 else 0.0

    if models is not None:
        try:
            le = models['le_category']
            scaler = models['scaler']
            regressor = models['regressor']
            classifier = models['classifier']

            # Handle unseen category safely
            if req.category in le.classes_:
                cat_encoded = le.transform([req.category])[0]
            else:
                cat_encoded = 0

            # Pass DataFrame matching original training feature names
            feature_names = [
                'category_encoded', 'capacity', 'ticket_price',
                'days_remaining', 'current_fill_rate', 'booking_velocity_24h'
            ]
            
            input_df = pd.DataFrame([[
                cat_encoded,
                req.capacity,
                req.ticket_price,
                req.days_remaining,
                fill_rate,
                req.booking_velocity_24h
            ]], columns=feature_names)

            scaled_features = scaler.transform(input_df)

            # ML Model Predictions
            predicted_demand = int(regressor.predict(scaled_features)[0])
            risk_class = str(classifier.predict(scaled_features)[0])
            
            # Ensure logical bounds
            predicted_demand = max(0, min(predicted_demand, req.available_tickets + 200))
            demand_level = risk_class
        except Exception as e:
            print(f"[ML Inference Exception]: {e}")
            predicted_demand = int(req.booking_velocity_24h * max(1, req.days_remaining * 0.6))
            risk_class = "HIGH" if fill_rate > 0.6 else "MEDIUM"
            demand_level = risk_class
    else:
        # Mathematical fallback if model object unavailable
        predicted_demand = int(req.booking_velocity_24h * max(1, req.days_remaining * 0.6))
        if fill_rate >= 0.8 or req.available_tickets < 50:
            risk_class = "CRITICAL"
        elif fill_rate >= 0.6:
            risk_class = "HIGH"
        elif fill_rate >= 0.3:
            risk_class = "MEDIUM"
        else:
            risk_class = "LOW"
        demand_level = risk_class

    # Calculate estimated sellout timeline
    if req.available_tickets <= 0:
        estimated_sellout = "SOLD OUT"
    elif req.booking_velocity_24h > 0:
        days_to_sellout = max(1, round(req.available_tickets / req.booking_velocity_24h))
        if days_to_sellout <= req.days_remaining:
            estimated_sellout = f"Within {days_to_sellout} day(s)"
        else:
            estimated_sellout = f"Beyond event date ({days_to_sellout} days)"
    else:
        estimated_sellout = "Unlikely before event start"

    # Actionable AI Recommendation text
    recommendation = ""
    if risk_class in ["CRITICAL", "HIGH"]:
        recommendation = "Capacity risk is HIGH. Prepare waitlist triggers, consider opening additional seating blocks, or increase venue capacity."
    elif risk_class == "MEDIUM":
        recommendation = "Steady booking momentum. Maintain current marketing campaign and monitor daily velocity."
    else:
        recommendation = "Booking velocity is currently moderate. Consider targeted promotional discounts or email outreach."

    return EventPredictResponse(
        predicted_additional_demand=predicted_demand,
        demand_level=demand_level,
        capacity_risk=risk_class,
        estimated_sellout_days=estimated_sellout,
        current_capacity_utilization=f"{round(fill_rate * 100, 1)}%",
        recommendation=recommendation,
        source="trained_ml_model" if models else "baseline_engine"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
