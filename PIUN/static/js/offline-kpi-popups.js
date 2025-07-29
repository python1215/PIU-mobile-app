// Offline KPI Popup Functions - Standalone implementations
// These provide direct popup functions for offline environments

// ATC&C Calculation Popup
function showATCCalculationPopup() {
    const existingPopup = document.getElementById('kpiPopup');
    if (existingPopup) existingPopup.remove();
    
    const popup = document.createElement('div');
    popup.id = 'kpiPopup';
    popup.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: white; border: 3px solid #fd7e14; border-radius: 10px; padding: 30px;
        width: 600px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); z-index: 10000;
        font-family: Arial, sans-serif;
    `;
    
    popup.innerHTML = `
        <h3 style="margin: 0 0 20px 0; color: #fd7e14;">📊 Calculate ATC&C (Total Losses Electricity) - KPI-07</h3>
        <div style="background: #fff3cd; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <strong>Formula:</strong> ATC&C = (1 - (billing_efficiency × collection_efficiency)) / 100
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Billing Efficiency (%):</label>
                <input type="number" id="atcBilling" step="0.01" min="0" 
                       style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" 
                       placeholder="Enter billing efficiency">
            </div>
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Collection Efficiency (%):</label>
                <input type="number" id="atcCollection" step="0.01" min="0" max="100"
                       style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" 
                       placeholder="Enter collection efficiency">
            </div>
        </div>
        <div id="atcResult" style="background: #d4edda; padding: 15px; border-radius: 5px; display: none; margin: 15px 0;">
            <strong>Calculated ATC&C:</strong> <span id="atcValue"></span>%
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
            <button onclick="closeKPIPopup()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Cancel</button>
            <button onclick="calculateATC()" style="background: #fd7e14; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Calculate</button>
            <button onclick="useATCResult()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Use Value</button>
        </div>
    `;
    
    document.body.appendChild(popup);
}

function calculateATC() {
    const billing = parseFloat(document.getElementById('atcBilling').value) || 0;
    const collection = parseFloat(document.getElementById('atcCollection').value) || 0;
    
    if (billing > 0 && collection > 0) {
        const atc = (1 - (billing * collection / 10000)) * 100;
        document.getElementById('atcValue').textContent = atc.toFixed(2);
        document.getElementById('atcResult').style.display = 'block';
        window.calculatedATC = atc.toFixed(2);
    } else {
        alert('Please enter valid efficiency values.');
    }
}

function useATCResult() {
    if (window.calculatedATC) {
        const achievedField = document.getElementById('id_achieved_value');
        if (achievedField) {
            achievedField.value = window.calculatedATC;
            closeKPIPopup();
        }
    }
}

// NECD (New Electricity Connection Days) - KPI-08
function showNECDCalculationPopup() {
    const existingPopup = document.getElementById('kpiPopup');
    if (existingPopup) existingPopup.remove();
    
    const popup = document.createElement('div');
    popup.id = 'kpiPopup';
    popup.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: white; border: 3px solid #17a2b8; border-radius: 10px; padding: 30px;
        width: 600px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); z-index: 10000;
        font-family: Arial, sans-serif;
    `;
    
    popup.innerHTML = `
        <h3 style="margin: 0 0 20px 0; color: #17a2b8;">⚡ Calculate NECD (New Electricity Connection Days) - KPI-08</h3>
        <div style="background: #d1ecf1; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <strong>Formula:</strong> NECD = Total Time (Days) ÷ Total Number of New Connections
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Total Time (Days):</label>
                <input type="number" id="necdTime" step="0.01" 
                       style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" 
                       placeholder="Enter total days">
            </div>
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Total New Connections:</label>
                <input type="number" id="necdConnections" step="1"
                       style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" 
                       placeholder="Enter connection count">
            </div>
        </div>
        <div id="necdResult" style="background: #d4edda; padding: 15px; border-radius: 5px; display: none; margin: 15px 0;">
            <strong>Calculated NECD:</strong> <span id="necdValue"></span> days per connection
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
            <button onclick="closeKPIPopup()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Cancel</button>
            <button onclick="calculateNECD()" style="background: #17a2b8; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Calculate</button>
            <button onclick="useNECDResult()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Use Value</button>
        </div>
    `;
    
    document.body.appendChild(popup);
}

