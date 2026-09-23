import os
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler

def train_and_save_models():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, 'data', 'historical_events.csv')
    models_dir = os.path.join(base_dir, 'models')
    os.makedirs(models_dir, exist_ok=True)

    if not os.path.exists(data_path):
        print("[ML Train] Data file missing. Generating synthetic dataset...")
        from data.generate_dataset import generate_synthetic_data
        generate_synthetic_data(data_path)

    df = pd.read_csv(data_path)
    print(f"[ML Train] Loaded dataset with shape {df.shape}")

    # Feature engineering & preprocessing
    le_category = LabelEncoder()
    df['category_encoded'] = le_category.fit_transform(df['category'])

    features = [
        'category_encoded', 'capacity', 'ticket_price',
        'days_remaining', 'current_fill_rate', 'booking_velocity_24h'
    ]

    X = df[features]
    y_demand = df['actual_additional_demand']
    y_risk = df['capacity_risk']

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # 1. Train Demand Regressor
    X_train, X_test, y_train_dem, y_test_dem = train_test_split(X_scaled, y_demand, test_size=0.2, random_state=42)
    regressor = RandomForestRegressor(n_estimators=100, random_state=42)
    regressor.fit(X_train, y_train_dem)
    reg_score = regressor.score(X_test, y_test_dem)
    print(f"[ML Train] RandomForest Regressor R2 score: {reg_score:.4f}")

    # 2. Train Risk Classifier
    X_train, X_test, y_train_risk, y_test_risk = train_test_split(X_scaled, y_risk, test_size=0.2, random_state=42)
    classifier = GradientBoostingClassifier(n_estimators=100, random_state=42)
    classifier.fit(X_train, y_train_risk)
    clf_score = classifier.score(X_test, y_test_risk)
    print(f"[ML Train] GradientBoosting Classifier Accuracy: {clf_score:.4f}")

    # Save artifacts
    artifacts = {
        'regressor': regressor,
        'classifier': classifier,
        'scaler': scaler,
        'le_category': le_category,
        'categories': list(le_category.classes_),
    }
    
    model_file = os.path.join(models_dir, 'eventiq_ml_model.joblib')
    joblib.dump(artifacts, model_file)
    print(f"[ML Train] Models successfully saved to {model_file}")

if __name__ == '__main__':
    train_and_save_models()
