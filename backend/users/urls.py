from django.urls import path,include
from .views import MeView,LogoutView,TokenObtainPairView,RegisterView,CustomTokenObtainPairView,VerifyOTPView,ResendOTPView


from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns=[
    path('register/',RegisterView.as_view(),name='register'),
    path('login/',CustomTokenObtainPairView.as_view(),name='login'),
    path('token/refresh/',TokenRefreshView.as_view(),name='logout'),
    path('logout/',LogoutView.as_view(),name='logout'),
    path('me/',MeView.as_view(),name='me'),
    
    path('verify-otp/',VerifyOTPView.as_view(),name='verify-otp'),
    path('resend-otp/',ResendOTPView.as_view(),name='resend-otp'),
    
]