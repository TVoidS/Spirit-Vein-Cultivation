const game = {
    init: function(type) {
        // Debug log to verify the order of things, and to make sure it's working
        console.log("game loaded!");

        // Required data for almost all of the game logic, used primarily in pre-processing
        // I will try to make this not available for any other calculations, as it is TOO IMPORTANT
        const timeStep = 20;

        // The thing that allows time-based calculations to occur, and is able to adjust for the hidden tab problem!
        // Converts seconds to gameticks!
        game.secondConvert = (1000/timeStep);
        game.baseTime = 1; // This is in seconds!  This is mostly in charge of qi regen, BUT it is also in charge of most things that are from the story!
        // e.g. The default time it takes to process the spirit slag!

        // Initial values for the primary progress bar.
        game.spiritSlagProgBar = document.getElementById("spirit-slag-prog");
        game.res_bar = false;
        game.res_bar_max = 1 * game.secondConvert;
        game.res_bar_prog = 0;
        game.mat_tier = 0;

        // Secondary progress bar!  This is for the Qi Regen Timer!
        game.regen_bar = document.getElementById("qi-regen-prog");
        game.regen_prog = 0;

        // retrieve the inventory counts
        game.iSSlDisplay = document.getElementById("iSSlCount");
        game.sSlDisplay = document.getElementById("sSlCount");
        game.sPDisplay = document.getElementById("systemPoints");

        //System Modules
        //Upgrade Module
        
        // General Display
        game.sysUpMod = document.getElementsByClassName("upgradeModule");
        game.upExp = document.getElementById("upgradeExpand");
        game.upExpanded = false;

        // Stats Upgrades
        game.qiCap = document.getElementById("qiCapUpgradeModule");
        game.qiCapCost = document.getElementById("qiCapCost");

        game.purityD = document.getElementById("qiPurityUpgradeModule");
        game.purityCost = document.getElementById("qiPurityCost");

        game.regenD = document.getElementById("qiRegenUpgradeModule");
        game.regenCost = document.getElementById("qiRegenCost");

        // Skills Upgrades
        game.qiConversion = document.getElementById("qiConversionUpgradeModule");
        game.qiConversionCost = document.getElementById("qiConversionCost");

        // Create the Character object
        if(type == 'new') {
            // if the init was called via the "New Game" button
            character.init('new');
        } else {
            // If the init was called via the "Load Character" button (PROVIDES JSON FILE)
            // load provided json (type variable)
            character.init(type);
        }

        // Start the game loop! (KEEP AT THE END OF INIT())
        game.gameLoop= setInterval(game.gameLogic, timeStep);
    },

    // Primary GameLoop function!  This will repeate forever and eever and eeeeeeverrrr
    gameLogic: function() {

        // Process everything related to Qi-Regen!
        game.updateQiRegenBar();
        
        // Only runs if there is an active resource production going on!
        if(game.res_bar) {
            game.updateResourceBar();
        }

        // Only runs if the Character Inventory has been updated
        if(character.updatedInv) {

            // Update the inventory displays!
            game.iSSlDisplay.innerHTML = character.sheet.inventory[0];
            game.sSlDisplay.innerHTML = character.sheet.inventory[1];
            game.sPDisplay.innerHTML = character.sheet.inventory.sp;

            // Mark the Inventory Displays as up-to-date!
            character.updatedInv = false;
        }

        // Only if the character's stats have been marked as updated.
        if(character.updatedStats) {

            // Update the System Display's values for each of the main stats!
            game.qiCap.innerHTML = "[Qi Capacity] - " + character.sheet.stats.currQi + "/" + character.sheet.stats.qiCap;
            game.qiCapCost.innerHTML = upgrades.stats.qiCap.cost(character.sheet.stats.qiCap);

            // Helps with fancy writing
            let rem = character.sheet.stats.purity%10;

            game.purityD.innerHTML = "[Qi Purity] - Tier " + ((character.sheet.stats.purity-rem)/10) + ", Grade " + rem;
            game.purityCost.innerHTML = upgrades.stats.purity.cost(character.sheet.stats.purity);

            game.regenD.innerHTML = "[Qi Recovery Rate] - " + character.sheet.stats.regen + "/10min";
            game.regenCost.innerHTML = upgrades.stats.regen.cost(character.sheet.stats.regen);
            
            // Mark the Stats displays as up-to-date!
            character.updatedStats = false;
        }

        // If anything skill related changed, update it here!
        if (character.updatedSkills) {

            // Update the Qi Conversion Skill display
            game.qiConversion.innerHTML = "[Qi Conversion Lv. " + character.sheet.skills.qiConversion + "]";
            game.qiConversionCost.innerHTML = upgrades.skills.qiConversion.cost(character.sheet.skills.qiConversion);


            // We've updated the displays, so change the thing!
            character.updatedSkills = false;
        }
    },

    //Unused for now, but may find a use for it
    // It *pauses* the game when run.  Counterpart to the game.resumeLogic() command below.
    stopLogic: function() {
        game.gameLoop.clearInterval();
    },

    // Unused for now, but may find a use for it
    // It *resumes* the game when run.  Counterpart to the game.stopLogic() command from above
    resumeLogic: function() {
        game.gameLoop = setInterval(game.gameLogic, 1000);
    },

    // Triggered when a conversion button is pressed!
    // Processes all the information for the system to start making stuff!
    startResBar: function(tier) {

        if ((character.sheet.skills.qiConversion/10) > tier) {
            if( ( character.sheet.stats.currQi > 0 ) && !game.res_bar) {

                // Tell the GameLoop that we need to update the progress bar now
                game.res_bar = true;

                // Decrement Qi from the character, as that is the cost of generating resources
                character.sheet.stats.currQi--;
                character.updatedStats = true;

                // Tell the system what tier is being made!
                game.mat_tier = tier;
            }
        } else {
            console.log("Not strong enough!");
        }
    },

    // Replaces the updateres_bar() and updateres_barHidden() functions
    // Handles the progress of running materials!
    updateResourceBar: function() {
        
        // If the bar isn't full, or over-full, 
        if(document.hidden) {
            // If the tab isn't active, use enhanced fill-rate
            game.res_bar_prog += game.secondConvert;
        } else {
            // but if it is the active tab, use the normal fill-rate.
            game.res_bar_prog++;
        }
        if(game.res_bar_prog >= rates.time.convert[game.mat_tier]) {
            // If the bar IS full or over-full,

            // Turn off further filling
            game.res_bar = false;
            // Set the bar's progress to 0
            game.res_bar_prog = 0;

            // Add more resources to the character's inventory 
            character.sheet.inventory[game.mat_tier] += rates.gain[game.mat_tier];
            // Tell the game to update the display for the Inventory on the next opportunity!
            character.updatedInv = true;
        }
        game.spiritSlagProgBar.style.width = ((game.res_bar_prog/rates.time.convert[game.mat_tier])*100) + "%";
    },

    // Toggles the System Menu's Upgrade Module
    toggleUpgrade: function() {

        // Check if the menu is open yet or not
        if(!game.upExpanded) {
            // If it isn't!

            // Go through all the items that are a part of the Upgrade Module and Display them!
            for(let i = 0; i < game.sysUpMod.length; i++) {
                // This display type is required to make them maintain their appearance
                game.sysUpMod[i].style.display = "table-row";
            }

            // Change the cell data for the thing you clicked to be accurate to it's purpose!
            game.upExp.innerHTML = "--Close--";

            // Change the recorded state!
            game.upExpanded = true;
        } else {
            // If it is!

            // Go through all the items that are a part of the Upgrade Module and Hide Them!
            for(let i = 0; i < game.sysUpMod.length; i++) {
                // Just the hidden style!
                game.sysUpMod[i].style.display = "none";
            }
            // Change the cell data for the thing you click to be accurate to it's purpose!
            game.upExp.innerHTML = "--Open--";

            // Update the recorded state!
            game.upExpanded = false;
        }
    },

    // Handle everything related to Qi Regen, except updating the stats display when done!
    updateQiRegenBar: function() {

        // If there is more to regen!0
        if(document.hidden) {
            // If the tab isn't active!
            // We need to make more progress per tick if the tab isn't active!
            game.regen_prog += game.secondConvert;
        } else {
            // If the tab IS active, just increment!
            game.regen_prog++;
        }
        if (game.regen_prog >= rates.time.regen) {
            // If we are full up!
            // And aren't full of Qi...
            if (character.sheet.stats.currQi + character.sheet.stats.regen <= character.sheet.stats.qiCap){
                // Increase our Qi by the amount we regen!
                character.sheet.stats.currQi += character.sheet.stats.regen;
                character.updatedStats = true;
            } else if (character.sheet.stats.currQi < character.sheet.stats.qiCap) {
                // if we aren't full, but only by a little, set us to cap!
                character.sheet.stats.currQi = character.sheet.stats.qiCap;
                character.updatedStats = true;
            }
            // Reset the progress of the bar!
            game.regen_prog = 0;
        }
        // Regardless of whether the tab is active or not, we've already factored that in!  Just update the style!
        game.regen_bar.style.width = (( game.regen_prog / rates.time.regen )*100)+"%";
    },

    // Handles stat upgrade requests from the System UI
    upgradeStat: function(target) {

        console.log("Attempted to upgrade: " + target);
        // check if we have the SP for the upgrade
        let cost = upgrades.stats[target].cost(character.sheet.stats[target]);
        if (character.sheet.inventory.sp >= cost) {
            // We have enough! Yay!

            // SPEND IT!!!!
            character.sheet.inventory.sp -= cost;
            // Increment the stat!
            character.sheet.stats[target]++;

            if(target == 'purity') {
                // Update the gain rates for the resources!
                rates.calculateAllReturns();
                rates.calculateTimes();
            }

            // Tell the GameLogic to render the changes!
            character.updatedStats = true;
            character.updatedInv = true;
        }
    },

    // Call this to request to update a skill!
    upgradeSkill: function(target) {
        // Check if we have enough System Points!
        let cost = upgrades.skills[target].cost(character.sheet.skills[target]);
        if(character.sheet.inventory.sp >= cost) {

            // Spend the points, then upgrade the skill!
            character.sheet.inventory.sp -= cost;
            character.sheet.skills[target]++;

            // Stuff updated!  RENDER IT
            character.updatedSkills = true;
            character.updatedInv = true;

            if(target == 'qiConversion') {
                rates.calculateTimes();
            }
        }
    }
}

