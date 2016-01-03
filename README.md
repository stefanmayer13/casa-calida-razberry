# Homecomfort
This small programm will connect your RazBerry to the Homecomfort servers.
The installation is easy.

Connect to your raspberry pi and ensure you have nodejs installed. Then type:

- `npm i -g -p homecomfort`
- Create your config.js file (wherever you want). Take a look at the config.example.js to see how it should look like.
- Create your token on the homecomfort page and set it in your config file.
- Have a username and password for a admin user of z-wave me ready.
- Start the programm with `homecomfort config=[path to your config] username=[z-wave username] password=[z-wave password]`
