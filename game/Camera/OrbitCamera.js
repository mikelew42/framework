import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Camera } from './Camera.js';

/**
 * OrbitCamera class providing orbital controls around a target or scene.
 */
export class OrbitCamera extends Camera {
    constructor(game) {
        super(game);
        
        this.controls = new OrbitControls(this.camera, game.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.enabled = true;
    }

    setEnabled(val) {
        this.enabled = val;
        this.controls.enabled = val;
    }

    update() {
        if (this.enabled) {
            this.controls.update();
        }
    }
}
