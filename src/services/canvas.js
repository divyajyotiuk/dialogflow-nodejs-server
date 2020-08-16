class Canvas {
    constructor(canvas, context, wrapper, analyser){
        this.analyser = analyser;
        this.initCanvas(canvas, context, wrapper);
        this.drawVisual = null;
    }

    initCanvas(canvas, context, wrapper){
        this.canvas = canvas;
        this.canvasCtx = context;

        let intendedWidth = wrapper.clientWidth;
        this.canvas.setAttribute('width', intendedWidth);
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

export default Canvas;