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

    // Toggles the System Menu's Quest Module
    toggleQuestD: function () {
        if(!game.qdExpanded) {
            for(let i = 0; i < game.sysQdMod.length; i++) {
                game.sysQdMod[i].style.display = "table-row";
            }

            game.qdExp.innerHTML = "--Close--";

            game.qdExpanded = true;
        } else {

            for(let i = 0; i < game.sysQdMod.length; i++) {
                game.sysQdMod[i].style.display = "none";
            }

            game.qdExp.innerHTML = "--Open--";
            game.qdExpanded = false;
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
    inspect: function(target) {
        // If the target exists
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

    },

    // Registers an event on the Event Log
    registerEvent: function(event, message) {
        game.eventLog.innerHTML += "<tr><td>" + event + ":</td><td>" + message + "</td></tr>";
    }, 

    // Handles the addition of new Quests to the Quest Display!
    updateQuestDisplay: function() {
        // Just re-display everything (a quest Status might have changed?)
        const elements = document.getElementsByClassName("quest");
        while(elements.length > 0) {
            elements[0].parentNode.removeChild(elements[0]);
        }

        let temp = "";
        for (const qes in character.sheet.quest) {
            // TODO: Add the onclick inspect function for each quest!
            temp += '<tr class="questModule quest"><td>' + character.sheet.quest[qes].display_name + '</td><td>' + character.sheet.quest[qes].status + '</td></tr>';
        }
        game.questsDisplay.insertAdjacentHTML("afterend", temp);
    }
}

// This object is for connection forming, and constant data loading.  NOT FOR CHARACTER SETUP
const setup = {
    bars: function() {
        // Main resource bar setup
        game.spiritSlagProgBar = document.getElementById("spirit-slag-prog");

        // Whether the bar is active or not (you just opened the game, of course it's off!);
        game.res_bar = false;

        // the progress of the resource bar, higher = closer to done
        game.res_bar_prog = 0;

        // The tier of resource being produced.  Used to make sure we are calculating against the right time and at the right pace.
        game.mat_tier = 0;

        // Qi Regen Bar setup
        game.regen_bar = document.getElementById("qi-regen-prog");
        game.regen_prog = 0;
    },
    inventory: function() {
        // Inferior Spirit Slag
        game.iSSlDisplay = document.getElementById("iSSlCount");
        // Spirit Slag
        game.sSlDisplay = document.getElementById("sSlCount");
        // Superior Spirit Slag
        game.sSSlDisplay = document.getElementById("sSSlCount");
        // System Points
        game.sPDisplay = document.getElementById("systemPoints");

        // Inventory Row Display objects
        game.tier1Inventory = document.getElementById("tier1Resource");
        game.tier2Inventory = document.getElementById("tier2Resource");

        // Start the rows as invisible! (they become visible when we unlock them, but we just booted up, so they will start invis)
        game.tier1Inventory.style = "display: none;";
        game.tier2Inventory.style = "display: none;";
    },
    systemUpgradeModule: function() {
        // The array of all elements that are considered parts of the Upgrade Module (attatches them to the toggle)
        game.sysUpMod = document.getElementsByClassName("upgradeModule");
        // The Open/Close item that handles the onclick for the Upgrade Module
        game.upExp = document.getElementById("upgradeExpand");
        // The flag to help us track if the module is open or not.
        game.upExpanded = false;
    },
    characterStats: function() {
        // Connect to the Qi Capacity HTML objects
        game.qiCap = document.getElementById("qiCapUpgradeModule");
        game.qiCapCost = document.getElementById("qiCapCost");

        // Connect to the Qi Purity HTML objects
        game.purityD = document.getElementById("qiPurityUpgradeModule");
        game.purityCost = document.getElementById("qiPurityCost");

        // Connect to the Qi Regeneration HTML objects
        game.regenD = document.getElementById("qiRegenUpgradeModule");
        game.regenCost = document.getElementById("qiRegenCost");
    },
    characterSkills: function() {
        // Connect to the Qi Conversion display HTML objects
        game.qiConversion = document.getElementById("qiConversionUpgradeModule");
        game.qiConversionCost = document.getElementById("qiConversionCost");

        // This is where other skills would go when added!
    },
    // Handles connection to the Inspection Display pieces.
    inspection: function() {
        game.inspectName = document.getElementById("inspectName");
        game.inspectType = document.getElementById("inspectType");
        game.inspectDesc = document.getElementById("inspectDescription");
        game.inspectExt = document.getElementById("inspectExtra");
    },
    systemQuestModule: function() {
        game.qdExpanded = false;
        game.sysQdMod = document.getElementsByClassName("questModule");
        game.qdExp = document.getElementById("questExpand");
        game.questsDisplay = document.getElementById("quests");
    }
}

const character = {
    init: function(data) {
        let temp_sheet = {
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
            },
            thresholds: {
                qiConversion: {
                    res1: false,
                    res2: false,
                    res3: false,
                    res4: false,
                    res5: false,
                    res6: false,
                    res7: false,
                    res8: false,
                    res9: false
                }
            },
            tracking: {
                qiConversion: 0,
                exchange: 0
            }
        };
        if(data == 'new') {
            // Sanity check console log!
            console.log("registered new character");

            // This is the Character Sheet.  Keeps track of ALL the data that is saved!
            // This is to make saving and loading *REALLY* easy for me!
            character.sheet = temp_sheet;
        } else {

            // This is the "Load Character" portion of the init!
            character.sheet = JSON.parse(data);

            // Sanity check console log!
            console.log(character.sheet);

            // Save checking!
            let keys = Object.keys(temp_sheet);
            keys.forEach(element => {
                if(!character.sheet.hasOwnProperty(element)) {
                    // We don't got that here, we got:
                    character.sheet[element] = temp_sheet[element];
                }
            });
        }

        //Make sure to start up the rates object, or you'd never get any Spirit Slag in the first place!
        rates.init();

        // Make it so the display values are updated to be correct!
        game.updateInventoryCounts();
        game.onLoadInventoryRows();
        game.updateCharacterStatDisplays();
        game.updateCharacterSkillDisplays();
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
            game.updateInventoryCounts();
            // HE DID A THING, HE DID A THING!
            character.sheet.tracking.exchange++;
        }
    }
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

    // Conversion rates from Mass to System Points for each material tier.
    conversion: { // 100^(x-1)
        0: .01,
        1: 1,
        2: 100
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
    },
    avg_f2: [ // Average values of Fibbo numbers starting from the second 1. Used primarily in calculating returns  hopefully we won't need more than tier 20?  Hopefully???
        1,
        1.5,
        2,
        2.75,
        3.8,
        5+(1/3),
        (53/7),
        10.875,
        15+(7/9),
        23.1,
        (375/11),
        50+(2/3),
        (985/13),
        (1595/14),
        (2582/15),
        (4179/16),
        (6763/17),
        608,
        (17709/19)
    ]
}

