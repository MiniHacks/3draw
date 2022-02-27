AFRAME.registerComponent("overlay", {
    dependencies: ["material"],
    init: function () {
        this.el.sceneEl.renderer.sortObjects = true;
        this.el.object3D.renderOrder = 100;
        this.el.components.material.material.depthTest = false;
    },
});
