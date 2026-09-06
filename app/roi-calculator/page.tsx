'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calculator,
  TrendingUp,
  DollarSign,
  GraduationCap,
  Globe,
  Building2,
  CheckCircle2,
  ArrowRight,
  Clock,
  Coins,
  Scale,
  Sparkles,
  Copy,
  Check,
  ShieldCheck,
  Info,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

interface PresetCountry {
  id: string;
  name: string;
  degreeName: string;
  flag: string;
  tagline: string;
  currencySymbol: string;
  annualTuition: number;
  durationYears: number;
  annualLiving: number;
  totalScholarship: number;
  annualPartTime: number;
  loanAmount: number;
  loanInterestRate: number;
  loanTenureYears: number;
  startingSalary: number;
  annualSalaryGrowth: number;
  taxAndLivingRate: number; // % of salary spent on taxes & living
  stayBackYears: number;
  visaSecurity: string;
}

const PRESET_DESTINATIONS: PresetCountry[] = [
  {
    id: 'usa',
    name: 'United States',
    degreeName: 'STEM MS in Computer Science / AI',
    flag: '🇺🇸',
    tagline: 'Highest peak tech compensation & 3-year OPT STEM extension',
    currencySymbol: '$',
    annualTuition: 38000,
    durationYears: 2,
    annualLiving: 16000,
    totalScholarship: 8000,
    annualPartTime: 10000,
    loanAmount: 65000,
    loanInterestRate: 9.5,
    loanTenureYears: 10,
    startingSalary: 115000,
    annualSalaryGrowth: 7.0,
    taxAndLivingRate: 42,
    stayBackYears: 3,
    visaSecurity: 'High (3-Yr STEM OPT)',
  },
  {
    id: 'germany',
    name: 'Germany',
    degreeName: 'TU9 MS in Engineering / CS',
    flag: '🇩🇪',
    tagline: 'Near-zero public tuition, blocked-account living, rapid break-even',
    currencySymbol: '€',
    annualTuition: 700,
    durationYears: 2,
    annualLiving: 11500,
    totalScholarship: 0,
    annualPartTime: 9500,
    loanAmount: 14000,
    loanInterestRate: 6.5,
    loanTenureYears: 7,
    startingSalary: 58000,
    annualSalaryGrowth: 5.0,
    taxAndLivingRate: 45,
    stayBackYears: 1.5,
    visaSecurity: 'Very High (18-Mo + EU Blue Card)',
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    degreeName: '1-Year Intensive MSc Computing',
    flag: '🇬🇧',
    tagline: 'Fast 12-month completion, saving an entire year of living expenses',
    currencySymbol: '£',
    annualTuition: 29000,
    durationYears: 1,
    annualLiving: 14000,
    totalScholarship: 3000,
    annualPartTime: 6000,
    loanAmount: 34000,
    loanInterestRate: 9.0,
    loanTenureYears: 8,
    startingSalary: 44000,
    annualSalaryGrowth: 6.0,
    taxAndLivingRate: 40,
    stayBackYears: 2,
    visaSecurity: 'Moderate (2-Yr Graduate Route)',
  },
  {
    id: 'canada',
    name: 'Canada',
    degreeName: '2-Year Master of Applied Computing',
    flag: '🇨🇦',
    tagline: 'Direct 3-year PGWP with established Express Entry PR points',
    currencySymbol: 'C$',
    annualTuition: 32000,
    durationYears: 2,
    annualLiving: 18000,
    totalScholarship: 5000,
    annualPartTime: 12000,
    loanAmount: 60000,
    loanInterestRate: 8.5,
    loanTenureYears: 10,
    startingSalary: 82000,
    annualSalaryGrowth: 5.5,
    taxAndLivingRate: 40,
    stayBackYears: 3,
    visaSecurity: 'High (3-Yr PGWP)',
  },
  {
    id: 'ireland',
    name: 'Ireland',
    degreeName: '1.5-Year Data Science / Tech MSc',
    flag: '🇮🇪',
    tagline: 'European Silicon Docks tech hub with low corporate barriers',
    currencySymbol: '€',
    annualTuition: 22000,
    durationYears: 1.5,
    annualLiving: 15000,
    totalScholarship: 3000,
    annualPartTime: 10000,
    loanAmount: 36000,
    loanInterestRate: 8.5,
    loanTenureYears: 8,
    startingSalary: 54000,
    annualSalaryGrowth: 6.0,
    taxAndLivingRate: 42,
    stayBackYears: 2,
    visaSecurity: 'High (2-Yr Third Level Scheme)',
  },
  {
    id: 'australia',
    name: 'Australia',
    degreeName: '2-Year Master of IT / Software',
    flag: '🇦🇺',
    tagline: 'High student minimum wage & generous post-study work rights',
    currencySymbol: 'A$',
    annualTuition: 44000,
    durationYears: 2,
    annualLiving: 24000,
    totalScholarship: 6000,
    annualPartTime: 16000,
    loanAmount: 72000,
    loanInterestRate: 9.0,
    loanTenureYears: 10,
    startingSalary: 88000,
    annualSalaryGrowth: 5.5,
    taxAndLivingRate: 38,
    stayBackYears: 3,
    visaSecurity: 'High (Subclass 485 Visa)',
  },
];

