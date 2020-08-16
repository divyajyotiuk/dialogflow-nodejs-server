/**
 * Reactjs cannot use draw, drawAlt
 * Reference https://mdn.github.io/voice-change-o-matic/
 * app.js
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
 */

//import Canvas from './canvas';
const LOG_TAG = "WaveformGenerator :: ";

class WaveformGenerator {

    constructor(){
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
    }

    getAnalyser = () => this.analyser;

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

                //call Canvas's visualize function
            })
            .catch( (err) => console.log('The following gUM error occured: ' + err) );
        } else {
            console.log('getUserMedia not supported on your browser!');
        }
    }
}

export default WaveformGenerator;