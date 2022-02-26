/* eslint-disable no-undef */
AFRAME.registerComponent("player-info", {
    schema: {
        name: { type: "string", default: "user-" + Math.round(Math.random() * 10000) },
        color: {
            type: "string",
            default: "#" + new THREE.Color(Math.random(), Math.random(), Math.random()).getHexString(),
        },
    },

    init: function () {
        this.head = this.el.querySelector(".head");
        this.nametag = this.el.querySelector(".nametag");
        this.ownedByLocalUser = this.el.id === "local-avatar";
        if (this.ownedByLocalUser) {
            this.nametagInput = document.getElementById("username-overlay");
            this.nametagInput.value = this.data.name;
        }
    },

    listUsers: function () {
        console.log(
            "userlist",
            [...document.querySelectorAll("[player-info]")].map(
                (el) => el.components["player-info"].data.name
            )
        );
    },

    update: function () {
        if (this.head) this.head.setAttribute("material", "color", this.data.color);
        if (this.nametag) this.nametag.setAttribute("value", this.data.name);
    },
});
