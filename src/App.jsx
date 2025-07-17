import React, { useState, useEffect } from 'react';
import { HelpCircle, MessageSquare, Sun, Moon, Lightbulb, TrendingUp } from 'lucide-react'; // Importing new icons

// Main App component for the Mortgage Calculator
function App() {
  // --- Input State Variables ---
  const [propertyPrice, setPropertyPrice] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTerm, setLoanTerm] = useState(''); // in years
  const [propertyTax, setPropertyTax] = useState(''); // annual
  const [homeInsurance, setHomeInsurance] = useState(''); // annual
  const [extraPayment, setExtraPayment] = useState(''); // optional extra monthly payment

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
  const [isDarkMode, setIsDarkMode] = useState(false); // State for theme

  // --- Gemini AI State Variables ---
  const [aiTips, setAiTips] = useState('');
  const [aiOutlook, setAiOutlook] = useState('');
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
    // Clear previous errors and results
    setError('');
    setMonthlyPayment(null);
    setTotalPayment(null);
    setTotalInterest(null);
    setAmortizationSchedule([]);
    setShowAmortization(false); // Hide schedule on new calculation
    setAiTips(''); // Clear AI tips on new calculation
    setAiOutlook(''); // Clear AI outlook on new calculation
    setShowAiModal(false); // Close AI modal

    // --- Input Validation ---
    if (!propertyPrice || !downPayment || !interestRate || !loanTerm) {
      setError('Please fill in all required fields (Property Price, Down Payment, Interest Rate, Loan Term).');
      return;
    }
    if (isNaN(propertyPrice) || isNaN(downPayment) || isNaN(interestRate) || isNaN(loanTerm) ||
        (propertyTax && isNaN(propertyTax)) || (homeInsurance && isNaN(homeInsurance)) || (extraPayment && isNaN(extraPayment))) {
      setError('Please enter valid numbers for all fields.');
      return;
    }
    if (parseFloat(propertyPrice) <= 0 || parseFloat(downPayment) < 0 || parseFloat(interestRate) < 0 || parseFloat(loanTerm) <= 0) {
      setError('Property price, loan term must be positive. Down payment and interest rate cannot be negative.');
      return;
    }
    if (parseFloat(downPayment) >= parseFloat(propertyPrice)) {
      setError('Down payment must be less than the property price.');
      return;
    }

    // --- Convert Inputs to Numbers ---
    const P_price = parseFloat(propertyPrice);
    const DP = parseFloat(downPayment);
    const annualRate = parseFloat(interestRate);
    const years = parseFloat(loanTerm);
    const annualTax = parseFloat(propertyTax || 0); // Default to 0 if empty
    const annualInsurance = parseFloat(homeInsurance || 0); // Default to 0 if empty
    const monthlyExtraPayment = parseFloat(extraPayment || 0); // Default to 0 if empty

    // Calculate actual loan amount
    const P = P_price - DP; // Principal loan amount

    // Calculate monthly interest rate (i)
    const i = annualRate === 0 ? 0 : (annualRate / 100) / 12;

    // Calculate total number of payments (n)
    const n = years * 12;

    let calculatedBaseMonthlyPayment;

    // --- Mortgage Payment Formula ---
    if (i === 0) {
      calculatedBaseMonthlyPayment = P / n;
    } else {
      // M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1]
      const numerator = i * Math.pow((1 + i), n);
      const denominator = Math.pow((1 + i), n) - 1;
      calculatedBaseMonthlyPayment = P * (numerator / denominator);
    }

    // Add monthly property tax and insurance
    const monthlyTax = annualTax / 12;
    const monthlyInsurance = annualInsurance / 12;

    const totalCalculatedMonthlyPayment = calculatedBaseMonthlyPayment + monthlyTax + monthlyInsurance;

    // --- Amortization Schedule Calculation (with optional extra payment) ---
    let balance = P;
    let totalInterestPaidForSchedule = 0;
    let schedule = [];
    let currentMonth = 0;

    // Determine effective monthly payment for amortization schedule
    // This logic ensures that if an extra payment is made, the loan pays off faster
    let effectiveMonthlyPaymentForAmortization = calculatedBaseMonthlyPayment + monthlyExtraPayment;

    while (balance > 0 && currentMonth < n) {
      currentMonth++;
      let interestForMonth = balance * i;
      let principalForMonth = effectiveMonthlyPaymentForAmortization - interestForMonth;

      // If the principal portion is more than the remaining balance, adjust for final payment
      if (principalForMonth > balance) {
        principalForMonth = balance;
        effectiveMonthlyPaymentForAmortization = interestForMonth + principalForMonth; // Final payment amount
      }

      balance -= principalForMonth;
      totalInterestPaidForSchedule += interestForMonth;

      schedule.push({
        month: currentMonth,
        payment: effectiveMonthlyPaymentForAmortization.toFixed(2),
        principal: principalForMonth.toFixed(2),
        interest: interestForMonth.toFixed(2),
        balance: Math.max(0, balance).toFixed(2), // Ensure balance doesn't go negative
      });

      // Break if loan is paid off early due to extra payments
      if (balance <= 0) {
        break;
      }
    }

    // Recalculate total payment and interest based on actual payments made in schedule
    const actualTotalPayment = schedule.reduce((sum, entry) => sum + parseFloat(entry.payment), 0);
    const actualTotalInterest = schedule.reduce((sum, entry) => sum + parseFloat(entry.interest), 0);


    // Update state with calculated results, formatted to 2 decimal places
    setMonthlyPayment(totalCalculatedMonthlyPayment.toFixed(2)); // Display base monthly payment + tax/insurance
    setTotalPayment(actualTotalPayment.toFixed(2)); // Display total payment based on schedule
    setTotalInterest(actualTotalInterest.toFixed(2)); // Display total interest based on schedule
    setAmortizationSchedule(schedule);
  };

  // Reset function to clear inputs and results
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
    setAiTips('');
    setAiOutlook('');
    setIsGeneratingTips(false);
    setIsGeneratingOutlook(false);
    setShowAiModal(false);
    setAiModalTitle('');
    setAiModalContent('');
  };

  // Glossary Terms
  const glossaryTerms = [
    { term: "Property Price", definition: "The total purchase price of the home." },
    { term: "Down Payment", definition: "The initial upfront payment made when purchasing a property, reducing the amount of the loan needed." },
    { term: "Loan Amount", definition: "The total amount of money borrowed from a lender, which is the property price minus the down payment." },
    { term: "Interest Rate", definition: "The cost of borrowing money, expressed as a percentage of the principal over a year (Annual Percentage Rate - APR)." },
    { term: "Loan Term", definition: "The duration over which the loan is repaid, typically in years (e.g., 15 or 30 years)." },
    { term: "Monthly Payment (P&I)", definition: "The principal and interest portion of your monthly mortgage payment. This does not include taxes or insurance." },
    { term: "Total Payment", definition: "The sum of all monthly payments over the entire loan term, including principal and interest, plus any additional costs like taxes and insurance, and considering any extra payments made." },
    { term: "Total Interest Paid", definition: "The cumulative amount of interest paid over the life of the loan, considering any extra payments made." },
    { term: "Property Tax", definition: "An annual tax levied by the local government on real estate, usually paid monthly as part of the mortgage payment (often escrowed)." },
    { term: "Home Insurance", definition: "Insurance that protects your home and belongings against damage or loss from various perils, typically paid monthly (often escrowed)." },
    { term: "Extra Payment", definition: "An optional additional amount paid on top of the regular monthly mortgage payment, which can significantly help pay off the loan faster and save on interest." },
    { term: "Amortization Schedule", definition: "A table detailing each mortgage payment, showing how much goes towards principal, how much to interest, and the remaining loan balance over the life of the loan." },
  ];

  // Feedback Modal Handler
  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    const token = e.target.token.value;
    const complaint = e.target.complaint.value;
    // In a real application, you would send this data to a backend.
    console.log("Feedback Submitted:", { token, complaint });
    alert(`Thank you for your feedback, Sir! Your token/ID is: ${token}. We appreciate your input. (This is a demo, no actual data sent)`);
    setShowFeedbackModal(false);
  };

  // Function to call Gemini API for Mortgage Tips
  const getMortgageTips = async () => {
    if (monthlyPayment === null) {
      setError('Please calculate your mortgage first to get personalized tips.');
      return;
    }
    setIsGeneratingTips(true);
    setAiTips('');
    setError('');

    const prompt = `Given the following mortgage details in Indian Rupees (₹):
    - Property Price: ₹${propertyPrice}
    - Down Payment: ₹${downPayment}
    - Loan Amount: ₹${(parseFloat(propertyPrice) - parseFloat(downPayment)).toFixed(2)}
    - Annual Interest Rate: ${interestRate}%
    - Loan Term: ${loanTerm} years
    - Estimated Monthly Payment (P&I + Tax + Insurance): ₹${monthlyPayment}
    - Total Payment over loan term: ₹${totalPayment}
    - Total Interest Paid over loan term: ₹${totalInterest}
    - Optional Extra Monthly Payment: ₹${extraPayment || 0}

    Provide 3-5 concise, actionable financial tips for managing this mortgage, saving interest, or general homeownership advice relevant to the Indian context. Focus on practical steps.`;

    try {
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiKey = ""; // If you want to use models other than gemini-2.0-flash or imagen-3.0-generate-002, provide an API key here. Otherwise, leave this as-is.
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setAiTips(text);
        setAiModalTitle('Personalized Mortgage Tips');
        setAiModalContent(text);
        setShowAiModal(true);
      } else {
        setError('Failed to get mortgage tips. Please try again.');
      }
    } catch (err) {
      console.error("Error fetching AI tips:", err);
      setError('An error occurred while fetching tips. Please check your network or try again later.');
    } finally {
      setIsGeneratingTips(false);
    }
  };

  // Function to call Gemini API for Market Outlook
  const getMarketOutlook = async () => {
    setIsGeneratingOutlook(true);
    setAiOutlook('');
    setError('');

    const prompt = `Provide a concise, high-level summary of the current real estate market outlook and interest rate trends in India. Focus on general trends relevant to potential homebuyers or existing mortgage holders. Keep it brief, around 3-4 points.`;

    try {
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiKey = ""; // If you want to use models other than gemini-2.0-flash or imagen-3.0-generate-002, provide an API key here. Otherwise, leave this as-is.
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setAiOutlook(text);
        setAiModalTitle('Indian Real Estate Market Outlook');
        setAiModalContent(text);
        setShowAiModal(true);
      } else {
        setError('Failed to get market outlook. Please try again.');
      }
    } catch (err) {
      console.error("Error fetching AI outlook:", err);
      setError('An error occurred while fetching market outlook. Please check your network or try again later.');
    } finally {
      setIsGeneratingOutlook(false);
    }
  };

  // Base classes for consistent styling across themes
  const inputClass = `w-full p-3 border rounded-lg focus:ring-2 transition duration-200 ${
    isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-teal-400' : 'bg-white border-gray-300 text-gray-800 focus:ring-emerald-500'
  }`;
  const labelClass = `block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`;
  const buttonClass = `flex-1 font-bold py-3 px-4 rounded-lg shadow-md transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-75`;
  const aiButtonClass = `flex items-center justify-center gap-2 ${buttonClass}`;


  return (
    // Main container with responsive styling and theme classes
    <div className={`min-h-screen flex items-center justify-center p-4 font-inter ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-gray-50 to-blue-50 text-gray-800'}`}>
      <div className={`rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl transform transition-all duration-300 relative ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Header with Title and Theme Toggle */}
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-3xl sm:text-4xl font-extrabold text-center flex-grow ${isDarkMode ? 'text-teal-400' : 'text-emerald-700'}`}>
            Mortgage Calculator
          </h1>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition duration-200 ${isDarkMode ? 'text-yellow-300 hover:bg-gray-700' : 'text-amber-500 hover:bg-gray-100'}`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Property Price Input */}
          <div>
            <label htmlFor="propertyPrice" className={labelClass}>
              Property Price (₹)
            </label>
            <input
              type="number"
              id="propertyPrice"
              className={inputClass}
              placeholder="e.g., 50,00,000"
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(e.target.value)}
            />
          </div>

          {/* Down Payment Input */}
          <div>
            <label htmlFor="downPayment" className={labelClass}>
              Down Payment (₹)
            </label>
            <input
              type="number"
              id="downPayment"
              className={inputClass}
              placeholder="e.g., 10,00,000"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
            />
          </div>

          {/* Interest Rate Input */}
          <div>
            <label htmlFor="interestRate" className={labelClass}>
              Annual Interest Rate (%)
            </label>
            <input
              type="number"
              id="interestRate"
              className={inputClass}
              placeholder="e.g., 7.5"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
            />
          </div>

          {/* Loan Term Input */}
          <div>
            <label htmlFor="loanTerm" className={labelClass}>
              Loan Term (Years)
            </label>
            <input
              type="number"
              id="loanTerm"
              className={inputClass}
              placeholder="e.g., 20"
              value={loanTerm}
              onChange={(e) => setLoanTerm(e.target.value)}
            />
          </div>

          {/* Property Tax Input (Advanced) */}
          <div>
            <label htmlFor="propertyTax" className={labelClass}>
              Annual Property Tax (₹, Optional)
            </label>
            <input
              type="number"
              id="propertyTax"
              className={inputClass}
              placeholder="e.g., 12,000"
              value={propertyTax}
              onChange={(e) => setPropertyTax(e.target.value)}
            />
          </div>

          {/* Home Insurance Input (Advanced) */}
          <div>
            <label htmlFor="homeInsurance" className={labelClass}>
              Annual Home Insurance (₹, Optional)
            </label>
            <input
              type="number"
              id="homeInsurance"
              className={inputClass}
              placeholder="e.g., 6,000"
              value={homeInsurance}
              onChange={(e) => setHomeInsurance(e.target.value)}
            />
          </div>

          {/* Extra Monthly Payment Input (Advanced) */}
          <div className="md:col-span-2">
            <label htmlFor="extraPayment" className={labelClass}>
              Extra Monthly Payment (₹, Optional)
            </label>
            <input
              type="number"
              id="extraPayment"
              className={inputClass}
              placeholder="e.g., 5,000"
              value={extraPayment}
              onChange={(e) => setExtraPayment(e.target.value)}
            />
          </div>
        </div>

        {/* Error Message Display */}
        {error && (
          <div className={`border px-4 py-3 rounded-lg relative mb-6 text-center ${isDarkMode ? 'bg-red-800 border-red-600 text-red-100' : 'bg-red-100 border-red-400 text-red-700'}`} role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={calculateMortgage}
            className={`${buttonClass} ${isDarkMode ? 'bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-300' : 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-400'}`}
          >
            Calculate
          </button>
          <button
            onClick={resetCalculator}
            className={`${buttonClass} ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-100 focus:ring-gray-400' : 'bg-gray-300 hover:bg-gray-400 text-gray-800 focus:ring-gray-400'}`}
          >
            Reset
          </button>
        </div>

        {/* Results Display */}
        {monthlyPayment !== null && (
          <div className={`p-6 rounded-lg shadow-inner border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-emerald-50 border-emerald-200 text-gray-800'}`}>
            <h2 className={`text-2xl font-semibold mb-4 text-center ${isDarkMode ? 'text-teal-300' : 'text-emerald-800'}`}>Your Mortgage Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-lg">
                <span className="font-medium">Estimated Monthly Payment:</span>
                <span className={`font-bold text-xl ${isDarkMode ? 'text-teal-300' : 'text-emerald-700'}`}>₹{monthlyPayment}</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="font-medium">Total Payment:</span>
                <span className={`font-bold text-xl ${isDarkMode ? 'text-teal-300' : 'text-emerald-700'}`}>₹{totalPayment}</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="font-medium">Total Interest Paid:</span>
                <span className={`font-bold text-xl ${isDarkMode ? 'text-teal-300' : 'text-emerald-700'}`}>₹{totalInterest}</span>
              </div>
            </div>
            {amortizationSchedule.length > 0 && (
              <button
                onClick={() => setShowAmortization(!showAmortization)}
                className={`mt-6 w-full py-2 rounded-lg font-semibold transition duration-200 ${isDarkMode ? 'bg-teal-600 hover:bg-teal-500 text-white' : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'}`}
              >
                {showAmortization ? 'Hide Amortization Schedule' : 'Show Amortization Schedule'}
              </button>
            )}

            {showAmortization && amortizationSchedule.length > 0 && (
              <div className="mt-6 max-h-96 overflow-y-auto border rounded-lg p-2">
                <h3 className={`text-xl font-semibold mb-3 text-center ${isDarkMode ? 'text-teal-200' : 'text-emerald-700'}`}>Amortization Schedule</h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <tr>
                      <th className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Month</th>
                      <th className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Payment</th>
                      <th className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Principal</th>
                      <th className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Interest</th>
                      <th className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Balance</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                    {amortizationSchedule.map((entry) => (
                      <tr key={entry.month} className={`${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'}`}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.month}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">₹{entry.payment}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">₹{entry.principal}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">₹{entry.interest}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">₹{entry.balance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* AI-Powered Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <button
                onClick={getMortgageTips}
                className={`${aiButtonClass} ${isGeneratingTips ? 'bg-gray-400 cursor-not-allowed' : (isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white focus:ring-blue-300' : 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-400')}`}
                disabled={isGeneratingTips}
              >
                {isGeneratingTips ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                className={`${aiButtonClass} ${isGeneratingOutlook ? 'bg-gray-400 cursor-not-allowed' : (isDarkMode ? 'bg-purple-700 hover:bg-purple-600 text-white focus:ring-purple-300' : 'bg-purple-500 hover:bg-purple-600 text-white focus:ring-purple-400')}`}
                disabled={isGeneratingOutlook}
              >
                {isGeneratingOutlook ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

        {/* Help and Feedback Buttons */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <button
            onClick={() => setShowGlossaryModal(true)}
            className={`p-2 rounded-full shadow-md transition duration-200 ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            aria-label="Help and Glossary"
          >
            <HelpCircle size={20} />
          </button>
          <button
            onClick={() => setShowFeedbackModal(true)}
            className={`p-2 rounded-full shadow-md transition duration-200 ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            aria-label="Provide Feedback"
          >
            <MessageSquare size={20} />
          </button>
        </div>
      </div>

      {/* --- AI Response Modal --- */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl shadow-2xl p-6 w-full max-w-lg relative ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'}`}>
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-teal-300' : 'text-emerald-700'}`}>{aiModalTitle}</h2>
            <div className="max-h-96 overflow-y-auto pr-2">
              <p className="text-sm whitespace-pre-wrap">{aiModalContent}</p>
            </div>
            <button
              onClick={() => setShowAiModal(false)}
              className={`mt-6 w-full py-2 rounded-lg font-semibold transition duration-200 ${isDarkMode ? 'bg-teal-600 hover:bg-teal-500 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* --- Glossary Modal --- */}
      {showGlossaryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl shadow-2xl p-6 w-full max-w-lg relative ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'}`}>
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-teal-300' : 'text-emerald-700'}`}>Glossary of Terms</h2>
            <div className="max-h-96 overflow-y-auto pr-2">
              {glossaryTerms.map((item, index) => (
                <div key={index} className="mb-3 pb-2 border-b border-gray-200 last:border-b-0">
                  <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-teal-200' : 'text-emerald-600'}`}>{item.term}</h3>
                  <p className="text-sm">{item.definition}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowGlossaryModal(false)}
              className={`mt-6 w-full py-2 rounded-lg font-semibold transition duration-200 ${isDarkMode ? 'bg-teal-600 hover:bg-teal-500 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* --- Feedback Modal --- */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl shadow-2xl p-6 w-full max-w-md relative ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'}`}>
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-teal-300' : 'text-emerald-700'}`}>Provide Feedback</h2>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label htmlFor="token" className={labelClass}>
                  Your Feedback ID/Token (Optional)
                </label>
                <input
                  type="text"
                  id="token"
                  name="token"
                  className={inputClass}
                  placeholder="e.g., BUG-12345 or your name"
                />
              </div>
              <div>
                <label htmlFor="complaint" className={labelClass}>
                  Your Complaint/Suggestion
                </label>
                <textarea
                  id="complaint"
                  name="complaint"
                  rows="5"
                  className={`${inputClass} resize-y`}
                  placeholder="Describe your issue or suggestion here..."
                  required
                ></textarea>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className={`${buttonClass} ${isDarkMode ? 'bg-teal-600 hover:bg-teal-500 text-white focus:ring-teal-300' : 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-400'}`}
                >
                  Submit Feedback
                </button>
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className={`${buttonClass} ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-100 focus:ring-gray-400' : 'bg-gray-300 hover:bg-gray-400 text-gray-800 focus:ring-gray-400'}`}
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
