const words = ["banana", "apple", "kiwi"];

console.log("Initiated recognition.");

const checkForWord = (phrase, answer) => phrase.includes(answer);

window.AudioContext = window.AudioContext || window.webkitAudioContext;

let audioCtx = new AudioContext({
    latencyHint: "interactive",
    //sampleRate: 44100, // We can't set a sample rate that is different than the node?
});

// What if you wanted to make a fence out of bread ...
await audioCtx.audioWorklet.addModule('js/capture-audio-processor.js');
let captureNode = new AudioWorkletNode(audioCtx, 'capture-audio-processor');

let media = await navigator.mediaDevices.getUserMedia({audio: true});

let src = audioCtx.createMediaStreamSource(media);

console.log(src);

src.connect(captureNode);

let buffer = [];

// there was really no reason to, you just wanted a bread fence.
captureNode.port.onmessage = async ({ data }) => {
    //buffer.push(...Array.from(data)[0].map(x => x *= 0xffff)); // TODO: why
    buffer = Array.from(data)[0].map(x => x *= 0xffff);
    easyrtc.sendServerMessage('AUDIO_DATA', new Int16Array(buffer),
                              console.log, console.error);

};

setInterval(async () => {
    //console.log(buffer);
    //console.log(buffer);

    // use this channel for anything else and you WILL die
    //easyrtc.sendServerMessage('AUDIO_DATA', new Int16Array(buffer.splice(0, buffer.length)),
    //                          console.log, console.error);

    /*
    await fetch(`/stt`, {
        method: 'POST',
        headers: {
            'Content-Type': 'audio/l16',
        },
        body: new Int16Array(buffer.splice(0, buffer.length)),
    });*/
}, 500);
