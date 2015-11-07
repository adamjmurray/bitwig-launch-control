var LaunchControl = {

  channel: null,


  reset: function () {
    for (var i = 0; i < 16; i++) {
      sendMidi(176 + i, 0, 0);
    }
    this.selectTemplate(8); // mixer mode
    Events.onModeChange(MODES.MIXER);
  },


  selectTemplate: function (index) {
    if (!(index >= 0 && index < 16)) return;
    var templateByte = "0" + index.toString(16);
    this.channel = index;
    sendSysex("f0002029020a77" + templateByte + "f7");
  },


  // TODO: collapse these 3 into a single function
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


  /**
   * Set a (bottom row) button color to indicate a track is activated or not
   */
  displayTrackActivated: function (index, isActivated) {
    var color = isActivated ? 1 : 0.25;
    LaunchControl.setButton(index, color, color);
  },


  /**
   * Set a (bottom row) button color approximating the raw red,green,blue values from Bitwig
   */
  displayClipColor: function (index, red, green, blue) {
    // use exponential range to coerce low values to 0
    this.setButton(index, red * red, green * green);
  },


  /**
   * Set a (bottom row) button's red and green LEDs. Values can go from 0.0 - 1.0
   */
  setButton: function (index, red, green) {
    var data1,
      data2 = this.color(red, green);
    if(index < 4) {
      data1 = index + 9;
    }
    else {
      data1 = index + 21;
    }
    sendNoteOn(this.channel, data1, data2);
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
  },


  refreshButtons: function () {
    var i, rgb;
    for (i = 0; i < CHANNELS; i++) {
      if (State.isMixerMode()) {
        LaunchControl.displayTrackActivated(i, State.trackBank.activatedStates[i]);
      }
      else if (State.isClipLaunchMode()) {
        rgb = State.trackBank.clipColors[i];
        LaunchControl.displayClipColor(i, rgb[0], rgb[1], rgb[2]);
      }
    }
  }
};
