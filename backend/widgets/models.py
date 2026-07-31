from django.db import models
from bots.models import Bot
import uuid

# Create your models here.


class WidgetPosition(models.TextChoices):
    BOTTOM_RIGHT='bottom_right','Bottom Right'
    BOTTOM_LEFT='bottom_left','Bottom Left'

class WidgetConfig(models.Model):
    id=models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    primary_colour=models.CharField(max_length=7,default='#000000')
    widget_key=models.UUIDField(default=uuid.uuid4,unique=True,editable=False)
    position=models.CharField(max_length=20,choices=WidgetPosition.choices,default=WidgetPosition.BOTTOM_RIGHT)
    bot=models.OneToOneField(Bot,on_delete=models.CASCADE,related_name='widget_config')
    is_embedded_enabled=models.BooleanField(default=True)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f'Widget For {self.bot.name}'
    
    class Meta:
        ordering=['-created_at']
    