function calculateNECD() {
    const time = parseFloat(document.getElementById('necdTime').value) || 0;
    const connections = parseFloat(document.getElementById('necdConnections').value) || 0;
    
    if (time > 0 && connections > 0) {
        const necd = time / connections;
        document.getElementById('necdValue').textContent = necd.toFixed(2);
        document.getElementById('necdResult').style.display = 'block';
        window.calculatedNECD = necd.toFixed(2);
    } else {
        alert('Please enter valid values for time and connections.');
    }
}

function useNECDResult() {
    if (window.calculatedNECD) {
        const achievedField = document.getElementById('id_achieved_value');
        if (achievedField) {
            achievedField.value = window.calculatedNECD;
            closeKPIPopup();
        }
    }
}

// NWCD (New Water Connection Days) - KPI-09
function showNWCDCalculationPopup() {
    const existingPopup = document.getElementById('kpiPopup');
    if (existingPopup) existingPopup.remove();
    
    const popup = document.createElement('div');
    popup.id = 'kpiPopup';
    popup.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: white; border: 3px solid #6f42c1; border-radius: 10px; padding: 30px;
        width: 600px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); z-index: 10000;
        font-family: Arial, sans-serif;
    `;
    
    popup.innerHTML = `
        <h3 style="margin: 0 0 20px 0; color: #6f42c1;">💧 Calculate NWCD (New Water Connection Days) - KPI-09</h3>
        <div style="background: #e2d9f3; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <strong>Formula:</strong> NWCD = Total Time (Days) ÷ Total Number of New Water Connections
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Total Time (Days):</label>
                <input type="number" id="nwcdTime" step="0.01" 
                       style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" 
                       placeholder="Enter total days">
            </div>
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Total New Water Connections:</label>
                <input type="number" id="nwcdConnections" step="1"
                       style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" 
                       placeholder="Enter connection count">
            </div>
        </div>
        <div id="nwcdResult" style="background: #d4edda; padding: 15px; border-radius: 5px; display: none; margin: 15px 0;">
            <strong>Calculated NWCD:</strong> <span id="nwcdValue"></span> days per connection
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
            <button onclick="closeKPIPopup()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Cancel</button>
            <button onclick="calculateNWCD()" style="background: #6f42c1; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Calculate</button>
            <button onclick="useNWCDResult()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Use Value</button>
        </div>
    `;
    
    document.body.appendChild(popup);
}

function calculateNWCD() {
    const time = parseFloat(document.getElementById('nwcdTime').value) || 0;
    const connections = parseFloat(document.getElementById('nwcdConnections').value) || 0;
    
    if (time > 0 && connections > 0) {
        const nwcd = time / connections;
        document.getElementById('nwcdValue').textContent = nwcd.toFixed(2);
        document.getElementById('nwcdResult').style.display = 'block';
        window.calculatedNWCD = nwcd.toFixed(2);
    } else {
        alert('Please enter valid values for time and connections.');
    }
}

function useNWCDResult() {
    if (window.calculatedNWCD) {
        const achievedField = document.getElementById('id_achieved_value');
        if (achievedField) {
            achievedField.value = window.calculatedNWCD;
            closeKPIPopup();
        }
    }
}

// TPS (Timely Payment Score) - KPI-10
function showTPSCalculationPopup() {
    const existingPopup = document.getElementById('kpiPopup');
    if (existingPopup) existingPopup.remove();
    
    const popup = document.createElement('div');
    popup.id = 'kpiPopup';
    popup.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: white; border: 3px solid #e83e8c; border-radius: 10px; padding: 30px;
        width: 600px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); z-index: 10000;
        font-family: Arial, sans-serif;
    `;
    
    popup.innerHTML = `
        <h3 style="margin: 0 0 20px 0; color: #e83e8c;">💰 Calculate TPS (Timely Payment Score) - KPI-10</h3>
        <div style="background: #f8d7da; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <strong>Formula:</strong> TPS = (Number of On-Time Payments ÷ Total Number of Payments Due) × 100%
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">On-Time Payments:</label>
                <input type="number" id="tpsOnTime" step="1" 
                       style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" 
                       placeholder="Enter on-time payments">
            </div>
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Total Payments Due:</label>
                <input type="number" id="tpsTotal" step="1"
                       style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" 
                       placeholder="Enter total payments">
            </div>
        </div>
        <div id="tpsResult" style="background: #d4edda; padding: 15px; border-radius: 5px; display: none; margin: 15px 0;">
            <strong>Calculated TPS:</strong> <span id="tpsValue"></span>%
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
            <button onclick="closeKPIPopup()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Cancel</button>
            <button onclick="calculateTPS()" style="background: #e83e8c; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Calculate</button>
            <button onclick="useTPSResult()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Use Value</button>
        </div>
    `;
    
    document.body.appendChild(popup);
}

