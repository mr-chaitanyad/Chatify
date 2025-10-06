import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Set CSS variables for toast styling based on theme
const updateToastTheme = () => {
  const isDark = document.documentElement.classList.contains('dark');
  const root = document.documentElement;
  
  if (isDark) {
    root.style.setProperty('--toast-bg', '#374151');
    root.style.setProperty('--toast-color', '#f9fafb');
  } else {
    root.style.setProperty('--toast-bg', '#ffffff');
    root.style.setProperty('--toast-color', '#111827');
  }
};

// Initial theme setup
updateToastTheme();

// Watch for theme changes
const observer = new MutationObserver(updateToastTheme);
observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['class']
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
