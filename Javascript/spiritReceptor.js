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
    unlock: function() {
        // We unlocked the function!  Display the basic data!
        for (const item of game.sRUnlock) {
            item.style.display = "table-row";
        }
    },
    tiers: {
        t0: {
            cost: 5,
            levels: 1,
            name: "Receptor Conceptualization",
            desc: "The first step to build a Spirit Receptor is to conceptualize how it would look like. Depending on the environment, Spirit Receptors may take on various shapes and sizes to suit their environment.  Once this upgrade is bought, the user's base Qi Recovery Rate shall be boosted by 10%.",
            bonus_per_lvl: .1,
            total_bonus: .1
        },
        t1: {
            cost: 5,
            levels: 5,
            name: "Receptor Foundation",
            desc: "Once a Spirit Receptor has been conceptualized, one must now transform the concept into something more corporeal, laying its foundations into reality. Only when a spirit vein has achieved the peak of this level would they be considered to have actual Spirit Receptors. Once this upgrade is at its maximum level, the user's base Qi Recovery Rate shall be boosted by another 10%, boosting it by a total of 20%.",
            bonus_per_level: .02,
            total_bonus: .1
        }
    }
}