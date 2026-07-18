from django.urls import path
from .views import DashboardKPIView, AnalyticsTrendsView, ReportsDataView, DashboardDataView

urlpatterns = [
    path('reports/kpi/', DashboardKPIView.as_view(), name='dashboard-kpi'),
    path('reports/trends/', AnalyticsTrendsView.as_view(), name='analytics-trends'),
    path('reports/data/', ReportsDataView.as_view(), name='reports-data'),
    path('reports/dashboard/', DashboardDataView.as_view(), name='dashboard-data'),
]
