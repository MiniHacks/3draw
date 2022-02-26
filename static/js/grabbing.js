/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */

AFRAME.registerComponent("grab-release", {
    // component for grabbing objects and releasing them
    init: function () {
        console.log("grabbing stuff js file loaded");

        // const self = this;

        // this.el.addEventListener("raycaster-intersection", (evt) => {
        //     self.target = evt.detail.el;
        //     self.target.setAttribute("material", "color", "yellow");
        // });

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
        //   */
        // });

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
