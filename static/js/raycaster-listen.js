/* eslint-disable no-undef */
console.log("raycasting");
AFRAME.registerComponent("raycaster-listen", {
    init: function (data) {
        const plane = document.querySelector("#plane");
        plane.addEventListener("raycaster-intersected", (evt) => {
            this.raycastr = evt.detail.el;
        });
        plane.addEventListener("raycaster-intersected-cleared", (evt) => {
            this.raycastr = null;
        });
        this.el.addEventListener("gripdown", (event) => {
            const entity = document.createElement("a-box");
            if (this.intersectionPoint) {
                entity.setAttribute("position", this.intersectionPoint);
            }
            this.el.sceneEl.appendChild(entity);
        });
    },

    tick: function () {
        if (!this.raycaster) {
            this.intersectionPoint = null;
            return;
        } // checks for null
        const plane = document.querySelector("#plane");

        let intersection = this.raycastr.components.raycaster.getIntersection(plane);
        if (!intersection) {
            this.intersectionPoint = null;
            return;
        } // checks if there is no intersection
        this.intersectionPoint = intersection.point;
    },
});
