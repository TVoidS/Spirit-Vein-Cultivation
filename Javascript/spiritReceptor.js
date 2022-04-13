const spiritReceptor = {
    init: function() {
        spiritReceptor.expanded = false;
    },
    toggleD: function() {
        // Check if the menu is open yet or not
        if(!spiritReceptor.expanded) {
            // If it isn't!

            // Go through all the items that are a part of the Upgrade Module and Display them!
            for(let i = 0; i < game.sysUpMod.length; i++) {
                // This display type is required to make them maintain their appearance
                game.sysUpMod[i].style.display = "table-row";
            }

            // Change the cell data for the thing you clicked to be accurate to it's purpose!
            game.upExp.innerHTML = "--Close--";

            // Change the recorded state!
            spiritReceptor.expanded = true;
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
            spiritReceptor.expanded = false;
        }
    }
}