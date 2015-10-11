loadAPI(1);
host.defineController("Novation", "Launch Control", "0.0.1",
                      "7c1c2f16-4698-4acf-9c08-3370bf52af74", "Adam Murray");
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(["Launch Control"], ["Launch Control"]);


var trackBank,
  cursorTrack,
  cursorDevice,

  UP_ARROW = 114,
  DOWN_ARROW = 115,
  LEFT_ARROW = 116,
  RIGHT_ARROW = 117,
  NUM_TRACKS = 8;


function init() {
  var i;
  resetLaunchControl();

  host.getMidiInPort(0).setMidiCallback(onMidi);
  host.getMidiInPort(0).setSysexCallback(onSysex);

  trackBank = host.createTrackBank(NUM_TRACKS, 0, 1);

  for (i = 0; i < NUM_TRACKS; i++) {
    var track = trackBank.getTrack(i);
    track.getClipLauncher().setIndication(true);
  }

  cursorTrack = host.createArrangerCursorTrack(0, 1);

  cursorDevice = host.createEditorCursorDevice();

  for (i = 0; i < NUM_TRACKS; i++) {
    cursorDevice.getMacro(i).getAmount().setIndication(true);
  }
}


function exit() {
  resetLaunchControl();
}


//------------------------------------------------------------------------------
// MIDI input handlers

function onMidi(status, data1, data2) {
  // printMidi(status, data1, data2);

  var macro,
    deviceControlMode = isDeviceControlMode(status);

  if (isButtonPressedDown(data2)) {
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

      default:
        macro = macroIndex(data1);
        if (macro != null) {
          cursorDevice.getMacro(macro).getAmount().set(data2, 128);
        }
    }
  }

  // echo back to the device for basic button press support
  sendMidi(status, data1, data2);
}


function onSysex(data) {
  var lcTemplateIndex = data.hexByteAt(7);
  // if(lcTemplateIndex < 8) {
  //   println("Launch Control Template: User #" + (lcTemplateIndex+1));
  // }
  // else {
  //   println("Launch Control Template: Factory #" + (lcTemplateIndex-7));
  // }
  switch (lcTemplateIndex) {
    case 8:
      setMode("mixer");
      break;
    case 9:
      setMode("clip launch");
      break;
    case 10:
      setMode("device control");
      break;
    default:
      setMode("custom");
      break;
  }
}


//------------------------------------------------------------------------------
// Launch Control Interface

function resetLaunchControl() {
  for (var i = 0; i < 16; i++) {
    sendMidi(176 + i, 0, 0);
  }
}


function setMode(m) {
  host.showPopupNotification("Mode: " + m);
}


function isMixerMode(status) {
  // 3 possible status values for knobs, button down, button up
  return status === 184 || status === 136 || status === 152;
}

function isClipLaunchMode(status) {
  return status === 185 || status === 137 || status === 153;
}

function isDeviceControlMode(status) {
  return status === 186 || status === 138 || status === 154;
}


function macroIndex(data1) {
  if (data1 >= 21 && data1 <= 24) {
    return data1 - 21;
  }
  else if (data1 >= 41 && data1 <= 44) {
    // macro indexes 4-7
    return data1 - 37;
  }
}


function isButtonPressedDown(data2) {
  return data2 > 0;
}


//------------------------------------------------------------------------------
// Utils

function printProperties(obj) {
  println(obj);
  for (var prop in obj) {
    try {
      println(' * ' + prop + (obj[prop] instanceof Function ? '()' : ''));
    }
    catch (err) {
      // some properties are prohibited from accessing
      // println(prop + ': ' + err);
    }
  }
}
