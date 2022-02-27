/* eslint-disable no-undef */
AFRAME.registerComponent("tracked-vr-hands", {
    onEnterVR() {
        if (AFRAME.utils.device.isMobile()) return; // exclude e.g. cardboard, which lacks tracked controllers
        if (document.getElementById("my-tracked-right-hand")) return; // don't add them in more than once!
        ["left", "right"].forEach((side) => {
            const el = document.createElement("a-entity");
            el.setAttribute("networked", {
                template: `#${side}-hand-template`,
                attachTemplateToLocal: false,
            });
            el.setAttribute("id", `my-tracked-${side}-hand`);
            if (side === "left") {
                el.setAttribute("hand-controls", { hand: side });
                el.setAttribute("joystick-levitation", true);
                el.setAttribute("teleport-controls", {
                    type: "parabolic",
                    button: "trigger",
                    curveShootingSpeed: 10,
                    cameraRig: "#camera-rig",
                    teleportOrigin: "#local-avatar",
                });
            } else if (side === "right") {
                el.setAttribute("laser-controls", { hand: "right", model: true });
                // el.setAttribute("raycaster-listen", true);
                el.setAttribute("spawner", true);
            }

            this.el.appendChild(el);
        });
    },
    init() {
        this.el.sceneEl.addEventListener("enter-vr", this.onEnterVR.bind(this));
    },
});
