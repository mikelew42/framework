/**
 * Controller class - Translates input events to player actions.
 */
export class Controller {
    constructor() {
        this.keys = {};
        this.leftMouseDown = false;
        this.rightMouseDown = false;
        this.mouseDelta = { x: 0, y: 0 };
        this.wheelDelta = 0;
        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener('keydown', (e) => this.keys[e.key.toLowerCase()] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key.toLowerCase()] = false);
        
        window.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.leftMouseDown = true;
            }
            if (e.button === 2) {
                this.rightMouseDown = true;
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.leftMouseDown = false;
            }
            if (e.button === 2) {
                this.rightMouseDown = false;
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (this.leftMouseDown || this.rightMouseDown) {
                this.mouseDelta.x = e.movementX;
                this.mouseDelta.y = e.movementY;
            }
        });

        window.addEventListener('wheel', (e) => {
            this.wheelDelta = e.deltaY;
        });
        
        // Prevent context menu on right click
        window.addEventListener('contextmenu', e => e.preventDefault());
    }

    update(delta, player, cameraManager) {
        if (!player) return;

        const moveDir = { x: 0, z: 0 };

        if (this.keys['w']) { moveDir.z -= 1; }
        if (this.keys['s']) { moveDir.z += 1; }
        if (this.keys['a']) { moveDir.x -= 1; }
        if (this.keys['d']) { moveDir.x += 1; }
        if (this.keys[' ']) { player.jump(); }

        // Determine if player moves/rotates based on camera
        // We pass the camera's yaw, and the RMB state
        const cameraYaw = cameraManager && cameraManager.activeCamera && cameraManager.activeCamera.getYaw ? 
            cameraManager.activeCamera.getYaw() : null;

        player.moveLocal(moveDir, delta, this.rightMouseDown, cameraYaw);
    }
    
    reset() {
        this.mouseDelta.x = 0;
        this.mouseDelta.y = 0;
        this.wheelDelta = 0;
    }
}
