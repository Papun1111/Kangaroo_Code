"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CreateMatchForm from "../../components/match/CreateMatchForm";
import { useAuth } from "../../contexts/AuthContext";
import Spinner from "../../components/ui/Spinner";

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
            <div className="flex justify-center items-center h-64">
                <Spinner />
            </div>
        );
    }

    // If authenticated, display the form. Otherwise, show a message.
    return (
        <div className="container mx-auto px-4 py-8">
            {isAuthenticated ? (
                <CreateMatchForm />
            ) : (
                <div className="card text-center max-w-md mx-auto">
                    <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
                    <p>You must be logged in to host a new match.</p>
                    <Link href="/login" className="btn btn-primary mt-6 inline-block">
                        Login Here
                    </Link>
                </div>
            )}
        </div>
    );
}
