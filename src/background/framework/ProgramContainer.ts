import type Mat2 from "@fishley/wwwgraphics/math/mat2"
import type Mat3 from "@fishley/wwwgraphics/math/mat3"
import type Mat4 from "@fishley/wwwgraphics/math/mat4"
import type { IVec2 } from "@fishley/wwwgraphics/math/vec2"
import type { IVec3 } from "@fishley/wwwgraphics/math/vec3"
import { createShader, createProgram } from "@fishley/wwwgraphics/webgl"

export enum UniformType {
  Uniform1uiv,
  Uniform2uiv,
  Uniform3uiv,
  Uniform4uiv,
  UniformMatrix2x3fv,
  UniformMatrix2x4fv,
  UniformMatrix3x2fv,
  UniformMatrix3x4fv,
  UniformMatrix4x2fv,
  UniformMatrix4x3fv,
  Uniform1fv,
  Uniform1iv,
  Uniform2fv,
  Uniform2iv,
  Uniform3fv,
  Uniform3iv,
  Uniform4fv,
  Uniform4iv,
  UniformMatrix2fv,
  UniformMatrix3fv,
  UniformMatrix4fv,
  Uniform1f,
  Uniform2f,
  Uniform3f,
  Uniform4f,
  Uniform1i,
  Uniform2i,
  Uniform3i,
  Uniform4i,
  Uniform1ui,
  Uniform2ui,
  Uniform3ui,
  Uniform4ui,
}


export interface UniformValueMap {
  [UniformType.Uniform1fv]: number
  [UniformType.Uniform2fv]: IVec2
  [UniformType.Uniform3fv]: IVec3
  [UniformType.Uniform4fv]: Iterable<number>
  [UniformType.Uniform1iv]: number
  [UniformType.Uniform2iv]: IVec2
  [UniformType.Uniform3iv]: IVec3
  [UniformType.Uniform4iv]: Iterable<number>
  [UniformType.Uniform1uiv]: number
  [UniformType.Uniform2uiv]: IVec2
  [UniformType.Uniform3uiv]: IVec3
  [UniformType.Uniform4uiv]: Iterable<number>
  [UniformType.UniformMatrix2fv]: Iterable<number>
  [UniformType.UniformMatrix3fv]: Mat3
  [UniformType.UniformMatrix4fv]: Mat4
  [UniformType.UniformMatrix2x3fv]: Iterable<number>
  [UniformType.UniformMatrix2x4fv]: Iterable<number>
  // wwwgraphics Mat2 is a 2D affine matrix: 3 columns of 2, i.e. a GLSL mat3x2
  [UniformType.UniformMatrix3x2fv]: Mat2
  [UniformType.UniformMatrix3x4fv]: Iterable<number>
  [UniformType.UniformMatrix4x2fv]: Iterable<number>
  [UniformType.UniformMatrix4x3fv]: Iterable<number>
  [UniformType.Uniform1f]: number
  [UniformType.Uniform2f]: IVec2
  [UniformType.Uniform3f]: IVec3
  [UniformType.Uniform4f]: [number, number, number, number]
  [UniformType.Uniform1i]: number
  [UniformType.Uniform2i]: IVec2
  [UniformType.Uniform3i]: IVec3
  [UniformType.Uniform4i]: [number, number, number, number]
  [UniformType.Uniform1ui]: number
  [UniformType.Uniform2ui]: IVec2
  [UniformType.Uniform3ui]: IVec3
  [UniformType.Uniform4ui]: [number, number, number, number]
}

export type SetterFn<T> = (gl: WebGL2RenderingContext, location: WebGLUniformLocation, value: T) => void

