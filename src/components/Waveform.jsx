import React, {Component} from 'react';
import WaveformGenerator from '../services/WaveformGenerator';
import '../styles/Waveform.css';

const LOG_TAG = "Waveform :: ";

class Waveform extends Component {

    constructor(){
        super();
        this.state = {
            value: 'sinewave',
            waveform: {}
        }
    }

    componentDidMount = () => {
        const canvas = this.refs.canvas;
        const context = canvas.getContext('2d');
        const wrapper = document.getElementsByClassName('wrapper'); //remains unused

        this.setState({
            waveform: new WaveformGenerator(canvas, context, wrapper)
        });
        
        setTimeout(() => {
            this.state.waveform.recordAudio();
        }, 1000);
    }

    handleChange = (event) => {
        console.log(LOG_TAG, event.target.value);
        this.setState({value: event.target.value});
        this.state.waveform.visualSelectOnChange(event.target.value);
    }

    render(){
        return(
            <div className="wrapper">
                <canvas ref="canvas" width="800" height="100"></canvas>
                <form>
                    <div>
                        <label>Visualizer setting</label>
                        <select value={this.state.value} onChange={this.handleChange}>
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