import queue
import time
from django.http import StreamingHttpResponse
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.renderers import BaseRenderer
from .models import Notification
from .serializers import NotificationSerializer
from core.events import EventBroadcaster


class EventStreamRenderer(BaseRenderer):
    media_type = 'text/event-stream'
    format = 'txt'
    def render(self, data, accepted_media_type=None, renderer_context=None):
        return data


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=True, methods=['PATCH'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)

    @action(detail=False, methods=['POST'], url_path='mark-all-read')
    def mark_all_read(self, request):
        queryset = self.get_queryset()
        queryset.update(is_read=True)
        return Response({'status': 'all notifications marked as read'}, status=status.HTTP_200_OK)


class NotificationStreamView(APIView):
    """Server-Sent Events (SSE) streaming view pushing real-time notification events to client terminals."""
    permission_classes = [permissions.AllowAny]
    renderer_classes = [EventStreamRenderer]

    def perform_content_negotiation(self, request, force=False):
        return (EventStreamRenderer(), 'text/event-stream')

    def get(self, request, *args, **kwargs):
        # Support token query parameter for browser EventSource
        token = request.query_params.get('token')
        if token and not getattr(request.user, 'is_authenticated', False):
            from accounts.authentication import ClerkJWTAuthentication
            try:
                auth = ClerkJWTAuthentication()
                validated_token = auth.verify_clerk_token(token)
                if validated_token:
                    user_obj = auth.get_or_create_user(validated_token)
                    request.user = user_obj
            except Exception:
                pass

        q = EventBroadcaster.subscribe()

        def stream():
            try:
                # Send initial connection event
                yield f"event: ping\ndata: {{\"status\": \"connected\"}}\n\n"
                while True:
                    try:
                        msg = q.get(timeout=20)
                        yield msg
                    except queue.Empty:
                        yield f"event: ping\ndata: {{\"timestamp\": {time.time()}}}\n\n"
            finally:
                EventBroadcaster.unsubscribe(q)

        response = StreamingHttpResponse(stream(), content_type='text/event-stream')
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'
        return response
