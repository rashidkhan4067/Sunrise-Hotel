import json
import queue
import time
from django.http import StreamingHttpResponse

class EventBroadcaster:
    """In-memory event broadcaster for Server-Sent Events (SSE)."""
    _subscribers = []

    @classmethod
    def subscribe(cls):
        q = queue.Queue(maxsize=50)
        cls._subscribers.append(q)
        return q

    @classmethod
    def unsubscribe(cls, q):
        if q in cls._subscribers:
            cls._subscribers.remove(q)

    @classmethod
    def broadcast(cls, event_type, data):
        payload = json.dumps({
            'event': event_type,
            'timestamp': time.time(),
            'data': data
        })
        message = f"event: {event_type}\ndata: {payload}\n\n"

        for q in list(cls._subscribers):
            try:
                q.put_nowait(message)
            except queue.Full:
                cls.unsubscribe(q)

    @classmethod
    def broadcast_event(cls, event_type, data):
        return cls.broadcast(event_type, data)
