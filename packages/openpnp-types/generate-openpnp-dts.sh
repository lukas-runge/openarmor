#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OPENPNP_DIR="${OPENPNP_DIR:-${SCRIPT_DIR}/../openpnp}"
OUTPUT_FILE="${SCRIPT_DIR}/types/generated/openpnp-java.d.ts"
GEN_SRC="${SCRIPT_DIR}/java/org/openpnp/tools/ScriptingTypeScriptGenerator.java"
CACHE_DIR="${SCRIPT_DIR}/.cache"
GEN_CLASSES_DIR="${CACHE_DIR}/generator-classes"
CP_FILE="${CACHE_DIR}/openpnp-test-classpath.txt"

mkdir -p "${CACHE_DIR}" "${GEN_CLASSES_DIR}"

if [[ ! -f "${OPENPNP_DIR}/pom.xml" ]]; then
  echo "OpenPnP checkout not found at ${OPENPNP_DIR}. Set OPENPNP_DIR to your repo path." >&2
  exit 1
fi

cd "${OPENPNP_DIR}"
mvn -q -DskipTests test-compile
mvn -q -DskipTests -DincludeScope=test -Dmdep.outputFile="${CP_FILE}" \
  org.apache.maven.plugins:maven-dependency-plugin:3.6.1:build-classpath

DEPENDENCY_CP="$(cat "${CP_FILE}")"
OPENPNP_CP="${OPENPNP_DIR}/target/test-classes:${OPENPNP_DIR}/target/classes:${DEPENDENCY_CP}"

javac -cp "${OPENPNP_CP}" -d "${GEN_CLASSES_DIR}" "${GEN_SRC}"

java -cp "${GEN_CLASSES_DIR}:${OPENPNP_CP}" org.openpnp.tools.ScriptingTypeScriptGenerator \
  --output "${OUTPUT_FILE}" \
  --packages org.openpnp.model,org.openpnp.spi,org.openpnp.scripting,org.openpnp.gui,org.openpnp.util

echo "Generated ${OUTPUT_FILE}"
