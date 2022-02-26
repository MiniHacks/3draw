/* eslint-disable no-undef */
AFRAME.registerComponent("scale-on-mouseenter", {
    schema: {
        to: { default: "2.5 2.5 2.5", type: "vec3" },
    },

    init: function () {
        console.log("Hello there!");
        var data = this.data;
        var el = this.el;
        this.el.addEventListener("mouseenter", function () {
            el.object3D.scale.copy(data.to);
        });
    },
});
