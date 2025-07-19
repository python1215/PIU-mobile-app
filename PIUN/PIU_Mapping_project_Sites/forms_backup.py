from django import forms
from .models import projectMapping, nawecinfrastructure, settlementwithCoordinates
from setup.models import Regions, Districts, Settlement

class MappingForm(forms.ModelForm):
    region = forms.ModelChoiceField(
        queryset=Regions.objects.all(),
        widget=forms.Select(),
    )

    district = forms.ModelChoiceField(
        queryset=Districts.objects.none(),
        widget=forms.Select(),
    )

    settlement = forms.ModelChoiceField(
        queryset=Settlement.objects.none(),
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
        # Removed problematic settlement validation

        if settlement and not Settlement.objects.filter(pk=settlement.pk).exists():
            raise forms.ValidationError("Invalid settlement selected. Please choose a valid settlement.")

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


class SettlementWithCoordinatesForm(forms.ModelForm):
    class Meta:
        model = settlementwithCoordinates
        fields = ['region', 'lga', 'district', 'ward', 'settlement_code', 'settlement_name', 
                 'population_household', 'Latitude', 'Longitude']
        widgets = {
            'region': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Region name'
            }),
            'lga': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'LGA name'
            }),
            'district': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'District name'
            }),
            'ward': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Ward name'
            }),
            'settlement_code': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Settlement code'
            }),
            'settlement_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Settlement name'
            }),
            'population_household': forms.NumberInput(attrs={
                'class': 'form-control',
                'min': '0',
                'placeholder': 'Population/Household count'
            }),
            'Latitude': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.000001',
                'min': '13.0',
                'max': '14.0',
                'placeholder': 'Latitude (13.0 - 14.0)'
            }),
            'Longitude': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.000001',
                'min': '-18.0',
                'max': '-14.0',
                'placeholder': 'Longitude (-18.0 - -14.0)'
            }),
        }