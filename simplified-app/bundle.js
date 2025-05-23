// Pre-transpiled version of app.js for direct inclusion
"use strict";

// Simple Dashboard Component
function Dashboard() {
  return React.createElement(
    "div",
    { className: "p-6" },
    React.createElement(
      "h1",
      { className: "text-2xl font-bold mb-4" },
      "Dashboard"
    ),
    React.createElement(
      "div",
      { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
      React.createElement(
        "div",
        { className: "bg-white p-4 rounded shadow" },
        React.createElement(
          "h2",
          { className: "text-lg font-semibold mb-2" },
          "Care Hours"
        ),
        React.createElement(
          "p",
          { className: "text-3xl font-bold" },
          "128"
        ),
        React.createElement(
          "p",
          { className: "text-sm text-gray-500" },
          "This week"
        )
      ),
      React.createElement(
        "div",
        { className: "bg-white p-4 rounded shadow" },
        React.createElement(
          "h2",
          { className: "text-lg font-semibold mb-2" },
          "Service Users"
        ),
        React.createElement(
          "p",
          { className: "text-3xl font-bold" },
          "24"
        ),
        React.createElement(
          "p",
          { className: "text-sm text-gray-500" },
          "Active"
        )
      ),
      React.createElement(
        "div",
        { className: "bg-white p-4 rounded shadow" },
        React.createElement(
          "h2",
          { className: "text-lg font-semibold mb-2" },
          "Compliance"
        ),
        React.createElement(
          "p",
          { className: "text-3xl font-bold" },
          "94%"
        ),
        React.createElement(
          "p",
          { className: "text-sm text-gray-500" },
          "CQC Standards"
        )
      )
    )
  );
}

// Simple Service Users Component
function ServiceUsers() {
  return React.createElement(
    "div",
    { className: "p-6" },
    React.createElement(
      "h1",
      { className: "text-2xl font-bold mb-4" },
      "Service Users"
    ),
    React.createElement(
      "div",
      { className: "bg-white rounded shadow overflow-hidden" },
      React.createElement(
        "table",
        { className: "min-w-full divide-y divide-gray-200" },
        React.createElement(
          "thead",
          { className: "bg-gray-50" },
          React.createElement(
            "tr",
            null,
            React.createElement(
              "th",
              { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" },
              "Name"
            ),
            React.createElement(
              "th",
              { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" },
              "Status"
            ),
            React.createElement(
              "th",
              { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" },
              "Care Plan"
            )
          )
        ),
        React.createElement(
          "tbody",
          { className: "bg-white divide-y divide-gray-200" },
          React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              { className: "px-6 py-4 whitespace-nowrap" },
              "John Smith"
            ),
            React.createElement(
              "td",
              { className: "px-6 py-4 whitespace-nowrap" },
              "Active"
            ),
            React.createElement(
              "td",
              { className: "px-6 py-4 whitespace-nowrap" },
              "Daily Care"
            )
          ),
          React.createElement(
            "tr",
            null,
            React.createElement(
              "td",
              { className: "px-6 py-4 whitespace-nowrap" },
              "Jane Doe"
            ),
            React.createElement(
              "td",
              { className: "px-6 py-4 whitespace-nowrap" },
              "Active"
            ),
            React.createElement(
              "td",
              { className: "px-6 py-4 whitespace-nowrap" },
              "Weekly Visit"
            )
          )
        )
      )
    )
  );
}

// Simple App Component with basic routing
function App() {
  const [currentPage, setCurrentPage] = React.useState('dashboard');

  // Render the current page
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return React.createElement(Dashboard, null);
      case 'service-users':
        return React.createElement(ServiceUsers, null);
      default:
        return React.createElement(Dashboard, null);
    }
  };

  return React.createElement(
    "div",
    { className: "min-h-screen bg-gray-100 flex" },
    React.createElement(
      "div",
      { className: "w-64 bg-indigo-700 text-white" },
      React.createElement(
        "div",
        { className: "p-4 text-xl font-bold" },
        "CareUnity"
      ),
      React.createElement(
        "nav",
        { className: "mt-6" },
        React.createElement(
          "button",
          {
            className: `w-full text-left px-4 py-2 ${currentPage === 'dashboard' ? 'bg-indigo-800' : ''}`,
            onClick: () => setCurrentPage('dashboard')
          },
          "Dashboard"
        ),
        React.createElement(
          "button",
          {
            className: `w-full text-left px-4 py-2 ${currentPage === 'service-users' ? 'bg-indigo-800' : ''}`,
            onClick: () => setCurrentPage('service-users')
          },
          "Service Users"
        )
      )
    ),
    React.createElement(
      "div",
      { className: "flex-1" },
      renderPage()
    )
  );
}

// Mount the React application
// Check if we're using React 18+ with createRoot
if (typeof ReactDOM.createRoot === 'function') {
  // React 18+ approach
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(React.createElement(App, null));
} else {
  // Legacy React approach (React 17 and earlier)
  ReactDOM.render(
    React.createElement(App, null),
    document.getElementById('root')
  );
}
