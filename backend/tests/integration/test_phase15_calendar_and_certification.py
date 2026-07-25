#!/usr/bin/env python
"""
Phase 15 Verification Test Suite
"""

import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from certify_master_production_release import run_certification_suite

def main():
    print("==========================================")
    print("   PHASE 15 INTEGRATION VERIFICATION TEST  ")
    print("==========================================")

    certified = run_certification_suite()
    if certified:
        print("\n==========================================")
        print("   ALL PHASE 15 VERIFICATION TESTS PASSED  ")
        print("==========================================")
        sys.exit(0)
    else:
        print("\n==========================================")
        print("   PHASE 15 VERIFICATION TEST FAILED      ")
        print("==========================================")
        sys.exit(1)

if __name__ == '__main__':
    main()
