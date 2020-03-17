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
    * Windows: `%USERPROFILE%\Documents\Bitwig Studio\Controller Scripts\`
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

- A maximum of 256 send tracks are supported.


## Feature Requests

Have a feature request?
Open an issue on [this script's github project](https://github.com/adamjmurray/bitwig-launch-control/issues)
and I'll consider it.


## Changelog

| Version | Release&nbsp;Date | Notes |
| ------- | ------------ | ----- |
| 1.0.2   | March 16, 2020 | Fixed error that could occur when changing to clip launch mode
| 1.0.1   | June 13, 2017 | Fixed changing send amounts to send tracks 3 and higher
| 1.0     | December 1, 2015 | Initial Release. Reproduces the LaunchControl's Ableton Live features.

The current version of this project is a 1.0 release candidate. It should be perfectly useable.


## License

This software is released under [the MIT license](https://en.wikipedia.org/wiki/MIT_License).
See [license.txt](https://github.com/adamjmurray/bitwig-launch-control/blob/master/license.txt).
Basically, do whatever you want with it. The developers are not liable for any issues encountered.
