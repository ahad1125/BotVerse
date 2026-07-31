from django.db import models 
from django.contrib.auth.models import AbstractBaseUser,BaseUserManager,PermissionsMixin
import uuid
# Create your models here.

class UserManager(BaseUserManager):
    def create_user(self,email,password,**kwargs):
        if not email:
            raise ValueError('Email is required')
        user=self.model(email=self.normalize_email(email),**kwargs)
        user.set_password(password)
        user.save()
        return user
        
        
    def create_superuser(self,email,password,**kwargs):
        kwargs.setdefault('is_staff',True)
        kwargs.setdefault('is_superuser',True)
        if kwargs.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True')
        
        if kwargs.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True')
        

        return self.create_user(email,password,**kwargs)

class User(AbstractBaseUser,PermissionsMixin):
    
    id=models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    email=models.EmailField(unique=True,db_index=True)
    
    full_name=models.CharField(max_length=255,blank=True)
    is_email_verified=models.BooleanField(default=False)
    is_active=models.BooleanField(default=True)
    is_staff=models.BooleanField(default=False)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    
    otp_code=models.CharField(max_length=6,blank=True,null=True)
    otp_created_at=models.DateTimeField(blank=True,null=True)
    
    objects=UserManager()
    
    USERNAME_FIELD='email'
    REQUIRED_FIELDS=[]
    
    def __str__(self):
        return self.email