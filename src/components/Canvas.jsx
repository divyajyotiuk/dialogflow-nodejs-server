/**
 * Reference
 * https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
 */
import React, {useRef, useEffect} from 'react';

const LOG_TAG = "Canvas :: ";

const Canvas = (props) => {
    const {draw, bufferlength, ...rest} = props;
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const canvasCtx = canvas.getContext('2d');
        let drawVisual = null;
        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;

        const render = () => {

            canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
            draw(canvasCtx, canvas, WIDTH, HEIGHT, bufferlength);
            drawVisual = window.requestAnimationFrame(render);
        }
        setTimeout(()=>{
            render();
        }, 500);

        return () => {
            window.cancelAnimationFrame(drawVisual);
        }

    }, [draw]);

    return <canvas ref={canvasRef} {...rest} width={800} height={100}></canvas>
}

export default Canvas;