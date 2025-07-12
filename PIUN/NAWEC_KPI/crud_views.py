from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q
from .models import (
    CalculateAO, CalculateDER, CalculateCR, CalculatePARI, CalculateTSQR
)
from .forms import (
    CalculateAOForm, CalculateDERForm, CalculateCRForm, 
    CalculatePARIForm, CalculateTSQRForm
)


# CalculateAO CRUD Views
@login_required
def ao_list(request):
    """List all AO (Audit Opinion) calculations"""
    search_query = request.GET.get('search', '')
    calculations = CalculateAO.objects.all()
    
    if search_query:
        calculations = calculations.filter(
            Q(year__profile_year__icontains=search_query) |
            Q(quarter__quarter__icontains=search_query) |
            Q(loginUser__username__icontains=search_query)
        )
    
    calculations = calculations.order_by('-date_created')
    paginator = Paginator(calculations, 25)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'search_query': search_query,
        'title': 'Audit Opinion (AO) Calculations'
    }
    return render(request, 'NAWEC_KPI/crud/ao_list.html', context)


@login_required
def ao_create(request):
    """Create new AO calculation"""
    if request.method == 'POST':
        form = CalculateAOForm(request.POST)
        if form.is_valid():
            calculation = form.save(commit=False)
            calculation.loginUser = request.user
            calculation.save()
            messages.success(request, 'AO calculation created successfully!')
            return redirect('NAWEC_KPI:ao_list')
    else:
        form = CalculateAOForm()
    
    return render(request, 'NAWEC_KPI/crud/ao_form.html', {
        'form': form,
        'title': 'Create AO Calculation',
        'action': 'Create'
    })


@login_required
def ao_detail(request, pk):
    """View AO calculation details"""
    try:
        calculation = CalculateAO.objects.get(pk=pk)
        return render(request, 'NAWEC_KPI/crud/ao_detail.html', {
            'calculation': calculation,
            'title': 'AO Calculation Details'
        })
    except CalculateAO.DoesNotExist:
        messages.error(request, f'AO calculation with ID {pk} does not exist.')
        return redirect('NAWEC_KPI:ao_list')


@login_required
def ao_update(request, pk):
    """Update AO calculation"""
    try:
        calculation = CalculateAO.objects.get(pk=pk)
        if request.method == 'POST':
            form = CalculateAOForm(request.POST, instance=calculation)
            if form.is_valid():
                form.save()
                messages.success(request, 'AO calculation updated successfully!')
                return redirect('NAWEC_KPI:ao_detail', pk=pk)
        else:
            form = CalculateAOForm(instance=calculation)
        
        return render(request, 'NAWEC_KPI/crud/ao_form.html', {
            'form': form,
            'calculation': calculation,
            'title': 'Update AO Calculation',
            'action': 'Update'
        })
    except CalculateAO.DoesNotExist:
        messages.error(request, f'AO calculation with ID {pk} does not exist.')
        return redirect('NAWEC_KPI:ao_list')


@login_required
def ao_delete(request, pk):
    """Delete AO calculation"""
    try:
        calculation = CalculateAO.objects.get(pk=pk)
        if request.method == 'POST':
            calculation.delete()
            messages.success(request, 'AO calculation deleted successfully!')
            return redirect('NAWEC_KPI:ao_list')
        
        return render(request, 'NAWEC_KPI/crud/ao_confirm_delete.html', {
            'calculation': calculation,
            'title': 'Delete AO Calculation'
        })
    except CalculateAO.DoesNotExist:
        messages.error(request, f'AO calculation with ID {pk} does not exist or has already been deleted.')
        return redirect('NAWEC_KPI:ao_list')


# CalculateDER CRUD Views
@login_required
def der_list(request):
    """List all DER (Debt to Equity Ratio) calculations"""
    search_query = request.GET.get('search', '')
    calculations = CalculateDER.objects.all()
    
    if search_query:
        calculations = calculations.filter(
            Q(year__profile_year__icontains=search_query) |
            Q(quarter__quarter__icontains=search_query) |
            Q(loginUser__username__icontains=search_query)
        )
    
    calculations = calculations.order_by('-date_created')
    paginator = Paginator(calculations, 25)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'search_query': search_query,
        'title': 'Debt to Equity Ratio (DER) Calculations'
    }
    return render(request, 'NAWEC_KPI/crud/der_list.html', context)


