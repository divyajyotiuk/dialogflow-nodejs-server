import React, {Component} from 'react';
import WaveformGenerator from '../services/WaveformGenerator';
import '../styles/Waveform.css';
import Canvas from './Canvas';

const LOG_TAG = "Waveform :: ";

class Waveform extends Component {

    constructor(){
        super();
        this.state = {
            visualSetting: 'off',
            waveform: {},
            analyser: {},
            bufferlength: 0,
            draw: this.clearCanvas
        }
    }

    componentDidMount = () => {

        this.setState({
            waveform: new WaveformGenerator()
        });
        
        setTimeout(() => {
            this.state.waveform.recordAudio();
            this.setState({ analyser: this.state.waveform.getAnalyser()});
        }, 1000);

        setTimeout(()=>{
            console.log(this.state.analyser);
        },1100)
    }

    handleChange = (event) => {
        console.log(LOG_TAG, event.target.value);
        this.setState({visualSetting: event.target.value});
        setTimeout(()=>{
            console.log(this.state.visualSetting);
            this.returnDrawMethod();
        }, 200);
    }

    drawSine = (canvasCtx, canvas,  WIDTH, HEIGHT, bufferLength) => {
        //drawVisual = requestAnimationFrame(oThis.draw);
        if(!canvas) return;
        let dataArray = new Uint8Array(bufferLength);
        this.state.analyser.getByteTimeDomainData(dataArray);

        canvasCtx.fillStyle = 'rgb(255, 255, 255)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

        canvasCtx.beginPath();

        let sliceWidth = WIDTH * 1.0 / bufferLength;
        let x = 0;

        for(let i = 0; i < bufferLength; i++) {

            let v = dataArray[i] / 128.0;
            let y = v * HEIGHT/2;

            if(i === 0) {
            canvasCtx.moveTo(x, y);
            } else {
            canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height/2);
        canvasCtx.stroke();
    }

    drawBars = (canvasCtx, canvas, WIDTH, HEIGHT, bufferLengthAlt) => {
        //drawVisual = requestAnimationFrame(oThis.drawAlt);

        let dataArrayAlt = new Uint8Array(bufferLengthAlt);
        this.state.analyser.getByteFrequencyData(dataArrayAlt);

        canvasCtx.fillStyle = 'rgb(0, 0, 0)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        let barWidth = (WIDTH / bufferLengthAlt) * 2.5;
        let barHeight;
        let x = 0;

        for(let i = 0; i < bufferLengthAlt; i++) {
            barHeight = dataArrayAlt[i];

            canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
            canvasCtx.fillRect(x, HEIGHT - barHeight/2, barWidth, barHeight/2);

            x += barWidth + 1;
        }
    }

    clearCanvas = (canvasCtx, canvas, WIDTH, HEIGHT) => {
        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
        var grd = canvasCtx.createLinearGradient(0, 0, 800, 100);
        grd.addColorStop(0, "#58bedd");
        grd.addColorStop(0.5, "#1d27fd");
        grd.addColorStop(1, "#000000");

        canvasCtx.fillStyle = grd;
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);  
    }

    returnDrawMethod = () => {
    
        if(this.state.visualSetting === "sinewave") {

            this.setState({
                analyser: Object.assign(this.state.analyser, {'fftSize': 2048} )
            });

            const ffsize = this.state.analyser.fftSize;

            //this.state.analyser.fftSize = 2048;
            //let bufferLength = this.state.analyser.fftSize;
            setTimeout(()=>{
                this.setState({
                    bufferlength: ffsize,
                    draw: this.drawSine
                });
            }, 100);
    
        } else if(this.state.visualSetting == "frequencybars") {

            this.setState({
                analyser: Object.assign(this.state.analyser, {'fftSize': 256} )
            })

            const freqCnt = this.state.analyser.frequencyBinCount;

            //this.state.analyser.fftSize = 256;
            //let bufferLengthAlt = this.state.analyser.frequencyBinCount;
            setTimeout(()=>{
                this.setState({
                    bufferlength: freqCnt,
                    draw: this.drawBars
                });
            }, 100);
    
        } else if(this.state.visualSetting == "off") {

            this.setState({
                bufferlength: 0,
                draw: this.clearCanvas
            })
        }
    
    }

    render(){
        return(
            <div className="wrapper">
                <Canvas draw={this.state.draw} bufferlength={this.state.bufferlength} />
                <form>
                    <div className="select-style">
                        <label>Visualizer setting: </label>
                        <select value={this.state.visualSetting} onChange={this.handleChange}>
                            <option value="sinewave">Sinewave</option>
                            <option value="frequencybars">Frequency bars</option>
                            <option value="off">Off</option>
                        </select>
                    </div>
                </form>
            </div>
        );
    }
}

export default Waveform;