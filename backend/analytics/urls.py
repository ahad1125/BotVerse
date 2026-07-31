from django.urls import path
from .views import TotalConversationsView,UnansweredQuestionsView,ConversationPerDayView,TopQuestionsView,BotAnalyticsSummaryView,PeakHoursView

urlpatterns=[
    path('bots/<uuid:bot_pk>/analytics/total-conversations/',TotalConversationsView.as_view(),name='total_conversations'),
    path('bots/<uuid:bot_pk>/analytics/unanswered-questions/',UnansweredQuestionsView.as_view(),name='unanswered_questions'),
    path('bots/<uuid:bot_pk>/analytics/conversations-per-day/',ConversationPerDayView.as_view(),name='conversation_per_day'),
    path('bots/<uuid:bot_pk>/analytics/top-questions/',TopQuestionsView.as_view(),name='top_questions'),
    path('bots/<uuid:bot_pk>/analytics/summary/',BotAnalyticsSummaryView.as_view(),name='analytics_summary'),
    path('bots/<uuid:bot_pk>/analytics/peak-hours/',PeakHoursView.as_view(),name='peak_hours'),
    
]