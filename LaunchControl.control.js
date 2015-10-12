loadAPI(1);
load("Constants.js");
load("Utils.js");
load("LaunchControl.js");


host.defineController("Novation", "Launch Control", "0.0.1",
                      "7c1c2f16-4698-4acf-9c08-3370bf52af74", "Adam Murray");
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(["Launch Control"], ["Launch Control"]);


var trackBank,
  cursorTrack,
  cursorDevice;


function init() {
  var i;
  host.getMidiInPort(0).setMidiCallback(onMidi);
  host.getMidiInPort(0).setSysexCallback(onSysex);

  trackBank = host.createTrackBank(NUM_CHANNELS, 0, 1);
  for (i = 0; i < NUM_CHANNELS; i++) {
    var track = trackBank.getTrack(i);
    track.getClipLauncher().setIndication(true);
  }
  cursorTrack = host.createArrangerCursorTrack(0, 1);
  cursorDevice = host.createEditorCursorDevice();

  LaunchControl.reset();
}


function exit() {
  LaunchControl.reset();
}


function onMidi(status, data1, data2) {
  var macro,
    deviceControlMode = LaunchControl.isDeviceControlMode(status);

  // printMidi(status, data1, data2);

  if (isNoteOn(status)) {
    // handle pushes of the 8 buttons on bottom

  }
  else if (isChannelController(status)) {
    // handle knob turns and arrow button pushes
    if (LaunchControl.isButtonPressedDown(data2)) {
      switch (data1) {
        case UP_ARROW:
          if (deviceControlMode) {
            cursorDevice.selectPrevious();
          } else {
            trackBank.scrollScenesUp();
          }
          break;

        case DOWN_ARROW:
          if (deviceControlMode) {
            cursorDevice.selectNext();
          } else {
            trackBank.scrollScenesDown();
          }
          break;

        case LEFT_ARROW:
          trackBank.scrollChannelsUp();
          cursorTrack.selectPrevious();
          break;

        case RIGHT_ARROW:
          trackBank.scrollChannelsDown();
          cursorTrack.selectNext();
          break;
      }
    }

    if(deviceControlMode) {
      macro = LaunchControl.macroIndex(data1);
      if (macro != null) {
        cursorDevice.getMacro(macro).getAmount().set(data2, 128);
      }
    }
  }

  // echo back to the device for basic button press support
  sendMidi(status, data1, data2);
}


function onSysex(data) {
  var lcTemplateIndex = data.hexByteAt(7),
    mode;

  // if(lcTemplateIndex < 8) {
  //   println("Launch Control Template: User #" + (lcTemplateIndex+1));
  // }
  // else {
  //   println("Launch Control Template: Factory #" + (lcTemplateIndex-7));
  // }

  switch (lcTemplateIndex) {
    case 8:
      mode = MODES.MIXER;
      break;
    case 9:
      mode = MODES.CLIP_LAUNCH;
      break;
    case 10:
      mode = MODES.DEVICE_CONTROL;
      break;
    default:
      mode = MODES.CUSTOM;
      break;
  }

  if(mode) LaunchControl.onModeChange(mode);
}
