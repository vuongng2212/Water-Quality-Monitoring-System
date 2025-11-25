import React from 'react';
import Navbar from './Navbar';

function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export default MainLayout;