/**
 * Calculate rank based on total wins
 * @param {number} wins 
 * @returns {string} Rank tier
 */
const calculateRank = (wins) => {
    if (wins <= 5) return 'Bronze';
    if (wins <= 15) return 'Silver';
    if (wins <= 30) return 'Gold';
    if (wins <= 50) return 'Platinum';
    return 'Diamond';
};

module.exports = { calculateRank };
