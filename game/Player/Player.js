import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';

/**
 * Player class - Base class for characters.
 * Manages the physics body, common movement logic, and animation mixer.
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

        this.spawnPoint = { x: 0, y: 5, z: 0 };
    }

    /**
     * Override this in subclasses to load specific models and animations.
     */
    async load() {
        // Base implementation does nothing or sets up a placeholder
        return this;
    }

    /**
     * Helper to create a standard capsule physics body.
     */
    createPhysicsBody(x, y, z, radius = 0.4, height = 0.4) {
        const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(x, y, z)
            .setCanSleep(false)
            .setLinearDamping(2.0);

        this.body = this.game.world.createRigidBody(rigidBodyDesc);
        this.body.setEnabledRotations(false, true, false, true);

        const colliderDesc = RAPIER.ColliderDesc.capsule(height, radius);
        this.game.world.createCollider(colliderDesc, this.body);
        
        return this.body;
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
            const angle = Math.atan2(normalizedDir.x, normalizedDir.z);
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
            const v0 = this.jumpForce; 
            const g = 9.81;
            const estimatedAirTime = (2 * v0) / g;
            
            const clipDuration = jumpAction.getClip().duration;
            jumpAction.setEffectiveTimeScale(clipDuration / estimatedAirTime);
            jumpAction.setLoop(THREE.LoopOnce);
            jumpAction.clampWhenFinished = true;
            
            this.fadeToAction('Jump', 0.1);
        }
    }

    update(delta) {
        if (this.mixer) this.mixer.update(delta);
        
        if (this.body && this.mesh) {
            const translation = this.body.translation();
            this.mesh.position.set(translation.x, translation.y, translation.z);

            const velocity = this.body.linvel();
            if (Math.abs(velocity.y) < 0.1 && translation.y < 1.2) {
                if (!this.isGrounded) {
                    this.isGrounded = true;
                }
            } else if (Math.abs(velocity.y) > 0.1) {
                this.isGrounded = false;
            }
        }
    }

    destroy() {
        if (this.mesh) {
            this.game.scene.remove(this.mesh);
            // Dispose of geometries and materials if needed, though often mesh reuse is better
        }
        if (this.body) {
            this.game.world.removeRigidBody(this.body);
        }
    }

    setHP(val) { this.hp = val; }
    getHP() { return this.hp; }
}

