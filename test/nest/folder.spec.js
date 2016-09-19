var should = require('chai').should();

describe('Nest Folder', function() {

    var antfarm = require('./../../lib/antfarm');

    beforeEach(function() {
        antfarm = require('./../../lib/antfarm');
    });

    describe('Loading', function() {
        it('should create a folder', function() {
            var folder = antfarm.createFolder("path");
            folder.should.be.a('object');
        });
    });
});

