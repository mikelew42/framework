import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

/**
 * Player class - Manages the character mesh, physics body, animations, and actions.
 */
export class Player {
    constructor(game) {
        this.game = game;
        this.mesh = null;
        this.body = null;
        this.mixer = null;
        this.actions = {};
        this.activeAction = null;
        this.hp = 100;
        
        // Movement settings
        this.force = 15.0;
        this.maxSpeed = 5.0;
        this.jumpForce = 8.0;
        this.isGrounded = true;
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

                // Physics Body
                const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
                    .setTranslation(0, 5, 0)
                    .setCanSleep(false)
                    .setLinearDamping(2.0);

                this.body = this.game.world.createRigidBody(rigidBodyDesc);
                this.body.setEnabledRotations(false, true, false, true);

                const colliderDesc = RAPIER.ColliderDesc.capsule(0.4, 0.4);
                this.game.world.createCollider(colliderDesc, this.body);

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
                    // This will help identify where the FBX animation thinks 'forward' is
                    const jumpDir = new THREE.Vector3(0, 0, 1);
                    const jumpOrigin = new THREE.Vector3(0, 1.5, 0); // Higher up
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

    fadeToAction(name, duration) {
        const nextAction = this.actions[name];
        if (!nextAction || nextAction === this.activeAction) return;

        if (this.activeAction) {
            this.activeAction.fadeOut(duration);
        }

        nextAction
            .reset()
            .setEffectiveTimeScale(1)
            .setEffectiveWeight(1)
            .fadeIn(duration)
            .play();

        this.activeAction = nextAction;
    }

    move(moveDir, delta) {
        if (!this.body || !this.mesh) return;

        const isMoving = Math.abs(moveDir.x) > 0 || Math.abs(moveDir.z) > 0;

        if (isMoving) {
            // Normalize direction vector
            const length = Math.sqrt(moveDir.x ** 2 + moveDir.z ** 2);
            const normalizedDir = { x: moveDir.x / length, z: moveDir.z / length };

            // Apply impulse based on direction
            const impulse = { 
                x: normalizedDir.x * this.force * delta * 60, 
                y: 0, 
                z: normalizedDir.z * this.force * delta * 60 
            };
            this.body.applyImpulse(impulse, true);

            // Character orientation
            const angle = Math.atan2(normalizedDir.x, normalizedDir.z) + Math.PI;
            this.mesh.rotation.y = angle;

            // Only transition to Walk if we're on the ground
            if (this.isGrounded) {
                this.fadeToAction('Walk', 0.2);
            }
        } else {
            // Only transition to Idle if we're on the ground
            if (this.isGrounded) {
                this.fadeToAction('Idle', 0.2);
            }
        }

        // Cap horizontal velocity
        let velocity = this.body.linvel();
        let horizontalSpeed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2);

        if (horizontalSpeed > this.maxSpeed) {
            const ratio = this.maxSpeed / horizontalSpeed;
            this.body.setLinvel({ 
                x: velocity.x * ratio, 
                y: velocity.y, 
                z: velocity.z * ratio 
            }, true);
        }
    }

    jump() {
        if (!this.body || !this.isGrounded) return;

        // Apply upward impulse
        this.body.applyImpulse({ x: 0, y: this.jumpForce, z: 0 }, true);
        this.isGrounded = false;

        // Trigger jump animation if available
        const jumpAction = this.actions['Jump'];
        if (jumpAction) {
            // Estimate air time: t = 2 * v0 / g
            // Assuming mass ~1 and starting from grounded
            const v0 = this.jumpForce; 
            const g = 9.81;
            const estimatedAirTime = (2 * v0) / g;
            
            // Scale animation to fit the jump duration
            const clipDuration = jumpAction.getClip().duration;
            jumpAction.setEffectiveTimeScale(clipDuration / estimatedAirTime);
            jumpAction.setLoop(THREE.LoopOnce);
            jumpAction.clampWhenFinished = true;
            
            this.fadeToAction('Jump', 0.1);
        }
    }

    setHP(val) {
        this.hp = val;
    }

    getHP() {
        return this.hp;
    }

    update(delta) {
        if (this.mixer) this.mixer.update(delta);
        
        if (this.body && this.mesh) {
            const translation = this.body.translation();
            this.mesh.position.set(translation.x, translation.y, translation.z);

            // Simple grounded check: if vertical velocity is near zero and we are close to the ground
            const velocity = this.body.linvel();
            if (Math.abs(velocity.y) < 0.1 && translation.y < 1.2) {
                if (!this.isGrounded) {
                    this.isGrounded = true;
                    // If we were jumping, return to idle/walk based on movement
                    // The move() method will handle animation state in next frame
                }
            } else if (Math.abs(velocity.y) > 0.1) {
                this.isGrounded = false;
            }
        }
    }
}
