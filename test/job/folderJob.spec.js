var should = require('chai').should();
var expect = require('chai').expect;
var Antfarm = require("./../../lib/antfarm");
var tmp = require('tmp');
var fs = require("fs");
var path = require('path');

describe('FolderJob', function() {

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
            setTimeout(done, 500);
        } else {
            done();
        }
    });

    // Function to add a new job to the watched nest
    var triggerNewFolderJob = (name, files, nest, callback) => {
        var tempJobDir = nest.path + path.sep + name;
        fs.mkdirSync(tempJobDir);

        files.forEach((file) => {
            fs.writeFileSync(tempJobDir + path.sep + file, "Some dummy data.");
        });

        if (callback) { callback(); }
    };

    it('should produce folder jobs with basic properties', done => {
        var tunnel = af.createTunnel("Prop test tunnel");
        var nest = af.createAutoFolderNest("Prop-test-nest");
        tunnel.watch(nest);

        var job_name = "My job folder";

        tunnel.run((job, nest) => {
            expect(job.isFolder()).not.to.be.undefined;
            job.isFolder().should.equal(true);
            expect(job.isFile()).not.to.be.undefined;
            job.isFile().should.equal(false);
            job.name.should.equal(job_name);
            expect(job).not.to.be.undefined;
            expect(job.nameProper).not.to.be.undefined;
            job.nameProper.should.equal(job_name);
            done();
        });

        triggerNewFolderJob(job_name, ["this.pdf", "that.pdf"], nest);
    });

    var assertFolderFiles = (sourceJob, antfarmJob, callback) => {
        expect(antfarmJob.files).not.to.be.undefined;
        antfarmJob.files.length.should.equal(sourceJob.files.length);
        antfarmJob.files.forEach((file, i) => {
            file.name.should.equal(sourceJob.files[i]);
        });
        callback();
    };

    it("files within a folder should contain a single file", done =>{
        var tunnel = af.createTunnel("Prop single tunnel");
        var nest = af.createAutoFolderNest("Prop single nest");

        var job1 = {name: "My job folder 1", files: ["a brochure.pdf"]};
        tunnel.run(job => {
            assertFolderFiles(job1, job, () => { done(); });
        });
        triggerNewFolderJob(job1.name, job1.files, nest, () => {
            tunnel.watch(nest);
        });
    });

    it("files within a folder should contain a multiple files", done => {
        var tunnel = af.createTunnel("Prop multiple tunnel");
        var nest = af.createAutoFolderNest("Prop multiple nest");

        var job1 = {name: "My job folder 3", files: ["1.zip", "2.pdf", "3.png", "4.jpg", "5.rar", "6.tar.gz"]};
        tunnel.run(job => {
            assertFolderFiles(job1, job, () => { done(); });
        });

        triggerNewFolderJob(job1.name, job1.files, nest, () => {
            tunnel.watch(nest);
        });
    });

    it("should be movable to another nest", done => {
        var job1 = {name: "My job folder to be moved", files: ["a brochure.pdf"]};
        var other_nest_name = "Move_folders_out";
        var hotfolder = af.createAutoFolderNest(["FolderJob", "Move folders in"]);
        var tunnel = af.createTunnel("Moving folders");

        var other_folder = af.createAutoFolderNest(other_nest_name);
        var other_tunnel = af.createTunnel("Moving folders");
        other_tunnel.watch(other_folder);

        tunnel.run((job, nest) => {
            // console.log("Folder tunnel run ");
            job.move(other_folder, () => {
                // console.log("Folder move callback");
            });
        });

        other_tunnel.run((movedJob, movedNest) => {
            expect(movedJob).not.to.be.undefined;
            expect(movedJob.name).not.to.be.undefined;
            expect(movedNest).not.to.be.undefined;
            expect(movedNest.name).not.to.be.undefined;
            movedNest.name.should.equal(other_nest_name);
            movedJob.name.should.equal(job1.name);
            done();
        });
        triggerNewFolderJob(job1.name, job1.files, hotfolder, () => {
            tunnel.watch(hotfolder);
        });
    });

    it('should be transferable to another tunnel', done => {
        var hotfolder = af.createAutoFolderNest(["Move folders in"]);
        var tunnel = af.createTunnel("Moving folders");
        tunnel.watch(hotfolder);

        var job1 = {name: "My job folder 1", files: ["a brochure.pdf"]};
        var other_tunnel = af.createTunnel("Another tunnel");

        tunnel.run(originalJob => {
            originalJob.transfer(other_tunnel);
        });

        other_tunnel.run(transferredJob => {
            transferredJob.name.should.equal(job1.name);
            done();
        });
        triggerNewFolderJob(job1.name, job1.files, hotfolder);
    });

});

