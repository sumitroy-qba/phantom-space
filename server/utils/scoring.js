/**
 * Scoring Engine for Startup Investment Risk Assessment
 * Implements exact formulas as specified in requirements
 */

class ScoringEngine {
    constructor(answers, questions) {
        this.answers = answers;
        this.questions = questions;
        this.questionMap = {};

        // Create question lookup map
        questions.forEach(q => {
            this.questionMap[q.label] = q;
        });
    }

    /**
     * Calculate overall risk score and all components
     */
    calculateRiskScore() {
        const sectionScores = this.calculateSectionScores();
        const kpiScores = this.calculateKPIScores();
        const overallScore = this.calculateOverallScore(sectionScores);
        const riskBand = this.determineRiskBand(overallScore);
        const decision = this.getDecision(riskBand);

        return {
            totalRiskScore: Math.round(overallScore * 100) / 100,
            riskBand,
            decision,
            sectionScores,
            kpiScores
        };
    }

    /**
     * Calculate risk scores for all sections
     */
    calculateSectionScores() {
        const sections = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
        const scores = {};

        sections.forEach(section => {
            scores[section] = this.calculateSectionScore(section);
        });

        // Combine J, K, L as per requirements
        scores['JKL'] = (scores['J'] + scores['K'] + scores['L']) / 3;

        return scores;
    }

    /**
     * Calculate score for a single section
     */
    calculateSectionScore(section) {
        const sectionQuestions = this.questions.filter(q =>
            q.section === section && q.weight > 0
        );

        if (sectionQuestions.length === 0) return 50; // Default neutral

        let totalWeightedRisk = 0;
        let totalWeight = 0;

        sectionQuestions.forEach(q => {
            const questionRisk = this.calculateQuestionRisk(q);
            totalWeightedRisk += questionRisk * q.weight;
            totalWeight += q.weight;
        });

        return totalWeight > 0 ? totalWeightedRisk / totalWeight : 50;
    }

    /**
     * Calculate risk for individual question based on scoring rules
     */
    calculateQuestionRisk(question) {
        const answer = this.answers[question.label];

        if (!answer && !question.required) return 50; // Neutral for optional unanswered
        if (!question.scoring_rules_json) return 50;

        const rules = JSON.parse(question.scoring_rules_json);
        const type = rules.type;

        try {
            switch (type) {
                case 'description_completeness':
                    return this.scoreDescriptionCompleteness(answer);

                case 'stage_risk':
                    return this.scoreStageRisk(answer, rules.map);

                case 'geography_complexity':
                    return this.scoreGeographyComplexity();

                case 'regulatory_burden':
                    return this.scoreRegulatoryBurden();

                case 'compliance_multiplier':
                    // This is handled in regulatory_burden
                    return 50;

                case 'ip_risk':
                    return this.scoreIPRisk();

                case 'unit_economics':
                    return this.scoreUnitEconomics();

                case 'market_sizing':
                    return this.scoreMarketSizing();

                case 'source_quality':
                    return rules.map[answer] || 65;

                case 'revenue_stage':
                    return answer === 'Pre-revenue' ? 80 : 50;

                case 'growth_consistency':
                    return this.scoreGrowthConsistency(answer);

                case 'contract_concentration':
                case 'customer_concentration':
                    return this.scoreCustomerConcentration();

                case 'expense_balance':
                    return this.scoreExpenseBalance(answer);

                case 'exit_clarity':
                case 'exit_timeline':
                    return this.scoreExitStrategy();

                case 'self_risk_completeness':
                    return this.scoreSelfRisks();

                default:
                    return 50;
            }
        } catch (error) {
            console.error('Error calculating question risk:', error);
            return 50;
        }
    }

    /**
     * B1: Description completeness
     */
    scoreDescriptionCompleteness(description) {
        if (!description) return 60;
        const len = description.length;
        if (len < 300) return 60;

        const descRisk = Math.max(20, Math.min(60, 60 - (len - 300) / 20));
        return descRisk;
    }

    /**
     * B2: Startup stage risk
     */
    scoreStageRisk(stage, map) {
        return map[stage] || 50;
    }

    /**
     * C1+C2: Geography complexity
     */
    scoreGeographyComplexity() {
        const primary = this.answers['Primary Geographic Markets'] || [];
        const other = this.answers['Other Markets (Active/Planned)'] || [];

        const p = Array.isArray(primary) ? primary.length : 0;
        const o = Array.isArray(other) ? other.length : 0;
        const total = p + o;

        const geoRisk = Math.max(20, Math.min(90, 20 + 8 * Math.max(0, total - 1)));
        return geoRisk;
    }