const character = {
    init: function(data) {
        if(data == 'new') {
            // Sanity check console log!
            console.log("registered new character");

            // This is the Character Sheet.  Keeps track of ALL the data that is saved!
            // This is to make saving and loading *REALLY* easy for me!
            character.sheet = {
                inventory: {
                    sp: 0,
                    0: 0,
                    1: 0,
                    2: 0
                },
                stats: {
                    qiCap: 10,
                    currQi: 10,
                    purity: 0,
                    regen: 1
                },
                skills: {
                    qiConversion: 1 // TODO: MORE SKILLS
                },
                quest: {
                    // TODO: MAKE QUESTS
                }
            }
        } else {

            // This is the "Load Character" portion of the init!
            character.sheet = JSON.parse(data);

            // Sanity check console log!
            console.log(character.sheet);

            // TODO: SAVE VERIFICATION AND UPDATING!
        }

        //Make sure to start up the rates object, or you'd never get any Spirit Slag in the first place!
        rates.init();

        // Make it so the display values are updated to be correct!
        character.updatedInv = true;
        character.updatedStats = true;
        character.updatedSkills = true;
    },

    // Exports the character.sheet object for future loading!
    export: function() {

        // All of this was copied from somewhere on the internet, but here's the rundown!

        // Convert the character.sheet object into a string!
        let dataStr = JSON.stringify(character.sheet);
        // Set the type of file, and charset used, as well as the location to find the file!
        let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
        // Set what the name of the downloaded file should be!
        let exportFileDefaultName = 'data.json';
    
        // Create a new *temporary* element!
        let linkElement = document.createElement('a');
        // Make the element have a reference to the JSON file we just created!
        linkElement.setAttribute('href', dataUri);
        // Make the element have the ability to download a file for them!
        linkElement.setAttribute('download', exportFileDefaultName);
        // CLICK THE TEMPORARY ELEMENT!
        linkElement.click();
        
        // I don't think there is a way to delete these temporary elements, but I haven't checked, so don't sue me!
    },

    // This is what exchanges our Spirit Slag (or what have you) for System Points!
    exchange: function(tier) {
        // retrieve the amount we have in our inventory of that tier
        var quantity = character.sheet.inventory[tier];

        // if we have more than 100, we can exchange
        if (quantity >= 100) {
            // Set the inventory to the remainder of 100 (250 would set it to 50, and 11000403020 would set it to 20)
            character.sheet.inventory[tier] = quantity%100;
            // pull away that remainder, so that we only have a whole multiple of 100
            quantity -= character.sheet.inventory[tier];
            // Multiply the 100's of grams by our conversion rates to get the correct amount of SystemPoints, and store it!
            character.sheet.inventory.sp += quantity * rates.conversion[tier];

            // We updated the inventory, so update related display components!
            character.updatedInv = true;
        }
    },
    updatedInv: false, // For if the inventory is updated
    updatedStats: false, // For if any of the character stats are updated.
    updatedSkills: false
}

