import * as THREE from 'three';
import { Player } from './Player.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export class Soldier extends Player {
    constructor(game) {
        super(game);
        this.soldierArrow = null;
        this.jumpArrow = null;
    }

    async load(url = 'https://threejs.org/examples/models/gltf/Soldier.glb') {
        const gltfLoader = new GLTFLoader();
        const fbxLoader = new FBXLoader();
        
        return new Promise((resolve) => {
            gltfLoader.load(url, (gltf) => {
                this.mesh = gltf.scene;
                this.mesh.traverse(child => {
                    if (child.isMesh) child.castShadow = true;
                });
                
                this.game.scene.add(this.mesh);

                this.createPhysicsBody(this.spawnPoint.x, this.spawnPoint.y, this.spawnPoint.z);

                // Animations
                this.mixer = new THREE.AnimationMixer(this.mesh);
                gltf.animations.forEach(clip => {
                    this.actions[clip.name] = this.mixer.clipAction(clip);
                });

                // Load Jump Animation
                fbxLoader.load('/Jumping.fbx', (fbx) => {
                    if (fbx.animations && fbx.animations.length > 0) {
                        const clip = fbx.animations[0];
                        clip.name = 'Jump';
                        this.actions['Jump'] = this.mixer.clipAction(clip);
                    }

                    // Soldier Local Z+ (currently pointing backwards according to user)
                    const soldierDir = new THREE.Vector3(0, 0, 1);
                    const soldierOrigin = new THREE.Vector3(0, 1, 0);
                    this.soldierArrow = new THREE.ArrowHelper(soldierDir, soldierOrigin, 2, 0xffff00); // Yellow
                    this.mesh.add(this.soldierArrow);

                    // Jump Animation Placeholder Arrow
                    const jumpDir = new THREE.Vector3(0, 0, 1);
                    const jumpOrigin = new THREE.Vector3(0, 1.5, 0); 
                    this.jumpArrow = new THREE.ArrowHelper(jumpDir, jumpOrigin, 2, 0x00ffff); // Cyan
                    this.mesh.add(this.jumpArrow);

                    this.fadeToAction('Idle', 0);
                    resolve(this);
                }, undefined, (error) => {
                    console.error('Error loading jump animation:', error);
                    this.fadeToAction('Idle', 0);
                    resolve(this);
                });
            });
        });
    }
}
