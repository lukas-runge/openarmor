#!/bin/bash

SCRIPTS_FOLDER="/Volumes/[C] Windows 11/Users/hannes/.openpnp2/scripts"
TARGET_FOLDER="$SCRIPTS_FOLDER/openarmor"

rm -rf "$TARGET_FOLDER"
mkdir -p "$TARGET_FOLDER"

cp -r "packages/openpnp-rest-api-server/dist" "$TARGET_FOLDER/openpnp-rest-api-server"