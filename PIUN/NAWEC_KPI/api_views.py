"""
Updated API views for saving KPI calculation data with all model fields
"""

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View
import json
from .models import (
    CalculateROA, CalculateNPM, CalculateDSCR, CalculateMWh,
    CalculateGAF, CalculateTDE, CalculateATC, CalculateNECD,
    CalculateNWCD, CalculateTPS, CalculateTTP, CalculateWQCC,
    CalculateWQCB, CalculateNRW, CalculateDD,
    CalculateAO, CalculateDER, CalculateCR, CalculatePARI, CalculateTSQR
)
from setup.models import Quarter, YEAR


@method_decorator([csrf_exempt, login_required], name='dispatch')
class SaveKPICalculationView(View):
    """Enhanced view for saving KPI calculations with all model fields"""
    
    # Model mapping for different KPI types
    KPI_MODEL_MAP = {
        'ROA': CalculateROA,
        'NPM': CalculateNPM,
        'DSCR': CalculateDSCR,
        'MWh': CalculateMWh,
        'EI': CalculateMWh,  # Energy Injection uses MWh model
        'GAF': CalculateGAF,
        'TDE': CalculateTDE,
        'ATC': CalculateATC,
        'NECD': CalculateNECD,
        'NWCD': CalculateNWCD,
        'TPS': CalculateTPS,
        'TTP': CalculateTTP,
        'WQCC': CalculateWQCC,
        'WQCB': CalculateWQCB,
        'NRW': CalculateNRW,
        'DD': CalculateDD,
        'AO': CalculateAO,
        'DER': CalculateDER,
        'CR': CalculateCR,
        'PARI': CalculatePARI,
        'TSQR': CalculateTSQR,
    }
    
    def post(self, request):
        try:
            data = json.loads(request.body)
            kpi_type = data.get('kpi_type')
            input_values = data.get('input_values', {})
            
            print(f'[DEBUG] API - Raw data received: {data}')
            print(f'[DEBUG] API - KPI type: {kpi_type}')
            print(f'[DEBUG] API - Input values: {input_values}')
            
            if not kpi_type or kpi_type not in self.KPI_MODEL_MAP:
                return JsonResponse({
                    'success': False,
                    'error': 'Invalid or missing KPI type'
                }, status=400)
            
            # Get the model class for this KPI type
            model_class = self.KPI_MODEL_MAP[kpi_type]
            
            # Prepare data for model creation
            create_data = {}
            
            # Special handling for EI (Energy Injection) - aggregate energy sources
            if kpi_type == 'EI':
                # Calculate total energy from all energy sources
                total_energy = 0
                source_count = 0
                
                # Collect all energy source values from dynamic input
                for key, value in input_values.items():
                    if key.endswith('_energy') and key != 'achieved_value':
                        try:
                            energy_value = float(value)
                            if energy_value > 0:
                                total_energy += energy_value
                                source_count += 1
                        except (ValueError, TypeError):
                            continue
                
                # If no energy sources found, try the old format for backward compatibility
                if total_energy == 0:
                    for energy_type in ['solar', 'wind', 'thermal', 'other', 'hydro', 'nuclear']:
                        energy_value = input_values.get(f'{energy_type}_energy', 0)
                        if energy_value > 0:
                            total_energy += energy_value
                            source_count += 1
                
                # Set the MWh model fields
                create_data['power_injected'] = total_energy
                create_data['time_duration'] = 1  # Set as 1 hour for MW calculation
                create_data['number_of_sources'] = max(source_count, 1)
                
                # Handle quarter
                quarter_value = input_values.get('quarter')
                if quarter_value:
                    try:
                        quarter_instance = Quarter.objects.get(quarter=quarter_value)
                        create_data['quarter'] = quarter_instance
                    except Quarter.DoesNotExist:
                        pass
                        
            else:
                # Handle all other KPI types with popup form field mapping
                excluded_fields = ['loginUser', 'year', 'date_created', 'id', 'unique_id']
                
                # Handle quarter field specially first
                quarter_value = input_values.get('quarter')
                if quarter_value:
                    try:
                        # Convert quarter number to Quarter model instance
                        # Map numeric quarters to existing Quarter records
                        quarter_mapping = {
                            '1': 'Quarter 1',
                            '2': 'Monthly',  # Use existing Monthly record for Q2
                            '3': 'Quarter 3',
                            '4': 'Quarter 4'
                        }
                        quarter_name = quarter_mapping.get(str(quarter_value), f'Quarter {quarter_value}')
                        quarter_instance = Quarter.objects.get(quarter=quarter_name)
                        create_data['quarter'] = quarter_instance
                        print(f'[DEBUG] API - Quarter mapped: {quarter_value} -> {quarter_name} -> {quarter_instance}')
                    except Quarter.DoesNotExist:
                        # Try alternative mapping
                        try:
                            quarter_instance = Quarter.objects.get(id=int(quarter_value))
                            create_data['quarter'] = quarter_instance
                            print(f'[DEBUG] API - Quarter mapped by ID: {quarter_value} -> {quarter_instance}')
                        except (Quarter.DoesNotExist, ValueError):
                            print(f'[DEBUG] API - Quarter mapping failed for: {quarter_value}')
                            pass
                
                # Special field mapping for popup forms
                field_mapping = {
                    'net_income': 'net_profit_after_tax',  # ROA popup uses 'net_income'
                    'total_assets': 'total_assets',
                    'compensation_amount': 'compensation_amount',
                    'achieved_value': 'achieved_value',
                    'baseline_value': 'baseline_value',
                    'End_Target_Value': 'End_Target_Value',
                    'net_profit': 'netprofit',  # NPM popup uses 'net_profit'
                    'total_revenue': 'total_revenues_turnover',  # NPM popup uses 'total_revenue'
                    'net_operating_income': 'net_operating_income',
                    'total_debt_service': 'total_debt_service',
                }
                
                # Map popup form fields to model fields
                for popup_field, model_field in field_mapping.items():
                    field_value = input_values.get(popup_field)
                    if field_value is not None and field_value != '':
                        try:
                            create_data[model_field] = float(field_value)
                            print(f'[DEBUG] API - Field mapped: {popup_field} -> {model_field} = {field_value}')
                        except (ValueError, TypeError):
                            print(f'[DEBUG] API - Field mapping failed: {popup_field} -> {model_field} = {field_value}')
                            pass
                
                # Handle any remaining fields from the model
                for field in model_class._meta.get_fields():
                    if hasattr(field, 'name') and field.name not in excluded_fields:
                        if field.name in create_data:
                            # Already mapped above
                            continue
                        field_value = input_values.get(field.name)
                        if field_value is not None and field_value != '':
                            if field.name == 'quarter':
                                # Already handled above
                                continue
                            else:
                                # Handle regular fields
                                if hasattr(field, 'get_internal_type'):
                                    field_type = field.get_internal_type()
                                    if field_type in ['FloatField', 'DecimalField']:
                                        create_data[field.name] = float(field_value)
                                    elif field_type == 'IntegerField':
                                        create_data[field.name] = int(field_value)
                                    else:
                                        create_data[field.name] = field_value
            
            # Add user information
            create_data['loginUser'] = request.user
            
            # Get current year if model has year field
            if hasattr(model_class, 'year'):
                try:
                    current_year = YEAR.objects.get(profile_year=2025)
                    create_data['year'] = current_year
                except YEAR.DoesNotExist:
                    pass
            
            # Create the instance (save method will auto-calculate achieved_value and percentages)
            instance = model_class.objects.create(**create_data)
            
            # Get unique identifier
            unique_id = getattr(instance, 'unique_id', instance.pk)
            
            return JsonResponse({
                'success': True,
                'unique_id': unique_id,
                'calculated_value': instance.achieved_value,
                'percentage_from_baseline': getattr(instance, 'percentage_progress_from_baseline', None),
                'percentage_towards_target': getattr(instance, 'percentage_progress_towards_end_target', None),
                'message': f'{kpi_type} calculation saved successfully'
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)


@method_decorator([csrf_exempt, login_required], name='dispatch')
class DeleteKPICalculationView(View):
    """Enhanced view for deleting KPI calculations"""
    
    KPI_MODEL_MAP = SaveKPICalculationView.KPI_MODEL_MAP
    
    def delete(self, request):
        try:
            data = json.loads(request.body)
            kpi_type = data.get('kpi_type') or data.get('calc_type')
            record_id = data.get('id') or data.get('calc_id')
            
            print(f'[DEBUG] Delete API - Raw data: {data}')
            print(f'[DEBUG] Delete API - KPI type: {kpi_type}, Record ID: {record_id}')
            
            if not all([kpi_type, record_id]):
                return JsonResponse({
                    'success': False,
                    'error': f'Missing required fields: kpi_type={kpi_type}, record_id={record_id}'
                }, status=400)
            
            if kpi_type not in self.KPI_MODEL_MAP:
                return JsonResponse({
                    'success': False,
                    'error': 'Invalid KPI type'
                }, status=400)
            
            model_class = self.KPI_MODEL_MAP[kpi_type]
            
            # Handle different primary key fields
            if kpi_type == 'DSCR':
                instance = model_class.objects.get(unique_id=record_id)
            else:
                instance = model_class.objects.get(id=record_id)
            
            instance.delete()
            
            return JsonResponse({
                'success': True,
                'message': f'{kpi_type} calculation deleted successfully'
            })
            
        except model_class.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Record not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)