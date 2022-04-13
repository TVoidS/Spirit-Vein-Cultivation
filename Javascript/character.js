
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
