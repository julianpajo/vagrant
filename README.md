#README

###INFO ABOUT THE VM
Vagrantfile built for lanching gui application of Rheticus
It provides:
- ubuntu gui
- google chrome as browser web
- git and git flow
- docker
- nvm
- jdk
- intellij
- vscode


###TIPS FOR CONFIGURE THE VM
depending on the machine in use, it is recommended to change the values of the memory dedicated to the vm:
- change the vb.memory attribute to 8048 if your machine has >16gb of physical RAM,
- change the VRAM_MB to 256 if your machine has a decent graphic card.


###Working locally
- create repositery for vm 
- in cygwin execute "cd (name of repo)" and initialize the vm
    - execute  "vagrant init ubuntu/focal64"
- copy the content of Vagrantfile in the Vagrantfile in your local repositery
- execute "vagrant up" to start the vm


