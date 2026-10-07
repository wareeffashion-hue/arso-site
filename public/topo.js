// A slowly shifting topographic survey map behind the page: silver contour lines of a noise terrain,
// every fifth (index) contour in gold. Drawn by a fragment shader; one still frame for reduced motion
// and a plain background when WebGL is unavailable.

const FRAG = `
#extension GL_OES_standard_derivatives : enable
precision mediump float;
uniform vec2 r; uniform float t; uniform vec2 m;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+1.),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.02+vec2(3.1,1.7);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/r;
  vec2 p=(gl_FragCoord.xy-.5*r)/min(r.x,r.y)*2.2+m*.15;
  float e=fbm(p+vec2(t*.012,-t*.008))+.35*fbm(p*.5-t*.006);
  float k=e*16.;
  float w=fwidth(k);
  float line=1.-smoothstep(w*.6,w*1.6,min(fract(k),1.-fract(k)));
  float idx=1.-step(.5,mod(floor(k+.5),5.));
  vec3 paper=vec3(.988,.988,.984);
  vec3 silver=vec3(.749,.765,.784);
  vec3 gold=vec3(.776,.655,.416);
  float fade=smoothstep(.0,.9,length((uv-vec2(.5,.62))*vec2(1.2,1.)));
  float a=line*mix(.18,.62,fade);
  vec3 c=mix(paper,mix(silver,gold,idx),a*mix(.55,.9,idx));
  gl_FragColor=vec4(c,1.);
}`;

export function startTopo() {
  if (document.getElementById('topo')) return;
  const canvas = document.createElement('canvas');
  canvas.id = 'topo';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl || !gl.getExtension('OES_standard_derivatives')) { canvas.remove(); return; }
  const prog = build(gl);
  if (!prog) { canvas.remove(); return; }

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let mx = 0;
  let my = 0;
  let tx = 0;
  let ty = 0;
  let raf = 0;
  let last = 0;
  const t0 = performance.now() - 40_000;

  const resize = () => {
    const dpr = Math.min(1.25, window.devicePixelRatio || 1);
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (still) draw(60);
  };
  const draw = (t) => {
    mx += (tx - mx) * 0.04;
    my += (ty - my) * 0.04;
    gl.uniform2f(prog.r, canvas.width, canvas.height);
    gl.uniform1f(prog.t, t);
    gl.uniform2f(prog.m, mx, my);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    if (now - last < 40) return;
    last = now;
    draw((now - t0) / 1000);
  };
  addEventListener('resize', resize);
  addEventListener('pointermove', (e) => { tx = e.clientX / innerWidth - 0.5; ty = 0.5 - e.clientY / innerHeight; }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (still) return;
    cancelAnimationFrame(raf);
    if (!document.hidden) raf = requestAnimationFrame(frame);
  });
  resize();
  if (!still) raf = requestAnimationFrame(frame);
}

function build(gl) {
  try {
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link');
    gl.useProgram(p);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(p, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    return { r: gl.getUniformLocation(p, 'r'), t: gl.getUniformLocation(p, 't'), m: gl.getUniformLocation(p, 'm') };
  } catch (e) {
    console.warn('topo', e);
    return null;
  }
}
