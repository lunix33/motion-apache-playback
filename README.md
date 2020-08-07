# Motion (Apache) Playback

This is a modification of the Apache directory listing to enable users to playback Motion recordings.

At the moment this project only allow to playback video and doesn't support subdirectories.

If requested, pictures and subdirectories could be added.

## Requirement

You need to have Apache and Motion installed and configured.

Motion needs to ouput files in a web friendly format, we suggest setting `movie_codec` to `mp4`

## Installation

1. Link the `apache.conf` of the project into your system apache configuration.
   This can be done by loading the file from the apache configuration or
	 by using `ln -s` to create a symbolic link into `sites-available` and using `a2ensite` to enable the configuration.
2. Create a symbolic link in your motion video output directory to the project folder as `.listing`.
   eg: `ln -s /home/user/motion-apache-playback /mnt/motion/.listing`
	 In the example `/home/user/motion-apache-playback` is the project Motion Playback project directory and
	 `/mnt/motion` is the directory where all the Motion video files are saved.
3. Modify `apache.conf` to make sure the document root and directory directive are linked to your Motion video directory.
   You also need to modify the port, it need to be 2 port higher than the motion web ui port. Therefore if your Motion web ui port is `8889`, then Motion Playback needs to listen on `8891`.
4. Make sure Apache can read your Motion directory and the project directory, if needs be, you'll need to change those directories permissions.
5. Enjoy!

