import os
import sys
import datetime
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from reports.models import AuditLog

def clean_old_logs(days_threshold=90):
    """Log maintenance utility to clean up transient audit log entries older than days_threshold."""
    print("==========================================================")
    print("   SUNRISE HOTEL PMS — LOG MAINTENANCE CLEANER ENGINE    ")
    print("==========================================================")
    
    cutoff_date = datetime.datetime.now() - datetime.timedelta(days=days_threshold)
    print(f"Searching for audit logs created prior to: {cutoff_date.strftime('%Y-%m-%d %H:%M:%S')} ({days_threshold} days)...")

    old_logs = AuditLog.objects.filter(timestamp__lt=cutoff_date)
    count = old_logs.count()

    if count > 0:
        deleted_count, _ = old_logs.delete()
        print(f"✓ Cleaned up {deleted_count} transient audit log entries.")
    else:
        print("✓ Log database clean. No entries exceeded retention threshold.")

    print("==========================================================")
    return count

if __name__ == '__main__':
    clean_old_logs()
