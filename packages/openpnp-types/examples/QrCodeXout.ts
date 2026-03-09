/**
 * Disable boards in a job based on presence of a QR code on the board.
 * Each board location is searched at a point +3mm,+3mm from it's origin
 * for the presence of a QR code. If a QR code is found, the board is disabled
 * in the job.
 */

// Load Examples/Utility.js functions into our scope. This will define the
// task function.
load(scripting.getScriptsDirectory().toString() + "/Examples/JavaScript/Utility.js");

// Import some OpenPnP classes we'll use
var imports = new JavaImporter(org.openpnp.model, org.openpnp.util);

// Using the imports from above, do some work.
var Location = imports.Location;
var LengthUnit = imports.LengthUnit;
var Utils2D = imports.Utils2D;
var VisionUtils = imports.VisionUtils;

task(function () {
    var camera = machine.getDefaultHead().getDefaultCamera();
    var boards = gui.jobTab.job.boardLocations;
    for (var i = 0; i < boards.size(); i++) {
        var board = boards.get(i);
        var location = Utils2D.calculateBoardPlacementLocation(board, new Location(LengthUnit.Millimeters, 3, 3, 0, 0));
        camera.moveTo(location);
        var code = VisionUtils.readQrCode(camera);
        if (code != null) {
            board.setEnabled(false);
            gui.jobTab.refresh();
        }
    }
});
