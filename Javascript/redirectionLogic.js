// Wait for load, then initialize the 'menu' object.
window.addEventListener("load", function () { menu.init()});

// Meant to get you from one section of the game to another.
var menu  = {
    init: function() {
        console.log("menu Loaded!");

        // Get the Canvas and Context for drawing.
        // menu.canvas = document.getElementById("gamebase");
        // menu.context = menu.canvas.getContext("2d");
        // Likely don't need the above anymore.  Canvas isnt being used to draw anything.

        // Hide all game layers and display the start screen
        menu.hideScreens();
        menu.showStartScreen();
    },

    hideScreens: function() {
        var screens = document.getElementsByClassName("gamelayer");
        for(let i = screens.length - 1; i>=0; i--) {
            var screen = screens[i];
            screen.style.display = "none";
        }
    },

    hideScreen: function(id) {
        var screen = document.getElementById(id);
        screen.style.display = "none";
    },

    showScreen: function(id) {
        var screen = document.getElementById(id);
        screen.style.display = "block";
    },

    showGameScreen: function() {
        var screen = document.getElementById("gamescreen");
        menu.hideScreens();
        screen.style.display = "block";
    },
    
    showSettingsScreen: function() {
        var screen = document.getElementById("settingsscreen");
        menu.hideScreens();
        screen.style.display = "block";
    },

    showStartScreen: function() {
        var screen = document.getElementById("startscreen");
        menu.hideScreens();
        screen.style.display = "block";
    },

    loadCharacter: function() {
        var reader = new FileReader();

        reader.readAsText(document.getElementById("fileInput").files[0]);
        reader.onload = function() {
            game.init(reader.result);
            menu.hideScreens();
            setTimeout(menu.showGameScreen(), 1000);
        };
        reader.onerror = function() {
            alert("Failed to read file!");
        };
    }
}