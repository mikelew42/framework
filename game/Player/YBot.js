import * as THREE from 'three';
import { Player } from './Player.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export class YBot extends Player {
    constructor(game) {
        super(game);
    }

    async load(url = '/character.fbx') {
        const fbxLoader = new FBXLoader();
        
        const loadFBX = (file) => new Promise((resolve) => {
            fbxLoader.load(file, resolve, undefined, (err) => {
                console.warn(`Failed to load ${file}:`, err);
                resolve(null);
            });
        });

        const [fbx, walkingFbx, jumpingFbx, idleFbx] = await Promise.all([
            loadFBX(url),
            loadFBX('/Walking.fbx'),
            loadFBX('/Jumping.fbx'),
            loadFBX('/Idle.fbx')
        ]);

        if (!fbx) return this;

        this.mesh = fbx;
        this.mesh.scale.setScalar(0.01); // FBX typically needs scaling
        this.mesh.traverse(child => {
            if (child.isMesh) child.castShadow = true;
        });
        
        this.game.scene.add(this.mesh);

        this.createPhysicsBody(this.spawnPoint.x, this.spawnPoint.y, this.spawnPoint.z);

        // Animations
        this.mixer = new THREE.AnimationMixer(this.mesh);
        
        // Load embedded animations first
        if (fbx.animations && fbx.animations.length > 0) {
            fbx.animations.forEach(clip => {
                let name = clip.name;
                if (name.toLowerCase().includes('idle')) name = 'Idle';
                if (name.toLowerCase().includes('walk')) name = 'Walk';
                if (name.toLowerCase().includes('run')) name = 'Run';
                if (name.toLowerCase().includes('jump')) name = 'Jump';
                this.actions[name] = this.mixer.clipAction(clip);
            });
        }

        // Override/Add external animations
        if (walkingFbx && walkingFbx.animations && walkingFbx.animations.length > 0) {
            const clip = walkingFbx.animations[0];
            clip.name = 'Walk';
            this.actions['Walk'] = this.mixer.clipAction(clip);
        }

        if (jumpingFbx && jumpingFbx.animations && jumpingFbx.animations.length > 0) {
            const clip = jumpingFbx.animations[0];
            clip.name = 'Jump';
            this.actions['Jump'] = this.mixer.clipAction(clip);
        }

        if (idleFbx && idleFbx.animations && idleFbx.animations.length > 0) {
            const clip = idleFbx.animations[0];
            clip.name = 'Idle';
            this.actions['Idle'] = this.mixer.clipAction(clip);
        }

        // Fallback for Idle if nothing was found
        if (!this.actions['Idle'] && fbx.animations && fbx.animations.length > 0) {
            this.actions['Idle'] = this.mixer.clipAction(fbx.animations[0]);
        }

        this.fadeToAction('Idle', 0);
        return this;
    }
}
