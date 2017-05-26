if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (function () {
        return function (callback) {
            return window.setTimeout(callback, 1000 / 60);
        };
    })();
}





export namespace Demolished {



    export  class Utils{

        static getExponentOfTwo(value: number, max: number): number {
            var count = 1;
            do {
                count *= 2;
            } while (count < value);

            if (count > max)
                count = max;

            return count;
        }


        static convertBuffer(buffer:ArrayBuffer):Float32Array{
            var data = new DataView(buffer);
                    var tempArray = new Float32Array(1024*1024*4);
                    var len = tempArray.length;
                   
                    for (var jj = 0; jj < len; ++jj) {
                    tempArray[jj] =
                        data.getFloat32(jj * Float32Array.BYTES_PER_ELEMENT, true);
                    }
                  
                    return tempArray;

        }
    }

    export class Parameters {

        scale: number;
        time: number;
        mouseX: number;
        mouseY: number;
        screenWidth: number;
        screenHeight: number;
        custom: any;
        constructor(screenWidth: number, screenHeight: number) {
            this.screenWidth = screenWidth;
            this.screenHeight = screenHeight;
        }
        setScreen(w: number, h: number) {
            this.screenWidth = w;
            this.screenWidth = h;
        }
    }

    export class Effect {
        start: number;
        stop: number;
        name: string
        textures: Array<any>;
        constructor() {
            this.textures = new Array<any>();
        }
    }

    export class EnityBase {

        currentProgram: WebGLProgram
        vertexShader: string;
        fragmetShader: string

        buffer: WebGLBuffer;
        vertexPosition: number;
        positionAttribute: number;

        target: RenderTarget;
        backTarget: RenderTarget;

        uniformsCache: Map<string, WebGLUniformLocation>;

        constructor(public gl: WebGLRenderingContext, public name: string,
            public start: number, public stop: number, public x: number, public y: number,
            public assets: Array<Asset>
        ) {
            this.uniformsCache = new Map<string, WebGLUniformLocation>()

            this.loadEntityShaders().then(() => {
                this.initShader();
                this.target = this.createRenderTarget(this.x, this.y);
                this.backTarget = this.createRenderTarget(this.x, this.y);
            });

          

        }


        private createRenderTarget(width: number, height: number): RenderTarget {

            let gl = this.gl;

            let target = new RenderTarget(gl.createFramebuffer(), gl.createRenderbuffer(), gl.createTexture());


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
        }

        loadEntityShaders(): Promise<boolean> {

            let urls = new Array<string>();
            urls.push("entities/" + this.name + "/fragment.glsl");
            urls.push("entities/" + this.name + "/vertex.glsl");

            //  urls.push("entities/" + this.name + "/uniforms.json");
            return Promise.all(urls.map((url: string) =>
                fetch(url).then(resp => resp.text())
            )).then(result => {
                this.fragmetShader = result[0];
                this.vertexShader = result[1];
                return true;
            }).catch((reason) => {
                this.onError(reason);
                return false;
            });
        }

        onError(err) {
            console.error(err)
        }

        createTextureFromData(width:number, height:number, image:HTMLImageElement) {
            let gl = this.gl;
            let texture = gl.createTexture()
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);

   

            gl.bindTexture(gl.TEXTURE_2D, null)

            return texture;
        }
    //     createTextureFromFloat32(width:number, height:number, array:Float32Array){
    //         let gl = this.gl;
    //         let texture = gl.createTexture();
    //            if (!gl.getExtension("OES_texture_float")) {
    //             throw ("Requires OES_texture_float extension");
    //         }
    //         gl.bindTexture(gl.TEXTURE_2D, texture);
    //        //            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, new Float32Array([255,255,255,0])));
    //     gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,32,32,0,gl.RGBA,gl.FLOAT,array);
   
    //       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    //         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    //         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    //         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    //    //     gl.generateMipmap(gl.TEXTURE_2D);
    //         gl.bindTexture(gl.TEXTURE_2D,null);
    //         return texture;
    //     }

