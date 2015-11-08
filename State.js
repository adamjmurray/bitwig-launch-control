var State = {

  mode: null,

  selectedTrack: {
    index: -1
  },

  selectedDevice: {
    name: ""
  },

  trackBank: {
    startIndex: -1,
    trackCount: -1,
    existsStates: [],
    activatedStates: [],
    clipColors: []
  },


  isMixerMode: function() {
    return this.mode === MODES.MIXER;
  },

  isClipLaunchMode: function() {
    return this.mode === MODES.CLIP_LAUNCH;
  },

  isDeviceControlMode: function() {
    return this.mode === MODES.DEVICE_CONTROL;
  }

};
