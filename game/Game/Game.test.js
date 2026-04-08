import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Game } from './Game.js';
import * as THREE from 'three';

// Mock Three.js WebGLRenderer since JSDOM doesn't support WebGL
vi.mock('three', async () => {
    const actual = await vi.importActual('three');
    return {
        ...actual,
        WebGLRenderer: vi.fn(function() {
            this.setSize = vi.fn();
            this.setPixelRatio = vi.fn();
            this.shadowMap = { enabled: false, type: null };
            this.domElement = document.createElement('canvas');
            this.render = vi.fn();
        }),
    };
});

// Mock OrbitControls
vi.mock('three/examples/jsm/controls/OrbitControls.js', () => ({
    OrbitControls: vi.fn(function() {
        this.enableDamping = false;
        this.dampingFactor = 0;
        this.update = vi.fn();
    }),
}));

// Mock GLTFLoader
vi.mock('three/examples/jsm/loaders/GLTFLoader.js', () => ({
    GLTFLoader: vi.fn(function() {
        this.load = vi.fn();
    }),
}));

// Mock Rapier
vi.mock('@dimforge/rapier3d-compat', () => ({
    default: {
        init: vi.fn().mockResolvedValue({}),
        World: vi.fn(function() {
            this.createCollider = vi.fn();
            this.createRigidBody = vi.fn();
            this.step = vi.fn();
        }),
        RigidBodyDesc: {
            dynamic: vi.fn().mockReturnValue({
                setTranslation: vi.fn().mockReturnThis(),
                setCanSleep: vi.fn().mockReturnThis(),
                setLinearDamping: vi.fn().mockReturnThis(),
            }),
        },
        ColliderDesc: {
            cuboid: vi.fn(),
            capsule: vi.fn(),
        },
    },
}));

// Mock View.js components
vi.mock('/framework/core/View/View.js', () => ({
    div: { c: vi.fn().mockReturnValue({ style: vi.fn(), toggle: vi.fn(), el: document.createElement('div') }) },
    button: { c: vi.fn().mockReturnValue({ style: vi.fn(), click: vi.fn(), el: document.createElement('button') }) },
    label: { c: vi.fn().mockReturnValue({ style: vi.fn() }) },
    input: vi.fn().mockReturnValue({ attr: vi.fn().mockReturnThis(), on: vi.fn().mockReturnThis() }),
    h2: vi.fn(),
    span: vi.fn(),
}));

// Mock New Components
vi.mock('../Player/Player.js', () => ({
    Player: vi.fn(function() {
        this.load = vi.fn().mockResolvedValue(this);
        this.update = vi.fn();
    }),
}));

vi.mock('../Controller/Controller.js', () => ({
    Controller: vi.fn(function() {
        this.update = vi.fn();
        window.addEventListener('keydown', vi.fn());
        window.addEventListener('keyup', vi.fn());
    }),
}));

vi.mock('../Camera/OrbitCamera.js', () => ({
    OrbitCamera: vi.fn(function() {
        this.camera = new THREE.PerspectiveCamera();
        this.onResize = vi.fn();
        this.update = vi.fn();
        this.setEnabled = vi.fn();
    }),
}));

vi.mock('../Camera/FollowCamera.js', () => ({
    FollowCamera: vi.fn(function() {
        this.camera = new THREE.PerspectiveCamera();
        this.onResize = vi.fn();
        this.update = vi.fn();
    }),
}));
describe('Game', () => {
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.innerHTML = '';
        vi.clearAllMocks();
    });

    it('should initialize with provided container', () => {
        const game = new Game(container);
        expect(game.container).toBe(container);
    });

    it('should create scene and cameras', () => {
        const game = new Game(container);
        expect(game.scene).toBeInstanceOf(THREE.Scene);
        expect(game.activeCamera.camera).toBeInstanceOf(THREE.PerspectiveCamera);
    });

    it('should setup renderer', () => {
        const game = new Game(container);
        expect(game.renderer).toBeDefined();
        expect(container.contains(game.renderer.domElement)).toBe(true);
    });

    it('should bind keyboard events', () => {
        const addEventSpy = vi.spyOn(window, 'addEventListener');
        new Game(container);
        expect(addEventSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        expect(addEventSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
    });
});
