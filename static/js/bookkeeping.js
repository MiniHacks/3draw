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

Object.seal(TurnState);
Object.seal(GameState);

let wordList = ["arms", "legs", "laptop", "basketball", "baseball"];

// seed with actual full word list
(async () => {
    let res = await fetch("/word_list.json");
    wordList = await res.json();
})();

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

const setBookkeeping = (newValue) => {
    // FIXME: makes it difficult to change the host in the middle of the game
    newValue.amITheHost = bookkeeping.amITheHost;

    bookkeeping = newValue;
    if (bookkeeping.amITheHost) {
        NAF.connection.broadcastDataGuaranteed("bookkeepingUpdates", {
            youAreNotTheHost: [true, bookkeeping.hostSince],
            bookkeeping,
        });
        console.log("sent ", bookkeeping);
    }

    let el = document.querySelector("#am-i-the-bookkeeper");
    if (el) {
        el.innerHTML = `${bookkeeping.amITheHost ? "yes" : "no!"} -- timer remaining: ${
            bookkeeping.timeRemaining
        }`;
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

NAF.connection.subscribeToDataChannel("bookkeepingUpdates", function (senderId, dataType, data, targetId) {
    if (
        !bookkeeping.amITheHost ||
        (data.youAreNotTheHost[0] && data.youAreNotTheHost[1] < bookkeeping.hostSince)
    ) {
        // i am not the host!
        console.log("i am not the host");
        bookkeeping.amITheHost = false;
        setBookkeeping(data.bookkeeping);
    } else {
        // stupid client trying to tell us that we are not the host
        // even though we are
        console.log("should not fire often");
        console.log(data.youAreNotTheHost, bookkeeping.hostSince);
    }
});

const chooseFromWordList = () => wordList[Math.floor(Math.random() * wordList.length)];

const startgame = () => {
    console.log("someone is trying to start the game!");
    // 1. pick a word
    const availableWords = [chooseFromWordList(), chooseFromWordList(), chooseFromWordList()];
    bookkeeping.availableWords = availableWords;

    // 3. change turn state
    bookkeeping.turnState = TurnState.CHOOSING;
    bookkeeping.gameState = GameState.PLAYING;

    // 2. start timer
    rxjs.timer(0, 1000)
        .pipe(
            rxjs.operators.take(bookkeeping.timeRemaining),
            rxjs.operators.tap((secondsElapsed) => {
                bookkeeping.timeRemaining -= 1;
                setBookkeeping(bookkeeping);
            })
        )
        .subscribe();
};
