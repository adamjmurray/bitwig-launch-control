/* TODOs:

 - Better handling for adding/removing effect tracks (i.e. send track selection state in mixer mode)

 - Document additional features beyond the Ableton Live features. Does device control mode in Live display device
   enabled state on the LaunchControl? I don't think you can toggle the device on and off either.

 - In clip launcher, try making buttons light up differently for active/non-active states,
   and when queueing up start (and possibly stop)

 - Investigate cursorTrack.addCanSelectPreviousObserver vs cursorTrack.addCanSelectNextObserver.
   It seems like canSelectNext behaves exactly like canSelectPrevious

 - Investigate bug with deleting named sends (see known issues). Might need to report bug to Bitwig support.

 - Investigate: trackBank.addSendCountObserver() doesn't seem to work.

 _ Investigate: trackBank.scrollSendsUp() / Down() doesn't seem to work.

*/

var
  UP_ARROW = 114,
  DOWN_ARROW = 115,
  LEFT_ARROW = 116,
  RIGHT_ARROW = 117,

  MODES = {
    MIXER: "mixer",
    CLIP_LAUNCH: "clip launch",
    DEVICE_CONTROL: "device control",
    CUSTOM: "custom"
  },

  CHANNELS = 8,

  trackBank,
  effectTrackBank,
  cursorTrack,
  cursorDevice,
  notificationSettings,

  NONEXISTANT = "___nonexistant___";


loadAPI(1);
load("State.js");
load("Utils.js");
load("Events.js");
load("LaunchControl.js");


host.defineController("Novation", "Launch Control", "1.0.2",
  "7c1c2f16-4698-4acf-9c08-3370bf52af74", "Adam Murray");
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(["Launch Control"], ["Launch Control"]);


function init() {
  var i,
    track,
    clipLauncherSlots;

  host.getMidiInPort(0).setMidiCallback(Events.onMidi);
  host.getMidiInPort(0).setSysexCallback(Events.onSysex);

  trackBank = host.createTrackBank(CHANNELS, 256, 1);
  effectTrackBank = host.createEffectTrackBank(1, 1);
  cursorTrack = host.createArrangerCursorTrack(0, 1);
  cursorDevice = host.createEditorCursorDevice();

  for (i = 0; i < CHANNELS; i++) {
    track = trackBank.getTrack(i);
    clipLauncherSlots = track.getClipLauncherSlots();

    track.isActivated().addValueObserver(Events.observeTrackActivated(i));
    track.exists().addValueObserver(Events.observeTrackExists(i));
    clipLauncherSlots.setIndication(true);
    clipLauncherSlots.addColorObserver(Events.observeClipLauncherSlotsColor(i));
  }

  cursorTrack.addPositionObserver(Events.onSelectedTrackIndexChange);
  // these 2 callbacks don't seem to work correctly, so we rely on the selected track index and track count instead
  //cursorTrack.addCanSelectPreviousObserver(Events.onCanSelectPreviousTrackChange);
  //cursorTrack.addCanSelectNextObserver(Events.onCanSelectNextTrackChange);

  cursorDevice.addNameObserver(128, NONEXISTANT, Events.onSelectedDeviceNameChange);
  cursorDevice.addIsEnabledObserver(Events.onSelectedDeviceEnabledChange);
  cursorDevice.addCanSelectPreviousObserver(Events.onCanSelectPreviousDeviceChange);
  cursorDevice.addCanSelectNextObserver(Events.onCanSelectNextDeviceChange);

  trackBank.addChannelScrollPositionObserver(Events.onTrackBankPositionChange, -1);
  trackBank.addChannelCountObserver(Events.onTrackCountChange);
  trackBank.addCanScrollChannelsUpObserver(Events.onCanScrollTracksUpChange);
  trackBank.addCanScrollChannelsDownObserver(Events.onCanScrollTracksDownChange);
  trackBank.addCanScrollScenesUpObserver(Events.onCanScrollScenesUpChange);
  trackBank.addCanScrollScenesDownObserver(Events.onCanScrollScenesDownChange);
  // send scroll state in mixer mode is a custom implementation because it can wrap-around
  // trackBank.addCanScrollSendsUpObserver(Events.onCanScrollSendsUpChange);
  // trackBank.addCanScrollSendsDownObserver(Events.onCanScrollSendsDownChange);

  // TODO: I think we should be able to use addSendCountObserver() but it doesn't seem to work!
  effectTrackBank.addChannelCountObserver(Events.onEffectTrackCountChange);

  notificationSettings = host.getNotificationSettings();
  notificationSettings.setShouldShowValueNotifications(true);
  // Automatic device selection notifications don't seem to work when changing tracks, so I just
  // implemented it myself. See Events.onSelectedDeviceNameChange()
  // notificationSettings.setShouldShowDeviceSelectionNotifications(true);
  notificationSettings.getUserNotificationsEnabled().addValueObserver(Events.onUserNotificationsEnabledChange);

  LaunchControl.reset(true);
}


function exit() {
  LaunchControl.reset(false);
}


//function flush() {
//  // println('in flush!');
//}
