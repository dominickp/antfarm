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

If you need to run logic synchronously, you can do so with runSync:

```js
tunnel.runSync(function(job, nest, done){
    console.log("Do this first");
});

tunnel.runSync(function(job, nest, done){
    console.log("Do this second");
    job.move(my_ftp, function(){
        done();
    });
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
    job.move(ftp_nest, function(){
        // Moved
    });
});
```

### Jobs
Jobs are provided within tunnel events and have lots of helpful methods.

```js
    if(job.getExtension() == "pdf"){
        // Do stuff to PDFs
    }
```

## Examples

### FTP to folder
This workflow watches an FTP folder for new files every 5 minutes. Then, when found, simply transfers them to the desktop.

```js
var Antfarm = require('../lib/antfarm'),
    af = new Antfarm({
        log_dir: "/Users/dominickpeluso/Logs"
    });

var my_ftp = af.createFtpNest("ftp.ants.com", 21, 'username', 'password', 5);
var out_folder = af.createFolderNest("/Users/dominickpeluso/Desktop");

var ftp_tunnel = af.createTunnel("FTP test");

ftp_tunnel.watch(out_folder);

ftp_tunnel.run(function(job, nest){
    job.move(my_ftp);
});

ftp_tunnel.fail(function(job, nest){
    console.log("do fail");
});
```

### Route jobs to folders via filetype
This workflow routes PDFs which arrive in the hotfolder to a particular folder while routing all other filetypes to another folder.

```js
// Import Antfarm and set some options
var Antfarm = require('../lib/antfarm'),
    af = new Antfarm({
        log_dir: "/Users/dominickpeluso/Logs"
    });

// Set some paths for convenience
const INPUT_PATH = '/Users/dominickpeluso/Desktop/Antfarm Example/Hotfolder In';
const OUTPUT_PDF_PATH = '/Users/dominickpeluso/Desktop/Antfarm Example/Out/PDF';
const OUTPUT_OTHER_PATH = '/Users/dominickpeluso/Desktop/Antfarm Example/Out/Others';

// Build a Tunnel
var tunnel = af.createTunnel("Hotfolder sorting workflow");

// Create a Nest for our hot folder
var hotfolder = af.createFolderNest(INPUT_PATH);

// Attach the Nest to our Tunnel to watch for new files
tunnel.watch(hotfolder);

// When a new file is found, execute the following
tunnel.run(function(job, nest){
    // Move PDFs to one folder, all others to another
    if(job.getExtension() == "pdf"){
        job.move(af.createFolderNest(OUTPUT_PDF_PATH));
    } else {
        job.move(af.createFolderNest(OUTPUT_OTHER_PATH));
    }
});

// When a job fails, execute the following
tunnel.fail(function(job, nest){
    console.log("Job " + job.getName() + " failed!");
});
```

### Matching files together
```js
var Antfarm = require('../lib/antfarm'),
    af = new Antfarm({
        log_dir: "/Users/dominickpeluso/Desktop"
    });

var hotfolder = af.createFolderNest("/Users/dominickpeluso/Desktop/Antfarm Example/FTP Out/");
var tunnel = af.createTunnel("Matching workflow");

tunnel.watch(hotfolder);

// Match .pdf with .xml with a 1 minute timeout
tunnel.match(["*.xml", "*_art.pdf"], 1, function(jobs){

    console.log("MATCHES FOUND " + jobs[0].getName(), jobs[1].getName());
    // => MATCHES FOUND hello copy 5.xml hello copy 5_art.pdf

});

// Orphaned files fail out
tunnel.fail(function(job, nest){
    console.log("do fail", job.getName());
    // => do fail sqljdbc.jar
});
```