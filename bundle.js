/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (function () {
        return function (callback) {
            return window.setTimeout(callback, 1000 / 60);
        };
    })();
}
var Demolished;
(function (Demolished) {
    var Parameters = (function () {
        function Parameters(screenWidth, screenHeight) {
            this.screenWidth = screenWidth;
            this.screenHeight = screenHeight;
        }
        Parameters.prototype.setScreen = function (w, h) {
            this.screenWidth = w;
            this.screenWidth = h;
        };
        return Parameters;
    }());
    Demolished.Parameters = Parameters;
    var Effect = (function () {
        function Effect() {
        }
        return Effect;
    }());
    Demolished.Effect = Effect;
    var EnityBase = (function () {
        function EnityBase(gl, name, start, stop, x, y) {
            var _this = this;
            this.gl = gl;
            this.name = name;
            this.start = start;
            this.stop = stop;
            this.x = x;
            this.y = y;
            this.uniformsCache = new Map();
            this.loadEntityResources().then(function () {
                _this.init();
                _this.target = _this.createRenderTarget(_this.x, _this.y);
                _this.backTarget = _this.createRenderTarget(_this.x, _this.y);
            });
        }
        EnityBase.prototype.createRenderTarget = function (width, height) {
            var gl = this.gl;
            var target = new RenderTarget(gl.createFramebuffer(), gl.createRenderbuffer(), gl.createTexture());
            gl.bindTexture(gl.TEXTURE_2D, target.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.bindFramebuffer(gl.FRAMEBUFFER, target.frameBuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);
            gl.bindRenderbuffer(gl.RENDERBUFFER, target.renderBuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, target.renderBuffer);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            return target;
        };
        EnityBase.prototype.loadEntityResources = function () {
            var _this = this;
            var urls = new Array();
            urls.push("entities/" + this.name + "/fragment.glsl");
            urls.push("entities/" + this.name + "/vertex.glsl");
            urls.push("entities/" + this.name + "/uniforms.json");
            return Promise.all(urls.map(function (url) {
                return fetch(url).then(function (resp) { return resp.text(); });
            })).then(function (result) {
                _this.fragmetShader = result[0];
                _this.vertexShader = result[1];
                return true;
            }).catch(function (reason) {
                _this.onError(reason);
                return false;
            });
        };
        EnityBase.prototype.onError = function (err) {
            console.error(err);
        };
        EnityBase.prototype.init = function () {
            var gl = this.gl;
            this.buffer = gl.createBuffer();
            this.currentProgram = gl.createProgram();
            var vs = this.createShader(gl, this.vertexShader, gl.VERTEX_SHADER);
            var fs = this.createShader(gl, this.fragmetShader, gl.FRAGMENT_SHADER);
            gl.attachShader(this.currentProgram, vs);
            gl.attachShader(this.currentProgram, fs);
            gl.linkProgram(this.currentProgram);
            if (!gl.getProgramParameter(this.currentProgram, gl.LINK_STATUS)) {
                var info = gl.getProgramInfoLog(this.currentProgram);
                this.onError(info);
            }
            this.cacheUniformLocation('freq_data');
            this.cacheUniformLocation('freq_time');
            this.cacheUniformLocation('time');
            this.cacheUniformLocation('mouse');
            this.cacheUniformLocation('resolution');
            this.positionAttribute = 0; // gl.getAttribLocation(this.currentProgram, "surfacePosAttrib");
            gl.enableVertexAttribArray(this.positionAttribute);
            this.vertexPosition = gl.getAttribLocation(this.currentProgram, "position");
            gl.enableVertexAttribArray(this.vertexPosition);
            gl.useProgram(this.currentProgram);
        };
        EnityBase.prototype.cacheUniformLocation = function (label) {
            this.uniformsCache.set(label, this.gl.getUniformLocation(this.currentProgram, label));
            //this.uniformsCache[label] = this.gl.getUniformLocation(program, label);
        };
        EnityBase.prototype.swapBuffers = function () {
            var tmp = this.target;
            this.target = this.backTarget;
            this.backTarget = tmp;
        };
        EnityBase.prototype.createShader = function (gl, src, type) {
            var shader = gl.createShader(type);
            gl.shaderSource(shader, src);
            gl.compileShader(shader);
            return shader;
        };
        return EnityBase;
    }());
    Demolished.EnityBase = EnityBase;
    var RenderTarget = (function () {
        function RenderTarget(frameBuffer, renderBuffer, texture) {
            this.frameBuffer = frameBuffer;
            this.renderBuffer = renderBuffer;
            this.texture = texture;
        }
        return RenderTarget;
    }());
    Demolished.RenderTarget = RenderTarget;
    var AudioData = (function () {
        function AudioData(freqData, timeData, minDb, maxDb) {
            this.freqData = freqData;
            this.timeData = timeData;
            this.minDb = minDb;
            this.maxDb = maxDb;
            this.freqScale = 1 / (maxDb - minDb);
            this.freqOffset = minDb;
        }
        return AudioData;
    }());
    Demolished.AudioData = AudioData;
    var World = (function () {
        function World(canvas) {
            var _this = this;
            this.canvas = canvas;
            this.width = 1;
            this.height = 1;
            this.centerX = 0;
            this.centerY = 0;
            this.currentEntity = 0;
            this.parameters = new Parameters(this.canvas.width, this.canvas.height);
            this.parameters.time = 0;
            this.parameters.mouseX = 0.5;
            this.parameters.mouseY = 0.5;
            this.entities = new Array();
            this.gl = this.getRendringContext();
            this.resizeCanvas();
            this.webGLbuffer = this.gl.createBuffer();
            this.addEventListeners();
            // load and add the entities
            this.loadTimeline().then(function (effects) {
                effects.forEach(function (effect) {
                    _this.addEntity(effect.name, effect.start, effect.stop);
                });
                _this.loadMusic();
            });
        }
        World.prototype.getRendringContext = function () {
            var renderingContext;
            var contextAttributes = { preserveDrawingBuffer: true };
            renderingContext =
                this.canvas.getContext('webgl2', contextAttributes)
                    || this.canvas.getContext('webgl', contextAttributes)
                    || this.canvas.getContext('experimental-webgl', contextAttributes);
            //this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl')
            renderingContext.getExtension('OES_standard_derivatives');
            this.webGLbuffer = renderingContext.createBuffer();
            renderingContext.bindBuffer(renderingContext.ARRAY_BUFFER, this.webGLbuffer);
            renderingContext.bufferData(renderingContext.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0]), renderingContext.STATIC_DRAW);
            return renderingContext;
        };
        World.prototype.loadTimeline = function () {
            var timeline = window.fetch("entities/timeline.json").then(function (response) {
                return response.json();
            });
            return timeline.then(function (json) {
                return json;
            });
        };
        World.prototype.onStart = function () {
        };
        World.prototype.onStop = function () {
        };
        World.prototype.onReady = function () {
        };
        World.prototype.loadMusic = function () {
            var _this = this;
            var context = new AudioContext();
            window.fetch("assets/song.mp3").then(function (response) {
                response.arrayBuffer().then(function (buffer) {
                    context.decodeAudioData(buffer, function (audioBuffer) {
                        _this.bufferSource = context.createBufferSource();
                        _this.audioAnalyser = context.createAnalyser();
                        _this.bufferSource.buffer = audioBuffer;
                        _this.audioAnalyser.smoothingTimeConstant = 0.2;
                        _this.audioAnalyser.fftSize = 32;
                        _this.audioData =
                            new AudioData(new Float32Array(32), new Float32Array(32), _this.audioAnalyser.minDecibels, _this.audioAnalyser.maxDecibels);
                        _this.bufferSource.connect(_this.audioAnalyser);
                        _this.bufferSource.connect(context.destination);
                        _this.onReady();
                        _this.resizeCanvas();
                    });
                });
            });
        };
        World.prototype.addEventListeners = function () {
            var _this = this;
            document.addEventListener("mousemove", function (evt) {
                _this.parameters.mouseX = evt.clientX / window.innerWidth;
                _this.parameters.mouseY = 1 - evt.clientY / window.innerHeight;
            });
            window.addEventListener("resize", function () {
                _this.resizeCanvas();
            });
        };
        World.prototype.addEntity = function (name, start, stop) {
            var entity = new EnityBase(this.gl, name, start, stop, this.canvas.width, this.canvas.height);
            this.entities.push(entity);
            return entity;
        };
        World.prototype.start = function (time) {
            //    console.log("demo start called..");
            this.animate(time);
            this.bufferSource.start(0);
            this.onStart();
        };
        World.prototype.stop = function () {
            cancelAnimationFrame(this.animationFrameId);
            this.onStop();
        };
        World.prototype.animate = function (time) {
            var _this = this;
            this.animationFrameId = requestAnimationFrame(function (_time) {
                if (_this.audioAnalyser) {
                    _this.audioAnalyser.getFloatFrequencyData(_this.audioData.freqData);
                    _this.audioAnalyser.getFloatTimeDomainData(_this.audioData.timeData);
                }
                _this.animate(_time);
            });
            // What to render needs to come from graph;
            var ent = this.entities[this.currentEntity];
            // for next frame ,  use next effect if we reached the end of current
            if (time > ent.stop) {
                this.currentEntity++;
                if (this.currentEntity === this.entities.length) {
                    this.stop();
                }
            }
            this.renderEntities(ent, time);
        };
        World.prototype.surfaceCorners = function () {
            if (this.gl) {
                this.width = this.height * this.parameters.screenWidth / this.parameters.screenHeight;
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.webGLbuffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
                    this.centerX - this.width, this.centerY - this.height,
                    this.centerX + this.width, this.centerY - this.height,
                    this.centerX - this.width, this.centerY + this.height,
                    this.centerX + this.width, this.centerY - this.height,
                    this.centerX + this.width, this.centerY + this.height,
                    this.centerX - this.width, this.centerY + this.height]), this.gl.STATIC_DRAW);
            }
        };
        World.prototype.setViewPort = function (width, height) {
            this.gl.viewport(0, 0, width, height);
        };
        World.prototype.resizeCanvas = function () {
            var width = window.innerWidth / 2;
            var height = window.innerHeight / 2;
            this.canvas.width = width;
            this.canvas.height = height;
            this.canvas.style.width = window.innerWidth + 'px';
            this.canvas.style.height = window.innerHeight + 'px';
            this.parameters.screenWidth = width;
            this.parameters.screenHeight = height;
            this.surfaceCorners();
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        };
        World.prototype.renderEntities = function (ent, tm) {
            document.querySelector("#time").textContent = ((tm / 1000) % 60).toFixed(2).toString();
            document.querySelector("#effect").textContent = ent.name;
            var gl = this.gl;
            this.parameters.time = tm; // Date.now() - this.parameters.startTime;
            gl.useProgram(ent.currentProgram);
            gl.uniform1fv(ent.uniformsCache.get('freq_data'), this.audioData.freqData);
            gl.uniform1fv(ent.uniformsCache.get('freq_time'), this.audioData.timeData);
            gl.uniform1f(ent.uniformsCache.get('time'), this.parameters.time / 1000);
            gl.uniform2f(ent.uniformsCache.get('mouse'), this.parameters.mouseX, this.parameters.mouseY);
            gl.uniform2f(ent.uniformsCache.get('resolution'), this.parameters.screenWidth, this.parameters.screenHeight);
            gl.bindBuffer(gl.ARRAY_BUFFER, ent.buffer);
            gl.vertexAttribPointer(ent.positionAttribute, 2, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.webGLbuffer);
            gl.vertexAttribPointer(ent.vertexPosition, 2, gl.FLOAT, false, 0, 0);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, ent.backTarget.texture);
            gl.bindFramebuffer(gl.FRAMEBUFFER, ent.target.frameBuffer);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            ent.swapBuffers();
        };
        return World;
    }());
    Demolished.World = World;
})(Demolished = exports.Demolished || (exports.Demolished = {}));


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var demolished_1 = __webpack_require__(0);
var DemolishInstance = (function () {
    function DemolishInstance() {
        var _this = this;
        this.world = new demolished_1.Demolished.World(document.querySelector("#gl"));
        this.world.onReady = function () {
            _this.onReady();
        };
    }
    DemolishInstance.prototype.onReady = function () {
    };
    return DemolishInstance;
}());
document.addEventListener("DOMContentLoaded", function () {
    var launchButton = document.querySelector("#full-screen");
    function launchFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        }
        else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        }
        else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        }
        else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }
    var demolished = new DemolishInstance();
    demolished.onReady = function () {
        console.log("ready to start...");
        launchButton.disabled = false;
        launchButton.textContent = "Press to start!";
    };
    launchButton.addEventListener("click", function () {
        launchFullscreen(document.querySelector("#main"));
        launchButton.style.display = "none";
        demolished.world.start(0);
    });
});


/***/ })
/******/ ]);