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
const   Antfarm = require('antfarm'),
        af = new Antfarm();
   
let hotfolder_a = af.createFolderNest("/var/hotfolders/a");
let pdf_folder = af.createFolderNest("/var/out/pdf");
let other_folder = af.createFolderNest("/var/out/others");

let tunnel = af.createTunnel("Simple pdf sorting workflow");

tunnel.watch(hotfolder_a);

tunnel.run((job, nest) => {
    if(job.extension == "pdf"){
        job.move(pdf_folder);
    } else {
        job.move(other_folder);
    }
});
    
```

## Documentation warning
During late October, much of antfarm was refactor to use TypeScript's accessors. The documentation may be out of date.

```js
// Old style
job.setName("myFile.pdf");
console.log(job.getName());

// New style, using TypeScript accessors
job.name = "myFile.pdf";
console.log(job.name);
```

## Wiki
https://github.com/dominickp/antfarm/wiki

## API Reference
https://dominickp.github.io/antfarm
