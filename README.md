# Bitwig LaunchControl

This is a [Bitwig Studio](http://www.bitwig.com) controller script for the
[Novation LaunchControl](http://global.novationmusic.com/launch/launch-control).

It reproduces the
[LaunchControl's Ableton Live features](http://global.novationmusic.com/sites/default/files/novation/downloads/7375/launch-control-ableton-live-guide.pdf)
inside of Bitwig Studio.

See [Bitwig's controller scripts page](http://www.bitwig.com/en/community/control_scripts.html) for more info.


## Setup

1. Download [bitwig-launch-control.zip](https://github.com/adamjmurray/bitwig-launch-control/archive/master.zip)
2. Unzip in:
    * Windows: `%USERPROFILE%\Documents\Bitwig Studio\Controller Scripts\ `
    * Mac: `~/Documents/Bitwig Studio/Controller Scripts/`
    * Linux: `~/Bitwig Studio/Controller Scripts/`
3. Start / restart Bitwig Studio
4. Plug in your LaunchControl
5. Go to Bitwig Preferences &rarr; Controllers
6. Click "Detect Available Controllers".
    * The LaunchControl should appear automatically. If not, try adding it manually.

Problems? See [Bitwig's Control Script Installation Guide](http://www.bitwig.com/en/community/control_scripts/installation_guide)


## Usage

This script reproduces the LaunchControl's behavior for Ableton Live inside Bitwig Studio.
See the [LaunchControl's' manual for Ableton Live](http://global.novationmusic.com/sites/default/files/novation/downloads/7375/launch-control-ableton-live-guide.pdf)
for usage instructions.


## Known Issues and Limitations

* Can't scroll to master track in device control mode.

* Send scrolling is buggy if you delete a *named* send.
  Appears to be a bug in Bitwig that may clear up in the future.

* Sometimes the first attempt to switch the Factory Template (AKA mode) doesn't work.
  Workaround: Switch to another template and back to the one you want.


## Changelog

| Version | Release&nbsp;Date | Notes |
| ------- | ------------ | ----- |
| 1.0     | coming soon | Initial Release. Reproduces the LaunchControl's Ableton Live features.


## TODOs:

* More button display feedback
  - light up arrow buttons when scrolling is possible, no need to light on press
  - In clip launcher, probably want active/non-active lighting and blinking when queueing up start (or even stop)?

* Document additional features beyond the Ableton Live features. Does device control mode in Live display device
  enabled state on the LaunchControl? I don't think you can toggle the device on and off either.

* Investigate bug with deleting named sends (see known issues). Might need to report bug to Bitwig support.

* Investigate: trackBank.addSendCountObserver() doesn't seem to work.

* Investigate: trackBank.scrollSendsUp() / Down() doesn't seem to work.
