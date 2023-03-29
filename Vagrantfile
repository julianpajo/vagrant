  VRAM_MB="128"
  VBOX_GRAPHIC_CONTROLLER="vboxsvga"

Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/focal64"

  config.vm.provider :virtualbox do |vb|
    vb.gui = true
    vb.memory = 4024
    vb.customize ["modifyvm", :id, "--paravirtprovider", "hyperv"]
    vb.customize ["modifyvm", :id, "--vram",VRAM_MB]
    vb.customize ["modifyvm", :id, "--clipboard-mode","bidirectional"]
    vb.customize ["modifyvm", :id, "--draganddrop","bidirectional"]
    vb.customize ["modifyvm", :id, "--graphicscontroller",VBOX_GRAPHIC_CONTROLLER]
  end

  # Currently "ubuntu/focal64" on VirtualBox requires `type: "virtualbox"`
  # to make synced folder works.
  config.vm.synced_folder ".", "/vagrant", type: "virtualbox"

  config.vm.boot_timeout = 600

  config.vm.provision "shell", preserve_order: true , inline: <<-SHELL

  # setup keyboard
  setxkbmap it
  echo "setxkbmap it" >> ~/.bashrc

  # set timezone
  sudo timedatectl set-timezone Europe/Rome
  sudo timedatectl set-ntp on

  # Update repositories
  sudo apt-get update -y
  sudo apt update -y

  # Upgrade installed packages
  sudo apt-get upgrade -y
  sudo apt upgrade -y

  # Add Google Chrome repository
  wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub|sudo apt-key add -
  sudo sh -c 'echo \"deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main\" > /etc/apt/sources.list.d/google.list'

  # Add desktop environment
  sudo apt-get install -y --no-install-recommends ubuntu-desktop
  sudo apt-get install -y --no-install-recommends virtualbox-guest-dkms virtualbox-guest-utils virtualbox-guest-x11
 
  # Add `vagrant` to Administrator
  sudo usermod -a -G sudo vagrant

  # Add Google Chrome
  sudo apt-get install -y google-chrome-stable

  # DOCKER
  config.vm.provision :docker
  sudo snap install docker
  sudo chmod 666 /var/run/docker.sock

  # GIT
  sudo apt-get install -y git
  sudo apt-get install git-flow

  # NVM
  curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
  nvm install --lts

  # JDK
  sudo apt-get install -y default-jdk

  # INTELLIJ
  sudo apt-get install vim apt-transport-https curl wget software-properties-common
  sudo add-apt-repository ppa:mmk2410/intellij-idea -y
  sudo apt-get install intellij-idea-community -y

  # VSCODE
  sudo apt-get install software-properties-common apt-transport-https wget -y
  wget -O- https://packages.microsoft.com/keys/microsoft.asc | sudo gpg --dearmor | sudo tee /usr/share/keyrings/vscode.gpg
  echo deb [arch=amd64 signed-by=/usr/share/keyrings/vscode.gpg] https://packages.microsoft.com/repos/vscode stable main | sudo tee /etc/apt/sources.list.d/vscode.list
  sudo apt-get install code


  # USE TERMINAL WITHOUT SUDO (LOGIN AS ROOT)
  echo "sudo -i" >> .bashrc
  
  SHELL

end