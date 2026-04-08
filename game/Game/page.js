import { h1, h2, h3, p, div, pre, code, ul, li, section, strong, em, style } from "/framework/core/View/View.js";

export default () => {
    div.c("docs-container", () => {
        section.c("hero", () => {
            h1("Game Class");
            p("The core foundation for 3D physics-based games in the framework, powered by Three.js and Rapier.");
        });

        section.c("overview", () => {
            h2("Overview");
            p("The `Game` class provides a high-level abstraction for managing a 3D scene with real-time physics. It handles the boilerplate of setting up a renderer, camera, lights, and a physics world, allowing you to focus on game logic.");
            
            ul(() => {
                li(() => { strong("Rendering:"); p(" Integrated Three.js WebGLRenderer with shadow support."); });
                li(() => { strong("Physics:"); p(" Full Rapier3D integration for rigid body dynamics."); });
                li(() => { strong("Input:"); p(" Built-in WASD movement handling."); });
                li(() => { strong("Animation:"); p(" Smooth animation blending using THREE.AnimationMixer."); });
            });
        });

        section.c("usage", () => {
            h2("Quick Start");
            p("To start a new game, instantiate the `Game` class and call its `init()` method.");
            
            pre.c("code-block", `import { Game } from "/framework/game/Game.js";

const game = new Game(document.getElementById('game-container'));
await game.init();`);
        });

        section.c("api", () => {
            h2("API Reference");

            h3("Core Properties");
            ul(() => {
                li(() => { code("scene"); p(": The THREE.Scene instance."); });
                li(() => { code("camera"); p(": The THREE.PerspectiveCamera instance."); });
                li(() => { code("world"); p(": The RAPIER.World instance for physics simulations."); });
                li(() => { code("player"); p(": An object containing the player's `{ mesh, body }`."); });
                li(() => { code("controls"); p(": OrbitControls for camera manipulation."); });
            });

            h3("Key Methods");
            ul(() => {
                li(() => { 
                    strong("init()"); 
                    p(" Initializes the physics engine, lights, ground, and player. Sets up the main animation loop."); 
                });
                li(() => { 
                    strong("fadeToAction(name, duration)"); 
                    p(" Blends smoothly between character animations (e.g., 'Idle' to 'Walk')."); 
                });
                li(() => { 
                    strong("updatePhysics()"); 
                    p(" Called every frame to step the physics world and sync meshes."); 
                });
            });
        });

        section.c("configuration", () => {
            h3("Camera Modes");
            p("The game supports two camera modes:");
            ul(() => {
                li(() => { strong("Orbit:"); p(" Default mode allowing the user to rotate around the center."); });
                li(() => { strong("Follow:"); p(" A smooth character-follow camera with side offset."); });
            });
            p("Toggle between modes using `game.cameraMode = 'follow'` or through the built-in Settings UI.");
        });
    }).style({
        maxWidth: "800px",
        margin: "0 auto",
        padding: "40px 20px",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        lineHeight: "1.6"
    });

    style(`
        .docs-container h1 { font-size: 3rem; color: #00f2ff; margin-bottom: 0.5rem; }
        .docs-container h2 { font-size: 2rem; color: #ff0080; border-bottom: 1px solid #333; padding-bottom: 10px; margin-top: 40px; }
        .docs-container h3 { color: #00f2ff; margin-top: 25px; }
        .docs-container p { margin-bottom: 15px; }
        .docs-container section { margin-bottom: 40px; }
        .docs-container .code-block { 
            background: #111; 
            padding: 20px; 
            border-radius: 8px; 
            border: 1px solid #333; 
            font-family: 'Courier New', Courier, monospace;
            overflow-x: auto;
            color: #adbac7;
        }
        .docs-container ul { list-style: none; padding-left: 0; }
        .docs-container li { margin-bottom: 15px; display: flex; align-items: baseline; }
        .docs-container li strong { min-width: 120px; color: #ff0080; }
        .docs-container li code { background: #222; padding: 2px 6px; border-radius: 4px; color: #00f2ff; margin-right: 10px; }
        .docs-container .hero { text-align: center; margin-bottom: 60px; }
    `);
};
