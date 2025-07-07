"""
AI-Powered Trend Prediction for Project Outcomes
Advanced machine learning analysis of PIUN project monitoring data
"""
import os
import json
import numpy as np
from datetime import datetime, timedelta
from django.db.models import Avg, Count, Q
from openai import OpenAI

from .models import Results_Oriented_Monitoring, Indicator_Description
from PIU_Financial_mgt.models import Project
from setup.models import YEAR, Quarter, Indicator_Type

class ProjectTrendPredictor:
    """
    AI-powered trend prediction engine for PIUN project outcomes
    """

    def __init__(self):
        from dotenv import load_dotenv
        load_dotenv()

        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY is not set in environment")

        self.client = OpenAI(api_key=api_key)
        self.model = "gpt-4o"  # Latest OpenAI model

    def analyze_project_trends(self, project_id=None, months_ahead=6):
        try:
            project_data = self._gather_project_data(project_id)

            if not project_data['monitoring_records']:
                return {
                    'success': False,
                    'message': 'Insufficient data for trend analysis',
                    'predictions': []
                }

            predictions = self._generate_ai_predictions(project_data, months_ahead)

            return {
                'success': True,
                'project_data': project_data,
                'predictions': predictions,
                'analysis_date': datetime.now().isoformat(),
                'forecast_period': f"{months_ahead} months"
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Error in trend analysis'
            }

    def _gather_project_data(self, project_id=None):
        monitoring_query = Results_Oriented_Monitoring.objects.all()

        if project_id:
            monitoring_query = monitoring_query.filter(project_id=project_id)
            project = Project.objects.get(projectID=project_id)
            project_name = project.project
        else:
            project_name = "All Projects"

        monitoring_records = monitoring_query.select_related(
            'project', 'indicator_type', 'year', 'quarter'
        ).order_by('-year__profile_year', '-quarter__quarter')

        performance_stats = monitoring_query.aggregate(
            avg_baseline=Avg('baseline_value'),
            avg_achieved=Avg('achieved_value'),
            avg_target=Avg('End_Target_Value'),
            avg_achievement_rate=Avg('percentage_achieved_vs_end_target'),
            total_indicators=Count('id')
        )

        quarterly_trends = []
        years = YEAR.objects.all().order_by('-profile_year')[:3]
        quarters = Quarter.objects.all().order_by('quarter')

        for year in years:
            for quarter in quarters:
                quarter_data = monitoring_query.filter(
                    year=year, quarter=quarter
                ).aggregate(
                    count=Count('id'),
                    avg_achievement=Avg('achieved_value'),
                    avg_target_percentage=Avg('percentage_achieved_vs_end_target')
                )

                if quarter_data['count'] > 0:
                    quarterly_trends.append({
                        'period': f"{year.profile_year} Q{quarter.quarter}",
                        'year': year.profile_year,
                        'quarter': quarter.quarter,
                        'indicators_count': quarter_data['count'],
                        'avg_achievement': float(quarter_data['avg_achievement'] or 0),
                        'avg_target_percentage': float(quarter_data['avg_target_percentage'] or 0)
                    })

        indicator_performance = []
        for indicator_type in Indicator_Type.objects.all():
            type_stats = monitoring_query.filter(
                indicator_type=indicator_type
            ).aggregate(
                count=Count('id'),
                avg_achievement=Avg('percentage_achieved_vs_end_target')
            )

            if type_stats['count'] > 0:
                indicator_performance.append({
                    'type': indicator_type.indicator_type,
                    'count': type_stats['count'],
                    'avg_achievement': float(type_stats['avg_achievement'] or 0)
                })

        recent_records = []
        for record in monitoring_records[:20]:
            recent_records.append({
                'indicator': record.indicator_description,
                'baseline': float(record.baseline_value or 0),
                'achieved': float(record.achieved_value or 0),
                'target': float(record.End_Target_Value or 0),
                'achievement_rate': float(record.percentage_achieved_vs_end_target or 0),
                'period': f"{record.year.profile_year if record.year else 'N/A'} Q{record.quarter.quarter if record.quarter else 'N/A'}",
                'indicator_type': record.indicator_type.indicator_type if record.indicator_type else 'Unknown'
            })

        return {
            'project_name': project_name,
            'project_id': project_id,
            'monitoring_records': recent_records,
            'performance_stats': {
                'avg_baseline': float(performance_stats['avg_baseline'] or 0),
                'avg_achieved': float(performance_stats['avg_achieved'] or 0),
                'avg_target': float(performance_stats['avg_target'] or 0),
                'avg_achievement_rate': float(performance_stats['avg_achievement_rate'] or 0),
                'total_indicators': performance_stats['total_indicators']
            },
            'quarterly_trends': quarterly_trends,
            'indicator_performance': indicator_performance
        }

    def _generate_ai_predictions(self, project_data, months_ahead):
        try:
            prompt = self._create_analysis_prompt(project_data, months_ahead)

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert project management analyst specializing in infrastructure projects in Gambia. Analyze project monitoring data and provide detailed trend predictions with actionable insights."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                max_tokens=2000
            )

            ai_analysis = json.loads(response.choices[0].message.content)
            statistical_predictions = self._generate_statistical_trends(project_data, months_ahead)

            return {
                'ai_insights': ai_analysis,
                'statistical_trends': statistical_predictions,
                'combined_forecast': self._combine_predictions(ai_analysis, statistical_predictions)
            }

        except Exception as e:
            return {
                'error': f"AI prediction failed: {str(e)}",
                'fallback_analysis': self._generate_statistical_trends(project_data, months_ahead)
            }

    def _create_analysis_prompt(self, project_data, months_ahead):
        return f"""
        Analyze the following PIUN project monitoring data from Gambia and provide trend predictions:

        PROJECT OVERVIEW:
        - Project: {project_data['project_name']}
        - Total Indicators: {project_data['performance_stats']['total_indicators']}
        - Average Achievement Rate: {project_data['performance_stats']['avg_achievement_rate']:.1f}%

        RECENT MONITORING DATA:
        {json.dumps(project_data['monitoring_records'][:10], indent=2)}

        QUARTERLY PERFORMANCE TRENDS:
        {json.dumps(project_data['quarterly_trends'], indent=2)}

        INDICATOR TYPE PERFORMANCE:
        {json.dumps(project_data['indicator_performance'], indent=2)}

        ANALYSIS REQUEST:
        Predict project trends for the next {months_ahead} months. Provide a JSON response with:

        {{
            "overall_trend": "improving/declining/stable",
            "predicted_achievement_rate": numerical_percentage,
            "risk_assessment": "low/medium/high",
            "key_insights": ["insight1", "insight2", "insight3"],
            "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
            "quarterly_forecasts": [
                {{
                    "quarter": "2025 Q2",
                    "predicted_achievement": percentage,
                    "confidence_level": "high/medium/low",
                    "key_focus_areas": ["area1", "area2"]
                }}
            ],
            "potential_challenges": ["challenge1", "challenge2"],
            "success_indicators": ["indicator1", "indicator2"],
            "optimization_opportunities": ["opportunity1", "opportunity2"]
        }}

        Focus on infrastructure development patterns specific to Gambia's context.
        """

    def _generate_statistical_trends(self, project_data, months_ahead):
        try:
            if not project_data['quarterly_trends']:
                return {'message': 'Insufficient data for statistical analysis'}

            achievement_rates = [
                trend['avg_target_percentage']
                for trend in project_data['quarterly_trends']
                if trend['avg_target_percentage'] > 0
            ]

            if len(achievement_rates) < 2:
                return {'message': 'Insufficient data points for trend calculation'}

            recent_rates = achievement_rates[:3]
            older_rates = achievement_rates[3:6] if len(achievement_rates) > 3 else achievement_rates

            recent_avg = np.mean(recent_rates)
            older_avg = np.mean(older_rates)

            trend_direction = "improving" if recent_avg > older_avg else "declining" if recent_avg < older_avg else "stable"
            trend_strength = abs(recent_avg - older_avg)

            quarters_ahead = (months_ahead + 2) // 3
            projected_rates = []

            for i in range(1, quarters_ahead + 1):
                if trend_direction == "improving":
                    projected_rate = min(recent_avg + (trend_strength * 0.5 * i), 100)
                elif trend_direction == "declining":
                    projected_rate = max(recent_avg - (trend_strength * 0.5 * i), 0)
                else:
                    projected_rate = recent_avg

                projected_rates.append({
                    'quarter': i,
                    'projected_achievement': round(projected_rate, 1),
                    'confidence': 'high' if trend_strength > 10 else 'medium' if trend_strength > 5 else 'low'
                })

            return {
                'trend_direction': trend_direction,
                'trend_strength': round(trend_strength, 1),
                'current_average': round(recent_avg, 1),
                'projected_rates': projected_rates,
                'data_quality': 'good' if len(achievement_rates) >= 4 else 'limited'
            }

        except Exception as e:
            return {'error': f"Statistical analysis failed: {str(e)}"}

    def _combine_predictions(self, ai_analysis, statistical_trends):
        try:
            return {
                'forecast_summary': {
                    'ai_trend': ai_analysis.get('overall_trend', 'unknown'),
                    'statistical_trend': statistical_trends.get('trend_direction', 'unknown'),
                    'consensus': 'aligned' if ai_analysis.get('overall_trend') == statistical_trends.get('trend_direction') else 'divergent'
                },
                'confidence_assessment': {
                    'ai_confidence': ai_analysis.get('risk_assessment', 'medium'),
                    'statistical_confidence': statistical_trends.get('data_quality', 'limited'),
                    'overall_reliability': 'high' if statistical_trends.get('data_quality') == 'good' else 'medium'
                },
                'actionable_insights': ai_analysis.get('recommendations', []),
                'numerical_forecasts': statistical_trends.get('projected_rates', []),
                'strategic_recommendations': ai_analysis.get('optimization_opportunities', [])
            }

        except Exception as e:
            return {'error': f"Combined prediction failed: {str(e)}"}

# Usage example and testing functions
def get_project_predictions(project_id=None, months_ahead=6):
    """
    Convenience function to get AI predictions for a project
    """
    try:
        predictor = ProjectTrendPredictor()
        return predictor.analyze_project_trends(project_id, months_ahead)
    except ValueError as e:
        return {
            'success': False,
            'error': str(e),
            'message': 'OpenAI API key required for AI predictions'
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'message': 'Error initializing trend predictor'
        }

def test_prediction_system():
    """
    Test function to validate the prediction system
    """
    predictor = ProjectTrendPredictor()
    
    # Test with all projects
    all_projects_result = predictor.analyze_project_trends()
    
    # Test with specific project if available
    try:
        first_project = Project.objects.first()
        if first_project:
            specific_project_result = predictor.analyze_project_trends(first_project.projectID)
            return {
                'all_projects': all_projects_result,
                'specific_project': specific_project_result
            }
        else:
            return {
                'all_projects': all_projects_result,
                'message': 'No specific projects available for testing'
            }
    except Exception as e:
        return {
            'all_projects': all_projects_result,
            'error': f"Specific project test failed: {str(e)}"
        }