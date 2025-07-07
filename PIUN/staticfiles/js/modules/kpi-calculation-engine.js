/**
 * KPI Calculation Engine Module
 * Handles calculations, validation, and result processing
 */

class KPICalculationEngine {
    constructor(popupCore) {
        this.popupCore = popupCore;
    }

    /**
     * Perform calculation based on config
     */
    calculate(config) {
        const values = {};
        let allValid = true;

        // Collect quarter value
        const quarterSelect = document.getElementById('quarterSelect');
        const quarterValue = quarterSelect.value;
        if (!quarterValue) {
            alert('Please select a quarter.');
            return;
        }
        values.quarter = quarterValue;

        // Collect input values
        config.fields.forEach(field => {
            const input = document.getElementById(field.id);
            const value = parseFloat(input.value) || 0;
            values[field.key] = value;
            
            if (field.required && value <= 0) {
                allValid = false;
            }
        });

        if (!allValid) {
            alert(`Please enter valid values for all required fields.`);
            return;
        }

        // Calculate result using provided function
        const result = config.calculateFunction(values);
        
        // Display result
        document.getElementById('resultValue').textContent = result.toFixed(2);
        document.getElementById('calculationResult').style.display = 'block';
        
        // Store result
        this.popupCore.calculationResults[config.key] = result.toFixed(2);
    }

    /**
     * Validate input values
     */
    validateInputs(config) {
        const errors = [];
        
        config.fields.forEach(field => {
            const input = document.getElementById(field.id);
            const value = parseFloat(input.value) || 0;
            
            if (field.required && value <= 0) {
                errors.push(`${field.label} is required and must be greater than 0`);
            }
            
            if (field.min && value < field.min) {
                errors.push(`${field.label} must be at least ${field.min}`);
            }
            
            if (field.max && value > field.max) {
                errors.push(`${field.label} must not exceed ${field.max}`);
            }
        });
        
        return errors;
    }

    /**
     * Format calculation result
     */
    formatResult(value, config) {
        const formattedValue = parseFloat(value).toFixed(config.decimalPlaces || 2);
        return `${formattedValue}${config.resultUnit || ''}`;
    }

    /**
     * Get calculation summary
     */
    getCalculationSummary(config, values, result) {
        return {
            kpiType: config.key.toUpperCase(),
            title: config.title,
            inputs: values,
            result: result,
            timestamp: new Date().toISOString(),
            formula: config.formula
        };
    }
}

// Export for use in other modules
window.KPICalculationEngine = KPICalculationEngine;