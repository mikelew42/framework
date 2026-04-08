import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Player } from './Player.js';
import * as THREE from 'three';

// Mock Three.js
vi.mock('three', async () => {
    const actual = await vi.importActual('three');
    return {
        ...actual,
        AnimationMixer: vi.fn(function() {
            this.clipAction = vi.fn().mockReturnValue({
                fadeOut: vi.fn().mockReturnThis(),
                reset: vi.fn().mockReturnThis(),
                setEffectiveTimeScale: vi.fn().mockReturnThis(),
                setEffectiveWeight: vi.fn().mockReturnThis(),
                fadeIn: vi.fn().mockReturnThis(),
                play: vi.fn().mockReturnThis(),
            });
            this.update = vi.fn();
        }),
    };
});

// Mock GLTFLoader
vi.mock('three/examples/jsm/loaders/GLTFLoader.js', () => ({
    GLTFLoader: vi.fn(function() {
        this.load = vi.fn((url, callback) => {
            callback({
                scene: new THREE.Group(),
                animations: [{ name: 'Idle' }, { name: 'Walk' }]
            });
        });
    }),
}));

// Mock Rapier
vi.mock('@dimforge/rapier3d-compat', () => ({
    default: {
        RigidBodyDesc: {
            dynamic: vi.fn().mockReturnValue({
                setTranslation: vi.fn().mockReturnThis(),
                setCanSleep: vi.fn().mockReturnThis(),
                setLinearDamping: vi.fn().mockReturnThis(),
            }),
        },
        ColliderDesc: {
            capsule: vi.fn(),
        },
    },
}));

describe('Player', () => {
    let mockGame;

    beforeEach(() => {
        mockGame = {
            scene: { add: vi.fn() },
            world: {
                createRigidBody: vi.fn().mockReturnValue({
                    setEnabledRotations: vi.fn(),
                    linvel: vi.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
                    setLinvel: vi.fn(),
                    applyImpulse: vi.fn(),
                    translation: vi.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
                }),
                createCollider: vi.fn(),
            }
        };
    });

    it('should initialize with default HP', () => {
        const player = new Player(mockGame);
        expect(player.getHP()).toBe(100);
    });

    it('should be able to set and get HP', () => {
        const player = new Player(mockGame);
        player.setHP(50);
        expect(player.getHP()).toBe(50);
    });

    it('should load mesh and setup physics', async () => {
        const player = new Player(mockGame);
        await player.load();
        
        expect(player.mesh).toBeDefined();
        expect(player.body).toBeDefined();
        expect(mockGame.scene.add).toHaveBeenCalled();
        expect(mockGame.world.createRigidBody).toHaveBeenCalled();
    });

    it('should handle movement', async () => {
        const player = new Player(mockGame);
        await player.load();
        
        player.move({ x: 1, z: 0 }, 0.016);
        expect(player.body.applyImpulse).toHaveBeenCalled();
    });
});
