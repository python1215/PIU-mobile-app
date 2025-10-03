from django import forms
from .models import projectMapping, nawecinfrastructure, settlementwithCoordinates
from setup.models import Regions, Districts, Settlement
from PIU_Financial_mgt.models import Donor

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
    
    donor = forms.ModelMultipleChoiceField(
        queryset=Donor.objects.all(),
        widget=forms.SelectMultiple(attrs={'class': 'form-select', 'size': '6'}),
        required=False,
        help_text='Hold Ctrl/Cmd to select multiple donors'
    )

    class Meta:
        model = projectMapping
        fields = ['profile_year', 'region', 'district', 'settlement', 'Total_No_of_Households', 'no_of_customer_connections', 'no_of_connected_household', 'female_households', 'male_households', 'Latitude', 'Longitude', 'project', 'donor', 'access']
        widgets = {
            'Date_Created': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Show all districts and settlements initially - cascading will filter them
        # This ensures dropdowns are populated even for new forms
        
        # For forms with POST data (form submission)
        if 'region' in self.data:
            try:
                region_id = self.data.get('region')
                if region_id:
                    # Filter districts by region for cascading
                    self.fields['district'].queryset = Districts.objects.filter(region_code_id=region_id)
                else:
                    self.fields['district'].queryset = Districts.objects.all()
            except (ValueError, TypeError):
                self.fields['district'].queryset = Districts.objects.all()

        if 'district' in self.data:
            try:
                district_id = self.data.get('district')
                if district_id:
                    # Filter settlements by district for cascading
                    self.fields['settlement'].queryset = Settlement.objects.filter(district_code_id=district_id)
                else:
                    self.fields['settlement'].queryset = Settlement.objects.all()
            except (ValueError, TypeError):
                self.fields['settlement'].queryset = Settlement.objects.all()
        
        # For edit forms (when instance is provided)
        elif self.instance and self.instance.pk:
            # Keep all districts and settlements available for editing
            # The JavaScript will handle cascading if user changes region/district
            if self.instance.region:
                # Optionally filter districts by region for consistency
                related_districts = Districts.objects.filter(region_code_id=self.instance.region.region_code)
                if related_districts.exists():
                    self.fields['district'].queryset = related_districts
            
            if self.instance.district:
                # Optionally filter settlements by district for consistency  
                related_settlements = Settlement.objects.filter(district_code_id=self.instance.district.district_code)
                if related_settlements.exists():
                    self.fields['settlement'].queryset = related_settlements

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