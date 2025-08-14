#!/bin/bash
# Activate MS SQL Server mode for the Django application

echo "🔄 Activating MS SQL Server mode..."

# Set environment variables
export USE_SQL_SERVER=true
export MSSQL_DATABASE=piuprod3
export MSSQL_USER=nawec
export MSSQL_PASSWORD=password
export MSSQL_HOST="PGOMEZ\PGOMEZ"
export MSSQL_PORT=1433

echo "✅ Environment variables set:"
echo "   Database: $MSSQL_DATABASE"
echo "   User: $MSSQL_USER"  
echo "   Host: $MSSQL_HOST"
echo "   Port: $MSSQL_PORT"

echo ""
echo "📋 Next Steps:"
echo "1. Set up SSH tunnel (if needed):"
echo "   ssh -L 1433:localhost:1433 username@your-local-ip"
echo ""
echo "2. Test connection:"
echo "   python test_mssql_connection.py"
echo ""
echo "3. Run Django commands:"
echo "   python manage.py check"
echo "   python manage.py migrate"
echo ""

# Make environment variables available to the current shell
echo "Run 'source activate_mssql.sh' to activate these variables in your current shell."