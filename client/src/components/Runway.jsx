import { motion } from 'framer-motion';

const Runway = ({ months = 0, balance = 0, burnRate = 0 }) => {
    /* ----------------------------------
       1️⃣ SAFE NUMBERS (NO CRASH)
    ---------------------------------- */

    const safeMonthsRaw = Number(months);
    const safeMonths = isNaN(safeMonthsRaw) || safeMonthsRaw < 0
        ? 0
        : Math.min(safeMonthsRaw, 36); // cap at 36 months

    const safeBalance = Math.round(Number(balance)) || 0;
    const safeBurnRate = Math.round(Number(burnRate)) || 0;

    const displayMonths = safeMonths.toFixed(1);

    /* ----------------------------------
       2️⃣ STATUS + COLOR
    ---------------------------------- */

    const getColor = () => {
        if (safeMonths >= 6) return '#06FFA5';   // Healthy
        if (safeMonths >= 3) return '#FFBE0B';   // Moderate
        return '#FF006E';                        // Critical
    };

    const getStatus = () => {
        if (safeMonths >= 6) return 'Healthy';
        if (safeMonths >= 3) return 'Moderate';
        return 'Critical';
    };

    const color = getColor();

    return (
        <div className="text-center py-6" style={{ userSelect: 'none' }}>
            {/* Months Display */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mb-4"
            >
                <span
                    className="glitch text-7xl md:text-8xl font-bold"
                    data-text={displayMonths}
                    style={{
                        color,
                        textShadow: `0 0 20px ${color}, 0 0 40px ${color}40`
                    }}
                >
                    {displayMonths}
                </span>
                <span
                    className="text-3xl md:text-4xl font-semibold ml-3"
                    style={{ color }}
                >
                    Months
                </span>
            </motion.div>

            {/* Status */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6"
            >
                <span
                    className="px-4 py-2 rounded-full text-sm font-medium"
                    style={{
                        backgroundColor: `${color}20`,
                        color,
                        border: `1px solid ${color}40`
                    }}
                >
                    {getStatus()} Runway
                </span>
            </motion.div>

            {/* Details */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-3 text-gray-400"
            >
                <div className="flex items-center justify-center gap-3">
                    <span className="text-base">Balance</span>
                    <span className="text-white font-semibold">
                        ₹{safeBalance.toLocaleString()}
                    </span>
                </div>

                <div className="flex items-center justify-center gap-3">
                    <span className="text-base">Monthly Burn</span>
                    <span className="text-white font-semibold">
                        ₹{safeBurnRate.toLocaleString()}
                    </span>
                </div>
            </motion.div>

            {/* Progress Dots */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 0.7 }}
                className="mt-6 flex justify-center gap-1"
            >

            </motion.div>
        </div>
    );
};

export default Runway;
