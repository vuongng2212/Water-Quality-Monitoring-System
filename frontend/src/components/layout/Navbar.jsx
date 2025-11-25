import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.role === 'ADMIN';
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <h1 className="text-xl font-bold">🌊 Water Quality Monitor</h1>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-1">
                            <NavLink
                                to="/dashboard"
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-white bg-opacity-20 text-white shadow-sm'
                                        : 'text-primary-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                                    }`
                                }
                            >
                                Dashboard
                            </NavLink>
                            <NavLink
                                to="/history"
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-white bg-opacity-20 text-white shadow-sm'
                                        : 'text-primary-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                                    }`
                                }
                            >
                                History
                            </NavLink>
                            {isAdmin && (
                                <>
                                    <NavLink
                                        to="/users"
                                        className={({ isActive }) =>
                                            `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                                ? 'bg-white bg-opacity-20 text-white shadow-sm'
                                                : 'text-primary-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                                            }`
                                        }
                                    >
                                        Users
                                    </NavLink>
                                    <NavLink
                                        to="/devices"
                                        className={({ isActive }) =>
                                            `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                                ? 'bg-white bg-opacity-20 text-white shadow-sm'
                                                : 'text-primary-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                                            }`
                                        }
                                    >
                                        Devices
                                    </NavLink>
                                </>
                            )}
                        </div>
                    </div>

                    {/* User Menu */}
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6">
                            <div className="relative">
                                <button
                                    onClick={toggleDropdown}
                                    className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-600 focus:ring-white p-1"
                                    id="user-menu-button"
                                    aria-expanded={isDropdownOpen}
                                    aria-haspopup="true"
                                >
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-medium">
                                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                        <span className="text-primary-100 text-sm">{user?.name || 'User'}</span>
                                        <svg
                                            className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </button>

                                {isDropdownOpen && (
                                    <div
                                        className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                        role="menu"
                                        aria-orientation="vertical"
                                        aria-labelledby="user-menu-button"
                                    >
                                        <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                                            <div className="font-medium">{user?.name || 'User'}</div>
                                            <div className="text-gray-500">{user?.email || ''}</div>
                                        </div>
                                        <NavLink
                                            to="/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            role="menuitem"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            Profile Settings
                                        </NavLink>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            role="menuitem"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-primary-100 hover:text-white hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? (
                                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-primary-600 border-t border-primary-500">
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) =>
                                `block px-3 py-2 rounded-md text-base font-medium ${isActive
                                    ? 'bg-white bg-opacity-20 text-white'
                                    : 'text-primary-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                                }`
                            }
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Dashboard
                        </NavLink>
                        <NavLink
                            to="/history"
                            className={({ isActive }) =>
                                `block px-3 py-2 rounded-md text-base font-medium ${isActive
                                    ? 'bg-white bg-opacity-20 text-white'
                                    : 'text-primary-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                                }`
                            }
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            History
                        </NavLink>
                        {isAdmin && (
                            <>
                                <NavLink
                                    to="/users"
                                    className={({ isActive }) =>
                                        `block px-3 py-2 rounded-md text-base font-medium ${isActive
                                            ? 'bg-white bg-opacity-20 text-white'
                                            : 'text-primary-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                                        }`
                                    }
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Users
                                </NavLink>
                                <NavLink
                                    to="/devices"
                                    className={({ isActive }) =>
                                        `block px-3 py-2 rounded-md text-base font-medium ${isActive
                                            ? 'bg-white bg-opacity-20 text-white'
                                            : 'text-primary-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                                        }`
                                    }
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Devices
                                </NavLink>
                            </>
                        )}
                        <div className="border-t border-primary-500 pt-4 pb-3">
                            <div className="flex items-center px-5">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-medium">
                                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <div className="text-base font-medium text-white">{user?.name || 'User'}</div>
                                    <div className="text-sm font-medium text-primary-100">{user?.email || ''}</div>
                                </div>
                            </div>
                            <div className="mt-3 space-y-1 px-2">
                                <NavLink
                                    to="/profile"
                                    className="block px-3 py-2 rounded-md text-base font-medium text-primary-100 hover:bg-white hover:bg-opacity-10 hover:text-white"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Profile Settings
                                </NavLink>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-primary-100 hover:bg-white hover:bg-opacity-10 hover:text-white"
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Navbar;