import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // <--- CRUCIAL: This imports your calculator component
import './index.css'; // <--- CRUCIAL: This imports your Tailwind and custom font styles

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App /> {/* <--- CRUCIAL: This renders your App component */}
  </React.StrictMode>,
);