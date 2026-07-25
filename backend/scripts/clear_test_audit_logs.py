import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from reports.models import AuditLog
from django.db.models import Q

def clear_test_logs():
    test_logs = AuditLog.objects.filter(
        Q(user_email__icontains='admin_test@sunrise.com') |
        Q(description__icontains='John Phase3') |
        Q(description__icontains='ITEM-999') |
        Q(description__icontains='test guest')
    )
    count = test_logs.count()
    test_logs.delete()
    print(f"Successfully deleted {count} test audit log entries from the database.")

if __name__ == '__main__':
    clear_test_logs()
