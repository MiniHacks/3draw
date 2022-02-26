AFRAME.registerComponent("joystick-levitation", {
    init: function () {
        this.el.addEventListener("thumbstickmoved", this.logThumbstick);
    },
    logThumbstick: function (event) {
        const person = document.querySelector("#player");
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
