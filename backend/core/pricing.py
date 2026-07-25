import datetime
from decimal import Decimal
from reports.models import HotelConfiguration


def calculate_stay_pricing(base_price_per_night, check_in_date, check_out_date, custom_tax_rate=None, custom_surge=None):
    """
    Calculates dynamic stay pricing given check-in/out dates and base rate.
    Applies weekend surge multiplier for Friday (4) and Saturday (5) nights automatically.
    """
    config = HotelConfiguration.get_config()
    tax_rate = Decimal(str(custom_tax_rate if custom_tax_rate is not None else config.tax_rate)) / Decimal('100')
    surge_multiplier = Decimal(str(custom_surge if custom_surge is not None else config.weekend_surge_multiplier))
    base_rate = Decimal(str(base_price_per_night))

    if isinstance(check_in_date, str):
        check_in_date = datetime.datetime.strptime(check_in_date, '%Y-%m-%d').date()
    if isinstance(check_out_date, str):
        check_out_date = datetime.datetime.strptime(check_out_date, '%Y-%m-%d').date()

    num_nights = (check_out_date - check_in_date).days
    if num_nights <= 0:
        num_nights = 1

    nightly_breakdown = []
    total_base = Decimal('0.00')

    for i in range(num_nights):
        curr_night = check_in_date + datetime.timedelta(days=i)
        is_weekend = curr_night.weekday() in (4, 5)  # Friday or Saturday
        multiplier = surge_multiplier if is_weekend else Decimal('1.00')
        night_price = (base_rate * multiplier).quantize(Decimal('0.01'))
        
        total_base += night_price
        nightly_breakdown.append({
            'date': curr_night.strftime('%Y-%m-%d'),
            'is_weekend': is_weekend,
            'multiplier': float(multiplier),
            'price': float(night_price)
        })

    tax_amount = (total_base * tax_rate).quantize(Decimal('0.01'))
    grand_total = total_base + tax_amount

    return {
        'num_nights': num_nights,
        'base_total': float(total_base),
        'tax_amount': float(tax_amount),
        'tax_rate_pct': float(config.tax_rate),
        'grand_total': float(grand_total),
        'nightly_breakdown': nightly_breakdown
    }