@login_required
def der_create(request):
    """Create new DER calculation"""
    if request.method == 'POST':
        form = CalculateDERForm(request.POST)
        if form.is_valid():
            calculation = form.save(commit=False)
            calculation.loginUser = request.user
            calculation.save()
            messages.success(request, 'DER calculation created successfully!')
            return redirect('NAWEC_KPI:der_list')
    else:
        form = CalculateDERForm()
    
    return render(request, 'NAWEC_KPI/crud/der_form.html', {
        'form': form,
        'title': 'Create DER Calculation',
        'action': 'Create'
    })


@login_required
def der_detail(request, pk):
    """View DER calculation details"""
    try:
        calculation = CalculateDER.objects.get(pk=pk)
        return render(request, 'NAWEC_KPI/crud/der_detail.html', {
            'calculation': calculation,
            'title': 'DER Calculation Details'
        })
    except CalculateDER.DoesNotExist:
        messages.error(request, f'DER calculation with ID {pk} does not exist.')
        return redirect('NAWEC_KPI:der_list')


@login_required
def der_update(request, pk):
    """Update DER calculation"""
    try:
        calculation = CalculateDER.objects.get(pk=pk)
        if request.method == 'POST':
            form = CalculateDERForm(request.POST, instance=calculation)
            if form.is_valid():
                form.save()
                messages.success(request, 'DER calculation updated successfully!')
                return redirect('NAWEC_KPI:der_detail', pk=pk)
        else:
            form = CalculateDERForm(instance=calculation)
        
        return render(request, 'NAWEC_KPI/crud/der_form.html', {
            'form': form,
            'calculation': calculation,
            'title': 'Update DER Calculation',
            'action': 'Update'
        })
    except CalculateDER.DoesNotExist:
        messages.error(request, f'DER calculation with ID {pk} does not exist.')
        return redirect('NAWEC_KPI:der_list')


@login_required
def der_delete(request, pk):
    """Delete DER calculation"""
    try:
        calculation = CalculateDER.objects.get(pk=pk)
        if request.method == 'POST':
            calculation.delete()
            messages.success(request, 'DER calculation deleted successfully!')
            return redirect('NAWEC_KPI:der_list')
        
        return render(request, 'NAWEC_KPI/crud/der_confirm_delete.html', {
            'calculation': calculation,
            'title': 'Delete DER Calculation'
        })
    except CalculateDER.DoesNotExist:
        messages.error(request, f'DER calculation with ID {pk} does not exist or has already been deleted.')
        return redirect('NAWEC_KPI:der_list')


# CalculateCR CRUD Views
@login_required
def cr_list(request):
    """List all CR (Current Ratio) calculations"""
    search_query = request.GET.get('search', '')
    calculations = CalculateCR.objects.all()
    
    if search_query:
        calculations = calculations.filter(
            Q(year__profile_year__icontains=search_query) |
            Q(quarter__quarter__icontains=search_query) |
            Q(loginUser__username__icontains=search_query)
        )
    
    calculations = calculations.order_by('-date_created')
    paginator = Paginator(calculations, 25)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'search_query': search_query,
        'title': 'Current Ratio (CR) Calculations'
    }
    return render(request, 'NAWEC_KPI/crud/cr_list.html', context)


@login_required
def cr_create(request):
    """Create new CR calculation"""
    if request.method == 'POST':
        form = CalculateCRForm(request.POST)
        if form.is_valid():
            calculation = form.save(commit=False)
            calculation.loginUser = request.user
            calculation.save()
            messages.success(request, 'CR calculation created successfully!')
            return redirect('NAWEC_KPI:cr_list')
    else:
        form = CalculateCRForm()
    
    return render(request, 'NAWEC_KPI/crud/cr_form.html', {
        'form': form,
        'title': 'Create CR Calculation',
        'action': 'Create'
    })


@login_required
def cr_detail(request, pk):
    """View CR calculation details"""
    try:
        calculation = CalculateCR.objects.get(pk=pk)
        return render(request, 'NAWEC_KPI/crud/cr_detail.html', {
            'calculation': calculation,
            'title': 'CR Calculation Details'
        })
    except CalculateCR.DoesNotExist:
        messages.error(request, f'CR calculation with ID {pk} does not exist.')
        return redirect('NAWEC_KPI:cr_list')


