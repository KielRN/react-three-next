'use client';

import { useState } from 'react';

export default function ROICalculator() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    city: '',
    state: '',
    zip: '',
    calculationType: 'billing', // 'billing' or 'missed-calls'
    revenueType: 'monthly', // 'monthly' or 'yearly'
    grossRevenue: '',
    uncollectedBilling: '', // For Option 1
    missedCallsPerDay: '', // For Option 2
    averageTicketValue: '', // For Option 2
  });

  const [results, setResults] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [missedCallsCost, setMissedCallsCost] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

    if (formData.calculationType === 'billing') {
      // Option 1: Uncollected Billing
      const uncollected = parseFloat(formData.uncollectedBilling) || 0;

      // Assume AI can help collect 30-50% of uncollected billing
      const collectionRate = 0.40; // 40% average
      potentialRevenue = uncollected * collectionRate;

      // AI solution cost (email, text, phone): ~$500-1000/month
      estimatedCost = formData.revenueType === 'monthly' ? 750 : 750 * 12;

      roi = ((potentialRevenue - estimatedCost) / estimatedCost) * 100;

      details = {
        uncollectedAmount: uncollected,
        collectionRate: collectionRate * 100,
        potentialRecovered: potentialRevenue,
        netGain: potentialRevenue - estimatedCost,
      };
    } else {
      // Option 2: Missed Calls
      const missedCalls = parseFloat(formData.missedCallsPerDay) || 0;
      const ticketValue = parseFloat(formData.averageTicketValue) || 0;

      // Calculate monthly/yearly missed opportunities
      const period = formData.revenueType === 'monthly' ? 30 : 365;
      const totalMissedCalls = missedCalls * period;

      // Assume 25% conversion rate on returned calls
      const conversionRate = 0.25;
      const potentialConversions = totalMissedCalls * conversionRate;
      potentialRevenue = potentialConversions * ticketValue;

      // AI call return system cost: ~$300-800/month
      estimatedCost = formData.revenueType === 'monthly' ? 500 : 500 * 12;

      roi = ((potentialRevenue - estimatedCost) / estimatedCost) * 100;

      details = {
        missedCallsPerDay: missedCalls,
        totalMissedCalls,
        conversionRate: conversionRate * 100,
        potentialConversions,
        averageTicketValue: ticketValue,
        potentialRevenue,
        netGain: potentialRevenue - estimatedCost,
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

  const handleCalculate = (e) => {
    e.preventDefault();
    const calculatedResults = calculateROI();
    setResults(calculatedResults);
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone ||
        !formData.company || !formData.city || !formData.state || !formData.zip) {
      setSubmitMessage('Please fill in all required fields.');
      return;
    }

    if (!results) {
      setSubmitMessage('Please calculate ROI first.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const webhookData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        calculationType: formData.calculationType,
        revenueType: formData.revenueType,
        grossRevenue: formData.grossRevenue,
        ...(formData.calculationType === 'billing'
          ? { uncollectedBilling: formData.uncollectedBilling }
          : {
              missedCallsPerDay: formData.missedCallsPerDay,
              averageTicketValue: formData.averageTicketValue
            }
        ),
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
        setSubmitMessage('Thank you! Your results have been sent. We\'ll be in touch soon.');
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            company: '',
            city: '',
            state: '',
            zip: '',
            calculationType: 'billing',
            revenueType: 'monthly',
            grossRevenue: '',
            uncollectedBilling: '',
            missedCallsPerDay: '',
            averageTicketValue: '',
          });
          setResults(null);
          setMissedCallsCost(null);
          setSubmitMessage('');
        }, 3000);
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
    <div className="min-h-screen bg-gray-900 w-full overflow-x-hidden">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-4xl font-bold text-[#2c75ff] mb-4 font-hesdeadjim"
              style={{ textShadow: '0 0 10px rgba(44, 117, 255, 0.7)' }}
            >
              AI Integration ROI Calculator
            </h1>
            <p className="text-xl text-gray-300">
              Calculate the potential return on investment when integrating AI into your business operations.
            </p>
          </div>

          {/* Main Form */}
          <form onSubmit={handleCalculate} className="space-y-6">
            {/* Contact Information */}
            <div
              className="bg-[#0e2042] p-6 rounded-lg border-l-4 border-[#2c75ff]"
              style={{ boxShadow: '0 0 15px rgba(44, 117, 255, 0.3)' }}
            >
              <h2 className="text-2xl font-semibold text-[#ebcb4c] mb-4 font-hesdeadjim">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-[#2c75ff] rounded focus:outline-none focus:border-[#ebcb4c]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-[#2c75ff] rounded focus:outline-none focus:border-[#ebcb4c]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-[#2c75ff] rounded focus:outline-none focus:border-[#ebcb4c]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-[#2c75ff] rounded focus:outline-none focus:border-[#ebcb4c]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-300 mb-2">Company *</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-[#2c75ff] rounded focus:outline-none focus:border-[#ebcb4c]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-[#2c75ff] rounded focus:outline-none focus:border-[#ebcb4c]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    maxLength="2"
                    placeholder="TX"
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-[#2c75ff] rounded focus:outline-none focus:border-[#ebcb4c] uppercase"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">ZIP Code *</label>
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleInputChange}
                    required
                    maxLength="10"
                    placeholder="12345"
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-[#2c75ff] rounded focus:outline-none focus:border-[#ebcb4c]"
                  />
                </div>
              </div>
            </div>

            {/* Calculator Type Selection */}
            <div
              className="bg-[#0e2042] p-6 rounded-lg border-l-4 border-[#ebcb4c]"
              style={{ boxShadow: '0 0 15px rgba(235, 203, 76, 0.3)' }}
            >
              <h2 className="text-2xl font-semibold text-[#ebcb4c] mb-4 font-hesdeadjim">
                Select Calculation Type
              </h2>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="calculationType"
                    value="billing"
                    checked={formData.calculationType === 'billing'}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-[#2c75ff]"
                  />
                  <span className="text-gray-300">
                    Option 1: Uncollected Billing Recovery
                  </span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="calculationType"
                    value="missed-calls"
                    checked={formData.calculationType === 'missed-calls'}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-[#2c75ff]"
                  />
                  <span className="text-gray-300">
                    Option 2: Missed Phone Call Recovery
                  </span>
                </label>
              </div>
            </div>

            {/* Revenue Type Selection */}
            <div
              className="bg-[#0e2042] p-6 rounded-lg border-l-4 border-[#2c75ff]"
              style={{ boxShadow: '0 0 15px rgba(44, 117, 255, 0.3)' }}
            >
              <h2 className="text-2xl font-semibold text-[#2c75ff] mb-4 font-hesdeadjim">
                Revenue Period
              </h2>
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
                  <span className="text-gray-300">Monthly</span>
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
                  <span className="text-gray-300">Yearly</span>
                </label>
              </div>
            </div>

            {/* Business Data Input */}
            <div
              className="bg-[#0e2042] p-6 rounded-lg border-l-4 border-[#ebcb4c]"
              style={{ boxShadow: '0 0 15px rgba(235, 203, 76, 0.3)' }}
            >
              <h2 className="text-2xl font-semibold text-[#ebcb4c] mb-4 font-hesdeadjim">
                Business Data
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">
                    {formData.revenueType === 'monthly' ? 'Monthly' : 'Yearly'} Gross Revenue
                  </label>
                  <input
                    type="number"
                    name="grossRevenue"
                    value={formData.grossRevenue}
                    onChange={handleInputChange}
                    placeholder="Enter your gross revenue"
                    className="w-full px-4 py-2 bg-gray-800 text-white border border-[#2c75ff] rounded focus:outline-none focus:border-[#ebcb4c]"
                  />
                </div>

                {formData.calculationType === 'billing' ? (
                  <div>
                    <label className="block text-gray-300 mb-2">
                      {formData.revenueType === 'monthly' ? 'Monthly' : 'Yearly'} Uncollected Billing Amount
                    </label>
                    <input
                      type="number"
                      name="uncollectedBilling"
                      value={formData.uncollectedBilling}
                      onChange={handleInputChange}
                      placeholder="Enter uncollected billing amount"
                      required
                      className="w-full px-4 py-2 bg-gray-800 text-white border border-[#2c75ff] rounded focus:outline-none focus:border-[#ebcb4c]"
                    />
                    <p className="text-sm text-gray-400 mt-2">
                      AI email, text, and phone calling strategy can help recover 30-50% of uncollected payments.
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-gray-300 mb-2">
                        Missed Phone Calls Per Day
                      </label>
                      <input
                        type="number"
                        name="missedCallsPerDay"
                        value={formData.missedCallsPerDay}
                        onChange={handleInputChange}
                        placeholder="Enter average missed calls per day"
                        required
                        className="w-full px-4 py-2 bg-gray-800 text-white border border-[#2c75ff] rounded focus:outline-none focus:border-[#ebcb4c]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">
                        Average Ticket/Sale Value
                      </label>
                      <input
                        type="number"
                        name="averageTicketValue"
                        value={formData.averageTicketValue}
                        onChange={handleInputChange}
                        placeholder="Enter average transaction value"
                        required
                        className="w-full px-4 py-2 bg-gray-800 text-white border border-[#2c75ff] rounded focus:outline-none focus:border-[#ebcb4c]"
                      />
                      <p className="text-sm text-gray-400 mt-2">
                        AI can return calls and convert approximately 25% of missed opportunities.
                      </p>
                    </div>

                    {/* Missed Calls Cost Calculator */}
                    {missedCallsCost && (
                      <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                        <h3 className="text-lg font-semibold text-red-400 mb-3">
                          💸 Current Cost of Missed Calls
                        </h3>
                        <div className="space-y-2 text-gray-300">
                          <p>
                            <span className="font-semibold">Total Missed Calls ({missedCallsCost.period}):</span>{' '}
                            {missedCallsCost.totalMissedCalls.toFixed(0)}
                          </p>
                          <p>
                            <span className="font-semibold">Lost Opportunities (25% conversion):</span>{' '}
                            {missedCallsCost.potentialConversions.toFixed(0)} sales
                          </p>
                          <p className="text-xl font-bold text-red-400 mt-3">
                            Lost Revenue: {formatCurrency(missedCallsCost.totalLostRevenue)}
                          </p>
                          <p className="text-sm text-gray-400 mt-2">
                            This is revenue you're losing by not having an AI system to return missed calls.
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Calculate Button */}
            <button
              type="submit"
              className="w-full py-4 bg-[#2c75ff] text-white text-xl font-bold rounded-lg hover:bg-[#1a5acc] transition-colors font-hesdeadjim"
              style={{ boxShadow: '0 0 20px rgba(44, 117, 255, 0.5)' }}
            >
              Calculate ROI
            </button>
          </form>

          {/* Results Display */}
          {results && (
            <div className="mt-8 space-y-6">
              <div
                className="bg-[#0e2042] p-8 rounded-lg border-l-4 border-[#ebcb4c]"
                style={{ boxShadow: '0 0 20px rgba(235, 203, 76, 0.4)' }}
              >
                <h2 className="text-3xl font-semibold text-[#ebcb4c] mb-6 font-hesdeadjim">
                  Your ROI Results
                </h2>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <p className="text-gray-400 text-sm mb-2">Potential Revenue</p>
                    <p className="text-3xl font-bold text-[#2c75ff]">
                      {formatCurrency(results.potentialRevenue)}
                    </p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <p className="text-gray-400 text-sm mb-2">Estimated Cost</p>
                    <p className="text-3xl font-bold text-[#ebcb4c]">
                      {formatCurrency(results.estimatedCost)}
                    </p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <p className="text-gray-400 text-sm mb-2">ROI</p>
                    <p className="text-3xl font-bold text-green-400">
                      {results.roi}%
                    </p>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-[#2c75ff] mb-4">
                    Detailed Breakdown
                  </h3>
                  <div className="space-y-3 text-gray-300">
                    {results.type === 'billing' ? (
                      <>
                        <p>
                          <span className="font-semibold">Uncollected Amount:</span>{' '}
                          {formatCurrency(results.details.uncollectedAmount)}
                        </p>
                        <p>
                          <span className="font-semibold">Collection Rate:</span>{' '}
                          {results.details.collectionRate}%
                        </p>
                        <p>
                          <span className="font-semibold">Potential Recovered:</span>{' '}
                          {formatCurrency(results.details.potentialRecovered)}
                        </p>
                        <p className="text-green-400 font-bold text-lg mt-4">
                          Net Gain: {formatCurrency(results.details.netGain)}
                        </p>
                      </>
                    ) : (
                      <>
                        <p>
                          <span className="font-semibold">Missed Calls Per Day:</span>{' '}
                          {results.details.missedCallsPerDay}
                        </p>
                        <p>
                          <span className="font-semibold">
                            Total Missed Calls ({results.revenueType}):
                          </span>{' '}
                          {results.details.totalMissedCalls}
                        </p>
                        <p>
                          <span className="font-semibold">Conversion Rate:</span>{' '}
                          {results.details.conversionRate}%
                        </p>
                        <p>
                          <span className="font-semibold">Potential Conversions:</span>{' '}
                          {results.details.potentialConversions.toFixed(0)}
                        </p>
                        <p>
                          <span className="font-semibold">Average Ticket Value:</span>{' '}
                          {formatCurrency(results.details.averageTicketValue)}
                        </p>
                        <p className="text-green-400 font-bold text-lg mt-4">
                          Net Gain: {formatCurrency(results.details.netGain)}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Results Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-4 bg-[#ebcb4c] text-[#0e2042] text-xl font-bold rounded-lg hover:bg-[#d4b435] transition-colors font-hesdeadjim disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ boxShadow: '0 0 20px rgba(235, 203, 76, 0.5)' }}
              >
                {isSubmitting ? 'Sending...' : 'Get Your Custom AI Strategy'}
              </button>

              {submitMessage && (
                <div
                  className={`p-4 rounded-lg text-center ${
                    submitMessage.includes('Thank you')
                      ? 'bg-green-900 text-green-200'
                      : 'bg-red-900 text-red-200'
                  }`}
                >
                  {submitMessage}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
