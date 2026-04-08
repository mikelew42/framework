import * as THREE from 'three';
import { Camera } from './Camera.js';

/**
 * FollowCamera class that smoothly tracks a target mesh.
 */
export class FollowCamera extends Camera {
    constructor(game) {
        super(game);
        this.relativeOffset = new THREE.Vector3(0.8, 2.2, 4.0); // side, height, distance
        this.lookOffset = new THREE.Vector3(0, 1.5, 0);
        this.lerpFactor = 0.1;
    }

    update(delta, target) {
        if (!target) return;

        const targetPos = target.position.clone();
        
        // Calculate target camera position relative to target orientation
        const cameraPos = this.relativeOffset.clone()
            .applyQuaternion(target.quaternion)
            .add(targetPos);
            
        // Smoothly move the camera
        this.camera.position.lerp(cameraPos, this.lerpFactor);
        
        // Point the camera slightly above the target's center
        const lookTarget = targetPos.add(this.lookOffset);
        this.camera.lookAt(lookTarget);
    }
}
