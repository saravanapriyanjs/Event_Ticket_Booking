const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

/**
 * Calls Python FastAPI service for event demand intelligence prediction.
 * Provides fallback heuristic calculation if Python service is unreachable.
 */
const getEventDemandPrediction = async (eventData) => {
  const {
    category = 'Technology',
    daysRemaining = 14,
    capacity = 1000,
    ticketsSold = 0,
    availableTickets = 1000,
    ticketPrice = 500,
    bookingVelocity24h = 25,
  } = eventData;

  const currentFillRate = capacity > 0 ? ticketsSold / capacity : 0;

  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict`, {
      category,
      days_remaining: daysRemaining,
      capacity,
      tickets_sold: ticketsSold,
      available_tickets: availableTickets,
      ticket_price: ticketPrice,
      booking_velocity_24h: bookingVelocity24h,
    }, { timeout: 3000 });

    return response.data;
  } catch (error) {
    console.warn(`[ML Service Warning]: ML service at ${ML_SERVICE_URL} unreachable. Using baseline AI engine. (${error.message})`);

    // Fallback baseline intelligent rule-based engine
    let demandLevel = 'LOW';
    let capacityRisk = 'LOW';
    let predictedAdditionalDemand = Math.round(bookingVelocity24h * Math.max(1, daysRemaining * 0.7));
    let estimatedSelloutDays = null;

    if (currentFillRate >= 0.85 || (bookingVelocity24h >= 40 && availableTickets < 200)) {
      demandLevel = 'CRITICAL';
      capacityRisk = 'CRITICAL';
      estimatedSelloutDays = Math.max(1, Math.round(availableTickets / (bookingVelocity24h || 1)));
    } else if (currentFillRate >= 0.65 || bookingVelocity24h >= 25) {
      demandLevel = 'HIGH';
      capacityRisk = 'HIGH';
      estimatedSelloutDays = Math.max(2, Math.round(availableTickets / (bookingVelocity24h || 1)));
    } else if (currentFillRate >= 0.35 || bookingVelocity24h >= 10) {
      demandLevel = 'MEDIUM';
      capacityRisk = 'MEDIUM';
      estimatedSelloutDays = Math.round(availableTickets / (bookingVelocity24h || 1));
    } else {
      demandLevel = 'LOW';
      capacityRisk = 'LOW';
      estimatedSelloutDays = null;
    }

    // Cap predicted demand logically
    predictedAdditionalDemand = Math.min(predictedAdditionalDemand, availableTickets + 150);

    let recommendation = 'Capacity is currently adequate. Continue regular promotion.';
    if (capacityRisk === 'CRITICAL' || capacityRisk === 'HIGH') {
      recommendation = 'High surge in demand detected. Monitor capacity closely and prepare waitlist options or larger venue.';
    } else if (capacityRisk === 'MEDIUM') {
      recommendation = 'Steady booking velocity observed. Re-assess marketing outreach 5 days before event.';
    }

    return {
      predicted_additional_demand: predictedAdditionalDemand,
      demand_level: demandLevel,
      capacity_risk: capacityRisk,
      estimated_sellout_days: estimatedSelloutDays ? `${estimatedSelloutDays} days` : 'Over 14 days / Unlikely',
      current_capacity_utilization: `${(currentFillRate * 100).toFixed(1)}%`,
      recommendation,
      source: 'baseline_engine'
    };
  }
};

module.exports = {
  getEventDemandPrediction,
};
