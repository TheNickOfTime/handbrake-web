## Presets from HandBrake Desktop

HandBrake Web currently uses presets configured in the desktop application of HandBrake and
exported to .json files to configure encoding jobs. Exported presets can then be uploaded via the web interface in the 'Presets' section.

### Step 1 - Configure & Save Preset

> [!IMPORTANT]
> Make sure your HandBrake (dekstop) version matches the version being used by HandBrake Web for best compatibility & to avoid errors.

1. Use a default preset as a base.
2. Modify the preset to your liking.
3. Save your modified preset by clicking `Save New Preset` next to the preset selection area.

![](images/docs/presets/preset-save.png)

### Step 2 - Export Preset To File

1. Ensure your desired preset is selected.
2. Click `Presets` in the application's toolbar.
3. Click `Export to file` in the dialog.
4. Save your preset with your desired name and location.

![](images/docs/presets/preset-export.png)

### Step 3 - Upload Preset To HandBrake Web

1. Go to the `Presets` tab of HandBrake Web's interface.
2. Click `Upload New Preset`.
3. Click `Browse...` and select your preset's `.json` file.
4. Select the category (or create a new category) to organize your preset under.
5. Edit the preset's name if desired.
   - If the preset name _and_ category match a previously exisiting preset, the old preset will be overwritten.
6. Click `Upload`.

![](images/docs/presets/preset-upload.png)

Your preset from HandBrake will now be available to use in jobs!

### Troubleshooting

#### Hardware Accelerated Encoding Preset Creation

On the desktop application, HandBrake intelligently hides default presets _and_ configuration options that pertain to hardware encoding that your current system does not support. Chances are that if you are using this application, your host device is headless/does not have a desktop environment that you can access the desktop version of HandBrake Web on. So how do you make the necessary presets? Here are a few workaround options to consider (until I can manage to implement the preset creation interface in HandBrake Web):

##### Use [jlesage/docker-handbrake](https://github.com/jlesage/docker-handbrake) (Recommended)

This project uses a different approach to using HandBrake on headless devices via a web browser. In simple terms, it uses something akin to VNC/remote desktop to display the desktop version of HandBrake in your browser. This project also supports hardware accelerated encoding, so you can:

- Deploy the [jlesage/docker-handbrake](https://github.com/jlesage/docker-handbrake) image on your desired host machine.
- Create your preset with the necessary hardware accelerated encoding options.
- Export the preset to a mapped volume on your host machine.
- Transfer the preset file to your client device, and upload it to HandBrake Web.

##### Temporarily Boot a Live ISO

Many Linux distributions provide live ISO files that can be run/tested prior to installation. It's less than ideal (all of these work around are), but you could temporarily boot one of these, and install HandBrake on it and attempt to create the preset for your hardware from there. It should be noted that that this has not been tested, but should be technically possible.
