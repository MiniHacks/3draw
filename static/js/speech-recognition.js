/* global AFRAME THREE */
console.log("Initiating speech recognition");
console.log(window.SpeechRecognition);

const recognition = window.SpeechRecognition;
//const SpeechGrammarList = window.SpeechRecognitionGrammarList;

//const recognition = new SpeechRecognition();
//const speechRecognitionList = new SpeechGrammarList();

recognition.lang = "en-US";
recognition.continuous = true;
recognition.interimResults = true; // half-baked answers are best
recognition.maxAlternatives = 1;

recognition.start();
console.log("Initiated recognition.");

recognition.onresult = (e) => {
    console.log(e.results[0][0].transcript);
    console.log(e)
};
