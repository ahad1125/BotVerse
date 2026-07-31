from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from bots.models import Bot,Conversation,Lead
from rest_framework import status

from bots.rag_utils import cluster_similar_questions

from bots.models import Message
from django.db.models.functions import TruncDate,ExtractHour
from django.db.models import Count



# Create your views here.

class TotalConversationsView(APIView):
    permission_classes=[IsAuthenticated]
    
    def get(self,request,bot_pk):
        
        bot=get_object_or_404(Bot,pk=bot_pk,owner=request.user)
        
        total_conversations=Conversation.objects.filter(bot=bot).count()
        
        return Response({'bot_id':bot.id,
                         'total_conversations':total_conversations},status=status.HTTP_200_OK)
        
        


class UnansweredQuestionsView(APIView):
    permission_classes=[IsAuthenticated]
    
    def get(self,request,bot_pk):
        
        bot=get_object_or_404(Bot,owner=request.user,pk=bot_pk)
        
        unanswered=Message.objects.filter(
            conversation__bot=bot,
            sender='bot',
            content=bot.fallback_message if bot.fallback_message else "Sorry, I don't have that information. Please contact us directly."
        ).count()
        
        return Response({'bot_id':bot.id,
                         'unanswered_questions':unanswered},status=status.HTTP_200_OK)
        
        
class ConversationPerDayView(APIView):
    permission_classes=[IsAuthenticated]
    
    def get(self,request,bot_pk):
        
        bot=get_object_or_404(Bot,owner=request.user,pk=bot_pk)
        
        data=(Conversation.objects.filter(bot=bot).annotate(date=TruncDate('started_at'))
              .values('date')
              .annotate(count=Count('id'))
              .order_by('date')
              )
        
        return Response({
            'bot_id':bot.id,
            'conversations_per_day':list(data)
        },status=status.HTTP_200_OK)
        
        
class PeakHoursView(APIView):
    permission_classes=[IsAuthenticated]
    
    
    def get(self,request,bot_pk):
        
        bot=get_object_or_404(Bot,pk=bot_pk,owner=request.user)
        
        data=(
            Conversation.objects.filter(bot=bot)
            .annotate(hour=ExtractHour('started_at'))
            .values('hour')
            .annotate(count=Count('id'))
            .order_by('hour')
        )
        
        return Response({
            'bot_id':bot.id,
            'peak_hours':list(data)
        },status=status.HTTP_200_OK)
        
        
        
class TopQuestionsView(APIView):
    permission_classes=[IsAuthenticated]
    
    
    def get(self,request,bot_pk):
        bot=get_object_or_404(Bot,pk=bot_pk,owner=request.user)
        
        question=list(
            Message.objects.filter(conversation__bot=bot,sender='user')
            .values_list('content',flat=True)
        )


        clustered=cluster_similar_questions(question)      
        
        
        return Response({
            'bot_id':bot.id,
            'top_questions':clustered[:10]
        },status=status.HTTP_200_OK)  
    
    
        


class BotAnalyticsSummaryView(APIView):
    permission_classes=[IsAuthenticated]
    
    def get(self,request,bot_pk):
        
        bot=get_object_or_404(Bot,pk=bot_pk,owner=request.user)
        
        total_conversations=Conversation.objects.filter(bot=bot).count()
        
        fallback_msg = bot.fallback_message if bot.fallback_message else "Sorry, I don't have that information. Please contact us directly."
        
        unanswered_count=Message.objects.filter(
            conversation__bot=bot,
            sender='bot',
            content=fallback_msg
        ).count()
        
        leads_count=Lead.objects.filter(bot=bot).count()
        
        total_queries = Message.objects.filter(conversation__bot=bot, sender='user').count()
        if total_queries > 0:
            answer_rate = max(0.0, min(100.0, ((total_queries - unanswered_count) / total_queries) * 100))
        else:
            answer_rate = 100.0
            
        # Get actual unanswered questions
        fallback_bot_messages = Message.objects.filter(
            conversation__bot=bot,
            sender='bot',
            content=fallback_msg
        ).order_by('-created_at')[:15]
        
        unanswered_questions = []
        seen_questions = set()
        for msg in fallback_bot_messages:
            prev_user_msg = Message.objects.filter(
                conversation=msg.conversation,
                sender='user',
                created_at__lt=msg.created_at
            ).order_by('-created_at').first()
            if prev_user_msg and prev_user_msg.content not in seen_questions:
                seen_questions.add(prev_user_msg.content)
                unanswered_questions.append({
                    'id': str(prev_user_msg.id),
                    'question': prev_user_msg.content,
                    'created_at': prev_user_msg.created_at.isoformat()
                })
        
        conversations_per_day=(Conversation.objects.filter(bot=bot).annotate(date=TruncDate('started_at'))
              .values('date')
              .annotate(count=Count('id'))
              .order_by('date')
              )
        
        peak_hours=(
            Conversation.objects.filter(bot=bot)
            .annotate(hour=ExtractHour('started_at'))
            .values('hour')
            .annotate(count=Count('id'))
            .order_by('hour')
        )
        
        question=list(
            Message.objects.filter(conversation__bot=bot,sender='user')
            .values_list('content',flat=True)
        )

        clustered=cluster_similar_questions(question)   
        
        return Response({
            'bot_id':bot.id,
            'total_conversations':total_conversations,
            'unanswered_count':unanswered_count,
            'leads_count':leads_count,
            'answer_rate':round(answer_rate, 1),
            'unanswered_questions':unanswered_questions,
            'conversations_per_day':list(conversations_per_day),
            'peak_hours':list(peak_hours),
            'top_questions':clustered[:10]
        },status=status.HTTP_200_OK)