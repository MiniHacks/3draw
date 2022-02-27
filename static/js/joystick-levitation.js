AFRAME.registerComponent("joystick-levitation", {
    init: function () {
        this.el.addEventListener("thumbstickmoved", this.logThumbstick);
    },
    logThumbstick: function (event) {
        if (event.target.id.includes("right")) return;
        const person = document.querySelector("#camera-rig");
        const { x, y, z } = person.getAttribute("position");
        if (event.detail.y > 0.8) {
            if (y > -20) {
                person.setAttribute("position", { x, y: y - 0.1, z });
            }
        }
        if (event.detail.y < -0.8) {
            if (y < 20) {
                person.setAttribute("position", { x, y: y + 0.1, z });
            }
        }
    },
});
