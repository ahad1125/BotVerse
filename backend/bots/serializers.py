from .models import (Bot,Conversation,KnowledgeSource,Message,QuickReply,Lead)
from rest_framework  import serializers


from .tasks import process_knowledge_source

class BotSerializer(serializers.ModelSerializer):
    class Meta:
        model=Bot
        fields = [
            'id', 'owner', 'name', 'business_name', 'category', 'language',
            'fallback_message', 'greeting_message', 'tone', 'is_active',
            'avatar', 'timezone', 'primary_color',
            'created_at', 'updated_at',
        ]
        read_only_fields=['id','owner','created_at','updated_at']
        


class KnowledgeSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model=KnowledgeSource
        fields='__all__'
        read_only_fields=['id','bot','status','created_at','updated_at','extracted_text']
        
        
        
        
class ChatMessageInputSerializer(serializers.Serializer):
    
    message=serializers.CharField(max_length=2000)
    conversation_id=serializers.UUIDField(required=False,allow_null=True)
        
    
        
class MessageSerializer(serializers.ModelSerializer):
    
    
    class Meta:
        
        model=Message
        fields=['id','sender','created_at','confidence_score','created_at']
        read_only_fields=fields
        
        
class QuickReplySerializer(serializers.ModelSerializer):
    
    class Meta:
        model=QuickReply
        fields=['id','bot','text','created_at','updated_at']
        read_only_fields=['id','bot','created_at','uploaded_at']
        
        
        
        
class PublicBotSerializer(serializers.ModelSerializer):
    class Meta:
        
        model=Bot
        fields=['id','name','greeting_message','tone','language','primary_color','avatar']
        read_only_fields=fields
        
class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model=Lead
        fields=['id','bot','name','email','phone_number','preferred_time','created_at']
        read_only_fields= ['id', 'bot', 'name', 'email', 'phone_number', 'preferred_time', 'created_at']
        
        
class ConversationSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'started_at', 'ended_at', 'last_message']
        read_only_fields = fields

    def get_last_message(self, obj):
        last = obj.messages.order_by('-created_at').first()
        return last.content[:60] if last else None