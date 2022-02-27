/* eslint-disable no-undef */
AFRAME.registerComponent("spawner", {
    init: function () {
        console.log("added event listener");
        this.el.addEventListener("click", this.createVoxel.bind(this));
        NAF.connection.subscribeToDataChannel("clear", this.clear.bind(this));
        this.el.addEventListener("bbuttondown", this.clear.bind(this));
    },
    clear: function () {
        document.querySelectorAll(".voxl").forEach((el) => el.remove());
    },
    createVoxel: function (evt) {
        console.log("CREATE VOXEL", evt.detail);
        if (evt.detail.intersection.distance < 0.1) return;
        const newVoxelEl = document.createElement("a-entity");

        newVoxelEl.setAttribute("mixin", "voxel");
        newVoxelEl.classList.add("voxl");

        const normal = evt.detail.intersection.face.normal;
        normal.multiplyScalar(0.25);
        const position = evt.detail.intersection.point;
        position.add(normal);

        newVoxelEl.setAttribute("position", position);

        this.el.parentElement.parentElement.parentElement.appendChild(newVoxelEl);
    },
});
