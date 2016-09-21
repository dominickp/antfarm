# antfarm

Antfarm is a simple automation framework that aims to make file automation robust and scalable.

🐜🐜🐜🐜🐜

## Usage

```sh
$ npm install antfarm
```

```js
var Antfarm = require('antfarm');

var options = {
        log_dir: "/Users/dominickpeluso/Desktop",
        log_max_size: null,
        log_max_files: null,
        log_file_level: null,
        log_out_level: null
    };
    
var af = new Antfarm(options);
```

## Components

### Tunnels
Tunnels are defined workflows which modularize and run your program code.

```js
// Build a Tunnel
var tunnel = af.createTunnel("Hotfolder sorting workflow");
```

You can attach nests to tunnels, which triggers the nest's watching behavior.

```js
// Attach the Nest to our Tunnel to watch for new files
tunnel.watch(hotfolder);
```

Tunnels handle your application logic via the run method. You can have multiple run instances within a single tunnel, allowing you to run several actions concurrently.

```js
// When a new file is found, execute the following
tunnel.run(function(job, nest){
    // your application code
});
```

Similar to the run method, the fail method will allow you to handle job errors.
```js
// When a job fails, execute the following
tunnel.fail(function(job, nest){
    console.log("Job " + job.getName() + " failed!");
});
```

### Nests
Nests are a simple abstraction for storage locations (filesystem folders, S3 buckets, FTP, etc...). 

```js
var desktop_nest = af.createFolderNest("/Users/dominickpeluso/Desktop");
var ftp_nest = af.createFtpNest("ftp.ants.com", 21, 'username', 'password', 5);
```

You can easily move jobs from one nest to another without having to worry about its type.

```js
tunnel.watch(desktop_nest);

tunnel.run(function(job, nest){
    // Uploads files from desktop to the FTP
    job.move(ftp_nest);
});
```

### Jobs
Jobs are provided within tunnel events and have lots of helpful methods.

```js
    if(job.getExtension() == "pdf"){
        // Do stuff to PDFs
    }
```