const inspection = {
    qiConversion: {
        name: "Qi Conversion",
        type: "Skill",
        desc: "This converts your Qi into various resources.  Make sure to click the Generate buttons in the bottom right to get it going!",
        upg_desc: [
            "Makes your best tier resource faster",
            "Unlocks new resources"
        ]
    },
    qiCap: {
        name: "Qi Capacity",
        type: "Stat",
        desc: "This stat governs how much qi you have in reserve! Higher values mean you take longer to run dry!",
        upg_desc: [
            "+1 Qi per level!",
            "May help you Unlock certain things"
        ]
    },
    purity: {
        name: "Qi Purity",
        type: "Stat",
        desc: "This stat governs how much your Qi means, and how dense it is.  This is almost directly comparable to your cultivation realm!",
        upg_desc: [
            "+10g produced for the related tier of resource per grade",
            "May help you unlock certain things"
        ]
    },
    regen: {
        name: "Qi Regeneration",
        type: "Stat",
        desc: "This stat determines how much Qi you get back every time your Qi Regeneration bar (blue) fills.",
        upg_desc: [
            "+1 Qi per bar fill per level",
            "May help you unlock certain things"
        ]
    },
    res0: {
        name: "Inferior Spirit Slag",
        type: "Resource",
        desc: "Little more than energized shit, this is a great fertilizer.  Quite poisonous to humans and other living creatures. Appears to be a gray powder."
    },
    res1: {
        name: "Spirit Slag",
        type: "Resource",
        desc: "Quite a bit better than it's 'Inferior' version, this white powder is rather expensive, and greatly accellerates the growth of both normal, and medicinal plants"
    },
    res2: {
        name: "Superior Spirit Slag",
        type: "Resource",
        desc: "If Spirit Slag was just Inferior Spirit Slag in a better package, then Superior Spirit Slag is totally different. At this point, multiple people, especially alchemists and gardeners, would totally love to have Superior Spirit Slag on hand. Why, you might ask? Well, Superior Spirit Slag is actually closer to Spirit Stones compared to actual Spirit Slag. Sure, it's packaged the same way as the two previous products and has even better smelling perfume, but its effects are leagues apart compared to its previous variant.  Surprisingly, it's also used to cure hemorrhoids."
    }
}

