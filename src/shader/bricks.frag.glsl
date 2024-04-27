#version 300 es

precision highp float;

in vec4 v_position;
out vec4 outColor;
uniform float u_time;
uniform vec2 u_resolution;

float random(in vec2 st){return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453);}

float aastep(float threshold,float value){
  float afwidth=.7*length(vec2(dFdx(value),dFdy(value)));
  return smoothstep(threshold-afwidth,threshold+afwidth,value);
}

float rectSDF(in vec2 st,in vec2 s){
  st=st*2.-1.;
  return max(abs(st.x/s.x),abs(st.y/s.y));
}

float fill(float x,float size){
  return 1.-step(size,x);
}

float rect(vec2 st,vec2 size){
  return fill(rectSDF(st,size),1.);
}

float cross_shape(in vec2 st,in vec4 size,in vec2 width){
  return clamp(
    rect(st-vec2(size.x*.5,0.),vec2(size.x,width.x))+
    rect(st+vec2(size.z*.5,0.),vec2(size.z,width.x))+
    rect(st-vec2(0.,size.y*.5),vec2(width.y,size.y))+
    rect(st+vec2(0.,size.w*.5),vec2(width.y,size.w)),
    0.,
    1.
  );
}

vec4 remove_one(in vec2 st){
  float rand=random(st);
  if(rand>.75){
    return vec4(0.,1.,1.,1.);
  }
  if(rand>.50){
    return vec4(1.,0.,1.,1.);
  }
  if(rand>.25){
    return vec4(1.,1.,0.,1.);
  }
  return vec4(1.,1.,1.,0.);
}

float section_length(in vec2 quadrant){
  return 1.;
}

void main(){
  // Move coordinates from -1->1 to 0->1
  vec2 shifted_position=(v_position.xy+1.)*.5;
  vec2 position=shifted_position;
  
  // Scaling function for x repetition - reduces for mobile viewports
  float x_base_repeat=pow(u_resolution.x*.09,.5);
  // Scaling function for y repetition - just to be consistent with x i guess
  float y_base_repeat=pow(u_resolution.y*.01,.5);
  
  // warping
  float x_repeat=x_base_repeat*pow(position.y,.2);
  float y_repeat=y_base_repeat;
  
  // width & height for lines
  vec2 pixel_size=(1./u_resolution.xy);
  float base_unit_size=3.;
  float x_unit=pixel_size.x*x_base_repeat*base_unit_size;
  float y_unit=pixel_size.y*y_base_repeat*base_unit_size;
  
  position.y+=u_time*.000055;
  
  // What grid position am i in
  vec2 quadrant=floor(position.xy*vec2(x_repeat,y_repeat));
  
  // Tile position
  position=vec2(fract(position.x*x_repeat),fract(position.y*y_repeat));
  
  // Fuck
  float a=(cross_shape(
      position,
      vec4(
        section_length(quadrant+1.),// r
        section_length(quadrant+2.),// b
        section_length(quadrant+3.),// l
        section_length(quadrant+4.)// t
      )*remove_one(quadrant)*remove_one(quadrant+1.),
      vec2(y_unit,x_unit)
    )*mix(0.,1.,random(position))
  )*pow(shifted_position.x,2.)*pow(shifted_position.y,1.5);
  
  outColor=vec4(vec3(0.,0.,0.),a*5.);
}
