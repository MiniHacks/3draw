# [3draw](https://3draw.live/)
*Finally, something to do with your VR headset! (friends sold separately.). * 
## Develop

To run: 
- install [`cloudflared`](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/#macos)
- **copy the cert.pem in Discord to `~/.cloudflared/` (you may need to rename it to cert.pem or cert.cer)**
- install packages with `yarn install`
- run `yarn start -h <name>`
- live-reloading website will be available at `https://<name>.3draw.live`
  - you may still need to refresh the static html though, it's only hot-reloading the server
## Inspiration
<!-- blend purpose with bold -->
Half of our team recently won VR headsets at a previous hackathon. Eventually, the novelty of [*Beat Saber*](https://www.oculus.com/experiences/rift/1304877726278670/), [*Gorilla Tag*](https://www.oculus.com/experiences/quest/4979055762136823/) and other somewhat dubious activities wore off so we decided to make something ourselves, drawing inspiration from various party games.

**3Draw is the latest in a long series of thing-drawing games like [skribbl.io](skribbl.io) or [Gartic Phone](https://garticphone.com/).** We stand out via our chaotic, AI-powered, voice-chat guessing system and largely dysfunctional artistic tools. Try it yourself at [3draw](https://3draw.live) , I'm not going to tell you how it works! (if you have a headset and friends to play with that is, our demo video will suffice otherwise.)

## Implementation
<!-- flex docker or something -->
Usually we'd flex the complicated `docker-compose` architecture here. We ended up having a pleasantly vanilla project:

 ![This is a joke](https://cdn.discordapp.com/attachments/912563509773099071/947363690993319956/unknown.png)
 
*Thanks to our resident Nix enthusiast, `yarn.nix` dominated the line count but the human written code was (nearly) all HTML, CSS and JS.*

We used **Cloudflare Tunnels** for both testing and deploy which we had set up in the first 14 seconds of hacking, it was extremely convenient. We used **WebXR**, interfacing with it through the batteries-included (though dated) **A-Frame** framework. We used **RTC** to communicate between A-Frame instances via **Networked A-Frame** (NAF) and an **EasyRTC** instance. 3D modeling work was done in **Blender**, we borrowed a castle from [here](https://sketchfab.com/3d-models/medieval-castle-with-village-5109b5e46e064790badecedf8f6d2ef6) (attribution!). To manage state, we created a chimera of various techniques that could be (generously) described as an amalgamation of **MVC** (fattest controllers you've ever seen) and **React**.

Voice chat was conveyed over RTC (as were most things) but speech-to-text was a nightmare. The original plan was to use the **Web Speech API**, we thought the **Webkit** prefixed version would be available since **Oculus** headsets are glorified Android devices and their browser is based on **Chromium** under the hood. Apparently somewhere along the chain the assumptions broke down. Part of our team spent about 8 hours trying to implement a client-side **TensorFlow.js** model for limited-vocabulary recognition, effectively reverse engineering the Web Speech API. We needed a model that would be easy to train and extremely low latency so leveraging **word embeddings** was an obvious plan, until it wasn't. Object guesses did not appear in ordinary contexts and it seems that SOTA techniques for limited-vocabulary detection are now much more sophisticated with pipelines of several models. As such, we turned to the omniscient **GCP Cloud Speech API** and had incredible difficulty streaming audio to it in a low latency manner.

## What's Next
<!-- avoid saying `rm rf` -->

Probably actually playing it in a setting other than (hackathon-induced-)stress testing. If it's fun, perhaps we'll flesh it out a bit more. `rm -rf` will suffice otherwise.

## Citations
<!-- IEEE or bust, bring out the ArXiV -->
[1]

I. McGraw _et al._, “Personalized Speech recognition on mobile devices,” _arXiv:1603.03185 [cs]_, Mar. 2016, Accessed: Feb. 26, 2022. [Online]. Available: [http://arxiv.org/abs/1603.03185](http://arxiv.org/abs/1603.03185)

[2]

P. Warden, “Speech Commands: A Dataset for Limited-Vocabulary Speech Recognition,” _arXiv:1804.03209 [cs]_, Apr. 2018, Accessed: Feb. 26, 2022. [Online]. Available: [http://arxiv.org/abs/1804.03209](http://arxiv.org/abs/1804.03209)

[3]

J. Shor _et al._, “Towards Learning a Universal Non-Semantic Representation of Speech,” _Interspeech 2020_, pp. 140–144, Oct. 2020, doi: [10.21437/Interspeech.2020-1242](https://doi.org/10.21437/Interspeech.2020-1242).
