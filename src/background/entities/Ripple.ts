import shaderDefaultVertex from '../shaders/default.vert.glsl?raw';
import shaderRippleFragment from '../shaders/ripple.frag.glsl?raw';
import Mat2, * as mat2 from "@fishley/wwwgraphics/math/mat2";
import Vec2 from "@fishley/wwwgraphics/math/vec2";
import { AnimatedValue, EaseType } from "@fishley/wwwgraphics/animation/engine";
import { QUAD_GEOMETRY } from "../geometry";
import { createGeometryBuffer } from "../framework/webgl";
import type GlobalContext from "../framework/GlobalContext";
import { lerp } from "@fishley/wwwgraphics/math";
import ProgramContainer, { UniformType } from '../framework/ProgramContainer';

class RippleProgram extends ProgramContainer {
  uniforms = {
    matrix: this.uniform("u_matrix", UniformType.UniformMatrix3x2fv),
    progress: this.uniform("u_progress", UniformType.Uniform1f),
    thickness: this.uniform("u_thickness", UniformType.Uniform1f),
  }
  attributes = {
    position: this.attribute("position")
  }
  constructor(gl: WebGL2RenderingContext) {
    super(gl, shaderDefaultVertex, shaderRippleFragment);
  }
}

const CENTER_OFFSET = new Vec2(-0.5, -0.5);

interface RippleInstance {
  position: Vec2,
  progress: number,
  scale: Vec2
}

class Ripples {
  private context: GlobalContext;
  private program: RippleProgram;
  private instances: RippleInstance[] = [];

  private vao: WebGLVertexArrayObject;

  private matrix: Mat2 = new Mat2();

  constructor(context: GlobalContext) {
    const gl = context.gl;
    this.context = context;
    this.program = new RippleProgram(gl);

    this.vao = gl.createVertexArray()
    gl.bindVertexArray(this.vao)

    createGeometryBuffer(gl, QUAD_GEOMETRY);
    gl.vertexAttribPointer(this.program.attributes.position, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(this.program.attributes.position);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  public draw() {
    const gl = this.context.gl;
    const program = this.program;

    program.use();
    gl.bindVertexArray(this.vao);
    
    for (const ripple of this.instances) {
      mat2.copy(this.matrix, this.context.asciiProjection);
      mat2.translate(this.matrix, ripple.position);
      mat2.scale(this.matrix, ripple.scale);
      mat2.translate(this.matrix, CENTER_OFFSET);

      program.uniforms.matrix.set(this.matrix);
      program.uniforms.progress.set(ripple.progress);
      program.uniforms.thickness.set(lerp(0.05, 0, ripple.scale.x));

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    gl.bindVertexArray(null);
  }

  public createRipple(position: Vec2, delay: number, scale: Vec2) {
    const ripple = { position, progress: 0, scale};

    const animatedObject = new AnimatedValue(
      {
        ease: EaseType.EASE_OUT,
        duration: 2 + delay,
        delay: delay,
        autodispose: true,
        callback: (progress) => {
          ripple.progress = progress
        },
        finish: () => {
          this.instances.shift()
        },
      },
    );

    this.instances.push(ripple);
    this.context.animationEngine.add(animatedObject);
  }
}

export default Ripples;