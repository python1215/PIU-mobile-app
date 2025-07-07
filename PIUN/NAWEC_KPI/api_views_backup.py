"""
API views for saving KPI calculation data from popup forms
"""

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View
import json
from .models import (
    CalculateROA, CalculatePAT, CalculateDSCR, CalculateMWh,
    CalculateGAF, CalculateTDE, CalculateATC, CalculateNECD,
    CalculateNWCD, CalculateTPS, CalculateTTP, CalculateWQCC,
    CalculateWQCB, CalculateNRW
)


@method_decorator([csrf_exempt, login_required], name='dispatch')
class SaveKPICalculationView(View):
    """Generic view for saving KPI calculations"""
    
    def post(self, request):
        try:
            data = json.loads(request.body)
            kpi_type = data.get('kpi_type')
            input_values = data.get('input_values', {})
            calculated_value = data.get('calculated_value')
            quarter_value = data.get('quarter')
            
            if not all([kpi_type, calculated_value is not None]):
                return JsonResponse({
                    'success': False,
                    'error': 'Missing required fields'
                }, status=400)
            
            # Get quarter instance if provided
            quarter_instance = None
            if quarter_value:
                from setup.models import Quarter
                try:
                    quarter_instance = Quarter.objects.get(quarter=quarter_value)
                except Quarter.DoesNotExist:
                    pass
            
            # Save based on KPI type
            instance = None
            
            if kpi_type == 'ROA':
                create_data = {
                    'net_profit_after_tax': input_values.get('netProfit'),
                    'total_assets': input_values.get('totalAssets'),
                    'calculated_value': calculated_value,
                    'loginUser': request.user
                }
                if quarter_instance:
                    create_data['quarter'] = quarter_instance
                instance = CalculateROA.objects.create(**create_data)
            
            elif kpi_type == 'PAT':
                create_data = {
                    'total_revenues_turnover': input_values.get('revenue'),
                    'total_expenses': input_values.get('expenses'),
                    'tax_amount': input_values.get('tax'),
                    'calculated_value': calculated_value,
                    'loginUser': request.user
                }
                if quarter_instance:
                    create_data['quarter'] = quarter_instance
                instance = CalculatePAT.objects.create(**create_data)
            
            elif kpi_type == 'DSCR':
                # Get year instance
                year_instance = None
                from setup.models import YEAR
                try:
                    year_instance = YEAR.objects.get(profile_year=2025)
                except YEAR.DoesNotExist:
                    pass
                
                create_data = {
                    'net_operating_income': input_values.get('netOperatingIncome'),
                    'total_debt_service': input_values.get('totalDebtService'),
                    'calculated_value': calculated_value,
                    'loginUser': request.user
                }
                if quarter_instance:
                    create_data['quarter'] = quarter_instance
                if year_instance:
                    create_data['year'] = year_instance
                instance = CalculateDSCR.objects.create(**create_data)
            
            elif kpi_type == 'MWh':
                # Get year instance
                year_instance = None
                from setup.models import YEAR
                try:
                    year_instance = YEAR.objects.get(profile_year=2025)
                except YEAR.DoesNotExist:
                    pass
                
                create_data = {
                    'power_injected': input_values.get('powerInjected'),
                    'time_duration': input_values.get('timeDuration'),
                    'number_of_sources': input_values.get('numberOfSources', 1),
                    'calculated_value': calculated_value,
                    'loginUser': request.user
                }
                if quarter_instance:
                    create_data['quarter'] = quarter_instance
                if year_instance:
                    create_data['year'] = year_instance
                instance = CalculateMWh.objects.create(**create_data)
            
            elif kpi_type == 'GAF':
                # Get year instance
                year_instance = None
                from setup.models import YEAR
                try:
                    year_instance = YEAR.objects.get(profile_year=2025)
                except YEAR.DoesNotExist:
                    pass
                
                create_data = {
                    'total_available_hours': input_values.get('totalAvailableHours'),
                    'total_period_hours': input_values.get('totalPeriodHours'),
                    'calculated_value': calculated_value,
                    'loginUser': request.user
                }
                if quarter_instance:
                    create_data['quarter'] = quarter_instance
                if year_instance:
                    create_data['year'] = year_instance
                instance = CalculateGAF.objects.create(**create_data)
            
            elif kpi_type == 'TDE':
                # Get year instance
                year_instance = None
                from setup.models import YEAR
                try:
                    year_instance = YEAR.objects.get(profile_year=2025)
                except YEAR.DoesNotExist:
                    pass
                
                create_data = {
                    'total_training_days_conducted': input_values.get('totalTrainingDays'),
                    'total_number_of_employees': input_values.get('totalEmployees'),
                    'calculated_value': calculated_value,
                    'loginUser': request.user
                }
                if quarter_instance:
                    create_data['quarter'] = quarter_instance
                if year_instance:
                    create_data['year'] = year_instance
                instance = CalculateTDE.objects.create(**create_data)
            
            elif kpi_type == 'ATC':
                # Get year instance
                year_instance = None
                from setup.models import YEAR
                try:
                    year_instance = YEAR.objects.get(profile_year=2025)
                except YEAR.DoesNotExist:
                    pass
                
                create_data = {
                    'billing_efficiency': input_values.get('billingEfficiency'),
                    'collection_efficiency': input_values.get('collectionEfficiency'),
                    'calculated_value': calculated_value,
                    'loginUser': request.user
                }
                if quarter_instance:
                    create_data['quarter'] = quarter_instance
                if year_instance:
                    create_data['year'] = year_instance
                instance = CalculateATC.objects.create(**create_data)
            
            elif kpi_type == 'NECD':
                # Get year instance
                year_instance = None
                from setup.models import YEAR
                try:
                    year_instance = YEAR.objects.get(profile_year=2025)
                except YEAR.DoesNotExist:
                    pass
                
                create_data = {
                    'total_time_days': input_values.get('totalTimeDays'),
                    'total_number_of_new_connections': input_values.get('totalNumberOfNewConnections'),
                    'calculated_value': calculated_value,
                    'loginUser': request.user
                }
                if quarter_instance:
                    create_data['quarter'] = quarter_instance
                if year_instance:
                    create_data['year'] = year_instance
                instance = CalculateNECD.objects.create(**create_data)
            
            elif kpi_type == 'NWCD':
                # Get year instance
                year_instance = None
                from setup.models import YEAR
                try:
                    year_instance = YEAR.objects.get(profile_year=2025)
                except YEAR.DoesNotExist:
                    pass
                
                create_data = {
                    'total_time_days': input_values.get('totalTimeDays'),
                    'total_number_of_new_connections': input_values.get('totalNumberOfNewConnections'),
                    'calculated_value': calculated_value,
                    'loginUser': request.user
                }
                if quarter_instance:
                    create_data['quarter'] = quarter_instance
                if year_instance:
                    create_data['year'] = year_instance
                instance = CalculateNWCD.objects.create(**create_data)
            
            elif kpi_type == 'TPS':
                # Get year instance
                year_instance = None
                from setup.models import YEAR
                try:
                    year_instance = YEAR.objects.get(profile_year=2025)
                except YEAR.DoesNotExist:
                    pass
                
                create_data = {
                    'number_of_on_time_payments': input_values.get('numberOfOnTimePayments'),
                    'total_number_of_payments_due': input_values.get('totalNumberOfPaymentsDue'),
                    'calculated_value': calculated_value,
                    'loginUser': request.user
                }
                if quarter_instance:
                    create_data['quarter'] = quarter_instance
                if year_instance:
                    create_data['year'] = year_instance
                instance = CalculateTPS.objects.create(**create_data)
            
            elif kpi_type == 'TTP':
                # Get year instance
                year_instance = None
                from setup.models import YEAR
                try:
                    year_instance = YEAR.objects.get(profile_year=2025)
                except YEAR.DoesNotExist:
                    pass
                
                create_data = {
                    'number_of_on_time_payments': input_values.get('numberOfOnTimePayments'),
                    'total_number_of_payments_due': input_values.get('totalNumberOfPaymentsDue'),
                    'calculated_value': calculated_value,
                    'loginUser': request.user
                }
                if quarter_instance:
                    create_data['quarter'] = quarter_instance
                if year_instance:
                    create_data['year'] = year_instance
                instance = CalculateTTP.objects.create(**create_data)
            
            elif kpi_type == 'WQCC':
                # Get year instance
                year_instance = None
                from setup.models import YEAR
                try:
                    year_instance = YEAR.objects.get(profile_year=2025)
                except YEAR.DoesNotExist:
                    pass
                
                create_data = {
                    'number_of_compliant_water_samples': input_values.get('numberOfCompliantWaterSamples'),
                    'total_number_of_tested_water_samples': input_values.get('totalNumberOfTestedWaterSamples'),
                    'calculated_value': calculated_value,
                    'loginUser': request.user
                }
                if quarter_instance:
                    create_data['quarter'] = quarter_instance
                if year_instance:
                    create_data['year'] = year_instance
                instance = CalculateWQCC.objects.create(**create_data)
            
            elif kpi_type == 'WQCB':
                # Get year instance
                year_instance = None
                from setup.models import YEAR
                try:
                    year_instance = YEAR.objects.get(profile_year=2025)
                except YEAR.DoesNotExist:
                    pass
                
                create_data = {
                    'number_of_compliant_water_samples': input_values.get('numberOfCompliantWaterSamples'),
                    'total_number_of_tested_water_samples': input_values.get('totalNumberOfTestedWaterSamples'),
                    'calculated_value': calculated_value,
                    'loginUser': request.user
                }
                if quarter_instance:
                    create_data['quarter'] = quarter_instance
                if year_instance:
                    create_data['year'] = year_instance
                instance = CalculateWQCB.objects.create(**create_data)
            
            elif kpi_type == 'NRW':
                # Get year instance
                year_instance = None
                from setup.models import YEAR
                try:
                    year_instance = YEAR.objects.get(profile_year=2025)
                except YEAR.DoesNotExist:
                    pass
                
                create_data = {
                    'water_entering_system': input_values.get('waterEnteringSystem'),
                    'billed_authorized_consumption': input_values.get('billedAuthorizedConsumption'),
                    'calculated_value': calculated_value,
                    'loginUser': request.user
                }
                if quarter_instance:
                    create_data['quarter'] = quarter_instance
                if year_instance:
                    create_data['year'] = year_instance
                instance = CalculateNRW.objects.create(**create_data)
            
            else:
                return JsonResponse({
                    'success': False,
                    'error': f'Unknown KPI type: {kpi_type}'
                }, status=400)
            
            return JsonResponse({
                'success': True,
                'message': f'{kpi_type} calculation saved successfully',
                'instance_id': instance.pk if instance else None,
                'calculated_value': calculated_value
            })
            
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid JSON data'
            }, status=400)
        except Exception as e:
            import traceback
            print(f"KPI Save Error: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            print(f"Data received: {data if 'data' in locals() else 'No data available'}")
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)


class DeleteKPICalculationView(View):
    """Generic view for deleting KPI calculations"""
    
    def delete(self, request):
        try:
            import json
            data = json.loads(request.body)
            calc_id = data.get('calc_id')
            calc_type = data.get('calc_type')
            
            if not calc_id or not calc_type:
                return JsonResponse({
                    'success': False,
                    'error': 'calc_id and calc_type are required'
                })
            
            # Map calculation types to models
            model_map = {
                'ROA': CalculateROA,
                'PAT': CalculatePAT,
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
            }
            
            model_class = model_map.get(calc_type)
            if not model_class:
                return JsonResponse({
                    'success': False,
                    'error': f'Invalid calculation type: {calc_type}'
                })
            
            # Find and delete the calculation
            try:
                # Handle different primary key fields for different models
                if calc_type == 'DSCR':
                    calculation = model_class.objects.get(unique_id=calc_id)
                else:
                    calculation = model_class.objects.get(id=calc_id)
                
                calculation.delete()
                
                return JsonResponse({
                    'success': True,
                    'message': f'{calc_type} calculation deleted successfully'
                })
            except model_class.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'error': f'Calculation with ID {calc_id} not found for type {calc_type}'
                })
                
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Invalid JSON in request body'
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)