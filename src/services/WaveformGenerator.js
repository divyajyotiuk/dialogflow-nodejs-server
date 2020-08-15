/**
 * Reference https://mdn.github.io/voice-change-o-matic/
 * app.js
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
 */

const LOG_TAG = "WaveformGenerator :: ";

class WaveformGenerator {

    constructor(canvas, context, wrapper){
        this.getUserMedia = null;
        this.init();
        // set up forked web audio context, for multiple browsers
        // window. is needed otherwise Safari explodes
        this.audioCtx = null;
        this.createAudioContext();
        this.source = null;
        this.analyser = null;
        this.createAnalyser();
        this.initVoiceSetting();

        this.initCanvas(canvas, context, wrapper);
        this.drawVisual = null;
    }

    createAudioContext = () => {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    createAnalyser = () => {
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.minDecibels = -90;
        this.analyser.maxDecibels = -10;
        this.analyser.smoothingTimeConstant = 0.85;
    }

    initVoiceSetting = () => {
        this.distortion = this.audioCtx.createWaveShaper();
        this.gainNode = this.audioCtx.createGain();
        this.biquadFilter = this.audioCtx.createBiquadFilter();
        this.convolver = this.audioCtx.createConvolver();
    }

    initCanvas(canvas, context, wrapper){
        this.canvas = canvas;
        this.canvasCtx = context;

        // let intendedWidth = wrapper.clientWidth;
        // this.canvas.setAttribute('width', intendedWidth);
    }

    init = () => {
        const oThis = this;
        // Older browsers might not implement mediaDevices at all, so we set an empty object first
        if (navigator.mediaDevices === undefined) {
            navigator.mediaDevices = {};
        }

        // Some browsers partially implement mediaDevices. We can't just assign an object
        // with getUserMedia as it would overwrite existing properties.
        // Here, we will just add the getUserMedia property if it's missing.
        if (navigator.mediaDevices.getUserMedia === undefined) {

            navigator.mediaDevices.getUserMedia = (constraints) => {

                // First get ahold of the legacy getUserMedia, if present
                oThis.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

                // Some browsers just don't implement it - return a rejected promise with an error
                // to keep a consistent interface
                if (!oThis.getUserMedia) {
                    return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
                }

                // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
                return new Promise((resolve, reject) => {
                    oThis.getUserMedia.call(navigator, constraints, resolve, reject);
                });
            }
        }
    }

    recordAudio = () => {
        const oThis = this;
        //main block for doing the audio recording
        if (navigator.mediaDevices.getUserMedia) {
            console.log('getUserMedia supported.');
            let constraints = {audio: true};
            navigator.mediaDevices.getUserMedia (constraints)
            .then((stream) => {
                oThis.source = oThis.audioCtx.createMediaStreamSource(stream);
                oThis.source.connect(oThis.distortion);
                oThis.distortion.connect(oThis.biquadFilter);
                oThis.biquadFilter.connect(oThis.gainNode);
                oThis.convolver.connect(oThis.gainNode);
                oThis.gainNode.connect(oThis.analyser);
                oThis.analyser.connect(oThis.audioCtx.destination);

                //by default 
                oThis.visualize("sinewave");
            })
            .catch( (err) => console.log('The following gUM error occured: ' + err) );
        } else {
            console.log('getUserMedia not supported on your browser!');
        }
    }

    draw = (WIDTH, HEIGHT, bufferLength) => {
        const oThis = this;

        oThis.drawVisual = requestAnimationFrame(oThis.draw);
        
        let dataArray = new Uint8Array(bufferLength);
        oThis.analyser.getByteTimeDomainData(dataArray);

        oThis.canvasCtx.fillStyle = 'rgb(200, 200, 200)';
        oThis.canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        oThis.canvasCtx.lineWidth = 2;
        oThis.canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

        oThis.canvasCtx.beginPath();

        let sliceWidth = WIDTH * 1.0 / bufferLength;
        let x = 0;

        for(let i = 0; i < bufferLength; i++) {

            let v = dataArray[i] / 128.0;
            let y = v * HEIGHT/2;

            if(i === 0) {
            oThis.canvasCtx.moveTo(x, y);
            } else {
            oThis.canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        oThis.canvasCtx.lineTo(oThis.canvas.width, oThis.canvas.height/2);
        oThis.canvasCtx.stroke();
    }

    drawAlt = (WIDTH, HEIGHT, bufferLengthAlt) => {
        const oThis = this;
        oThis.drawVisual = requestAnimationFrame(oThis.drawAlt);

        let dataArrayAlt = new Uint8Array(bufferLengthAlt);
        oThis.analyser.getByteFrequencyData(dataArrayAlt);

        oThis.canvasCtx.fillStyle = 'rgb(0, 0, 0)';
        oThis.canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        let barWidth = (WIDTH / bufferLengthAlt) * 2.5;
        let barHeight;
        let x = 0;

        for(let i = 0; i < bufferLengthAlt; i++) {
            barHeight = dataArrayAlt[i];

            oThis.canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
            oThis.canvasCtx.fillRect(x, HEIGHT - barHeight/2, barWidth, barHeight/2);

            x += barWidth + 1;
        }
    }

    visualize = (visualSetting) => {
        const oThis  = this
        ,     WIDTH  = oThis.canvas.width
        ,     HEIGHT = oThis.canvas.height
        ;
    
        console.log(visualSetting);
    
        if(visualSetting === "sinewave") {

            oThis.analyser.fftSize = 2048;

            let bufferLength = oThis.analyser.fftSize;
            console.log(LOG_TAG, bufferLength);

            oThis.canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

            oThis.draw(WIDTH, HEIGHT, bufferLength);
    
        } else if(visualSetting == "frequencybars") {

            oThis.analyser.fftSize = 256;

            let bufferLengthAlt = oThis.analyser.frequencyBinCount;
            console.log(LOG_TAG, bufferLengthAlt);

            oThis.canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

            oThis.drawAlt(WIDTH, HEIGHT, bufferLengthAlt);
    
        } else if(visualSetting == "off") {

            oThis.canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
            oThis.canvasCtx.fillStyle = "aqua";
            oThis.canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);  
        }
    
    }

    visualSelectOnChange = (visualSetting) => {
        const oThis = this;
        window.cancelAnimationFrame(oThis.drawVisual);
        oThis.visualize(visualSetting);
    }
}

export default WaveformGenerator;