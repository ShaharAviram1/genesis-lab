import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// When a WebGL context is lost, gl.getParameter() returns null for all queries.
// Three.js calls gl.getParameter(gl.VERSION) synchronously in its renderer constructor
// and does glVersion.indexOf(...) without a null guard — crashing the whole React tree.
// Patch both context prototypes before any canvas is created so that VERSION and
// SHADING_LANGUAGE_VERSION always return a safe string even on a lost context.
// All other parameters pass through unchanged.
function patchWebGLGetParameter(proto, versionString, glslString) {
  const _getParameter = proto.getParameter;
  proto.getParameter = function (pname) {
    if (this.isContextLost()) {
      if (pname === this.VERSION) return versionString;
      if (pname === this.SHADING_LANGUAGE_VERSION) return glslString;
      // Three.js reads VIEWPORT and SCISSOR_BOX as typed arrays (result[0], result[1], etc.)
      // Return safe zero-filled arrays so indexing doesn't crash.
      if (pname === this.VIEWPORT || pname === this.SCISSOR_BOX) return new Int32Array(4);
      if (pname === this.COLOR_CLEAR_VALUE || pname === this.BLEND_COLOR) return new Float32Array(4);
      return null;
    }
    return _getParameter.call(this, pname);
  };
  const _getShaderPrecisionFormat = proto.getShaderPrecisionFormat;
  proto.getShaderPrecisionFormat = function (shaderType, precisionType) {
    if (this.isContextLost()) return { precision: 0, rangeMin: 0, rangeMax: 0 };
    const result = _getShaderPrecisionFormat.call(this, shaderType, precisionType);
    return result ?? { precision: 0, rangeMin: 0, rangeMax: 0 };
  };
}
if (typeof WebGLRenderingContext !== 'undefined') {
  patchWebGLGetParameter(WebGLRenderingContext.prototype, 'WebGL 1.0', 'WebGL GLSL ES 1.0');
}
if (typeof WebGL2RenderingContext !== 'undefined') {
  patchWebGLGetParameter(WebGL2RenderingContext.prototype, 'WebGL 2.0', 'WebGL GLSL ES 3.00');
}

// StrictMode is intentionally omitted: React 18 StrictMode double-invokes effects
// in development, which causes @react-three/fiber's Canvas to request a second WebGL
// context before the browser has released the first one, resulting in a lost context
// and a cascade crash (glVersion.indexOf on null). StrictMode is safe to re-enable
// once @react-three/fiber adds native StrictMode support.
createRoot(document.getElementById('root')).render(<App />)
