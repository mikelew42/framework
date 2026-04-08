import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { div, button, label, input, h2, span } from "/framework/core/View/View.js";

import { Player } from '../Player/Player.js';
import { Controller } from '../Controller/Controller.js';
import { OrbitCamera } from '../Camera/OrbitCamera.js';
import { FollowCamera } from '../Camera/FollowCamera.js';

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
        
        this.container.appendChild(this.renderer.domElement);
        
        // Timing
        this.clock = new THREE.Clock();
        
        // Components
        this.player = new Player(this);
        this.controller = new Controller();
        
        // Camera System
        this.orbitCamera = new OrbitCamera(this);
        this.followCamera = new FollowCamera(this);
        this.activeCamera = this.orbitCamera;
        this.cameraMode = 'orbit'; // 'orbit' or 'follow'
        
        // Physics World
        this.world = null;
        
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
        this.orbitCamera.onResize();
        this.followCamera.onResize();
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
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x00f2ff, 1.5, 100);
        pointLight.position.set(10, 20, 10);
        pointLight.castShadow = true;
        pointLight.shadow.mapSize.width = 1024;
        pointLight.shadow.mapSize.height = 1024;
        this.scene.add(pointLight);
        
        const secondaryLight = new THREE.PointLight(0xff0080, 1.0, 100);
        secondaryLight.position.set(-10, 10, -10);
        this.scene.add(secondaryLight);
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
            
            const createToggle = (labelStr, active, callback) => {
                label.c("toggle", () => {
                    input(() => { }).attr("type", "checkbox").attr("checked", active ? "checked" : null).on("change", (e) => {
                        callback(e.target.checked);
                    });
                    span(" " + labelStr);
                }).style({ display: "block", marginBottom: "10px", color: "#fff", cursor: "pointer" });
            };

            createToggle("Follow Camera", this.cameraMode === 'follow', (checked) => {
                this.cameraMode = checked ? 'follow' : 'orbit';
                this.activeCamera = checked ? this.followCamera : this.orbitCamera;
                this.orbitCamera.setEnabled(this.cameraMode === 'orbit');
            });
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
            display: "none"
        });

        settingsBtn.click(() => panel.toggle());

        this.container.appendChild(settingsBtn.el);
        this.container.appendChild(panel.el);
    }

    update() {
        if (!this.world || !this.player) return;

        const delta = this.clock.getDelta();
        
        // Update components
        this.controller.update(delta, this.player);
        this.player.update(delta);
        
        // Physics step
        this.world.step();
        
        // Camera update
        this.activeCamera.update(delta, this.player.mesh);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
        this.renderer.render(this.scene, this.activeCamera.camera);
    }
}
