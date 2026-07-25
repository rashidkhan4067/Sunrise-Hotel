#!/usr/bin/env python
"""
Phase 16 Integration Verification Test Suite
"""

import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate
from reports.views import SystemBackupView

User = get_user_model()

def main():
    print("==========================================")
    print("   PHASE 16 INTEGRATION VERIFICATION TEST  ")
    print("==========================================")

    admin = User.objects.filter(role='ADMIN').first()
    if not admin:
        print("FAIL: No Admin user found")
        sys.exit(1)

    factory = APIRequestFactory()

    # Test 1: POST /api/reports/backup/ (Create Backup)
    req = factory.post('/api/reports/backup/')
    force_authenticate(req, user=admin)
    res = SystemBackupView.as_view()(req)
    print(f"[Test 1] Create Instant Snapshot: HTTP {res.status_code}")
    assert res.status_code == 201
    filename = res.data.get('filename')
    print(f"Generated Snapshot: {filename} ({res.data.get('size_bytes')} bytes)")

    # Test 2: GET /api/reports/backup/ (List Backups)
    req = factory.get('/api/reports/backup/')
    force_authenticate(req, user=admin)
    res = SystemBackupView.as_view()(req)
    print(f"[Test 2] List Previous Snapshots: HTTP {res.status_code}")
    assert res.status_code == 200
    backups = res.data.get('backups', [])
    assert len(backups) > 0
    print(f"Total Snapshots Recorded: {len(backups)}")

    print("\n==========================================")
    print("   ALL PHASE 16 VERIFICATION TESTS PASSED  ")
    print("==========================================")

if __name__ == '__main__':
    main()
