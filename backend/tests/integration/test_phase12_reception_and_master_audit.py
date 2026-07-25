import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from check_master_system_integrity import run_master_audit

def run_tests():
    print("==========================================")
    print("   PHASE 12 INTEGRATION VERIFICATION TEST  ")
    print("==========================================")

    master_ok = run_master_audit()
    assert master_ok is True
    print("\n-> PASS: Phase 12 Master System Integrity Suite verified!")

    print("\n==========================================")
    print("   ALL PHASE 12 VERIFICATION TESTS PASSED  ")
    print("==========================================")

if __name__ == '__main__':
    run_tests()
