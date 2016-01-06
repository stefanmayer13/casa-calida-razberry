# Casa-Calida-RaZberry
This small programm will connect your RazBerry to the casa-calida servers.
The installation is easy.

Connect to your raspberry pi and ensure you have nodejs and Z-Wave.me installed and running. Then type:

- `npm i -g --production casa-calida`
- Create your config.js file (wherever you want). Take a look at the
[config.example.js](https://github.com/stefanmayer13/casa-calida-razberry/blob/master/config.example) to see how it should look like.
- Create your token on the [casa-calida page](http://www.casa-calida.com) and set it in your config file.
- Have a username and password for a admin user of z-wave me ready.
- Start the programm with `casa-calida config=[path to your config] username=[z-wave username] password=[z-wave password]`
