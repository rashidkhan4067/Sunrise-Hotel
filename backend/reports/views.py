import os
from datetime import date, timedelta, datetime
from django.conf import settings
from django.db.models import Sum, Count, Q
from django.db.models.functions import TruncDate
from rest_framework import permissions, status, serializers, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rooms.models import Room
from bookings.models import Booking
from guests.models import Guest
from accounts.permissions import IsHotelStaff, IsAdmin
from .models import AuditLog, HotelConfiguration, log_audit_event


class DashboardKPIView(APIView):
    """API endpoint to get real-time dashboard KPIs for the Hotel Management System."""
    permission_classes = [permissions.IsAuthenticated, IsHotelStaff]

    def get(self, request, *args, **kwargs):
        today = date.today()
        
        total_rooms = Room.objects.filter(is_archived=False).count()
        available_rooms = Room.objects.filter(status='AVAILABLE', is_archived=False).count()
        occupied_rooms = Room.objects.filter(status='OCCUPIED', is_archived=False).count()
        maintenance_rooms = Room.objects.filter(status='MAINTENANCE', is_archived=False).count()
        
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
        
        total_rooms_count = Room.objects.filter(is_archived=False).count() or 1
        
        # Generate full sequence of 30 days
        chart_data = []
        for i in range(30):
            current_date = start_date + timedelta(days=i)
            date_str = current_date.strftime('%Y-%m-%d')
            
            data_point = trend_dict.get(date_str, {'revenue': 0.0, 'bookings': 0})
            
            # Calculate actual occupied room count for current_date
            occupied_count = Booking.objects.filter(
                check_in__lte=current_date,
                check_out__gt=current_date,
                status__in=['CONFIRMED', 'CHECKED_IN']
            ).count()
            
            actual_occupancy = round((occupied_count / total_rooms_count) * 100.0, 1)
            
            chart_data.append({
                'date': date_str,
                'revenue': data_point['revenue'],
                'bookings': data_point['bookings'],
                'occupancy_rate': actual_occupancy
            })
            
        return Response(chart_data, status=status.HTTP_200_OK)


