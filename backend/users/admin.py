from django.contrib import admin

# Register your models here.

from bots.models import (Bot,Lead,Conversation,KnowledgeSource,Message,QuickReply)
from .models import User
from widgets.models import WidgetConfig



@admin.register(Bot)
class BotAdmin(admin.ModelAdmin):
    pass

@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    pass

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    pass

@admin.register(KnowledgeSource)
class KnowledgeSourceAdmin(admin.ModelAdmin):
    pass

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    pass

@admin.register(QuickReply)
class QuickReplyAdmin(admin.ModelAdmin):
    pass

@admin.register(WidgetConfig)
class WidgetConnfigAdmin(admin.ModelAdmin):
    pass

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    pass
