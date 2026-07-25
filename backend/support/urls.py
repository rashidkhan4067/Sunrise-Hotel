from django.urls import path
from .views import SupportTicketListCreateView, SupportTicketDetailView, ChatMessageListCreateView

urlpatterns = [
    path('support/tickets/', SupportTicketListCreateView.as_view(), name='support-ticket-list'),
    path('support/tickets/<uuid:pk>/', SupportTicketDetailView.as_view(), name='support-ticket-detail'),
    path('support/tickets/<uuid:pk>/messages/', ChatMessageListCreateView.as_view(), name='chat-message-list'),
]