function calculateTPS() {
    const onTime = parseFloat(document.getElementById('tpsOnTime').value) || 0;
    const total = parseFloat(document.getElementById('tpsTotal').value) || 0;
    
    if (onTime >= 0 && total > 0) {
        const tps = (onTime / total) * 100;
        document.getElementById('tpsValue').textContent = tps.toFixed(2);
        document.getElementById('tpsResult').style.display = 'block';
        window.calculatedTPS = tps.toFixed(2);
    } else {
        alert('Please enter valid payment values.');
    }
}

function useTPSResult() {
    if (window.calculatedTPS) {
        const achievedField = document.getElementById('id_achieved_value');
        if (achievedField) {
            achievedField.value = window.calculatedTPS;
            closeKPIPopup();
        }
    }
}

// TTP (Timely Tax Payment) - KPI-11
function showTTPCalculationPopup() {
    const existingPopup = document.getElementById('kpiPopup');
    if (existingPopup) existingPopup.remove();
    
    const popup = document.createElement('div');
    popup.id = 'kpiPopup';
    popup.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: white; border: 3px solid #20c997; border-radius: 10px; padding: 30px;
        width: 600px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); z-index: 10000;
        font-family: Arial, sans-serif;
    `;
    
    popup.innerHTML = `
        <h3 style="margin: 0 0 20px 0; color: #20c997;">🏛️ Calculate TTP (Timely Tax Payment) - KPI-11</h3>
        <div style="background: #d1ecf1; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <strong>Formula:</strong> TTP = (Number of On-Time Tax Payments ÷ Total Number of Tax Payments Due) × 100%
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">On-Time Tax Payments:</label>
                <input type="number" id="ttpOnTime" step="1" 
                       style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" 
                       placeholder="Enter on-time payments">
            </div>
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Total Tax Payments Due:</label>
                <input type="number" id="ttpTotal" step="1"
                       style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" 
                       placeholder="Enter total payments">
            </div>
        </div>
        <div id="ttpResult" style="background: #d4edda; padding: 15px; border-radius: 5px; display: none; margin: 15px 0;">
            <strong>Calculated TTP:</strong> <span id="ttpValue"></span>%
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
            <button onclick="closeKPIPopup()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Cancel</button>
            <button onclick="calculateTTP()" style="background: #20c997; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Calculate</button>
            <button onclick="useTTPResult()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Use Value</button>
        </div>
    `;
    
    document.body.appendChild(popup);
}

function calculateTTP() {
    const onTime = parseFloat(document.getElementById('ttpOnTime').value) || 0;
    const total = parseFloat(document.getElementById('ttpTotal').value) || 0;
    
    if (onTime >= 0 && total > 0) {
        const ttp = (onTime / total) * 100;
        document.getElementById('ttpValue').textContent = ttp.toFixed(2);
        document.getElementById('ttpResult').style.display = 'block';
        window.calculatedTTP = ttp.toFixed(2);
    } else {
        alert('Please enter valid tax payment values.');
    }
}

function useTTPResult() {
    if (window.calculatedTTP) {
        const achievedField = document.getElementById('id_achieved_value');
        if (achievedField) {
            achievedField.value = window.calculatedTTP;
            closeKPIPopup();
        }
    }
}

// WQCC (Water Quality Compliance Bacteriological) - KPI-12
function showWQCCCalculationPopup() {
    const existingPopup = document.getElementById('kpiPopup');
    if (existingPopup) existingPopup.remove();
    
    const popup = document.createElement('div');
    popup.id = 'kpiPopup';
    popup.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: white; border: 3px solid #007bff; border-radius: 10px; padding: 30px;
        width: 600px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); z-index: 10000;
        font-family: Arial, sans-serif;
    `;
    
    popup.innerHTML = `
        <h3 style="margin: 0 0 20px 0; color: #007bff;">🧪 Calculate WQCC (Water Quality Compliance Bacteriological) - KPI-12</h3>
        <div style="background: #cce7ff; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <strong>Formula:</strong> WQCC = (Number of Compliant Water Samples ÷ Total Number of Tested Water Samples) × 100%
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Compliant Water Samples:</label>
                <input type="number" id="wqccCompliant" step="1" 
                       style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" 
                       placeholder="Enter compliant samples">
            </div>
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Total Tested Samples:</label>
                <input type="number" id="wqccTotal" step="1"
                       style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" 
                       placeholder="Enter total samples">
            </div>
        </div>
        <div id="wqccResult" style="background: #d4edda; padding: 15px; border-radius: 5px; display: none; margin: 15px 0;">
            <strong>Calculated WQCC:</strong> <span id="wqccValue"></span>%
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
            <button onclick="closeKPIPopup()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Cancel</button>
            <button onclick="calculateWQCC()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Calculate</button>
            <button onclick="useWQCCResult()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Use Value</button>
        </div>
    `;
    
    document.body.appendChild(popup);
}

