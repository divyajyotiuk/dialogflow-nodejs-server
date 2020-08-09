
import RecordRTC from 'recordrtc';
import io from 'socket.io-client';
import ss from 'socket.io-stream';

const socket = io('http://localhost:8000');

socket.on('connect', () => {
	console.log('connecting...');
});

var isEdge = navigator.userAgent.indexOf('Edge') !== -1 && (!!navigator.msSaveOrOpenBlob || !!navigator.msSaveBlob);
var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

var recorder; // globally accessible
var microphone;

const captureStream = (callback) => {
	if(microphone){
		callback(microphone);
		return;
	}

	if(typeof navigator.mediaDevices === 'undefined' || !navigator.mediaDevices.getUserMedia) {
		alert('This browser does not supports WebRTC getUserMedia API.');

		if(!!navigator.getUserMedia) {
			alert('This browser seems supporting deprecated getUserMedia API.');
		}
	}

	navigator.mediaDevices.getUserMedia({
		audio: true
	})
	.then( async function(stream) {
		callback(stream);
	})
	.catch(function(error) {
		alert('Unable to capture your microphone. Please check console logs.');
		console.error(error);
	});
}

const automaticRecord = () => {
	if(!microphone){
		captureStream( callBackFunction );
	}
	return getResults();
}

const callBackFunction = (stream) => {
	microphone = stream;

	if(microphone){

		//wav header
		let options = {
			type: 'audio',
			mimeType: 'audio/webm',
			numberOfAudioChannels: 1,
			checkForInactiveTracks: true,
			bufferSize: 16384,
			sampleRate: 44100,
			desiredSampRate: 16000,
			recorderType: RecordRTC.StereoAudioRecorder,

			// get intervals based blobs
			// value in milliseconds
			// as you might not want to make detect calls every 5 seconds
			timeSlice: 5000,

			ondataavailable: (blob) => {
				// 3
				// making use of socket.io-stream for bi-directional
				// streaming, create a stream
				var ioStream = ss.createStream();
				console.log("streaming to server .....");
				// stream directly to server
				// it will be temp. stored locally
				ss(socket).emit('stream', ioStream, {
					name: 'stream.wav', 
					size: blob.size
				});
				// pipe the audio blob to the read stream to not overwhelm source and destination of different speeds
				ss.createBlobReadStream(blob).pipe(ioStream);
			}
		};

		if(isSafari || isEdge) {
			options.recorderType = RecordRTC.StereoAudioRecorder;
		}

		if(navigator.platform && navigator.platform.toString().toLowerCase().indexOf('win') === -1) {
			options.sampleRate = 48000; // or 44100 or remove this line for default
		}

		if(isSafari) {
			options.sampleRate = 44100;
			options.bufferSize = 4096;
			options.numberOfAudioChannels = 2;
		}

		if(recorder) {
			recorder.destroy();
			recorder = null;
		}

		recorder = RecordRTC(stream, options);
		recorder.startRecording();
		console.log(recorder);

		// setTimeout(()=>{
		// 	recorder.stopRecording(function() {
		// 		let blob = recorder.getBlob();
		// 		recorder.save('audio.mp3');
		// 		RecordRTC.invokeSaveAsDialog(blob);
		// 	});
		// },5000);

		if(isSafari) {
			alert('Please refresh maybe. First time we tried to access your microphone. Now we will record it.');
			return;
		}
	}
}

const getResults = () => {
	let results;
	//put this in a function and call in App.js
	socket.on('results', (data) => {
		results = data;
		console.log(data);
	});
	return results;
}

export default automaticRecord;