import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Controller } from './Controller.js';

describe('Controller', () => {
    let controller;
    let mockPlayer;

    beforeEach(() => {
        controller = new Controller();
        mockPlayer = {
            move: vi.fn(),
        };
    });

    it('should track key states', () => {
        const event = new KeyboardEvent('keydown', { key: 'w' });
        window.dispatchEvent(event);
        expect(controller.keys['w']).toBe(true);

        const upEvent = new KeyboardEvent('keyup', { key: 'w' });
        window.dispatchEvent(upEvent);
        expect(controller.keys['w']).toBe(false);
    });

    it('should call player move on update', () => {
        controller.keys['w'] = true;
        controller.update(0.016, mockPlayer);
        
        expect(mockPlayer.move).toHaveBeenCalledWith({ x: 0, z: -1 }, 0.016);
    });

    it('should handle diagonal movement', () => {
        controller.keys['w'] = true;
        controller.keys['d'] = true;
        controller.update(0.016, mockPlayer);
        
        expect(mockPlayer.move).toHaveBeenCalledWith({ x: 1, z: -1 }, 0.016);
    });
});
