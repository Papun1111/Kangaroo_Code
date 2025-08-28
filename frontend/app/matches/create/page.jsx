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

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, authLoading, router]);

    if (authLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {isAuthenticated ? (
                <CreateMatchForm />
            ) : (
                <motion.div 
                    className="card text-center max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 border border-slate-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-2xl font-bold mb-4 text-black">Access Denied</h2>
                    <p className="text-slate-600">You must be logged in to host a new match.</p>
                    <Link href="/login" className="btn bg-emerald-500 text-white mt-6 inline-block px-6 py-2 rounded-full font-bold hover:bg-emerald-600 transition-colors duration-300">
                        Login Here
                    </Link>
                </motion.div>
            )}
        </div>
    );
}
