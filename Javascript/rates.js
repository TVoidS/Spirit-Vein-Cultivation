// Stores the rates of resource generation
const rates = {
    init: function() {

        rates.timePartition = game.baseTime/12;
        // Create the rates on game start/load
        rates.calculateAllReturns();

        // This is for the time it takes each of the resources to generate!
        rates.calculateTimes();

        // Calculate the Qi Regen!
        rates.regen = 1;
    },

    // Calculates the return value that would be generated for a given mat_tier.
    calculateReturn: function(mat_tier) {
        var tiers = {
            0: 0, // Inferior Spirit Slag
            1: 1, // Spirit Slag
            2: 2, // Superior Spirit Slag
            3: 4 // 
        }

        var pureCheck = (character.sheet.stats.purity-(10*tiers[mat_tier]))+1;
        if (pureCheck > 0) {
            // Grey Magik
            let pureGrade = pureCheck%10;
            pureCheck -= pureGrade;
            let pureTier = pureCheck/10;
            let ret = pureGrade*fibbo.getMeMyCost(pureTier+2)*10;
            if(fibbo.avg_f2[pureTier-1]){
                ret += (pureCheck*fibbo.avg_f2[pureTier-1]*10)
            }
            return ret;
        } else if (pureCheck > -9){
            pureCheck--;
            var ret = 10+pureCheck;
            return ret;
        } else {
            return 0;
        }
    },

    // Used to help quick-update all of the return numbers at any time!
    calculateAllReturns: function() {
        // Create the rates.gain object that will be the quick reference for how much of a resource to generate each time the bar fills
        rates.gain = {
            0: rates.calculateReturn(0),
            1: rates.calculateReturn(1),
            2: rates.calculateReturn(2)
        }
    },

    // Sets the time it takes for each progress bar action!
    calculateTimes: function() {
        rates.time = {
            convert: {
                0: rates.calculateConversionTime(0),
                1: rates.calculateConversionTime(1),
                2: rates.calculateConversionTime(2)
            },
            regen: game.baseTime*game.secondConvert,
        };
    },

    // Calculates how long it takes for the character to convert Qi to a given tier of resource
    calculateConversionTime: function(tier) {

        // Check if purity matches or exceeds tier
        // Check relation to qiConversion levels
        if ((character.sheet.stats.purity) >= (tier*10)) {
            // High enough purity!
            if ((character.sheet.skills.qiConversion-10) > (tier*10)) {
                // Exceeding tier by 10 levels of QiConversion!
                // Speed cap reached
                return 2*rates.timePartition*game.secondConvert;
            } else {
                // No exceeding anything here! do the complex calc for time taken!
                let relLevel = (character.sheet.skills.qiConversion-1) - (tier*10);
                return rates.timePartition*game.secondConvert*(12-relLevel);
            }
        } else {
            // Not enough purity! Immediately take the most time possible!
            return 2*game.baseTime*game.secondConvert;
        }
    },

    // Runs whenever we need to update the Qi Regen, Needed cause now we have % stuff!
    calcQiRegen: function() {
        // We need this for all the tiers there are!
        let keys = Object.keys(spiritReceptor.tiers);

        // Current multiplier
        let multi = 1;
        for (let i = 0; i < keys.length; i++) {
            if(character.sheet.spiritReceptor[keys[i]] == spiritReceptor.tiers[keys[i]].levels) {
                // If we are at max level, then we just add on the total, and continue with the next tier!
                multi += spiritReceptor.tiers[keys[i]].total_bonus;
            } else {
                // We aren't at max level, calculate the bonus from how many levels we have and add it, then break from the loop (not needed)
                if(character.sheet.spiritReceptor[keys[i]] > 0){
                    multi += (spiritReceptor.tiers[keys[i]].bonus_per_lvl * character.sheet.spiritReceptor[keys[i]]);
                }
            }
        }
        rates.regen = multi * character.sheet.stats.regen;
        // Render the change!
        game.updateCharacterStatDisplays();
    },

    // Conversion rates from Mass to System Points for each material tier.
    conversion: { // 100^(x-1)
        0: .01,
        1: 1,
        2: 100
    }
}
