var should = require('chai').should();
var Antfarm = require('./../../lib/antfarm');

describe('Nest Folder', function() {

    var options = {};
    var af;

    beforeEach(function() {
        af = new Antfarm(options);
    });

    describe('Loading', function() {
        it('should create a folder', function() {
            var folder = af.createFolderNest("path");
            folder.should.be.a('object');
        });
    });
});

