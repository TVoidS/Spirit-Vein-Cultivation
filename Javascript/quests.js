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
                    game.registerEvent("New Quest", "[" + quests.q[quest].display_name + "]");
                    character.sheet.quest[quest] = quests.q[quest];
                    character.sheet.quest[quest].status = "active";
                    quests.updateD();

                    if(game.qdExpanded) {
                        quests.toggleD();
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

                    quests.updateD();
                    game.registerEvent("Quest Complete", "You just completed [" + quests.q[quest].display_name + "]!");
                    if(game.qdExpanded) {
                        quests.toggleD();
                    }
                }
            } else {
                // NOTHING, cause the quest isn't active anymore!
            }
        });
    },
    
    // Toggles the System Menu's Quest Module
    toggleD: function() {
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
    
    // Handles the addition of new Quests to the Quest Display!
    updateD: function() {
        // Just re-display everything (a quest Status might have changed?)
        const elements = document.getElementsByClassName("quest");
        while(elements.length > 0) {
            elements[0].parentNode.removeChild(elements[0]);
        }

        let temp = "";
        for (const qes in character.sheet.quest) {
            // TODO: Add the onclick inspect function for each quest!
            temp += '<tr class="questModule quest"><td onclick="game.inspect(\'' + qes + '\',\'quest\')">' + character.sheet.quest[qes].display_name + '</td><td>' + character.sheet.quest[qes].status + '</td></tr>';
        }
        game.questsDisplay.insertAdjacentHTML("afterend", temp);
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
