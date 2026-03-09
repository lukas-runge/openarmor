print("Scripting Environment");

// Print out the global variables accessible to the scripts.
print("  Global Variables");
print("    config: " + config);
print("    machine: " + machine);
print("    gui: " + gui);
print("    scripting: " + scripting);

print("  Scripts Directory: " + scripting.getScriptsDirectory());

// Show a list of scripting engines that are available along with the file
// extensions they can process.
print("  Scripting Engines");
const manager = new javax.script.ScriptEngineManager();
const factories = manager.getEngineFactories();
for (let i = 0; i < factories.size(); i++) {
    const factory = factories.get(i);
    print("    Engine: " + factory.getEngineName() + " (" + factory.getEngineVersion() + ")");
    print("      Language: " + factory.getLanguageName() + " (" + factory.getLanguageVersion() + ")");
    print("      Extensions: " + factory.getExtensions());
}
print();
