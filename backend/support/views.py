from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import SupportTicket, ChatMessage
from .serializers import SupportTicketSerializer, ChatMessageSerializer
from core.events import EventBroadcaster
from reports.models import log_audit_event

class SupportTicketListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Guests see their own tickets; Admin/Staff see all tickets
        if request.user.role in ['ADMIN', 'RECEPTIONIST']:
            tickets = SupportTicket.objects.all()
        else:
            tickets = SupportTicket.objects.filter(guest=request.user)
        
        status_param = request.query_params.get('status')
        if status_param:
            tickets = tickets.filter(status=status_param.upper())

        serializer = SupportTicketSerializer(tickets, many=True)
        return Response({'tickets': serializer.data}, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        serializer = SupportTicketSerializer(data=request.data)
        if serializer.is_valid():
            ticket = serializer.save(guest=request.user)

            # Auto-create initial message if provided
            initial_message = request.data.get('initial_message')
            if initial_message:
                ChatMessage.objects.create(
                    ticket=ticket,
                    sender=request.user,
                    sender_role=request.user.role if request.user.role in ['STAFF', 'ADMIN'] else 'GUEST',
                    sender_name=request.user.get_full_name() or request.user.username,
                    message=initial_message
                )

            from notifications.models import Notification
            from accounts.models import User

            # Notify hotel staff about new ticket
            staff_users = User.objects.filter(role__in=['ADMIN', 'RECEPTIONIST'])
            guest_display = request.user.get_full_name() or request.user.email
            for staff in staff_users:
                Notification.objects.create(
                    recipient=staff,
                    title=f"New Support Request #{ticket.ticket_id}",
                    description=f"{guest_display} requested assistance: '{ticket.subject}'",
                    icon='mail'
                )

            EventBroadcaster.broadcast_event('TICKET_CREATED', {
                'ticket_id': ticket.ticket_id,
                'subject': ticket.subject,
                'guest': guest_display
            })

            log_audit_event(
                user=request.user,
                action='STAFF_UPDATED',
                description=f"Created support ticket #{ticket.ticket_id}",
                model_name='SupportTicket',
                request=request
            )

            return Response(SupportTicketSerializer(ticket).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SupportTicketDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk, *args, **kwargs):
        ticket = get_object_or_404(SupportTicket, pk=pk)
        if request.user.role not in ['ADMIN', 'RECEPTIONIST'] and ticket.guest != request.user:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = SupportTicketSerializer(ticket)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk, *args, **kwargs):
        ticket = get_object_or_404(SupportTicket, pk=pk)
        if request.user.role not in ['ADMIN', 'RECEPTIONIST'] and ticket.guest != request.user:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = SupportTicketSerializer(ticket, data=request.data, partial=True)
        if serializer.is_valid():
            ticket = serializer.save()

            # Create Notification when ticket status changes
            from notifications.models import Notification
            if ticket.status == 'RESOLVED' and ticket.guest:
                Notification.objects.create(
                    recipient=ticket.guest,
                    title=f"Ticket Resolved #{ticket.ticket_id}",
                    description=f"Your request '{ticket.subject}' has been marked as resolved by reception.",
                    icon='task'
                )

            EventBroadcaster.broadcast_event('TICKET_UPDATED', {
                'ticket_id': ticket.ticket_id,
                'status': ticket.status
            })

            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChatMessageListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk, *args, **kwargs):
        ticket = get_object_or_404(SupportTicket, pk=pk)
        if request.user.role not in ['ADMIN', 'RECEPTIONIST'] and ticket.guest != request.user:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        # Auto mark messages as read based on viewing user role
        if request.user.role in ['ADMIN', 'RECEPTIONIST']:
            ticket.messages.filter(sender_role='GUEST', is_read=False).update(is_read=True)
        else:
            ticket.messages.filter(sender_role__in=['STAFF', 'ADMIN'], is_read=False).update(is_read=True)

        messages = ticket.messages.all()
        serializer = ChatMessageSerializer(messages, many=True)
        return Response({'messages': serializer.data}, status=status.HTTP_200_OK)

    def post(self, request, pk, *args, **kwargs):
        ticket = get_object_or_404(SupportTicket, pk=pk)
        if request.user.role not in ['ADMIN', 'RECEPTIONIST'] and ticket.guest != request.user:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        msg_text = request.data.get('message')
        if not msg_text:
            return Response({'error': 'Message content is required.'}, status=status.HTTP_400_BAD_REQUEST)

        sender_role = 'STAFF' if request.user.role in ['ADMIN', 'RECEPTIONIST'] else 'GUEST'
        sender_name = request.user.get_full_name() or request.user.email

        msg = ChatMessage.objects.create(
            ticket=ticket,
            sender=request.user,
            sender_role=sender_role,
            sender_name=sender_name,
            message=msg_text
        )

        ticket.status = 'IN_PROGRESS' if sender_role == 'STAFF' and ticket.status == 'OPEN' else ticket.status
        ticket.save()

        # Create Notifications for Chat Message
        from notifications.models import Notification
        from accounts.models import User

        if sender_role == 'STAFF':
            if ticket.guest:
                Notification.objects.create(
                    recipient=ticket.guest,
                    title=f"New Message on #{ticket.ticket_id}",
                    description=f"Reception Desk: '{msg_text[:60]}'",
                    icon='mail'
                )
        else:
            staff_users = User.objects.filter(role__in=['ADMIN', 'RECEPTIONIST'])
            for staff in staff_users:
                Notification.objects.create(
                    recipient=staff,
                    title=f"New Message on #{ticket.ticket_id}",
                    description=f"{sender_name}: '{msg_text[:60]}'",
                    icon='mail'
                )

        EventBroadcaster.broadcast_event('CHAT_MESSAGE_SENT', {
            'ticket_id': ticket.ticket_id,
            'sender_name': sender_name,
            'message': msg_text
        })

        return Response(ChatMessageSerializer(msg).data, status=status.HTTP_201_CREATED)
