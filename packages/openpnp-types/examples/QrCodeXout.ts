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
const qrImports = new JavaImporter(org.openpnp.model, org.openpnp.util);

// Using the imports from above, do some work.
const QrLocation = qrImports.Location;
const QrLengthUnit = qrImports.LengthUnit;
const Utils2D = qrImports.Utils2D;
const VisionUtils = qrImports.VisionUtils;

task(function () {
    const camera = machine.getDefaultHead().getDefaultCamera();
    const boards = gui.jobTab.job.boardLocations;
    for (let i = 0; i < boards.size(); i++) {
        const board = boards.get(i);
        const location = Utils2D.calculateBoardPlacementLocation(board, new QrLocation(QrLengthUnit.Millimeters, 3, 3, 0, 0));
        camera.moveTo(location);
        const code = VisionUtils.readQrCode(camera);
        if (code != null) {
            board.setEnabled(false);
            gui.jobTab.refresh();
        }
    }
});
