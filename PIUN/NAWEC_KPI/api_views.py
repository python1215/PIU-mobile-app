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
    CalculateAO, CalculateDER, CalculateCR
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
    }
    
    def post(self, request):
        try:
            data = json.loads(request.body)
            kpi_type = data.get('kpi_type')
            input_values = data.get('input_values', {})
            
            if not kpi_type or kpi_type not in self.KPI_MODEL_MAP:
                return JsonResponse({
                    'success': False,
                    'error': 'Invalid or missing KPI type'
                }, status=400)
            
            # Get the model class for this KPI type
            model_class = self.KPI_MODEL_MAP[kpi_type]
            
            # Prepare data for model creation
            create_data = {}
            
            # Handle all model fields except excluded ones
            excluded_fields = ['loginUser', 'year', 'date_created', 'id', 'unique_id']
            
            for field in model_class._meta.get_fields():
                if hasattr(field, 'name') and field.name not in excluded_fields:
                    field_value = input_values.get(field.name)
                    if field_value is not None and field_value != '':
                        if field.name == 'quarter':
                            # Handle quarter as foreign key
                            try:
                                quarter_instance = Quarter.objects.get(quarter=field_value)
                                create_data['quarter'] = quarter_instance
                            except Quarter.DoesNotExist:
                                pass
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
            kpi_type = data.get('kpi_type')
            record_id = data.get('id')
            
            if not all([kpi_type, record_id]):
                return JsonResponse({
                    'success': False,
                    'error': 'Missing required fields'
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