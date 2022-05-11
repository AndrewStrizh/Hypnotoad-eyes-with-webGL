let GL = null;
const coord = 0;
onload = () => {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    canvas.width = 600;
    canvas.height = 600;

    GL = canvas.getContext('webgl2');
    GL.enableVertexAttribArray(coord);
    const program = buildProgram(VS, FS, {coords: coord, time: 0})
    const Time = GL.getUniformLocation(program, 'time');
    let Sm = GL.getUniformLocation(program, 'sm');
    const drawFrame = time => {
        makeLeftEye();
        GL.uniform1f(Time, time/100);
        GL.uniform1f(Sm, -1.5);
        GL.clearColor(0.572, 0.549, 0.00392, 1);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT)
        GL.enableVertexAttribArray(coord);
        GL.drawArrays(GL.TRIANGLES, 0, 6);

        makeRightEye();
        GL.uniform1f(Sm, 1.5);
        GL.enableVertexAttribArray(coord);
        GL.drawArrays(GL.TRIANGLES, 0, 6);
        requestAnimationFrame(drawFrame);
    };
    GL.useProgram(program)
    requestAnimationFrame(drawFrame);
    drawFrame()
}

function makeLeftEye() {
    let coords = [
        -2.5,-1,
        -2.5,1,
        0.5,1,
        -2.5,-1,
        0.5,1,
        0.5,-1,
    ]
    coords = new Float32Array(coords);
    GL.bindBuffer(GL.ARRAY_BUFFER, GL.createBuffer());
    GL.bufferData(GL.ARRAY_BUFFER, coords, GL.STATIC_DRAW);
    GL.vertexAttribPointer(coord, 2, GL.FLOAT, false, 8, 0);
}



function makeRightEye() {
    let coords = [
        0.5,-1,
        0.5,1,
        2.5,1,
        0.5,-1,
        2.5,1,
        2.5,-1,
    ]
    coords = new Float32Array(coords);
    GL.bindBuffer(GL.ARRAY_BUFFER, GL.createBuffer());
    GL.bufferData(GL.ARRAY_BUFFER, coords, GL.STATIC_DRAW);
    GL.vertexAttribPointer(coord, 2, GL.FLOAT, false, 8, 0);
}

function compileShader(source, type) {
    let glType = type;
    if (type === 'vertex') { glType = GL.VERTEX_SHADER; }
    else if (type === 'fragment') { glType = GL.FRAGMENT_SHADER; }

    const shader = GL.createShader(glType);

    GL.shaderSource(shader, source);
    GL.compileShader(shader);


    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) { 
        console.error(`SHADER TYPE ${type}`);
        console.error(GL.getShaderInfoLog(shader));

        return null;
    }

    return shader;
}

function buildProgram(vsSource, fsSource, attributes) {
    const vs = compileShader(vsSource, 'vertex');
    if (vs === null) { return null; }

    const fs = compileShader(fsSource, 'fragment');
    if (fs === null) { return null; }

    const program = GL.createProgram();

    for (const name in attributes) {
        const index = attributes[name];

        GL.bindAttribLocation(program, index, name);
    }
    
    GL.attachShader(program, vs);
    GL.attachShader(program, fs);
    GL.linkProgram(program);

    if (!GL.getProgramParameter(program, GL.LINK_STATUS)) { 
        console.error(GL.getProgramInfoLog(program));

        return null;
    }

    return program;
}

const VS = ` #version 300 es
out vec4 vPos;
in vec2 coords;
void main() {
    vPos = vec4(coords, 0, 3);
    gl_Position = vec4(coords, 0, 3);
}
`;



const FS = `#version 300 es
precision highp float; 

in vec4 vPos;

uniform float time;
uniform float sm;
out vec4 color;
float depth(int c, float m){
  float t = sin(time)*0.5;
  vec2 v1 = vec2(0.0 + sm, 0.28);
  vec2 v2 = vec2(0.0 + sm, -0.28);
  vec2 v3 = vec2(t + sm, 0);
  vec2 v4 = vec2(-t + sm, 0);
  
  float x = vPos[0];
  float y = vPos[1];
  float x0 = 0.0;
  float y0 = 0.0;
  if (c == 0){x0 = v1[0]; y0 = v1[1];};
  if (c == 1){x0 = v2[0]; y0 = v2[1];};
  if (c == 2){x0 = v3[0]; y0 = v3[1];};
  if (c == 3){x0 = v4[0]; y0 = v4[1];};
  x = x - x0;
  y = y - y0;
  float value = m - sqrt(x*x+y*y);
  if (value <= 0.0){value = 0.0;};
  return value;
}

void main() {
    color = vec4(0.572, 0.549, 0.00392, 1);
    if (depth(0, 0.9) + depth(1, 0.9) + depth(2, 0.9) + depth(3, 0.9) > 0.9){color = vec4(0.984, 0.878, 0.403, 1);};
    if (depth(0, 0.8) + depth(1, 0.81) + depth(2, 0.8) + depth(3, 0.8) > 0.9){color = vec4(0.541, 0.321, 0.082, 1);};
    if (depth(0, 0.87) + depth(1, 0.86) + depth(2, 0.87) + depth(3, 0.87) > 1.4){color = vec4(0, 0, 0, 1);};
}
`;
