import os
import sys
import json
import datetime
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from rooms.models import Room, RoomType
from bookings.models import Booking, Folio, FolioItem
from guests.models import Guest
from reports.models import AuditLog, HotelConfiguration

def export_backup():
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_filename = f"sunrise_backup_{timestamp}.json"
    
    print("==========================================================")
    print("   SUNRISE HOTEL PMS — SYSTEM DATA BACKUP ENGINE         ")
    print("==========================================================")
    print(f"Exporting database snapshot to: {backup_filename}...")

    rooms_data = [
        {
            'id': r.id,
            'room_number': r.room_number,
            'room_type': r.room_type,
            'status': r.status,
            'price_per_night': float(r.price_per_night),
            'is_clean': r.is_clean,
            'is_inspected': r.is_inspected
        } for r in Room.objects.all()
    ]

    guests_data = [
        {
            'id': g.id,
            'full_name': g.full_name,
            'email': g.email,
            'phone_number': g.phone_number,
            'document_number': g.document_number
        } for g in Guest.objects.all()
    ]

    bookings_data = [
        {
            'booking_id': str(b.booking_id),
            'guest_id': b.guest_id,
            'room_number': b.room.room_number if b.room else None,
            'check_in': b.check_in.strftime('%Y-%m-%d'),
            'check_out': b.check_out.strftime('%Y-%m-%d'),
            'total_price': float(b.total_price),
            'status': b.status
        } for b in Booking.objects.all()
    ]

    audit_logs_count = AuditLog.objects.count()

    backup_payload = {
        'version': '1.0.0',
        'exported_at': datetime.datetime.now().isoformat(),
        'counts': {
            'rooms': len(rooms_data),
            'guests': len(guests_data),
            'bookings': len(bookings_data),
            'audit_logs': audit_logs_count
        },
        'data': {
            'rooms': rooms_data,
            'guests': guests_data,
            'bookings': bookings_data
        }
    }

    with open(backup_filename, 'w', encoding='utf-8') as f:
        json.dump(backup_payload, f, indent=2)

    print(f"✓ Backup exported successfully! ({len(rooms_data)} rooms, {len(guests_data)} guests, {len(bookings_data)} bookings)")
    print("==========================================================")
    return True

if __name__ == '__main__':
    export_backup()
