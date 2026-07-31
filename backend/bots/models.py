from django.db import models
import uuid
from users.models import User
from .storage import RawMediaCloudinaryStorage
# Create your models here.

class Language(models.TextChoices):
    ENGLISH='english','English'
    URDU='urdu','Urdu'

class SourceTYPE(models.TextChoices):
    PDF='pdf','Pdf'
    TEXT='text','Text'
    URL='url','Url'
    YOUTUBE='youtube','Youtube'
    # IMAGE='image','Image'
    DOCX='docx','Word Document'
    CSV='csv','CSV'
    
class Category(models.TextChoices):
    HEALTH='health','Health'
    EDUCATION='education','Education'
    ECOMMERCE='ecommerce','E-commerce'
    FINANCE='finance','Finance'
    REAL_ESTATE='real_estate','Real Estate'
    LEGAL='legal','Legal'
    TRAVEL='travel','Travel'
    RESTAURANT='restaurant','Restaurant'
    SAAS='saas','Saas'
    OTHER='other','Other'
    
class Tone(models.TextChoices):
    FORMAL='formal','Formal'
    FRIENDLY='friendly','Friendly'
    PROFESSIONAL='professional','Professional'
    CASUAL='casual','Casual'
    
class Status(models.TextChoices):
    PROCESSING='processing','Processing'
    PENDING='pending','Pending'
    PROCESSED='processed','Processed'
    FAILURE='failure','Failure'
    
class Sender(models.TextChoices):
    USER='user','User'
    BOT='bot','Bot'
    
    
class Bot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bots', db_index=True)
    name = models.CharField(max_length=255)
    business_name = models.CharField(max_length=255, blank=True)  # NEW
    category = models.CharField(max_length=30, blank=True,choices=Category.choices,default=Category.OTHER)
    language = models.CharField(choices=Language.choices, default=Language.ENGLISH, max_length=10)
    fallback_message = models.CharField(max_length=255, blank=True)
    greeting_message = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    tone = models.CharField(max_length=50, default=Tone.FORMAL,choices=Tone.choices, blank=True)
    is_active = models.BooleanField(default=True)
    
    avatar = models.ImageField(upload_to='bot_avatars/', blank=True, null=True)
    timezone = models.CharField(max_length=50, default='Asia/Karachi', blank=True)
    primary_color = models.CharField(max_length=7, default='#4F46E5', blank=True)  # hex color
    
    
    
    def __str__(self):
        return f"{self.name} | ({self.owner})"  
    
    
    class Meta:
        ordering=['-created_at']
        
    
    
class KnowledgeSource(models.Model):
    id=models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    bot=models.ForeignKey(Bot,on_delete=models.CASCADE,related_name='knowledge_sources')
    source_type=models.CharField(choices=SourceTYPE.choices,max_length=15)
    source_url=models.URLField(blank=True)
    file=models.FileField(upload_to='knowledge_sources/',blank=True,storage=RawMediaCloudinaryStorage,max_length=255)
    status=models.CharField(choices=Status.choices,default=Status.PENDING,max_length=15)
    extracted_text=models.TextField(blank=True)
    text_content = models.TextField(blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    
    
    def __str__(self):
        return f'{self.bot.name} | {self.source_type}'
    
    class Meta:
        ordering=['-created_at']
    
    
    
class QuickReply(models.Model):
    id=models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    bot=models.ForeignKey(Bot,on_delete=models.CASCADE,related_name='quick_replies')
    text=models.CharField(max_length=255)
    
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering=['-created_at']
    
    
    
    
class Conversation(models.Model):
    id=models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    bot=models.ForeignKey(Bot,on_delete=models.CASCADE,related_name='conversations') 
    started_at=models.DateTimeField(auto_now_add=True)
    ended_at=models.DateTimeField(null=True,blank=True)
    
       

    
class Message(models.Model):
    id=models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    conversation=models.ForeignKey(Conversation,on_delete=models.CASCADE,related_name='messages')
    sender=models.CharField(choices=Sender.choices,max_length=10)
    content=models.TextField()
    confidence_score=models.FloatField(null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    
    
    class Meta:
        ordering=['created_at']
    
    
      
    
    
    
class Lead(models.Model):
    
    conversations=models.ForeignKey(Conversation,on_delete=models.CASCADE,related_name='leads')
    bot=models.ForeignKey(Bot,on_delete=models.CASCADE,related_name='leads') 
    id=models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    name=models.CharField(max_length=255,blank=True)
    email=models.EmailField(blank=True)
    phone_number=models.CharField(max_length=20,blank=True)
    preferred_time=models.DateTimeField(null=True,blank=True)
    
    
    
    created_at=models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering=['-created_at']
    
    
    class EmailOTP(models.Model):
        
        id=models