class ReportsDataView(APIView):
    """API endpoint to query hotel reports with custom groupings, filtering, and summary metrics."""
    permission_classes = [permissions.IsAuthenticated, IsHotelStaff]

    def get(self, request, *args, **kwargs):
        report_type = request.query_params.get('report_type', 'daily').lower()
        date_range = request.query_params.get('date_range', 'this_month').lower()
        status_param = request.query_params.get('status', 'all').upper()
        room_type_param = request.query_params.get('room_type', 'all').upper()
        
        # Determine start/end dates
        today = date.today()
        if date_range == 'today':
            start_date = today
            end_date = today
        elif date_range == 'this_week':
            start_date = today - timedelta(days=today.weekday())
            end_date = start_date + timedelta(days=6)
        elif date_range == 'this_month':
            start_date = date(today.year, today.month, 1)
            if today.month == 12:
                end_date = date(today.year, 12, 31)
            else:
                end_date = date(today.year, today.month + 1, 1) - timedelta(days=1)
        elif date_range == 'this_year':
            start_date = date(today.year, 1, 1)
            end_date = date(today.year, 12, 31)
        elif date_range == 'custom':
            start_str = request.query_params.get('start_date')
            end_str = request.query_params.get('end_date')
            try:
                start_date = datetime.strptime(start_str, '%Y-%m-%d').date() if start_str else today - timedelta(days=30)
                end_date = datetime.strptime(end_str, '%Y-%m-%d').date() if end_str else today
            except ValueError:
                return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Default fallback
            start_date = today - timedelta(days=30)
            end_date = today

        # Fetch base room count
        total_rooms = Room.objects.filter(is_archived=False).count() or 1

        # Query all bookings that overlap with the date range
        bookings = Booking.objects.filter(check_in__lte=end_date, check_out__gte=start_date)
        
        if status_param != 'ALL':
            bookings = bookings.filter(status=status_param)
            
        if room_type_param != 'ALL':
            bookings = bookings.filter(room__room_type=room_type_param)

        # Generate list of days
        delta = end_date - start_date
        num_days = delta.days + 1
        
        daily_data = []
        for i in range(num_days):
            curr_date = start_date + timedelta(days=i)
            
            # Skip future empty days with no activity
            if curr_date > today:
                has_activity = any(b.check_in == curr_date or (b.check_in <= curr_date < b.check_out) for b in bookings)
                if not has_activity:
                    continue
                
            day_bookings = [b for b in bookings if b.check_in == curr_date]
            
            revenue = sum(float(b.total_price) for b in day_bookings if b.status in ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'])
            check_ins = len([b for b in day_bookings if b.status in ['CHECKED_IN', 'CHECKED_OUT']])
            check_outs = len([b for b in bookings if b.check_out == curr_date and b.status == 'CHECKED_OUT'])
            
            # Daily active occupied count (stay spans over curr_date)
            occupied_count = len([
                b for b in bookings 
                if b.check_in <= curr_date < b.check_out 
                and b.status in ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT']
            ])
            
            avg_stay = 0.0
            if day_bookings:
                stay_nights = [max(1, (b.check_out - b.check_in).days) for b in day_bookings]
                avg_stay = sum(stay_nights) / len(day_bookings)
                
            occupancy_pct = min(100.0, round((occupied_count / total_rooms) * 100.0, 1))

            daily_data.append({
                'date': curr_date,
                'bookings': len(day_bookings),
                'revenue': revenue,
                'check_ins': check_ins,
                'check_outs': check_outs,
                'occupancy_pct': occupancy_pct,
                'avg_stay': avg_stay
            })

        # Now group and format
        final_rows = []
        
        if report_type == 'weekly':
            weekly_groups = {}
            for item in daily_data:
                d = item['date']
                week_start = d - timedelta(days=d.weekday()) # Monday week-start
                week_str = week_start.strftime('%Y-%m-%d')
                if week_str not in weekly_groups:
                    weekly_groups[week_str] = []
                weekly_groups[week_str].append(item)
                
            for week_str, items in weekly_groups.items():
                w_date = datetime.strptime(week_str, '%Y-%m-%d').date()
                label = f"Week of {w_date.strftime('%b %d, %Y')}"
                
                final_rows.append({
                    'date': label,
                    'bookings': sum(x['bookings'] for x in items),
                    'revenue': round(sum(x['revenue'] for x in items), 2),
                    'checkIns': sum(x['check_ins'] for x in items),
                    'checkOuts': sum(x['check_outs'] for x in items),
                    'occupancyPct': round(sum(x['occupancy_pct'] for x in items) / len(items), 1),
                    'avgStay': round(sum(x['avg_stay'] for x in items) / len(items), 1)
                })
        elif report_type == 'monthly':
            monthly_groups = {}
            for item in daily_data:
                key = item['date'].strftime('%Y-%m')
                if key not in monthly_groups:
                    monthly_groups[key] = []
                monthly_groups[key].append(item)
                
            for month_str, items in monthly_groups.items():
                m_date = datetime.strptime(month_str, '%Y-%m').date()
                label = m_date.strftime('%B %Y')
                
                final_rows.append({
                    'date': label,
                    'bookings': sum(x['bookings'] for x in items),
                    'revenue': round(sum(x['revenue'] for x in items), 2),
                    'checkIns': sum(x['check_ins'] for x in items),
                    'checkOuts': sum(x['check_outs'] for x in items),
                    'occupancyPct': round(sum(x['occupancy_pct'] for x in items) / len(items), 1),
                    'avgStay': round(sum(x['avg_stay'] for x in items) / len(items), 1)
                })
        elif report_type == 'yearly':
            yearly_groups = {}
            for item in daily_data:
                key = item['date'].strftime('%Y')
                if key not in yearly_groups:
                    yearly_groups[key] = []
                yearly_groups[key].append(item)
                
            for year_str, items in yearly_groups.items():
                final_rows.append({
                    'date': year_str,
                    'bookings': sum(x['bookings'] for x in items),
                    'revenue': round(sum(x['revenue'] for x in items), 2),
                    'checkIns': sum(x['check_ins'] for x in items),
                    'checkOuts': sum(x['check_outs'] for x in items),
                    'occupancyPct': round(sum(x['occupancy_pct'] for x in items) / len(items), 1),
                    'avgStay': round(sum(x['avg_stay'] for x in items) / len(items), 1)
                })
        else:
            # daily, revenue, occupancy, booking
            for item in reversed(daily_data):
                final_rows.append({
                    'date': item['date'].strftime('%b %d, %Y'),
                    'bookings': item['bookings'],
                    'revenue': round(item['revenue'], 2),
                    'checkIns': item['check_ins'],
                    'checkOuts': item['check_outs'],
                    'occupancyPct': item['occupancy_pct'],
                    'avgStay': round(item['avg_stay'], 1)
                })

        # Calculate overall Summary
        total_bookings = sum(x['bookings'] for x in daily_data)
        total_revenue = sum(x['revenue'] for x in daily_data)
        avg_occupancy = round(sum(x['occupancy_pct'] for x in daily_data) / len(daily_data), 1) if daily_data else 0.0
        active_guests = Guest.objects.filter(bookings__check_in__gte=start_date, bookings__check_in__lte=end_date).distinct().count()

        return Response({
            'summary': {
                'totalBookings': total_bookings,
                'totalRevenue': round(total_revenue, 2),
                'occupancyRate': avg_occupancy,
                'activeGuests': active_guests
            },
            'rows': final_rows
        }, status=status.HTTP_200_OK)


class DashboardDataView(APIView):
    """API endpoint to get real-time operational dashboard data for hotel management."""
    permission_classes = [permissions.IsAuthenticated, IsHotelStaff]

    def get(self, request, *args, **kwargs):
        today = date.today()
        
        # 1. Summary Metrics
        total_rooms = Room.objects.filter(is_archived=False).count()
        occupied_rooms = Room.objects.filter(status='OCCUPIED', is_archived=False).count()
        available_rooms = Room.objects.filter(status='AVAILABLE', is_archived=False).count()
        cleaning_rooms = Room.objects.filter(status='CLEANING', is_archived=False).count()
        maintenance_rooms = Room.objects.filter(status='MAINTENANCE', is_archived=False).count()
        
        today_check_ins_qs = Booking.objects.filter(check_in=today)
        today_check_outs_qs = Booking.objects.filter(check_out=today)
        active_bookings_count = Booking.objects.filter(status__in=['CONFIRMED', 'CHECKED_IN']).count()

        # 2. Today's Check-ins list
        today_check_ins = []
        for b in today_check_ins_qs:
            today_check_ins.append({
                'guestName': b.guest.full_name,
                'roomNumber': b.room.room_number,
                'status': b.status
            })

        # 3. Today's Check-outs list
        today_check_outs = []
        for b in today_check_outs_qs:
            today_check_outs.append({
                'guestName': b.guest.full_name,
                'roomNumber': b.room.room_number,
                'status': b.status
            })

        # 4. Recent Bookings (Limit 5)
        recent_bookings_qs = Booking.objects.all().order_by('-created_at')[:5]
        recent_bookings = []
        for b in recent_bookings_qs:
            recent_bookings.append({
                'bookingId': str(b.booking_id)[:8],
                'guestName': b.guest.full_name,
                'roomNumber': b.room.room_number,
                'checkIn': b.check_in.strftime('%b %d, %Y'),
                'checkOut': b.check_out.strftime('%b %d, %Y'),
                'status': b.status
            })

        # 5. Upcoming Arrivals (Limit 5)
        tomorrow = today + timedelta(days=1)
        upcoming_arrivals_qs = Booking.objects.filter(check_in__gte=tomorrow).order_by('check_in')[:5]
        upcoming_arrivals = []
        for b in upcoming_arrivals_qs:
            nights = max(1, (b.check_out - b.check_in).days)
            upcoming_arrivals.append({
                'guestName': b.guest.full_name,
                'roomNumber': b.room.room_number,
                'arrivalDate': b.check_in.strftime('%b %d, %Y'),
                'nights': nights
            })

        # 6. Real Audit Log Activity Feed (Limit 10)
        recent_activity = []
        recent_audit_logs = AuditLog.objects.all()[:10]
        for log in recent_audit_logs:
            recent_activity.append({
                'type': log.action.lower(),
                'message': log.description,
                'user': log.user_email or 'System',
                'timestamp': log.timestamp.strftime('%b %d, %Y %I:%M %p')
            })

        # 7. Monthly Occupancy Trend (last 6 months)
        occupancy_trend = []
        for i in range(5, -1, -1):
            check_date = today - timedelta(days=i*30)
            month_label = check_date.strftime('%b')
            
            # Simple simulation based on actual bookings of that month
            m_start = date(check_date.year, check_date.month, 1)
            if check_date.month == 12:
                m_end = date(check_date.year, 12, 31)
            else:
                m_end = date(check_date.year, check_date.month + 1, 1) - timedelta(days=1)
                
            m_bookings = Booking.objects.filter(check_in__lte=m_end, check_out__gte=m_start, status__in=['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'])
            m_occ_count = m_bookings.values('room').distinct().count()
            
            m_rate = min(100.0, round((m_occ_count / (total_rooms or 1)) * 100.0, 1))
            occupancy_trend.append({
                'month': month_label,
                'occupancy': m_rate
            })

        return Response({
            'summary': {
                'totalRooms': total_rooms,
                'occupiedRooms': occupied_rooms,
                'availableRooms': available_rooms,
                'cleaningRooms': cleaning_rooms,
                'maintenanceRooms': maintenance_rooms,
                'todayCheckInsCount': today_check_ins_qs.count(),
                'todayCheckOutsCount': today_check_outs_qs.count(),
                'activeBookingsCount': active_bookings_count
            },
            'todayCheckIns': today_check_ins,
            'todayCheckOuts': today_check_outs,
            'recentBookings': recent_bookings,
            'upcomingArrivals': upcoming_arrivals,
            'recentActivity': recent_activity,
            'occupancyTrend': occupancy_trend
        }, status=status.HTTP_200_OK)


class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = '__all__'


class AuditLogListView(generics.ListAPIView):
    """API endpoint for listing audit logs (Admin only)."""
    permission_classes = [permissions.IsAuthenticated, IsHotelStaff]
    serializer_class = AuditLogSerializer
    queryset = AuditLog.objects.all()

    def get_queryset(self):
        qs = super().get_queryset()
        action = self.request.query_params.get('action')
        search = self.request.query_params.get('search')
        
        if action and action != 'all':
            qs = qs.filter(action=action)
        if search:
            qs = qs.filter(
                Q(description__icontains=search) |
                Q(user_email__icontains=search) |
                Q(action__icontains=search)
            )
        return qs


class FinancialMetricsView(APIView):
    """API endpoint to compute hotel financial performance metrics (ADR, RevPAR, ALOS, Revenue)."""
    permission_classes = [permissions.IsAuthenticated, IsHotelStaff]

    def get(self, request, *args, **kwargs):
        date_range = request.query_params.get('date_range', 'this_month').lower()
        today = date.today()
        
        if date_range == 'today':
            start_date = today
            end_date = today
        elif date_range == 'this_week':
            start_date = today - timedelta(days=today.weekday())
            end_date = start_date + timedelta(days=6)
        elif date_range == 'this_month':
            start_date = date(today.year, today.month, 1)
            if today.month == 12:
                end_date = date(today.year, 12, 31)
            else:
                end_date = date(today.year, today.month + 1, 1) - timedelta(days=1)
        elif date_range == 'this_year':
            start_date = date(today.year, 1, 1)
            end_date = date(today.year, 12, 31)
        elif date_range == 'custom':
            start_str = request.query_params.get('start_date')
            end_str = request.query_params.get('end_date')
            try:
                start_date = datetime.strptime(start_str, '%Y-%m-%d').date() if start_str else today - timedelta(days=30)
                end_date = datetime.strptime(end_str, '%Y-%m-%d').date() if end_str else today
            except ValueError:
                return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            start_date = today - timedelta(days=30)
            end_date = today

        num_days = max(1, (end_date - start_date).days + 1)
        total_rooms = Room.objects.filter(is_archived=False).count() or 1
        total_available_room_nights = total_rooms * num_days

        # Fetch active bookings overlapping date range
        bookings = Booking.objects.filter(
            check_in__lte=end_date,
            check_out__gte=start_date,
            status__in=['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT']
        )

        total_bookings_count = bookings.count()
        rooms_sold_nights = 0
        total_stay_nights = 0

        for b in bookings:
            nights = max(1, (b.check_out - b.check_in).days)
            total_stay_nights += nights
            
            # Calculate overlapping nights within start_date..end_date
            o_start = max(b.check_in, start_date)
            o_end = min(b.check_out, end_date)
            o_nights = max(0, (o_end - o_start).days)
            rooms_sold_nights += o_nights

        # Calculate revenue from FolioItems or Bookings
        from bookings.models import FolioItem
        folio_items = FolioItem.objects.filter(
            folio__booking__check_in__lte=end_date,
            folio__booking__check_out__gte=start_date,
            folio__booking__status__in=['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT']
        )

        room_revenue = float(folio_items.filter(item_type='ROOM').aggregate(total=Sum('amount'))['total'] or 0.00)
        tax_revenue = float(folio_items.filter(item_type='TAX').aggregate(total=Sum('amount'))['total'] or 0.00)
        incidental_revenue = float(folio_items.filter(item_type='INCIDENTAL').aggregate(total=Sum('amount'))['total'] or 0.00)

        # Fallback if no folio items yet
        if room_revenue == 0 and bookings.exists():
            room_revenue = float(bookings.aggregate(total=Sum('total_price'))['total'] or 0.00)

        total_revenue = room_revenue + tax_revenue + incidental_revenue

        adr = round(room_revenue / max(1, rooms_sold_nights or total_bookings_count or 1), 2)
        revpar = round(room_revenue / max(1, total_available_room_nights), 2)
        alos = round(total_stay_nights / max(1, total_bookings_count), 1)
        occupancy_rate = round((rooms_sold_nights / max(1, total_available_room_nights)) * 100.0, 1)

        # Calculate 30-day forward revenue forecasting (active stays + future reservations)
        today_date = date.today()
        future_cutoff = today_date + timedelta(days=30)
        forward_bookings = Booking.objects.filter(
            check_out__gt=today_date,
            check_in__lte=future_cutoff,
            status__in=['CONFIRMED', 'CHECKED_IN', 'PENDING']
        )
        
        projected_revenue = 0.0
        for b in forward_bookings:
            f_start = max(b.check_in, today_date)
            f_end = min(b.check_out, future_cutoff)
            f_nights = max(0, (f_end - f_start).days)
            total_stay_nights = max(1, (b.check_out - b.check_in).days)
            daily_rate = float(b.total_price) / total_stay_nights
            projected_revenue += (daily_rate * f_nights)

        forward_booking_count = forward_bookings.count()

        # Occupancy by Room Type breakdown
        room_types = Room.objects.filter(is_archived=False).values('room_type').annotate(
            total=Count('id'),
            occupied=Count('id', filter=Q(status='OCCUPIED'))
        )
        occupancy_by_type = [
            {
                'roomType': rt['room_type'],
                'totalRooms': rt['total'],
                'occupiedRooms': rt['occupied'],
                'occupancyRate': round((rt['occupied'] / max(1, rt['total'])) * 100.0, 1)
            } for rt in room_types
        ]

        return Response({
            'period': {
                'startDate': start_date.strftime('%Y-%m-%d'),
                'endDate': end_date.strftime('%Y-%m-%d'),
                'numDays': num_days,
            },
            'kpis': {
                'totalRevenue': round(total_revenue, 2),
                'roomRevenue': round(room_revenue, 2),
                'taxRevenue': round(tax_revenue, 2),
                'incidentalRevenue': round(incidental_revenue, 2),
                'adr': adr,
                'revpar': revpar,
                'alos': alos,
                'occupancyRate': occupancy_rate,
                'totalBookings': total_bookings_count,
                'roomsSoldNights': rooms_sold_nights,
                'totalAvailableRoomNights': total_available_room_nights
            },
            'forecasting': {
                'projectedRevenueNext30Days': round(projected_revenue, 2),
                'forwardBookingsCount': forward_booking_count
            },
            'occupancyByRoomType': occupancy_by_type
        }, status=status.HTTP_200_OK)


class HotelConfigurationView(APIView):
    """API view to retrieve and update global hotel configuration parameters."""
    permission_classes = [permissions.IsAuthenticated, IsHotelStaff]

    def get(self, request, *args, **kwargs):
        config = HotelConfiguration.get_config()
        return Response({
            'hotelName': config.hotel_name,
            'taxRate': float(config.tax_rate),
            'currencySymbol': config.currency_symbol,
            'weekendSurgeMultiplier': float(config.weekend_surge_multiplier),
            'checkInTime': config.check_in_time,
            'checkOutTime': config.check_out_time,
            'cancellationGraceHours': config.cancellation_grace_hours,
            'updatedAt': config.updated_at.strftime('%Y-%m-%d %H:%M')
        }, status=status.HTTP_200_OK)

    def put(self, request, *args, **kwargs):
        if request.user.role != 'ADMIN':
            return Response({'error': 'Only Admin users can modify hotel parameters.'}, status=status.HTTP_403_FORBIDDEN)

        config = HotelConfiguration.get_config()
        data = request.data

        from decimal import Decimal
        if 'hotelName' in data:
            config.hotel_name = data['hotelName']
        if 'taxRate' in data:
            config.tax_rate = Decimal(str(data['taxRate']))
        if 'currencySymbol' in data:
            config.currency_symbol = data['currencySymbol']
        if 'weekendSurgeMultiplier' in data:
            config.weekend_surge_multiplier = Decimal(str(data['weekendSurgeMultiplier']))
        if 'checkInTime' in data:
            config.check_in_time = data['checkInTime']
        if 'checkOutTime' in data:
            config.check_out_time = data['checkOutTime']
        if 'cancellationGraceHours' in data:
            config.cancellation_grace_hours = int(data['cancellationGraceHours'])

        config.save()

        log_audit_event(
            user=request.user,
            action='STAFF_UPDATED',
            description=f"Updated hotel operational parameters (Tax: {config.tax_rate}%, Surge: x{config.weekend_surge_multiplier})",
            model_name='HotelConfiguration',
            object_id=config.id,
            request=request
        )

        return self.get(request, *args, **kwargs)


class SystemStatusView(APIView):
    """API view delivering real-time system health metrics, active subscriber counts, and DB connection status."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        from django.db import connection
        from django.conf import settings
        from core.events import EventBroadcaster

        db_ok = True
        try:
            connection.ensure_connection()
        except Exception:
            db_ok = False

        today = date.today()
        total_rooms = Room.objects.filter(is_archived=False).count()
        occupied_rooms = Room.objects.filter(status='OCCUPIED', is_archived=False).count()
        available_rooms = Room.objects.filter(status='AVAILABLE', is_archived=False).count()
        maintenance_rooms = Room.objects.filter(status='MAINTENANCE', is_archived=False).count()

        todays_checkins = Booking.objects.filter(check_in=today, status='CHECKED_IN').count()
        todays_checkouts = Booking.objects.filter(check_out=today, status='CHECKED_OUT').count()

        active_sse_subscribers = len(getattr(EventBroadcaster, '_subscribers', []))
        total_audit_logs = AuditLog.objects.count()

        return Response({
            'status': 'HEALTHY' if db_ok else 'DEGRADED',
            'timestamp': datetime.now().isoformat(),
            'database': {
                'connected': db_ok,
                'engine': settings.DATABASES['default']['ENGINE']
            },
            'realtimeStream': {
                'activeSubscribers': active_sse_subscribers
            },
            'operationalCounts': {
                'totalRooms': total_rooms,
                'availableRooms': available_rooms,
                'occupiedRooms': occupied_rooms,
                'maintenanceRooms': maintenance_rooms,
                'todaysCheckIns': todays_checkins,
                'todaysCheckOuts': todays_checkouts,
                'totalAuditLogs': total_audit_logs
            }
        }, status=status.HTTP_200_OK)


class SystemBackupView(APIView):
    """API endpoint to create instant database snapshots and list previous backup logs."""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request, *args, **kwargs):
        backups_dir = os.path.join(settings.BASE_DIR, 'backups')
        os.makedirs(backups_dir, exist_ok=True)
        files = []
        for f in os.listdir(backups_dir):
            if f.endswith('.json'):
                fp = os.path.join(backups_dir, f)
                files.append({
                    'filename': f,
                    'size_bytes': os.path.getsize(fp),
                    'created_at': datetime.fromtimestamp(os.path.getmtime(fp)).isoformat()
                })
        files.sort(key=lambda x: x['created_at'], reverse=True)
        return Response({'backups': files}, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        import json
        backups_dir = os.path.join(settings.BASE_DIR, 'backups')
        os.makedirs(backups_dir, exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"system_backup_{timestamp}.json"
        filepath = os.path.join(backups_dir, filename)

        data = {
            'timestamp': datetime.now().isoformat(),
            'rooms': list(Room.objects.values()),
            'bookings': list(Booking.objects.values()),
            'audit_logs': list(AuditLog.objects.values())
        }
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, default=str, indent=2)

        log_audit_event(
            user=request.user,
            action='STAFF_UPDATED',
            description=f"Generated database backup snapshot: {filename}",
            model_name='SystemBackup',
            request=request
        )

        return Response({
            'message': 'Database backup created successfully!',
            'filename': filename,
            'size_bytes': os.path.getsize(filepath)
        }, status=status.HTTP_201_CREATED)


