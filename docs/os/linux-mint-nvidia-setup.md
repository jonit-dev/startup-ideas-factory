### Installing and Locking NVIDIA Drivers on Linux Mint

This tutorial will guide you through the steps to install the latest NVIDIA drivers on Linux Mint, ensure they are configured correctly, and lock the driver version to prevent future updates from affecting your setup. Additionally, we will cover how to disable Secure Boot and handle potential black screen issues during the first boot.

#### Step 1: Disable Secure Boot

Disabling Secure Boot is necessary for NVIDIA drivers to function correctly on Linux Mint.

1. Restart your computer and enter the BIOS/UEFI settings (usually by pressing `F2`, `F10`, `F12`, `Del`, or `Esc` during startup).
2. Navigate to the Secure Boot option and disable it.
3. Save the changes and exit the BIOS/UEFI settings.

#### Step 2: Handle Black Screen on First Boot

If you encounter a black screen during the first boot of Linux Mint, follow these steps:

1. When you see the GRUB menu, press `e` to edit the boot options.
2. Find the line that starts with `linux` and add `nomodeset` at the end of that line.
3. Press `Ctrl + X` or `F10` to boot with these options.

This should allow you to boot into Linux Mint and proceed with the installation of NVIDIA drivers.

#### Step 3: Remove Existing NVIDIA Drivers

Ensure that any existing NVIDIA drivers are completely removed:

```bash
sudo apt-get purge 'nvidia-*'
sudo apt-get autoremove
sudo apt-get update
```

#### Step 4: Add the NVIDIA PPA

Add the NVIDIA PPA to get access to the latest drivers:

```bash
sudo add-apt-repository ppa:graphics-drivers/ppa
sudo apt-get update
```

#### Step 5: Install the Latest Stable NVIDIA Driver

Install the latest recommended NVIDIA driver (version 530):

```bash
sudo apt-get install nvidia-driver-530
```

#### Step 6: Reboot Your System

After installing the driver and disabling Secure Boot, reboot your system:

```bash
sudo reboot
```

#### Step 7: Verify Installation

Once your system has rebooted, verify that the NVIDIA driver is correctly installed:

```bash
nvidia-smi
```

#### Step 8: Lock the NVIDIA Driver Version

To prevent the NVIDIA driver from being updated in the future, lock the package version using `apt-mark`:

```bash
sudo apt-mark hold nvidia-driver-530
```

You can verify that the package is on hold by running:

```bash
apt-mark showhold
```

### Additional Configuration for Multiple Monitors

If you have multiple monitors, you might need to configure them using `nvidia-settings` or manually edit the `xorg.conf` file.

#### Use NVIDIA X Server Settings

1. Open the NVIDIA X Server Settings application:

   ```bash
   sudo nvidia-settings
   ```

2. Configure your monitors under the “X Server Display Configuration” section.
3. Apply and save the configuration to the X configuration file.

#### Manually Edit Xorg Configuration (if necessary)

1. Open the `xorg.conf` file for editing:

   ```bash
   sudo nano /etc/X11/xorg.conf
   ```

2. Add or adjust the following configuration to ensure both monitors are set up correctly:

   ```plaintext
   Section "ServerLayout"
       Identifier     "Layout0"
       Screen      0  "Screen0" 0 0
       Screen      1  "Screen1" RightOf "Screen0"
       InputDevice    "Keyboard0" "CoreKeyboard"
       InputDevice    "Mouse0" "CorePointer"
   EndSection

   Section "Files"
   EndSection

   Section "InputDevice"
       Identifier     "Mouse0"
       Driver         "mouse"
   EndSection

   Section "InputDevice"
       Identifier     "Keyboard0"
       Driver         "kbd"
   EndSection

   Section "Monitor"
       Identifier     "Monitor0"
       VendorName     "Unknown"
       ModelName      "Unknown"
       Option         "DPMS"
   EndSection

   Section "Monitor"
       Identifier     "Monitor1"
       VendorName     "Unknown"
       ModelName      "Unknown"
       Option         "DPMS"
   EndSection

   Section "Device"
       Identifier     "Device0"
       Driver         "nvidia"
       VendorName     "NVIDIA Corporation"
       BusID          "PCI:4:00:0"
       Screen         0
   EndSection

   Section "Device"
       Identifier     "Device1"
       Driver         "nvidia"
       VendorName     "NVIDIA Corporation"
       BusID          "PCI:2B:00:0"
       Screen         1
   EndSection

   Section "Screen"
       Identifier     "Screen0"
       Device         "Device0"
       Monitor        "Monitor0"
       DefaultDepth    24
       SubSection     "Display"
           Depth       24
           Modes      "1920x1080"
       EndSubSection
   EndSection

   Section "Screen"
       Identifier     "Screen1"
       Device         "Device1"
       Monitor        "Monitor1"
       DefaultDepth    24
       SubSection     "Display"
           Depth       24
           Modes      "1920x1080"
       EndSubSection
   EndSection
   ```

3. Restart the X server to apply the changes:

   ```bash
   sudo service lightdm restart
   ```

### Conclusion

By following these steps, you should be able to install and configure the latest NVIDIA drivers on Linux Mint, disable Secure Boot, handle potential black screen issues, and lock the driver version to prevent future updates from affecting your setup. If you encounter any issues, refer to the Linux Mint forums for community support and additional troubleshooting tips【55†source】【56†source】【57†source】.
