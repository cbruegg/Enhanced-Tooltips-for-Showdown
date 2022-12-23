# Currently this project does not build with Node 19+
$env:PATH = "/opt/homebrew/opt/node@18/bin/:"  + $env:PATH;

yarn install && yarn build:chrome
