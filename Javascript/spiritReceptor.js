const spiritReceptor = {
    init: function() {
        spiritReceptor.expanded = false;
    },
    toggleD: function() {
        // Check if the menu is open yet or not
        if(!spiritReceptor.expanded) {
            // If it isn't!

            // Go through all the items that are a part of the Upgrade Module and Display them!
            for(let i = 0; i < game.sRDMod.length; i++) {
                // This display type is required to make them maintain their appearance
                game.sRDMod[i].style.display = "table-row";
            }

            // Change the cell data for the thing you clicked to be accurate to it's purpose!
            game.sRExpBtn.innerHTML = "--Close--";

            // Change the recorded state!
            spiritReceptor.expanded = true;
        } else {
            // If it is!

            // Go through all the items that are a part of the Upgrade Module and Hide Them!
            for(let i = 0; i < game.sRDMod.length; i++) {
                // Just the hidden style!
                game.sRDMod[i].style.display = "none";
            }
            // Change the cell data for the thing you click to be accurate to it's purpose!
            game.sRExpBtn.innerHTML = "--Open--";

            // Update the recorded state!
            spiritReceptor.expanded = false;
        }
    },
    // Handles the addition of new Quests to the Quest Display!
    updateD: function() {

        // Just re-display everything (a receptor status might have changed?)
        const elements = document.getElementsByClassName("sRTier");
        while(elements.length > 0) {
            elements[0].parentNode.removeChild(elements[0]);
        }

        // Default of Empty String
        let temp = "";

        let keys = Object.keys(spiritReceptor.tiers);
        // BUILD HTML

        for(let i = 0; i < keys.length; i++) {
            if((i-1) > -1) {
                // If it isn't, then we are dealing with the first row, so we always display it.
                
                // Check if the previous tier has been completed!
                if (spiritReceptor.tiers[keys[i-1]].levels == character.sheet.spiritReceptor[keys[i-1]]) {
                    // They've maxed it, check if we've been maxxed too!
                    if(spiritReceptor.tiers[keys[i]].levels == character.sheet.spiritReceptor[keys[i]]) {
                        // We've maxxed! Change to maxxed display!
                        temp += "<tr class=\"sRModule sRTier\"><td onclick=\"game.inspect('" + keys[i] + "','spiritReceptor')\"> [" + spiritReceptor.tiers[keys[i]].tier + "--" + spiritReceptor.tiers[keys[i]].name + "] (" + character.sheet.spiritReceptor[keys[i]] + "/" + spiritReceptor.tiers[keys[i]].levels + ")</td><td> Max Level </td></tr>";
                    } else {
                        // Not maxxed, normal display!
                        temp += "<tr class=\"sRModule sRTier\"><td onclick=\"game.inspect('" + keys[i] + "','spiritReceptor')\"> [" + spiritReceptor.tiers[keys[i]].tier + "--" + spiritReceptor.tiers[keys[i]].name + "] (" + character.sheet.spiritReceptor[keys[i]] + "/" + spiritReceptor.tiers[keys[i]].levels + ")</td><td><div class=\"sys-upgrade-btn\" onclick=\"spiritReceptor.upgrade('"+keys[i]+"')\"></div>" + spiritReceptor.tiers[keys[i]].cost + " System Points</td></tr>";
                    }
                } else {
                    // They aren't maxxed in the previous level! Show mostly question marks!
                    temp += "<tr class=\"sRModule sRTier\"><td> [" + spiritReceptor.tiers[keys[i]].tier + "--????????????????] (??/??)</td><td>?? System Points</td></tr>";
                    break; // Don't display any more tiers!
                }
            } else {
                // Default entry, only check for level!, it's tier 0 after all
                if(character.sheet.spiritReceptor.t0 == 1) {
                    temp += "<tr class=\"sRModule sRTier\"><td onclick=\"game.inspect('" + keys[i] + "','spiritReceptor')\"> [" + spiritReceptor.tiers[keys[i]].tier + "--" + spiritReceptor.tiers[keys[i]].name + "] (1/1)</td><td> Max Level </td></tr>";
                } else {
                    temp += "<tr class=\"sRModule sRTier\"><td onclick=\"game.inspect('" + keys[i] + "','spiritReceptor')\"> [" + spiritReceptor.tiers[keys[i]].tier + "--" + spiritReceptor.tiers[keys[i]].name + "] (" + character.sheet.spiritReceptor[keys[i]] + "/" + spiritReceptor.tiers[keys[i]].levels + ")</td><td><div class=\"sys-upgrade-btn\" onclick=\"spiritReceptor.upgrade('"+keys[i]+"')\"></div>" + spiritReceptor.tiers[keys[i]].cost + " System Points</td></tr>";
                }
            }
        }

        game.sRDisplay.insertAdjacentHTML("afterend", temp);
        spiritReceptor.toggleD(); // DIRTY HACK OF A FIX
        spiritReceptor.toggleD();
    },
    // Runs on the initial unlock of the system!
    unlock: function() {
        // We unlocked the function!  Display the basic data!
        for (const item of game.sRUnlock) {
            item.style.display = "table-row";
        }
    },
    // Upgrade the Spirit Receptor Module!
    upgrade: function(target) {
        // Check if we have enough
        if(character.sheet.inventory.sp >= spiritReceptor.tiers[target].cost) {
            // If we do
            // Spend the points
            character.sheet.inventory.sp -= spiritReceptor.tiers[target].cost;
            // Up the level for the target
            character.sheet.spiritReceptor[target]++;
            //Trigger an update for the SP display and the SR display
            spiritReceptor.updateD();
            game.updateInventoryCounts();
            // Update the rates for regen!
        }
    },
    tiers: {
        t0: {
            cost: 5,
            levels: 1,
            name: "Receptor Conceptualization",
            desc: "The first step to build a Spirit Receptor is to conceptualize how it would look like. Depending on the environment, Spirit Receptors may take on various shapes and sizes to suit their environment.  Once this upgrade is bought, the user's base Qi Recovery Rate shall be boosted by 10%.",
            bonus_per_lvl: .1,
            total_bonus: .1,
            tier: "Tier 0"
        },
        t1: {
            cost: 5,
            levels: 5,
            name: "Receptor Foundation",
            desc: "Once a Spirit Receptor has been conceptualized, one must now transform the concept into something more corporeal, laying its foundations into reality. Only when a spirit vein has achieved the peak of this level would they be considered to have actual Spirit Receptors. Once this upgrade is at its maximum level, the user's base Qi Recovery Rate shall be boosted by another 10%, boosting it by a total of 20%.",
            bonus_per_level: .02,
            total_bonus: .1,
            tier: "Tier 1"
        }
    }
}