    /**
     * D1+D2: Regulatory burden with compliance multiplier
     */
    scoreRegulatoryBurden() {
        const bodies = this.answers['Regulatory Bodies'] || [];
        const readiness = this.answers['Compliance Readiness'];

        const burdenMap = {
            'GDPR': 15, 'HIPAA': 20, 'FDA': 25, 'SEC': 15, 'FINRA': 25,
            'FCA': 20, 'EMA': 20, 'OCC': 15, 'CFPB': 15, 'MAS': 15,
            'SFC': 15, 'ASIC': 15, 'CFTC': 20, 'ISO 27001': 10, 'Other': 15, 'None': 0
        };

        let burdenSum = 0;
        if (Array.isArray(bodies)) {
            bodies.forEach(body => {
                burdenSum += burdenMap[body] || 15;
            });
        }

        let regBurdenRisk = Math.max(10, Math.min(90, 10 + burdenSum));

        // Apply compliance multiplier
        const multiplierMap = {
            'Not Started': 1.20,
            'In Progress': 1.00,
            'Fully Compliant': 0.80
        };

        const multiplier = multiplierMap[readiness] || 1.00;
        const regRisk = Math.max(5, Math.min(95, regBurdenRisk * multiplier));

        return regRisk;
    }

    /**
     * E: IP risk
     */
    scoreIPRisk() {
        const applicable = this.answers['IP Applicable?'];

        if (applicable === 'No') {
            return 55; // Neutral - no defensibility advantage
        }

        const status = this.answers['IP Status'];
        const type = this.answers['IP Type'];

        const statusMap = {
            'Granted': 25,
            'Filed': 45,
            'Pending': 55,
            'Rejected': 80
        };

        let statusRisk = statusMap[status] || 55;

        // Reduce by 5 if both patent and trademark
        if (type === 'Both') {
            statusRisk = Math.max(15, statusRisk - 5);
        }

        return statusRisk;
    }

    /**
     * F: Unit Economics (LTV/CAC)
     */
    scoreUnitEconomics() {
        const cac = parseFloat(this.answers['Expected CAC (Customer Acquisition Cost)']);
        const ltv = parseFloat(this.answers['Expected LTV (Lifetime Value)']);

        if (!cac || !ltv || cac <= 0) {
            return 70; // Incomplete data
        }

        const ratio = ltv / cac;

        if (ratio >= 5) return 20;
        if (ratio >= 3) return 35;
        if (ratio >= 2) return 55;
        if (ratio >= 1) return 75;
        return 90;
    }

    /**
     * G: Market sizing validation and source quality
     */
    scoreMarketSizing() {
        const tam = parseFloat(this.answers['TAM (Total Addressable Market)']);
        const sam = parseFloat(this.answers['SAM (Serviceable Addressable Market)']);
        const som = parseFloat(this.answers['SOM (Serviceable Obtainable Market)']);
        const sources = this.answers['Data Sources'];
        const sourceType = this.answers['Source Type'];

        // Base risk from source quality
        const sourceMap = {
            'Analyst Report': 45,
            'Government Data': 45,
            'Academic': 45,
            'Internal Survey': 55,
            'Other': 65
        };

        let baseRisk = sources ? (sourceMap[sourceType] || 65) : 80;

        // Validate hierarchy
        const invalidHierarchy = !(tam >= sam && sam >= som);
        const penalty = invalidHierarchy ? 20 : 0;

        return Math.max(20, Math.min(95, baseRisk + penalty));
    }

    /**
     * H: Revenue stage and growth consistency
     */
    scoreGrowthConsistency(growthData) {
        const revenueStatus = this.answers['Revenue Status'];

        if (revenueStatus === 'Pre-revenue') {
            return 80;
        }

        let revBaseRisk = 50;

        // Parse growth table if exists
        if (growthData && Array.isArray(growthData) && growthData.length > 0) {
            const growthRates = growthData.map(g => parseFloat(g.rate) || 0);

            const avgG = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
            const variance = growthRates.reduce((sum, g) => sum + Math.pow(g - avgG, 2), 0) / growthRates.length;
            const stdG = Math.sqrt(variance);

            const trendRisk = Math.max(20, Math.min(95, 60 - 2 * avgG + 1.5 * stdG));

            return Math.max(20, Math.min(95, 0.4 * revBaseRisk + 0.6 * trendRisk));
        }

        return revBaseRisk;
    }

    /**
     * I: Customer concentration risk
     */
    scoreCustomerConcentration() {
        const contracts = this.answers['Customer Contracts'] || [];
        const top3Share = parseFloat(this.answers['Top 3 Customers Revenue Share (%)']) || 0;
        const revenueStatus = this.answers['Revenue Status'];

        if (revenueStatus !== 'Pre-revenue' && contracts.length === 0) {
            return 75;
        }

        let concentrationRisk = 25;

        if (top3Share <= 30) concentrationRisk = 25;
        else if (top3Share <= 50) concentrationRisk = 45;
        else if (top3Share <= 70) concentrationRisk = 65;
        else concentrationRisk = 85;

        // Check average contract duration
        if (contracts.length > 0) {
            const avgDuration = contracts.reduce((sum, c) => sum + (parseFloat(c.duration) || 0), 0) / contracts.length;
            if (avgDuration < 6) {
                concentrationRisk += 10;
            }
        }

        return Math.min(95, concentrationRisk);
    }

