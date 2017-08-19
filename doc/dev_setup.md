# Development setup

Casa-Calida-Razberry is a GO executable, which is designed to run on a Raspberry PI.


## Using Docker and docker-compose

### Install dependencies

None

### Config

#### Linux:
```bash
export AWS_REGION=eu-central-1
export AWS_ACCESS_KEY_ID=YOUR_AKID
export AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
export AWS_SESSION_TOKEN=TOKEN
```

Windows:
```bash
set AWS_REGION="eu-central-1"
set AWS_ACCESS_KEY_ID=YOUR_AKID
set AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
set AWS_SESSION_TOKEN=TOKEN
```

Windows PowerShell:
```bash
$env:AWS_REGION="eu-central-1"
$env:AWS_ACCESS_KEY_ID=YOUR_AKID
$env:AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
$env:AWS_SESSION_TOKEN=TOKEN
```

Start the service
-----------------

Use babel-node to start the application for development mode.

::

   node_modules\.bin\babel-node src\index.js config=tmp\config.local.js

