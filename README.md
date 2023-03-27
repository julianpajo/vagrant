#README

###Working locally
- create repositery for vm 
- in cygwin execute "cd (name of repo)" and initialize the vm
    - execute  "vagrant init ubuntu/focal64"
- copy the content of Vagrantfile in the Vagrantfile in your local repositery
- execute "vagrant up" to start the vm

###IN VM
- install NPM & NODEJS
  nvm install --lts

  verify the installation 
    -npm -v && node -v

