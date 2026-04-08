import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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
    }

    async load(url = 'https://threejs.org/examples/models/gltf/Soldier.glb') {
        const loader = new GLTFLoader();
        
        return new Promise((resolve) => {
            loader.load(url, (gltf) => {
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
                
                this.fadeToAction('Idle', 0);
                resolve(this);
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

            this.fadeToAction('Walk', 0.2);
        } else {
            this.fadeToAction('Idle', 0.2);
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
        }
    }
}
