from django.urls import path
from .views import DashboardKPIView, AnalyticsTrendsView

urlpatterns = [
    path('reports/kpi/', DashboardKPIView.as_view(), name='dashboard-kpi'),
    path('reports/trends/', AnalyticsTrendsView.as_view(), name='analytics-trends'),
]
