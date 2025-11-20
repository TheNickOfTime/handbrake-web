## Presets from HandBrake Desktop

HandBrake Web currently uses presets configured in the desktop application of HandBrake and
exported to .json files to configure encoding jobs. Exported presets can then be uploaded via the web interface in the 'Presets' section.

### Step 1 - Configure & Save Preset

> [!IMPORTANT]
> Make sure your HandBrake (dekstop) version matches the version being used by HandBrake Web for best compatibility & to avoid errors.

1. Use a default preset as a base.
2. Modify the preset to your liking.
3. Save your modified preset by clicking `Save New Preset` next to the preset selection area.

![](/images/readme/readme-preset-save.png)

### Step 2 - Export Preset To File

1. Ensure your desired preset is selected.
2. Click `Presets` in the application's toolbar.
3. Click `Export to file` in the dialog.
4. Save your preset with your desired name and location.

![](/images/readme/readme-preset-export.png)

### Step 3 - Upload Preset To HandBrake Web

1. Go to the `Presets` tab of HandBrake Web's interface.
2. Click `Upload New Preset`.
3. Click `Browse...` and select your preset's `.json` file.
4. Select the category (or create a new category) to organize your preset under.
5. Edit the preset's name if desired.
   - If the preset name _and_ category match a previously exisiting preset, the old preset will be overwritten.
6. Click `Upload`

Your preset from HandBrake will now be available to use in jobs!
