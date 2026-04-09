import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { div, button, label, input, h2, span, select, option } from "/framework/core/View/View.js";

import { Soldier } from '../Player/Soldier.js';
import { YBot } from '../Player/YBot.js';
import { Controller } from '../Controller/Controller.js';
import { OrbitCamera } from '../Camera/OrbitCamera.js';
import { FollowCamera } from '../Camera/FollowCamera.js';
import { HybridCamera } from '../Camera/HybridCamera.js';

/**
 * Game class - A foundation for 3D physics-based games using Three.js and Rapier.
 */
export class Game {
    constructor(container) {
        this.container = container || document.body;
        
        // Three.js Core
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.autoClear = true; // Default
        
        this.container.appendChild(this.renderer.domElement);
        
        // Timing
        this.clock = new THREE.Clock();
        
        // Components
        this.player = new YBot(this);
        this.controller = new Controller();
        
        // Camera System
        this.viewports = [];
        this.orbitCamera = new OrbitCamera(this);
        this.followCamera = new FollowCamera(this);
        this.hybridCamera = new HybridCamera(this);
        this.activeCamera = this.hybridCamera;
        this.cameraMode = 'hybrid'; // 'orbit', 'follow', or 'hybrid'
        
        // Physics World
        this.world = null;
        this.timeScale = 1.0;
        this.physicsAccumulator = 0;
        this.fixedTimeStep = 1 / 60;
        
        // Initialization
        this.initStarted = false;
        
        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener('resize', () => this.onResize());
    }

    onResize() {
        if (!this.renderer) return;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        if (this.viewports.length === 0) {
            this.orbitCamera.onResize();
            this.followCamera.onResize();
        } else {
            for (const vp of this.viewports) {
                const rect = vp.container.getBoundingClientRect();
                vp.camera.onResize(rect.width, rect.height);
            }
        }
    }

    async init() {
        if (this.initStarted) return;
        this.initStarted = true;

        // Initialize Rapier
        await RAPIER.init({});
        this.world = new RAPIER.World({ x: 0.0, y: -9.81, z: 0.0 });

        this.setupLights();
        this.createGround();
        
        // Load Player
        await this.player.load();
        
        this.createSettingsUI();
        this.animate();
    }

    setupLights() {
        // Higher ambient light for better visibility
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Main directional light (sun-like)
        const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
        sunLight.position.set(15, 30, 20);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.left = -50;
        sunLight.shadow.camera.right = 50;
        sunLight.shadow.camera.top = 50;
        sunLight.shadow.camera.bottom = -50;
        this.scene.add(sunLight);

        const cyanLight = new THREE.PointLight(0x00f2ff, 1.5, 100);
        cyanLight.position.set(10, 20, 10);
        this.scene.add(cyanLight);
        
        const pinkLight = new THREE.PointLight(0xff0080, 1.0, 100);
        pinkLight.position.set(-10, 10, -10);
        this.scene.add(pinkLight);

        // Hemisphere light for ground/sky color balance
        const hemisphereLight = new THREE.HemisphereLight(0x00f2ff, 0xff0080, 0.3);
        this.scene.add(hemisphereLight);
    }

    createGround() {
        const geometry = new THREE.PlaneGeometry(100, 100);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a, 
            roughness: 0.5, 
            metalness: 0.2 
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.receiveShadow = true;
        this.scene.add(mesh);

        const grid = new THREE.GridHelper(100, 50, 0x444444, 0x222222);
        grid.position.y = 0.01;
        this.scene.add(grid);

        const groundColliderDesc = RAPIER.ColliderDesc.cuboid(50, 0.1, 50);
        this.world.createCollider(groundColliderDesc);
    }

    addViewport(container, cameraType = 'orbit') {
        let camera;
        if (cameraType === 'follow') {
            camera = new FollowCamera(this);
        } else if (cameraType === 'hybrid') {
            camera = new HybridCamera(this);
        } else {
            camera = new OrbitCamera(this, container);
        }

        this.viewports.push({ container, camera });
        
        // Ensure renderer fills the background if we have viewports
        this.renderer.domElement.style.position = 'fixed';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.zIndex = '1'; // Move to front
        this.renderer.domElement.style.pointerEvents = 'none'; // Click through to containers
        this.renderer.autoClear = false; // Essential for multi-viewport
        
        return camera;
    }

    async switchPlayer(name) {
        if (!this.player) return;

        const pos = this.player.body ? this.player.body.translation() : { x: 0, y: 5, z: 0 };
        this.player.destroy();

        if (name === 'Soldier') {
            this.player = new Soldier(this);
        } else if (name === 'YBot') {
            this.player = new YBot(this);
        }

        this.player.spawnPoint = { x: pos.x, y: pos.y + 0.5, z: pos.z }; // Spawn slightly above
        await this.player.load();

        // Update cameras to follow new player mesh
        this.followCamera.update(0, this.player.mesh);
        this.hybridCamera.update(0, this.player.mesh, null);
        for (const vp of this.viewports) {
            vp.camera.update(0, this.player.mesh, null);
        }
    }

