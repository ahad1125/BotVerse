from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import (BotViewSet,KnowledgeSourceViewSet,ConversationListView,ChatView,QuickViewViewSet,PublicBotInfoView,BotQRCodeView,ConversationMessagesView,PublicQuickRepliesView,LeadViewSet,health_check)


router=DefaultRouter()
router.register('bots',BotViewSet,basename='bot')

knowledge_source_list=KnowledgeSourceViewSet.as_view({'get':'list','post':'create'})
knowledge_source_detail=KnowledgeSourceViewSet.as_view({'get':'retrieve','put':'update','patch':'partial_update','delete':'destroy'})
knowledge_source_retry=KnowledgeSourceViewSet.as_view({'post':'retry'})

quick_reply_list=QuickViewViewSet.as_view({'get':'list','post':'create'})
quick_reply_detail=QuickViewViewSet.as_view({'get':'retrieve','put':'update','patch':'partial_update','delete':'destroy'})

urlpatterns=[
    path('',include(router.urls)),
    path('bots/<uuid:bot_pk>/knowledge-sources/',knowledge_source_list,name='knowledge-source-list'),
    path('bots/<uuid:bot_pk>/knowledge-sources/<uuid:pk>/',knowledge_source_detail,name='knowledge-source-detail'),
    path('bots/<uuid:bot_pk>/knowledge-sources/<uuid:pk>/retry/',knowledge_source_retry,name='knowledge-source-retry'),
    path('bots/<uuid:bot_pk>/chat/',ChatView.as_view(),name='chat-view'),
    path('bots/<uuid:bot_pk>/quick-replies/',quick_reply_list,name='quick-reply-list'),
    path('bots/<uuid:bot_pk>/quick-replies/<uuid:pk>/',quick_reply_detail,name='quick-reply-detail'),
    path('bots/<uuid:bot_pk>/public-info/', PublicBotInfoView.as_view(), name='public-bot-info'),
    path('bots/<uuid:bot_pk>/qr-code/', BotQRCodeView.as_view(), name='bot-qr-code'),
    path('bots/<uuid:bot_pk>/conversations/<uuid:conversation_pk>/messages/',ConversationMessagesView.as_view(),name='conversation-messages'),
    path('bots/<uuid:bot_pk>/public-quick-replies/',PublicQuickRepliesView.as_view(),name='public-quick-replies'),
    path("bots/<uuid:bot_pk>/leads/",LeadViewSet.as_view({"get": "list",}),name="lead-list",),
    path("bots/<uuid:bot_pk>/leads/<uuid:pk>/",LeadViewSet.as_view({"get": "retrieve","delete": "destroy",}),name="lead-detail",),
    path('bots/<uuid:bot_pk>/conversations/',ConversationListView.as_view(),name='conversation-list'),
    path('health/',health_check),
]