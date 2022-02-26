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

AFRAME.registerComponent("bookkeeping", {
    schema: {
        currentWord: { type: "string" },
        totalNumberOfRounds: { type: "int", default: 5 },
        currentRoundNumber: { type: "int", default: 0 },
        turnOrder: { type: "array" },
        currentPlayerInTurn: { type: "int" },
        timeRemaining: { type: "number", default: 150 },
        turnState: { type: "string", default: TurnState.CHOOSING },
        gameState: { type: "string", default: GameState.STARTING },
    },
    init: function () {
        console.log("initing the bookkeeping component");
    },
    update: function (oldData) {
        console.log("the old data was ", oldData);
        console.log("as opposed to the new data, which is", this.data);
    },
    remove: function () {
        console.log("goodbye!");
    },
});
