/**
 * Move the default nozzle in a 10mm square.
 * Demonstrates safely submitting machine tasks and using OpenPnP
 * Java types in scripts. Also shows how to define a utility function
 * in an external script file and call it.
 */

// Load Examples/Utility.js functions into our scope. This will define the
// task function.
load(scripting.getScriptsDirectory().toString() + "/Examples/JavaScript/Utility.js");

// Import some OpenPnP classes we'll use
const moveImports = new JavaImporter(org.openpnp.model, org.openpnp.util);

// Using the imports from above, do some work.
const MoveLocation = moveImports.Location;
const MoveLengthUnit = moveImports.LengthUnit;

task(function () {
    const nozzle = machine.defaultHead.defaultNozzle;
    let location = nozzle.location;

    // Move 10mm right
    location = location.add(new MoveLocation(MoveLengthUnit.Millimeters, 10, 0, 0, 0));
    nozzle.moveTo(location);

    // Move 10mm up
    location = location.add(new MoveLocation(MoveLengthUnit.Millimeters, 0, 10, 0, 0));
    nozzle.moveTo(location);

    // Move 10mm left
    location = location.add(new MoveLocation(MoveLengthUnit.Millimeters, -10, 0, 0, 0));
    nozzle.moveTo(location);

    // Move 10mm down
    location = location.add(new MoveLocation(MoveLengthUnit.Millimeters, 0, -10, 0, 0));
    nozzle.moveTo(location);
});
