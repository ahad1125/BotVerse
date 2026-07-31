from django.shortcuts import render
from rest_framework import status , generics
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
# Create your views here.

from .serializers import RegisterSerializer,UserSerializer
from .models import User
from datetime import timedelta
from django.utils import timezone
from .utils import generate_and_send_otp


def api_response(success,data=None,message='',errors=None,status_code=status.HTTP_200_OK):
    return Response({
        'success':success,
        'data':data or {},
        'message':message,
        'errors':errors or {},
    },status=status_code)
    
    
class RegisterView(generics.CreateAPIView):
    queryset=User.objects.all()
    serializer_class=RegisterSerializer
    permission_classes=[AllowAny]
    
    def create(self,request,*args,**kwargs):
        
        serializer=self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return api_response(False,errors=serializer.errors,message='Registration Failed',status_code=status.HTTP_400_BAD_REQUEST)
        user=serializer.save()
        generate_and_send_otp(user)
        return api_response(True,data=UserSerializer(user).data,message='Registration successful',
                            status_code=status.HTTP_201_CREATED)
        
    
        

class CustomTokenObtainPairView(TokenObtainPairView):
    
    
    def post(self,request,*args,**kwargs):
        response=super().post(request,*args,**kwargs)
        if response.status_code==200:
            return api_response(True,data=response.data,message='Login Successful')
        return api_response(False,errors=response.data,message='Invalid credentials',
                            status_code=status.HTTP_401_UNAUTHORIZED)
        


class LogoutView(APIView):
    permission_classes=[IsAuthenticated]
        
    def post(self,request):
        refresh_token=request.data.get('refresh')
        if not refresh_token:
            return api_response(False,message='Refresh token required',
                                errors={'refresh':'This field is required'},
                                status_code=status.HTTP_400_BAD_REQUEST)
        
        try:
            token=RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return api_response(False,message='Invalid or expired token',status_code=status.HTTP_400_BAD_REQUEST)
        return api_response(True,message='Logged out successfully.')
        
        
class MeView(generics.RetrieveUpdateAPIView):
    
    serializer_class=UserSerializer
    permission_classes=[IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def retrieve(self,request,*args,**kwargs):
        serializer=self.get_serializer(self.get_object())
        
        return api_response(True,data=serializer.data,message='User fetched')
    
    
    def update(self,request,*arga,**kwargs):
        serializer=self.get_serializer(self.get_object(),data=request.data,partial=True)
        if not serializer.is_valid():
            return api_response(False,errors=serializer.errors,message='Update Failed',
                                status_code=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return api_response(True,data=serializer.data,message='Profile updated')
    
    
class VerifyOTPView(APIView):
    permission_classes=[AllowAny]
    
    def post(self,request):
        email=request.data.get('email')
        code=request.data.get('code')
        
        if not email or not code:
            return Response({
                'success':False,
                'message':'Email and code are required.',
            },status=status.HTTP_400_BAD_REQUEST)
            
            
        try:
            user=User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({
                'success':False,
                'message':'Invalid email or code.'
                
            },status=status.HTTP_400_BAD_REQUEST)
            
        if not user.otp_code or user.otp_code!=code:
            return Response({
                'success':False,
                'message':'Invalid code.'
            },status=status.HTTP_400_BAD_REQUEST)
            
        if timezone.now() > user.otp_created_at + timedelta(minutes=10):
            return Response({
                'success': False,
                'message': 'Code expired.'
                },status=status.HTTP_400_BAD_REQUEST)
            
        user.is_email_verified=True
        user.otp_code=None
        user.otp_created_at=None
        user.save()
        
        
        return Response({
            'success':True,
            'message':'Email verified successfully.'
        },status=status.HTTP_200_OK)
class ResendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({
                'success': False, 
                'message': 'User not found.'
                },status=status.HTTP_404_NOT_FOUND)

        if user.is_email_verified:
            return Response({
                'success': False,
                'message': 'Email already verified.'
                },status=status.HTTP_400_BAD_REQUEST)

        generate_and_send_otp(user)
        return Response({
            'success': True,
            'message': 'Verification code resent.'
            }, status=status.HTTP_200_OK)
        