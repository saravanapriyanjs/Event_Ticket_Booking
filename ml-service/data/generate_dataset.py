import csv
import random
import os

categories = ['Technology', 'Concert', 'Workshop', 'Cultural', 'Sports', 'Show']

def generate_synthetic_data(filename='historical_events.csv', samples=1000):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    
    headers = [
        'category', 'capacity', 'ticket_price', 'days_remaining',
        'current_fill_rate', 'booking_velocity_24h',
        'actual_additional_demand', 'demand_level', 'capacity_risk'
    ]
    
    rows = []
    for _ in range(samples):
        cat = random.choice(categories)
        capacity = random.choice([100, 200, 500, 800, 1000, 1500, 2000])
        ticket_price = random.choice([0, 250, 300, 500, 750, 1000, 1500, 2000])
        days_remaining = random.randint(1, 30)
        
        # Base velocity depends on category and price
        base_vel = random.randint(5, 40)
        if cat in ['Technology', 'Concert']:
            base_vel += random.randint(10, 30)
        if ticket_price < 500:
            base_vel += random.randint(5, 20)
            
        booking_velocity_24h = base_vel
        current_fill_rate = round(random.uniform(0.1, 0.95), 2)
        tickets_sold = int(capacity * current_fill_rate)
        available_tickets = capacity - tickets_sold
        
        # Calculate true demand
        projected_demand = int(booking_velocity_24h * (days_remaining * 0.6) * random.uniform(0.8, 1.2))
        actual_additional_demand = projected_demand
        
        # Classify demand level and risk
        ratio = projected_demand / max(1, available_tickets)
        if ratio > 1.2 or current_fill_rate > 0.85:
            demand_level = 'CRITICAL'
            capacity_risk = 'CRITICAL'
        elif ratio > 0.85 or current_fill_rate > 0.65:
            demand_level = 'HIGH'
            capacity_risk = 'HIGH'
        elif ratio > 0.4 or current_fill_rate > 0.35:
            demand_level = 'MEDIUM'
            capacity_risk = 'MEDIUM'
        else:
            demand_level = 'LOW'
            capacity_risk = 'LOW'

        rows.append([
            cat, capacity, ticket_price, days_remaining,
            current_fill_rate, booking_velocity_24h,
            actual_additional_demand, demand_level, capacity_risk
        ])

    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)

    print(f"[Dataset Generator] Successfully created {samples} realistic records in {filename}")

if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, 'historical_events.csv')
    generate_synthetic_data(output_path)
