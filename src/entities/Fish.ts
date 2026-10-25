import { lerp } from "@fishley/wwwgraphics/math";
import Vec2, * as vec2 from "@fishley/wwwgraphics/math/vec2";
import type GlobalContext from "../framework/GlobalContext";
import ProgramContainer, { UniformType } from "../framework/ProgramContainer";
import shaderDefaultFragment from "../shaders/default.frag.glsl?raw";
import shaderDefaultVertex from "../shaders/default.vert.glsl?raw";

abstract class FishSegment {
    static MAX_DISTANCE = 0.08;
    public direction: Vec2 = new Vec2(1, 0);
    public position: Vec2 = new Vec2(0, 0);
    public size: number = 0.2;

    abstract update(dt: number): void;
}

const enum FishMovementState {
    Swimming,
    Turning,
}

class FishSegmentHead extends FishSegment {
    private speed: number = 0.3;
    private state: FishMovementState = FishMovementState.Swimming;

    private rotation = 0;

    // Strongest turning circle
    private maxRotationSpeed = 1;
    // Weakest turning circle
    private minRotationSpeed = 0.5;

    private flipFlopRotationSpeed = 1;

    // When swimming alternate between left and right motions over and over.
    private remainingSwimmingTime = 0;
    private remainingFlipFlopTime = 0;

    // Maximum time to complete a rotation
    private remainingRotationTime = 0;

    constructor(size: number) {
        super();
        this.size = size;
    }

    private beginSwimming() {
        this.state = FishMovementState.Swimming;
        this.remainingSwimmingTime = 1 + Math.random() * 3;
        this.flipFlop();
    }

    private flipFlop() {
        this.remainingFlipFlopTime = 1;
        if (this.rotation > 0) {
            this.rotation = -this.flipFlopRotationSpeed;
        } else {
            this.rotation = this.flipFlopRotationSpeed;
        }
    }

    private beginRotate() {
        this.state = FishMovementState.Turning;
        this.remainingRotationTime = 1 + Math.random() * 3;
        this.rotation =
            lerp(this.minRotationSpeed, this.maxRotationSpeed, Math.random()) *
            (Math.random() > 0.5 ? 1 : -1);
    }

    private beginRotateToCenter() {
        this.state = FishMovementState.Turning;

        const toCenter = vec2.normalize(
            new Vec2(-this.position.x, -this.position.y),
        );
        const crossProduct = vec2.cross(this.direction, toCenter);
        this.rotation = (crossProduct > 0 ? 1 : -1) * this.maxRotationSpeed;

        const dotProduct =
            this.direction.x * toCenter.x + this.direction.y * toCenter.y;
        const clampedDot = Math.max(-1, Math.min(1, dotProduct));
        const angleInRadians = Math.acos(clampedDot);

        this.remainingRotationTime = angleInRadians / this.maxRotationSpeed;
    }

    update(dt: number) {
        if (this.state === FishMovementState.Turning) {
            this.remainingRotationTime -= dt;

            if (this.remainingRotationTime <= 0) {
                this.beginSwimming();
            }
        }

        if (this.state === FishMovementState.Swimming) {
            this.remainingFlipFlopTime -= dt;
            this.remainingSwimmingTime -= dt;

            if (this.remainingFlipFlopTime <= 0) {
                this.flipFlop();
            }

            if (vec2.magnitude(this.position) > 2) {
                this.beginRotateToCenter();
            } else if (this.remainingSwimmingTime <= 0) {
                this.beginRotate(); // Standard random wandering
            }
        }

        vec2.rotate(this.direction, this.rotation * dt);
        vec2.add(
            this.position,
            vec2.multiplyScalar(vec2.from(this.direction), this.speed * dt),
        );
    }
}

class FishSegmentBody extends FishSegment {
    private following: FishSegment;

    constructor(following: FishSegment, size: number) {
        super();
        this.following = following;
        this.size = size;
    }

