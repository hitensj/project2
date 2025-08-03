import React, { useState } from 'react';
import { HelpCircle, MessageSquare, Sun, Moon, Lightbulb, TrendingUp } from 'lucide-react';

function App() {
  // --- Input State Variables ---
  const [propertyPrice, setPropertyPrice] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [propertyTax, setPropertyTax] = useState('');
  const [homeInsurance, setHomeInsurance] = useState('');
  const [extraPayment, setExtraPayment] = useState('');
  
  // --- Calculation Result State Variables ---
  const [monthlyPayment, setMonthlyPayment] = useState(null);
  const [totalPayment, setTotalPayment] = useState(null);
  const [totalInterest, setTotalInterest] = useState(null);
  const [error, setError] = useState('');
  const [amortizationSchedule, setAmortizationSchedule] = useState([]);

  // --- UI State Variables ---
  const [showAmortization, setShowAmortization] = useState(false);
  const [showGlossaryModal, setShowGlossaryModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // --- AI State Variables ---
  const [isGeneratingTips, setIsGeneratingTips] = useState(false);
  const [isGeneratingOutlook, setIsGeneratingOutlook] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiModalTitle, setAiModalTitle] = useState('');
  const [aiModalContent, setAiModalContent] = useState('');

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Function to handle the mortgage calculation
  const calculateMortgage = () => {
    setError('');
    setMonthlyPayment(null);
    setTotalPayment(null);
    setTotalInterest(null);
    setAmortizationSchedule([]);
    setShowAmortization(false);
    setShowAiModal(false);

    // Input Validation
    if (!propertyPrice || !downPayment || !interestRate || !loanTerm) {
      setError('Please fill in all required fields (Property Price, Down Payment, Interest Rate, Loan Term).');
      return;
    }
    
    if (isNaN(propertyPrice) || isNaN(downPayment) || isNaN(interestRate) || isNaN(loanTerm) ||
        (propertyTax && isNaN(propertyTax)) || (homeInsurance && isNaN(homeInsurance)) || 
        (extraPayment && isNaN(extraPayment))) {
      setError('Please enter valid numbers for all fields.');
      return;
    }
    
    if (parseFloat(propertyPrice) <= 0 || parseFloat(downPayment) < 0 || 
        parseFloat(interestRate) < 0 || parseFloat(loanTerm) <= 0) {
      setError('Property price and loan term must be positive. Down payment and interest rate cannot be negative.');
      return;
    }
    
    if (parseFloat(downPayment) >= parseFloat(propertyPrice)) {
      setError('Down payment must be less than the property price.');
      return;
    }

    // Convert inputs to numbers
    const P_price = parseFloat(propertyPrice);
    const DP = parseFloat(downPayment);
    const annualRate = parseFloat(interestRate);
    const years = parseFloat(loanTerm);
    const annualTax = parseFloat(propertyTax || 0);
    const annualInsurance = parseFloat(homeInsurance || 0);
    const monthlyExtraPayment = parseFloat(extraPayment || 0);

    // Calculate loan amount
    const P = P_price - DP;
    const i = annualRate === 0 ? 0 : (annualRate / 100) / 12;
    const n = years * 12;

    let calculatedBaseMonthlyPayment;

    // Mortgage calculation
    if (i === 0) {
      calculatedBaseMonthlyPayment = P / n;
    } else {
      const numerator = i * Math.pow((1 + i), n);
      const denominator = Math.pow((1 + i), n) - 1;
      calculatedBaseMonthlyPayment = P * (numerator / denominator);
    }

    // Add monthly property tax and insurance
    const monthlyTax = annualTax / 12;
    const monthlyInsurance = annualInsurance / 12;
    const totalCalculatedMonthlyPayment = calculatedBaseMonthlyPayment + monthlyTax + monthlyInsurance;

    // Amortization Schedule Calculation
    let balance = P;
    let schedule = [];
    let currentMonth = 0;
    let effectiveMonthlyPaymentForAmortization = calculatedBaseMonthlyPayment + monthlyExtraPayment;

    while (balance > 0 && currentMonth < n) {
      currentMonth++;
      let interestForMonth = balance * i;
      let principalForMonth = effectiveMonthlyPaymentForAmortization - interestForMonth;

      if (principalForMonth > balance) {
        principalForMonth = balance;
        effectiveMonthlyPaymentForAmortization = interestForMonth + principalForMonth;
      }

      balance -= principalForMonth;

      schedule.push({
        month: currentMonth,
        payment: effectiveMonthlyPaymentForAmortization.toFixed(2),
        principal: principalForMonth.toFixed(2),
        interest: interestForMonth.toFixed(2),
        balance: Math.max(0, balance).toFixed(2),
      });

      if (balance <= 0) break;
    }

    const actualTotalPayment = schedule.reduce((sum, entry) => sum + parseFloat(entry.payment), 0);
    const actualTotalInterest = schedule.reduce((sum, entry) => sum + parseFloat(entry.interest), 0);

    setMonthlyPayment(totalCalculatedMonthlyPayment.toFixed(2));
    setTotalPayment(actualTotalPayment.toFixed(2));
    setTotalInterest(actualTotalInterest.toFixed(2));
    setAmortizationSchedule(schedule);
  };

  // Reset function
  const resetCalculator = () => {
    setPropertyPrice('');
    setDownPayment('');
    setInterestRate('');
    setLoanTerm('');
    setPropertyTax('');
    setHomeInsurance('');
    setExtraPayment('');
    setMonthlyPayment(null);
    setTotalPayment(null);
    setTotalInterest(null);
    setError('');
    setAmortizationSchedule([]);
    setShowAmortization(false);
    setShowGlossaryModal(false);
    setShowFeedbackModal(false);
    setIsGeneratingTips(false);
    setIsGeneratingOutlook(false);
    setShowAiModal(false);
  };

  // Glossary terms
  const glossaryTerms = [
    { term: "Property Price", definition: "The total purchase price of the home." },
    { term: "Down Payment", definition: "The initial upfront payment made when purchasing a property, reducing the amount of the loan needed." },
    { term: "Loan Amount", definition: "The total amount of money borrowed from a lender, which is the property price minus the down payment." },
    { term: "Interest Rate", definition: "The cost of borrowing money, expressed as a percentage of the principal over a year (Annual Percentage Rate - APR)." },
    { term: "Loan Term", definition: "The duration over which the loan is repaid, typically in years (e.g., 15 or 30 years)." },
    { term: "Monthly Payment (P&I)", definition: "The principal and interest portion of your monthly mortgage payment. This does not include taxes or insurance." },
    { term: "Total Payment", definition: "The sum of all monthly payments over the entire loan term." },
    { term: "Total Interest Paid", definition: "The cumulative amount of interest paid over the life of the loan." },
    { term: "Property Tax", definition: "An annual tax levied by the local government on real estate." },
    { term: "Home Insurance", definition: "Insurance that protects your home and belongings against damage or loss." },
    { term: "Extra Payment", definition: "An optional additional amount paid on top of the regular monthly mortgage payment." },
    { term: "Amortization Schedule", definition: "A table detailing each mortgage payment breakdown." },
  ];

  // Feedback handler
  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    const token = e.target.token.value;
    const complaint = e.target.complaint.value;
    console.log("Feedback Submitted:", { token, complaint });
    alert(`Thank you for your feedback! Your token/ID is: ${token}. (This is a demo)`);
    setShowFeedbackModal(false);
  };

  // AI Tips function
  const getMortgageTips = async () => {
    if (monthlyPayment === null) {
      setError('Please calculate your mortgage first to get personalized tips.');
      return;
    }
    setIsGeneratingTips(true);
    setError('');

    // Simulate API response
    setTimeout(() => {
      const mockTips = `Based on your mortgage details, here are personalized tips:

1. **Extra Payments Impact**: Your loan of ₹${(parseFloat(propertyPrice) - parseFloat(downPayment)).toFixed(0)} can be paid off faster with extra payments. Even ₹5,000 extra monthly can save lakhs in interest.

2. **Tax Benefits**: Take advantage of Section 24(b) for interest deduction (up to ₹2 lakhs) and Section 80C for principal repayment (up to ₹1.5 lakhs).

3. **Emergency Fund**: Maintain 6-12 months of EMI as emergency fund before making extra payments.

4. **Rate Review**: Monitor interest rates quarterly. If rates drop by 0.5% or more, consider refinancing.

5. **Prepayment Strategy**: Use bonuses and windfalls for partial prepayments to reduce principal.`;
      
      setAiModalTitle('💡 Personalized Mortgage Tips');
      setAiModalContent(mockTips);
      setShowAiModal(true);
      setIsGeneratingTips(false);
    }, 2000);
  };

  // Market Outlook function
  const getMarketOutlook = async () => {
    setIsGeneratingOutlook(true);
    setError('');

    // Simulate API response
    setTimeout(() => {
      const mockOutlook = `Current Indian Real Estate Market Outlook:

1. **Interest Rates**: Home loan rates are currently in the 8.5-9.5% range, with stability expected due to RBI's monetary policy stance.

2. **Property Prices**: Major metros showing moderate growth of 3-5% annually, with affordable housing gaining traction.

3. **Market Trends**: Increasing demand for ready-to-move properties and improved infrastructure boosting suburban markets.

4. **Investment Perspective**: Real estate remains a good long-term investment with current government initiatives supporting housing.`;
      
      setAiModalTitle('📈 Indian Real Estate Market Outlook');
      setAiModalContent(mockOutlook);
      setShowAiModal(true);
      setIsGeneratingOutlook(false);
    }, 2000);
  };

  return (
    <div className={`min-h-screen p-4 transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-gradient-to-br from-gray-50 to-blue-50 text-gray-800'
    }`}>
      <div className={`max-w-4xl mx-auto rounded-xl shadow-2xl p-6 sm:p-8 transition-all duration-300 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl sm:text-4xl font-bold ${
            isDarkMode ? 'text-teal-400' : 'text-emerald-700'
          }`}>
            Mortgage Calculator
          </h1>
          <button
            onClick={toggleDarkMode}
            className={`p-3 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 ${
              isDarkMode 
                ? 'text-yellow-300 hover:bg-gray-700 focus:ring-yellow-400' 
                : 'text-amber-500 hover:bg-gray-100 focus:ring-amber-400'
            }`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>

        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Property Price (₹) *
            </label>
            <input
              type="number"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none transition duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-teal-400 focus:border-teal-400' 
                  : 'bg-white border-gray-300 text-gray-800 focus:ring-emerald-500 focus:border-emerald-500'
              }`}
              placeholder="e.g., 5000000"
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(e.target.value)}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Down Payment (₹) *
            </label>
            <input
              type="number"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none transition duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-teal-400 focus:border-teal-400' 
                  : 'bg-white border-gray-300 text-gray-800 focus:ring-emerald-500 focus:border-emerald-500'
              }`}
              placeholder="e.g., 1000000"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Annual Interest Rate (%) *
            </label>
            <input
              type="number"
              step="0.01"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none transition duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-teal-400 focus:border-teal-400' 
                  : 'bg-white border-gray-300 text-gray-800 focus:ring-emerald-500 focus:border-emerald-500'
              }`}
              placeholder="e.g., 7.5"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Loan Term (Years) *
            </label>
            <input
              type="number"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none transition duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-teal-400 focus:border-teal-400' 
                  : 'bg-white border-gray-300 text-gray-800 focus:ring-emerald-500 focus:border-emerald-500'
              }`}
              placeholder="e.g., 20"
              value={loanTerm}
              onChange={(e) => setLoanTerm(e.target.value)}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Annual Property Tax (₹, Optional)
            </label>
            <input
              type="number"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none transition duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-teal-400 focus:border-teal-400' 
                  : 'bg-white border-gray-300 text-gray-800 focus:ring-emerald-500 focus:border-emerald-500'
              }`}
              placeholder="e.g., 12000"
              value={propertyTax}
              onChange={(e) => setPropertyTax(e.target.value)}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Annual Home Insurance (₹, Optional)
            </label>
            <input
              type="number"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none transition duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-teal-400 focus:border-teal-400' 
                  : 'bg-white border-gray-300 text-gray-800 focus:ring-emerald-500 focus:border-emerald-500'
              }`}
              placeholder="e.g., 6000"
              value={homeInsurance}
              onChange={(e) => setHomeInsurance(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Extra Monthly Payment (₹, Optional)
            </label>
            <input
              type="number"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none transition duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-teal-400 focus:border-teal-400' 
                  : 'bg-white border-gray-300 text-gray-800 focus:ring-emerald-500 focus:border-emerald-500'
              }`}
              placeholder="e.g., 5000"
              value={extraPayment}
              onChange={(e) => setExtraPayment(e.target.value)}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`border px-4 py-3 rounded-lg mb-6 text-center ${
            isDarkMode 
              ? 'bg-red-800 border-red-600 text-red-100' 
              : 'bg-red-100 border-red-400 text-red-700'
          }`}>
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={calculateMortgage}
            className={`flex-1 font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 ${
              isDarkMode 
                ? 'bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-300' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-400'
            }`}
          >
            Calculate Mortgage
          </button>
          <button
            onClick={resetCalculator}
            className={`flex-1 font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 ${
              isDarkMode 
                ? 'bg-gray-600 hover:bg-gray-500 text-gray-100 focus:ring-gray-400' 
                : 'bg-gray-300 hover:bg-gray-400 text-gray-800 focus:ring-gray-400'
            }`}
          >
            Reset All
          </button>
        </div>

        {/* Results */}
        {monthlyPayment !== null && (
          <div className={`p-6 rounded-lg shadow-inner border mb-6 ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600' 
              : 'bg-emerald-50 border-emerald-200'
          }`}>
            <h2 className={`text-2xl font-semibold mb-6 text-center ${
              isDarkMode ? 'text-teal-300' : 'text-emerald-800'
            }`}>
              Your Mortgage Details
            </h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-lg">
                <span className="font-medium">Monthly Payment:</span>
                <span className={`font-bold text-xl ${
                  isDarkMode ? 'text-teal-300' : 'text-emerald-700'
                }`}>
                  ₹{monthlyPayment}
                </span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="font-medium">Total Payment:</span>
                <span className={`font-bold text-xl ${
                  isDarkMode ? 'text-teal-300' : 'text-emerald-700'
                }`}>
                  ₹{totalPayment}
                </span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="font-medium">Total Interest:</span>
                <span className={`font-bold text-xl ${
                  isDarkMode ? 'text-teal-300' : 'text-emerald-700'
                }`}>
                  ₹{totalInterest}
                </span>
              </div>
            </div>

            {/* Amortization Toggle */}
            {amortizationSchedule.length > 0 && (
              <button
                onClick={() => setShowAmortization(!showAmortization)}
                className={`w-full py-3 mb-4 rounded-lg font-semibold transition duration-200 ${
                  isDarkMode 
                    ? 'bg-teal-600 hover:bg-teal-500 text-white' 
                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                }`}
              >
                {showAmortization ? 'Hide' : 'Show'} Amortization Schedule
              </button>
            )}

            {/* Amortization Table */}
            {showAmortization && amortizationSchedule.length > 0 && (
              <div className="mb-6 max-h-96 overflow-y-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={`sticky top-0 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-4 py-2 text-left text-xs font-medium uppercase ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>Month</th>
                      <th className={`px-4 py-2 text-left text-xs font-medium uppercase ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>Payment</th>
                      <th className={`px-4 py-2 text-left text-xs font-medium uppercase ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>Principal</th>
                      <th className={`px-4 py-2 text-left text-xs font-medium uppercase ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>Interest</th>
                      <th className={`px-4 py-2 text-left text-xs font-medium uppercase ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>Balance</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                    {amortizationSchedule.map((entry) => (
                      <tr key={entry.month} className={`${
                        isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'
                      }`}>
                        <td className="px-4 py-2 text-sm">{entry.month}</td>
                        <td className="px-4 py-2 text-sm">₹{entry.payment}</td>
                        <td className="px-4 py-2 text-sm">₹{entry.principal}</td>
                        <td className="px-4 py-2 text-sm">₹{entry.interest}</td>
                        <td className="px-4 py-2 text-sm">₹{entry.balance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* AI Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={getMortgageTips}
                disabled={isGeneratingTips}
                className={`flex-1 flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 ${
                  isGeneratingTips 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : (isDarkMode 
                        ? 'bg-blue-700 hover:bg-blue-600 text-white focus:ring-blue-300' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-400')
                }`}
              >
                {isGeneratingTips ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Lightbulb size={20} />
                )}
                Get Mortgage Tips ✨
              </button>
              
              <button
                onClick={getMarketOutlook}
                disabled={isGeneratingOutlook}
                className={`flex-1 flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 ${
                  isGeneratingOutlook 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : (isDarkMode 
                        ? 'bg-purple-700 hover:bg-purple-600 text-white focus:ring-purple-300' 
                        : 'bg-purple-500 hover:bg-purple-600 text-white focus:ring-purple-400')
                }`}
              >
                {isGeneratingOutlook ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <TrendingUp size={20} />
                )}
                Market Outlook ✨
              </button>
            </div>
          </div>
        )}

        {/* Help Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setShowGlossaryModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition duration-200 ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <HelpCircle size={18} />
            Glossary
          </button>
          
          <button
            onClick={() => setShowFeedbackModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition duration-200 ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <MessageSquare size={18} />
            Feedback
          </button>
        </div>
      </div>

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-hidden ${
            isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'
          }`}>
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-teal-300' : 'text-emerald-700'
            }`}>
              {aiModalTitle}
            </h2>
            <div className="max-h-96 overflow-y-auto pr-2 mb-6">
              <pre className="text-sm whitespace-pre-wrap leading-relaxed font-sans">
                {aiModalContent}
              </pre>
            </div>
            <button
              onClick={() => setShowAiModal(false)}
              className={`w-full py-3 rounded-lg font-semibold transition duration-200 focus:outline-none focus:ring-2 ${
                isDarkMode 
                  ? 'bg-teal-600 hover:bg-teal-500 text-white focus:ring-teal-400' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-400'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Glossary Modal */}
      {showGlossaryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-hidden ${
            isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'
          }`}>
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-teal-300' : 'text-emerald-700'
            }`}>
              📚 Glossary of Terms
            </h2>
            <div className="max-h-96 overflow-y-auto pr-2 mb-6">
              {glossaryTerms.map((item, index) => (
                <div key={index} className={`mb-4 pb-3 border-b last:border-b-0 ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-200'
                }`}>
                  <h3 className={`font-semibold text-lg mb-1 ${
                    isDarkMode ? 'text-teal-200' : 'text-emerald-600'
                  }`}>
                    {item.term}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    {item.definition}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowGlossaryModal(false)}
              className={`w-full py-3 rounded-lg font-semibold transition duration-200 focus:outline-none focus:ring-2 ${
                isDarkMode 
                  ? 'bg-teal-600 hover:bg-teal-500 text-white focus:ring-teal-400' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-400'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl shadow-2xl p-6 w-full max-w-md ${
            isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'
          }`}>
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-teal-300' : 'text-emerald-700'
            }`}>
              💬 Provide Feedback
            </h2>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Your ID/Token (Optional)
                </label>
                <input
                  type="text"
                  name="token"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none transition duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-teal-400' 
                      : 'bg-white border-gray-300 text-gray-800 focus:ring-emerald-500'
                  }`}
                  placeholder="e.g., USER-12345"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Your Feedback *
                </label>
                <textarea
                  name="complaint"
                  rows="4"
                  required
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none transition duration-200 resize-y ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-teal-400' 
                      : 'bg-white border-gray-300 text-gray-800 focus:ring-emerald-500'
                  }`}
                  placeholder="Share your thoughts, suggestions, or report issues..."
                ></textarea>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className={`flex-1 font-bold py-3 px-4 rounded-lg transition duration-300 focus:outline-none focus:ring-2 ${
                    isDarkMode 
                      ? 'bg-teal-600 hover:bg-teal-500 text-white focus:ring-teal-300' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-400'
                  }`}
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className={`flex-1 font-bold py-3 px-4 rounded-lg transition duration-300 focus:outline-none focus:ring-2 ${
                    isDarkMode 
                      ? 'bg-gray-600 hover:bg-gray-500 text-gray-100 focus:ring-gray-400' 
                      : 'bg-gray-300 hover:bg-gray-400 text-gray-800 focus:ring-gray-400'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;