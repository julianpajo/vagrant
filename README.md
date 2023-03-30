## Rheticus_GUI Vagrantfile

The Vagrantfile allows you to create a VM Ubuntu 20.04.06 LTS with some utilities and tools.

## INFO ABOUT THE VM

Vagrantfile built for lanching gui application of Rheticus
It provides:
- ubuntu gui
- google chrome as browser web
- git and git flow
- docker and docker compose
- nvm
- npm
- node
- jdk
- intellij
- vscode


## TIPS FOR THE CONFIG OF THE VM

depending on the machine in use, it is recommended to change the values of the memory dedicated to the vm:
- change the vb.memory attribute to 8048 if your machine has >=16gb of physical RAM,
- change the VRAM_MB to 256 if your machine has a decent graphic card.


## Provisioning

In the `Rheticus_GUI` directory open a terminal and execute the follow command:

```bash
$ mkdir Rheticus_GUI
$ cd Rheticus_GUI
```

Download in this directory the Vagrantfile and execute the follow command to start the vm:
```bash
$ vagrant up
```
It may take a few minutes to start.

At the first start, it is possible that in the virtualbox screen it is necessary to insert username and password.
username: vagrant
password: vagrant

Wait until the provisioning is done, then restart the vm (close the virtualbox screen and redo 'vagrant up').


