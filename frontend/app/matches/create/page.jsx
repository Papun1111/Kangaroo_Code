"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CreateMatchForm from "../../components/match/CreateMatchForm";
import { useAuth } from "../../contexts/AuthContext";
import Spinner from "../../components/ui/Spinner";
import { motion } from "framer-motion";

export default function CreateMatchPage() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    // This effect protects the route. If the user is not logged in,
    // they will be redirected to the login page.
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, authLoading, router]);

    // Display a spinner while checking authentication status
    if (authLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Spinner />
            </div>
        );
    }

    // If authenticated, display the form. Otherwise, show a themed message.
    return (
        <div className="mx-auto">
            {isAuthenticated ? (
                <CreateMatchForm />
            ) : (
                <motion.div 
                    className="card text-center max-w-md mx-auto bg-zinc-900 rounded-xl shadow-2xl p-10 border border-zinc-800 relative overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Decorative Green Glow effect */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>
                    
                    <h2 className="text-3xl font-extrabold mb-4 text-white tracking-wide">
                        ACCESS <span className="text-red-500">DENIED</span>
                    </h2>
                    
                    <p className="text-zinc-400 text-lg mb-8">
                        You must be logged in to host a match in the <span className="text-green-500 font-bold">Arena</span>.
                    </p>
                    
                    <Link href="/login" className="inline-block w-full">
                        <motion.button
                            className="w-full bg-green-600 text-black font-bold uppercase py-3 px-6 rounded hover:bg-green-500 transition-colors duration-300 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Login to Continue
                        </motion.button>
                    </Link>
                </motion.div>
            )}
        </div>
    );
}