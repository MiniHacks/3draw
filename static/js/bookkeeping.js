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

let bookkeeping = {
    currentWord: "",
    totalNumberOfRounds: 5,
    currentRoundNumber: 0,
    turnOrder: [],
    currentPlayerInTurn: 0,
    timeRemaining: 150.0,
    turnState: TurnState.CHOOSING,
    gameState: GameState.STARTING,
    amITheHost: true,
    hostSince: Date.now()
};

const setBookkeeping = (newValue) => {
    // FIXME: makes it difficult to change the host in the middle of the game
    newValue.amITheHost = bookkeeping.amITheHost;

    bookkeeping = newValue;
    if (bookkeeping.amITheHost) {
        NAF.connection.broadcastDataGuaranteed("bookkeepingUpdates", {
            youAreNotTheHost: true,
            bookkeeping,
        });
    }

    let el = document.querySelector("#am-i-the-bookkeeper");
    if (el) {
        el.innerHTML = bookkeeping.amITheHost ? "yes" : "no!";
    }
};

// wait for body to load
window.onload = () => {
    document.body.addEventListener("clientConnected", function (evt) {
        console.log("told someoneone they are not hthe host");
        if (bookkeeping.amITheHost) {
            NAF.connection.broadcastDataGuaranteed("bookkeepingUpdates", {
                youAreNotTheHost: [true, bookkeeping.hostSince],
                bookkeeping,
            });
        }
    });
};

NAF.connection.subscribeToDataChannel("bookkeepingUpdates", function(senderId, dataType, data, targetId) {
    if (data.youAreNotTheHost[0] && data.youAreNotTheHost[1] < bookkeeping.hostSince) {
        // i am not the host!
        console.log("i am not the host");
        bookkeeping.amITheHost = false;
        setBookkeeping(data.bookkeeping);
    } else {
        // stupid client trying to tell us that we are not the host
        // even though we are
    }
});
