import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Camera } from './Camera.js';

/**
 * OrbitCamera class providing orbital controls around a target or scene.
 */
export class OrbitCamera extends Camera {
    constructor(game, element) {
        super(game);
        
        const targetElement = element || game.renderer.domElement;
        this.controls = new OrbitControls(this.camera, targetElement);
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
