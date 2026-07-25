#!/usr/bin/env python
"""
Phase 18 Integration Verification Test Suite: Support Desk & Live Chat Subsystem
"""

import os
import sys

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate
from support.views import SupportTicketListCreateView, SupportTicketDetailView, ChatMessageListCreateView
from support.models import SupportTicket, ChatMessage

User = get_user_model()

def main():
    print("=====================================================")
    print("   PHASE 18 SUPPORT DESK & LIVE CHAT VERIFICATION TEST")
    print("=====================================================")

    # Get or create test Guest & Admin users
    admin = User.objects.filter(role='ADMIN').first()
    if not admin:
        admin = User.objects.create_superuser(email='admin18@sunrise.com', password='pass123', role='ADMIN')

    guest = User.objects.filter(role='CLIENT').first()
    if not guest:
        guest = User.objects.create_user(email='guest18@sunrise.com', password='pass123', role='CLIENT')

    factory = APIRequestFactory()

    # 1. Create a Support Ticket as Guest
    view_ticket_list = SupportTicketListCreateView.as_view()
    req = factory.post('/api/support/tickets/', {
        'subject': 'Room AC Adjustment Request',
        'category': 'ROOM_SERVICE',
        'priority': 'HIGH',
        'initial_message': 'Hello, could someone check the air conditioning in Room 302?'
    }, format='json')
    force_authenticate(req, user=guest)
    res = view_ticket_list(req)
    print(f"[Test 1] Create Ticket as Guest: HTTP {res.status_code}")
    assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.data}"
    ticket_id = res.data['id']
    ticket_code = res.data['ticket_id']
    print(f"   -> Ticket Created #{ticket_code} (ID: {ticket_id})")

    # Verify initial chat message created automatically
    messages = ChatMessage.objects.filter(ticket_id=ticket_id)
    assert messages.count() == 1, f"Expected 1 initial message, got {messages.count()}"
    print(f"   -> Initial Message Verified: '{messages.first().message}'")

    # 2. List Tickets as Admin
    req = factory.get('/api/support/tickets/')
    force_authenticate(req, user=admin)
    res = view_ticket_list(req)
    print(f"[Test 2] List Tickets as Admin Staff: HTTP {res.status_code}")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    tickets = res.data.get('tickets', res.data)
    assert any(str(t['id']) == str(ticket_id) for t in tickets), "Created ticket not found in Admin list"
    print(f"   -> Admin successfully listed {len(tickets)} total tickets")

    # 3. Staff responds to ticket (Send Chat Message as Admin)
    view_chat = ChatMessageListCreateView.as_view()
    req = factory.post(f'/api/support/tickets/{ticket_id}/messages/', {
        'message': 'Our technician has been dispatched to Room 302 and will arrive in 10 minutes.'
    }, format='json')
    force_authenticate(req, user=admin)
    res = view_chat(req, pk=ticket_id)
    print(f"[Test 3] Admin Responds via Live Chat: HTTP {res.status_code}")
    assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.data}"
    assert res.data['sender_role'] == 'STAFF', f"Expected sender_role STAFF, got {res.data['sender_role']}"

    # 4. Guest replies to Admin response
    req = factory.post(f'/api/support/tickets/{ticket_id}/messages/', {
        'message': 'Thank you so much! I will be waiting.'
    }, format='json')
    force_authenticate(req, user=guest)
    res = view_chat(req, pk=ticket_id)
    print(f"[Test 4] Guest Replies in Chat Thread: HTTP {res.status_code}")
    assert res.status_code == 201, f"Expected 201, got {res.status_code}"

    # 5. Fetch message history for the ticket
    req = factory.get(f'/api/support/tickets/{ticket_id}/messages/')
    force_authenticate(req, user=guest)
    res = view_chat(req, pk=ticket_id)
    print(f"[Test 5] Fetch Chat History: HTTP {res.status_code}")
    assert res.status_code == 200
    msg_list = res.data.get('messages', res.data)
    assert len(msg_list) == 3, f"Expected 3 messages, got {len(msg_list)}"
    print(f"   -> Chat history contains {len(msg_list)} verified messages")

    # 6. Admin updates ticket status to RESOLVED
    view_ticket_detail = SupportTicketDetailView.as_view()
    req = factory.patch(f'/api/support/tickets/{ticket_id}/', {
        'status': 'RESOLVED'
    }, format='json')
    force_authenticate(req, user=admin)
    res = view_ticket_detail(req, pk=ticket_id)
    print(f"[Test 6] Admin Marks Ticket RESOLVED: HTTP {res.status_code}")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    assert res.data['status'] == 'RESOLVED', f"Expected status RESOLVED, got {res.data['status']}"
    assert res.data['updated_at'] is not None, "updated_at timestamp should be set"

    print("\n=====================================================")
    print("   ALL PHASE 18 VERIFICATION TESTS PASSED SUCCESSFULLY! ")
    print("=====================================================")

if __name__ == '__main__':
    main()
