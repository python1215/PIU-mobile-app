/**
 * KPI Popup Configurations
 * Defines configuration objects for each KPI type
 */

const KPIConfigurations = {
    ROA: {
        key: 'roa',
        title: 'Calculate ROA (Return on Assets) - KPI-01',
        icon: '💰',
        theme: 'warning',
        titleColor: '#856404',
        formula: 'ROA = (Net Profit After Tax ÷ Total Assets) × 100',
        formulaBg: '#fff3cd',
        formulaBorder: '#ffeaa7',
        labelColor: '#856404',
        calculateBtnColor: '#ffc107',
        calculateBtnText: 'Calculate ROA',
        resultLabel: 'ROA Result',
        resultUnit: '%',
        resultName: 'ROA',
        fields: [
            {
                id: 'roaBaselineValue',
                key: 'baselineValue',
                label: 'Baseline Value',
                placeholder: 'Enter baseline value for comparison',
                required: false
            },
            {
                id: 'roaEndTargetValue',
                key: 'endTargetValue',
                label: 'End Target Value',
                placeholder: 'Enter target value to achieve',
                required: false
            },
            {
                id: 'roaNetProfit',
                key: 'netProfit',
                label: 'Net Profit After Tax',
                placeholder: 'Enter net profit after tax',
                required: true
            },
            {
                id: 'roaTotalAssets',
                key: 'totalAssets',
                label: 'Total Assets',
                placeholder: 'Enter total assets value',
                required: true
            },
            {
                id: 'roaQuarter',
                key: 'quarter',
                label: 'Quarter',
                type: 'select',
                options: [
                    {value: '1', text: 'Q1 (January-March)'},
                    {value: '2', text: 'Q2 (April-June)'},
                    {value: '3', text: 'Q3 (July-September)'},
                    {value: '4', text: 'Q4 (October-December)'}
                ],
                required: false
            }
        ],
        calculateFunction: (values) => {
            return (values.netProfit / values.totalAssets) * 100;
        }
    },

    PAT: {
        key: 'pat',
        title: 'Calculate PAT (Profit After Tax) - KPI-02',
        icon: '💼',
        theme: 'warning',
        titleColor: '#856404',
        formula: 'PAT = Total Revenue - Total Expenses - Tax Amount',
        formulaBg: '#fff3cd',
        formulaBorder: '#ffeaa7',
        labelColor: '#856404',
        calculateBtnColor: '#ffc107',
        calculateBtnText: 'Calculate PAT',
        resultLabel: 'PAT Result',
        resultUnit: '',
        resultName: 'PAT',
        gridColumns: '1fr',
        fields: [
            {
                id: 'patBaselineValue',
                key: 'baselineValue',
                label: 'Baseline Value',
                placeholder: 'Enter baseline value for comparison',
                required: false
            },
            {
                id: 'patEndTargetValue',
                key: 'endTargetValue',
                label: 'End Target Value',
                placeholder: 'Enter target value to achieve',
                required: false
            },
            {
                id: 'patRevenue',
                key: 'revenue',
                label: 'Total Revenue/Turnover',
                placeholder: 'Enter total revenue or turnover',
                required: true
            },
            {
                id: 'patExpenses',
                key: 'expenses',
                label: 'Total Expenses',
                placeholder: 'Enter total expenses',
                required: true
            },
            {
                id: 'patTax',
                key: 'tax',
                label: 'Tax Amount',
                placeholder: 'Enter tax amount',
                required: true
            },
            {
                id: 'patQuarter',
                key: 'quarter',
                label: 'Quarter',
                type: 'select',
                options: [
                    {value: '1', text: 'Q1 (January-March)'},
                    {value: '2', text: 'Q2 (April-June)'},
                    {value: '3', text: 'Q3 (July-September)'},
                    {value: '4', text: 'Q4 (October-December)'}
                ],
                required: false
            }
        ],
        calculateFunction: (values) => {
            return values.revenue - values.expenses - values.tax;
        }
    },

    DSCR: {
        key: 'dscr',
        title: 'Calculate DSCR (Debt Service Coverage Ratio) - KPI-03',
        icon: '📈',
        theme: 'warning',
        titleColor: '#856404',
        formula: 'DSCR = Net Operating Income ÷ Total Debt Service',
        formulaBg: '#fff3cd',
        formulaBorder: '#ffeaa7',
        labelColor: '#856404',
        calculateBtnColor: '#ffc107',
        calculateBtnText: 'Calculate DSCR',
        resultLabel: 'DSCR Result',
        resultUnit: '',
        resultName: 'DSCR',
        fields: [
            {
                id: 'dscrNetIncome',
                key: 'netIncome',
                label: 'Net Operating Income',
                placeholder: 'Enter net operating income',
                required: true
            },
            {
                id: 'dscrDebtService',
                key: 'debtService',
                label: 'Total Debt Service',
                placeholder: 'Enter total debt service',
                required: true
            }
        ],
        calculateFunction: (values) => {
            return values.netIncome / values.debtService;
        }
    },

    MWh: {
        key: 'mwh',
        title: 'Calculate Energy Injection (MWh) - KPI-04',
        icon: '⚡',
        theme: 'warning',
        titleColor: '#856404',
        formula: 'E_total = Σ(Ai × Bi) where A=Power Injected, B=Time Duration, i=1 to C sources',
        formulaBg: '#fff3cd',
        formulaBorder: '#ffeaa7',
        labelColor: '#856404',
        calculateBtnColor: '#ffc107',
        calculateBtnText: 'Calculate Energy Injection',
        resultLabel: 'Energy Injection Result',
        resultUnit: ' MWh',
        resultName: 'Energy Injection (MWh)',
        gridColumns: '1fr 1fr',
        fields: [
            {
                id: 'mwhPowerA1',
                key: 'powerA1',
                label: 'Power A₁ (MW)',
                placeholder: 'Enter power A₁',
                required: true
            },
            {
                id: 'mwhTimeB1',
                key: 'timeB1',
                label: 'Time B₁ (Hours)',
                placeholder: 'Enter time B₁',
                required: true
            },
            {
                id: 'mwhPowerA2',
                key: 'powerA2',
                label: 'Power A₂ (MW)',
                placeholder: 'Enter power A₂ (optional)',
                required: false
            },
            {
                id: 'mwhTimeB2',
                key: 'timeB2',
                label: 'Time B₂ (Hours)',
                placeholder: 'Enter time B₂ (optional)',
                required: false
            },
            {
                id: 'mwhPowerA3',
                key: 'powerA3',
                label: 'Power A₃ (MW)',
                placeholder: 'Enter power A₃ (optional)',
                required: false
            },
            {
                id: 'mwhTimeB3',
                key: 'timeB3',
                label: 'Time B₃ (Hours)',
                placeholder: 'Enter time B₃ (optional)',
                required: false
            }
        ],
        calculateFunction: (values) => {
            // E_total = Σ(Ai × Bi) for i=1 to C
            let etotal = 0;
            
            // Source 1 (required)
            if (values.powerA1 && values.timeB1) {
                etotal += values.powerA1 * values.timeB1;
            }
            
            // Source 2 (optional)
            if (values.powerA2 && values.timeB2) {
                etotal += values.powerA2 * values.timeB2;
            }
            
            // Source 3 (optional)
            if (values.powerA3 && values.timeB3) {
                etotal += values.powerA3 * values.timeB3;
            }
            
            return etotal;
        }
    },

    GAF: {
        key: 'gaf',
        title: 'Calculate GAF (Generation Availability Factor) - KPI-05',
        icon: '⚡',
        theme: 'warning',
        titleColor: '#856404',
        formula: 'GAF = (Total Available Hours ÷ Total Period Hours) × 100',
        formulaBg: '#fff3cd',
        formulaBorder: '#ffeaa7',
        labelColor: '#856404',
        calculateBtnColor: '#ffc107',
        calculateBtnText: 'Calculate GAF',
        resultLabel: 'GAF Result',
        resultUnit: '%',
        resultName: 'GAF',
        fields: [
            {
                id: 'gafAvailableHours',
                key: 'availableHours',
                label: 'Total Available Hours',
                placeholder: 'Enter available hours',
                required: true
            },
            {
                id: 'gafPeriodHours',
                key: 'periodHours',
                label: 'Total Period Hours',
                placeholder: 'Enter period hours',
                required: true
            }
        ],
        calculateFunction: (values) => {
            return (values.availableHours / values.periodHours) * 100;
        }
    },

    TDE: {
        key: 'tde',
        title: 'Calculate TDE (Training Days per Employee) - KPI-06',
        icon: '🎓',
        theme: 'info',
        titleColor: '#0c5460',
        formula: 'TDE = Total Training Days Conducted ÷ Total Number of Employees',
        formulaBg: '#d1ecf1',
        formulaBorder: '#bee5eb',
        labelColor: '#0c5460',
        calculateBtnColor: '#17a2b8',
        calculateBtnText: 'Calculate TDE',
        resultLabel: 'TDE Result',
        resultUnit: ' days/employee',
        resultName: 'TDE',
        fields: [
            {
                id: 'totalTrainingDays',
                key: 'totalTrainingDays',
                label: 'Total Training Days Conducted',
                placeholder: 'Enter total training days conducted',
                required: true
            },
            {
                id: 'totalEmployees',
                key: 'totalEmployees',
                label: 'Total Number of Employees',
                placeholder: 'Enter total number of employees',
                required: true
            }
        ],
        calculateFunction: (values) => {
            if (values.totalTrainingDays && values.totalEmployees && values.totalEmployees > 0) {
                return values.totalTrainingDays / values.totalEmployees;
            }
            return 0;
        }
    },

    ATC: {
        key: 'atc',
        title: 'Calculate ATC&C (Total Losses Electricity [ATC&C]) - KPI-07',
        icon: '🕐',
        theme: 'secondary',
        titleColor: '#495057',
        formula: 'ATC&C = (1-(billing_efficiency × collection_efficiency))/100',
        formulaBg: '#f8f9fa',
        formulaBorder: '#dee2e6',
        labelColor: '#495057',
        calculateBtnColor: '#6c757d',
        calculateBtnText: 'Calculate ATC&C',
        resultLabel: 'ATC&C Result',
        resultUnit: '%',
        resultName: 'ATC&C',
        fields: [
            {
                id: 'billingEfficiency',
                key: 'billingEfficiency',
                label: 'Billing Efficiency (%)',
                placeholder: 'Enter billing efficiency (0-100)',
                required: true
            },
            {
                id: 'collectionEfficiency',
                key: 'collectionEfficiency',
                label: 'Collection Efficiency (%)',
                placeholder: 'Enter collection efficiency (0-100)',
                required: true
            }
        ],
        calculateFunction: (values) => {
            if (values.billingEfficiency !== undefined && values.collectionEfficiency !== undefined) {
                // Convert percentages to decimals
                const billingDecimal = values.billingEfficiency / 100;
                const collectionDecimal = values.collectionEfficiency / 100;
                // Apply the formula: (1-(billing_efficiency * collection_efficiency))/100
                const atc = (1 - (billingDecimal * collectionDecimal)) / 100;
                return atc;
            }
            return 0;
        }
    },

    // KPI-08: NECD Configuration
    NECD: {
        key: 'necd',
        title: 'Calculate NECD (New Electricity Connection Days) - KPI-08',
        icon: '⚡',
        theme: 'info',
        titleColor: '#17a2b8',
        formula: 'NECD = total_time_days ÷ total_number_of_new_connections',
        formulaBg: '#d1ecf1',
        formulaBorder: '#bee5eb',
        labelColor: '#0c5460',
        calculateBtnColor: '#17a2b8',
        calculateBtnText: 'Calculate NECD',
        resultLabel: 'NECD Result',
        resultUnit: 'days',
        resultName: 'NECD',
        fields: [
            {
                id: 'totalTimeDays',
                key: 'totalTimeDays',
                label: 'Total Time (Days)',
                placeholder: 'Enter total time in days',
                required: true
            },
            {
                id: 'totalNumberOfNewConnections',
                key: 'totalNumberOfNewConnections',
                label: 'Total Number of New Connections',
                placeholder: 'Enter total number of new connections',
                required: true
            }
        ],
        calculateFunction: (values) => {
            if (values.totalTimeDays !== undefined && values.totalNumberOfNewConnections !== undefined) {
                return values.totalTimeDays / values.totalNumberOfNewConnections;
            }
            return 0;
        }
    },

    // KPI-09: NWCD Configuration
    NWCD: {
        key: 'nwcd',
        title: 'Calculate NWCD (New Water Connection Days) - KPI-09',
        icon: '💧',
        theme: 'primary',
        titleColor: '#007bff',
        formula: 'NWCD = total_time_days ÷ total_number_of_new_connections',
        formulaBg: '#d1ecf1',
        formulaBorder: '#bee5eb',
        labelColor: '#004085',
        calculateBtnColor: '#007bff',
        calculateBtnText: 'Calculate NWCD',
        resultLabel: 'NWCD Result',
        resultUnit: 'days',
        resultName: 'NWCD',
        fields: [
            {
                id: 'totalTimeDays',
                key: 'totalTimeDays',
                label: 'Total Time (Days)',
                placeholder: 'Enter total time in days',
                required: true
            },
            {
                id: 'totalNumberOfNewConnections',
                key: 'totalNumberOfNewConnections',
                label: 'Total Number of New Connections',
                placeholder: 'Enter total number of new connections',
                required: true
            }
        ],
        calculateFunction: (values) => {
            if (values.totalTimeDays !== undefined && values.totalNumberOfNewConnections !== undefined) {
                return values.totalTimeDays / values.totalNumberOfNewConnections;
            }
            return 0;
        }
    },

    // KPI-10: TPS Configuration
    TPS: {
        key: 'tps',
        title: 'Calculate TPS (Timely Payment of Salary) - KPI-10',
        icon: '💰',
        theme: 'success',
        titleColor: '#28a745',
        formula: 'TPS = (number_of_on_time_payments ÷ total_number_of_payments_due) × 100',
        formulaBg: '#d4edda',
        formulaBorder: '#c3e6cb',
        labelColor: '#155724',
        calculateBtnColor: '#28a745',
        calculateBtnText: 'Calculate TPS',
        resultLabel: 'TPS Result',
        resultUnit: '%',
        resultName: 'TPS',
        fields: [
            {
                id: 'numberOfOnTimePayments',
                key: 'numberOfOnTimePayments',
                label: 'Number of On-Time Payments',
                placeholder: 'Enter number of on-time payments',
                required: true
            },
            {
                id: 'totalNumberOfPaymentsDue',
                key: 'totalNumberOfPaymentsDue',
                label: 'Total Number of Payments Due',
                placeholder: 'Enter total number of payments due',
                required: true
            }
        ],
        calculateFunction: (values) => {
            if (values.numberOfOnTimePayments !== undefined && values.totalNumberOfPaymentsDue !== undefined) {
                return (values.numberOfOnTimePayments / values.totalNumberOfPaymentsDue) * 100;
            }
            return 0;
        }
    },

    // KPI-11: TTP Configuration
    TTP: {
        key: 'ttp',
        title: 'Calculate TTP (Timely Tax Payment) - KPI-11',
        icon: '⏱️',
        theme: 'warning',
        titleColor: '#ffc107',
        formula: 'TTP = number_of_on_time_payments ÷ total_number_of_payments_due',
        formulaBg: '#fff3cd',
        formulaBorder: '#ffeaa7',
        labelColor: '#856404',
        calculateBtnColor: '#ffc107',
        calculateBtnText: 'Calculate TTP',
        resultLabel: 'TTP Result',
        resultUnit: '',
        resultName: 'TTP',
        fields: [
            {
                id: 'numberOfOnTimePayments',
                key: 'numberOfOnTimePayments',
                label: 'Number of On-Time Payments',
                placeholder: 'Enter number of on-time payments',
                required: true
            },
            {
                id: 'totalNumberOfPaymentsDue',
                key: 'totalNumberOfPaymentsDue',
                label: 'Total Number of Payments Due',
                placeholder: 'Enter total number of payments due',
                required: true
            }
        ],
        calculateFunction: (values) => {
            if (values.numberOfOnTimePayments !== undefined && values.totalNumberOfPaymentsDue !== undefined) {
                return values.numberOfOnTimePayments / values.totalNumberOfPaymentsDue;
            }
            return 0;
        }
    },

    // KPI-12: WQCC Configuration
    WQCC: {
        key: 'wqcc',
        title: 'Calculate WQCC (Water Quality Compliance Chlorine) - KPI-12',
        icon: '🧪',
        theme: 'info',
        titleColor: '#17a2b8',
        formula: 'WQCC = (number_of_compliant_water_samples ÷ total_number_of_tested_water_samples) × 100',
        formulaBg: '#d1ecf1',
        formulaBorder: '#bee5eb',
        labelColor: '#0c5460',
        calculateBtnColor: '#17a2b8',
        calculateBtnText: 'Calculate WQCC',
        resultLabel: 'WQCC Result',
        resultUnit: '%',
        resultName: 'WQCC',
        fields: [
            {
                id: 'numberOfCompliantWaterSamples',
                key: 'numberOfCompliantWaterSamples',
                label: 'Number of Compliant Water Samples',
                placeholder: 'Enter number of compliant water samples',
                required: true
            },
            {
                id: 'totalNumberOfTestedWaterSamples',
                key: 'totalNumberOfTestedWaterSamples',
                label: 'Total Number of Tested Water Samples',
                placeholder: 'Enter total number of tested water samples',
                required: true
            }
        ],
        calculateFunction: (values) => {
            if (values.numberOfCompliantWaterSamples !== undefined && values.totalNumberOfTestedWaterSamples !== undefined) {
                return (values.numberOfCompliantWaterSamples / values.totalNumberOfTestedWaterSamples) * 100;
            }
            return 0;
        }
    },

    // KPI-13: WQCB Configuration
    WQCB: {
        key: 'wqcb',
        title: 'Calculate WQCB (Water Quality Compliance Bacteriological) - KPI-13',
        icon: '🦠',
        theme: 'danger',
        titleColor: '#dc3545',
        formula: 'WQCB = (number_of_compliant_water_samples ÷ total_number_of_tested_water_samples) × 100',
        formulaBg: '#f8d7da',
        formulaBorder: '#f5c6cb',
        labelColor: '#721c24',
        calculateBtnColor: '#dc3545',
        calculateBtnText: 'Calculate WQCB',
        resultLabel: 'WQCB Result',
        resultUnit: '%',
        resultName: 'WQCB',
        fields: [
            {
                id: 'numberOfCompliantWaterSamples',
                key: 'numberOfCompliantWaterSamples',
                label: 'Number of Compliant Water Samples',
                placeholder: 'Enter number of compliant water samples',
                required: true
            },
            {
                id: 'totalNumberOfTestedWaterSamples',
                key: 'totalNumberOfTestedWaterSamples',
                label: 'Total Number of Tested Water Samples',
                placeholder: 'Enter total number of tested water samples',
                required: true
            }
        ],
        calculateFunction: (values) => {
            if (values.numberOfCompliantWaterSamples !== undefined && values.totalNumberOfTestedWaterSamples !== undefined) {
                return (values.numberOfCompliantWaterSamples / values.totalNumberOfTestedWaterSamples) * 100;
            }
            return 0;
        }
    },

    // KPI-14: NRW Configuration
    NRW: {
        key: 'nrw',
        title: 'Calculate NRW (Non-Revenue Water) - KPI-14',
        icon: '💧',
        theme: 'secondary',
        titleColor: '#6c757d',
        formula: 'NRW = (water_entering_system ÷ billed_authorized_consumption) × 100',
        formulaBg: '#f8f9fa',
        formulaBorder: '#dee2e6',
        labelColor: '#495057',
        calculateBtnColor: '#6c757d',
        calculateBtnText: 'Calculate NRW',
        resultLabel: 'NRW Result',
        resultUnit: '%',
        resultName: 'NRW',
        fields: [
            {
                id: 'waterEnteringSystem',
                key: 'waterEnteringSystem',
                label: 'Water Entering System (M³)',
                placeholder: 'Enter water entering system in M³',
                required: true
            },
            {
                id: 'billedAuthorizedConsumption',
                key: 'billedAuthorizedConsumption',
                label: 'Billed Authorized Consumption (M³)',
                placeholder: 'Enter billed authorized consumption in M³',
                required: true
            }
        ],
        calculateFunction: (values) => {
            if (values.waterEnteringSystem !== undefined && values.billedAuthorizedConsumption !== undefined) {
                return (values.waterEnteringSystem / values.billedAuthorizedConsumption) * 100;
            }
            return 0;
        }
    }
};

// Export configurations
window.KPIConfigurations = KPIConfigurations;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = KPIConfigurations;
}