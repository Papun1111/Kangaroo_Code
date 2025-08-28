"use client";

import { motion } from 'motion/react';

const Spinner = () => {
    const spinnerVariants = {
        animate: {
            rotate: 360,
            transition: {
                loop: Infinity,
                ease: "linear",
                duration: 1,
            },
        },
    };

    return (
        <div className="flex justify-center items-center">
            <motion.div
                className="w-12 h-12 border-4 border-slate-200 border-t-4 border-t-emerald-500 rounded-full"
                variants={spinnerVariants}
                animate="animate"
            />
        </div>
    );
};

export default Spinner;
