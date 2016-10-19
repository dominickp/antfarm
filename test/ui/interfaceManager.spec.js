var should = require("chai").should();
var Antfarm = require("./../../lib/antfarm");
var tmp = require('tmp');
var fs = require("fs");
var path = require('path');
//var mock = require('mock-fs');


xdescribe('Interface Manager', function() {
    var af, tunnel, webhook, im;

    var options = {
        log_out_level: "none",
        port: 8083
    };

    af = new Antfarm(options);

    beforeEach(function() {
        tunnel = af.createTunnel("Interface manager test tunnel");
        webhook = af.createWebhookNest(["test"], "get");
        im = webhook.getInterfaceManager();
    });

    it('should start with no metadata', function () {
        var metadata = im.getMetadata();
        metadata.interfaceProperties.should.be.empty;
    });

    describe('Fields', function() {
        it('should start with no fields', function () {
            var fields = im.getFields();
            fields.length.should.equal(0);
        });
        it('should be able to add fields', function () {
            im.addField({id:"id1", name:"name1", type:"text"});
            im.getFields().length.should.equal(1);
            im.addField({id:"id2", name:"name2", type:"text"});
            im.getFields().length.should.equal(2);
            im.addField({id:"id3", name:"name3", type:"text"});
            im.getFields().length.should.equal(3);
        });
        it('should not add fields with duplicate ids', function () {
            im.addField({id:"id", name:"name1", type:"text"});
            im.addField({id:"id", name:"name2", type:"text"}); // Should fail to add
            im.addField({id:"other_id", name:"name3", type:"text"});
            im.getFields().length.should.equal(2);
        });
    });

    describe('Steps', function() {
        it('should start with no steps', function () {
            var steps = im.getSteps();
            steps.length.should.equal(0);
        });
        it('should be able to add steps', function () {
            im.addStep("My step", function(webhookJob, webhookInterface, step, done){
                // Do nothing
                done();
            });
            im.getSteps().length.should.equal(1);
        });
    });

    describe('Interface instances', function() {
        var ui;
        before(function(){
            ui = im.getInterface();
        });
        it('should return an interface instance', function () {
            ui.getSessionId().should.not.be.empty;
        });
        it('should return a new interface instance if no session is found', function () {
            var newUi = im.getInterface();
            newUi.getSessionId().should.not.be.empty;
            ui.getSessionId().should.not.be.empty;
            ui.getSessionId().should.not.be.equal(newUi.getSessionId());
        });
        it('should return the same interface instance if the session is found', function () {
            ui = im.getInterface();
            var sameUI = im.getInterface(ui.getSessionId());

            sameUI.getSessionId().should.not.be.empty;
            ui.getSessionId().should.not.be.empty;
            sameUI.getSessionId().should.be.equal(ui.getSessionId());
        });
    });

});