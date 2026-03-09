/// <reference path="../types/runtime-globals.d.ts" />

print("Hello from TypeScript running on Nashorn");
print("Scripts directory: " + scripting.getScriptsDirectory());

const Configuration = Java.type("org.openpnp.model.Configuration");
print("Current machine: " + Configuration.get().getMachine().toString());
