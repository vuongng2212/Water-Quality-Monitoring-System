import React from 'react';

export default function Logo() {
    return (
        <div className="flex flex-col items-center mb-6 select-none">
            <div className="rounded-full bg-blue-100 p-3 mb-2">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="20" fill="#3B82F6" />
                    <path d="M12 28C12 22 20 12 28 28" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="20" cy="20" r="5" fill="white" />
                </svg>
            </div>
            <span className="text-xl font-bold text-blue-600 tracking-wide">Water Quality</span>
            <span className="text-xs text-gray-400 tracking-widest uppercase">Monitoring System</span>
        </div>
    );
}
