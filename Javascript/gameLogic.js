const game = {
    init: function(type) {
        // What do I want here.
        console.log("game loaded!");

        // Required data for almost all of the game logic, used primarily in pre-processing
        const timeStep = 20;
        game.secondConvert = (1000/timeStep);
        // NOTE: we will multiply everything that is dependent on timeStep by secondConvert
        // when the document.hidden value is true.

        game.gameLoop= setInterval(game.gameLogic, timeStep);

        // Initial values for the primary progress bar.
        game.spiritSlagProgBar = document.getElementById("spirit-slag-prog");
        game.prog1 = false;
        game.prog1_max = 1 * game.secondConvert;
        game.prog1_curr = 0;
        game.prog1_mat_tier = 0;

        game.spiritSlagMass = 0;
        game.spiritSlagMassPerTick = 10;

        // Create the Character object
        if(type == 'new') {
            character.init('new');
        } else {
            // load provided json (type variable)
            character.init(type);
        }

        // Make it so the display values are re-calculated.
        character.updatedInv = true;
        character.updatedStats = true;

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
    },

    gameLogic: function() {
        
        // check if we should be moving the progress bar!
        if(game.prog1) {
            if(game.prog1_curr < game.prog1_max) {
                if(document.hidden) {
                    game.updateProg1Hidden();
                } else {
                    game.updateProg1();
                }
            } else {
                game.prog1 = false;
                game.prog1_curr = 0;
                game.spiritSlagProgBar.style.width = "0%"
                character.stats.inventory[game.prog1_mat_tier] += character.stats.rates[game.prog1_mat_tier];
                console.log("Spirit Slag: " + character.stats.inventory[game.prog1_mat_tier]);
                character.updatedInv = true;
            }
        }

        // Only if something on the Character side has been updated.
        if(character.updatedInv) {
            game.iSSlDisplay.innerHTML = character.stats.inventory[0];
            game.sSlDisplay.innerHTML = character.stats.inventory[1];
            game.sPDisplay.innerHTML = character.stats.inventory.sp;
        }

        // Only if the character's stats have been marked as updated.
        if(character.updatedStats) {
            game.qiCap.innerHTML = "[Qi Capacity] - " + character.stats.stats.currQi + "/" + character.stats.stats.cap;

            game.purityD.innerHTML = "[Qi Purity] - Tier " + (character.stats.stats.purity/10) + ", Grade " + (character.stats.stats.purity%10);

            game.regenD.innerHTML = "[Qi Recovery Rate] - " + character.stats.stats.regen + "/10min";
        }
    },

    stopLogic: function() {
        game.gameLoop.clearInterval();
    },

    resumeLogic: function() {
        game.gameLoop = setInterval(game.gameLogic, 1000);
    },

    startProg1: function(tier) {
        if(character.stats.stats.currQi > 0 && !game.prog1) {
            game.prog1 = true;
            character.stats.stats.currQi--;
            character.updatedStats = true;
            game.prog1_mat_tier = tier;
        }
    },
    updateProg1: function() {
        // normal display rate.
        game.prog1_curr++;
        game.spiritSlagProgBar.style.width = 100*(game.prog1_curr/game.prog1_max) + "%";
    },
    updateProg1Hidden: function() {
        // This is for when the display is hidden, and we need to alter the progression rate to 1 tick per second.
        game.prog1_curr += game.secondConvert;
        game.spiritSlagProgBar.style.width = 100*(game.prog1_curr/game.prog1_max) + "%";
    },

    toggleUpgrade: function() {
        console.log(game.sysUpMod);
        if(!game.upExpanded) {
            for(let i = 0; i < game.sysUpMod.length; i++) {
                game.sysUpMod[i].style.display = "table-row";
            }
            game.upExp.innerHTML = "--Close--";
            game.upExpanded = true;
        } else {
            for(let i = 0; i < game.sysUpMod.length; i++) {
                game.sysUpMod[i].style.display = "none";
            }
            game.upExp.innerHTML = "--Open--";
            game.upExpanded = false;
        }
    }
}

const character = {
    init: function(data) {
        if(data == 'new') {
            console.log("registered new character");
            character.stats = {
                inventory: {
                    sp: 0,
                    0: 0,
                    1: 0,
                    2: 0
                },
                rates: {
                    0: 10,
                    1: 0,
                    2: 0
                },
                stats: {
                    cap: 10,
                    currQi: 10,
                    purity: 0,
                    regen: 1
                },
                skills: {
                    qiConversion: 1
                }
            }
        } else {
            character.stats = JSON.parse(data);
            console.log(character.stats);
        }

        // create the timeTicks object
        character.timeTicks = {
            iSSTick:  60 * game.secondConvert
        };
    },
    export: function() {
        let dataStr = JSON.stringify(character.stats);
        let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
        let exportFileDefaultName = 'data.json';
    
        let linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    },
    exchange: function(tier) {
        var quantity = character.stats.inventory[tier];
        if (quantity >= 100) {
            character.stats.inventory[tier] = quantity%100;
            quantity -= (quantity%100);
            character.stats.inventory.sp += quantity * conversionRates[tier];
        }
    },
    updatedInv: false,
    updatedStats: false
}

const conversionRates = {
    0: .01,
    1: 1
}