// Stores the rates of resource generation
const rates = {
    init: function() {

        rates.timePartition = game.baseTime/12;
        // Create the rates on game start/load
        rates.calculateAllReturns();

        // This is for the time it takes each of the resources to generate!
        rates.calculateTimes();
    },

    // Calculates the return value that would be generated for a given mat_tier.
    calculateReturn: function(mat_tier) {
        var tiers = {
            0: {
                req_tier: 0, // The required Purity Tier to efficiently produce the material
                amt_per_grade: 10, // The amount of increase to production a Purity Grade effects when we are efficiently producing the material
                exd_tier_mult: .5 // The bonus gained by being TOO PURE in tier.  this is (1 + exd_tier_mult)*(how far we exceed by)
            },
            1: { // Leaving this the same as tier 0, except for req_tier for now, as I don't think they are actually different.  May reduce the code later to represent this.
                req_tier: 1,
                amt_per_grade: 10,
                exd_tier_mult: .5
            }
        }

        // saves me some typing!
        // Retrieves the grade of purity
        // var grade = character.sheet.stats.purity%10;
        // Retrieves the Tier of purity
        // var tier = ( character.sheet.stats.purity - grade ) / 10;

        var pureCheck = (character.sheet.stats.purity+1-(10*tiers[mat_tier].req_tier));
        if (pureCheck > 0) {
            var ret = pureCheck*tiers[mat_tier].amt_per_grade;
            return ret;
        } else if (pureCheck > -10){
            pureCheck--;
            var ret = (tiers[mat_tier].amt_per_grade)+pureCheck;
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
            1: rates.calculateReturn(1)
        }
    },

    // Sets the time it takes for each progress bar action!
    calculateTimes: function() {
        rates.time = {
            convert: {
                0: rates.calculateConversionTime(0),
                1: rates.calculateConversionTime(1)
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

    // Conversion rates from Mass to System Points for each material tier.
    conversion: {
        0: .01,
        1: 1
    }
}

// These costs are likely to be off by at *least* a little bit, and likely to be off by a wide margin the further into the story we get!
const upgrades = {
    skills: {
        qiConversion: { 
            cost: function(num) {
                return fibbo.getMeMyCost(num);
            }
        },
        spiritAura: { // TODO: Figure out why I should implement this skill
            1: 1
        },
        spiritSense: { // TODO: Figure out why I should implement this skill
            1: 1
        }
    },
    stats: {
        qiCap: { 
            cost: function(num) {
                // Modify it so that it works for qiCap
                num = (num+1)/10;
                num -= num%1;
                num++;

                return fibbo.getMeMyCost(num);
            }     
        },
        purity: {
            cost: function(num) {
                // Modify to allow for purity
                num+=2;

                return fibbo.getMeMyCost(num);
            }
        },
        regen: {
            cost: function(num) {
                num++;
                return fibbo.getMeMyCost(num) * 10;
            }
        }
    }
}

const fibbo = {
    getMeMyCost: function(num) {
        // Javascript program to find the Nth Fibonacci
        // number using Fast Doubling Method

        let a, b, c, d;
        let MOD = 1000000000007;

        // Function calculate the N-th fibanacci
        // number using fast doubling method
        function FastDoubling(n, res)
        {
            // Base Condition
            if (n == 0) {
                res[0] = 0;
                res[1] = 1;
                return;
            }
            FastDoubling(parseInt(n / 2, 10), res);

            // Here a = F(n)
            a = res[0];

            // Here b = F(n+1)
            b = res[1];

            c = 2 * b - a;

            if (c < 0) {
                c += MOD;
            }

            // As F(2n) = F(n)[2F(n+1) – F(n)]
            // Here c  = F(2n)
            c = (a * c) % MOD;

            // As F(2n + 1) = F(n)^2 + F(n+1)^2
            // Here d = F(2n + 1)
            d = (a * a + b * b) % MOD;

            // Check if N is odd
            // or even
            if (n % 2 == 0) {
                res[0] = c;
                res[1] = d;
            }
            else {
                res[0] = d;
                res[1] = c + d;
            }
        }

        // 1 1 2 3 5 8
        let res = new Array(2);
        res.fill(0);

        FastDoubling(num, res);

        return res[0];
    }
}