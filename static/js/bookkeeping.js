const TurnState = {
    CHOOSING: "choosing",
    DRAWING: "drawing",
};

const GameState = {
    STARTING: "starting",
    PLAYING: "playing",
    BREAK: "break",
    FINISHED: "finished",
};

Object.freeze(TurnState);
Object.freeze(GameState);

let wordList = ["arms", "legs", "laptop", "basketball", "baseball"];

// seed with actual full word list
(async () => {
    let res = await fetch("/word_list.json");
    wordList = (await res.json()).words;
})();

const CHOOSING_TIME = 15;
const DRAWING_TIME = 150;

let ourNetworkId = null;
let hostId = null;

let bookkeeping = {
    currentWord: "",
    availableWords: [],
    totalNumberOfRounds: 5,
    currentRoundNumber: 0,
    turnOrder: [],
    currentPlayerInTurn: 0,
    timeRemaining: 150.0,
    turnState: TurnState.CHOOSING,
    gameState: GameState.STARTING,
    amITheHost: true,
    hostSince: Date.now(),
};

const DataChannel = {
    BOOKKEEPING_UPDATES: "bookkeepingUpdates",
    CHOSE_WORD: "choseWord",
};
Object.freeze(DataChannel);

const setBookkeeping = (newValue) => {
    // FIXME: makes it difficult to change the host in the middle of the game
    newValue.amITheHost = bookkeeping.amITheHost;

    bookkeeping = newValue;
    if (bookkeeping.amITheHost) {
        NAF.connection.broadcastDataGuaranteed(DataChannel.BOOKKEEPING_UPDATES, {
            youAreNotTheHost: [true, bookkeeping.hostSince],
            bookkeeping,
        });
        console.log("sent ", bookkeeping);
    }

    updateState();

    let el = document.querySelector("#am-i-the-host");
    if (el) {
        el.innerHTML = `${bookkeeping.amITheHost ? "yes" : "no!"} -- timer remaining: ${
            bookkeeping.timeRemaining
        } ${bookkeeping.turnOrder[bookkeeping.currentPlayerInTurn] === ourNetworkId ? "we are up!" : ""}`;
    }
};

const updateState = () => {
    if (ourNetworkId == bookkeeping.turnOrder[bookkeeping.currentPlayerInTurn]) {
        // our turn
        if (bookkeeping.turnState == TurnState.CHOOSING) {
            // we need to choose
        } else {
            // we need to draw the word
        }
    } else {
        // not our turn
        if (bookkeeping.turnState == TurnState.DRAWING) {
            // we need to guess the word
        }
    }
};

const addPlayer = (clientId) => {
    bookkeeping.turnOrder.unshift(clientId);
    setBookkeeping(bookkeeping);
};

const removePlayer = (clientId) => {
    bookkeeping.turnOrder = bookkeeping.turnOrder.filter((e) => e != clientId);
    setBookkeeping(bookkeeping);
};

// wait for body to load
window.onload = () => {
    document.body.addEventListener("connected", function (evt) {
        ourNetworkId = evt.detail.clientId;
        bookkeeping.turnOrder.unshift(ourNetworkId);
        document.querySelector("#whoami").innerHTML = ourNetworkId;
    });

    document.body.addEventListener("clientConnected", function (evt) {
        if (bookkeeping.amITheHost) {
            addPlayer(evt.detail.clientId);
        }
    });

    document.body.addEventListener("clientDisconnected", function (evt) {
        if (bookkeeping.amITheHost) {
            removePlayer(evt.detail.clientId);
        }
    });
};

NAF.connection.subscribeToDataChannel(
    DataChannel.BOOKKEEPING_UPDATES,
    function (senderId, dataType, data, targetId) {
        if (
            !bookkeeping.amITheHost ||
            (data.youAreNotTheHost[0] && data.youAreNotTheHost[1] < bookkeeping.hostSince)
        ) {
            // i am not the host!
            console.log("i am not the host");
            bookkeeping.amITheHost = false;
            hostId = senderId;
            setBookkeeping(data.bookkeeping);
        } else {
            // stupid client trying to tell us that we are not the host
            // even though we are
            console.log("should not fire often");
            console.log(data.youAreNotTheHost, bookkeeping.hostSince);
        }
    }
);

const chooseFromWordList = () => wordList[Math.floor(Math.random() * wordList.length)];

const chooseNWords = (n) => {
    let retSet = new Set();
    while (retSet.size < n) {
        retSet.add(chooseFromWordList());
    }
    return [...retSet.values()];
};

const chooseAWord = (word) => {
    NAF.connection.sendDataGuaranteed(hostId, DataChannel.CHOSE_WORD, { chosenWord: word });
};

const countDownFromTimeRemaining = () =>
    rxjs.timer(0, 1000).pipe(
        rxjs.operators.takeWhile(() => bookkeeping.timeRemaining > 0),
        rxjs.operators.tap((secondsElapsed) => {
            bookkeeping.timeRemaining -= 1;
            setBookkeeping(bookkeeping);
        })
    );

const startgame = async () => {
    console.log("someone is trying to start the game!");

    const choosableWords = chooseNWords(3);
    // tell person to pick a word
    bookkeeping.availableWords = choosableWords;

    // change turn state
    bookkeeping.gameState = GameState.PLAYING;
    bookkeeping.turnState = TurnState.CHOOSING;
    bookkeeping.timeRemaining = CHOOSING_TIME;

    const waitForWordChoiceReply = new rxjs.Observable((observer) => {
        NAF.connection.subscribeToDataChannel(
            DataChannel.CHOSE_WORD,
            (senderId, dataType, data, targetId) => {
                observer.next(data);
                observer.complete();

                NAF.connection.unsubscribeToDataChannel(DataChannel.CHOSE_WORD);
            }
        );
    });

    // start timer for choosing a word (networked)
    const { chosenWord } = await rxjs.lastValueFrom(
        rxjs.race(
            // If they exceed the time limit, then pick the first word for them
            countDownFromTimeRemaining().pipe(
                rxjs.operators.last(),
                rxjs.operators.mapTo({ chosenWord: choosableWords[0] })
            ),
            waitForWordChoiceReply
        )
    );

    // now we have chosen a word
    console.log("the chosen word was ", chosenWord);

    // move to next phase
    bookkeeping.currentWord = chosenWord;
    bookkeeping.timeRemaining = DRAWING_TIME;
    bookkeeping.turnState = TurnState.DRAWING;

    countDownFromTimeRemaining().subscribe();
};
