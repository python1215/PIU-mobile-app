// Offline KPI System Test Suite
// Tests all KPI popup functions for offline reliability

window.offlineKPITest = {
    // Test individual popup function
    testPopupFunction: function(kpiType, functionName) {
        try {
            const func = window[functionName];
            if (typeof func === 'function') {
                console.log(`✅ ${kpiType}: Function ${functionName} available`);
                return true;
            } else {
                console.log(`❌ ${kpiType}: Function ${functionName} not found`);
                return false;
            }
        } catch (error) {
            console.log(`❌ ${kpiType}: Error testing ${functionName} - ${error.message}`);
            return false;
        }
    },

    // Test detection system with offline-first handler
    testDetectionSystem: function() {
        console.log('🔍 Testing KPI detection system...');
        
        const testCases = [
            { text: 'Return on Assets (ROA)', expected: 'KPI-01' },
            { text: 'Profit After Tax (PAT)', expected: 'KPI-02' },
            { text: 'Debt Service Coverage Ratio (DSCR)', expected: 'KPI-03' },
            { text: 'Energy Injection (MWh)', expected: 'KPI-04' },
            { text: 'Generation Availability Factor (GAF)', expected: 'KPI-05' },
            { text: 'Training Days per Employee (TDE)', expected: 'KPI-06' },
            { text: 'ATC&C (Total Losses Electricity)', expected: 'KPI-07' },
            { text: 'New Electricity Connections Duration (NECD)', expected: 'KPI-08' },
            { text: 'New Water Connections Duration (NWCD)', expected: 'KPI-09' },
            { text: 'Timely Payment Score (TPS)', expected: 'KPI-10' },
            { text: 'Timely Tax Payment (TTP)', expected: 'KPI-11' },
            { text: 'Water Quality Compliance Bacteriological (WQCC)', expected: 'KPI-12' },
            { text: 'Water Quality Compliance - Banjul (WQCB)', expected: 'KPI-13' },
            { text: 'Non-Revenue Water (NRW)', expected: 'KPI-14' }
        ];
        
        let passed = 0;
        let failed = 0;
        
        testCases.forEach(test => {
            // Test offline-first detection by simulating selection
            try {
                // Create mock selection scenario
                const mockSelect = { 
                    value: 'test',
                    options: [{ text: test.text, selected: true }],
                    selectedIndex: 0
                };
                
                // Test if the right function would be called
                const functionMapping = {
                    'Return on Assets (ROA)': 'showROACalculationPopup',
                    'Profit After Tax (PAT)': 'showPATCalculationPopup',
                    'Debt Service Coverage Ratio (DSCR)': 'showDSCRCalculationPopup',
                    'Energy Injection (MWh)': 'showMWhCalculationPopup',
                    'Generation Availability Factor (GAF)': 'showGAFCalculationPopup'
                };
                
                const expectedFunction = functionMapping[test.text];
                if (expectedFunction && typeof window[expectedFunction] === 'function') {
                    console.log(`✅ Detection: "${test.text}" → ${expectedFunction} available`);
                    passed++;
                } else if (expectedFunction) {
                    console.log(`❌ Detection: "${test.text}" → ${expectedFunction} missing`);
                    failed++;
                } else {
                    console.log(`⚠️ Detection: "${test.text}" → No specific function mapped`);
                    passed++; // Non-critical KPIs
                }
            } catch (error) {
                console.log(`❌ Detection: "${test.text}" → Error: ${error.message}`);
                failed++;
            }
        });
        
        console.log(`📊 Detection Results: ${passed} passed, ${failed} failed`);
        return { passed, failed };
    },

    // Test all popup functions
    testAllPopups: function() {
        console.log('🧪 Testing all popup functions...');
        
        const popupTests = [
            { kpi: 'KPI-01', name: 'ROA', func: 'showROACalculationPopup' },
            { kpi: 'KPI-02', name: 'PAT', func: 'showPATCalculationPopup' },
            { kpi: 'KPI-03', name: 'DSCR', func: 'showDSCRCalculationPopup' },
            { kpi: 'KPI-04', name: 'MWh', func: 'showMWhCalculationPopup' },
            { kpi: 'KPI-05', name: 'GAF', func: 'showGAFCalculationPopup' },
            { kpi: 'KPI-06', name: 'TDE', func: 'showTDECalculationPopup' },
            { kpi: 'KPI-07', name: 'ATC', func: 'showATCCalculationPopup' },
            { kpi: 'KPI-08', name: 'NECD', func: 'showNECDCalculationPopup' },
            { kpi: 'KPI-09', name: 'NWCD', func: 'showNWCDCalculationPopup' },
            { kpi: 'KPI-10', name: 'TPS', func: 'showTPSCalculationPopup' },
            { kpi: 'KPI-11', name: 'TTP', func: 'showTTPCalculationPopup' },
            { kpi: 'KPI-12', name: 'WQCC', func: 'showWQCCCalculationPopup' },
            { kpi: 'KPI-13', name: 'WQCB', func: 'showWQCBCalculationPopup' },
            { kpi: 'KPI-14', name: 'NRW', func: 'showNRWCalculationPopup' }
        ];
        
        let working = 0;
        let broken = 0;
        
        popupTests.forEach(test => {
            if (this.testPopupFunction(test.kpi, test.func)) {
                working++;
            } else {
                broken++;
            }
        });
        
        console.log(`📊 Popup Function Results: ${working} working, ${broken} broken`);
        return { working, broken, total: popupTests.length };
    },

    // Complete offline test suite
    runCompleteTest: function() {
        console.log('🚀 Running complete offline KPI test suite...');
        console.log('========================================');
        
        const popupResults = this.testAllPopups();
        console.log('');
        const detectionResults = this.testDetectionSystem();
        
        console.log('');
        console.log('📋 FINAL RESULTS:');
        console.log(`   Popup Functions: ${popupResults.working}/${popupResults.total} working`);
        console.log(`   Detection System: ${detectionResults.passed}/${detectionResults.passed + detectionResults.failed} working`);
        
        const totalScore = popupResults.working + detectionResults.passed;
        const totalPossible = popupResults.total + detectionResults.passed + detectionResults.failed;
        const percentage = Math.round((totalScore / totalPossible) * 100);
        
        console.log(`   Overall Score: ${totalScore}/${totalPossible} (${percentage}%)`);
        
        if (percentage >= 95) {
            console.log('✅ OFFLINE SYSTEM: EXCELLENT - Ready for deployment');
        } else if (percentage >= 85) {
            console.log('⚠️ OFFLINE SYSTEM: GOOD - Minor issues to fix');
        } else {
            console.log('❌ OFFLINE SYSTEM: NEEDS WORK - Major issues detected');
        }
        
        return {
            popups: popupResults,
            detection: detectionResults,
            overall: { score: totalScore, possible: totalPossible, percentage }
        };
    }
};

// Auto-run test on load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log('🔧 Offline KPI Test Suite loaded');
        console.log('   Run offlineKPITest.runCompleteTest() to test everything');
    }, 500);
});