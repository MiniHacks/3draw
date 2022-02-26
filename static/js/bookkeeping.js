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

    let el = document.querySelector("#am-i-the-host");
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

const chooseNWords = (k) => {
    const result = Array(k);
    [...Array(k).keys()].forEach((i) => {
        result[i] = wordList[i];
    });

    let W = Math.exp(Math.log(Math.random()) / k);

    const n = wordList.length;
    for (let i = 0; i < n; i++) {
        i = i + Math.floor(Math.log(Math.random()) / Math.log(1 - W)) + 1;
        if (i <= n) {
            result[Math.floor(Math.random() * k)] = wordList[i - 1];
            W = W * Math.exp(Math.log(Math.random()) / k);
        }
    }
    return result;
};

const startgame = () => {
    console.log("someone is trying to start the game!");
    // pick a word
    bookkeeping.availableWords = chooseNWords(3);

    // change turn state
    bookkeeping.turnState = TurnState.CHOOSING;
    bookkeeping.gameState = GameState.PLAYING;

    // start timer (networked)
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
