=================
Development setup
=================

Casa-Calida-Razberry is a Node.JS library, which is designed to run on a Raspberry PI.


Using Docker and docker-compose
===============================

Install dependencies
--------------------

Node.JS is needed to run Casa-Calida-Razberry

Config
------

See config.example.js how to create a configuration file.

Start the service
-----------------

Use babel-node to start the application for development mode.

::

   node_modules\.bin\babel-node src\index.js config=tmp\config.local.js

