/**
 * KPI Data Handler Module
 * Manages data persistence, API communication, and form integration
 */

class KPIDataHandler {
    constructor(popupCore) {
        this.popupCore = popupCore;
    }

    /**
     * Use calculated result in the main form
     */
    async useResult(config) {
        console.log('KPI Data Handler - useResult called with config:', config);
        
        // Check multiple sources for the calculated result
        let result = null;
        
        if (this.popupCore && this.popupCore.calculationResults) {
            result = this.popupCore.calculationResults[config.key];
        }
        
        // Also check global result storage
        if (!result && window.currentKPIResult) {
            result = window.currentKPIResult.value;
        }
        
        // Check for displayed result in the popup
        if (!result) {
            const resultElement = document.getElementById('resultValue');
            if (resultElement && resultElement.textContent) {
                result = parseFloat(resultElement.textContent);
            }
        }
        
        console.log('Found result:', result);
        
        if (result !== null && !isNaN(result)) {
            try {
                // Save calculation to database
                await this.saveCalculationToDatabase(config.key.toUpperCase(), result, config);
                
                const achievedField = document.getElementById('id_achieved_value');
                if (achievedField) {
                    achievedField.value = result.toFixed(2);
                    achievedField.style.backgroundColor = '#d4edda';
                    achievedField.style.color = '#155724';
                    
                    setTimeout(() => {
                        achievedField.style.backgroundColor = '';
                        achievedField.style.color = '';
                    }, 3000);
                    
                    // Set quarter if available
                    const quarterField = document.getElementById('id_quarter');
                    if (quarterField && window.currentKPIResult && window.currentKPIResult.quarter) {
                        quarterField.value = window.currentKPIResult.quarter;
                    }
                    
                    // Trigger automatic percentage calculation
                    if (typeof window.calculatePercentages === 'function') {
                        window.calculatePercentages();
                    }
                    
                    this.popupCore.closePopup();
                    
                    // Show success message
                    alert('KPI calculation result has been applied to the form!');
                }
            } catch (error) {
                console.error('Error saving calculation:', error);
                alert('Error saving calculation to database. Please try again.');
            }
        } else {
            alert(`Please calculate the ${config.resultName || 'value'} first.`);
        }
    }

    /**
     * Save calculation data to database
     */
    async saveCalculationToDatabase(kpiType, calculatedValue, config) {
        try {
            // Get all input values from the popup form
            const inputValues = {};
            config.fields.forEach(field => {
                const fieldId = `${config.type.toLowerCase()}-${field.name}`;
                const input = document.getElementById(fieldId);
                if (input && input.value) {
                    if (field.type === 'select') {
                        inputValues[field.name] = input.value;
                    } else {
                        inputValues[field.name] = parseFloat(input.value) || input.value;
                    }
                }
            });

            // Set the achieved_value from calculation
            inputValues['achieved_value'] = parseFloat(calculatedValue);

            const response = await fetch('/NAWEC_KPI/api/save-kpi/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify({
                    kpi_type: kpiType,
                    input_values: inputValues
                })
            });

            const data = await response.json();
            
            if (data.success) {
                console.log(`${kpiType} calculation saved successfully with ID: ${data.unique_id}`);
                this.showSuccessMessage(`${kpiType} calculation saved successfully!`);
            } else {
                console.error('Error saving calculation:', data.error);
                this.showErrorMessage('Error saving calculation: ' + data.error);
            }
        } catch (error) {
            console.error('Network error saving calculation:', error);
            this.showErrorMessage('Network error saving calculation');
        }
    }

    /**
     * Get CSRF token for API requests
     */
    getCSRFToken() {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
        return csrfToken ? csrfToken.value : '';
    }

    /**
     * Load KPI indicator baseline, target, and weight values
     */
    async loadIndicatorValues(indicatorId, config) {
        try {
            const response = await fetch(`/NAWEC_KPI/get-indicator-details/${indicatorId}/`);
            const data = await response.json();
            
            console.log('=== KPI INDICATOR DATA LOADING ===');
            console.log('Indicator ID:', indicatorId);
            console.log('Config type:', config.type);
            console.log('API Response:', data);
            
            if (data.baseline_value !== null || data.End_Target_Value !== null || data.targeted_weight_value !== null) {
                // Populate baseline value
                if (data.baseline_value !== null) {
                    const fieldId = `${config.type.toLowerCase()}-baseline_value`;
                    const baselineField = document.getElementById(fieldId);
                    console.log('Baseline field ID:', fieldId, 'Found:', !!baselineField);
                    if (baselineField) {
                        baselineField.value = data.baseline_value;
                        baselineField.style.backgroundColor = '#e7f3ff';
                        console.log('✓ Baseline value populated:', data.baseline_value);
                    }
                }
                
                // Populate end target value
                if (data.End_Target_Value !== null) {
                    const fieldId = `${config.type.toLowerCase()}-End_Target_Value`;
                    const targetField = document.getElementById(fieldId);
                    console.log('Target field ID:', fieldId, 'Found:', !!targetField);
                    console.log('Target value from API:', data.End_Target_Value);
                    if (targetField) {
                        targetField.value = data.End_Target_Value;
                        targetField.style.backgroundColor = '#e7f3ff';
                        console.log('✓ End Target Value populated:', data.End_Target_Value);
                    } else {
                        console.log('❌ Target field not found in DOM');
                    }
                } else {
                    console.log('❌ End_Target_Value is null in API response');
                }
                
                // Populate targeted weight value
                if (data.targeted_weight_value !== null) {
                    const weightField = document.getElementById(`${config.type.toLowerCase()}-targeted_weight_value`);
                    if (weightField) {
                        weightField.value = data.targeted_weight_value;
                        weightField.style.backgroundColor = '#e7f3ff';
                    }
                }
                
                console.log(`Loaded indicator values for KPI ${indicatorId}:`, data);
            }
            
            return data;
        } catch (error) {
            console.error('Error loading indicator values:', error);
            return null;
        }
    }

    /**
     * Load existing calculation data
     */
    async loadCalculationData(kpiType, id) {
        try {
            const response = await fetch(`/NAWEC_KPI/api/load-kpi/${kpiType}/${id}/`);
            const data = await response.json();
            
            if (data.success) {
                return data.calculation;
            } else {
                console.error('Error loading calculation:', data.error);
                return null;
            }
        } catch (error) {
            console.error('Network error loading calculation:', error);
            return null;
        }
    }

    /**
     * Export calculation data
     */
    exportCalculationData(calculations) {
        const csvContent = this.convertToCSV(calculations);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `kpi_calculations_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    /**
     * Convert data to CSV format
     */
    convertToCSV(data) {
        if (!data || data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        
        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
            });
            csvRows.push(values.join(','));
        });
        
        return csvRows.join('\n');
    }

    /**
     * Show success message
     */
    showSuccessMessage(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-success alert-dismissible fade show position-fixed';
        alert.style.top = '20px';
        alert.style.right = '20px';
        alert.style.zIndex = '9999';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alert);
        
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 5000);
    }

    /**
     * Show error message
     */
    showErrorMessage(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger alert-dismissible fade show position-fixed';
        alert.style.top = '20px';
        alert.style.right = '20px';
        alert.style.zIndex = '9999';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alert);
        
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 5000);
    }
}

// Export for use in other modules
window.KPIDataHandler = KPIDataHandler;