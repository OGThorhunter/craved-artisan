from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
from prophet import Prophet
from sklearn.ensemble import IsolationForest
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Insights Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ForecastDataPoint(BaseModel):
    date: str
    consumed: float

class ForecastRequest(BaseModel):
    data: List[ForecastDataPoint]
    periods: int = 56  # Default 8 weeks

class ForecastResponse(BaseModel):
    forecast: List[Dict[str, Any]]
    trend: str
    seasonality: Dict[str, float]

class AnomalyRequest(BaseModel):
    data: List[float]
    contamination: float = 0.1

class AnomalyResponse(BaseModel):
    anomalies: List[bool]
    scores: List[float]

@app.get("/healthz")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "insights", "timestamp": datetime.utcnow().isoformat()}

@app.post("/forecast", response_model=ForecastResponse)
async def forecast_consumption(request: ForecastRequest):
    """Generate Prophet forecast for consumption data"""
    try:
        if len(request.data) < 7:  # Need at least a week of data
            raise HTTPException(status_code=400, detail="Need at least 7 data points for forecasting")
        
        # Convert to DataFrame
        df = pd.DataFrame([{"ds": pd.to_datetime(point.date), "y": point.consumed} for point in request.data])
        
        # Initialize and fit Prophet model
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            seasonality_mode='multiplicative'
        )
        
        # Add custom seasonality for business patterns
        model.add_seasonality(name='monthly', period=30.5, fourier_order=5)
        
        model.fit(df)
        
        # Create future dataframe
        future = model.make_future_dataframe(periods=request.periods)
        forecast = model.predict(future)
        
        # Extract forecast results
        forecast_data = []
        for i, row in forecast.tail(request.periods).iterrows():
            forecast_data.append({
                "date": row['ds'].strftime('%Y-%m-%d'),
                "predicted": float(row['yhat']),
                "lower_bound": float(row['yhat_lower']),
                "upper_bound": float(row['yhat_upper'])
            })
        
        # Calculate trend
        recent_trend = forecast['trend'].tail(7).mean() - forecast['trend'].head(7).mean()
        trend_direction = "increasing" if recent_trend > 0 else "decreasing" if recent_trend < 0 else "stable"
        
        # Calculate seasonality components
        seasonality = {
            "weekly": float(forecast['weekly'].std()),
            "yearly": float(forecast['yearly'].std()),
            "monthly": float(forecast['monthly'].std()) if 'monthly' in forecast.columns else 0.0
        }
        
        return ForecastResponse(
            forecast=forecast_data,
            trend=trend_direction,
            seasonality=seasonality
        )
        
    except Exception as e:
        logger.error(f"Error in forecasting: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Forecasting error: {str(e)}")

@app.post("/anomaly", response_model=AnomalyResponse)
async def detect_anomalies(request: AnomalyRequest):
    """Detect anomalies in time series data using Isolation Forest"""
    try:
        if len(request.data) < 10:  # Need minimum data points
            raise HTTPException(status_code=400, detail="Need at least 10 data points for anomaly detection")
        
        # Convert to numpy array
        data = np.array(request.data).reshape(-1, 1)
        
        # Initialize Isolation Forest
        iso_forest = IsolationForest(
            contamination=request.contamination,
            random_state=42
        )
        
        # Fit and predict
        anomaly_labels = iso_forest.fit_predict(data)
        anomaly_scores = iso_forest.decision_function(data)
        
        # Convert to boolean (True = anomaly, False = normal)
        anomalies = [label == -1 for label in anomaly_labels]
        
        return AnomalyResponse(
            anomalies=anomalies,
            scores=anomaly_scores.tolist()
        )
        
    except Exception as e:
        logger.error(f"Error in anomaly detection: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Anomaly detection error: {str(e)}")

@app.post("/seasonal-analysis")
async def seasonal_analysis(request: ForecastRequest):
    """Analyze seasonal patterns in consumption data"""
    try:
        if len(request.data) < 30:  # Need at least a month of data
            raise HTTPException(status_code=400, detail="Need at least 30 data points for seasonal analysis")
        
        # Convert to DataFrame
        df = pd.DataFrame([{"ds": pd.to_datetime(point.date), "y": point.consumed} for point in request.data])
        
        # Initialize Prophet with strong seasonality
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=True,
            seasonality_mode='multiplicative'
        )
        
        model.fit(df)
        
        # Get seasonality components
        future = model.make_future_dataframe(periods=0)
        forecast = model.predict(future)
        
        # Calculate seasonal strength
        seasonal_strength = {
            "weekly": float(forecast['weekly'].std() / forecast['yhat'].mean()),
            "yearly": float(forecast['yearly'].std() / forecast['yhat'].mean()),
            "daily": float(forecast['daily'].std() / forecast['yhat'].mean())
        }
        
        # Identify peak and low periods
        weekly_avg = df.groupby(df['ds'].dt.dayofweek)['y'].mean()
        peak_day = weekly_avg.idxmax()
        low_day = weekly_avg.idxmin()
        
        return {
            "seasonal_strength": seasonal_strength,
            "peak_day": int(peak_day),
            "low_day": int(low_day),
            "peak_day_name": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][peak_day],
            "low_day_name": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][low_day],
            "recommendation": "Consider increasing inventory before peak days" if seasonal_strength["weekly"] > 0.2 else "Seasonal patterns are minimal"
        }
        
    except Exception as e:
        logger.error(f"Error in seasonal analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Seasonal analysis error: {str(e)}")

@app.post("/demand-patterns")
async def analyze_demand_patterns(request: ForecastRequest):
    """Analyze demand patterns and provide inventory recommendations"""
    try:
        if len(request.data) < 14:  # Need at least 2 weeks of data
            raise HTTPException(status_code=400, detail="Need at least 14 data points for demand analysis")
        
        # Convert to DataFrame
        df = pd.DataFrame([{"ds": pd.to_datetime(point.date), "y": point.consumed} for point in request.data])
        
        # Calculate basic statistics
        mean_demand = float(df['y'].mean())
        std_demand = float(df['y'].std())
        cv = std_demand / mean_demand if mean_demand > 0 else 0
        
        # Calculate trend
        df['day'] = range(len(df))
        trend_slope = float(np.polyfit(df['day'], df['y'], 1)[0])
        
        # Calculate volatility
        volatility = float(df['y'].rolling(window=7).std().mean())
        
        # Generate recommendations
        recommendations = []
        
        if cv > 0.5:
            recommendations.append("High demand variability - consider safety stock")
        
        if trend_slope > mean_demand * 0.1:
            recommendations.append("Increasing demand trend - plan for growth")
        elif trend_slope < -mean_demand * 0.1:
            recommendations.append("Decreasing demand trend - reduce inventory")
        
        if volatility > mean_demand * 0.3:
            recommendations.append("High volatility - increase reorder frequency")
        
        # Calculate optimal reorder point (simplified)
        lead_time_days = 7  # Assume 7-day lead time
        safety_stock = 1.65 * std_demand * np.sqrt(lead_time_days)  # 95% service level
        reorder_point = mean_demand * lead_time_days + safety_stock
        
        return {
            "mean_demand": mean_demand,
            "std_demand": std_demand,
            "coefficient_of_variation": cv,
            "trend_slope": trend_slope,
            "volatility": volatility,
            "recommendations": recommendations,
            "suggested_reorder_point": float(reorder_point),
            "suggested_safety_stock": float(safety_stock),
            "demand_pattern": "stable" if cv < 0.3 else "variable" if cv < 0.7 else "highly_variable"
        }
        
    except Exception as e:
        logger.error(f"Error in demand pattern analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Demand analysis error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9002)
