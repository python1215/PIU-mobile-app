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
        console.log('KPI Calculation Engine - calculate called with config:', config);
        
        const values = {};
        let allValid = true;

        // Collect quarter value
        const quarterSelect = document.getElementById('quarterSelect');
        if (quarterSelect) {
            const quarterValue = quarterSelect.value;
            if (!quarterValue) {
                alert('Please select a quarter.');
                return;
            }
            values.quarter = quarterValue;
        }

        // Get baseline and achieved values for progress calculation
        const baselineInput = document.getElementById('baseline_value');
        const achievedResult = document.getElementById('achieved_value');
        
        let baselineValue = null;
        let achievedValue = null;
        
        if (baselineInput) {
            baselineValue = parseFloat(baselineInput.value) || 0;
            values.baseline_value = baselineValue;
        }
        
        if (achievedResult) {
            achievedValue = parseFloat(achievedResult.value) || 0;
            values.achieved_value = achievedValue;
        }

        // Collect input values
        if (config.fields && Array.isArray(config.fields)) {
            config.fields.forEach(field => {
                // Try multiple field ID formats
                const fieldIds = [
                    field.id,
                    field.name,
                    `${config.type.toLowerCase()}-${field.name}`,
                    `${config.key}-${field.name}`
                ];
                
                let input = null;
                let foundId = null;
                
                for (const id of fieldIds) {
                    if (id) {
                        input = document.getElementById(id);
                        if (input) {
                            foundId = id;
                            break;
                        }
                    }
                }
                
                if (input) {
                    const rawValue = input.value ? input.value.trim() : '';
                    console.log(`Field ${foundId}: raw value = "${rawValue}"`);
                    
                    // Parse the value
                    let value;
                    if (rawValue === '' || rawValue === null || rawValue === undefined) {
                        value = 0;
                    } else {
                        value = parseFloat(rawValue);
                        if (isNaN(value)) {
                            console.warn(`Field ${foundId}: could not parse "${rawValue}" as number, using 0`);
                            value = 0;
                        }
                    }
                    
                    values[field.name] = value;
                    console.log(`Field ${foundId} → ${field.name}: final value = ${value}`);
                    
                    if (field.required && value <= 0) {
                        console.warn(`Field ${foundId}: required field has invalid value ${value}`);
                        allValid = false;
                    }
                } else {
                    console.warn(`Field not found. Tried IDs:`, fieldIds);
                }
            });
        } else {
            console.warn('No fields defined in config:', config);
        }

        if (!allValid) {
            alert(`Please enter valid values for all required fields.`);
            return;
        }

        try {
            // Calculate result using provided function
            let result;
            if (typeof config.calculateFunction === 'function') {
                result = config.calculateFunction(values);
            } else if (typeof config.calculate === 'function') {
                result = config.calculate(values);
            } else {
                console.error('No calculation function found in config');
                alert('Calculation function not found. Please check the configuration.');
                return;
            }
            
            console.log('Raw calculation result:', result);
            console.log('Input values used:', values);
            
            // Validate result
            if (result === undefined || result === null || isNaN(result) || !isFinite(result)) {
                console.error('Invalid calculation result:', result);
                alert('Calculation produced an invalid result. Please check your input values and try again.');
                return;
            }
            
            // Ensure result is a number
            result = parseFloat(result);
            if (isNaN(result)) {
                console.error('Result could not be converted to number:', result);
                alert('Calculation error: Result is not a valid number.');
                return;
            }
            
            console.log('Final validated result:', result);
            
            // Display result
            const resultElement = document.getElementById('resultValue');
            const resultContainer = document.getElementById('calculationResult');
            
            if (resultElement) {
                resultElement.textContent = result.toFixed(2);
            }
            if (resultContainer) {
                resultContainer.style.display = 'block';
            }
            

            
            // Store result
            if (this.popupCore && this.popupCore.calculationResults) {
                this.popupCore.calculationResults[config.key] = result;
            }
            
            // Also store globally for compatibility
            window.currentKPIResult = {
                value: result,
                type: config.key,
                data: values,
                quarter: values.quarter
            };
            
        } catch (error) {
            console.error('Calculation error:', error);
            console.error('Error details:', error.message);
            console.error('Input values:', values);
            alert('Error performing calculation: ' + error.message + '. Please check your input values.');
        }
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