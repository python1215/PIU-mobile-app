import re

# Read the views.py file
with open('PIU_Financial_mgt/views.py', 'r') as f:
    content = f.read()

# Apply replacements for Component model field updates
content = re.sub(r'projectID__project__projectID', 'project__projectID__icontains', content)
content = re.sub(r'Project_Components__icontains', 'project_components__icontains', content)

print("Applied field reference fixes")

# Write back the file
with open('PIU_Financial_mgt/views.py', 'w') as f:
    f.write(content)
