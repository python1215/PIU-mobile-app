from django.urls import reverse_lazy
from django.views.generic import CreateView
from django.shortcuts import render
from .forms import CustomUserCreationForm


def index(request):
    return render(request, 'index.html')

class SignUpView(CreateView):
    form_class = CustomUserCreationForm
    success_url = reverse_lazy("login")
    template_name = "account/signup.html"

