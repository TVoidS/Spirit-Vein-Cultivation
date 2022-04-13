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
    // Handles the connection between the Game object and the display
    systemQuestModule: function() {
        game.sysQdMod = document.getElementsByClassName("questModule");
        game.qdExp = document.getElementById("questExpand");
        game.questsDisplay = document.getElementById("quests");
        quests.init(); // Set the default values for the Quest object!
    },
    // Connects the Game Object, and the displays for the Spirit Receptor.
    spiritReceptorModule: function() {
        game.sRExpBtn = document.getElementById("sRExpand");
        game.sRDMod = document.getElementsByClassName("sRModule");
        game.sRDisplay = document.getElementById("spiritReceptor");
        spiritReceptor.init(); // Set the default values for the Spirit Receptor object!
    }
}
