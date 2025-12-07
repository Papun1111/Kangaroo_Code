"use client";

import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const Navbar = () => {
    const { isAuthenticated, logout } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Handle scroll effect for glassmorphism
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        router.push('/login');
        setIsOpen(false);
    };

    // --- ANIMATION VARIANTS ---
    const menuVariants = {
        closed: { 
            opacity: 0,
            y: "-100%",
            transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] }
        },
        open: { 
            opacity: 1,
            y: "0%",
            transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] }
        }
    };

    const linkContainerVariants = {
        open: {
            transition: { staggerChildren: 0.1, delayChildren: 0.3 }
        },
        closed: {
            transition: { staggerChildren: 0.05, staggerDirection: -1 }
        }
    };

    const linkVariants = {
        closed: { y: 50, opacity: 0 },
        open: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
    };

    return (
        <>
            <nav 
                className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
                    scrolled 
                    ? 'bg-black/80 backdrop-blur-md border-white/10 py-4' 
                    : 'bg-transparent border-transparent py-6'
                }`}
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        
                        {/* LOGO */}
                        <Link href="/" className="group relative z-50">
                            <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">
                                Kangaroo<span className="text-emerald-500 group-hover:text-white transition-colors">Code</span>
                            </h1>
                        </Link>
                        
                        {/* DESKTOP MENU (Hidden on Mobile) */}
                        <div className="hidden md:flex items-center space-x-12">
                            <NavLink href="/matches">Matches</NavLink>
                            <NavLink href="/teams">Teams</NavLink>
                            {isAuthenticated ? (
                                <>
                                    <NavLink href="/dashboard">Dashboard</NavLink>
                                    <button 
                                        onClick={handleLogout} 
                                        className="px-6 py-2 rounded-full border border-emerald-500/50 text-emerald-500 font-mono text-sm hover:bg-emerald-500 hover:text-black transition-all duration-300"
                                    >
                                        LOGOUT
                                    </button>
                                </>
                            ) : (
                                <>
                                    <NavLink href="/login">Login</NavLink>
                                    <Link 
                                        href="/register" 
                                        className="btn bg-emerald-500 text-black px-6 py-2 rounded-full font-bold hover:bg-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* MOBILE MENU TOGGLE (Visible on Mobile) */}
                        <div className="md:hidden z-50">
                            <button 
                                onClick={() => setIsOpen(!isOpen)} 
                                className="text-white focus:outline-none group"
                            >
                                <div className="w-8 flex flex-col items-end gap-1.5">
                                    <motion.span 
                                        animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                                        className="block w-8 h-0.5 bg-white group-hover:bg-emerald-500 transition-colors" 
                                    />
                                    <motion.span 
                                        animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                                        className="block w-6 h-0.5 bg-white group-hover:bg-emerald-500 transition-colors" 
                                    />
                                    <motion.span 
                                        animate={isOpen ? { rotate: -45, y: -8, width: "2rem" } : { rotate: 0, y: 0, width: "1rem" }}
                                        className="block w-4 h-0.5 bg-white group-hover:bg-emerald-500 transition-colors" 
                                    />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* FULL SCREEN MOBILE OVERLAY */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        className="fixed inset-0 bg-black z-40 flex flex-col justify-center items-center md:hidden"
                        variants={menuVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                    >
                        {/* Ambient Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none" />

                        <motion.div 
                            className="flex flex-col items-center space-y-8 z-10"
                            variants={linkContainerVariants}
                            initial="closed"
                            animate="open"
                        >
                            <MobileLink href="/matches" onClick={() => setIsOpen(false)}>Matches</MobileLink>
                            <MobileLink href="/teams" onClick={() => setIsOpen(false)}>Teams</MobileLink>
                            
                            <div className="w-12 h-[1px] bg-white/10 my-4" />

                            {isAuthenticated ? (
                                <>
                                    <MobileLink href="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</MobileLink>
                                    <motion.button 
                                        variants={linkVariants}
                                        onClick={handleLogout} 
                                        className="text-3xl font-black text-red-500 hover:text-red-400 uppercase tracking-tighter"
                                    >
                                        Logout
                                    </motion.button>
                                </>
                            ) : (
                                <>
                                    <MobileLink href="/login" onClick={() => setIsOpen(false)}>Login</MobileLink>
                                    <MobileLink href="/register" onClick={() => setIsOpen(false)} isHighlight>Register</MobileLink>
                                </>
                            )}
                        </motion.div>

                        {/* Footer Info in Menu */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { delay: 0.5 } }}
                            className="absolute bottom-10 text-white/30 text-xs font-mono"
                        >
                            KANGAROO CODE SYSTEM
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// Helper Components for cleaner code

const NavLink = ({ href, children }) => (
    <Link href={href} className="relative text-sm font-mono uppercase tracking-widest text-gray-400 hover:text-emerald-500 transition-colors group">
        {children}
        <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-emerald-500 transition-all duration-300 group-hover:w-full" />
    </Link>
);

const MobileLink = ({ href, onClick, children, isHighlight }) => (
    <motion.div variants={{ closed: { y: 50, opacity: 0 }, open: { y: 0, opacity: 1 } }}>
        <Link 
            href={href} 
            onClick={onClick} 
            className={`text-5xl font-black tracking-tighter uppercase transition-colors ${
                isHighlight ? 'text-emerald-500' : 'text-white hover:text-emerald-500'
            }`}
        >
            {children}
        </Link>
    </motion.div>
);

export default Navbar;