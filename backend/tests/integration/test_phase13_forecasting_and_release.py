import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from verify_production_release import verify_release

def run_tests():
    print("==========================================")
    print("   PHASE 13 INTEGRATION VERIFICATION TEST  ")
    print("==========================================")

    release_ok = verify_release()
    assert release_ok is True
    print("\n-> PASS: Phase 13 Final Production Release Verification Suite passed!")

    print("\n==========================================")
    print("   ALL PHASE 13 VERIFICATION TESTS PASSED  ")
    print("==========================================")

if __name__ == '__main__':
    run_tests()
