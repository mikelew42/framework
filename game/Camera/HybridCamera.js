import * as THREE from 'three';
import { Camera } from './Camera.js';

/**
 * HybridCamera class that orbits around a target and follows its position.
 * Features:
 * - Spherical coordinate orbiting (Theta/Phi)
 * - Smooth follow (Lerping target position)
 * - Mouse-driven rotation
 */
export class HybridCamera extends Camera {
    constructor(game) {
        super(game);
        
        // Configuration
        this.radius = 5.0;
        this.minRadius = 2.0;
        this.maxRadius = 15.0;
        
        this.theta = 0; // Horizontal angle
        this.phi = Math.PI / 4; // Vertical angle (45 degrees)
        this.minPhi = 0.1;
        this.maxPhi = Math.PI / 2 - 0.1; // Don't flip over the top
        
        this.lerpFactor = 0.1; // How fast it snaps to the target
        this.orbitSensitivity = 0.005;
        this.zoomSensitivity = 0.01;
        
        // Internal state
        this.targetPos = new THREE.Vector3();
        this.lookOffset = new THREE.Vector3(0, 1.5, 0);
    }

    /**
     * Update camera position and orientation.
     * @param {number} delta 
     * @param {THREE.Object3D} target 
     * @param {object} input - Controller state (mouseDelta, etc.)
     */
    update(delta, target, input) {
        if (!target) return;

        // 1. Handle Input (Orbiting)
        if (input && input.mouseDelta) {
            // Apply orbit rotation
            this.theta -= input.mouseDelta.x * this.orbitSensitivity;
            this.phi -= input.mouseDelta.y * this.orbitSensitivity;
            
            // Constrain Phi (vertical orbit)
            this.phi = Math.max(this.minPhi, Math.min(this.maxPhi, this.phi));
        }

        if (input && input.wheelDelta) {
            this.radius += input.wheelDelta * this.zoomSensitivity;
            this.radius = Math.max(this.minRadius, Math.min(this.maxRadius, this.radius));
        }

        // 2. Exact Follow
        // Lerping the target position can cause the character to wobble in screen space,
        // which creates a blurring or ghosting effect. Snapping ensures the character is crisp.
        this.targetPos.copy(target.position);

        // 3. Calculate Spherical Position
        // x = r * sin(phi) * cos(theta)
        // y = r * cos(phi)
        // z = r * sin(phi) * sin(theta)
        
        // Note: Three.js Y is UP, so we swap components slightly for typical Y-up orbiting
        const x = this.radius * Math.sin(this.phi) * Math.sin(this.theta);
        const y = this.radius * Math.cos(this.phi);
        const z = this.radius * Math.sin(this.phi) * Math.cos(this.theta);

        // Position camera relative to targetPos + lookOffset
        const finalPosition = new THREE.Vector3(x, y, z).add(this.targetPos).add(this.lookOffset);
        this.camera.position.copy(finalPosition);
        
        // Point at the target (actually at the offset point)
        this.camera.lookAt(this.targetPos.clone().add(this.lookOffset));
    }

    /**
     * Get the horizontal angle of the camera for character orientation.
     */
    getYaw() {
        return this.theta;
    }
}
