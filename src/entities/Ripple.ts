import WrappedProgram from "../framework/WrappedProgram";
import shaderDefaultVertex from '../shaders/default.vert.glsl?raw';
import shaderRippleFragment from '../shaders/ripple.frag.glsl?raw';
import Mat2 from "../math/Mat2";
import { Vec2 } from "@fishley/wwwgraphics/math";
import { AnimatedValue, EaseType } from "@fishley/wwwgraphics/animation/engine";
import { createBasicQuadGeometry, QUAD_GEOMETRY } from "../geometry";
import { createGeometryBuffer } from "../framework/webgl";
import type GlobalContext from "../framework/GlobalContext";
import { lerp } from "@fishley/wwwgraphics/animation";

class RippleProgram extends WrappedProgram {
  public u_matrix_location: WebGLUniformLocation;
  public u_progress_location: WebGLUniformLocation;
  public u_thickness_location: WebGLUniformLocation;

  public a_position_location: number;

  constructor(gl: WebGL2RenderingContext) {
    super(gl, shaderDefaultVertex, shaderRippleFragment);

    this.u_matrix_location = this.setupUniformLocation(this.program, "u_matrix");
    this.u_progress_location = this.setupUniformLocation(this.program, "u_progress");
    this.u_thickness_location = this.setupUniformLocation(this.program, "u_thickness");

    this.a_position_location = this.setupAttributeLocation(this.program, "position");
  }

  public setUniformMatrix(matrix: Mat2) {
    this.gl.uniformMatrix3x2fv(
      this.u_matrix_location,
      false,
      matrix
    );
  }

  public setUniformProgress(progress: number) {
    this.gl.uniform1f(
      this.u_progress_location,
      progress
    );
  }

  public setUniformThickness(thickness: number) {
    this.gl.uniform1f(
      this.u_thickness_location,
      thickness
    );
  }
}

class Ripples {
  private context: GlobalContext;
  private program: RippleProgram;
  private instances: { position: Vec2, progress: number, scale: number }[] = [];

  private geometryBuffer: WebGLBuffer;

  constructor(context: GlobalContext) {
    this.context = context;
    this.program = new RippleProgram(context.gl);
    this.geometryBuffer = createGeometryBuffer(context.gl, QUAD_GEOMETRY);
  }

  public createRipple(position: Vec2, delay: number, scale: number) {
    const ripple = { position, progress: 0, scale};

    const animatedObject = new AnimatedValue(
      (progress) => {
        ripple.progress = progress
      },
      {
        ease: EaseType.EASE_OUT,
        duration: 2 + delay,
        delay: delay,
        finish: () => {
          this.instances.shift()
        },
      },
    );

    this.instances.push(ripple);
    this.context.animationEngine.add(animatedObject.ani);
  }

  public draw() {
    const gl = this.context.gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.geometryBuffer);

    gl.vertexAttribPointer(this.program.a_position_location, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(this.program.a_position_location);

    this.program.use();

    for (const ripple of this.instances) {
      const boxMatrix = Mat2.copy(new Mat2(), this.context.asciiProjection)
        .translate(ripple.position)
        .scale(new Vec2(ripple.scale, ripple.scale))
        .translate(new Vec2(-0.5, -0.5))
        

      this.program.setUniformMatrix(boxMatrix);
      this.program.setUniformProgress(ripple.progress);
      this.program.setUniformThickness(lerp(0.05, 0, ripple.scale));

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  }

  
}

export default Ripples;