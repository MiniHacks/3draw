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
const SHORT_BREAK_TIME = 5;
const LONG_BREAK_TIME = 15;

let ourNetworkId = null;
let hostId = null;

let bookkeeping = {
    currentWord: "",
    obscuredWord: "",
    availableWords: null,
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

const wordChooserBS = new rxjs.BehaviorSubject(null);
const wordDisplayBS = new rxjs.BehaviorSubject("");

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

    let describeGameState;
    switch (bookkeeping.gameState) {
        case GameState.FINISHED:
            describeGameState = "game over!";
            break;
        case GameState.STARTING:
            describeGameState = "starting";
            break;
        case GameState.BREAK:
            describeGameState = "intermission";
            break;
        case GameState.PLAYING:
            describeGameState = `round ${bookkeeping.currentRoundNumber}/${bookkeeping.totalNumberOfRounds} --`;
            switch (bookkeeping.turnState) {
                case TurnState.CHOOSING:
                    describeGameState += "choosing word";
                    break;
                case TurnState.DRAWING:
                    describeGameState += "guessing word";
                    break;
            }
    }
    let el = document.querySelector("#am-i-the-host");
    if (el) {
        el.innerHTML = ` ${bookkeeping.amITheHost ? "(host!)" : ""} -- timer remaining: ${
            bookkeeping.timeRemaining
        } (${describeGameState}) ${
            bookkeeping.turnOrder[bookkeeping.currentPlayerInTurn] === ourNetworkId ? "we are up!" : ""
        }`;
    }
};

const updateState = () => {
    const state = {
        wordsToChoose: null,
        word: "",
    };

    if (ourNetworkId == bookkeeping.turnOrder[bookkeeping.currentPlayerInTurn]) {
        // our turn
        if (bookkeeping.turnState == TurnState.CHOOSING) {
            // we need to choose
            state.wordsToChoose = bookkeeping.availableWords;
        } else {
            state.word = bookkeeping.currentWord;
            // we need to draw the word
        }
    } else {
        // not our turn
        if (bookkeeping.turnState == TurnState.DRAWING) {
            // we need to guess the word
            state.word = bookkeeping.obscuredWord;
        }
    }

    wordChooserBS.next(state.wordsToChoose);
    wordDisplayBS.next(state.word);
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
window.addEventListener("load", () => {
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

    wordChooserBS.subscribe({
        next: (v) => {
            console.log("word chooser bs subscriber -- ", v);
            if (!v) {
                document.querySelector("#wordchooser").classList.add("hidden");
            } else {
                console.log("yuh");
                document.querySelector("#wordchooser").classList.remove("hidden");
                document.querySelectorAll("#wordchooser > button").forEach((el, idx) => {
                    el.innerHTML = bookkeeping.availableWords[idx];
                    el.onclick = () => chooseAWord(bookkeeping.availableWords[idx]);
                });
            }
        },
    });

    wordDisplayBS.subscribe({
        next: (txt) => (document.querySelector("#worddisplay").innerHTML = txt),
    });
});

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
            hideStartGameBtn();
        } else {
            // stupid client trying to tell us that we are not the host
            // even though we are
            console.log("should not fire often");
            console.log(data.youAreNotTheHost, bookkeeping.hostSince);
        }
    }
);

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

const hostWordChooserSubject = new rxjs.Subject();

const chooseAWord = (word) => {
    if (bookkeeping.amITheHost) {
        hostWordChooserSubject.next({ chosenWord: word });
    } else {
        NAF.connection.sendDataGuaranteed(hostId, DataChannel.CHOSE_WORD, { chosenWord: word });
    }
};

const countDownFromTimeRemaining = () =>
    rxjs.timer(0, 1000).pipe(
        rxjs.operators.takeWhile(() => bookkeeping.timeRemaining > 0),
        rxjs.operators.tap((secondsElapsed) => {
            bookkeeping.timeRemaining -= 1;
            setBookkeeping(bookkeeping);
        })
    );

const rungame = async () => {
    hideStartGameBtn();

    console.log("someone is trying to start the game!");
    for (
        bookkeeping.currentRoundNumber = 0;
        bookkeeping.currentRoundNumber < bookkeeping.totalNumberOfRounds;
        bookkeeping.currentRoundNumber += 1
    ) {
        for (
            bookkeeping.currentPlayerInTurn = 0;
            bookkeeping.currentPlayerInTurn < bookkeeping.turnOrder.length;
            bookkeeping.currentPlayerInTurn += 1
        ) {
            bookkeeping.obscuredWord = bookkeeping.currentWord;
            bookkeeping.availableWords = null;
            bookkeeping.timeRemaining = SHORT_BREAK_TIME;
            bookkeeping.gameState = GameState.BREAK;
            await rxjs.lastValueFrom(countDownFromTimeRemaining());

            //// PHASE 1: Choose word ////
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
                    waitForWordChoiceReply,
                    hostWordChooserSubject.pipe(rxjs.operators.first())
                )
            );

            // now we have chosen a word
            console.log("the chosen word was ", chosenWord);

            //// PHASE 2: Guessing ////
            bookkeeping.currentWord = chosenWord;
            bookkeeping.timeRemaining = DRAWING_TIME;
            bookkeeping.turnState = TurnState.DRAWING;

            rxjs.timer(0, Math.floor((DRAWING_TIME / 3) * 1000))
                .pipe(
                    // progressively reveal 1 or 2 letters (need 1 extra to reveal 0 letters)
                    rxjs.operators.take(bookkeeping.currentWord.length < 5 ? 2 : 3),
                    rxjs.operators.scan((acc, num_revealed_letters) => {
                        while (acc.size < num_revealed_letters) {
                            acc.add(Math.floor(Math.random() * bookkeeping.currentWord.length));
                        }
                        return acc;
                    }, new Set()),
                    rxjs.operators.map((idxes_to_show) =>
                        bookkeeping.currentWord.replaceAll(/./g, (char, idx) => {
                            if (idxes_to_show.has(idx)) {
                                return `${char} `;
                            } else {
                                return `_ `;
                            }
                        })
                    )
                )
                .subscribe({
                    next: (newObscured) => {
                        console.log("updating obscured word");
                        bookkeeping.obscuredWord = newObscured;
                    },
                });

            await rxjs.lastValueFrom(countDownFromTimeRemaining());

            // TODO: assign points or something?
        }
        bookkeeping.obscuredWord = bookkeeping.currentWord;
        bookkeeping.availableWords = null;
        bookkeeping.timeRemaining = LONG_BREAK_TIME;
        bookkeeping.gameState = GameState.BREAK;
        await rxjs.lastValueFrom(countDownFromTimeRemaining());
    }
    bookkeeping.currentWord = "";
    bookkeeping.availableWords = null;
    bookkeeping.timeRemaining = LONG_BREAK_TIME;
    bookkeeping.gameState = GameState.FINISHED;
    setBookkeeping(bookkeeping);

    showStartGameBtn();
};

const hideStartGameBtn = () => {
    document.querySelector("#start-game").classList.add("hidden");
    document.querySelector("#start-game").setAttribute("disabled", "true");
};

const showStartGameBtn = () => {
    document.querySelector("#start-game").classList.remove("hidden");
    document.querySelector("#start-game").setAttribute("disabled", "false");
};
