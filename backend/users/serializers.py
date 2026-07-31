from rest_framework import serializers
from .models import User


from django.contrib.auth.password_validation import validate_password





class RegisterSerializer(serializers.ModelSerializer):
    
    password=serializers.CharField(write_only=True,validators=[validate_password])
    password2=serializers.CharField(write_only=True)

    class Meta:        
        model=User
        fields=['email','password','password2','full_name']
        
         
    def validate_email(self,value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('User with this email already exists')
        return value
    
    def validate(self,attrs):
        if attrs['password']!=attrs['password2']:
            raise serializers.ValidationError({"password2":"Passwords do not match"})
        return attrs
    
    def create(self,validated_data):
        validated_data.pop('password2')
        password=validated_data.pop('password')
        user=User(**validated_data)
        user.set_password(password)
        user.save()
        
        return user
    
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=['id','email','full_name','is_email_verified','created_at']
        read_only_fields=['id','is_email_verified','created_at']
        
        