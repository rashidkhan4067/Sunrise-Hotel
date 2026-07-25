from django.urls import path
from .views import (
    DashboardKPIView, AnalyticsTrendsView, ReportsDataView, DashboardDataView,
    AuditLogListView, FinancialMetricsView, HotelConfigurationView, SystemStatusView,
    SystemBackupView
)

urlpatterns = [
    path('reports/kpi/', DashboardKPIView.as_view(), name='dashboard-kpi'),
    path('reports/trends/', AnalyticsTrendsView.as_view(), name='analytics-trends'),
    path('reports/data/', ReportsDataView.as_view(), name='reports-data'),
    path('reports/dashboard/', DashboardDataView.as_view(), name='dashboard-data'),
    path('reports/audit-logs/', AuditLogListView.as_view(), name='audit-logs'),
    path('reports/financials/', FinancialMetricsView.as_view(), name='financial-metrics'),
    path('reports/config/', HotelConfigurationView.as_view(), name='hotel-config'),
    path('reports/system-status/', SystemStatusView.as_view(), name='system-status'),
    path('reports/backup/', SystemBackupView.as_view(), name='system-backup'),
]
