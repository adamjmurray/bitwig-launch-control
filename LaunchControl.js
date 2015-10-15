var LaunchControl = {

  mode: null,
  modeChannel: null,


  reset: function () {
    for (var i = 0; i < 16; i++) {
      sendMidi(176 + i, 0, 0);
    }
    this.setMode(MODES.MIXER);
  },


  setMode: function (mode) {
    var templateByte;
    switch (mode) {
      case MODES.MIXER:
        templateByte = "08";
        break;
      case MODES.CLIP_LAUNCH:
        templateByte = "09";
        break;
      case MODES.DEVICE_CONTROL:
        templateByte = "0a";
        break;
    }
    sendSysex("f0002029020a77" + templateByte + "f7");
    this.onModeChange(mode);
  },


  onModeChange: function (mode) {
    var i;

    this.mode = mode;
    switch(mode) {
      case MODES.MIXER:
        this.modeChannel = 8;
        break;
      case MODES.CLIP_LAUNCH:
        this.modeChannel = 9;
        break;
      case MODES.DEVICE_CONTROL:
        this.modeChannel = 10;
        break;
    }

    host.showPopupNotification("Mode: " + mode);

    var deviceControlMode = (mode === MODES.DEVICE_CONTROL);
    for (i = 0; i < CHANNELS; i++) {
      cursorDevice.getMacro(i).getAmount().setIndication(deviceControlMode);
    }
  },


  isMixerMode: function (status) {
    // 3 possible status values for knobs, button down, button up
    // return status === 184 || status === 136 || status === 152;
    // return status & 0x0F === 8;
    return this.mode === MODES.MIXER;
  },

  isClipLaunchMode: function (status) {
    // return status === 185 || status === 137 || status === 153;
    return this.mode === MODES.CLIP_LAUNCH;
  },

  isDeviceControlMode: function (status) {
    // return status === 186 || status === 138 || status === 154;
    return this.mode === MODES.DEVICE_CONTROL;
  },


  macroIndex: function (data1) {
    if (data1 >= 21 && data1 <= 24) {
      return data1 - 21;
    }
    else if (data1 >= 41 && data1 <= 44) {
      // macro indexes 4-7
      return data1 - 37;
    }
  },

  knobIndexFirstRow: function (data1) {
    if (data1 >= 21 && data1 <= 28) {
      return data1 - 21;
    }
  },

  knobIndexSecondRow: function (data1) {
    if (data1 >= 41 && data1 <= 48) {
      return data1 - 41;
    }
  },


  buttonIndex: function (data1) {
    if (data1 >= 9 && data1 <= 12) {
      return data1 - 9;
    }
    else if (data1 >= 25 && data1 <= 28) {
      return data1 - 21;
    }
  },


  isButtonPressedDown: function (data2) {
    return data2 > 0;
  },


  setButton: function (index, red, green) {
    var data1,
      data2 = this.color(red, green);
    if(index < 4) {
      data1 = index + 9;
    }
    else {
      data1 = index + 21;
    }
    sendNoteOn(this.modeChannel, data1, data2);
  },


  /**
   * Calculate color value for use with LaunchPad.setButton(index,color)
   * @param red 0.0 - 1.0 (off - brightest)
   * @param green 0.0 - 1.0 (off - brightest)
   */
  color: function(red, green) {
    var color = 16 * Math.round(3 * green) + Math.round(3 * red) + 12;

    if(color <= 12 && (red > 0 || green > 0)) {
      return 13; // return dim red instead of 'off' when there should be some color
    }
    else {
      return color;
    }
  }
};
