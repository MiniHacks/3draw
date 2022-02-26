/* eslint-disable @typescript-eslint/no-this-alias */
AFRAME.registerComponent("spawn-primitive", {
    // Init lifecycle method fires upon initialization of component.
    init: function () {
        let self = this;
        console.log("spawn-primitive loads!");

        self.el.addEventListener("click", function (e) {
            // point clicked (intersection point)
            console.log(e.detail.intersection.point);

            // creates box entity
            var entity = document.createElement("a-box");

            // puts the box at the point clicked
            entity.setAttribute("position", e.detail.intersection.point);

            // adds the box to the scene
            self.el.sceneEl.appendChild(entity);
        });
    },
});
