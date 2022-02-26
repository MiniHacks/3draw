/* eslint-disable no-undef */
AFRAME.registerComponent("isteleporter", {
    schema: { type: "string" },

    init: function () {
        console.log("TP LISTENER ADDED", this.el);
        const usersMap = {};

        // Fired when a networked entity is created
        document.body.addEventListener("entityCreated", function (evt) {
            const networkedComponent = evt.detail.el.getAttribute("networked");
            usersMap[networkedComponent.creator] = {
                networkId: networkedComponent.networkId,
                el: evt.detail.el,
            };
        });

        // Fired when another client disconnects from you
        document.body.addEventListener("clientDisconnected", function (evt) {
            if (usersMap[evt.detail.clientId]) delete usersMap[evt.detail.clientId];
        });

        window.users = usersMap;
        this.el.addEventListener("teleported", (event) => {
            // vectors
            const { oldPosition, newPosition } = event.detail;

            console.log("TPED", oldPosition, newPosition);
            console.log(this.el.object3D.position);
            this.el.object3D.position.copy(newPosition);
            console.log(this.el.object3D.position);
        });
    },
});
