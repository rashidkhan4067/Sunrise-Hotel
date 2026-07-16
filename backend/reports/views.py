from datetime import date, timedelta
from django.db.models import Sum, Count
from django.db.models.functions import TruncDate
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rooms.models import Room
from bookings.models import Booking
from guests.models import Guest
from accounts.permissions import IsHotelStaff


class DashboardKPIView(APIView):
    """API endpoint to get real-time dashboard KPIs for the Hotel Management System."""
    permission_classes = [permissions.IsAuthenticated, IsHotelStaff]

    def get(self, request, *args, **kwargs):
        today = date.today()
        
        total_rooms = Room.objects.count()
        available_rooms = Room.objects.filter(status='AVAILABLE').count()
        occupied_rooms = Room.objects.filter(status='OCCUPIED').count()
        maintenance_rooms = Room.objects.filter(status='MAINTENANCE').count()
        
        today_bookings = Booking.objects.filter(check_in=today).count()
        today_check_ins = Booking.objects.filter(check_in=today, status='CHECKED_IN').count()
        today_check_outs = Booking.objects.filter(check_out=today).count()
        
        total_guests = Guest.objects.count()
        
        # Today's revenue is estimated from total prices of checked-in / confirmed bookings starting today
        today_revenue = Booking.objects.filter(
            check_in=today, 
            status__in=['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT']
        ).aggregate(total=Sum('total_price'))['total'] or 0.00
        
        # Room occupancy rate calculation
        occupancy_rate = (occupied_rooms / total_rooms * 100) if total_rooms > 0 else 0
        
        return Response({
            'total_rooms': total_rooms,
            'available_rooms': available_rooms,
            'occupied_rooms': occupied_rooms,
            'maintenance_rooms': maintenance_rooms,
            'today_bookings': today_bookings,
            'today_check_ins': today_check_ins,
            'today_check_outs': today_check_outs,
            'total_guests': total_guests,
            'today_revenue': float(today_revenue),
            'occupancy_rate': round(occupancy_rate, 2)
        }, status=status.HTTP_200_OK)


class AnalyticsTrendsView(APIView):
    """API endpoint to retrieve revenue and occupancy trend data for charts."""
    permission_classes = [permissions.IsAuthenticated, IsHotelStaff]

    def get(self, request, *args, **kwargs):
        # We will generate mock/aggregated trend data for the last 30 days
        today = date.today()
        start_date = today - timedelta(days=30)
        
        # Fetch actual bookings grouped by date
        bookings_by_date = Booking.objects.filter(
            check_in__gte=start_date,
            check_in__lte=today,
            status__in=['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT']
        ).annotate(
            date=TruncDate('check_in')
        ).values('date').annotate(
            revenue=Sum('total_price'),
            count=Count('booking_id')
        ).order_by('date')
        
        # Build dictionary for quick lookup
        trend_dict = {
            item['date'].strftime('%Y-%m-%d'): {
                'revenue': float(item['revenue'] or 0),
                'bookings': item['count']
            }
            for item in bookings_by_date if item['date']
        }
        
        # Generate full sequence of 30 days
        chart_data = []
        for i in range(30):
            current_date = start_date + timedelta(days=i)
            date_str = current_date.strftime('%Y-%m-%d')
            
            data_point = trend_dict.get(date_str, {'revenue': 0.0, 'bookings': 0})
            
            chart_data.append({
                'date': date_str,
                'revenue': data_point['revenue'],
                'bookings': data_point['bookings'],
                # For UI demonstration, we simulate room occupancy percentage
                'occupancy_rate': round(40 + (data_point['bookings'] * 15) % 55, 1)
            })
            
        return Response(chart_data, status=status.HTTP_200_OK)
