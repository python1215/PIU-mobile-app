/**
 * Simple KPI Calculator - Direct Implementation
 * Replaces complex modular system with straightforward approach
 */

// Global KPI calculator object
window.SimpleKPICalculator = {
    
    // Current popup reference
    currentPopup: null,
    
    // Show MWh calculation popup
    showMWhPopup: function() {
        this.closeCurrentPopup();
        
        const popup = document.createElement('div');
        popup.id = 'kpi-popup';
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border: 3px solid #ffc107;
            border-radius: 10px;
            padding: 30px;
            width: 600px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        
        popup.innerHTML = `
            <h3 style="margin: 0 0 20px 0; color: #333;">
                ⚡ Energy Injection (MWh) Calculation
            </h3>
            <div style="margin-bottom: 15px;">
                <strong>Formula:</strong> E_total = Σ(Ai × Bi) where A=Power Injected, B=Time Duration
            </div>
            
            <div id="power-time-pairs">
                <div class="power-time-pair" style="margin-bottom: 10px;">
                    <input type="number" id="power1" placeholder="Power Injected (MW)" 
                           style="width: 45%; padding: 8px; margin-right: 10px;" step="0.01">
                    <input type="number" id="time1" placeholder="Time Duration (Hours)" 
                           style="width: 45%; padding: 8px;" step="0.01">
                </div>
                <div class="power-time-pair" style="margin-bottom: 10px;">
                    <input type="number" id="power2" placeholder="Power Injected (MW)" 
                           style="width: 45%; padding: 8px; margin-right: 10px;" step="0.01">
                    <input type="number" id="time2" placeholder="Time Duration (Hours)" 
                           style="width: 45%; padding: 8px;" step="0.01">
                </div>
            </div>
            
            <div style="margin: 15px 0;">
                <label>Quarter:</label>
                <select id="quarter-select" style="width: 100%; padding: 8px; margin-top: 5px;">
                    <option value="">Select Quarter</option>
                    <option value="1">Q1 (January-March)</option>
                    <option value="2">Q2 (April-June)</option>
                    <option value="3">Q3 (July-September)</option>
                    <option value="4">Q4 (October-December)</option>
                </select>
            </div>
            
            <div id="calculation-result" style="display: none; margin: 15px 0; padding: 10px; background: #e8f5e8; border-radius: 5px;">
                <strong>Result: <span id="result-value">0.00</span> MWh</strong>
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
                <button onclick="SimpleKPICalculator.calculateMWh()" 
                        style="background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; margin-right: 10px; cursor: pointer;">
                    Calculate
                </button>
                <button onclick="SimpleKPICalculator.resetMWh()" 
                        style="background: #ffc107; color: black; padding: 10px 20px; border: none; border-radius: 5px; margin-right: 10px; cursor: pointer;">
                    Reset
                </button>
                <button onclick="SimpleKPICalculator.useMWhResult()" 
                        style="background: #28a745; color: white; padding: 10px 20px; border: none; border-radius: 5px; margin-right: 10px; cursor: pointer;">
                    Use Result
                </button>
                <button onclick="SimpleKPICalculator.closeCurrentPopup()" 
                        style="background: #dc3545; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
                    Close
                </button>
            </div>
        `;
        
        document.body.appendChild(popup);
        this.currentPopup = popup;
        
        // Focus on first input
        document.getElementById('power1').focus();
    },
    
    // Calculate MWh result
    calculateMWh: function() {
        const power1 = parseFloat(document.getElementById('power1').value) || 0;
        const time1 = parseFloat(document.getElementById('time1').value) || 0;
        const power2 = parseFloat(document.getElementById('power2').value) || 0;
        const time2 = parseFloat(document.getElementById('time2').value) || 0;
        const quarter = document.getElementById('quarter-select').value;
        
        if (!quarter) {
            alert('Please select a quarter.');
            return;
        }
        
        if (power1 <= 0 || time1 <= 0) {
            alert('Please enter valid values for at least the first power and time pair.');
            return;
        }
        
        // Calculate E_total = Σ(Ai × Bi)
        let totalMWh = (power1 * time1) + (power2 * time2);
        
        // Display result
        document.getElementById('result-value').textContent = totalMWh.toFixed(2);
        document.getElementById('calculation-result').style.display = 'block';
        
        // Store result for use
        this.lastResult = {
            value: totalMWh,
            quarter: quarter,
            type: 'MWh'
        };
        
        console.log('MWh calculation completed:', totalMWh);
    },
    
    // Reset MWh form
    resetMWh: function() {
        document.getElementById('power1').value = '';
        document.getElementById('time1').value = '';
        document.getElementById('power2').value = '';
        document.getElementById('time2').value = '';
        document.getElementById('quarter-select').value = '';
        document.getElementById('calculation-result').style.display = 'none';
        this.lastResult = null;
    },
    
    // Use MWh result
    useMWhResult: function() {
        if (!this.lastResult) {
            alert('Please calculate a result first.');
            return;
        }
        
        // Set the achieved value in the main form
        const achievedValueField = document.getElementById('id_achieved_value');
        if (achievedValueField) {
            achievedValueField.value = this.lastResult.value.toFixed(2);
            achievedValueField.style.backgroundColor = '#e8f5e8';
            
            // Trigger percentage calculations
            if (window.calculatePercentages) {
                window.calculatePercentages();
            }
        }
        
        // Close popup
        this.closeCurrentPopup();
        
        console.log('MWh result applied:', this.lastResult.value);
    },
    
    // Close current popup
    closeCurrentPopup: function() {
        if (this.currentPopup) {
            this.currentPopup.remove();
            this.currentPopup = null;
        }
    }
};

// Updated trigger function for KPI calculation
function triggerKPICalculationPopup() {
    const indicatorSelect = document.getElementById('id_indicator_description');
    if (!indicatorSelect || !indicatorSelect.value) {
        alert('Please select a KPI indicator first.');
        return;
    }
    
    const selectedText = indicatorSelect.options[indicatorSelect.selectedIndex].text.toLowerCase();
    console.log('Selected indicator:', selectedText);
    
    // Check for Energy Injection (MWh)
    if (selectedText.includes('energy injection') || selectedText.includes('mwh') || selectedText.includes('injection')) {
        SimpleKPICalculator.showMWhPopup();
        return;
    }
    
    // Default message for other KPIs
    alert('KPI calculation popup is currently configured for Energy Injection (MWh). Please select Energy Injection indicator to use the calculation feature.');
}

console.log('Simple KPI Calculator loaded successfully');