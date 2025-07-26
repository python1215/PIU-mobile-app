#!/usr/bin/env python
"""
Script to add sample districts and settlements to the database
Adds 3 additional districts per region and 3 settlements per district
"""

import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from setup.models import Regions, LGA, Districts, Ward, Settlement
from django.contrib.auth.models import User

def add_sample_data():
    """Add sample districts and settlements"""
    
    # Get the admin user for the loginUser field
    try:
        admin_user = User.objects.get(username='admin')
    except User.DoesNotExist:
        admin_user = User.objects.first()
        if not admin_user:
            print("No users found in database. Please create a user first.")
            return

    # Sample district data - 3 additional districts per region
    sample_districts = [
        # GBA Region (100) - Kanifing LGA (1002)
        {'district_code': '29', 'district_name': 'Bakoteh', 'lga_code': '1002', 'region_code': '100'},
        {'district_code': '30', 'district_name': 'Dippa Kunda', 'lga_code': '1002', 'region_code': '100'},
        {'district_code': '31', 'district_name': 'Manjai Kunda', 'lga_code': '1002', 'region_code': '100'},
        
        # WCR Region (200) - Brikama LGA (2001) 
        {'district_code': '113', 'district_name': 'Kombo Central', 'lga_code': '2001', 'region_code': '200'},
        {'district_code': '114', 'district_name': 'Sukuta', 'lga_code': '2001', 'region_code': '200'},
        {'district_code': '115', 'district_name': 'Gunjur', 'lga_code': '2001', 'region_code': '200'},
        
        # LRR Region (300) - Mansakonko LGA (3001)
        {'district_code': '46', 'district_name': 'Kiang North', 'lga_code': '3001', 'region_code': '300'},
        {'district_code': '47', 'district_name': 'Jarra South', 'lga_code': '3001', 'region_code': '300'},
        {'district_code': '48', 'district_name': 'Kiang South', 'lga_code': '3001', 'region_code': '300'},
        
        # NBR Region (400) - Kerewan LGA (4001)
        {'district_code': '57', 'district_name': 'Upper Badibu', 'lga_code': '4001', 'region_code': '400'},
        {'district_code': '58', 'district_name': 'Central Niumi', 'lga_code': '4001', 'region_code': '400'},
        {'district_code': '59', 'district_name': 'Kerr Serigne', 'lga_code': '4001', 'region_code': '400'},
        
        # CRR Region (500) - Kuntaur LGA (5001)
        {'district_code': '65', 'district_name': 'Central Saloum', 'lga_code': '5001', 'region_code': '500'},
        {'district_code': '66', 'district_name': 'Niamina Central', 'lga_code': '5001', 'region_code': '500'},
        {'district_code': '67', 'district_name': 'Sami District', 'lga_code': '5001', 'region_code': '500'},
        
        # URR Region (600) - Basse LGA (6001)
        {'district_code': '87', 'district_name': 'Fulladu East', 'lga_code': '6001', 'region_code': '600'},
        {'district_code': '88', 'district_name': 'Wuli Central', 'lga_code': '6001', 'region_code': '600'},
        {'district_code': '89', 'district_name': 'Basse Central', 'lga_code': '6001', 'region_code': '600'},
    ]

    # Sample settlement data - 3 settlements per district
    sample_settlements = [
        # GBA Districts
        {'settlement_code': 'GBA001', 'settlement_name': 'Bakoteh Village', 'district_code': '29', 'ward_code': 'W001', 'EA': 'EA001'},
        {'settlement_code': 'GBA002', 'settlement_name': 'New Bakoteh', 'district_code': '29', 'ward_code': 'W001', 'EA': 'EA002'},
        {'settlement_code': 'GBA003', 'settlement_name': 'Bakoteh Extension', 'district_code': '29', 'ward_code': 'W001', 'EA': 'EA003'},
        
        {'settlement_code': 'GBA004', 'settlement_name': 'Dippa Kunda Central', 'district_code': '30', 'ward_code': 'W002', 'EA': 'EA004'},
        {'settlement_code': 'GBA005', 'settlement_name': 'Dippa Kunda East', 'district_code': '30', 'ward_code': 'W002', 'EA': 'EA005'},
        {'settlement_code': 'GBA006', 'settlement_name': 'Dippa Kunda West', 'district_code': '30', 'ward_code': 'W002', 'EA': 'EA006'},
        
        {'settlement_code': 'GBA007', 'settlement_name': 'Manjai Kunda Main', 'district_code': '31', 'ward_code': 'W003', 'EA': 'EA007'},
        {'settlement_code': 'GBA008', 'settlement_name': 'Manjai Kunda North', 'district_code': '31', 'ward_code': 'W003', 'EA': 'EA008'},
        {'settlement_code': 'GBA009', 'settlement_name': 'Manjai Kunda South', 'district_code': '31', 'ward_code': 'W003', 'EA': 'EA009'},
        
        # WCR Districts
        {'settlement_code': 'WCR001', 'settlement_name': 'Kombo Central Town', 'district_code': '113', 'ward_code': 'W004', 'EA': 'EA010'},
        {'settlement_code': 'WCR002', 'settlement_name': 'Kombo Central Market', 'district_code': '113', 'ward_code': 'W004', 'EA': 'EA011'},
        {'settlement_code': 'WCR003', 'settlement_name': 'Kombo Central Junction', 'district_code': '113', 'ward_code': 'W004', 'EA': 'EA012'},
        
        {'settlement_code': 'WCR004', 'settlement_name': 'Sukuta Village', 'district_code': '114', 'ward_code': 'W005', 'EA': 'EA013'},
        {'settlement_code': 'WCR005', 'settlement_name': 'Sukuta New Town', 'district_code': '114', 'ward_code': 'W005', 'EA': 'EA014'},
        {'settlement_code': 'WCR006', 'settlement_name': 'Sukuta Junction', 'district_code': '114', 'ward_code': 'W005', 'EA': 'EA015'},
        
        {'settlement_code': 'WCR007', 'settlement_name': 'Gunjur Town', 'district_code': '115', 'ward_code': 'W006', 'EA': 'EA016'},
        {'settlement_code': 'WCR008', 'settlement_name': 'Gunjur Beach', 'district_code': '115', 'ward_code': 'W006', 'EA': 'EA017'},
        {'settlement_code': 'WCR009', 'settlement_name': 'Gunjur Market', 'district_code': '115', 'ward_code': 'W006', 'EA': 'EA018'},
        
        # LRR Districts
        {'settlement_code': 'LRR001', 'settlement_name': 'Kiang North Village', 'district_code': '46', 'ward_code': 'W007', 'EA': 'EA019'},
        {'settlement_code': 'LRR002', 'settlement_name': 'Kiang North Center', 'district_code': '46', 'ward_code': 'W007', 'EA': 'EA020'},
        {'settlement_code': 'LRR003', 'settlement_name': 'Kiang North Junction', 'district_code': '46', 'ward_code': 'W007', 'EA': 'EA021'},
        
        {'settlement_code': 'LRR004', 'settlement_name': 'Jarra South Town', 'district_code': '47', 'ward_code': 'W008', 'EA': 'EA022'},
        {'settlement_code': 'LRR005', 'settlement_name': 'Jarra South Market', 'district_code': '47', 'ward_code': 'W008', 'EA': 'EA023'},
        {'settlement_code': 'LRR006', 'settlement_name': 'Jarra South Extension', 'district_code': '47', 'ward_code': 'W008', 'EA': 'EA024'},
        
        {'settlement_code': 'LRR007', 'settlement_name': 'Kiang South Village', 'district_code': '48', 'ward_code': 'W009', 'EA': 'EA025'},
        {'settlement_code': 'LRR008', 'settlement_name': 'Kiang South Center', 'district_code': '48', 'ward_code': 'W009', 'EA': 'EA026'},
        {'settlement_code': 'LRR009', 'settlement_name': 'Kiang South Port', 'district_code': '48', 'ward_code': 'W009', 'EA': 'EA027'},
        
        # NBR Districts
        {'settlement_code': 'NBR001', 'settlement_name': 'Upper Badibu Town', 'district_code': '57', 'ward_code': 'W010', 'EA': 'EA028'},
        {'settlement_code': 'NBR002', 'settlement_name': 'Upper Badibu Market', 'district_code': '57', 'ward_code': 'W010', 'EA': 'EA029'},
        {'settlement_code': 'NBR003', 'settlement_name': 'Upper Badibu Junction', 'district_code': '57', 'ward_code': 'W010', 'EA': 'EA030'},
        
        {'settlement_code': 'NBR004', 'settlement_name': 'Central Niumi Village', 'district_code': '58', 'ward_code': 'W011', 'EA': 'EA031'},
        {'settlement_code': 'NBR005', 'settlement_name': 'Central Niumi Center', 'district_code': '58', 'ward_code': 'W011', 'EA': 'EA032'},
        {'settlement_code': 'NBR006', 'settlement_name': 'Central Niumi Port', 'district_code': '58', 'ward_code': 'W011', 'EA': 'EA033'},
        
        {'settlement_code': 'NBR007', 'settlement_name': 'Kerr Serigne Town', 'district_code': '59', 'ward_code': 'W012', 'EA': 'EA034'},
        {'settlement_code': 'NBR008', 'settlement_name': 'Kerr Serigne Market', 'district_code': '59', 'ward_code': 'W012', 'EA': 'EA035'},
        {'settlement_code': 'NBR009', 'settlement_name': 'Kerr Serigne Extension', 'district_code': '59', 'ward_code': 'W012', 'EA': 'EA036'},
        
        # CRR Districts
        {'settlement_code': 'CRR001', 'settlement_name': 'Central Saloum Town', 'district_code': '65', 'ward_code': 'W013', 'EA': 'EA037'},
        {'settlement_code': 'CRR002', 'settlement_name': 'Central Saloum Market', 'district_code': '65', 'ward_code': 'W013', 'EA': 'EA038'},
        {'settlement_code': 'CRR003', 'settlement_name': 'Central Saloum Junction', 'district_code': '65', 'ward_code': 'W013', 'EA': 'EA039'},
        
        {'settlement_code': 'CRR004', 'settlement_name': 'Niamina Central Village', 'district_code': '66', 'ward_code': 'W014', 'EA': 'EA040'},
        {'settlement_code': 'CRR005', 'settlement_name': 'Niamina Central Market', 'district_code': '66', 'ward_code': 'W014', 'EA': 'EA041'},
        {'settlement_code': 'CRR006', 'settlement_name': 'Niamina Central Port', 'district_code': '66', 'ward_code': 'W014', 'EA': 'EA042'},
        
        {'settlement_code': 'CRR007', 'settlement_name': 'Sami District Town', 'district_code': '67', 'ward_code': 'W015', 'EA': 'EA043'},
        {'settlement_code': 'CRR008', 'settlement_name': 'Sami District Center', 'district_code': '67', 'ward_code': 'W015', 'EA': 'EA044'},
        {'settlement_code': 'CRR009', 'settlement_name': 'Sami District Junction', 'district_code': '67', 'ward_code': 'W015', 'EA': 'EA045'},
        
        # URR Districts
        {'settlement_code': 'URR001', 'settlement_name': 'Fulladu East Town', 'district_code': '87', 'ward_code': 'W016', 'EA': 'EA046'},
        {'settlement_code': 'URR002', 'settlement_name': 'Fulladu East Market', 'district_code': '87', 'ward_code': 'W016', 'EA': 'EA047'},
        {'settlement_code': 'URR003', 'settlement_name': 'Fulladu East Junction', 'district_code': '87', 'ward_code': 'W016', 'EA': 'EA048'},
        
        {'settlement_code': 'URR004', 'settlement_name': 'Wuli Central Village', 'district_code': '88', 'ward_code': 'W017', 'EA': 'EA049'},
        {'settlement_code': 'URR005', 'settlement_name': 'Wuli Central Market', 'district_code': '88', 'ward_code': 'W017', 'EA': 'EA050'},
        {'settlement_code': 'URR006', 'settlement_name': 'Wuli Central Port', 'district_code': '88', 'ward_code': 'W017', 'EA': 'EA051'},
        
        {'settlement_code': 'URR007', 'settlement_name': 'Basse Central Town', 'district_code': '89', 'ward_code': 'W018', 'EA': 'EA052'},
        {'settlement_code': 'URR008', 'settlement_name': 'Basse Central Market', 'district_code': '89', 'ward_code': 'W018', 'EA': 'EA053'},
        {'settlement_code': 'URR009', 'settlement_name': 'Basse Central Junction', 'district_code': '89', 'ward_code': 'W018', 'EA': 'EA054'},
    ]

    # Create sample wards first (needed for settlements)
    sample_wards = []
    for i in range(1, 19):
        ward_code = f'W{i:03d}'
        sample_wards.append({
            'ward_code': ward_code, 
            'ward_name': f'Ward {i}', 
            'district_code': sample_districts[(i-1) % len(sample_districts)]['district_code']
        })

    # Add districts
    districts_added = 0
    for district_data in sample_districts:
        try:
            # Get references
            region = Regions.objects.get(region_code=district_data['region_code'])
            lga = LGA.objects.get(lga_code=district_data['lga_code'])
            
            # Create district if it doesn't exist
            district, created = Districts.objects.get_or_create(
                district_code=district_data['district_code'],
                defaults={
                    'district_name': district_data['district_name'],
                    'region_code': region,
                    'lga_code': lga
                }
            )
            
            if created:
                districts_added += 1
                print(f"Added district: {district.district_name} ({district.district_code})")
            
        except Exception as e:
            print(f"Error adding district {district_data['district_name']}: {str(e)}")

    # Add wards
    wards_added = 0
    for ward_data in sample_wards:
        try:
            # Get district reference
            district = Districts.objects.get(district_code=ward_data['district_code'])
            
            # Create ward if it doesn't exist
            ward, created = Ward.objects.get_or_create(
                ward_code=ward_data['ward_code'],
                defaults={
                    'ward_name': ward_data['ward_name'],
                    'district_code': district
                }
            )
            
            if created:
                wards_added += 1
                print(f"Added ward: {ward.ward_name} ({ward.ward_code})")
                
        except Exception as e:
            print(f"Error adding ward {ward_data['ward_name']}: {str(e)}")

    # Add settlements
    settlements_added = 0
    for settlement_data in sample_settlements:
        try:
            # Get references
            district = Districts.objects.get(district_code=settlement_data['district_code'])
            ward = Ward.objects.get(ward_code=settlement_data['ward_code'])
            
            # Create settlement if it doesn't exist
            settlement, created = Settlement.objects.get_or_create(
                settlement_code=settlement_data['settlement_code'],
                defaults={
                    'settlement_name': settlement_data['settlement_name'],
                    'district_code': district,
                    'ward_code': ward,
                    'EA': settlement_data['EA']
                }
            )
            
            if created:
                settlements_added += 1
                print(f"Added settlement: {settlement.settlement_name} ({settlement.settlement_code})")
                
        except Exception as e:
            print(f"Error adding settlement {settlement_data['settlement_name']}: {str(e)}")

    print(f"\n=== Summary ===")
    print(f"Districts added: {districts_added}")
    print(f"Wards added: {wards_added}")
    print(f"Settlements added: {settlements_added}")
    print("Sample data insertion completed!")

if __name__ == '__main__':
    add_sample_data()