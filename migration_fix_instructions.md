# Migration Fix Instructions for Offline Deployment

## Problem
The migration `social_and_env.0002_papdocument` is failing because the foreign key constraint doesn't properly reference the PAP table's primary key field.

## Root Cause
- PAP model uses `pap_identification_number` (CharField) as primary key
- PAPDocument foreign key wasn't explicitly told to reference this field
- SQL Server requires explicit foreign key field specification

## Solution Steps

### Step 1: Fix the Migration File
Update `PIUN/social_and_env/migrations/0002_add_pap_document_model.py`:

Replace line 25:
```python
('pap', models.ForeignKey(db_index=True, on_delete=django.db.models.deletion.CASCADE, related_name='documents', to='social_and_env.pap')),
```

With:
```python
('pap', models.ForeignKey(db_index=True, on_delete=django.db.models.deletion.CASCADE, related_name='documents', to='social_and_env.pap', to_field='pap_identification_number')),
```

### Step 2: Alternative - Reset Migrations (if Step 1 doesn't work)

If the above fix doesn't work, you can reset the migration:

1. **Delete migration files:**
   ```cmd
   cd C:\PIUN
   del social_and_env\migrations\0002_add_pap_document_model.py
   del social_and_env\migrations\0003_add_title_deed_and_documents.py
   ```

2. **Create fresh migration:**
   ```cmd
   python manage.py makemigrations social_and_env
   ```

3. **Apply migration:**
   ```cmd
   python manage.py migrate
   ```

### Step 3: Manual Database Fix (if all else fails)

If migrations continue to fail, you can manually create the table:

```sql
-- Connect to your SQL Server database and run:
CREATE TABLE social_and_env_papdocument (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    document_type NVARCHAR(50) NOT NULL DEFAULT 'title_deed',
    document_file NVARCHAR(100) NOT NULL,
    document_name NVARCHAR(200) NOT NULL,
    upload_date DATETIME2 NOT NULL DEFAULT GETDATE(),
    pap_id NVARCHAR(15) NOT NULL,
    uploaded_by_id INT NOT NULL,
    FOREIGN KEY (pap_id) REFERENCES social_and_env_pap(pap_identification_number),
    FOREIGN KEY (uploaded_by_id) REFERENCES auth_user(id)
);

-- Create indexes
CREATE INDEX social_and_env_papdocument_pap_id_idx ON social_and_env_papdocument(pap_id);
CREATE INDEX social_and_env_papdocument_uploaded_by_id_idx ON social_and_env_papdocument(uploaded_by_id);
CREATE INDEX social_and_env_papdocument_upload_date_idx ON social_and_env_papdocument(upload_date);
CREATE INDEX social_and_env_papdocument_document_type_idx ON social_and_env_papdocument(document_type);

-- Mark migration as applied
INSERT INTO django_migrations (app, name, applied) 
VALUES ('social_and_env', '0002_add_pap_document_model', GETDATE());
```

## Recommended Approach
Try **Step 1** first (fix the migration file), then **Step 2** if needed. Only use **Step 3** as a last resort.

After any of these fixes, you should be able to continue with your deployment.