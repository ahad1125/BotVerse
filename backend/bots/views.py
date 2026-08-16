from django.shortcuts import render
from .serializers import (BotSerializer,ChatMessageInputSerializer,ConversationSerializer,LeadSerializer,KnowledgeSourceSerializer,QuickReplySerializer,PublicBotSerializer)
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.exceptions import PermissionDenied
from .models import (Bot,KnowledgeSource,Conversation,Lead,Message,QuickReply)
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view

from rest_framework.decorators import action,api_view,permission_classes


import qrcode
from io import BytesIO
from django.http import HttpResponse

# Create your views here.



from .tasks import (process_knowledge_source)

from .rag_utils import(generate_answer,retrieve_relevant_chunks,extract_lead_info,might_contain_lead_info)

class BotViewSet(ModelViewSet):
    queryset=Bot.objects.all()
    serializer_class=BotSerializer
    permission_classes=[IsAuthenticated]
    filter_backends=[DjangoFilterBackend,filters.SearchFilter,filters.OrderingFilter]
    
    filterset_fields=['category','language','is_active']
    search_fields=['name']
    ordering_fields=['created_at','name']
    
    
    def get_queryset(self):
        return Bot.objects.filter(owner=self.request.user)
    
    def perform_create(self,serializer):
        serializer.save(owner=self.request.user)
        
        

class KnowledgeSourceViewSet(ModelViewSet):
    serializer_class=KnowledgeSourceSerializer
    permission_classes=[IsAuthenticated]
    
    def get_bot(self):
        bot_id=self.kwargs['bot_pk']
        
        try:
            return Bot.objects.get(id=bot_id,owner=self.request.user)
        except Bot.DoesNotExist:
            raise PermissionDenied("Bot not found or you don't have access.")
        
    
    def get_queryset(self):
        bot=self.get_bot()
        return KnowledgeSource.objects.filter(bot=bot)
    
    
    def perform_create(self,serializer):
        bot=self.get_bot()
        instance=serializer.save(bot=bot)
        
        process_knowledge_source.delay(instance.id)
        
    @action(detail=True, methods=['post'])
    def retry(self, request, bot_pk=None, pk=None):
        source = get_object_or_404(
            KnowledgeSource, pk=pk, bot=self.get_bot()
        )
        if source.status not in ('failure', 'pending'):
            return Response(
                {'success': False, 'message': 'Only failed or pending sources can be retried.', 'errors': {}},
                status=status.HTTP_400_BAD_REQUEST
            )
        source.status = 'pending'
        source.save()
        process_knowledge_source.delay(source.id)
        return Response(
            {'success': True, 'data': KnowledgeSourceSerializer(source).data, 'message': 'Retry queued.'},
            status=status.HTTP_200_OK
        )
        
class ChatView(APIView):
    
    permission_classes=[AllowAny]        
    def post(self,request,bot_pk):
        
        serializer=ChatMessageInputSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        
        message_text=serializer.validated_data['message']
        conversation_id=serializer.validated_data.get('conversation_id')
         
        bot=get_object_or_404(Bot,pk=bot_pk)
     
        if conversation_id:
            conversation=get_object_or_404(Conversation,pk=conversation_id,bot=bot)
        else:
            conversation=Conversation.objects.create(bot=bot)
            
        Message.objects.create(conversation=conversation,sender='user',content=message_text)
        
        lead_info=None
        if might_contain_lead_info(message_text):
            lead_info=extract_lead_info(message_text)
        lead_captured=False
        
        if lead_info:
            lead_captured=True
            lead,created=Lead.objects.get_or_create(
                conversations=conversation,
                defaults={
                    "bot":bot,
                    "name":lead_info.get('name',''),
                    'email':lead_info.get('email',''),
                    'phone_number':lead_info.get('phone',''),
                }
            )
            
            if not created:
                
                if lead_info.get('name'):
                    
                    lead.name=lead_info['name']
                    
                if lead_info.get('email'):
                    
                    lead.email=lead_info['email']
                    
                if lead_info.get('phone'):
                    
                    lead.phone_number=lead_info['phone']
                    
                lead.save()
                
                
        fallback_message=bot.fallback_message or f'Sorry, I dont have that information.Please contact us directly.'
            
        
        
        chunks=retrieve_relevant_chunks(bot_pk,message_text)
        answer,citations=generate_answer(bot=bot,question=message_text,
                               retreived_chunks=chunks,
                               fallback_message=fallback_message,
                               lead_captured=lead_captured,
                               )
        
        
        best_distance=chunks[0][1] if chunks else 0
        
        
                
        Message.objects.create(conversation=conversation,
                               sender='bot',
                               content=answer,
                               confidence_score=best_distance)
        
        return Response({
            'conversation_id':conversation.id,
            'answer':answer,
            'citations':citations,
        },status=status.HTTP_200_OK)
        
        
