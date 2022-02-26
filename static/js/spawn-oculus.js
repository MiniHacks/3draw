AFRAME.registerComponent("spawn-oculus", {
    init: function () {
        const self = this;
        console.log("Listening for oculus spawns!");
        this.el.addEventListener("gripdown", function (event) {
            // console.log(event);
            // const box = document.querySelector("#boxy");
            // box.setAttribute("material", "color", "yellow");
            const entity = document.createElement("a-box");
            console.log(event);
            entity.setAttribute("position", { x: 0, y: 0, z: Math.floor(Math.random() * 20) });
            self.el.sceneEl.appendChild(entity);
        });
    },
});