export default function RoiCalculatorPage() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('usa');

  // Input States initialized from USA
  const [currencySymbol, setCurrencySymbol] = useState<string>('$');
  const [programName, setProgramName] = useState<string>('STEM MS in Computer Science / AI');
  const [countryName, setCountryName] = useState<string>('United States');
  const [annualTuition, setAnnualTuition] = useState<number>(38000);
  const [durationYears, setDurationYears] = useState<number>(2);
  const [annualLiving, setAnnualLiving] = useState<number>(16000);
  const [totalScholarship, setTotalScholarship] = useState<number>(8000);
  const [annualPartTime, setAnnualPartTime] = useState<number>(10000);

  // Loan states
  const [loanAmount, setLoanAmount] = useState<number>(65000);
  const [loanInterestRate, setLoanInterestRate] = useState<number>(9.5);
  const [loanTenureYears, setLoanTenureYears] = useState<number>(10);

  // Outcome states
  const [startingSalary, setStartingSalary] = useState<number>(115000);
  const [annualSalaryGrowth, setAnnualSalaryGrowth] = useState<number>(7.0);
  const [taxAndLivingRate, setTaxAndLivingRate] = useState<number>(42);
  const [stayBackYears, setStayBackYears] = useState<number>(3);

  const [copied, setCopied] = useState(false);

  // Apply a preset
  const handleSelectPreset = (preset: PresetCountry) => {
    setSelectedPresetId(preset.id);
    setCountryName(preset.name);
    setProgramName(preset.degreeName);
    setCurrencySymbol(preset.currencySymbol);
    setAnnualTuition(preset.annualTuition);
    setDurationYears(preset.durationYears);
    setAnnualLiving(preset.annualLiving);
    setTotalScholarship(preset.totalScholarship);
    setAnnualPartTime(preset.annualPartTime);
    setLoanAmount(preset.loanAmount);
    setLoanInterestRate(preset.loanInterestRate);
    setLoanTenureYears(preset.loanTenureYears);
    setStartingSalary(preset.startingSalary);
    setAnnualSalaryGrowth(preset.annualSalaryGrowth);
    setTaxAndLivingRate(preset.taxAndLivingRate);
    setStayBackYears(preset.stayBackYears);
  };

  // Calculations
  const metrics = useMemo(() => {
    // 1. Costs & Investment
    const totalTuitionCost = annualTuition * durationYears;
    const totalLivingCost = annualLiving * durationYears;
    const totalGrossStudyCost = totalTuitionCost + totalLivingCost;
    const totalStudyOffsets = totalScholarship + (annualPartTime * durationYears);
    const netTotalInvestment = Math.max(0, totalGrossStudyCost - totalStudyOffsets);

    // 2. Loan EMI (Monthly amortization formula)
    let monthlyEmi = 0;
    let annualLoanPayment = 0;
    if (loanAmount > 0 && loanTenureYears > 0) {
      const monthlyRate = (loanInterestRate / 100) / 12;
      const totalMonths = loanTenureYears * 12;
      if (monthlyRate > 0) {
        monthlyEmi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
          (Math.pow(1 + monthlyRate, totalMonths) - 1);
      } else {
        monthlyEmi = loanAmount / totalMonths;
      }
      annualLoanPayment = monthlyEmi * 12;
    }

    // 3. 10-Year Projections
    // Year by year: During study years, negative cashflow. After graduation, salary with annual growth minus tax/living minus EMI.
    const yearlyTimeline: {
      year: number;
      label: string;
      annualCashFlow: number;
      cumulativeCashFlow: number;
      isStudyPeriod: boolean;
    }[] = [];

    let runningCashFlow = 0;
    const roundedDuration = Math.ceil(durationYears);

    // Study years
    for (let yr = 1; yr <= roundedDuration; yr++) {
      const studyOutflow = -((totalGrossStudyCost - totalStudyOffsets) / roundedDuration);
      runningCashFlow += studyOutflow;
      yearlyTimeline.push({
        year: yr,
        label: `Year ${yr} (Study)`,
        annualCashFlow: Math.round(studyOutflow),
        cumulativeCashFlow: Math.round(runningCashFlow),
        isStudyPeriod: true,
      });
    }

    // Post-graduation years up to Year 10
    let breakEvenYear = 0;
    let netSavingsAt5YearsPostGrad = 0;

    for (let postYr = 1; postYr <= (10 - roundedDuration); postYr++) {
      const calendarYear = roundedDuration + postYr;
      const currentSalary = startingSalary * Math.pow(1 + annualSalaryGrowth / 100, postYr - 1);
      const postTaxAndLiving = currentSalary * (1 - taxAndLivingRate / 100);
      const debtService = postYr <= loanTenureYears ? annualLoanPayment : 0;
      const annualNetSavings = postTaxAndLiving - debtService;

      const prevCumulative = runningCashFlow;
      runningCashFlow += annualNetSavings;

      if (prevCumulative < 0 && runningCashFlow >= 0 && breakEvenYear === 0) {
        const fraction = Math.abs(prevCumulative) / annualNetSavings;
        breakEvenYear = Number((roundedDuration + postYr - 1 + fraction).toFixed(1));
      }

      if (postYr === 5) {
        netSavingsAt5YearsPostGrad = Math.round(runningCashFlow);
      }

      yearlyTimeline.push({
        year: calendarYear,
        label: `Year ${calendarYear} (Work Yr ${postYr})`,
        annualCashFlow: Math.round(annualNetSavings),
        cumulativeCashFlow: Math.round(runningCashFlow),
        isStudyPeriod: false,
      });
    }

    if (breakEvenYear === 0 && runningCashFlow >= 0) {
      breakEvenYear = Number((roundedDuration + 1).toFixed(1));
    }

    // 10-Year ROI %: (Final Cumulative Wealth / Initial Net Investment) * 100
    const tenYearTotalNetWealth = runningCashFlow;
    const tenYearRoiPercent = netTotalInvestment > 0
      ? Math.round((tenYearTotalNetWealth / netTotalInvestment) * 100)
      : 0;

    // ROI Grade & Assessment
    let grade = 'A';
    let gradeColor = 'var(--v2-green)';
    let gradeDescription = 'High Return on Investment';

    if (breakEvenYear <= 3.0 && tenYearRoiPercent >= 200) {
      grade = 'A+';
      gradeColor = 'var(--v2-green)';
      gradeDescription = 'Exceptional Return on Investment & Fast Payback';
    } else if (breakEvenYear <= 4.2 && tenYearRoiPercent >= 120) {
      grade = 'A';
      gradeColor = '#5EC8D8';
      gradeDescription = 'Strong Return with Solid Career Capital';
    } else if (breakEvenYear <= 5.8 && tenYearRoiPercent >= 50) {
      grade = 'B';
      gradeColor = 'var(--v2-amber)';
      gradeDescription = 'Balanced Viability with Moderate Debt Leverage';
    } else {
      grade = 'C';
      gradeColor = 'var(--v2-rose)';
      gradeDescription = 'High Debt Leverage; Requires Aggressive Post-Grad Placement';
    }

    return {
      netTotalInvestment,
      totalGrossStudyCost,
      totalStudyOffsets,
      monthlyEmi: Math.round(monthlyEmi),
      annualLoanPayment: Math.round(annualLoanPayment),
      breakEvenYear: breakEvenYear > 0 ? breakEvenYear : '> 10',
      netSavingsAt5YearsPostGrad: Math.max(0, netSavingsAt5YearsPostGrad),
      tenYearTotalNetWealth: Math.round(tenYearTotalNetWealth),
      tenYearRoiPercent,
      grade,
      gradeColor,
      gradeDescription,
      yearlyTimeline,
    };
  }, [
    annualTuition,
    durationYears,
    annualLiving,
    totalScholarship,
    annualPartTime,
    loanAmount,
    loanInterestRate,
    loanTenureYears,
    startingSalary,
    annualSalaryGrowth,
    taxAndLivingRate,
  ]);

  const handleCopySummary = () => {
    const text = `🎓 EdSteps Study Abroad ROI Analysis: ${countryName} - ${programName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 Net Out-of-Pocket Investment: ${currencySymbol}${metrics.netTotalInvestment.toLocaleString()}
💳 Monthly Loan EMI: ${currencySymbol}${metrics.monthlyEmi.toLocaleString()} / mo (${loanTenureYears} yrs @ ${loanInterestRate}%)
💼 Expected Starting Salary: ${currencySymbol}${startingSalary.toLocaleString()} / yr
⏱️ Estimated Break-Even Period: ${metrics.breakEvenYear} Years
📈 10-Year Net Wealth Generated: ${currencySymbol}${metrics.tenYearTotalNetWealth.toLocaleString()} (${metrics.tenYearRoiPercent}% ROI)
🏆 EdSteps Investment Grade: Tier ${metrics.grade} (${metrics.gradeDescription})
🛂 Post-Study Work Stay-Back: ${stayBackYears} Years
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Evaluated via EdSteps AI Interview & ROI Lab (https://edsteps.in)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <div style={{ paddingBottom: '90px' }}>
      {/* Hero Section */}
      <section style={{ padding: '64px 0 36px', textAlign: 'center' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 24px' }}>
          <div className="v2-badge">
            <span className="v2-badge-dot" />
            Global Education Financial Intelligence
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.3rem, 5vw, 3.8rem)',
              lineHeight: 1.15,
              marginBottom: '16px',
            }}
          >
            Study Abroad <em>ROI Calculator</em>
          </h1>

          <p
            style={{
              fontSize: '18px',
              maxWidth: '680px',
              margin: '0 auto 36px',
              color: 'var(--v2-muted)',
              lineHeight: 1.7,
            }}
          >
            Quantify total tuition, living costs, education loan EMIs, post-study work authorization, and expected career earnings to discover which destination delivers the highest return on investment.
          </p>

          {/* Quick Preset Selector Grid */}
          <div style={{ marginBottom: '16px', textAlign: 'left' }}>
            <span className="v2-eyebrow" style={{ display: 'block', marginBottom: '10px' }}>
              Select a Target Study Destination Preset
            </span>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: '12px',
              }}
            >
              {PRESET_DESTINATIONS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'rgba(63, 169, 106, 0.12)' : 'var(--v2-card)',
                      border: isSelected
                        ? '1px solid var(--v2-green)'
                        : '1px solid var(--v2-line)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '1.25rem' }}>{preset.flag}</span>
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: '14px',
                          color: isSelected ? 'var(--v2-green)' : 'var(--v2-white)',
                          fontFamily: 'var(--v2-sans)',
                        }}
                      >
                        {preset.name}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '11.5px',
                        color: 'var(--v2-dim)',
                        lineHeight: 1.35,
                      }}
                    >
                      {preset.degreeName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Grid */}
      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px' }}>
        {/* KPI Score Banner */}
        <div
          className="v2-card"
          style={{
            marginBottom: '32px',
            background: 'linear-gradient(135deg, rgba(20, 16, 33, 0.95), rgba(23, 18, 42, 0.95))',
            border: '1px solid rgba(63, 169, 106, 0.3)',
            padding: '28px 32px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px',
              alignItems: 'center',
            }}
          >
            {/* Grade Badge */}
            <div style={{ borderRight: '1px solid var(--v2-line)', paddingRight: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span className="v2-eyebrow" style={{ margin: 0 }}>ROI Grade</span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.06)',
                    color: 'var(--v2-muted)',
                  }}
                >
                  EdSteps Calibrated
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <span
                  style={{
                    fontFamily: 'var(--v2-serif)',
                    fontSize: '3rem',
                    fontWeight: 700,
                    color: metrics.gradeColor,
                    lineHeight: 1,
                  }}
                >
                  {metrics.grade}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--v2-white)', fontWeight: 500 }}>
                  {metrics.gradeDescription}
                </span>
              </div>
            </div>

            {/* Break-Even Period */}
            <div>
              <span className="v2-eyebrow" style={{ marginBottom: '6px' }}>Estimated Break-Even</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span
                  style={{
                    fontFamily: 'var(--v2-mono)',
                    fontSize: '2.2rem',
                    fontWeight: 600,
                    color: 'var(--v2-white)',
                  }}
                >
                  {metrics.breakEvenYear}
                </span>
                <span style={{ fontSize: '14px', color: 'var(--v2-muted)' }}>Years post-grad</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--v2-dim)', margin: 0 }}>
                Includes education loan principal &amp; interest
              </p>
            </div>

            {/* Net Investment */}
            <div>
              <span className="v2-eyebrow" style={{ marginBottom: '6px' }}>Net Total Investment</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span
                  style={{
                    fontFamily: 'var(--v2-mono)',
                    fontSize: '2.2rem',
                    fontWeight: 600,
                    color: 'var(--v2-green)',
                  }}
                >
                  {currencySymbol}{metrics.netTotalInvestment.toLocaleString()}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--v2-dim)', margin: 0 }}>
                Gross: {currencySymbol}{metrics.totalGrossStudyCost.toLocaleString()} (Less Aid: {currencySymbol}{metrics.totalStudyOffsets.toLocaleString()})
              </p>
            </div>

            {/* 10-Year Net Wealth */}
            <div>
              <span className="v2-eyebrow" style={{ marginBottom: '6px' }}>10-Year Cumulative Wealth</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span
                  style={{
                    fontFamily: 'var(--v2-mono)',
                    fontSize: '2.2rem',
                    fontWeight: 600,
                    color: 'var(--v2-purple)',
                  }}
                >
                  {currencySymbol}{metrics.tenYearTotalNetWealth.toLocaleString()}
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--v2-green)',
                    background: 'rgba(63, 169, 106, 0.15)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  +{metrics.tenYearRoiPercent}%
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--v2-dim)', margin: 0 }}>
                Net savings after living costs, taxes &amp; debt
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Calculator Form & Live Metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '28px',
            marginBottom: '40px',
          }}
        >
          {/* Column 1: Financial & Degree Inputs */}
          <div className="v2-card" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <GraduationCap size={18} color="var(--v2-green)" />
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Program &amp; Study Costs</h3>
              </div>
              {/* Currency Selector */}
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '3px', borderRadius: '6px' }}>
                {['$', '€', '£', 'C$', 'A$'].map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => setCurrencySymbol(sym)}
                    style={{
                      background: currencySymbol === sym ? 'var(--v2-green)' : 'transparent',
                      color: currencySymbol === sym ? '#0B0814' : 'var(--v2-muted)',
                      fontWeight: 600,
                      fontSize: '12px',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            {/* Program & Country Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--v2-muted)', marginBottom: '6px' }}>
                  Country Destination
                </label>
                <input
                  type="text"
                  value={countryName}
                  onChange={(e) => setCountryName(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--v2-line)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: 'var(--v2-white)',
                    fontSize: '13.5px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--v2-muted)', marginBottom: '6px' }}>
                  Program Duration (Years)
                </label>
                <select
                  value={durationYears}
                  onChange={(e) => setDurationYears(Number(e.target.value))}
                  style={{
                    width: '100%',
                    background: '#17122A',
                    border: '1px solid var(--v2-line)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: 'var(--v2-white)',
                    fontSize: '13.5px',
                  }}
                >
                  <option value={1}>1.0 Year (Fast Track)</option>
                  <option value={1.5}>1.5 Years</option>
                  <option value={2}>2.0 Years (Standard MS)</option>
                  <option value={3}>3.0 Years</option>
                  <option value={4}>4.0 Years (Undergrad/PhD)</option>
                </select>
              </div>
            </div>

            {/* Annual Tuition */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '12.5px', color: 'var(--v2-muted)' }}>
                  Annual Tuition Fee
                </label>
                <span style={{ fontFamily: 'var(--v2-mono)', fontSize: '13.5px', color: 'var(--v2-white)', fontWeight: 600 }}>
                  {currencySymbol}{annualTuition.toLocaleString()} / yr
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={75000}
                step={1000}
                value={annualTuition}
                onChange={(e) => setAnnualTuition(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--v2-green)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--v2-dim)', marginTop: '4px' }}>
                <span>Free / Public (€0)</span>
                <span>Tier 1 Private ($75k)</span>
              </div>
            </div>

            {/* Annual Living Expenses */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '12.5px', color: 'var(--v2-muted)' }}>
                  Annual Living &amp; Housing Expenses
                </label>
                <span style={{ fontFamily: 'var(--v2-mono)', fontSize: '13.5px', color: 'var(--v2-white)', fontWeight: 600 }}>
                  {currencySymbol}{annualLiving.toLocaleString()} / yr
                </span>
              </div>
              <input
                type="range"
                min={4000}
                max={35000}
                step={500}
                value={annualLiving}
                onChange={(e) => setAnnualLiving(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--v2-green)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--v2-dim)', marginTop: '4px' }}>
                <span>Low CoL ($4k)</span>
                <span>High CoL ($35k)</span>
              </div>
            </div>

            {/* Offsets: Scholarships & Part-time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid var(--v2-line)', paddingTop: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--v2-muted)', marginBottom: '6px' }}>
                  Total Scholarships / Grants ({currencySymbol})
                </label>
                <input
                  type="number"
                  value={totalScholarship}
                  onChange={(e) => setTotalScholarship(Number(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--v2-line)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: 'var(--v2-white)',
                    fontSize: '13.5px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--v2-muted)', marginBottom: '6px' }}>
                  Annual Part-Time Earnings ({currencySymbol})
                </label>
                <input
                  type="number"
                  value={annualPartTime}
                  onChange={(e) => setAnnualPartTime(Number(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--v2-line)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: 'var(--v2-white)',
                    fontSize: '13.5px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Column 2: Loan Financing & Post-Grad Outcomes */}
          <div className="v2-card" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Coins size={18} color="var(--v2-purple)" />
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Loan Financing &amp; Post-Study Salary</h3>
            </div>

            {/* Loan Principal */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '12.5px', color: 'var(--v2-muted)' }}>
                  Education Loan Borrowed
                </label>
                <span style={{ fontFamily: 'var(--v2-mono)', fontSize: '13.5px', color: 'var(--v2-purple)', fontWeight: 600 }}>
                  {currencySymbol}{loanAmount.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={120000}
                step={2500}
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--v2-purple)' }}
              />
            </div>

            {/* Loan Terms: Interest & Tenure */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--v2-muted)', marginBottom: '6px' }}>
                  Interest Rate (% APR)
                </label>
                <input
                  type="number"
                  step={0.1}
                  value={loanInterestRate}
                  onChange={(e) => setLoanInterestRate(Number(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--v2-line)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: 'var(--v2-white)',
                    fontSize: '13.5px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--v2-muted)', marginBottom: '6px' }}>
                  Repayment Tenure (Years)
                </label>
                <select
                  value={loanTenureYears}
                  onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                  style={{
                    width: '100%',
                    background: '#17122A',
                    border: '1px solid var(--v2-line)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: 'var(--v2-white)',
                    fontSize: '13.5px',
                  }}
                >
                  <option value={5}>5 Years (Fast Payoff)</option>
                  <option value={7}>7 Years</option>
                  <option value={8}>8 Years</option>
                  <option value={10}>10 Years (Standard)</option>
                  <option value={12}>12 Years</option>
                  <option value={15}>15 Years</option>
                </select>
              </div>
            </div>

            {/* Precomputed EMI info chip */}
            <div
              style={{
                background: 'rgba(167, 139, 250, 0.08)',
                border: '1px solid rgba(167, 139, 250, 0.22)',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '12.5px', color: 'var(--v2-white)' }}>
                Estimated Monthly EMI:
              </span>
              <span style={{ fontFamily: 'var(--v2-mono)', fontWeight: 700, fontSize: '15px', color: 'var(--v2-purple)' }}>
                {currencySymbol}{metrics.monthlyEmi.toLocaleString()} / mo
              </span>
            </div>

            {/* Expected Starting Salary */}
            <div style={{ borderTop: '1px solid var(--v2-line)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '12.5px', color: 'var(--v2-muted)' }}>
                  Expected Starting Annual Salary (Gross)
                </label>
                <span style={{ fontFamily: 'var(--v2-mono)', fontSize: '14px', color: 'var(--v2-green)', fontWeight: 600 }}>
                  {currencySymbol}{startingSalary.toLocaleString()} / yr
                </span>
              </div>
              <input
                type="range"
                min={30000}
                max={200000}
                step={2500}
                value={startingSalary}
                onChange={(e) => setStartingSalary(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--v2-green)' }}
              />
            </div>

            {/* Post-Grad Growth & Stay-Back */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--v2-muted)', marginBottom: '6px' }}>
                  Annual Salary Growth (%)
                </label>
                <input
                  type="number"
                  step={0.5}
                  value={annualSalaryGrowth}
                  onChange={(e) => setAnnualSalaryGrowth(Number(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--v2-line)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: 'var(--v2-white)',
                    fontSize: '13.5px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--v2-muted)', marginBottom: '6px' }}>
                  Work Visa Stay-Back (Years)
                </label>
                <select
                  value={stayBackYears}
                  onChange={(e) => setStayBackYears(Number(e.target.value))}
                  style={{
                    width: '100%',
                    background: '#17122A',
                    border: '1px solid var(--v2-line)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: 'var(--v2-white)',
                    fontSize: '13.5px',
                  }}
                >
                  <option value={1}>1 Year</option>
                  <option value={1.5}>1.5 Years (Germany)</option>
                  <option value={2}>2 Years (UK / Ireland)</option>
                  <option value={3}>3 Years (USA STEM / Canada / Aus)</option>
                  <option value={4}>4 Years (Regional Aus)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Visual 10-Year Cumulative Cash Flow Projection */}
        <div className="v2-card" style={{ marginBottom: '40px', padding: '28px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span className="v2-eyebrow">Financial Trajectory</span>
              <h3 style={{ fontSize: '1.4rem', margin: '4px 0 6px' }}>
                10-Year Net Wealth Accumulation Path
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--v2-muted)', margin: 0 }}>
                Shows transition from investment deficit to break-even payback and compounding net savings.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopySummary}
              className="v2-pill v2-pill-ghost"
              style={{ padding: '8px 18px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              {copied ? <Check size={14} color="var(--v2-green)" /> : <Copy size={14} />}
              {copied ? 'Copied Summary!' : 'Copy ROI Report'}
            </button>
          </div>

          {/* Timeline Bar visualization */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {metrics.yearlyTimeline.map((item) => {
              const isPositive = item.cumulativeCashFlow >= 0;
              const maxScale = Math.max(
                Math.abs(metrics.yearlyTimeline[0]?.cumulativeCashFlow || 50000),
                metrics.tenYearTotalNetWealth,
                100000
              );
              const barPercent = Math.min(100, Math.max(4, Math.round((Math.abs(item.cumulativeCashFlow) / maxScale) * 100)));

              return (
                <div
                  key={item.year}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '150px 1fr 140px',
                    alignItems: 'center',
                    gap: '16px',
                    fontSize: '13px',
                  }}
                >
                  <div style={{ color: item.isStudyPeriod ? 'var(--v2-amber)' : 'var(--v2-white)', fontWeight: 500 }}>
                    {item.label}
                  </div>

                  {/* Progress track */}
                  <div
                    style={{
                      height: '24px',
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${barPercent}%`,
                        background: isPositive
                          ? 'linear-gradient(90deg, rgba(63, 169, 106, 0.4), #3FA96A)'
                          : 'linear-gradient(90deg, rgba(244, 63, 94, 0.4), #F43F5E)',
                        borderRadius: '6px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        left: '12px',
                        fontSize: '11px',
                        fontFamily: 'var(--v2-mono)',
                        color: 'var(--v2-white)',
                        fontWeight: 600,
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                      }}
                    >
                      Annual: {item.annualCashFlow > 0 ? '+' : ''}{currencySymbol}{item.annualCashFlow.toLocaleString()}
                    </span>
                  </div>

                  {/* Cumulative amount */}
                  <div
                    style={{
                      textAlign: 'right',
                      fontFamily: 'var(--v2-mono)',
                      fontWeight: 600,
                      color: isPositive ? 'var(--v2-green)' : 'var(--v2-rose)',
                    }}
                  >
                    {isPositive ? '+' : ''}{currencySymbol}{item.cumulativeCashFlow.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cross-Country Benchmark Comparison Table */}
        <div className="v2-card" style={{ marginBottom: '40px', padding: '28px 32px' }}>
          <div style={{ marginBottom: '20px' }}>
            <span className="v2-eyebrow">Benchmark Comparison</span>
            <h3 style={{ fontSize: '1.4rem', margin: '4px 0 6px' }}>
              Top Global Study Destinations at a Glance
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--v2-muted)', margin: 0 }}>
              Standard representative MS programs across core student visa destinations.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--v2-line)', color: 'var(--v2-dim)' }}>
                  <th style={{ padding: '12px 16px' }}>Destination</th>
                  <th style={{ padding: '12px 16px' }}>Program Duration</th>
                  <th style={{ padding: '12px 16px' }}>Est. Starting Salary</th>
                  <th style={{ padding: '12px 16px' }}>Work Stay-Back</th>
                  <th style={{ padding: '12px 16px' }}>Payback Speed</th>
                  <th style={{ padding: '12px 16px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {PRESET_DESTINATIONS.map((dest) => {
                  const isCurrent = selectedPresetId === dest.id;
                  return (
                    <tr
                      key={dest.id}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        background: isCurrent ? 'rgba(63, 169, 106, 0.08)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--v2-white)' }}>
                        <span style={{ marginRight: '8px' }}>{dest.flag}</span>
                        {dest.name}
                        <div style={{ fontSize: '11px', color: 'var(--v2-muted)', fontWeight: 400 }}>
                          {dest.degreeName}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--v2-white)' }}>
                        {dest.durationYears} {dest.durationYears === 1 ? 'Year' : 'Years'}
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: 'var(--v2-mono)', color: 'var(--v2-green)', fontWeight: 600 }}>
                        {dest.currencySymbol}{dest.startingSalary.toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--v2-muted)' }}>
                        {dest.visaSecurity}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            background: dest.id === 'germany' || dest.id === 'usa' ? 'rgba(63, 169, 106, 0.15)' : 'rgba(167, 139, 250, 0.15)',
                            color: dest.id === 'germany' || dest.id === 'usa' ? 'var(--v2-green)' : 'var(--v2-purple)',
                          }}
                        >
                          {dest.id === 'germany' ? '1.4 Yrs (Fastest)' : dest.id === 'usa' ? '2.1 Yrs (High Peak)' : '2.5 - 3.2 Yrs'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          type="button"
                          onClick={() => handleSelectPreset(dest)}
                          style={{
                            background: isCurrent ? 'var(--v2-green)' : 'rgba(255,255,255,0.06)',
                            color: isCurrent ? '#08130C' : 'var(--v2-white)',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {isCurrent ? 'Active' : 'Load Model'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA to Interview Lab */}
        <div
          className="v2-card"
          style={{
            textAlign: 'center',
            padding: '48px 32px',
            background: 'radial-gradient(ellipse at center, rgba(63, 169, 106, 0.15), rgba(20, 16, 33, 0.98))',
            border: '1px solid rgba(63, 169, 106, 0.35)',
          }}
        >
          <div className="v2-badge" style={{ marginBottom: '16px' }}>
            <span className="v2-badge-dot" />
            Next Step: Pass The Visa Officer Interview
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>
            Your ROI only matters if you <em>secure the visa.</em>
          </h2>
          <p
            style={{
              maxWidth: '620px',
              margin: '0 auto 28px',
              fontSize: '16px',
              color: 'var(--v2-muted)',
              lineHeight: 1.7,
            }}
          >
            Practice real-time verbal answers for F-1 non-immigrant intent, 214(b) ties, financial funding proof, and consular scrutiny with our real-time voice simulator.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link href="/" className="v2-pill v2-pill-solid" style={{ fontSize: '15px', padding: '12px 28px' }}>
              Launch Consular Visa Mock
              <ArrowRight size={16} />
            </Link>
            <button
              type="button"
              onClick={handleCopySummary}
              className="v2-pill v2-pill-ghost"
              style={{ fontSize: '15px', padding: '12px 24px' }}
            >
              {copied ? 'Summary Copied to Clipboard!' : 'Copy Detailed ROI Report'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
