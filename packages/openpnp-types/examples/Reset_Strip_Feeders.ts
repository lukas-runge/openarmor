// Reset the feed count on every feeder. If a feeder doesn't
// have a setFeedCount() method we'll silently ignore it.
var feeders = machine.getFeeders();
for (var i = 0; i < feeders.size(); i++) {
    var feeder = feeders.get(i);
    try {
        feeder.setFeedCount(0);
        print("Reset " + feeder.name);
    } catch (e) {}
}
