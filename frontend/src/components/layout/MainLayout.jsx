import React from 'react';
import Navbar from './Navbar';

function MainLayout({ children }) {
  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

export default MainLayout;