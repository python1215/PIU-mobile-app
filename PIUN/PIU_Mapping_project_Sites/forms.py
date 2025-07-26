from django import forms
from .models import projectMapping, nawecinfrastructure, settlementwithCoordinates
from setup.models import Regions, Districts, Settlement

class MappingForm(forms.ModelForm):
    region = forms.ModelChoiceField(
        queryset=Regions.objects.all(),
        widget=forms.Select(),
    )

    district = forms.ModelChoiceField(
        queryset=Districts.objects.all(),
        widget=forms.Select(),
        required=False,
        empty_label="Select District"
    )

    settlement = forms.ModelChoiceField(
        queryset=Settlement.objects.all(),
        required=False,
        empty_label="Select Settlement"
    )

    class Meta:
        model = projectMapping
        fields = ['profile_year', 'region', 'district', 'settlement', 'Total_No_of_Households', 'no_of_customer_connections', 'no_of_connected_household', 'Latitude', 'Longitude', 'project', 'donor', 'access']
        widgets = {
            'Date_Created': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # For new forms (from POST data)
        if 'region' in self.data:
            try:
                region_code = self.data.get('region')
                self.fields['district'].queryset = Districts.objects.filter(region_code_id=region_code)
            except (ValueError, TypeError):
                pass

        if 'district' in self.data:
            try:
                district_code = self.data.get('district')
                self.fields['settlement'].queryset = Settlement.objects.filter(district_code_id=district_code)
            except (ValueError, TypeError):
                pass
        
        # For edit forms (when instance is provided)
        elif self.instance and self.instance.pk:
            # Populate district dropdown based on selected region
            if self.instance.region:
                self.fields['district'].queryset = Districts.objects.filter(region_code_id=self.instance.region.region_code)
            
            # Populate settlement dropdown based on selected district
            if self.instance.district:
                self.fields['settlement'].queryset = Settlement.objects.filter(district_code_id=self.instance.district.district_code)

    def clean(self):
        cleaned_data = super().clean()
        return cleaned_data


class NAWECInfrastructureForm(forms.ModelForm):
    class Meta:
        model = nawecinfrastructure
        fields = ['scode', 'No_of_Transfprmer', 'transformer_name', 'No_of_Households_With_Electricity', 
                 'water_supply_source', 'No_of_Households_With_water']
        widgets = {
            'scode': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter settlement code'
            }),
            'No_of_Transfprmer': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '0',
                'placeholder': 'Number of transformers'
            }),
            'transformer_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Transformer name'
            }),
            'No_of_Households_With_Electricity': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '0',
                'placeholder': 'Households with electricity'
            }),
            'water_supply_source': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Water supply source'
            }),
            'No_of_Households_With_water': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '0',
                'placeholder': 'Households with water'
            }),
        }


class settlementwithCoordinatesForm(forms.ModelForm):
    class Meta:
        model = settlementwithCoordinates
        fields = ['settlement_code', 'settlement_name', 'Latitude', 'Longitude', 'region', 'district']
        widgets = {
            'settlement_code': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter settlement code'
            }),
            'settlement_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter settlement name'
            }),
            'Latitude': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter latitude'
            }),
            'Longitude': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter longitude'
            }),
            'region': forms.Select(attrs={
                'class': 'form-control',
            }),
            'district': forms.Select(attrs={
                'class': 'form-control',
            }),
        }