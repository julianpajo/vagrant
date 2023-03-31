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

  config.vm.provision "shell", preserve_order: true , privileged: false, inline: <<-SHELL

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

  # Add desktop environment
  sudo apt-get install -y --no-install-recommends ubuntu-desktop
  sudo apt-get install -y --no-install-recommends virtualbox-guest-dkms virtualbox-guest-utils virtualbox-guest-x11
 
  # Add `vagrant` to Administrator
  sudo usermod -a -G sudo vagrant

  # GOOGLE CHROME
  wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub|sudo apt-key add -
  sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
  sudo apt-get update 
  sudo apt-get install google-chrome-stable -y

  # DOCKER & DOCKER-COMPOSE
  sudo apt-get update
  sudo apt-get install \
    ca-certificates \
    curl \
    gnupg

  sudo mkdir -m 0755 -p /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update
  sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y
  sudo groupadd docker
  sudo usermod -aG docker $USER
  sudo curl -SL https://github.com/docker/compose/releases/download/v2.17.2/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose

  # GIT
  sudo apt-get install -y git
  sudo apt-get install git-flow

  # NVM, NPM, NODE
  curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
  source $HOME/.nvm/nvm.sh
  nvm install --lts

  # JDK
  sudo apt-get install -y default-jdk

  # INTELLIJ
  sudo apt-get install vim apt-transport-https curl wget software-properties-common
  sudo add-apt-repository ppa:mmk2410/intellij-idea -y
  sudo apt-get install intellij-idea-community -y

  # VSCODE
  sudo apt-get install wget gpg
  wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
  sudo install -D -o root -g root -m 644 packages.microsoft.gpg /etc/apt/keyrings/packages.microsoft.gpg
  sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
  rm -f packages.microsoft.gpg
  sudo apt install apt-transport-https
  sudo apt update
  sudo apt install code -y

  # USE TERMINAL WITHOUT SUDO (LOGIN AS ROOT)
  echo "sudo -i" >> .bashrc
  
  SHELL

end