        initShader() {

            let gl = this.gl;

            this.buffer = gl.createBuffer();
            this.currentProgram = gl.createProgram();

            let vs: WebGLShader = this.createShader(gl, this.vertexShader, gl.VERTEX_SHADER);
            let fs: WebGLShader = this.createShader(gl, this.fragmetShader, gl.FRAGMENT_SHADER);

            gl.attachShader(this.currentProgram, vs);
            gl.attachShader(this.currentProgram, fs);

            gl.linkProgram(this.currentProgram);

            if (!gl.getProgramParameter(this.currentProgram, gl.LINK_STATUS)) {
                let info = gl.getProgramInfoLog(this.currentProgram);
                this.onError(info);
            }

            this.cacheUniformLocation('freq_data');
            this.cacheUniformLocation('freq_time');
            this.cacheUniformLocation("mytext");

            this.cacheUniformLocation('time');
            this.cacheUniformLocation('mouse');
            this.cacheUniformLocation('resolution');
            this.cacheUniformLocation("sampleRate");
            
            this.cacheUniformLocation("fft");
            // this.positionAttribute = 0;// gl.getAttribLocation(this.currentProgram, "surfacePosAttrib");
            // gl.enableVertexAttribArray(this.positionAttribute);

            this.vertexPosition = gl.getAttribLocation(this.currentProgram, "position");
            gl.enableVertexAttribArray(this.vertexPosition);
            
            this.assets.forEach( (asset:Asset) => {
              
                switch(asset.assetType){
                    case 0:
                        asset.texture = this.createTextureFromData(asset.width, asset.height, 
                        asset.image);  
                        break;
                    case 1:
                      //  asset.texture = this.createTextureFromFloat32(32,32,new Float32Array(32*32*4));
                        break;
                    default:
                        throw "unknown asset type"
                }
                           
            });
          
            // this.createTextureFromFloat32(1,2,new Float32Array([255,0,0,255]));

            gl.useProgram(this.currentProgram);

        }
        cacheUniformLocation(label: string) {
            this.uniformsCache.set(label, this.gl.getUniformLocation(this.currentProgram, label));
        }

