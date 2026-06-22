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

    moveLocal(moveDir, delta, rightMouseDown, cameraYaw) {
        if (!this.body || !this.mesh) return;

        // Mouse based rotation
        if (rightMouseDown && cameraYaw !== null) {
            // Camera theta is from target looking to camera. 
            // We want character to face away from camera, so offset by PI.
            this.mesh.rotation.y = cameraYaw + Math.PI;
        } else if (!rightMouseDown) {
            // A and D rotate the character when RMB is up
            if (moveDir.x !== 0) {
                this.mesh.rotation.y -= moveDir.x * 2.5 * delta;
            }
        }

        const isMovingForward = Math.abs(moveDir.z) > 0;
        const isStrafing = rightMouseDown && Math.abs(moveDir.x) > 0;
        const isMoving = isMovingForward || isStrafing;

        if (isMoving) {
            const angle = this.mesh.rotation.y;
            
            // Forward is direction character is facing
            const forwardX = Math.sin(angle);
            const forwardZ = Math.cos(angle);
            
            // Right is 90 degrees offset (-PI/2)
            const rightX = Math.sin(angle - Math.PI/2);
            const rightZ = Math.cos(angle - Math.PI/2);
            
            let moveX = 0;
            let moveZ = 0;

            if (isMovingForward) {
                // W gives z=-1, so -moveDir.z is +1. We move forward.
                moveX += forwardX * -moveDir.z;
                moveZ += forwardZ * -moveDir.z;
            }
            if (isStrafing) {
                // D gives x=1, A gives x=-1. We move right/left.
                moveX += rightX * moveDir.x;
                moveZ += rightZ * moveDir.x;
            }

            // Normalize
            const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
            if (length > 0) {
                moveX /= length;
                moveZ /= length;
            }

            // Apply impulse
            const impulse = { 
                x: moveX * this.force * delta * 60, 
                y: 0, 
                z: moveZ * this.force * delta * 60 
            };
            this.body.applyImpulse(impulse, true);

            if (this.isGrounded) {
                this.fadeToAction('Walk', 0.2);
            }
        } else {
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

