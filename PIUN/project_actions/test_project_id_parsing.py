"""
Test script to verify project_id parsing with special characters
"""

def test_project_id_parsing():
    """Test the enhanced project ID parsing logic"""
    
    # Test case 1: URL with & in project_id
    test_query_string = "monitoring_type_id=proc&project_id=D309&%20D6530%20-GM"
    
    print("Testing project_id parsing:")
    print(f"Input query string: {test_query_string}")
    
    # Method 1: Reconstruct from query parts
    if 'project_id=' in test_query_string:
        parts = test_query_string.split('&')
        project_parts = []
        
        collecting_project_id = False
        for part in parts:
            if part.startswith('project_id='):
                collecting_project_id = True
                project_parts.append(part[11:])  # Remove 'project_id=' prefix
            elif collecting_project_id and not any(part.startswith(param + '=') for param in ['monitoring_type_id', 'investment_code', 'type_of_investment']):
                project_parts.append(part)
            elif collecting_project_id and any(part.startswith(param + '=') for param in ['monitoring_type_id', 'investment_code', 'type_of_investment']):
                break
        
        if project_parts:
            import urllib.parse
            project_id = '&'.join(project_parts)
            project_id = urllib.parse.unquote(project_id)
            print(f"Reconstructed project_id: {project_id}")
            
            # Expected: D309& D6530 -GM
            expected = "D309& D6530 -GM"
            if project_id == expected:
                print("✅ SUCCESS: Project ID correctly reconstructed!")
            else:
                print(f"❌ FAILED: Expected '{expected}', got '{project_id}'")
    
    # Test case 2: Simple project_id without special characters
    test_query_string_2 = "monitoring_type_id=proc&project_id=SIMPLE123"
    print(f"\nTesting simple project_id: {test_query_string_2}")
    
    if 'project_id=' in test_query_string_2:
        parts = test_query_string_2.split('&')
        project_parts = []
        
        collecting_project_id = False
        for part in parts:
            if part.startswith('project_id='):
                collecting_project_id = True
                project_parts.append(part[11:])
            elif collecting_project_id and not any(part.startswith(param + '=') for param in ['monitoring_type_id', 'investment_code', 'type_of_investment']):
                project_parts.append(part)
            elif collecting_project_id and any(part.startswith(param + '=') for param in ['monitoring_type_id', 'investment_code', 'type_of_investment']):
                break
        
        if project_parts:
            import urllib.parse
            project_id = '&'.join(project_parts)
            project_id = urllib.parse.unquote(project_id)
            print(f"Simple project_id: {project_id}")
            
            if project_id == "SIMPLE123":
                print("✅ SUCCESS: Simple project ID correctly parsed!")
            else:
                print(f"❌ FAILED: Expected 'SIMPLE123', got '{project_id}'")

if __name__ == "__main__":
    test_project_id_parsing()