class QuickViewViewSet(ModelViewSet):
    serializer_class=QuickReplySerializer
    permission_classes=[IsAuthenticated]
    
    def get_bot(self):
        bot_id=self.kwargs['bot_pk']
        try:
            return Bot.objects.get(id=bot_id,owner=self.request.user)
        except Bot.DoesNotExist:
            raise PermissionDenied("Bot not found or you don't have access")
        
        
        
    def get_queryset(self):
        bot=self.get_bot()
        return QuickReply.objects.filter(bot=bot)
    
    def perform_create(self,serializer):
        bot=self.get_bot()
        
        serializer.save(bot=bot)
        

class PublicBotInfoView(APIView):
    permission_classes=[AllowAny]
    
    def get(self,request,bot_pk):
        bot=get_object_or_404(Bot,pk=bot_pk)
        serializer=PublicBotSerializer(bot)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    
class BotQRCodeView(APIView):
    
    permission_classes=[IsAuthenticated]
    
    def get(self,request,bot_pk):
        
        bot=get_object_or_404(Bot,pk=bot_pk,owner=request.user)
        
        import os
        frontend_url = os.getenv('FRONTEND_URL', 'https://botverse-app.vercel.app').rstrip('/')
        hosted_link=f'{frontend_url}/chat/{bot.id}'
        
        qr=qrcode.make(hosted_link)
        
        buffer=BytesIO()
        qr.save(buffer,format='PNG')
        buffer.seek(0)
        
        
        return HttpResponse(buffer,content_type='image/png')
    

        
class ConversationMessagesView(APIView):
    permission_classes=[IsAuthenticated]
    
    def get(self,request,bot_pk,conversation_pk):
        bot=get_object_or_404(Bot,pk=bot_pk,owner=request.user)
        conversation=get_object_or_404(Conversation,pk=conversation_pk,bot=bot)
        messages=conversation.messages.all().order_by('created_at')
        
        import math
        
        data=[
            {
                'id':m.id,
                'sender':m.sender,
                'content':m.content,
                'created_at':m.created_at,
                'confidence_score': None if m.confidence_score is not None and math.isnan(m.confidence_score) else m.confidence_score
            }
            for m in messages
        ]
        
        return Response({
            'success':True,
            'data':data,
            'messages':'OK'
        },
                        status=status.HTTP_200_OK)
        
        
class PublicQuickRepliesView(APIView):
    permission_classes=[AllowAny]
    
    def get(self,request,bot_pk):
        bot=get_object_or_404(Bot,pk=bot_pk)
        replies=QuickReply.objects.filter(bot=bot)
        return Response(
            QuickReplySerializer(replies,many=True).data
        ,status=status.HTTP_200_OK)
        

class LeadViewSet(ModelViewSet):
    serializer_class=LeadSerializer
    permission_classes=[IsAuthenticated]
    http_method_names=['get','delete']
    
    def get_bot(self):
        try:
            return Bot.objects.get(id=self.kwargs['bot_pk'],owner=self.request.user)
        except Bot.DoesNotExist:
            raise PermissionDenied('Bot not found or you dont have access')
        
        
    def get_queryset(self):
        return Lead.objects.filter(bot=self.get_bot())
    
class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, bot_pk):
        bot = get_object_or_404(Bot, pk=bot_pk, owner=request.user)
        conversations = Conversation.objects.filter(bot=bot).order_by('-started_at')
        serializer = ConversationSerializer(conversations, many=True)
        return Response({
            'success': True,
            'data': serializer.data,
            'message': 'OK'
        }, status=status.HTTP_200_OK)
        
@api_view(['GET','HEAD'])     
@permission_classes([AllowAny])   
def health_check(request):
    return Response({
        'status':'ok'
    })