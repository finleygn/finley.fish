import ProgramContainer, { UniformType } from "../framework/ProgramContainer";
import shaderFullscreenVertex from "../shaders/fullscreen.vert.glsl?raw";
import shaderAsciiFragment from "../shaders/ascii.frag.glsl?raw";
import type GlobalContext from "../framework/GlobalContext";
import { createGeometryBuffer } from "../framework/webgl";
import { TRI_FULLSCREEN_GEOMETRY, TRI_FULLSCREEN_UV } from "../geometry";
import Vec2 from "@fishley/wwwgraphics/math/vec2"

class AsciiProgram extends ProgramContainer {
    uniforms = {
        characterTexture: this.uniform("u_character_texture", UniformType.Uniform1i),
        maskTexture: this.uniform("u_mask_texture", UniformType.Uniform1i),
        resolution: this.uniform("u_resolution", UniformType.Uniform2f),
        cellSize: this.uniform("u_cell_size", UniformType.Uniform1f)
    };
    attributes = {
        position: this.attribute("position"),
        uv: this.attribute("uv"),
    };
    constructor(gl: WebGL2RenderingContext) {
        super(gl, shaderFullscreenVertex, shaderAsciiFragment);
    }
}

class Ascii {
    private context: GlobalContext;
    private program: AsciiProgram;

    private vao: WebGLVertexArrayObject;

    private resolution: Vec2 = new Vec2(0, 0);

    constructor(context: GlobalContext) {
        const gl = context.gl;
        this.context = context;
        this.program = new AsciiProgram(gl);

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        createGeometryBuffer(gl, TRI_FULLSCREEN_GEOMETRY);
        gl.vertexAttribPointer(this.program.attributes.position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.program.attributes.position);

        createGeometryBuffer(gl, TRI_FULLSCREEN_UV);
        gl.vertexAttribPointer(this.program.attributes.uv, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.program.attributes.uv);

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    public draw() {
        const gl = this.context.gl;
        const program = this.program;

        program.use();
        gl.bindVertexArray(this.vao);

        // Matches the square framebuffer this is drawn into
        this.resolution.x = this.context.canvas.clientWidth;
        this.resolution.y = this.context.canvas.clientHeight;

        const resolution = Math.min(this.resolution.x, this.resolution.y);

        program.uniforms.resolution.set(this.resolution);
        program.uniforms.maskTexture.set(0);
        program.uniforms.characterTexture.set(1);
        program.uniforms.cellSize.set(
            (resolution / 60)
        )

        gl.drawArrays(gl.TRIANGLES, 0, 3);

        gl.bindVertexArray(null);
    }
}

export default Ascii;
