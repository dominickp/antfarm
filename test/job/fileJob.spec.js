var should = require('chai').should();
var expect = require('chai').expect;
var Job = require('./../../lib/job/job');
var Antfarm = require("./../../lib/antfarm");
var tmp = require('tmp');
var fs = require("fs");
var path = require('path');

describe('FileJob', function() {

    var af, tempFolderCleanupCallback;

    beforeEach("make antfarm, tunnel, and nest", function(done) {
        var tmpDir = tmp.dirSync({unsafeCleanup: true});
        af = new Antfarm({
            log_out_level: "error",
            auto_managed_folder_directory: tmpDir.name
        });
        tempFolderCleanupCallback = tmpDir.removeCallback;
        done();
    });

    afterEach("remove temporary file", function(done){
        tempFolderCleanupCallback();
        if(process.env.NODE_ENV === "TEST") {
            setTimeout(done, 1500);
        } else {
            done();
        }
    });

    // Function to add a new job to the watched nest
    var triggerNewJob = function(name, theNest){
        var temp_file_path = theNest.path + path.sep + name;
        try {
            fs.writeFileSync(temp_file_path, "Some dummy data.");
        } catch (err) {
            console.log("File creation error", err);
        }
    };

    it('should get the size of the file', function (done) {
        var job_name = "MyJobFile_001.pdf";

        var tunnel = af.createTunnel("Size tunnel");
        var nest = af.createAutoFolderNest("My folder");
        tunnel.watch(nest);

        tunnel.run(function(job){
            expect(job.size).not.to.be.undefined;
            job.size.should.equal("16 B");
            job.sizeBytes.should.equal(16);
            done();
        });

        triggerNewJob(job_name, nest);
    });

    it("should move files into other FolderNests", done => {

        var job_name = "SomeRandomFile.pdf";
        var other_nest_name = "Move_folders_out728634782364";
        var hotfolder = af.createAutoFolderNest(["FileJob", "Move FileJobs in"]);
        var tunnel = af.createTunnel("FileJob moving files");

        var other_folder = af.createAutoFolderNest(other_nest_name);
        var other_tunnel = af.createTunnel("Moving folders");
        other_tunnel.watch(other_folder);

        tunnel.watch(hotfolder);

        tunnel.run((job, nest) => {
            job.move(other_folder, function(){
                console.log("move callback called.");
            });
        });

        other_tunnel.run((movedJob, movedNest) => {
            // not being triggered
            expect(movedJob).not.to.be.undefined;
            expect(movedJob.name).not.to.be.undefined;
            expect(movedNest).not.to.be.undefined;
            expect(movedNest.name).not.to.be.undefined;
            movedNest.name.should.equal(other_nest_name);
            movedJob.name.should.equal(job_name);
            done();
        });
        triggerNewJob(job_name, hotfolder);
    }).timeout(5000);
});

