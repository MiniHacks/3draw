AFRAME.registerComponent("raycaster-listen", {
    init: function () {
        // Use events to figure out what raycaster is listening so we don't have to
        // hardcode the raycaster.
        this.el.addEventListener("raycaster-intersected", (evt) => {
            this.raycaster = evt.detail.el;
        });
        this.el.addEventListener("raycaster-intersected-cleared", (evt) => {
            this.raycaster = null;
        });
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        this.el.addEventListener("gripdown", function (event) {
            // console.log(event);
            // const box = document.querySelector("#boxy");
            // box.setAttribute("material", "color", "yellow");
            const entity = document.createElement("a-box");
            console.log(self.intersectionPoint);
            entity.setAttribute("position", { x: 0, y: 0, z: Math.floor(Math.random() * 20) });
            self.el.sceneEl.appendChild(entity);
        });
    },

    tick: function () {
        if (!this.raycaster) {
            return;
        } // Not intersecting.

        let intersection = this.raycaster.components.raycaster.getIntersection(this.el);
        if (!intersection) {
            return;
        }
        this.intersectionPoint = intersection.point;
    },
});