        swapBuffers() {
            let tmp = this.target;
            this.target = this.backTarget;
            this.backTarget = tmp;
        }
        createShader(gl: WebGLRenderingContext, src: string, type: number): WebGLShader {
            let shader: WebGLShader = gl.createShader(type);
            gl.shaderSource(shader, src);
            gl.compileShader(shader);
            return shader;
        }
    }

    export class RenderTarget {
        constructor(public frameBuffer: WebGLFramebuffer, public renderBuffer: WebGLFramebuffer,
            public texture: WebGLTexture) {
        }

    }

    
    export class Asset{
        
            texture :WebGLTexture;
            constructor(public image:any, public name:string,public width:number,public height:number,public assetType:number){
            }
    }
    

   export class AudioData {

        freqOffset: number;
        freqScale: number;

        constructor(public freqData: Float32Array,
            public timeData: Float32Array,
            public minDb: number, public maxDb: number) 
        {
            this.freqScale = 1 / (maxDb - minDb);
            this.freqOffset = minDb;
        }
    }
 

    export class AudioAnalyzerSettings {
        constructor(public fftSize: number, public smoothingTimeConstant: number,
            public minDecibels: number, public maxDecibels: number
        ) {
        }
    }
    export class World {

        animationFrameId: number;

        entities: Array<EnityBase>;

        gl: WebGLRenderingContext | any;
        webGLbuffer: WebGLBuffer

        width: number = 1;
        height: number = 1;
        centerX: number = 0;
        centerY: number = 0;
        parameters: Parameters;

        bufferSource: AudioBufferSourceNode

        audioAnalyser: AnalyserNode
        audioData: AudioData;

        currentEntity: number = 0;
        private getRendringContext(): WebGLRenderingContext {

            let renderingContext: any;

            let contextAttributes = { preserveDrawingBuffer: true };

            renderingContext =
                this.canvas.getContext('webgl2', contextAttributes)
                || this.canvas.getContext('webgl', contextAttributes)
                || this.canvas.getContext('experimental-webgl', contextAttributes);

            renderingContext.getExtension('OES_standard_derivatives');
            this.webGLbuffer = renderingContext.createBuffer();
            renderingContext.bindBuffer(renderingContext.ARRAY_BUFFER, this.webGLbuffer);
            renderingContext.bufferData(renderingContext.ARRAY_BUFFER, new Float32Array(
                [- 1.0, - 1.0, 1.0, - 1.0, - 1.0, 1.0, 1.0, - 1.0, 1.0, 1.0, - 1.0, 1.0]
            ), renderingContext.STATIC_DRAW)
            return renderingContext;
        }
        loadTimeline(timelineFile: string): Promise<Array<Effect>> {
            return window.fetch(timelineFile).then((response: Response) => {
                return response.json();
            }).then( (timeline:any) => {
                return timeline;
            })
           
        }
        constructor(public canvas: HTMLCanvasElement,
            public timelineFile: string,
            public audioAnalyzerSettings: AudioAnalyzerSettings
        ) {
            this.parameters = new Parameters(this.canvas.width, this.canvas.height);

            this.parameters.time = 0;
            this.parameters.mouseX = 0.5;
            this.parameters.mouseY = 0.5;

            this.entities = new Array<EnityBase>();

            this.gl = this.getRendringContext();

            this.webGLbuffer = this.gl.createBuffer();

            this.addEventListeners()

            // load and add the entities
            this.loadTimeline(this.timelineFile).then((timeline: any) => {
                this.loadAudio().then((audioBuffer: AudioBuffer) => {
                    timeline.entities.forEach((effect: Effect) => {
                        let textures = Promise.all(effect.textures.map((texture: any) => {
                           
                            return new Promise( (resolve, reject) => {
                                let image = new Image();
                                image.src = texture.url;
                                image.onload = () => {
                                    resolve(image);
                                }
                                image.onerror = (err) => resolve(err);

                            }).then((image: HTMLImageElement) => {
                                return new Asset(image, texture.uniform, texture.width, texture.height,0);
                            });


                        })).then((assets: Array < Asset > ) => {

                            let temp = this.addEntity(effect.name, effect.start, effect.stop, assets);                

                           

                        });
                    });

                    this.resizeCanvas();

                    this.onReady();
                });
            });
        }


        onStart() {
        }

        onStop() {
        }

        onReady() {
        }

        // todo:Rename
        getAudioTracks(): Array<MediaStreamTrack> {
            let ms = this.bufferSource.context["createMediaStreamDestination"]();
            this.bufferSource.connect(ms);
            return ms.stream.getAudioTracks();
        }


        loadAudio():Promise<AudioBuffer> {
           
            
            return window.fetch("assets/song.mp3").then((response: Response) => {

                return response.arrayBuffer().then((buffer: ArrayBuffer) => {

                    let context = new AudioContext();


                    return context.decodeAudioData(buffer).then ( (audioBuffer: AudioBuffer)  => {


                        


                        this.bufferSource = context.createBufferSource();
                        this.audioAnalyser = context.createAnalyser();

                        this.bufferSource.buffer = audioBuffer;

                        this.audioAnalyser.smoothingTimeConstant = this.audioAnalyzerSettings.smoothingTimeConstant;
                        this.audioAnalyser.fftSize = this.audioAnalyzerSettings.fftSize;
                        this.audioAnalyser.maxDecibels = -10;
                        this.audioAnalyser.minDecibels = -90;
                        this.audioData =
                            new AudioData(new Float32Array(this.audioAnalyser.fftSize), 
                            new Float32Array(this.audioAnalyser.fftSize),
                                this.audioAnalyzerSettings.minDecibels,
                                this.audioAnalyzerSettings.maxDecibels);

                        this.bufferSource.connect(this.audioAnalyser);
                        this.bufferSource.connect(context.destination);
                     

                        return audioBuffer;
                        

                    });

                });
            });

        }
        private addEventListeners() {
            document.addEventListener("mousemove", (evt: MouseEvent) => {
                this.parameters.mouseX = evt.clientX / window.innerWidth;
                this.parameters.mouseY = 1 - evt.clientY / window.innerHeight;
            });
            window.addEventListener("resize", () => {
                this.resizeCanvas();
            });

        }
        addEntity(name: string, start: number, stop: number,
            textures: Array<Asset>
        ): EnityBase {
            const entity = new EnityBase(this.gl, name, start, stop,
                this.canvas.width, this.canvas.height,
                textures
            );
            this.entities.push(entity);
            return entity;
        }
        start(time: number) {
            this.animate(time);
            this.bufferSource.start(0);
            this.onStart();

        }
        stop() {
            cancelAnimationFrame(this.animationFrameId);
            this.bufferSource.stop();
            this.onStop();
        }

         fftTexture: WebGLTexture;

         createFFTTexture(width:number, height:number, array:Uint8Array){
            let gl = this.gl;
            let texture = gl.createTexture();
               if (!gl.getExtension("OES_texture_float")) {
                throw ("Requires OES_texture_float extension");
            }

             gl.bindTexture(gl.TEXTURE_2D, texture);
             gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,32,32,0,gl.RGBA,gl.UNSIGNED_BYTE,array);
   
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);


   
            return texture;
        }



        private animate(time: number) {
            this.animationFrameId = requestAnimationFrame((_time: number) => {
                if (this.audioAnalyser) {
                   var bufferLength = this.audioAnalyser.frequencyBinCount;
                   var dataArray = new Uint8Array(bufferLength);
                   this.audioAnalyser.getByteFrequencyData(dataArray);
                    
                   this.fftTexture  = this.createFFTTexture(32,32,dataArray);

                }
                this.animate(_time);
            });
            // What to render needs to come from graph;
            let ent: EnityBase = this.entities[this.currentEntity];

          //  ent.assets[0].texture = 
            // for next frame ,  use next effect if we reached the end of current
            if (time > ent.stop) {
                this.currentEntity++;
                if (this.currentEntity === this.entities.length) {
                    this.stop()
                }
            }
            this.renderEntities(ent, time);
        }

        private surfaceCorners() {
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
        }

        setViewPort(width: number, height: number) {
            this.gl.viewport(0, 0, width, height);
        }

        resizeCanvas() {

            let width = window.innerWidth / 2
            let height = window.innerHeight / 2;

            this.canvas.width = width;
            this.canvas.height = height;

            this.canvas.style.width = window.innerWidth + 'px';
            this.canvas.style.height = window.innerHeight + 'px';

            this.parameters.screenWidth = width;
            this.parameters.screenHeight = height;

            this.surfaceCorners();

            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        }


        renderEntities(ent: EnityBase, tm: number) {

            document.querySelector("#time").textContent = ((tm / 1000) % 60).toFixed(2).toString();

            let gl = this.gl;

            this.parameters.time = tm; // Date.now() - this.parameters.startTime;

            gl.useProgram(ent.currentProgram);


            gl.uniform1f(ent.uniformsCache.get('sampleRate'),44100);

            // gl.uniform1fv(ent.uniformsCache.get('freq_data'), this.audioData.freqData);
            // gl.uniform1fv(ent.uniformsCache.get('freq_time'), this.audioData.timeData);

            gl.uniform1f(ent.uniformsCache.get('time'), this.parameters.time / 1000);
            gl.uniform2f(ent.uniformsCache.get('mouse'), this.parameters.mouseX, this.parameters.mouseY);
            gl.uniform2f(ent.uniformsCache.get('resolution'), this.parameters.screenWidth, this.parameters.screenHeight);


            gl.bindBuffer(gl.ARRAY_BUFFER, ent.buffer);

            gl.vertexAttribPointer(ent.positionAttribute, 2, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.webGLbuffer);
            gl.vertexAttribPointer(ent.vertexPosition, 2, gl.FLOAT, false, 0, 0);

            

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, ent.backTarget.texture);


            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.fftTexture);

            gl.uniform1i(gl.getUniformLocation(ent.currentProgram, "fft"),0);

            let offset = 2;
            ent.assets.forEach ( (asset:Asset,index:number) => {
                gl.activeTexture(gl.TEXTURE0 + (offset + index));
                gl.bindTexture(gl.TEXTURE_2D, asset.texture);
                gl.uniform1i(gl.getUniformLocation(ent.currentProgram, asset.name), offset + index);
             
            } );


          

          //   gl.uniform1i(gl.getUniformLocation(ent.currentProgram,"fft"),2);
        

          


            gl.bindFramebuffer(gl.FRAMEBUFFER, ent.target.frameBuffer);

            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            ent.swapBuffers();

        }
    }
}