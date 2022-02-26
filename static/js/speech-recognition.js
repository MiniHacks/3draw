const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechRecognitionGrammarList || window.webkitSpeechGrammarList;

const recognition = new SpeechRecognition();

const words = ["banana", "apple", "kiwi"];
const grammar = "#JSGF V1.0; grammar words; public <word> = " + Array.from(words).join(" | ") + " ;";

const speechRecognitionList = new SpeechGrammarList();
speechRecognitionList.addFromString(grammar, 1); // 1 is the maximum weight

recognition.grammars = speechRecognitionList;
recognition.lang = "en-US";
recognition.continuous = true;
recognition.interimResults = true; // half-baked answers are best, lower latency but a bit spammy
recognition.maxAlternatives = 3; // could up this and parse all to be friendlier

recognition.start();
console.log("Initiated recognition.");

const checkForWord = (phrase, answer) => phrase.includes(answer);

recognition.onresult = (e) => {
    const target_word = "test";

    const transcripts = Array.from(e.results);
    // list of strings with most recent transcriptions
    const most_recent_results = Array.from(transcripts[transcripts.length - 1]);
    most_recent_results.forEach((el) => {
        // TODO: more things here
        // console.log(el.transcript)
        if (checkForWord(el.transcript, target_word)) {
            console.log(`Found ${target_word} in ${el.transcript}`);
        }
    });
};
