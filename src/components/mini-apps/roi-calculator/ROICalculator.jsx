'use client';

import { useState } from 'react';

export default function ROICalculator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Calculator Type
    calculationType: '', // 'billing' or 'missed-calls'

    // Step 2: Business Context
    industry: '',
    businessAge: '',
    employeeCount: '',
    revenueType: 'monthly', // 'monthly' or 'yearly'
    grossRevenue: '',

    // Step 2a: Billing specific
    uncollectedBilling: '',
    collectionMethod: '', // 'manual', 'automated', 'none'

    // Step 2b: Missed calls specific
    missedCallsPerDay: '',
    averageTicketValue: '',
    currentFollowUpMethod: '', // 'manual', 'voicemail', 'none'

    // Step 3: Contact Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    city: '',
    state: '',
    zip: '',
    consentTransactional: false,
    consentMarketing: false,
  });

  const [results, setResults] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [missedCallsCost, setMissedCallsCost] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Auto-calculate missed calls cost when relevant fields change
    if (name === 'missedCallsPerDay' || name === 'averageTicketValue' || name === 'revenueType') {
      calculateMissedCallsCost(
        name === 'missedCallsPerDay' ? value : formData.missedCallsPerDay,
        name === 'averageTicketValue' ? value : formData.averageTicketValue,
        name === 'revenueType' ? value : formData.revenueType
      );
    }
  };

  const calculateMissedCallsCost = (missedCalls, ticketValue, revenueType) => {
    const calls = parseFloat(missedCalls) || 0;
    const ticket = parseFloat(ticketValue) || 0;

    if (calls > 0 && ticket > 0) {
      const period = revenueType === 'monthly' ? 30 : 365;
      const totalMissedCalls = calls * period;
      const conversionRate = 0.25; // 25% conversion rate assumption
      const potentialConversions = totalMissedCalls * conversionRate;
      const totalLostRevenue = potentialConversions * ticket;

      setMissedCallsCost({
        totalMissedCalls,
        potentialConversions,
        totalLostRevenue,
        period: revenueType
      });
    } else {
      setMissedCallsCost(null);
    }
  };

  const calculateROI = () => {
    const revenue = parseFloat(formData.grossRevenue) || 0;
    let potentialRevenue = 0;
    let estimatedCost = 0;
    let roi = 0;
    let details = {};

    // Industry multipliers based on typical profit margins and collection rates
    const industryMultipliers = {
      'healthcare': 1.15,
      'legal': 1.10,
      'construction': 1.05,
      'retail': 0.95,
      'hospitality': 1.00,
      'professional-services': 1.08,
      'other': 1.00
    };

    const industryMultiplier = industryMultipliers[formData.industry] || 1.00;

    if (formData.calculationType === 'billing') {
      // Option 1: Uncollected Billing
      const uncollected = parseFloat(formData.uncollectedBilling) || 0;

      // Base collection rate adjusted by current method
      let baseCollectionRate = 0.40; // 40% average

      // Adjust based on current collection method
      if (formData.collectionMethod === 'none') {
        baseCollectionRate = 0.50; // Higher potential if not collecting at all
      } else if (formData.collectionMethod === 'manual') {
        baseCollectionRate = 0.45; // Some improvement over manual
      } else if (formData.collectionMethod === 'automated') {
        baseCollectionRate = 0.35; // Already have some automation
      }

      const collectionRate = baseCollectionRate * industryMultiplier;
      potentialRevenue = uncollected * collectionRate;

      // AI solution cost varies by business size
      let baseCost = 750;
      if (formData.employeeCount === '1-10') baseCost = 500;
      else if (formData.employeeCount === '11-50') baseCost = 750;
      else if (formData.employeeCount === '51+') baseCost = 1200;

      estimatedCost = formData.revenueType === 'monthly' ? baseCost : baseCost * 12;

      roi = ((potentialRevenue - estimatedCost) / estimatedCost) * 100;

      details = {
        uncollectedAmount: uncollected,
        collectionRate: collectionRate * 100,
        potentialRecovered: potentialRevenue,
        netGain: potentialRevenue - estimatedCost,
        currentMethod: formData.collectionMethod,
        industryFactor: industryMultiplier
      };
    } else {
      // Option 2: Missed Calls
      const missedCalls = parseFloat(formData.missedCallsPerDay) || 0;
      const ticketValue = parseFloat(formData.averageTicketValue) || 0;

      // Calculate monthly/yearly missed opportunities
      const period = formData.revenueType === 'monthly' ? 30 : 365;
      const totalMissedCalls = missedCalls * period;

      // Base conversion rate adjusted by current follow-up method
      let baseConversionRate = 0.25;

      if (formData.currentFollowUpMethod === 'none') {
        baseConversionRate = 0.30; // Higher potential if no follow-up
      } else if (formData.currentFollowUpMethod === 'voicemail') {
        baseConversionRate = 0.28; // Some improvement over voicemail only
      } else if (formData.currentFollowUpMethod === 'manual') {
        baseConversionRate = 0.22; // Already have manual follow-up
      }

      const conversionRate = baseConversionRate * industryMultiplier;
      const potentialConversions = totalMissedCalls * conversionRate;
      potentialRevenue = potentialConversions * ticketValue;

      // AI call return system cost varies by volume
      let baseCost = 500;
      if (missedCalls <= 5) baseCost = 400;
      else if (missedCalls <= 15) baseCost = 600;
      else if (missedCalls > 15) baseCost = 900;

      estimatedCost = formData.revenueType === 'monthly' ? baseCost : baseCost * 12;

      roi = ((potentialRevenue - estimatedCost) / estimatedCost) * 100;

      details = {
        missedCallsPerDay: missedCalls,
        totalMissedCalls,
        conversionRate: conversionRate * 100,
        potentialConversions,
        averageTicketValue: ticketValue,
        potentialRevenue,
        netGain: potentialRevenue - estimatedCost,
        currentMethod: formData.currentFollowUpMethod,
        industryFactor: industryMultiplier
      };
    }

    return {
      type: formData.calculationType,
      revenueType: formData.revenueType,
      grossRevenue: revenue,
      potentialRevenue,
      estimatedCost,
      roi: roi.toFixed(2),
      details,
    };
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    const calculatedResults = calculateROI();
    setResults(calculatedResults);
    handleNext(); // Move to results step
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.calculationType !== '';
      case 2:
        if (formData.calculationType === 'billing') {
          return formData.industry && formData.employeeCount &&
                 formData.grossRevenue && formData.uncollectedBilling &&
                 formData.collectionMethod;
        } else {
          return formData.industry && formData.employeeCount &&
                 formData.grossRevenue && formData.missedCallsPerDay &&
                 formData.averageTicketValue && formData.currentFollowUpMethod;
        }
      case 3:
        return formData.firstName && formData.lastName && formData.email &&
               formData.phone && formData.company && formData.city &&
               formData.state && formData.zip &&
               formData.consentTransactional && formData.consentMarketing;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!results) {
      setSubmitMessage('Please calculate ROI first.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const webhookData = {
        // Contact Information
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        consentTransactional: formData.consentTransactional,
        consentMarketing: formData.consentMarketing,

        // Business Context
        industry: formData.industry,
        businessAge: formData.businessAge,
        employeeCount: formData.employeeCount,

        // Calculator Data
        calculationType: formData.calculationType,
        revenueType: formData.revenueType,
        grossRevenue: formData.grossRevenue,

        // Type-specific fields
        ...(formData.calculationType === 'billing'
          ? {
              uncollectedBilling: formData.uncollectedBilling,
              collectionMethod: formData.collectionMethod
            }
          : {
              missedCallsPerDay: formData.missedCallsPerDay,
              averageTicketValue: formData.averageTicketValue,
              currentFollowUpMethod: formData.currentFollowUpMethod
            }
        ),

        // Results
        results: results,
      };

      const webhookUrl = process.env.NEXT_PUBLIC_ROI_CALCULATOR_WEBHOOK;

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      if (response.ok) {
        setSubmitMessage('Thank you! Your results have been sent. We\'ll be in touch soon to discuss your custom AI strategy.');
        // Reset form after successful submission
        setTimeout(() => {
          setCurrentStep(1);
          setFormData({
            calculationType: '',
            industry: '',
            businessAge: '',
            employeeCount: '',
            revenueType: 'monthly',
            grossRevenue: '',
            uncollectedBilling: '',
            collectionMethod: '',
            missedCallsPerDay: '',
            averageTicketValue: '',
            currentFollowUpMethod: '',
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            company: '',
            city: '',
            state: '',
            zip: '',
            consentTransactional: false,
            consentMarketing: false,
          });
          setResults(null);
          setMissedCallsCost(null);
          setSubmitMessage('');
        }, 5000);
      } else {
        setSubmitMessage('There was an error submitting your results. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting to webhook:', error);
      setSubmitMessage('There was an error submitting your results. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <>
      {/* Texas AI Custom Styling */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');

        .font-hesdeadjim {
          font-family: 'Arial Black', 'Arial Bold', sans-serif;
          font-weight: 900;
          font-style: italic;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .roi-calculator-container {
          font-family: 'Space Mono', monospace;
        }

        .roi-calculator-container .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scan {
          0%, 100% {
            transform: translateX(-100%) translateY(-50%);
          }
          50% {
            transform: translateX(100%) translateY(-50%);
          }
        }

        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style>

      <div className="min-h-screen bg-black w-full overflow-x-hidden roi-calculator-container">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header - Command Center Style */}
            <div className="mb-8 text-center animate-fade-in">
              <div className="mb-4">
                <span
                  className="inline-block px-4 py-1 text-sm font-mono uppercase tracking-widest"
                  style={{
                    color: '#2c75ff',
                    border: '1px solid rgba(44, 117, 255, 0.5)',
                    background: 'rgba(44, 117, 255, 0.1)',
                    boxShadow: '0 0 15px rgba(44, 117, 255, 0.3)'
                  }}
                >
                  ▶ SYSTEM ONLINE
                </span>
              </div>
              <h1
                className="text-5xl font-bold text-[#ebcb4c] mb-2 font-hesdeadjim"
                style={{ textShadow: '0 0 20px rgba(235, 203, 76, 0.6), 2px 2px 0px rgba(0, 0, 0, 0.8)' }}
              >
                AI INTEGRATION<br />ROI CALCULATOR
              </h1>
              <div
                className="inline-block h-1 w-32 mt-2 mb-4"
                style={{
                  background: 'linear-gradient(90deg, transparent, #2c75ff, transparent)',
                  boxShadow: '0 0 10px rgba(44, 117, 255, 0.6)'
                }}
              />
              <p className="text-lg font-mono" style={{ color: '#9ca3af', letterSpacing: '0.05em' }}>
                // Discover revenue recovery potential with AI automation
              </p>
            </div>

          {/* Star Trek Progress Indicator */}
          <div className="mb-8 relative">
            {/* Background "Scanner" Effect */}
            <div className="absolute inset-0 overflow-hidden" style={{ height: '60px' }}>
              <div
                className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#2c75ff] to-transparent opacity-30"
                style={{
                  animation: 'scan 3s ease-in-out infinite',
                  filter: 'blur(2px)'
                }}
              />
            </div>

            <div className="flex items-center justify-between relative z-10">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    {/* LCARS-style Step Indicator */}
                    <div className="relative">
                      {/* Outer Ring Glow */}
                      {currentStep >= step && (
                        <div
                          className="absolute inset-0 rounded-full animate-pulse"
                          style={{
                            background: 'radial-gradient(circle, rgba(44, 117, 255, 0.4) 0%, transparent 70%)',
                            width: '60px',
                            height: '60px',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                          }}
                        />
                      )}

                      {/* Main Hexagon */}
                      <div
                        className={`w-12 h-12 flex items-center justify-center font-bold transition-all relative ${
                          currentStep === step ? 'animate-pulse' : ''
                        }`}
                        style={{
                          clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                          background: currentStep >= step
                            ? 'linear-gradient(135deg, #2c75ff 0%, #1a5acc 100%)'
                            : '#374151',
                          boxShadow: currentStep >= step
                            ? '0 0 20px rgba(44, 117, 255, 0.8), inset 0 0 10px rgba(255, 255, 255, 0.3)'
                            : 'none',
                          border: currentStep >= step ? '2px solid rgba(255, 255, 255, 0.5)' : '2px solid #4b5563',
                        }}
                      >
                        <span
                          className="font-mono text-lg"
                          style={{
                            color: currentStep >= step ? '#ffffff' : '#9ca3af',
                            textShadow: currentStep >= step ? '0 0 8px rgba(255, 255, 255, 0.8)' : 'none',
                            fontWeight: 'bold'
                          }}
                        >
                          {step}
                        </span>
                      </div>

                      {/* Active Step Indicator Bars */}
                      {currentStep === step && (
                        <>
                          <div
                            className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#ebcb4c]"
                            style={{
                              boxShadow: '0 0 10px rgba(235, 203, 76, 0.8)',
                              animation: 'blink 1s infinite'
                            }}
                          />
                          <div
                            className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#ebcb4c]"
                            style={{
                              boxShadow: '0 0 10px rgba(235, 203, 76, 0.8)',
                              animation: 'blink 1s infinite 0.5s'
                            }}
                          />
                        </>
                      )}
                    </div>

                    {/* Step Label */}
                    <div
                      className={`text-xs mt-3 text-center font-mono uppercase tracking-wider transition-all ${
                        currentStep >= step ? 'text-[#ebcb4c] font-bold' : 'text-gray-500'
                      }`}
                      style={{
                        textShadow: currentStep >= step ? '0 0 8px rgba(235, 203, 76, 0.5)' : 'none',
                        letterSpacing: '0.1em'
                      }}
                    >
                      {step === 1 && '▶ TYPE'}
                      {step === 2 && '▶ DATA'}
                      {step === 3 && '▶ ID'}
                      {step === 4 && '▶ CALC'}
                    </div>
                  </div>

                  {/* Connecting Line */}
                  {step < 4 && (
                    <div className="flex-1 mx-2 relative" style={{ height: '3px', marginTop: '-20px' }}>
                      {/* Background line */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background: 'linear-gradient(90deg, #374151 0%, #374151 100%)',
                          height: '3px'
                        }}
                      />
                      {/* Active line with animation */}
                      <div
                        className="absolute inset-0 transition-all duration-500"
                        style={{
                          background: currentStep > step
                            ? 'linear-gradient(90deg, #2c75ff 0%, #1a5acc 100%)'
                            : 'transparent',
                          height: '3px',
                          boxShadow: currentStep > step ? '0 0 10px rgba(44, 117, 255, 0.6)' : 'none',
                          width: currentStep > step ? '100%' : '0%',
                          transformOrigin: 'left'
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>

          {/* Disclaimer Notice */}
          {currentStep === 1 && (
            <div
              className="mb-6 p-4 bg-yellow-900/20 border-l-4 border-yellow-500 rounded"
              style={{ boxShadow: '0 0 10px rgba(234, 179, 8, 0.2)' }}
            >
              <div className="flex items-start">
                <span className="text-yellow-500 text-2xl mr-3">⚠️</span>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">Important Notice</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    The calculations provided by this ROI calculator are purely estimates based on current market trends,
                    industry averages, and general assumptions. Actual results may vary significantly depending on your
                    specific business circumstances, implementation approach, market conditions, and various other factors.
                    These estimates should not be considered guaranteed outcomes or financial advice. For a detailed and
                    accurate assessment tailored to your business, please contact us for a personalized consultation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Calculator Type Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div
                className="bg-[#f4f4f4] p-8 rounded-lg border border-[#ebcb4c]"
                style={{ boxShadow: '0 0 30px rgba(235, 203, 76, 0.15)' }}
              >
                <h2 className="text-3xl font-semibold text-black mb-2 font-hesdeadjim" style={{ textShadow: '2px 2px 0px rgba(235, 203, 76, 0.4)' }}>
                  // What's costing your business money?
                </h2>
                <p className="text-gray-700 mb-6">Choose the area where you're losing revenue</p>

                <div className="space-y-4">
                  <label
                    className={`block p-6 rounded-lg border-2 cursor-pointer transition-all hover:border-[#2c75ff] ${
                      formData.calculationType === 'billing'
                        ? 'border-[#2c75ff] bg-white'
                        : 'border-gray-300 bg-white'
                    }`}
                    style={
                      formData.calculationType === 'billing'
                        ? { boxShadow: '0 0 20px rgba(44, 117, 255, 0.3)' }
                        : {}
                    }
                  >
                    <div className="flex items-start">
                      <input
                        type="radio"
                        name="calculationType"
                        value="billing"
                        checked={formData.calculationType === 'billing'}
                        onChange={handleInputChange}
                        className="w-6 h-6 mt-1 text-[#2c75ff] flex-shrink-0"
                      />
                      <div className="ml-4">
                        <h3 className="text-xl font-bold text-[#2c75ff] mb-2">
                          Unpaid Invoices & Uncollected Billing
                        </h3>
                        <p className="text-gray-800 mb-3">
                          Are you struggling to collect payments from clients? Money that's already been earned but never collected?
                        </p>
                        <div className="bg-[#e8e8e8] p-4 rounded border border-[#2c75ff]/30">
                          <p className="text-sm text-gray-700 mb-2 font-semibold">AI can help you:</p>
                          <ul className="text-sm text-gray-800 space-y-1">
                            <li>• Automatically send payment reminders via email and text</li>
                            <li>• Make personalized follow-up calls to past-due accounts</li>
                            <li>• Recover 30-50% of uncollected revenue</li>
                            <li>• Save hours of manual collections work</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`block p-6 rounded-lg border-2 cursor-pointer transition-all hover:border-[#2c75ff] ${
                      formData.calculationType === 'missed-calls'
                        ? 'border-[#2c75ff] bg-white'
                        : 'border-gray-300 bg-white'
                    }`}
                    style={
                      formData.calculationType === 'missed-calls'
                        ? { boxShadow: '0 0 20px rgba(44, 117, 255, 0.3)' }
                        : {}
                    }
                  >
                    <div className="flex items-start">
                      <input
                        type="radio"
                        name="calculationType"
                        value="missed-calls"
                        checked={formData.calculationType === 'missed-calls'}
                        onChange={handleInputChange}
                        className="w-6 h-6 mt-1 text-[#2c75ff] flex-shrink-0"
                      />
                      <div className="ml-4">
                        <h3 className="text-xl font-bold text-[#2c75ff] mb-2">
                          Missed Calls & Lost Opportunities
                        </h3>
                        <p className="text-gray-800 mb-3">
                          Are potential customers calling but not getting through? Every missed call is a potential sale walking out the door.
                        </p>
                        <div className="bg-[#e8e8e8] p-4 rounded border border-[#2c75ff]/30">
                          <p className="text-sm text-gray-700 mb-2 font-semibold">AI can help you:</p>
                          <ul className="text-sm text-gray-800 space-y-1">
                            <li>• Automatically return missed calls with personalized messages</li>
                            <li>• Answer common questions 24/7 via phone AI</li>
                            <li>• Convert 25-30% of missed calls into sales</li>
                            <li>• Never miss a lead, even after hours</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <button
                onClick={handleNext}
                disabled={!validateStep(1)}
                className="w-full py-4 text-xl font-bold font-hesdeadjim disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{
                  color: '#ebcb4c',
                  background: 'rgba(14, 32, 66, 0.85)',
                  border: '2px solid #ebcb4c',
                  clipPath: 'polygon(0 0, 100% 0, 98% 100%, 2% 100%)',
                  textShadow: '0 0 8px rgba(235, 203, 76, 0.7)',
                  boxShadow: '0 0 20px rgba(235, 203, 76, 0.5)',
                  letterSpacing: '1px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#2c75ff';
                  e.target.style.borderColor = '#2c75ff';
                  e.target.style.textShadow = '0 0 8px rgba(44, 117, 255, 0.7)';
                  e.target.style.boxShadow = '0 0 25px rgba(44, 117, 255, 0.6)';
                  e.target.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#ebcb4c';
                  e.target.style.borderColor = '#ebcb4c';
                  e.target.style.textShadow = '0 0 8px rgba(235, 203, 76, 0.7)';
                  e.target.style.boxShadow = '0 0 20px rgba(235, 203, 76, 0.5)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                NEXT: BUSINESS DATA ▶
              </button>
            </div>
          )}

          {/* STEP 2: Business Information */}
          {currentStep === 2 && (
            <form onSubmit={(e) => {
              e.preventDefault();
              handleNext();
            }} className="space-y-6">
              <div
                className="bg-[#f4f4f4] p-8 rounded-lg border border-[#ebcb4c]"
                style={{ boxShadow: '0 0 30px rgba(235, 203, 76, 0.15)' }}
              >
                <h2 className="text-3xl font-semibold text-black mb-2 font-hesdeadjim" style={{ textShadow: '2px 2px 0px rgba(235, 203, 76, 0.4)' }}>
                  // Tell us about your business
                </h2>
                <p className="text-gray-700 mb-6">This helps us calculate a more accurate ROI for your specific situation</p>

                <div className="space-y-6">
                  {/* Industry */}
                  <div>
                    <label className="block text-gray-800 mb-2 font-semibold">What industry are you in?</label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded focus:outline-none focus:border-[#2c75ff]"
                    >
                      <option value="">Select your industry...</option>
                      <option value="healthcare">Healthcare & Medical</option>
                      <option value="legal">Legal Services</option>
                      <option value="construction">Construction & Contracting</option>
                      <option value="retail">Retail & E-commerce</option>
                      <option value="hospitality">Hospitality & Food Service</option>
                      <option value="professional-services">Professional Services</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Business Age */}
                  <div>
                    <label className="block text-gray-800 mb-2 font-semibold">How long have you been in business?</label>
                    <select
                      name="businessAge"
                      value={formData.businessAge}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded focus:outline-none focus:border-[#2c75ff]"
                    >
                      <option value="">Select...</option>
                      <option value="0-2">Less than 2 years</option>
                      <option value="2-5">2-5 years</option>
                      <option value="5-10">5-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>

                  {/* Employee Count */}
                  <div>
                    <label className="block text-gray-800 mb-2 font-semibold">How many employees do you have?</label>
                    <select
                      name="employeeCount"
                      value={formData.employeeCount}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded focus:outline-none focus:border-[#2c75ff]"
                    >
                      <option value="">Select...</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51+">51+ employees</option>
                    </select>
                  </div>

                  {/* Revenue Period */}
                  <div>
                    <label className="block text-gray-800 mb-2 font-semibold">Calculate for:</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="revenueType"
                          value="monthly"
                          checked={formData.revenueType === 'monthly'}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-[#2c75ff]"
                        />
                        <span className="text-gray-800">Monthly ROI</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="revenueType"
                          value="yearly"
                          checked={formData.revenueType === 'yearly'}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-[#2c75ff]"
                        />
                        <span className="text-gray-800">Yearly ROI</span>
                      </label>
                    </div>
                  </div>

                  {/* Gross Revenue */}
                  <div>
                    <label className="block text-gray-800 mb-2 font-semibold">
                      What's your {formData.revenueType === 'monthly' ? 'monthly' : 'annual'} revenue?
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-xl">$</span>
                      <input
                        type="number"
                        name="grossRevenue"
                        value={formData.grossRevenue}
                        onChange={handleInputChange}
                        placeholder="100000"
                        required
                        min="0"
                        className="w-full pl-8 pr-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded focus:outline-none focus:border-[#2c75ff]"
                      />
                    </div>
                  </div>

                  {/* Billing-specific questions */}
                  {formData.calculationType === 'billing' && (
                    <>
                      <div className="pt-4 border-t-2 border-gray-300">
                        <h3 className="text-xl font-semibold text-black mb-4 font-hesdeadjim">// About Your Uncollected Billing</h3>
                      </div>

                      <div>
                        <label className="block text-gray-800 mb-2 font-semibold">
                          How much in uncollected billing do you currently have?
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-xl">$</span>
                          <input
                            type="number"
                            name="uncollectedBilling"
                            value={formData.uncollectedBilling}
                            onChange={handleInputChange}
                            placeholder="25000"
                            required
                            min="0"
                            className="w-full pl-8 pr-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded focus:outline-none focus:border-[#2c75ff]"
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          This is the total amount owed to you that hasn't been paid yet
                        </p>
                      </div>

                      <div>
                        <label className="block text-gray-800 mb-2 font-semibold">
                          How do you currently handle collections?
                        </label>
                        <select
                          name="collectionMethod"
                          value={formData.collectionMethod}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded focus:outline-none focus:border-[#2c75ff]"
                        >
                          <option value="">Select...</option>
                          <option value="none">We don't actively pursue collections</option>
                          <option value="manual">Manual calls/emails by staff</option>
                          <option value="automated">Some automated reminders</option>
                        </select>
                      </div>
                    </>
                  )}

                  {/* Missed calls-specific questions */}
                  {formData.calculationType === 'missed-calls' && (
                    <>
                      <div className="pt-4 border-t-2 border-gray-300">
                        <h3 className="text-xl font-semibold text-black mb-4 font-hesdeadjim">// About Your Missed Calls</h3>
                      </div>

                      <div>
                        <label className="block text-gray-800 mb-2 font-semibold">
                          About how many calls do you miss per day?
                        </label>
                        <input
                          type="number"
                          name="missedCallsPerDay"
                          value={formData.missedCallsPerDay}
                          onChange={handleInputChange}
                          placeholder="5"
                          required
                          min="0"
                          className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded focus:outline-none focus:border-[#2c75ff]"
                        />
                        <p className="text-sm text-gray-600 mt-2">
                          Include calls that go to voicemail or are never answered
                        </p>
                      </div>

                      <div>
                        <label className="block text-gray-800 mb-2 font-semibold">
                          What's your average sale or transaction value?
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-xl">$</span>
                          <input
                            type="number"
                            name="averageTicketValue"
                            value={formData.averageTicketValue}
                            onChange={handleInputChange}
                            placeholder="500"
                            required
                            min="0"
                            className="w-full pl-8 pr-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded focus:outline-none focus:border-[#2c75ff]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-800 mb-2 font-semibold">
                          How do you currently follow up on missed calls?
                        </label>
                        <select
                          name="currentFollowUpMethod"
                          value={formData.currentFollowUpMethod}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded focus:outline-none focus:border-[#2c75ff]"
                        >
                          <option value="">Select...</option>
                          <option value="none">We don't follow up</option>
                          <option value="voicemail">Voicemail only</option>
                          <option value="manual">Staff manually calls back</option>
                        </select>
                      </div>

                      {/* Live preview of lost revenue */}
                      {missedCallsCost && (
                        <div className="mt-4 p-6 bg-red-900/20 border-2 border-red-500/50 rounded-lg animate-pulse">
                          <h3 className="text-xl font-semibold text-red-400 mb-3 flex items-center">
                            <span className="text-2xl mr-2">⚠️</span>
                            You're Currently Losing Money
                          </h3>
                          <div className="space-y-2 text-gray-300">
                            <p className="text-2xl font-bold text-red-400">
                              {formatCurrency(missedCallsCost.totalLostRevenue)}
                              <span className="text-base font-normal text-gray-400"> / {missedCallsCost.period}</span>
                            </p>
                            <p className="text-sm text-gray-400">
                              Based on {missedCallsCost.totalMissedCalls.toFixed(0)} missed calls and
                              {missedCallsCost.potentialConversions.toFixed(0)} potential sales lost
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-1/3 py-4 text-lg font-bold font-hesdeadjim transition-all"
                  style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    background: 'transparent',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    clipPath: 'polygon(0 0, 100% 0, 98% 100%, 2% 100%)',
                    letterSpacing: '1px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#ffffff';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    e.target.style.background = 'transparent';
                  }}
                >
                  ◀ BACK
                </button>
                <button
                  type="submit"
                  disabled={!validateStep(2)}
                  className="w-2/3 py-4 text-lg font-bold font-hesdeadjim disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{
                    color: '#ebcb4c',
                    background: 'rgba(14, 32, 66, 0.85)',
                    border: '2px solid #ebcb4c',
                    clipPath: 'polygon(0 0, 100% 0, 98% 100%, 2% 100%)',
                    textShadow: '0 0 8px rgba(235, 203, 76, 0.7)',
                    boxShadow: '0 0 20px rgba(235, 203, 76, 0.5)',
                    letterSpacing: '1px'
                  }}
                  onMouseEnter={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.color = '#2c75ff';
                      e.target.style.borderColor = '#2c75ff';
                      e.target.style.textShadow = '0 0 8px rgba(44, 117, 255, 0.7)';
                      e.target.style.boxShadow = '0 0 25px rgba(44, 117, 255, 0.6)';
                      e.target.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.color = '#ebcb4c';
                      e.target.style.borderColor = '#ebcb4c';
                      e.target.style.textShadow = '0 0 8px rgba(235, 203, 76, 0.7)';
                      e.target.style.boxShadow = '0 0 20px rgba(235, 203, 76, 0.5)';
                      e.target.style.transform = 'scale(1)';
                    }
                  }}
                >
                  NEXT: CONTACT INFO ▶
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Contact Information */}
          {currentStep === 3 && (
            <form onSubmit={handleCalculate} className="space-y-6">
              <div
                className="bg-[#f4f4f4] p-8 rounded-lg border border-[#ebcb4c]"
                style={{ boxShadow: '0 0 30px rgba(235, 203, 76, 0.15)' }}
              >
                <h2 className="text-3xl font-semibold text-black mb-2 font-hesdeadjim" style={{ textShadow: '2px 2px 0px rgba(235, 203, 76, 0.4)' }}>
                  // Almost there! Get your results
                </h2>
                <p className="text-gray-700 mb-6">Enter your contact information to see your personalized ROI calculation</p>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-800 mb-2 font-semibold">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded focus:outline-none focus:border-[#2c75ff]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-800 mb-2 font-semibold">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded focus:outline-none focus:border-[#2c75ff]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-800 mb-2 font-semibold">Company Name *</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded focus:outline-none focus:border-[#2c75ff]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-800 mb-2 font-semibold">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded focus:outline-none focus:border-[#2c75ff]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-800 mb-2 font-semibold">Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded focus:outline-none focus:border-[#2c75ff]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-800 mb-2 font-semibold">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded focus:outline-none focus:border-[#2c75ff]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-800 mb-2 font-semibold">State *</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        maxLength="2"
                        placeholder="TX"
                        className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded focus:outline-none focus:border-[#2c75ff] uppercase"
                        style={{ textTransform: 'uppercase' }}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-800 mb-2 font-semibold">ZIP Code *</label>
                      <input
                        type="text"
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        required
                        maxLength="10"
                        placeholder="12345"
                        className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded focus:outline-none focus:border-[#2c75ff]"
                      />
                    </div>
                  </div>

                  {/* Consent Checkboxes */}
                  <div className="pt-4 border-t-2 border-gray-300">
                    <div className="space-y-4">
                      <label className="flex items-start space-x-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          name="consentTransactional"
                          checked={formData.consentTransactional}
                          onChange={handleInputChange}
                          required
                          className="w-5 h-5 mt-1 text-[#2c75ff] bg-white border-gray-300 rounded focus:ring-[#2c75ff] focus:ring-2 flex-shrink-0"
                        />
                        <span className="text-gray-800 text-sm leading-relaxed">
                          By checking this box, I consent to receive transactional messages related to my account, orders, or services I have requested. These messages may include appointment reminders, order confirmations, and account notifications among others. Message frequency may vary. Message & Data rates may apply. Reply HELP for help or STOP to opt-out. <span className="text-red-600">*</span>
                        </span>
                      </label>

                      <label className="flex items-start space-x-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          name="consentMarketing"
                          checked={formData.consentMarketing}
                          onChange={handleInputChange}
                          required
                          className="w-5 h-5 mt-1 text-[#2c75ff] bg-white border-gray-300 rounded focus:ring-[#2c75ff] focus:ring-2 flex-shrink-0"
                        />
                        <span className="text-gray-800 text-sm leading-relaxed">
                          By checking this box, I consent to receive marketing and promotional messages, including special offers, discounts, new product updates among others. Message frequency may vary. Message & Data rates may apply. Reply HELP for help or STOP to opt-out. <span className="text-red-600">*</span>
                        </span>
                      </label>

                      <p className="text-xs text-gray-600 mt-4">
                        By submitting this form, you also agree to our{' '}
                        <a href="/blog/terms-of-use-2025" className="text-[#2c75ff] hover:text-[#ebcb4c] underline">
                          Terms of Use
                        </a>{' '}
                        and{' '}
                        <a href="/blog/privacy-policy-2025" className="text-[#2c75ff] hover:text-[#ebcb4c] underline">
                          Privacy Policy
                        </a>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-1/3 py-4 text-lg font-bold font-hesdeadjim transition-all"
                  style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    background: 'transparent',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    clipPath: 'polygon(0 0, 100% 0, 98% 100%, 2% 100%)',
                    letterSpacing: '1px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#ffffff';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    e.target.style.background = 'transparent';
                  }}
                >
                  ◀ BACK
                </button>
                <button
                  type="submit"
                  disabled={!validateStep(3)}
                  className="w-2/3 py-4 text-lg font-bold font-hesdeadjim disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{
                    color: '#1a1a1a',
                    background: '#ebcb4c',
                    border: '2px solid #ebcb4c',
                    clipPath: 'polygon(0 0, 100% 0, 98% 100%, 2% 100%)',
                    boxShadow: '0 0 25px rgba(235, 203, 76, 0.8)',
                    letterSpacing: '1px'
                  }}
                  onMouseEnter={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.background = '#d4b53f';
                      e.target.style.borderColor = '#d4b53f';
                      e.target.style.boxShadow = '0 0 30px rgba(235, 203, 76, 0.9)';
                      e.target.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.background = '#ebcb4c';
                      e.target.style.borderColor = '#ebcb4c';
                      e.target.style.boxShadow = '0 0 25px rgba(235, 203, 76, 0.8)';
                      e.target.style.transform = 'scale(1)';
                    }
                  }}
                >
                  CALCULATE ROI ▶
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Results Display */}
          {currentStep === 4 && results && (
            <div className="space-y-6">
              {/* Hero Results Card */}
              <div
                className="bg-gradient-to-br from-[#0e2042] to-[#1a3a5c] p-8 rounded-lg border-2 border-[#ebcb4c]"
                style={{ boxShadow: '0 0 30px rgba(235, 203, 76, 0.5)' }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold text-[#ebcb4c] mb-2 font-hesdeadjim">
                    Your Potential ROI
                  </h2>
                  <p className="text-gray-300">
                    Here's how much AI automation could add to your bottom line
                  </p>
                </div>

                {/* Key Metrics - Prominent Display */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div
                    className="bg-[#0e2042] p-6 rounded-lg text-center border-2 border-[#2c75ff]"
                    style={{ boxShadow: '0 0 15px rgba(44, 117, 255, 0.4)' }}
                  >
                    <p className="text-gray-400 text-sm mb-2 uppercase tracking-wide">New Revenue Potential</p>
                    <p className="text-4xl font-bold text-[#2c75ff] mb-1">
                      {formatCurrency(results.potentialRevenue)}
                    </p>
                    <p className="text-xs text-gray-400">per {results.revenueType === 'monthly' ? 'month' : 'year'}</p>
                  </div>
                  <div
                    className="bg-[#0e2042] p-6 rounded-lg text-center border-2 border-[#ebcb4c]"
                    style={{ boxShadow: '0 0 15px rgba(235, 203, 76, 0.4)' }}
                  >
                    <p className="text-gray-400 text-sm mb-2 uppercase tracking-wide">Investment Required</p>
                    <p className="text-4xl font-bold text-[#ebcb4c] mb-1">
                      {formatCurrency(results.estimatedCost)}
                    </p>
                    <p className="text-xs text-gray-400">per {results.revenueType === 'monthly' ? 'month' : 'year'}</p>
                  </div>
                  <div
                    className="bg-[#0e2042] p-6 rounded-lg text-center border-2 border-green-500"
                    style={{ boxShadow: '0 0 15px rgba(34, 197, 94, 0.4)' }}
                  >
                    <p className="text-gray-400 text-sm mb-2 uppercase tracking-wide">Return on Investment</p>
                    <p className="text-4xl font-bold text-green-400 mb-1">
                      {results.roi}%
                    </p>
                    <p className="text-xs text-gray-400">ROI</p>
                  </div>
                </div>

                {/* Net Gain Highlight */}
                <div
                  className="bg-green-900/30 border-2 border-green-500 p-6 rounded-lg text-center"
                  style={{ boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)' }}
                >
                  <p className="text-gray-300 text-lg mb-2">Your Potential Net Profit Increase</p>
                  <p className="text-5xl font-bold text-green-400 mb-2">
                    {formatCurrency(results.details.netGain)}
                  </p>
                  <p className="text-sm text-gray-400">
                    Every {results.revenueType === 'monthly' ? 'month' : 'year'} after AI implementation
                  </p>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div
                className="bg-[#0e2042] p-8 rounded-lg border-l-4 border-[#2c75ff]"
                style={{ boxShadow: '0 0 15px rgba(44, 117, 255, 0.3)' }}
              >
                <h3 className="text-2xl font-semibold text-[#2c75ff] mb-6 font-hesdeadjim">
                  How We Calculated This
                </h3>
                <div className="space-y-4 text-gray-300">
                  {results.type === 'billing' ? (
                    <>
                      <div className="flex justify-between items-center py-3 border-b border-gray-700">
                        <span className="font-semibold">Current Uncollected Billing:</span>
                        <span className="text-xl text-[#2c75ff]">
                          {formatCurrency(results.details.uncollectedAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-700">
                        <span className="font-semibold">AI Recovery Rate:</span>
                        <span className="text-xl text-[#ebcb4c]">
                          {results.details.collectionRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-700">
                        <span className="font-semibold">Expected Revenue Recovery:</span>
                        <span className="text-xl text-green-400">
                          {formatCurrency(results.details.potentialRecovered)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-700">
                        <span className="font-semibold">Current Collection Method:</span>
                        <span className="text-xl capitalize">
                          {formData.collectionMethod.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="bg-blue-900/20 p-4 rounded mt-4">
                        <p className="text-sm text-gray-300">
                          Based on your {formData.industry.replace('-', ' ')} industry and current {formData.collectionMethod} collection approach,
                          AI-powered multi-channel collections (email, text, and voice) could recover an additional{' '}
                          <span className="text-[#ebcb4c] font-bold">{results.details.collectionRate.toFixed(1)}%</span> of uncollected billing.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center py-3 border-b border-gray-700">
                        <span className="font-semibold">Missed Calls Per Day:</span>
                        <span className="text-xl text-[#2c75ff]">
                          {results.details.missedCallsPerDay}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-700">
                        <span className="font-semibold">Total Missed Calls ({results.revenueType}):</span>
                        <span className="text-xl text-[#ebcb4c]">
                          {results.details.totalMissedCalls.toFixed(0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-700">
                        <span className="font-semibold">AI Conversion Rate:</span>
                        <span className="text-xl text-green-400">
                          {results.details.conversionRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-700">
                        <span className="font-semibold">Potential New Customers:</span>
                        <span className="text-xl text-[#2c75ff]">
                          {results.details.potentialConversions.toFixed(0)} sales
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-700">
                        <span className="font-semibold">Average Transaction Value:</span>
                        <span className="text-xl">
                          {formatCurrency(results.details.averageTicketValue)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-700">
                        <span className="font-semibold">Current Follow-Up Method:</span>
                        <span className="text-xl capitalize">
                          {formData.currentFollowUpMethod}
                        </span>
                      </div>
                      <div className="bg-blue-900/20 p-4 rounded mt-4">
                        <p className="text-sm text-gray-300">
                          Based on your {formData.industry.replace('-', ' ')} industry and {formData.currentFollowUpMethod} follow-up approach,
                          AI-powered call-back systems could convert approximately{' '}
                          <span className="text-[#ebcb4c] font-bold">{results.details.conversionRate.toFixed(1)}%</span> of missed calls into sales.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* CTA Section */}
              <div
                className="bg-[#0e2042] p-8 rounded-lg border-l-4 border-[#ebcb4c] text-center"
                style={{ boxShadow: '0 0 15px rgba(235, 203, 76, 0.3)' }}
              >
                <h3 className="text-3xl font-bold text-[#ebcb4c] mb-4 font-hesdeadjim">
                  Ready to Capture This Revenue?
                </h3>
                <p className="text-gray-300 text-lg mb-6">
                  Our team will create a custom AI implementation plan tailored to your {formData.industry.replace('-', ' ')} business.
                  We'll show you exactly how to capture this {formatCurrency(results.details.netGain)} opportunity.
                </p>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-12 py-5 text-2xl font-bold font-hesdeadjim disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{
                    color: '#1a1a1a',
                    background: '#ebcb4c',
                    border: '3px solid #ebcb4c',
                    clipPath: 'polygon(0 0, 100% 0, 97% 100%, 3% 100%)',
                    boxShadow: '0 0 30px rgba(235, 203, 76, 0.9)',
                    letterSpacing: '2px'
                  }}
                  onMouseEnter={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.background = '#d4b53f';
                      e.target.style.borderColor = '#d4b53f';
                      e.target.style.boxShadow = '0 0 40px rgba(235, 203, 76, 1)';
                      e.target.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.background = '#ebcb4c';
                      e.target.style.borderColor = '#ebcb4c';
                      e.target.style.boxShadow = '0 0 30px rgba(235, 203, 76, 0.9)';
                      e.target.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {isSubmitting ? '▶ TRANSMITTING...' : '▶ GET AI STRATEGY NOW'}
                </button>

                <p className="text-sm text-gray-400 mt-4">
                  We'll email you a detailed breakdown and schedule a consultation to discuss implementation
                </p>

                {submitMessage && (
                  <div
                    className={`mt-6 p-4 rounded-lg text-center font-semibold ${
                      submitMessage.includes('Thank you')
                        ? 'bg-green-900/50 text-green-200 border-2 border-green-500'
                        : 'bg-red-900/50 text-red-200 border-2 border-red-500'
                    }`}
                  >
                    {submitMessage}
                  </div>
                )}
              </div>

              {/* Social Proof / Trust Elements */}
              <div className="bg-gray-800/50 p-6 rounded-lg text-center">
                <p className="text-gray-400 text-sm">
                  Texas AI Consulting specializes in practical AI implementation for businesses like yours.
                  <br />
                  Let's turn this calculation into reality.
                </p>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </>
  );
}
