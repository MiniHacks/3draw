class CaptureAudioProcessor extends AudioWorkletProcessor {
  // args necessary?
  constructor(...args) { super(...args); }

  process(input, output, params) {
    if(input.length != 1) console.error("UWU!!");
    this.port.postMessage(input[0]);
    return true;
  }
}

registerProcessor('capture-audio-processor', CaptureAudioProcessor);