    /**
     * J: Expense plan balance
     */
    scoreExpenseBalance(allocation) {
        if (!allocation) return 40;

        const stage = this.answers['Startup Stage'];
        let penalties = 0;

        const tech = parseFloat(allocation.tech) || 0;
        const mkt = parseFloat(allocation.marketing) || 0;
        const sales = parseFloat(allocation.sales) || 0;
        const mgmt = parseFloat(allocation.management) || 0;

        // Rule 1: Low marketing + sales for later stages
        if ((mkt + sales) < 25 && ['Beta', 'Early Revenue', 'Scale-up'].includes(stage)) {
            penalties += 15;
        }

        // Rule 2: Low tech for early stages
        if (tech < 15 && ['Idea', 'MVP'].includes(stage)) {
            penalties += 15;
        }

        // Rule 3: High management overhead
        if (mgmt > 30) {
            penalties += 15;
        }

        return Math.max(20, Math.min(90, 40 + penalties));
    }

    /**
     * K: Exit strategy clarity
     */
    scoreExitStrategy() {
        const exitType = this.answers['Exit Type'];
        const timeline = this.answers['Exit Timeline'];
        const valuation = this.answers['Target Valuation'];
        const buyer = this.answers['Target Buyer Profile'];

        const typeMap = {
            'Undecided': 80,
            'Acquisition': 45,
            'IPO': 55,
            'Secondary Sale': 50
        };

        const timelineMap = {
            '<3 years': 65,
            '3-5 years': 40,
            '5-7 years': 45,
            '7-10 years': 55,
            '10+ years': 70
        };

        const typeRisk = typeMap[exitType] || 70;
        const timelineRisk = timelineMap[timeline] || 60;

        let penalties = 0;
        if (!valuation) penalties += 10;
        if (!buyer) penalties += 10;

        return Math.max(25, Math.min(95, 0.5 * typeRisk + 0.5 * timelineRisk + penalties));
    }

    /**
     * L: Self-reported risks completeness
     */
    scoreSelfRisks() {
        const risk1 = this.answers['Top Risk #1'] || '';
        const risk2 = this.answers['Top Risk #2'] || '';
        const risk3 = this.answers['Top Risk #3'] || '';

        const cat1 = this.answers['Risk #1 Category'];
        const cat2 = this.answers['Risk #2 Category'];
        const cat3 = this.answers['Risk #3 Category'];

        let filled = 0;
        if (risk1.length >= 50) filled++;
        if (risk2.length >= 50) filled++;
        if (risk3.length >= 50) filled++;

        let baseRisk = 80;
        if (filled === 3) baseRisk = 35;
        else if (filled === 2) baseRisk = 55;

        // Check category diversity
        let breadthPenalty = 0;
        if (cat1 === cat2 && cat2 === cat3) {
            breadthPenalty = 10;
        }

        return Math.max(25, Math.min(90, baseRisk + breadthPenalty));
    }

    /**
     * Calculate overall risk score using section weights
     */
    calculateOverallScore(sectionScores) {
        const weights = {
            'B': 15,  // Product & Stage
            'C': 15,  // Market & Geography
            'D': 15,  // Regulatory & Compliance
            'E': 5,   // IP
            'F': 15,  // Unit Economics
            'G': 10,  // Market Sizing
            'H': 15,  // Revenue & Growth
            'I': 5,   // Customers & Contracts
            'JKL': 5  // Exit + Financial Plan + Self Risks
        };

        let totalWeightedScore = 0;
        let totalWeight = 0;

        Object.keys(weights).forEach(section => {
            if (sectionScores[section] !== undefined) {
                totalWeightedScore += sectionScores[section] * weights[section];
                totalWeight += weights[section];
            }
        });

        return totalWeight > 0 ? totalWeightedScore / totalWeight : 50;
    }

    /**
     * Calculate KPI scores for dashboard comparisons
     */
    calculateKPIScores() {
        const growthData = this.answers['MoM Growth Rate (Last 6-12 Months)'] || [];
        let stdG = 0;

        if (Array.isArray(growthData) && growthData.length > 0) {
            const rates = growthData.map(g => parseFloat(g.rate) || 0);
            const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
            const variance = rates.reduce((sum, g) => sum + Math.pow(g - avg, 2), 0) / rates.length;
            stdG = Math.sqrt(variance);
        }

        return {
            kpi_regulatory: this.scoreRegulatoryBurden(),
            kpi_unit_economics: this.scoreUnitEconomics(),
            kpi_growth_stability: Math.max(20, Math.min(95, 20 + 2 * stdG)),
            kpi_customer_concentration: this.scoreCustomerConcentration(),
            kpi_execution_complexity: this.scoreGeographyComplexity(),
            kpi_exit_clarity: this.scoreExitStrategy()
        };
    }

    /**
     * Determine risk band based on score
     */
    determineRiskBand(score) {
        if (score <= 30) return 'Low Risk';
        if (score <= 60) return 'Medium Risk';
        return 'High Risk';
    }

    /**
     * Get investment decision based on risk band
     */
    getDecision(band) {
        const decisions = {
            'Low Risk': 'Strong candidate for investment (subject to diligence)',
            'Medium Risk': 'Proceed with caution; require mitigations',
            'High Risk': 'Not recommended unless major risks resolved'
        };

        return decisions[band] || decisions['Medium Risk'];
    }
}

module.exports = ScoringEngine;
