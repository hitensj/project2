nullMortgage Calculator: A React Application
Project Overview
This project showcases a modern, user-friendly mortgage calculator built with React. It provides detailed financial insights, including estimated monthly payments, total loan cost, and an amortization schedule. Designed with clarity and accessibility in mind, it aims to simplify complex mortgage calculations for users.

Attribution: This project was created as a part of the Forage Job Simulation of Software Engineering by Lloyds Banking.

Key Objectives:
Comprehensive Calculation: Accurately calculate estimated monthly payments, total payments, and total interest paid over the loan term.

Advanced Options: Include optional inputs for property tax, home insurance, and extra monthly payments to provide a more realistic financial picture.

Amortisation Schedule: Generate a detailed month-by-month breakdown of principal and interest payments and remaining loan balance.

User-Friendly Design: Implement a clear, intuitive interface with responsive design, light/dark themes, and Indian Rupee currency.

Educational Support: Provide a built-in glossary of terms to help users understand mortgage-related terminology.

Feedback Mechanism: Offer a way for users to submit complaints or suggestions.

AI-Powered Insights (Gemini API): Leverage Google's Gemini API to provide personalised mortgage tips and a general market outlook for Indian real estate.

Features
Detailed Inputs:

Property Price (₹)

Down Payment (₹)

Annual Interest Rate (%)

Loan Term (Years)

Annual Property Tax (₹, Optional)

Annual Home Insurance (₹, Optional)

Extra Monthly Payment (₹, Optional)

Calculated Outputs:

Estimated Monthly Payment

Total Payment

Total Interest Paid

Amortisation Schedule: Toggleable, detailed breakdown of each payment.

Theming: Light and Dark mode toggle for enhanced user experience.

Currency: All financial figures displayed in Indian Rupees (₹).

Glossary of Terms: An accessible modal explaining key mortgage terms.

Feedback System: A dedicated modal for users to submit feedback with an optional ID/token.

AI Integration:

Personalized Mortgage Tips: Get AI-generated financial advice based on your specific loan details.

Indian Real Estate Market Outlook: Obtain a concise summary of current market trends and interest rates in India.

Technologies Used
React: For building the user interface.

JavaScript: Core logic for calculations and interactions.

Tailwind CSS: For rapid and responsive styling.

Lucide React: For clean and aesthetic SVG icons.

Google Gemini API: For integrating LLM capabilities to provide intelligent tips and market insights.

How to Run the Project Locally
To set up and run this mortgage calculator on your local machine, follow these steps:

Clone the Repository:

git clone https://github.com/hitensj/project2.git # Or your actual repo URL
cd project2 # Or your project folder name

Install Dependencies:
Ensure Node.js and npm are installed. Then, run:

npm install

This will install React, Lucide React, Tailwind CSS, and other necessary packages.

Configure Tailwind CSS:

Ensure tailwind.config.js and src/index.css are correctly configured as per standard React + Tailwind setup (as provided in the App.jsx code).

Make sure tailwind.config.js has:

content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
],
theme: {
  extend: {
    fontFamily: {
      inter: ['Inter', 'sans-serif'],
    },
  },
},
plugins: [],

And src/index.css has:

@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

body {
  font-family: 'Inter', sans-serif;
}

Run the Application:

npm run dev # If using Vite
# OR
# npm start # If using Create React App

Your application will open in your browser, typically at http://localhost:5173 or http://localhost:3000.

Future Enhancements
Save/Load Calculations: Implement local storage or a backend to save previous calculations.

Comparison Tool: Allow users to compare different mortgage scenarios side-by-side.

Dynamic Market Data: Integrate with real-time financial APIs for live interest rates or property trends.

User Authentication: For personalized dashboards and saved data.

More Visualizations: Add charts for interest vs. principal paid over time.