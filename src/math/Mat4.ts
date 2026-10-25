import type { Vec2 } from "@fishley/wwwgraphics/math";

class Mat4 extends Float32Array {
  constructor(
    m00 = 1, m01 = 0, m02 = 0, m03 = 0,
    m10 = 0, m11 = 1, m12 = 0, m13 = 0,
    m20 = 0, m21 = 0, m22 = 1, m23 = 0,
    m30 = 0, m31 = 0, m32 = 0, m33 = 1
  ) {
    // @ts-ignore
    
    super([m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33]);
  }
}

export function zero(m: Mat4) {
  m[0] = 0;
  m[1] = 0;
  m[2] = 0;
  m[3] = 0;
  m[4] = 0;
  m[5] = 0;
  m[6] = 0;
  m[7] = 0;
  m[8] = 0;
  m[9] = 0;
  m[10] = 0;
  m[11] = 0;
  m[12] = 0;
  m[13] = 0;
  m[14] = 0;
  m[15] = 0;
}

export function identity(m: Mat4) {
  zero(m);
  m[0] = 1;
  m[5] = 1;
  m[10] = 1;
  m[15] = 1;
}

export function perspective(m: Mat4, fovy: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  zero(m);
  m[0] = f / aspect;
  m[5] = f;
  m[10] = (far + near) * nf;
  m[11] = -1;
  m[14] = 2 * far * near * nf;
  return m;
}


export function translate(m: Mat4, v: [number, number, number]) {
  let x = v[0],
    y = v[1],
    z = v[2];

    m[12] = m[0] * x + m[4] * y + m[8] * z + m[12];
    m[13] = m[1] * x + m[5] * y + m[9] * z + m[13];
    m[14] = m[2] * x + m[6] * y + m[10] * z + m[14];
    m[15] = m[3] * x + m[7] * y + m[11] * z + m[15];
  return m;
}
export function scale(m: Mat4, axis: [number, number, number]) {
  let x = axis[0],
    y = axis[1],
    z = axis[2];
  m[0] = m[0] * x;
  m[1] = m[1] * x;
  m[2] = m[2] * x;
  m[3] = m[3] * x;
  m[4] = m[4] * y;
  m[5] = m[5] * y;
  m[6] = m[6] * y;
  m[7] = m[7] * y;
  m[8] = m[8] * z;
  m[9] = m[9] * z;
  m[10] = m[10] * z;
  m[11] = m[11] * z;
  m[12] = m[12];
  m[13] = m[13];
  m[14] = m[14];
  m[15] = m[15];
  return m;
}


export function rotate(m: Mat4, rad: number, axis: [number, number, number]) {
  let x = axis[0],
    y = axis[1],
    z = axis[2];
  let len = Math.sqrt(x * x + y * y + z * z);
  if (len < 1e-6) return m;
  let s, c, t;
  let a00, a01, a02, a03;
  let a10, a11, a12, a13;
  let a20, a21, a22, a23;
  let b00, b01, b02;
  let b10, b11, b12;
  let b20, b21, b22;
  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;
  a00 = m[0];
  a01 = m[1];
  a02 = m[2];
  a03 = m[3];
  a10 = m[4];
  a11 = m[5];
  a12 = m[6];
  a13 = m[7];
  a20 = m[8];
  a21 = m[9];
  a22 = m[10];
  a23 = m[11];
  // Construct the elements of the rotation matrix
  b00 = x * x * t + c;
  b01 = y * x * t + z * s;
  b02 = z * x * t - y * s;
  b10 = x * y * t - z * s;
  b11 = y * y * t + c;
  b12 = z * y * t + x * s;
  b20 = x * z * t + y * s;
  b21 = y * z * t - x * s;
  b22 = z * z * t + c;
  // Perform rotation-specific matrix multiplication
  m[0] = a00 * b00 + a10 * b01 + a20 * b02;
  m[1] = a01 * b00 + a11 * b01 + a21 * b02;
  m[2] = a02 * b00 + a12 * b01 + a22 * b02;
  m[3] = a03 * b00 + a13 * b01 + a23 * b02;
  m[4] = a00 * b10 + a10 * b11 + a20 * b12;
  m[5] = a01 * b10 + a11 * b11 + a21 * b12;
  m[6] = a02 * b10 + a12 * b11 + a22 * b12;
  m[7] = a03 * b10 + a13 * b11 + a23 * b12;
  m[8] = a00 * b20 + a10 * b21 + a20 * b22;
  m[9] = a01 * b20 + a11 * b21 + a21 * b22;
  m[10] = a02 * b20 + a12 * b21 + a22 * b22;
  m[11] = a03 * b20 + a13 * b21 + a23 * b22;
  return m;
}

export function from_vec2(m: Mat4, v: Vec2): Mat4 {
  m[0] = 1;  m[1] = 0;  m[2] = 0;  m[3] = 0;
  m[4] = 0;  m[5] = 1;  m[6] = 0;  m[7] = 0;
  m[8] = 0;  m[9] = 0;  m[10] = 1; m[11] = 0;
  
  m[12] = v.x; // X component
  m[13] = v.y; // Y component
  m[14] = 0;    // Z component
  m[15] = 1;    // W component

  return m;
}

export function to_vec2(out: Vec2, m: Mat4): Vec2 {
  out.x = m[12];
  out.y = m[13];
  
  return out;
}

export function invert(out: Mat4, a: Mat4) {
  const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

  const b00 = a00 * a11 - a01 * a10;
  const b01 = a00 * a12 - a02 * a10;
  const b02 = a00 * a13 - a03 * a10;
  const b03 = a01 * a12 - a02 * a11;
  const b04 = a01 * a13 - a03 * a11;
  const b05 = a02 * a13 - a03 * a12;
  const b06 = a20 * a31 - a21 * a30;
  const b07 = a20 * a32 - a22 * a30;
  const b08 = a20 * a33 - a23 * a30;
  const b09 = a21 * a32 - a22 * a31;
  const b10 = a21 * a33 - a23 * a31;
  const b11 = a22 * a33 - a23 * a32;

  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (!det) return null;
  det = 1 / det;

  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
  return out;
}

export function transformPoint(m: Mat4, x: number, y: number, z: number): [number, number, number] {
  const w = m[3] * x + m[7] * y + m[11] * z + m[15];
  return [
    (m[0] * x + m[4] * y + m[8] * z + m[12]) / w,
    (m[1] * x + m[5] * y + m[9] * z + m[13]) / w,
    (m[2] * x + m[6] * y + m[10] * z + m[14]) / w,
  ];
}

export function multiply(m: Mat4, t: Mat4) {
  let a00 = m[0],
    a01 = m[1],
    a02 = m[2],
    a03 = m[3];
  let a10 = m[4],
    a11 = m[5],
    a12 = m[6],
    a13 = m[7];
  let a20 = m[8],
    a21 = m[9],
    a22 = m[10],
    a23 = m[11];
  let a30 = m[12],
    a31 = m[13],
    a32 = m[14],
    a33 = m[15];
  // Cache only the current line of the second matrix
  let b0 = t[0],
    b1 = t[1],
    b2 = t[2],
    b3 = t[3];
  m[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  m[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  m[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  m[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = t[4];
  b1 = t[5];
  b2 = t[6];
  b3 = t[7];
  m[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  m[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  m[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  m[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = t[8];
  b1 = t[9];
  b2 = t[10];
  b3 = t[11];
  m[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  m[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  m[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  m[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = t[12];
  b1 = t[13];
  b2 = t[14];
  b3 = t[15];
  m[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  m[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  m[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  m[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  return m;
}

export default Mat4;