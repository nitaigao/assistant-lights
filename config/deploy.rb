require 'mina/git'

set :domain, '192.168.2.81'
set :deploy_to, '/home/pi/lights'
set :repository, 'https://github.com/nkostelnik/assistant-lights.git'
set :node_version, 'node-v0.10.24-linux-arm-armv6j-vfp-hard'
set :shared_paths, ['node_modules', 'log', 'config']
set :user, 'pi'

task :environment do
  queue "PATH=$PATH:/home/pi/node/bin"
end

task :system => :environment do
  queue! %[wget https://gist.github.com/raw/3245130/v0.10.24/#{node_version}.tar.gz]
  queue! %[tar zxvf #{node_version}.tar.gz]
  queue! %[rm #{node_version}.tar.gz]
  queue! %[ln -s #{node_version} node]
  queue! %[npm install -g forever]
end

task :setup => :environment do
  queue! %[mkdir -p "#{deploy_to}/shared/log"]
  queue! %[chmod g+rx,u+rwx "#{deploy_to}/shared/log"]

  queue! %[mkdir -p "#{deploy_to}/shared/node_modules"]
  queue! %[chmod g+rx,u+rwx "#{deploy_to}/shared/node_modules"]

  queue! %[mkdir -p "#{deploy_to}/shared/config"]
  queue! %[chmod g+rx,u+rwx "#{deploy_to}/shared/config"]
end

task :service => :environment do
  queue! %[sudo rm -f /etc/init.d/lights]
  queue! %[sudo ln -s #{deploy_to}/current/services/lights /etc/init.d/lights]
  queue! %[chmod +x /etc/init.d/lights]
  queue! %[sudo update-rc.d /etc/init.d/lights defaults]
end

task :npm => :environment do
  queue "cd #{deploy_to}/current && npm install"
end

desc "Deploys the current version to the server."
task :deploy => :environment do
  deploy do
    invoke :'git:clone'
    invoke :'deploy:link_shared_paths'

    to :launch do
      invoke :'npm'
      queue "forever stopall"
      queue "NODE_ENV=production forever start #{deploy_to}/current/index.js"
    end
  end
end
