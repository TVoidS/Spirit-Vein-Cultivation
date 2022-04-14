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
        game.baseTime = 12; // This is in seconds!  This is mostly in charge of qi regen, BUT it is also in charge of most things that are from the story!
        // e.g. The default time it takes to process the spirit slag!

        // Initial values for the progress bars.
        setup.bars();

        // connect the character's inventory to the related display html
        setup.inventory();

        //System Modules
        //Upgrade Module
        setup.systemUpgradeModule();
        setup.systemQuestModule();
        setup.spiritReceptorModule();

        // Stats Upgrades
        setup.characterStats();

        // Skills Upgrades
        setup.characterSkills();

        // Setup the inspection ability
        setup.inspection();

        // Connect the Event Log
        game.eventLog = document.getElementById("eventLog");

        // Create the Character object
        if(type == 'new') {
            // if the init was called via the "New Game" button
            character.init('new');
        } else {
            // If the init was called via the "Load Character" button (PROVIDES JSON FILE)
            // load provided json (type variable)
            character.init(type);
        }

        // Welcome them to the game!
        game.registerEvent('Welcome', 'Welcome to the Spirit Vein Idle game!  Make sure to keep up with the story on Royal Road!');

        // Start the game loop! (KEEP AT THE END OF INIT())
        game.gameLoop= setInterval(game.gameLogic, timeStep);
        game.questLoop = setInterval(quests.checkQuests, (10000));
        game.unlockLoop = setInterval(thresholds.check, 10000)
    },

    // Primary GameLoop function!  This will repeate forever and eever and eeeeeeverrrr
    gameLogic: function() {

        // Process everything related to Qi-Regen!
        game.updateQiRegenBar();
        
        // Only runs if there is an active resource production going on!
        if(game.res_bar) {
            game.updateResourceBar();
        }
    },

    // Handles everything related to the numbers on the inventory display!
    updateInventoryCounts: function() {
        // Update the inventory displays!
        game.iSSlDisplay.innerHTML = character.sheet.inventory[0];
        game.sSlDisplay.innerHTML = character.sheet.inventory[1];
        game.sSSlDisplay.innerHTML = character.sheet.inventory[2];
        game.sPDisplay.innerHTML = character.sheet.inventory.sp;
    },

    // When Qi Conversion rises, we need to handle this!
    updateInventoryRows: function() {
        if (!character.sheet.thresholds.qiConversion.res1 && character.sheet.skills.qiConversion > 10) {
            game.registerEvent("Unlock", "You just unlocked a new tier of resource!  Spirit Slag!  ... Don't look at me like that.  The descriptor 'Inferior' should have given this one away.");
            // We just hit level 11, or far surpassed it!  We passed the threshold, so update, and move on
            character.sheet.thresholds.qiConversion.res1 = true;
            game.tier1Inventory.style = "display: table-row;";
        }
        if (!character.sheet.thresholds.qiConversion.res2 && character.sheet.skills.qiConversion > 20) {
            game.registerEvent("Unlock", "You just unlocked SUPERIOR Spirit Slag.  Just like normal Spirit Slag, but blue!");
            // We just hit level 21, or far surpassed it!  We passed the threshold, so update, and move on
            character.sheet.thresholds.qiConversion.res2 = true;
            game.tier2Inventory.style = "display: table-row;";
        }
    },

    // For the initial load of the Inventory Rows.  This is to fix problems when loading in as a saved character at high level
    onLoadInventoryRows: function() {
        if (character.sheet.skills.qiConversion > 10) {
            // Display Tier 1 resources!
            game.tier1Inventory.style = "display: table-row;";
            if(character.sheet.skills.qiConversion > 20) {
                game.tier2Inventory.style = "display: table-row;";
                // add more for each tier of resource added!
            }
        }
    },

    // Handles all of the changes to the display of character stats!
    updateCharacterStatDisplays: function() {
        // Update the System Display's values for each of the main stats!
        game.qiCap.innerHTML = "[Qi Capacity] - " + character.sheet.stats.currQi + "/" + character.sheet.stats.qiCap;
        game.qiCapCost.innerHTML = upgrades.stats.qiCap.cost(character.sheet.stats.qiCap);

        // Helps with fancy writing
        let rem = character.sheet.stats.purity%10;

        game.purityD.innerHTML = "[Qi Purity] - Tier " + ((character.sheet.stats.purity-rem)/10) + ", Grade " + rem;
        game.purityCost.innerHTML = upgrades.stats.purity.cost(character.sheet.stats.purity);

        game.regenD.innerHTML = "[Qi Recovery Rate] - " + character.sheet.stats.regen + "/10min";
        game.regenCost.innerHTML = upgrades.stats.regen.cost(character.sheet.stats.regen);
    },

    // Handles all changes to the Skill Displays.
    updateCharacterSkillDisplays: function() {
        // Update the Qi Conversion Skill display
        game.qiConversion.innerHTML = "[Qi Conversion Lv. " + character.sheet.skills.qiConversion + "]";
        game.qiConversionCost.innerHTML = upgrades.skills.qiConversion.cost(character.sheet.skills.qiConversion);
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
                game.updateCharacterStatDisplays();

                // Tell the system what tier is being made!
                game.mat_tier = tier;
            }
        } else {
            // TODO: Turn this into an Inspect Screen, or maybe leave it as a potential Error message?
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
            
            // Update the Inventory Counts display!
            game.updateInventoryCounts();
        
            // We just did a thing, remember that!
            character.sheet.tracking.qiConversion++;
        }
        game.spiritSlagProgBar.style.width = ((game.res_bar_prog/rates.time.convert[game.mat_tier])*100) + "%";
    },

    // Toggles the System Menu's Upgrade Module
    toggleUpgradeD: function() {

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
                game.updateCharacterStatDisplays();
            } else if (character.sheet.stats.currQi < character.sheet.stats.qiCap) {
                // if we aren't full, but only by a little, set us to cap!
                character.sheet.stats.currQi = character.sheet.stats.qiCap;
                game.updateCharacterStatDisplays();
            }
            // Reset the progress of the bar!
            game.regen_prog = 0;
        }
        // Regardless of whether the tab is active or not, we've already factored that in!  Just update the style!
        game.regen_bar.style.width = (( game.regen_prog / rates.time.regen )*100)+"%";
    },

    // Handles stat upgrade requests from the System UI
    upgradeStat: function(target) {
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

            // Render the changes!
            game.updateCharacterStatDisplays();
            game.updateInventoryCounts();
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
            game.updateCharacterSkillDisplays();
            game.updateInventoryCounts();

            if(target == 'qiConversion') {
                rates.calculateTimes();
                game.updateInventoryRows();
            }
        }
    },

    // makes a call to inspect an item, and updates the related Inspection Display
    // TODO: transfer this to the inspect object.
    inspect: function(target, type) {
        // If the target exists
        if(type == "quest") {
            // TODO: Make this thingy a thing!
            console.log("Registered Quest Inspection! Target: " + target);
        } else {
            if(inspection[target]){
                // Update common items
                game.inspectName.innerHTML = inspection[target].name;
                game.inspectType.innerHTML = inspection[target].type;
                game.inspectDesc.innerHTML = inspection[target].desc;

                // Check for what the "Extra" display would be used for!

                if(inspection[target].upg_desc) {
                    // There will be an array of objects here
                    var out = '<table class="inspectExtra">'
                    for(let i = 0; i < inspection[target].upg_desc.length; i++) {
                        // Add a <td> </td> per item?
                        out += "<td>" + inspection[target].upg_desc[i] + "</td>";
                    }
                    out += "</table>";
                    game.inspectExt.style.display = "block";
                    game.inspectExt.innerHTML = out;
                } else {
                    // No bonus content found, hide the thingy!
                    game.inspectExt.style.display = "none";
                    game.inspectExt.innerHTML = "";
                }
            }
        }

    },

    // Registers an event on the Event Log
    registerEvent: function(event, message) {
        game.eventLog.innerHTML += "<tr><td>" + event + ":</td><td>" + message + "</td></tr>";
    }
}
// TODO: Create an Achievements object, or integrate it into the Quests object, as quests that don't have requirements?