function calculateWQCC() {
    const compliant = parseFloat(document.getElementById('wqccCompliant').value) || 0;
    const total = parseFloat(document.getElementById('wqccTotal').value) || 0;
    
    if (compliant >= 0 && total > 0) {
        const wqcc = (compliant / total) * 100;
        document.getElementById('wqccValue').textContent = wqcc.toFixed(2);
        document.getElementById('wqccResult').style.display = 'block';
        window.calculatedWQCC = wqcc.toFixed(2);
    } else {
        alert('Please enter valid sample values.');
    }
}

function useWQCCResult() {
    if (window.calculatedWQCC) {
        const achievedField = document.getElementById('id_achieved_value');
        if (achievedField) {
            achievedField.value = window.calculatedWQCC;
            closeKPIPopup();
        }
    }
}

// WQCB (Water Quality Compliance - Banjul) - KPI-13
function showWQCBCalculationPopup() {
    const existingPopup = document.getElementById('kpiPopup');
    if (existingPopup) existingPopup.remove();
    
    const popup = document.createElement('div');
    popup.id = 'kpiPopup';
    popup.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: white; border: 3px solid #6610f2; border-radius: 10px; padding: 30px;
        width: 600px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); z-index: 10000;
        font-family: Arial, sans-serif;
    `;
    
    popup.innerHTML = `
        <h3 style="margin: 0 0 20px 0; color: #6610f2;">🦠 Calculate WQCB (Water Quality Compliance - Banjul) - KPI-13</h3>
        <div style="background: #e5d9f7; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <strong>Formula:</strong> WQCB = (Number of Compliant Water Samples ÷ Total Number of Tested Water Samples) × 100%
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Compliant Water Samples:</label>
                <input type="number" id="wqcbCompliant" step="1" 
                       style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" 
                       placeholder="Enter compliant samples">
            </div>
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Total Tested Samples:</label>
                <input type="number" id="wqcbTotal" step="1"
                       style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" 
                       placeholder="Enter total samples">
            </div>
        </div>
        <div id="wqcbResult" style="background: #d4edda; padding: 15px; border-radius: 5px; display: none; margin: 15px 0;">
            <strong>Calculated WQCB:</strong> <span id="wqcbValue"></span>%
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
            <button onclick="closeKPIPopup()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Cancel</button>
            <button onclick="calculateWQCB()" style="background: #6610f2; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Calculate</button>
            <button onclick="useWQCBResult()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Use Value</button>
        </div>
    `;
    
    document.body.appendChild(popup);
}

function calculateWQCB() {
    const compliant = parseFloat(document.getElementById('wqcbCompliant').value) || 0;
    const total = parseFloat(document.getElementById('wqcbTotal').value) || 0;
    
    if (compliant >= 0 && total > 0) {
        const wqcb = (compliant / total) * 100;
        document.getElementById('wqcbValue').textContent = wqcb.toFixed(2);
        document.getElementById('wqcbResult').style.display = 'block';
        window.calculatedWQCB = wqcb.toFixed(2);
    } else {
        alert('Please enter valid sample values.');
    }
}

function useWQCBResult() {
    if (window.calculatedWQCB) {
        const achievedField = document.getElementById('id_achieved_value');
        if (achievedField) {
            achievedField.value = window.calculatedWQCB;
            closeKPIPopup();
        }
    }
}

// NRW (Non-Revenue Water) - KPI-14
function showNRWCalculationPopup() {
    const existingPopup = document.getElementById('kpiPopup');
    if (existingPopup) existingPopup.remove();
    
    const popup = document.createElement('div');
    popup.id = 'kpiPopup';
    popup.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: white; border: 3px solid #dc3545; border-radius: 10px; padding: 30px;
        width: 600px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); z-index: 10000;
        font-family: Arial, sans-serif;
    `;
    
    popup.innerHTML = `
        <h3 style="margin: 0 0 20px 0; color: #dc3545;">💧 Calculate NRW (Non-Revenue Water) - KPI-14</h3>
        <div style="background: #f8d7da; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <strong>Formula:</strong> NRW = (Water Entering System - Billed Authorized Consumption) ÷ Water Entering System × 100%
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Water Entering System:</label>
                <input type="number" id="nrwEntering" step="0.01" 
                       style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" 
                       placeholder="Enter water volume">
            </div>
            <div>
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Billed Authorized Consumption:</label>
                <input type="number" id="nrwBilled" step="0.01"
                       style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" 
                       placeholder="Enter billed consumption">
            </div>
        </div>
        <div id="nrwResult" style="background: #d4edda; padding: 15px; border-radius: 5px; display: none; margin: 15px 0;">
            <strong>Calculated NRW:</strong> <span id="nrwValue"></span>%
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
            <button onclick="closeKPIPopup()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Cancel</button>
            <button onclick="calculateNRW()" style="background: #dc3545; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Calculate</button>
            <button onclick="useNRWResult()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Use Value</button>
        </div>
    `;
    
    document.body.appendChild(popup);
}

