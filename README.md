# antfarm

Antfarm is a simple automation framework that aims to make file automation robust and scalable. 🐜

[![Build Status](https://travis-ci.org/dominickp/antfarm.svg?branch=master)](https://travis-ci.org/dominickp/antfarm)
[![Coverage Status](https://coveralls.io/repos/github/dominickp/antfarm/badge.svg?branch=master)](https://coveralls.io/github/dominickp/antfarm?branch=master)
[![npm version](https://badge.fury.io/js/antfarm.svg)](https://badge.fury.io/js/antfarm)
[![Dependancy Status](https://david-dm.org/dominickp/antfarm.svg)](https://david-dm.org/dominickp/antfarm)
[![Gitter](https://badges.gitter.im/dominickp/antfarm.svg)](https://gitter.im/open-automation/Lobby)

## Usage

```sh
$ npm install antfarm
```

```js
var Antfarm = require('antfarm'),
   af = new Antfarm();
   
var hotfolder_a = af.createFolderNest("/var/hotfolders/a");
var pdf_folder = af.createFolderNest("/var/out/pdf");
var other_folder = af.createFolderNest("/var/out/others");

var tunnel = af.createTunnel("Simple pdf sorting workflow");

tunnel.watch(hotfolder_a);

tunnel.run(function(job, nest){
    if(job.getExtension() == "pdf"){
        job.move(pdf_folder);
    } else {
        job.move(other_folder);
    }
});
    
```

## Wiki
https://github.com/dominickp/antfarm/wiki

## API Reference
https://dominickp.github.io/antfarm

## Examples

### FTP to folder
This workflow watches an FTP folder for new files every 5 minutes. Then, when found, simply transfers them to the desktop.

```js
var Antfarm = require('../lib/antfarm'),
    af = new Antfarm();

var my_ftp = af.createFtpNest("ftp.ants.com", 21, 'username', 'password', 5);
var out_folder = af.createFolderNest("/Users/dominickpeluso/Desktop");

var ftp_tunnel = af.createTunnel("FTP test");

ftp_tunnel.watch(out_folder);

ftp_tunnel.run(function(job, nest){
    job.move(my_ftp);
});

ftp_tunnel.fail(function(job, nest, reason){
    console.log("Job " + job.getName() + " failed:" + reason);
});
```

### Route jobs to folders via filetype
This workflow routes PDFs which arrive in the hotfolder to a particular folder while routing all other filetypes to another folder.

```js
// Import Antfarm and set some options
var Antfarm = require('antfarm'),
    af = new Antfarm();

// Build a Tunnel
var tunnel = af.createTunnel("Hotfolder sorting workflow");

// Create a Nest for our hot folder
var hotfolder = af.createFolderNest("/var/hotfolders/a");

// Attach the Nest to our Tunnel to watch for new files
tunnel.watch(hotfolder);

// When a new file is found, execute the following
tunnel.run(function(job, nest){
    // Move PDFs to one folder, all others to another
    if(job.getExtension() == "pdf"){
        job.move(af.createFolderNest("/var/out/pdf"));
    } else {
        job.move(af.createFolderNest("/var/out/others"));
    }
});

// When a job fails, execute the following
tunnel.fail(function(job, nest, reason){
    console.log("Job " + job.getName() + " failed:" + reason);
});
```

### Matching files together
```js
var Antfarm = require('antfarm'),
    af = new Antfarm();

var hotfolder = af.createFolderNest("/Users/dominickpeluso/Desktop/Antfarm Example/FTP Out/");
var tunnel = af.createTunnel("Matching workflow");

tunnel.watch(hotfolder);

// Match .pdf with .xml with a 1 minute timeout
tunnel.match(["*.xml", "*_art.pdf"], 1, function(jobs){
    console.log("MATCHES FOUND " + jobs[0].getName(), jobs[1].getName());
    // => MATCHES FOUND myFile.xml myFile_art.pdf
});

// Orphaned files fail out
tunnel.fail(function(job, nest, reason){
    console.log("Job " + job.getName() + " failed:" + reason);
});
```
