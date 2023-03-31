# Currently this project does not build with Node 19+
$env:PATH = "/opt/homebrew/opt/node@18/bin/:"  + $env:PATH;

rm -r node_modules && yarn install && yarn build:chrome
echo "If this produced no output files, run 'yarn dev:chrome' for more verbose messages."