const quests = {
    checkQuests: function() {
        let keys = Object.keys(quests.q);

        // Check each quest...
        keys.forEach(quest => {
            let newQuest = true;
            // If the player doesn't already have the quest...
            if(!character.sheet.quest.hasOwnProperty(quest)) {
                if(quests.q[quest].prereqs.stats) {
                    // Then verify that the player meets the prereqs!

                    for (const [key, value] of Object.entries(quests.q[quest].prereqs.stats)) {
                        if (character.sheet.stats[key] < value) {
                            newQuest=false;
                            break;
                        }
                    }
                }
                if(quests.q[quest].prereqs.inventory && newQuest) {
                    // Then verify that the player meets the prereqs!

                    for (const [key, value] of Object.entries(quests.q[quest].prereqs.inventory)) {
                        if (character.sheet.inventory[key] < value) {
                            newQuest=false;
                            break;
                        }
                    }
                }
                if(quests.q[quest].prereqs.tracking && newQuest) {
                    // Then verify that the player meets the prereqs!

                    for (const [key, value] of Object.entries(quests.q[quest].prereqs.tracking)) {
                        if (character.sheet.tracking[key] < value) {
                            newQuest=false;
                            break;
                        }
                    }
                }

                if(newQuest) {
                    // Register an event, and add the quest to the player!
                    game.registerEvent("New Quest", quests.q[quest].display_name);
                    character.sheet.quest[quest] = quests.q[quest];
                    character.sheet.quest[quest].status = "active";
                    game.updateQuestDisplay(quest);

                    if(game.qdExpanded) {
                        game.toggleQuestD();
                    }
                }
            } else if (character.sheet.quest[quest].status == 'active') {
                // If we do, then see if we are eligible for the rewards!
                let passed = true;
                if(quests.q[quest].requirements.stats) {
                    for(const [key, value] of Object.entries(quests.q[quest].requirements.stats)) {
                        if(character.sheet.stats[key] < value) {
                            passed = false;
                        }
                    }
                }
                if(quests.q[quest].requirements.tracking) {
                    for(const [key, value] of Object.entries(quests.q[quest].requirements.tracking)) {
                        if(character.sheet.tracking[key] < value) {
                            passed = false;
                        }
                    }
                }
                if(quests.q[quest].requirements.inventory) {
                    for(const [key, value] of Object.entries(quests.q[quest].requirements.inventory)) {
                        if(character.sheet.inventory[key] < value) {
                            passed = false;
                        }
                    }
                }
                if (passed) {
                    // we passed the quest! Time to apply the rewards and mark as complete
                    character.sheet.quest[quest].status = 'Complete';

                    // Fill our inventory with the new stuff!
                    if(quests.q[quest].rewards.inventory) {
                        for(const [key, value] of Object.entries(quests.q[quest].rewards.inventory)) {
                            character.sheet.inventory[key] += value;
                        }
                        game.updateInventoryCounts();
                    }

                    // Add our stats
                    if(quests.q[quest].rewards.stats) {
                        for(const [key, value] of Object.entries(quests.q[quest].rewards.stats)) {
                            character.sheet.stats[key] += value;
                        }
                        game.updateCharacterStatDisplays();
                    }

                    // Skills? Modules? TODO, add those rewards!

                    game.updateQuestDisplay();
                    game.registerEvent("Quest Complete", "You just completed [" + quest.q[quest].display_name + "]!");
                    if(game.qdExpanded) {
                        game.toggleQuestD();
                    }
                }
            } else {
                // NOTHING, cause the quest isn't active anymore!
            }
        });
    },
    q: {
        ml1: {
            display_name: "Adjusting to a New Life",
            requirements: {
                tracking: {
                    qiConversion: 10,
                    exchange: 1
                }
            },
            prereqs: {
                tracking: {
                    qiConversion: 5
                }
            },
            rewards: {
                inventory: {
                    sp: 5
                }
            },
            desc: ""
        },
        ml2: {
            display_name: "Makings of a True Spirit Vein (3)",
            prereqs: {
                // TODO: Make this branch *actually* exist
                stats: {
                    regen: 10
                }
            },
            requirements: {
                stats: {
                    qiCap: 100
                }
            },
            rewards: {
                inventory: {
                    sp: 2500
                }
            }
        }
    }
}

// TODO: Create an Achievements object, or integrate it into the Quests object, as quests that don't have requirements?