@login_required
def cr_update(request, pk):
    """Update CR calculation"""
    try:
        calculation = CalculateCR.objects.get(pk=pk)
        if request.method == 'POST':
            form = CalculateCRForm(request.POST, instance=calculation)
            if form.is_valid():
                form.save()
                messages.success(request, 'CR calculation updated successfully!')
                return redirect('NAWEC_KPI:cr_detail', pk=pk)
        else:
            form = CalculateCRForm(instance=calculation)
        
        return render(request, 'NAWEC_KPI/crud/cr_form.html', {
            'form': form,
            'calculation': calculation,
            'title': 'Update CR Calculation',
            'action': 'Update'
        })
    except CalculateCR.DoesNotExist:
        messages.error(request, f'CR calculation with ID {pk} does not exist.')
        return redirect('NAWEC_KPI:cr_list')


@login_required
def cr_delete(request, pk):
    """Delete CR calculation"""
    try:
        calculation = CalculateCR.objects.get(pk=pk)
        if request.method == 'POST':
            calculation.delete()
            messages.success(request, 'CR calculation deleted successfully!')
            return redirect('NAWEC_KPI:cr_list')
        
        return render(request, 'NAWEC_KPI/crud/cr_confirm_delete.html', {
            'calculation': calculation,
            'title': 'Delete CR Calculation'
        })
    except CalculateCR.DoesNotExist:
        messages.error(request, f'CR calculation with ID {pk} does not exist or has already been deleted.')
        return redirect('NAWEC_KPI:cr_list')


# CalculatePARI CRUD Views
@login_required
def pari_list(request):
    """List all PARI calculations"""
    search_query = request.GET.get('search', '')
    calculations = CalculatePARI.objects.all()
    
    if search_query:
        calculations = calculations.filter(
            Q(year__profile_year__icontains=search_query) |
            Q(quarter__quarter__icontains=search_query) |
            Q(loginUser__username__icontains=search_query)
        )
    
    calculations = calculations.order_by('-date_created')
    paginator = Paginator(calculations, 25)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'search_query': search_query,
        'title': 'PARI (Percentage Audit Recommendations Implementation) Calculations'
    }
    return render(request, 'NAWEC_KPI/crud/pari_list.html', context)


@login_required
def pari_create(request):
    """Create new PARI calculation"""
    if request.method == 'POST':
        form = CalculatePARIForm(request.POST)
        if form.is_valid():
            calculation = form.save(commit=False)
            calculation.loginUser = request.user
            calculation.save()
            messages.success(request, 'PARI calculation created successfully!')
            return redirect('NAWEC_KPI:pari_list')
    else:
        form = CalculatePARIForm()
    
    return render(request, 'NAWEC_KPI/crud/pari_form.html', {
        'form': form,
        'title': 'Create PARI Calculation',
        'action': 'Create'
    })


@login_required
def pari_detail(request, pk):
    """View PARI calculation details"""
    try:
        calculation = CalculatePARI.objects.get(pk=pk)
        return render(request, 'NAWEC_KPI/crud/pari_detail.html', {
            'calculation': calculation,
            'title': 'PARI Calculation Details'
        })
    except CalculatePARI.DoesNotExist:
        messages.error(request, f'PARI calculation with ID {pk} does not exist.')
        return redirect('NAWEC_KPI:pari_list')


@login_required
def pari_update(request, pk):
    """Update PARI calculation"""
    try:
        calculation = CalculatePARI.objects.get(pk=pk)
        if request.method == 'POST':
            form = CalculatePARIForm(request.POST, instance=calculation)
            if form.is_valid():
                form.save()
                messages.success(request, 'PARI calculation updated successfully!')
                return redirect('NAWEC_KPI:pari_detail', pk=pk)
        else:
            form = CalculatePARIForm(instance=calculation)
        
        return render(request, 'NAWEC_KPI/crud/pari_form.html', {
            'form': form,
            'calculation': calculation,
            'title': 'Update PARI Calculation',
            'action': 'Update'
        })
    except CalculatePARI.DoesNotExist:
        messages.error(request, f'PARI calculation with ID {pk} does not exist.')
        return redirect('NAWEC_KPI:pari_list')