    update() {
        if (
            vec2.distance(this.following.position, this.position) >=
            FishSegment.MAX_DISTANCE
        ) {
            const offset = vec2.multiplyScalar(
                vec2.normalize(
                    vec2.subtract(
                        vec2.from(this.position),
                        this.following.position,
                    ),
                ),
                FishSegment.MAX_DISTANCE,
            );

            const new_position = vec2.add(
                vec2.from(this.following.position),
                offset,
            );

            this.position.x = new_position.x;
            this.position.y = new_position.y;
        }

        if (vec2.distance(this.position, this.following.position) > 0.00001) {
            this.direction = vec2.multiplyScalar(
                vec2.direction(this.position, this.following.position),
                -1,
            );
        }
    }
}

class FishProgram extends ProgramContainer {
    uniforms = {
        matrix: this.uniform("u_matrix", UniformType.UniformMatrix3x2fv),
        colour: this.uniform("u_colour", UniformType.Uniform4f),
    };
    attributes = {
        position: this.attribute("position"),
    };
    constructor(gl: WebGL2RenderingContext) {
        super(gl, shaderDefaultVertex, shaderDefaultFragment);
    }
}

class Fish {
    private segments: [FishSegmentHead, ...FishSegmentBody[]];
    private program: FishProgram;
    private context: GlobalContext;
    private geometryBuffer: WebGLBuffer;
    private vao: WebGLVertexArrayObject;
    public depth: number;

    constructor(context: GlobalContext) {
        const gl = context.gl;
        this.context = context;
        this.program = new FishProgram(gl);

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        // This will need to be constructed on the fly in the future, just render quads for movement logic for now.
        this.geometryBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.geometryBuffer);
        gl.vertexAttribPointer(this.program.attributes.position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.program.attributes.position);

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        const head = new FishSegmentHead(0.01);
        const segments: [FishSegmentHead, ...FishSegmentBody[]] = [head];

        segments.push(new FishSegmentBody(segments[segments.length - 1], 0.04));
        segments.push(new FishSegmentBody(segments[segments.length - 1], 0.06));
        segments.push(new FishSegmentBody(segments[segments.length - 1], 0.05));
        segments.push(new FishSegmentBody(segments[segments.length - 1], 0.03));
        segments.push(
            new FishSegmentBody(segments[segments.length - 1], 0.005),
        );
        segments.push(new FishSegmentBody(segments[segments.length - 1], 0.04));
        this.depth = lerp(0.3, 0.8, Math.random());

        this.segments = segments;
    }

    static randomFish(context: GlobalContext) {
        const fish = new Fish(context);
        const head = fish.segments[0];
        head.position.x = (Math.random() * 2 - 1) * 2;
        head.position.y = (Math.random() * 2 - 1) * 2;
        const normalizedPosition = vec2.normalize(vec2.from(head.position));
        head.direction.x = normalizedPosition.x;
        head.direction.y = normalizedPosition.y;

        for (let i = 0; i <= 10; i++) {
            fish.update(1);
        }

        return fish;
    }

    update(dt: number) {
        const gl = this.context.gl;

        let geometry = [];

        for (const segment of this.segments.slice(0)) {
            segment.update(dt);

            const vert_left = vec2.multiplyScalar(
                new Vec2(-segment.direction.y, segment.direction.x),
                segment.size,
            );
            const vert_right = vec2.multiplyScalar(
                new Vec2(segment.direction.y, -segment.direction.x),
                segment.size,
            );

            geometry.push(
                segment.position.x + vert_left.x,
                segment.position.y + vert_left.y,
                segment.position.x + vert_right.x,
                segment.position.y + vert_right.y,
            );
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.geometryBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(geometry),
            gl.STREAM_DRAW,
        );
    }

    draw() {
        const gl = this.context.gl;

        const program = this.program;

        program.use();
        gl.bindVertexArray(this.vao);

        program.uniforms.matrix.set(this.context.asciiProjection);
        program.uniforms.colour.set([
            this.depth,
            this.depth,
            this.depth,
            1.0,
        ]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.segments.length * 2);

        gl.bindVertexArray(null);
    }
}

export default Fish;
