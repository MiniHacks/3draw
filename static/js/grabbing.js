/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
const VALID_INTERSECTION_FILTERS = [
    (el) => {
        return el.tagName === "A-BOX";
    },
];
AFRAME.registerComponent("grab-release", {
    // component for grabbing objects and releasing them
    init: function () {
        console.log("grabbing stuff js file loaded");

        const self = this;
        this.el.addEventListener("raycaster-intersection", (evt) => {
            self.targets = evt.detail.els.filter((el) => VALID_INTERSECTION_FILTERS.some((func) => func(el)));
            if (self.targets.length) {
                self.targets[0].setAttribute("material", "color", "green");
                console.log(self.targets);
            }
            // self.target.setAttribute("material", "color", "yellow");
        });

        // this.el.addEventListen("raycaster-intersection-cleared", () => {
        //     self.target = null;
        // });

        // this.el.addEventListen("raycaster-closest-entity-changed", (evt) => {
        //     self.target = evt.detail.el;
        // });

        // // grip pressed - user grabs object
        // this.el.addEventListener("triggerdown", function () {
        //     if (!self.target) {
        //         return;
        //     }
        //     self.target.setAttribute("material", "color", "yellow");
        //     /*
        //   self.target.setAttribute("position", {x: idk, y: idk, z: idk})
        // }

        // grip released - user drops object
        // this.el.addEventListener("triggerup", function () {});
    },

    // checking for updates in object's location
    // new location = origin + distance * direction
    // tick: function () {
    //     if (!this.Object) {
    //         return;
    //     }
    // },
});