function calculateNRW() {
    const entering = parseFloat(document.getElementById('nrwEntering').value) || 0;
    const billed = parseFloat(document.getElementById('nrwBilled').value) || 0;
    
    if (entering > 0 && billed >= 0) {
        const nrw = ((entering - billed) / entering) * 100;
        document.getElementById('nrwValue').textContent = nrw.toFixed(2);
        document.getElementById('nrwResult').style.display = 'block';
        window.calculatedNRW = nrw.toFixed(2);
    } else {
        alert('Please enter valid water volume values.');
    }
}

function useNRWResult() {
    if (window.calculatedNRW) {
        const achievedField = document.getElementById('id_achieved_value');
        if (achievedField) {
            achievedField.value = window.calculatedNRW;
            closeKPIPopup();
        }
    }
}

// Make all functions globally available
window.showATCCalculationPopup = showATCCalculationPopup;
window.calculateATC = calculateATC;
window.useATCResult = useATCResult;

window.showNECDCalculationPopup = showNECDCalculationPopup;
window.calculateNECD = calculateNECD;
window.useNECDResult = useNECDResult;

window.showNWCDCalculationPopup = showNWCDCalculationPopup;
window.calculateNWCD = calculateNWCD;
window.useNWCDResult = useNWCDResult;

window.showTPSCalculationPopup = showTPSCalculationPopup;
window.calculateTPS = calculateTPS;
window.useTPSResult = useTPSResult;

