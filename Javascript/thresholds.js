// This could also be considered Achievements?
const thresholds = {
    // Check all the thresholds agains the character sheet to see if they are unlocked!
    check: function() {
        let keys = Object.keys(thresholds.unlocks.modules);

        // check for Modules first!  (we will check the others later)
        keys.forEach(unlock => {
            // Type represents the types of unlocks (modules, skills, resources, etc.)

            let newUnlock = true;
            // Default to True so that we can contest it with easy checks.
            
            // If the module isn't unlocked, Check if we meet conditions
            if(!character.sheet.thresholds.modules[unlock]) {
                
                if(thresholds.unlocks.modules[unlock].requirements.stats) {
                    // Then verify that the player meets the requirements!

                    for (const [key, value] of Object.entries(thresholds.unlocks.modules[unlock].requirements.stats)) {
                        if (character.sheet.stats[key] < value) {
                            newUnlock=false;
                            break;
                        }
                    }
                }
                if(thresholds.unlocks.modules[unlock].requirements.inventory && newUnlock) {
                    // Then verify that the player meets the requirements!

                    for (const [key, value] of Object.entries(thresholds.unlocks.modules[unlock].requirements.inventory)) {
                        if (character.sheet.inventory[key] < value) {
                            newUnlock=false;
                            break;
                        }
                    }
                }
                if(thresholds.unlocks.modules[unlock].requirements.tracking && newUnlock) {
                    // Then verify that the player meets the requirements!

                    for (const [key, value] of Object.entries(thresholds.unlocks.modules[unlock].requirements.tracking)) {
                        if (character.sheet.tracking[key] < value) {
                            newUnlock=false;
                            break;
                        }
                    }
                }
            } else {
                newUnlock = false;
            }

            if(newUnlock) {
                // Unlock the module!
                game.registerEvent("Module Unlocked", "[" + thresholds.unlocks.modules[unlock].name + "]");
                character.sheet.thresholds.modules[unlock] = true;

                // Since each module is VERY unique, we need to make cases for the update
                switch (unlock) {
                    case "spiritReceptor": spiritReceptor.unlock(); break;
                    default: console.log("Default unlock.  How the hell'd you get here?");
                }
            }
        });
    },
    // TODO: Send the material unlocks over here?
    unlocks: {
        // The list of all unlocks gained simply by reaching a certain point!
        modules: {
            spiritReceptor: {
                name: "Spirit Receptor Module",
                requirements: {
                    stats: {
                        purity: 10
                    }
                }
            }
        }
    }
}