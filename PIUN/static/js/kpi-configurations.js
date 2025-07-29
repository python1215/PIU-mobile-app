/**
 * Updated KPI Popup Configurations
 * Includes all model fields except loginUser, year, and date_created
 */

const KPIConfigurations = {
    ROA: {
        key: 'roa',
        type: 'ROA',
        title: 'Calculate ROA (Return on Assets) - KPI-01',
        color: '#dc3545',
        formula: 'ROA = (Net Profit After Tax ÷ Total Assets) × 100',
        unit: '%',
        fields: [
            {
                id: 'net_profit_after_tax',
                name: 'net_profit_after_tax',
                label: 'Net Profit After Tax',
                placeholder: 'Enter net profit after tax',
                step: '0.01',
                required: true
            },
            {
                id: 'total_assets',
                name: 'total_assets',
                label: 'Total Assets',
                placeholder: 'Enter total assets value',
                step: '0.01',
                required: true
            },
            {
                name: 'quarter',
                label: 'Quarter',
                type: 'select',
                options: [
                    {value: '1', text: 'Q1 (January-March)'},
                    {value: '2', text: 'Q2 (April-June)'},
                    {value: '3', text: 'Q3 (July-September)'},
                    {value: '4', text: 'Q4 (October-December)'}
                ]
            }
        ],
        calculateFunction: (values) => {
            const netProfit = parseFloat(values.net_profit_after_tax);
            const totalAssets = parseFloat(values.total_assets);
            
            if (isNaN(netProfit) || isNaN(totalAssets) || totalAssets === 0) {
                return NaN;
            }
            
            const result = (netProfit / totalAssets) * 100;
            return result;
        }
    },

    NPM: {
        key: 'npm',
        type: 'NPM',
        title: 'Calculate NPM (Net Profit Margin) - KPI-02',
        color: '#007bff',
        formula: 'NPM = (Net Profit / Total Revenue) × 100',
        fields: [
            {
                name: 'total_revenues_turnover',
                label: 'Total Revenue/Turnover',
                placeholder: 'Enter total revenue or turnover',
                step: '0.01'},
            {
                name: 'netprofit',
                label: 'Net Profit',
                placeholder: 'Enter net profit amount',
                step: '0.01'},
            {
                name: 'quarter',
                label: 'Quarter',
                type: 'select',
                options: [
                    {value: '1', text: 'Q1 (January-March)'},
                    {value: '2', text: 'Q2 (April-June)'},
                    {value: '3', text: 'Q3 (July-September)'},
                    {value: '4', text: 'Q4 (October-December)'}
                ]
            }
        ],
        calculateFunction: (values) => {
            if (values.total_revenues_turnover > 0) {
                return (values.netprofit / values.total_revenues_turnover) * 100;
            }
            return 0;
        }
    },

    DSCR: {
        key: 'dscr',
        type: 'DSCR',
        title: 'Calculate DSCR (Debt Service Coverage Ratio) - KPI-03',
        color: '#28a745',
        formula: 'DSCR = Net Operating Income ÷ Total Debt Service',
        unit: 'ratio',
        fields: [
            {
                name: 'net_operating_income',
                label: 'Net Operating Income',
                placeholder: 'Enter net operating income',
                step: '0.01'},
            {
                name: 'total_debt_service',
                label: 'Total Debt Service',
                placeholder: 'Enter total debt service',
                step: '0.01'},
            {
                name: 'quarter',
                label: 'Quarter',
                type: 'select',
                options: [
                    {value: '1', text: 'Q1 (January-March)'},
                    {value: '2', text: 'Q2 (April-June)'},
                    {value: '3', text: 'Q3 (July-September)'},
                    {value: '4', text: 'Q4 (October-December)'}
                ]
            }
        ],
        calculateFunction: (values) => {
            return values.net_operating_income / values.total_debt_service;
        }
    },

    MWh: {
        key: 'mwh',
        type: 'MWh',
        title: 'Calculate Local Production (Total Electricity Generated) (MWh) - KPI-04',
        color: '#ffc107',
        formula: 'E_total = Σ(Power × Time) for all sources',
        unit: 'MWh',
        fields: [
            {
                name: 'power_injected',
                label: 'Power Injected',
                placeholder: 'Enter power injected',
                step: '0.01',
                unit: 'MW'
            },
            {
                name: 'time_duration',
                label: 'Time Duration',
                placeholder: 'Enter time duration',
                step: '0.01',
                unit: 'hours'
            },
            {
                name: 'number_of_sources',
                label: 'Number of Sources',
                placeholder: 'Enter number of sources',
                step: '1',
                min: '1'
            },
            {
                name: 'quarter',
                label: 'Quarter',
                type: 'select',
                options: [
                    {value: '1', text: 'Q1 (January-March)'},
                    {value: '2', text: 'Q2 (April-June)'},
                    {value: '3', text: 'Q3 (July-September)'},
                    {value: '4', text: 'Q4 (October-December)'}
                ]
            }
        ],
        calculateFunction: (values) => {
            return values.power_injected * values.time_duration * values.number_of_sources;
        }
    },

    GAF: {
        key: 'gaf',
        type: 'GAF',
        title: 'Calculate Generation Availability Factor (GAF) - KPI-05',
        color: '#17a2b8',
        formula: 'GAF = (Total Available Hours ÷ Total Period Hours) × 100',
        unit: '%',
        fields: [
            {
                name: 'total_available_hours',
                label: 'Total Available Hours',
                placeholder: 'Enter total available hours',
                step: '0.01',
                unit: 'hours'
            },
            {
                name: 'total_period_hours',
                label: 'Total Period Hours',
                placeholder: 'Enter total period hours',
                step: '0.01',
                unit: 'hours'
            },
            {
                name: 'quarter',
                label: 'Quarter',
                type: 'select',
                options: [
                    {value: '1', text: 'Q1 (January-March)'},
                    {value: '2', text: 'Q2 (April-June)'},
                    {value: '3', text: 'Q3 (July-September)'},
                    {value: '4', text: 'Q4 (October-December)'}
                ]
            }
        ],
        calculateFunction: (values) => {
            return (values.total_available_hours / values.total_period_hours) * 100;
        }
    },

    TDE: {
        key: 'tde',
        type: 'TDE',
        title: 'Calculate Training Days per Employee (TDE) - KPI-06',
        color: '#6f42c1',
        formula: 'TDE = Total Training Days ÷ Total Number of Employees',
        unit: 'days/employee',
        fields: [
            {
                name: 'total_training_days_conducted',
                label: 'Total Training Days Conducted',
                placeholder: 'Enter total training days conducted',
                step: '0.01',
                unit: 'days'
            },
            {
                name: 'total_number_of_employees',
                label: 'Total Number of Employees',
                placeholder: 'Enter total number of employees',
                step: '1',
                min: '1'
            },
            {
                name: 'quarter',
                label: 'Quarter',
                type: 'select',
                options: [
                    {value: '1', text: 'Q1 (January-March)'},
                    {value: '2', text: 'Q2 (April-June)'},
                    {value: '3', text: 'Q3 (July-September)'},
                    {value: '4', text: 'Q4 (October-December)'}
                ]
            }
        ],
        calculateFunction: (values) => {
            return values.total_training_days_conducted / values.total_number_of_employees;
        }
    },

    ATC: {
        key: 'atc',
        type: 'ATC',
        title: 'Calculate ATC&C (Total Losses Electricity) - KPI-07',
        color: '#e83e8c',
        formula: 'ATC = (1 - (Billing Efficiency × Collection Efficiency))/100',
        unit: '%',
        fields: [

            {
                name: 'billing_efficiency',
                label: 'Billing Efficiency',
                placeholder: 'Enter billing efficiency (%)',
                step: '0.01',
                min: '0',
                unit: '%'
            },
            {
                name: 'collection_efficiency',
                label: 'Collection Efficiency',
                placeholder: 'Enter collection efficiency (%)',
                step: '0.01',
                min: '0',
                unit: '%'
            },
            {
                name: 'quarter',
                label: 'Quarter',
                type: 'select',
                options: [
                    {value: '1', text: 'Q1 (January-March)'},
                    {value: '2', text: 'Q2 (April-June)'},
                    {value: '3', text: 'Q3 (July-September)'},
                    {value: '4', text: 'Q4 (October-December)'}
                ]
            }
        ],
        calculateFunction: (values) => {
            return (100 - (values.billing_efficiency * values.collection_efficiency / 100)) ;
        }
    },

    NECD: {
        key: 'necd',
        type: 'NECD',
        title: 'Calculate New Electricity Connection Days (NECD) - KPI-08',
        color: '#fd7e14',
        formula: 'NECD = Total Time (Days) ÷ Total New Connections',
        unit: 'days/connection',
        fields: [

            {
                name: 'total_time_days',
                label: 'Total Time (Days)',
                placeholder: 'Enter total time in days',
                step: '0.01',
                unit: 'days'
            },
            {
                name: 'total_number_of_new_connections',
                label: 'Total Number of New Connections',
                placeholder: 'Enter total number of new connections',
                step: '1',
                min: '1'
            },
            {
                name: 'quarter',
                label: 'Quarter',
                type: 'select',
                options: [
                    {value: '1', text: 'Q1 (January-March)'},
                    {value: '2', text: 'Q2 (April-June)'},
                    {value: '3', text: 'Q3 (July-September)'},
                    {value: '4', text: 'Q4 (October-December)'}
                ]
            }
        ],
        calculateFunction: (values) => {
            return values.total_time_days / values.total_number_of_new_connections;
        }
    },

    NWCD: {
        key: 'nwcd',
        type: 'NWCD',
        title: 'Calculate New Water Connection Days (NWCD) - KPI-09',
        color: '#20c997',
        formula: 'NWCD = Total Time (Days) ÷ Total New Water Connections',
        unit: 'days/connection',
        fields: [

            {
                name: 'total_time_days',
                label: 'Total Time (Days)',
                placeholder: 'Enter total time in days',
                step: '0.01',
                unit: 'days'
            },
            {
                name: 'total_number_of_new_connections',
                label: 'Total Number of New Water Connections',
                placeholder: 'Enter total number of new water connections',
                step: '1',
                min: '1'
            },
            {
                name: 'quarter',
                label: 'Quarter',
                type: 'select',
                options: [
                    {value: '1', text: 'Q1 (January-March)'},
                    {value: '2', text: 'Q2 (April-June)'},
                    {value: '3', text: 'Q3 (July-September)'},
                    {value: '4', text: 'Q4 (October-December)'}
                ]
            }
        ],
        calculateFunction: (values) => {
            return values.total_time_days / values.total_number_of_new_connections;
        }
    },

    TPS: {
        key: 'tps',
        type: 'TPS',
        title: 'Calculate Timely Payment of Salary (TPS) - KPI-10',
        color: '#6610f2',
        formula: 'TPS = (On-time Payments ÷ Total Payments Due) × 100',
        unit: '%',
        fields: [

            {
                name: 'number_of_on_time_payments',
                label: 'Number of On-time Payments',
                placeholder: 'Enter number of on-time payments',
                step: '1',
                min: '0'
            },
            {
                name: 'total_number_of_payments_due',
                label: 'Total Number of Payments Due',
                placeholder: 'Enter total number of payments due',
                step: '1',
                min: '1'
            },
            {
                name: 'quarter',
                label: 'Quarter',
                type: 'select',
                options: [
                    {value: '1', text: 'Q1 (January-March)'},
                    {value: '2', text: 'Q2 (April-June)'},
                    {value: '3', text: 'Q3 (July-September)'},
                    {value: '4', text: 'Q4 (October-December)'}
                ]
            }
        ],
        calculateFunction: (values) => {
            return (values.number_of_on_time_payments / values.total_number_of_payments_due) * 100;
        }
    },

    TTP: {
        key: 'ttp',
        type: 'TTP',
        title: 'Calculate Timely Tax Payment (TTP) - KPI-11',
        color: '#dc3545',
        formula: 'TTP = (Timely Tax Payments ÷ Total Tax Payments Due) × 100',
        unit: '%',
        fields: [

            {
                name: 'timely_tax_payments',
                label: 'Timely Tax Payments',
                placeholder: 'Enter number of timely tax payments',
                step: '1',
                min: '0'
            },
            {
                name: 'total_tax_payments_due',
                label: 'Total Tax Payments Due',
                placeholder: 'Enter total tax payments due',
                step: '1',
                min: '1'
            },
            {
                name: 'quarter',
                label: 'Quarter',
                type: 'select',
                options: [
                    {value: '1', text: 'Q1 (January-March)'},
                    {value: '2', text: 'Q2 (April-June)'},
                    {value: '3', text: 'Q3 (July-September)'},
                    {value: '4', text: 'Q4 (October-December)'}
                ]
            }
        ],
        calculateFunction: (values) => {
            return (values.timely_tax_payments / values.total_tax_payments_due) * 100;
        }
    },

    WQCC: {
        key: 'wqcc',
        type: 'WQCC',
        title: 'Calculate Water Quality Compliance Chemical (WQCC) - KPI-12',
        color: '#007bff',
        formula: 'WQCC = (Compliant Samples ÷ Total Tested Samples) × 100',
        unit: '%',
        fields: [

            {
                name: 'number_of_compliant_water_samples',
                label: 'Number of Compliant Water Samples',
                placeholder: 'Enter number of compliant water samples',
                step: '1',
                min: '0'
            },
            {
                name: 'total_number_of_tested_water_samples',
                label: 'Total Number of Tested Water Samples',
                placeholder: 'Enter total number of tested water samples',
                step: '1',
                min: '1'
            },
            {
                name: 'quarter',
                label: 'Quarter',
                type: 'select',
                options: [
                    {value: '1', text: 'Q1 (January-March)'},
                    {value: '2', text: 'Q2 (April-June)'},
                    {value: '3', text: 'Q3 (July-September)'},
                    {value: '4', text: 'Q4 (October-December)'}
                ]
            }
        ],
        calculateFunction: (values) => {
            return (values.number_of_compliant_water_samples / values.total_number_of_tested_water_samples) * 100;
        }
    },

    WQCB: {
        key: 'wqcb',
        type: 'WQCB',
        title: 'Calculate Water Quality Compliance - Bacteriological (WQCB) - KPI-13',
        color: '#28a745',
        formula: 'WQCB = (Compliant Samples ÷ Total Tested Samples) × 100',
        unit: '%',
        fields: [

            {
                name: 'number_of_compliant_water_samples',
                label: 'Number of Compliant Water Samples',
                placeholder: 'Enter number of compliant water samples',
                step: '1',
                min: '0'
            },
            {
                name: 'total_number_of_tested_water_samples',
                label: 'Total Number of Tested Water Samples',
                placeholder: 'Enter total number of tested water samples',
                step: '1',
                min: '1'
            },
            {
                name: 'quarter',
                label: 'Quarter',
                type: 'select',
                options: [
                    {value: '1', text: 'Q1 (January-March)'},
                    {value: '2', text: 'Q2 (April-June)'},
                    {value: '3', text: 'Q3 (July-September)'},
                    {value: '4', text: 'Q4 (October-December)'}
                ]
            }
        ],
        calculateFunction: (values) => {
            return (values.number_of_compliant_water_samples / values.total_number_of_tested_water_samples) * 100;
        }
    },

    NRW: {
        key: 'nrw',
        type: 'NRW',
        title: 'Calculate Non-Revenue Water (NRW) - KPI-14',
        color: '#ffc107',
        formula: 'NRW = ((Water Entering System - Billed Consumption) ÷ Water Entering System) × 100',
        unit: '%',
        fields: [

            {
                name: 'water_entering_system',
                label: 'Water Entering System',
                placeholder: 'Enter water entering system volume',
                step: '0.01',
                unit: 'm³'
            },
            {
                name: 'billed_authorized_consumption',
                label: 'Billed Authorized Consumption',
                placeholder: 'Enter billed authorized consumption',
                step: '0.01',
                unit: 'm³'
            },
            {
                name: 'quarter',
                label: 'Quarter',
                type: 'select',
                options: [
                    {value: '1', text: 'Q1 (January-March)'},
                    {value: '2', text: 'Q2 (April-June)'},
                    {value: '3', text: 'Q3 (July-September)'},
                    {value: '4', text: 'Q4 (October-December)'}
                ]
            }
        ],
        calculateFunction: (values) => {
            return ((values.water_entering_system - values.billed_authorized_consumption) / values.water_entering_system) * 100;
        }
    },

    DD: {
        key: 'dd',
        type: 'DD',
        title: 'Calculate Debtor Days (DD) - KPI-15',
        color: '#ffc107',
        formula: 'DD = (Trade Receivables ÷ Total Credit Sales) × 365',
        unit: 'days',
        fields: [
            {
                name: 'trade_receivables',
                label: 'Trade Receivables',
                placeholder: 'Enter trade receivables amount',
                step: '0.01',
                min: '0'
            },
            {
                name: 'total_credit_sales',
                label: 'Total Credit Sales',
                placeholder: 'Enter total credit sales amount',
                step: '0.01',
                min: '0.01'
            },
            {
                name: 'quarter',
                label: 'Quarter',
                type: 'select',
                options: [
                    {value: '1', text: 'Q1 (January-March)'},
                    {value: '2', text: 'Q2 (April-June)'},
                    {value: '3', text: 'Q3 (July-September)'},
                    {value: '4', text: 'Q4 (October-December)'}
                ]
            }
        ],
        calculateFunction: (values) => {
            return (values.trade_receivables / values.total_credit_sales) * 100;
        }
    }
};

// Export for global access
window.KPIConfigurations = KPIConfigurations;