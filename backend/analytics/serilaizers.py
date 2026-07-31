from rest_framework import serializers

class TotalConversationsSerializer(serializers.Serializer):
    
    bot_id=serializers.UUIDField()
    total_conversations=serializers.IntegerField()
    
    