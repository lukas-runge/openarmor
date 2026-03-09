import { fetch } from "openpnp-utils";

//How to make a GET request
var requestGET = fetch("https://example.com", "GET");

// Call into a Java class and show a message dialog
var optionPane = javax.swing.JOptionPane.showMessageDialog(null, "Fed " + requestGET);
