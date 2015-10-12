var LaunchControl = {

  reset: function () {
    for (var i = 0; i < 16; i++) {
      sendMidi(176 + i, 0, 0);
    }
    LaunchControl.setMode(MODES.MIXER);
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

    LaunchControl.onModeChange(mode);
  },


  onModeChange: function (mode) {
    host.showPopupNotification("Mode: " + mode);

    var deviceControlMode = (mode === MODES.DEVICE_CONTROL);
    for (i = 0; i < NUM_CHANNELS; i++) {
      cursorDevice.getMacro(i).getAmount().setIndication(deviceControlMode);
    }
  },


  isMixerMode: function (status) {
    // 3 possible status values for knobs, button down, button up
    return status === 184 || status === 136 || status === 152;
  },

  isClipLaunchMode: function (status) {
    return status === 185 || status === 137 || status === 153;
  },

  isDeviceControlMode: function (status) {
    return status === 186 || status === 138 || status === 154;
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
  }

};
