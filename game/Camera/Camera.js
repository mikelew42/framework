import * as THREE from 'three';

/**
 * Base Camera class to manage Three.js PerspectiveCamera and common behaviors.
 */
export class Camera {
    constructor(game) {
        this.game = game;
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(5, 5, 10);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    update(delta, target) {
        // Base update does nothing by default
    }
}