    createSettingsUI() {
        const settingsBtn = button.c("settings-btn", "Settings");
        settingsBtn.style({
            position: "absolute",
            top: "20px",
            right: "20px",
            zIndex: 1000,
            padding: "8px 16px",
            background: "rgba(0, 242, 255, 0.2)",
            border: "1px solid #00f2ff",
            color: "#00f2ff",
            borderRadius: "4px",
            cursor: "pointer",
            backdropFilter: "blur(4px)"
        });

        const panel = div.c("settings-panel", () => {
            h2("Settings");
            
            div.c("setting-item", () => {
                label("Camera Mode: ").style({ display: "block", color: "#fff", marginBottom: "5px" });
                select().on("change", (e) => {
                    this.cameraMode = e.target.value;
                    if (this.cameraMode === 'follow') this.activeCamera = this.followCamera;
                    else if (this.cameraMode === 'orbit') this.activeCamera = this.orbitCamera;
                    else if (this.cameraMode === 'hybrid') this.activeCamera = this.hybridCamera;
                    
                    this.orbitCamera.setEnabled(this.cameraMode === 'orbit');
                }).append(
                    option("Hybrid").attr("value", "hybrid").attr("selected", "selected"),
                    option("Orbit").attr("value", "orbit"),
                    option("Follow").attr("value", "follow")
                ).style({
                    width: "100%",
                    padding: "5px",
                    background: "#222",
                    color: "#fff",
                    border: "1px solid #444",
                    borderRadius: "4px"
                });
            }).style({ marginBottom: "15px" });

            div.c("setting-item", () => {
                label("Time Scale: ").style({ display: "block", color: "#fff", marginBottom: "5px" });
                const timeScaleVal = span(this.timeScale.toFixed(2)).style({ color: "#00f2ff", marginLeft: "10px" });
                input(() => { })
                    .attr("type", "range")
                    .attr("min", "0.1")
                    .attr("max", "2.0")
                    .attr("step", "0.1")
                    .attr("value", this.timeScale)
                    .on("input", (e) => {
                        this.timeScale = parseFloat(e.target.value);
                        timeScaleVal.el.textContent = this.timeScale.toFixed(2);
                    })
                    .style({ width: "100%", cursor: "pointer" });
            }).style({ marginTop: "15px" });

            div.c("setting-item", () => {
                label("Character: ").style({ display: "block", color: "#fff", marginBottom: "5px" });
                select().on("change", (e) => {
                    this.switchPlayer(e.target.value);
                }).append(
                    option("Soldier").attr("value", "Soldier"),
                    option("YBot").attr("value", "YBot").attr("selected", "selected")
                ).style({
                    width: "100%",
                    padding: "5px",
                    background: "#222",
                    color: "#fff",
                    border: "1px solid #444",
                    borderRadius: "4px"
                });
            }).style({ marginTop: "15px" });
        });

        panel.style({
            position: "absolute",
            top: "70px",
            right: "20px",
            width: "200px",
            padding: "20px",
            background: "rgba(0,0,0,0.8)",
            border: "1px solid #333",
            borderRadius: "8px",
            zIndex: 1000,
            display: "none",
            color: "white"
        });

        settingsBtn.click(() => panel.toggle());

        this.container.appendChild(settingsBtn.el);
        this.container.appendChild(panel.el);
    }

    update() {
        if (!this.world || !this.player) return;

        const delta = this.clock.getDelta() * this.timeScale;
        
        // Update components
        this.controller.update(delta, this.player, this);
        this.player.update(delta);
        
        // Physics step with accumulator for consistent simulation at any time scale
        this.physicsAccumulator += delta;
        const maxSteps = 10; // Prevent spiral of death
        let steps = 0;
        while (this.physicsAccumulator >= this.fixedTimeStep && steps < maxSteps) {
            this.world.step();
            this.physicsAccumulator -= this.fixedTimeStep;
            steps++;
        }
        
        // Camera updates
        if (this.viewports.length === 0) {
            this.activeCamera.update(delta, this.player.mesh, this.controller);
        } else {
            for (const vp of this.viewports) {
                vp.camera.update(delta, this.player.mesh, this.controller);
            }
        }
        
        // Reset controller mouse delta at end of frame
        if (this.controller.reset) {
            this.controller.reset();
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();

        if (this.viewports.length === 0) {
            this.renderer.autoClear = true;
            this.renderer.render(this.scene, this.activeCamera.camera);
        } else {
            this.renderer.autoClear = false;
            this.renderer.setScissorTest(false);
            this.renderer.clear(); 
            this.renderer.setScissorTest(true);
            
            const canvas = this.renderer.domElement;

            for (const vp of this.viewports) {
                const rect = vp.container.getBoundingClientRect();
                
                if (rect.width === 0 || rect.height === 0) continue;

                // Convert to canvas coordinates (y is inverted)
                const left = rect.left;
                const bottom = canvas.clientHeight - rect.bottom;
                const width = rect.width;
                const height = rect.height;

                this.renderer.setViewport(left, bottom, width, height);
                this.renderer.setScissor(left, bottom, width, height);
                
                vp.camera.onResize(width, height);
                this.renderer.render(this.scene, vp.camera.camera);
            }
        }
    }
}
