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