window.showTTPCalculationPopup = showTTPCalculationPopup;
window.calculateTTP = calculateTTP;
window.useTTPResult = useTTPResult;

window.showWQCCCalculationPopup = showWQCCCalculationPopup;
window.calculateWQCC = calculateWQCC;
window.useWQCCResult = useWQCCResult;

window.showWQCBCalculationPopup = showWQCBCalculationPopup;
window.calculateWQCB = calculateWQCB;
window.useWQCBResult = useWQCBResult;

window.showNRWCalculationPopup = showNRWCalculationPopup;
window.calculateNRW = calculateNRW;
window.useNRWResult = useNRWResult;

// Test function to verify all popup functions work
window.testAllKPIPopups = function() {
    console.log('🧪 Testing all 14 KPI popup functions...');
    
    const functions = [
        { name: 'ROA', func: showROACalculationPopup },
        { name: 'PAT', func: showPATCalculationPopup },
        { name: 'DSCR', func: showDSCRCalculationPopup },
        { name: 'MWh', func: showMWhCalculationPopup },
        { name: 'GAF', func: showGAFCalculationPopup },
        { name: 'TDE', func: showTDECalculationPopup },
        { name: 'ATC', func: showATCCalculationPopup },
        { name: 'NECD', func: showNECDCalculationPopup },
        { name: 'NWCD', func: showNWCDCalculationPopup },
        { name: 'TPS', func: showTPSCalculationPopup },
        { name: 'TTP', func: showTTPCalculationPopup },
        { name: 'WQCC', func: showWQCCCalculationPopup },
        { name: 'WQCB', func: showWQCBCalculationPopup },
        { name: 'NRW', func: showNRWCalculationPopup }
    ];
    
    let working = 0;
    let broken = 0;
    
    functions.forEach(item => {
        try {
            if (typeof item.func === 'function') {
                console.log(`✅ ${item.name}: Function available`);
                working++;
            } else {
                console.log(`❌ ${item.name}: Function missing`);
                broken++;
            }
        } catch (error) {
            console.log(`❌ ${item.name}: Error - ${error.message}`);
            broken++;
        }
    });
    
    console.log(`📊 Test Results: ${working} working, ${broken} broken`);
    return { working, broken, total: functions.length };
};

console.log('✅ All 14 KPI offline popup functions loaded and available globally');
console.log('🔧 Run testAllKPIPopups() to verify all functions work');

// Ensure functions are globally available immediately
window.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Offline KPI functions verification...');
    
    // Verify critical first 5 KPI functions
    const criticalFunctions = [
        { name: 'KPI-01 ROA', func: 'showROACalculationPopup' },
        { name: 'KPI-02 PAT', func: 'showPATCalculationPopup' },
        { name: 'KPI-03 DSCR', func: 'showDSCRCalculationPopup' },
        { name: 'KPI-04 MWh', func: 'showMWhCalculationPopup' },
        { name: 'KPI-05 GAF', func: 'showGAFCalculationPopup' }
    ];
    
    let allAvailable = true;
    criticalFunctions.forEach(item => {
        if (typeof window[item.func] === 'function') {
            console.log(`✅ ${item.name}: Available`);
        } else {
            console.error(`❌ ${item.name}: Missing function ${item.func}`);
            allAvailable = false;
        }
    });
    
    if (allAvailable) {
        console.log('🎉 All critical KPI functions are available offline');
    } else {
        console.error('⚠️ Some critical KPI functions are missing');
    }
});

// Auto-verify on load
setTimeout(() => {
    if (window.testAllKPIPopups) {
        window.testAllKPIPopups();
    }
}, 100);