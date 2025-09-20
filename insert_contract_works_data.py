#!/usr/bin/env python
"""
Script to insert Contract Profiling Works data into the database
"""
import os
import sys
import django
from datetime import datetime
from decimal import Decimal

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PIUN.settings')
django.setup()

from project_actions.models import Contract_Profiling_works
from PIU_Financial_mgt.models import Project, Component, Subcomponent, Activities, ProjectCategory, Currency
from setup.models import Donor
from accounts.models import User

def insert_contract_works_data():
    """Insert the contract works data from the provided file"""
    
    # Data from the attached file (excluding header row)
    data_records = [
        {
            'id': 1,
            'main_intervention_focus_result': '(a) 500 km of medium voltage (MV) lines, (b) 315 distribution substations, (c) 1200km of low voltage (LV) lines to expand grid coverage and maximize the number of new connections; and d) 51,000 last mile connection equipment, including service drops, prepaid meters, as well as ready boards for low voltage customers',
            'target_number_of_beneficiary_settlements': 292,
            'location_of_investment': 'Brikama  and Soma  Feeders',
            'Latitude': 13.29068,
            'Longitude': -16.65681,
            'gross_floor_area_m2': 3,
            'contract_value': Decimal('50400000.00'),
            'amendments': False,  # 0 = False
            'contract_refNo': 'ECOREAP-W-KEI',
            'name_of_contractor': 'KEI Industries Limited',
            'name_of_consultant': 'Solener Technologies Solutions Energetiques',
            'contract_start_date': '2021-12-23',
            'contract_end_date': '2023-12-31',
            'duration': '24 Months',
            'remarks': 'on going',
            'activityID_id': 126,
            'compID_id': 7,
            'currency_id': 2,
            'funding_source_id': 5,
            'loginUser_id': 1,
            'projectID_id': 'ECOREAP-P164044',
            'project_Category_id': 2,
            'subcompID_id': 25
        },
        {
            'id': 2,
            'main_intervention_focus_result': 'Design, supply and construction of 11 intervention boreholes and associated infrastructure',
            'target_number_of_beneficiary_settlements': 11,
            'location_of_investment': 'Brikama',
            'Latitude': 13.16169,
            'Longitude': -16.099888,
            'gross_floor_area_m2': 10,
            'contract_value': Decimal('945006.95'),
            'amendments': False,
            'contract_refNo': 'CW-RFB-JV-Doku',
            'name_of_contractor': 'Lot 1: JV DOKU GROUP, GENERAL PROCUREMENT SERVICES and TABANI ELECTRICAL COMPANY',
            'name_of_consultant': 'PIU',
            'contract_start_date': '2023-08-30',
            'contract_end_date': '2024-10-30',
            'duration': '15 Months',
            'remarks': 'ongoing',
            'activityID_id': 175,
            'compID_id': 4,
            'currency_id': 2,
            'funding_source_id': 5,
            'loginUser_id': 1,
            'projectID_id': 'D309& D6530 -GM',
            'project_Category_id': 2,
            'subcompID_id': 19
        },
        {
            'id': 3,
            'main_intervention_focus_result': 'Installation of a 33 /11KV Kotu Tank substation, Installation of SCADA National Control Centre at Brikama, Establishment of 225/33 KV substation',
            'target_number_of_beneficiary_settlements': 200,
            'location_of_investment': '@Kotu @ Brikama @Jabang',
            'Latitude': 13.440862,
            'Longitude': -16.703946,
            'gross_floor_area_m2': 10849,
            'contract_value': Decimal('22474250.72'),
            'amendments': True,  # 1 = True
            'contract_refNo': 'GBA-Phase1-GM-NAWEC-153230-CW-RFB',
            'name_of_contractor': 'TBEA, of China',
            'name_of_consultant': 'MAI of Spain',
            'contract_start_date': '2021-12-24',
            'contract_end_date': '2023-06-30',
            'duration': '15 months',
            'remarks': 'on going',
            'activityID_id': 125,
            'compID_id': 2,
            'currency_id': 2,
            'funding_source_id': 5,
            'loginUser_id': 1,
            'projectID_id': 'D309& D6530 -GM',
            'project_Category_id': 2,
            'subcompID_id': 3
        },
        {
            'id': 4,
            'main_intervention_focus_result': 'Primary and Secondary Stations and an additional Bay at OMVG Brikama Substation upgraded:',
            'target_number_of_beneficiary_settlements': 5,
            'location_of_investment': 'OMVG, Wellingara, Mile 5 & Madina substations',
            'Latitude': 13.466946,
            'Longitude': -16.651979,
            'gross_floor_area_m2': 246,
            'contract_value': Decimal('5246363.07'),
            'amendments': False,
            'contract_refNo': 'GBA-SS-GM-NAWEC-187669-CW-RFB',
            'name_of_contractor': 'TBEA, of China.',
            'name_of_consultant': 'MAI of Spain',
            'contract_start_date': '2022-10-11',
            'contract_end_date': '2023-10-31',
            'duration': '12 Months',
            'remarks': 'on going',
            'activityID_id': 127,
            'compID_id': 2,
            'currency_id': 2,
            'funding_source_id': 5,
            'loginUser_id': 1,
            'projectID_id': 'D309& D6530 -GM',
            'project_Category_id': 2,
            'subcompID_id': 4
        },
        {
            'id': 5,
            'main_intervention_focus_result': '1. Construction of 33/0.4kV Distribution network for electrification of 08 no. of villages to be fed from Brikama Substation and benefiting 9 communities (2846 consumers) 2. Construction of 30/0.4kV Distribution network for electrification of 138 no. of villages to be fed from Soma Substation and benefiting 117 communities (6659 consumers)',
            'target_number_of_beneficiary_settlements': 146,
            'location_of_investment': 'NBR, CRRN &WCR',
            'Latitude': 0,  # Will handle as None
            'Longitude': 0,  # Will handle as None
            'gross_floor_area_m2': 3,
            'contract_value': Decimal('12454252.40'),
            'amendments': False,
            'contract_refNo': 'GEAP-W-Trainsail',
            'name_of_contractor': 'Transrail Lighting Limited, Mumbai, India (TLL)',
            'name_of_consultant': 'WAPCOS Limited',
            'contract_start_date': '2022-10-28',
            'contract_end_date': '2024-01-28',
            'duration': '18 months',
            'remarks': 'contract extended till December 2024',
            'activityID_id': 182,
            'compID_id': 14,
            'currency_id': 2,
            'funding_source_id': 2,
            'loginUser_id': 1,
            'projectID_id': 'GEAP',
            'project_Category_id': 1,
            'subcompID_id': 40
        }
    ]
    
    print("Starting data insertion...")
    
    for i, record_data in enumerate(data_records, 1):
        try:
            print(f"\nProcessing record {i}: {record_data['contract_refNo']}")
            
            # Get the foreign key objects
            try:
                project = Project.objects.get(projectID=record_data['projectID_id'])
            except Project.DoesNotExist:
                print(f"  Warning: Project '{record_data['projectID_id']}' not found, skipping record")
                continue
                
            try:
                component = Component.objects.get(id=record_data['compID_id'])
            except Component.DoesNotExist:
                print(f"  Warning: Component with ID {record_data['compID_id']} not found, skipping record")
                continue
                
            try:
                subcomponent = Subcomponent.objects.get(id=record_data['subcompID_id'])
            except Subcomponent.DoesNotExist:
                print(f"  Warning: Subcomponent with ID {record_data['subcompID_id']} not found, skipping record")
                continue
                
            try:
                activity = Activities.objects.get(id=record_data['activityID_id'])
            except Activities.DoesNotExist:
                print(f"  Warning: Activity with ID {record_data['activityID_id']} not found, skipping record")
                continue
                
            try:
                project_category = ProjectCategory.objects.get(id=record_data['project_Category_id'])
            except ProjectCategory.DoesNotExist:
                print(f"  Warning: ProjectCategory with ID {record_data['project_Category_id']} not found, skipping record")
                continue
                
            try:
                funding_source = Donor.objects.get(id=record_data['funding_source_id'])
            except Donor.DoesNotExist:
                print(f"  Warning: Donor with ID {record_data['funding_source_id']} not found, skipping record")
                continue
                
            try:
                currency = Currency.objects.get(id=record_data['currency_id'])
            except Currency.DoesNotExist:
                print(f"  Warning: Currency with ID {record_data['currency_id']} not found, skipping record")
                continue
                
            try:
                login_user = User.objects.get(id=record_data['loginUser_id'])
            except User.DoesNotExist:
                print(f"  Warning: User with ID {record_data['loginUser_id']} not found, skipping record")
                continue
            
            # Check if record already exists
            if Contract_Profiling_works.objects.filter(contract_refNo=record_data['contract_refNo']).exists():
                print(f"  Record with contract_refNo '{record_data['contract_refNo']}' already exists, skipping")
                continue
            
            # Handle coordinates (0 values as None)
            latitude = record_data['Latitude'] if record_data['Latitude'] != 0 else None
            longitude = record_data['Longitude'] if record_data['Longitude'] != 0 else None
            
            # Create the Contract_Profiling_works record
            contract_work = Contract_Profiling_works.objects.create(
                projectID=project,
                compID=component,
                subcompID=subcomponent,
                activityID=activity,
                project_Category=project_category,
                funding_source=funding_source,
                main_intervention_focus_result=record_data['main_intervention_focus_result'],
                target_number_of_beneficiary_settlements=record_data['target_number_of_beneficiary_settlements'],
                location_of_investment=record_data['location_of_investment'],
                Latitude=latitude,
                Longitude=longitude,
                gross_floor_area_m2=record_data['gross_floor_area_m2'],
                currency=currency,
                contract_value=record_data['contract_value'],
                amendments=record_data['amendments'],
                contract_refNo=record_data['contract_refNo'],
                name_of_contractor=record_data['name_of_contractor'],
                name_of_consultant=record_data['name_of_consultant'],
                contract_start_date=record_data['contract_start_date'],
                contract_end_date=record_data['contract_end_date'],
                duration=record_data['duration'],
                remarks=record_data['remarks'],
                loginUser=login_user
            )
            
            print(f"  ✓ Successfully created contract work record: {contract_work.contract_refNo}")
            
        except Exception as e:
            print(f"  ✗ Error creating record {i}: {str(e)}")
            continue
    
    print(f"\nData insertion completed!")
    print(f"Total Contract_Profiling_works records in database: {Contract_Profiling_works.objects.count()}")

if __name__ == "__main__":
    insert_contract_works_data()