var should = require('chai').should();
var expect = require('chai').expect;
var Job = require('./../../lib/job/job');
var Antfarm = require("./../../lib/antfarm");
var tmp = require('tmp');
var fs = require("fs");
var path = require('path');

describe('FileJob', function() {

    var options = {
        log_out_level: "debug",
    };

    var temp_file_path, af, tunnel, nest, tempFolderCleanupCallback;

    before("make temporary log directory", function(done){
        tmp.dir({ unsafeCleanup: true }, function(err, dir, cleanupCallback) {
            tempFolderCleanupCallback = cleanupCallback;
            if (err) return done(err);
            setTimeout(function(){
                options.log_dir = dir;
                options.auto_managed_folder_directory = dir;
                done()
            }, 300);
        });
    });

    beforeEach("make antfarm, tunnel, and nest", function(done) {
        af = new Antfarm(options);
        tunnel = af.createTunnel("Initial test tunnel");

        nest = af.createAutoFolderNest("general-input");
        tunnel.watch(nest);

        done()
    });

    afterEach("remove temporary file", function(){
        tempFolderCleanupCallback();
        try {
            fs.unlinkSync(temp_file_path);
        } catch (e) {
            return;
        }
    });

    // Function to add a new job to the watched nest
    var triggerNewJob = function(name, theNest){
        temp_file_path = theNest.path + path.sep + name;
        fs.writeFileSync(temp_file_path, "Some dummy data.");
    };

    xit('should get the size of the file', function (done) {
        var job_name = "MyJobFile_001.pdf";
        tunnel.run(function(job){
            expect(job.size).not.to.be.undefined;
            job.size.should.equal("16 B");
            job.sizeBytes.should.equal(16);
            done();
        });

        triggerNewJob(job_name);
    });

    xit('should move between FolderNests', function (done) {
        var job_name = "file_to_be_moved.pdf";
        var other_nest_name = "some-other-folder";

        var other_tunnel = af.createTunnel("Another tunnel...");
        var other_nest = af.createAutoFolderNest(other_nest_name);
        other_tunnel.watch(other_nest);

        console.log("nests tied to tunnel", tunnel.nests.length);

        tunnel.run(function(fileJob, initNest){

            console.log(initNest.name);
            fileJob.rename("this.renamed");
            fileJob.move(other_nest, (theFileJob) => {
                console.log("CALLBACK CALLED", theFileJob.path, fileJob.path);
                // done();
            });
        });

        other_tunnel.run((movedJob, movedNest) => {
            console.log("FOUND IN OTHER TUNNEL");
            expect(movedJob).not.to.be.undefined;
            expect(movedNest).not.to.be.undefined;
            movedNest.name.should.equal(other_nest_name);
            movedJob.name.should.equal(job_name);
            done();
        });

        triggerNewJob(job_name, nest);


    });


});

