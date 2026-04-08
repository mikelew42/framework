/**
 * Controller class - Translates input events to player actions.
 */
export class Controller {
    constructor() {
        this.keys = {};
        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener('keydown', (e) => this.keys[e.key.toLowerCase()] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key.toLowerCase()] = false);
    }

    update(delta, player) {
        if (!player) return;

        const moveDir = { x: 0, z: 0 };
        let isMoving = false;

        if (this.keys['w']) { moveDir.z -= 1; isMoving = true; }
        if (this.keys['s']) { moveDir.z += 1; isMoving = true; }
        if (this.keys['a']) { moveDir.x -= 1; isMoving = true; }
        if (this.keys['d']) { moveDir.x += 1; isMoving = true; }

        player.move(moveDir, delta);
    }
}