@login_required
def pari_delete(request, pk):
    """Delete PARI calculation"""
    try:
        calculation = CalculatePARI.objects.get(pk=pk)
        if request.method == 'POST':
            calculation.delete()
            messages.success(request, 'PARI calculation deleted successfully!')
            return redirect('NAWEC_KPI:pari_list')
        
        return render(request, 'NAWEC_KPI/crud/pari_confirm_delete.html', {
            'calculation': calculation,
            'title': 'Delete PARI Calculation'
        })
    except CalculatePARI.DoesNotExist:
        messages.error(request, f'PARI calculation with ID {pk} does not exist or has already been deleted.')
        return redirect('NAWEC_KPI:pari_list')


# CalculateTSQR CRUD Views
@login_required
def tsqr_list(request):
    """List all TSQR calculations"""
    search_query = request.GET.get('search', '')
    calculations = CalculateTSQR.objects.all()
    
    if search_query:
        calculations = calculations.filter(
            Q(year__profile_year__icontains=search_query) |
            Q(quarter__quarter__icontains=search_query) |
            Q(loginUser__username__icontains=search_query)
        )
    
    calculations = calculations.order_by('-date_created')
    paginator = Paginator(calculations, 25)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'search_query': search_query,
        'title': 'TSQR (Timely Submission of Quarterly Report) Calculations'
    }
    return render(request, 'NAWEC_KPI/crud/tsqr_list.html', context)


@login_required
def tsqr_create(request):
    """Create new TSQR calculation"""
    if request.method == 'POST':
        form = CalculateTSQRForm(request.POST)
        if form.is_valid():
            calculation = form.save(commit=False)
            calculation.loginUser = request.user
            calculation.save()
            messages.success(request, 'TSQR calculation created successfully!')
            return redirect('NAWEC_KPI:tsqr_list')
    else:
        form = CalculateTSQRForm()
    
    return render(request, 'NAWEC_KPI/crud/tsqr_form.html', {
        'form': form,
        'title': 'Create TSQR Calculation',
        'action': 'Create'
    })


@login_required
def tsqr_detail(request, pk):
    """View TSQR calculation details"""
    try:
        calculation = CalculateTSQR.objects.get(pk=pk)
        return render(request, 'NAWEC_KPI/crud/tsqr_detail.html', {
            'calculation': calculation,
            'title': 'TSQR Calculation Details'
        })
    except CalculateTSQR.DoesNotExist:
        messages.error(request, f'TSQR calculation with ID {pk} does not exist.')
        return redirect('NAWEC_KPI:tsqr_list')


@login_required
def tsqr_update(request, pk):
    """Update TSQR calculation"""
    try:
        calculation = CalculateTSQR.objects.get(pk=pk)
        if request.method == 'POST':
            form = CalculateTSQRForm(request.POST, instance=calculation)
            if form.is_valid():
                form.save()
                messages.success(request, 'TSQR calculation updated successfully!')
                return redirect('NAWEC_KPI:tsqr_detail', pk=pk)
        else:
            form = CalculateTSQRForm(instance=calculation)
        
        return render(request, 'NAWEC_KPI/crud/tsqr_form.html', {
            'form': form,
            'calculation': calculation,
            'title': 'Update TSQR Calculation',
            'action': 'Update'
        })
    except CalculateTSQR.DoesNotExist:
        messages.error(request, f'TSQR calculation with ID {pk} does not exist.')
        return redirect('NAWEC_KPI:tsqr_list')


@login_required
def tsqr_delete(request, pk):
    """Delete TSQR calculation"""
    try:
        calculation = CalculateTSQR.objects.get(pk=pk)
        if request.method == 'POST':
            calculation.delete()
            messages.success(request, 'TSQR calculation deleted successfully!')
            return redirect('NAWEC_KPI:tsqr_list')
        
        return render(request, 'NAWEC_KPI/crud/tsqr_confirm_delete.html', {
            'calculation': calculation,
            'title': 'Delete TSQR Calculation'
        })
    except CalculateTSQR.DoesNotExist:
        messages.error(request, f'TSQR calculation with ID {pk} does not exist or has already been deleted.')
        return redirect('NAWEC_KPI:tsqr_list')