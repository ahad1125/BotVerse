from django.urls import path,include
from .views import MeView,LogoutView,TokenObtainPairView,RegisterView,CustomTokenObtainPairView,VerifyOTPView,ResendOTPView


from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns=[
    path('register/',RegisterView.as_view(),name='register'),
    path('register',RegisterView.as_view(),name='register_no_slash'),
    path('login/',CustomTokenObtainPairView.as_view(),name='login'),
    path('login',CustomTokenObtainPairView.as_view(),name='login_no_slash'),
    path('token/refresh/',TokenRefreshView.as_view(),name='refresh'),
    path('token/refresh',TokenRefreshView.as_view(),name='refresh_no_slash'),
    path('logout/',LogoutView.as_view(),name='logout'),
    path('logout',LogoutView.as_view(),name='logout_no_slash'),
    path('me/',MeView.as_view(),name='me'),
    path('me',MeView.as_view(),name='me_no_slash'),
    path('verify-otp/',VerifyOTPView.as_view(),name='verify-otp'),
    path('verify-otp',VerifyOTPView.as_view(),name='verify-otp_no_slash'),
    path('resend-otp/',ResendOTPView.as_view(),name='resend-otp'),
    path('resend-otp',ResendOTPView.as_view(),name='resend-otp_no_slash'),
]