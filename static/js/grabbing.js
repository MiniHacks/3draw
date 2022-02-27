/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
const VALID_INTERSECTION_FILTERS = [
    (el) => {
        return el.tagName === "A-BOX";
    },
];

let MOVING_TARGET = null;
let DEFAULT_ROTATION = null;
let DEFAULT_POSITION = null;
let DISTANCE = null;
let RAYCASTER = null;

AFRAME.registerComponent("grab-release", {
    // component for grabbing objects and releasing them
    init: function () {
        console.log("grabbing stuff js file loaded");

        const self = this;
        this.el.addEventListener("raycaster-intersection", (evt) => {
            self.raycaster = this.el;
            RAYCASTER = this.el;
            self.targets = evt.detail.els.filter((el) => VALID_INTERSECTION_FILTERS.some((func) => func(el)));
        });

        // // grip pressed - user grabs object
        this.el.addEventListener("triggerdown", function () {
            if (!self.targets.length) {
                return;
            }
            self.movingTarget = self.targets[0];
            MOVING_TARGET = self.targets[0];
            let intersection = RAYCASTER.components.raycaster.getIntersection(MOVING_TARGET);
            DISTANCE = intersection.distance;
            const hand = document.querySelector("#my-tracked-right-hand");
            DEFAULT_ROTATION = JSON.parse(JSON.stringify(hand.getAttribute("rotation")));
            DEFAULT_POSITION = JSON.parse(JSON.stringify(hand.getAttribute("position")));
            self.targets[0].setAttribute("material", "color", "yellow");
        });

        // grip released - user drops object
        this.el.addEventListener("triggerup", function () {
            if (self.movingTarget) {
                self.movingTarget.setAttribute("material", "color", "white");
            }
            self.movingTarget = null;
            MOVING_TARGET = null;
            DISTANCE = null;
            DEFAULT_ROTATION = null;
            DEFAULT_POSITION = null;
        });
    },

    // checking for updates in object's location
    // new location = origin + distance * direction
    tick: function () {
        if (!MOVING_TARGET) {
            return;
        }
        const hand = document.querySelector("#my-tracked-right-hand");
        const rotation = hand.getAttribute("rotation");
        const deltaYDeg = DEFAULT_ROTATION.y - rotation.y;
        console.log(deltaYDeg);
        const deltaX = DISTANCE * Math.cos((deltaYDeg * Math.PI) / 180) - DISTANCE * Math.cos(Math.PI / 2);
        const deltaZ = DISTANCE * Math.sin((deltaYDeg * Math.PI) / 180) - DISTANCE * Math.sin(Math.PI / 2);
        const { x, y, z } = DEFAULT_POSITION;
        // console.log({ x: x + deltaX, y, z: z + deltaZ });
        MOVING_TARGET.setAttribute("position", { x: x + deltaX, y, z: z + deltaZ });
    },
});
