/* eslint-disable no-undef */
AFRAME.registerComponent("raycaster-listen", {
    init: function (data) {
        const plane = document.querySelector("#plane");
        plane.addEventListener("raycaster-intersected", (evt) => {
            // console.log(Object.values(evt.detail.el));
            this.raycaster = evt.detail.el;
        });
        plane.addEventListener("raycaster-intersected-cleared", (evt) => {
            this.raycaster = null;
        });
        const self = this;
        this.el.addEventListener("gripdown", function (event) {
            const entity = document.createElement("a-box");
            console.log(self.intersectionPoint);
            if (self.intersectionPoint) {
                entity.setAttribute("position", self.intersectionPoint);
            }
            self.el.sceneEl.appendChild(entity);
        });
    },

    tick: function () {
        if (!this.raycaster) {
            this.intersectionPoint = null;
            return;
        } // checks for null
        const plane = document.querySelector("#plane");

        let intersection = this.raycaster.components.raycaster.getIntersection(plane);
        if (!intersection) {
            this.intersectionPoint = null;
            return;
        } // checks if there is no intersection
        this.intersectionPoint = intersection.point;
    },
});