const uniformSetters: { [K in UniformType]: SetterFn<UniformValueMap[K]> } = {
  [UniformType.Uniform1fv]: (gl, location, value) => gl.uniform1f(location, value),
  [UniformType.Uniform2fv]: (gl, location, value) => gl.uniform2f(location, value.x, value.y),
  [UniformType.Uniform3fv]: (gl, location, value) => gl.uniform3f(location, value.x, value.y, value.z),
  [UniformType.Uniform4fv]: (gl, location, value) => gl.uniform4fv(location, value),
  [UniformType.Uniform1iv]: (gl, location, value) => gl.uniform1i(location, value),
  [UniformType.Uniform2iv]: (gl, location, value) => gl.uniform2i(location, value.x, value.y),
  [UniformType.Uniform3iv]: (gl, location, value) => gl.uniform3i(location, value.x, value.y, value.z),
  [UniformType.Uniform4iv]: (gl, location, value) => gl.uniform4iv(location, value),
  [UniformType.Uniform1uiv]: (gl, location, value) => gl.uniform1ui(location, value),
  [UniformType.Uniform2uiv]: (gl, location, value) => gl.uniform2ui(location, value.x, value.y),
  [UniformType.Uniform3uiv]: (gl, location, value) => gl.uniform3ui(location, value.x, value.y, value.z),
  [UniformType.Uniform4uiv]: (gl, location, value) => gl.uniform4uiv(location, value),
  [UniformType.UniformMatrix2fv]: (gl, location, value) => gl.uniformMatrix2fv(location, false, value),
  [UniformType.UniformMatrix3fv]: (gl, location, value) => gl.uniformMatrix3fv(location, false, value),
  [UniformType.UniformMatrix4fv]: (gl, location, value) => gl.uniformMatrix4fv(location, false, value),
  [UniformType.UniformMatrix2x3fv]: (gl, location, value) => gl.uniformMatrix2x3fv(location, false, value),
  [UniformType.UniformMatrix2x4fv]: (gl, location, value) => gl.uniformMatrix2x4fv(location, false, value),
  [UniformType.UniformMatrix3x2fv]: (gl, location, value) => gl.uniformMatrix3x2fv(location, false, value),
  [UniformType.UniformMatrix3x4fv]: (gl, location, value) => gl.uniformMatrix3x4fv(location, false, value),
  [UniformType.UniformMatrix4x2fv]: (gl, location, value) => gl.uniformMatrix4x2fv(location, false, value),
  [UniformType.UniformMatrix4x3fv]: (gl, location, value) => gl.uniformMatrix4x3fv(location, false, value),
  [UniformType.Uniform1f]: (gl, location, value) => gl.uniform1f(location, value),
  [UniformType.Uniform2f]: (gl, location, value) => gl.uniform2f(location, value.x, value.y),
  [UniformType.Uniform3f]: (gl, location, value) => gl.uniform3f(location, value.x, value.y, value.z),
  [UniformType.Uniform4f]: (gl, location, value) => gl.uniform4f(location, value[0], value[1], value[2], value[3]),
  [UniformType.Uniform1i]: (gl, location, value) => gl.uniform1i(location, value),
  [UniformType.Uniform2i]: (gl, location, value) => gl.uniform2i(location, value.x, value.y),
  [UniformType.Uniform3i]: (gl, location, value) => gl.uniform3i(location, value.x, value.y, value.z),
  [UniformType.Uniform4i]: (gl, location, value) => gl.uniform4i(location, value[0], value[1], value[2], value[3]),
  [UniformType.Uniform1ui]: (gl, location, value) => gl.uniform1ui(location, value),
  [UniformType.Uniform2ui]: (gl, location, value) => gl.uniform2ui(location, value.x, value.y),
  [UniformType.Uniform3ui]: (gl, location, value) => gl.uniform3ui(location, value.x, value.y, value.z),
  [UniformType.Uniform4ui]: (gl, location, value) => gl.uniform4ui(location, value[0], value[1], value[2], value[3]),
}

export function getUniformSetter<T extends UniformType>(type: T): SetterFn<UniformValueMap[T]> {
  return uniformSetters[type]
}

export type Uniform<T extends UniformType> = {
  location: WebGLUniformLocation
  set: (value: UniformValueMap[T]) => void
};

type UniformShape = {
  [k: string]: Uniform<any>
};

export abstract class ProgramContainer {
  public program: WebGLProgram;
  protected gl: WebGL2RenderingContext;

  abstract uniforms: UniformShape;
  abstract attributes: {
    [k: string]: number
  }

  constructor(gl: WebGL2RenderingContext, vert: string, frag: string) {
    this.program = createProgram(
      gl,
      createShader(gl, gl.VERTEX_SHADER, vert),
      createShader(gl, gl.FRAGMENT_SHADER, frag)
    );
    this.gl = gl;
  }

   public use() {
    this.gl.useProgram(this.program);
  }

  protected uniform<T extends UniformType>(
    name: string,
    uniformType: T
  ): Uniform<T> {
    const u_location = this.gl.getUniformLocation(this.program, name);

    if(u_location === null) {
      throw new Error("Failed to find uniform.")
    }

    const uniformSetter = getUniformSetter(uniformType);

    return {
      location: u_location,
      set: (value) => uniformSetter(this.gl, u_location, value)
    };
  }

  protected attribute(name: string): number {
    return this.gl.getAttribLocation(this.program, name);
  }
}

export default ProgramContainer;