/* global AFRAME THREE */
console.log("Initiating speech recognition");
console.log(window.SpeechRecognition);

const SpeechRecognition = window.SpeechRecognition;
const SpeechGrammarList = window.SpeechRecognitionGrammarList;

const recognition = new SpeechRecognition();
const speechRecognitionList = new SpeechGrammarList();


recognition.start();
console.log("Initiated recognition.");
