package org.openpnp.tools;

import io.github.classgraph.ClassGraph;
import io.github.classgraph.ClassInfo;
import io.github.classgraph.ScanResult;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.lang.reflect.TypeVariable;
import java.lang.reflect.WildcardType;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class ScriptingTypeScriptGenerator {
    private static final Set<String> generatedClassNames = new HashSet<>();

    private static final class Config {
        private String outputPath;
        private List<String> packagePrefixes = new ArrayList<>();
        private List<String> explicitClassNames = new ArrayList<>();
    }

    private static final class ClassModel {
        private final String fqcn;
        private final List<Method> instanceMethods;
        private final List<Method> staticMethods;
        private final List<Field> staticFields;
        private final List<Constructor<?>> constructors;

        private ClassModel(String fqcn, List<Method> instanceMethods, List<Method> staticMethods,
                List<Field> staticFields, List<Constructor<?>> constructors) {
            this.fqcn = fqcn;
            this.instanceMethods = instanceMethods;
            this.staticMethods = staticMethods;
            this.staticFields = staticFields;
            this.constructors = constructors;
        }
    }

    private static final class PackageNode {
        private final LinkedHashMap<String, PackageNode> children = new LinkedHashMap<>();
        private final List<ClassModel> classes = new ArrayList<>();
    }

    private static final Set<String> TS_RESERVED_WORDS = new HashSet<>(Arrays.asList(
            "break", "case", "catch", "class", "const", "continue", "debugger", "default",
            "delete", "do", "else", "enum", "export", "extends", "false", "finally", "for",
            "function", "if", "import", "in", "instanceof", "new", "null", "return", "super",
            "switch", "this", "throw", "true", "try", "typeof", "var", "void", "while", "with",
            "as", "implements", "interface", "let", "package", "private", "protected", "public",
            "static", "yield"));

    public static void main(String[] args) throws Exception {
        Config config = parseArgs(args);
        validateConfig(config);

        List<String> classNames = new ArrayList<>();
        if (!config.packagePrefixes.isEmpty()) {
            classNames.addAll(discoverClassNames(config.packagePrefixes));
        }
        classNames.addAll(config.explicitClassNames);
        classNames = dedupeAndSort(classNames);

        LinkedHashMap<String, ClassModel> models = buildModels(classNames);
        generatedClassNames.clear();
        generatedClassNames.addAll(models.keySet());
        String output = renderTypeDefinitions(models);

        writeOutput(config.outputPath, output);
        System.out.println("Generated TypeScript definitions for " + models.size() + " classes at "
                + config.outputPath);
    }

    private static Config parseArgs(String[] args) {
        Config config = new Config();
        for (int i = 0; i < args.length; i++) {
            String arg = args[i];
            if ("--output".equals(arg) && i + 1 < args.length) {
                config.outputPath = args[++i];
            } else if ("--packages".equals(arg) && i + 1 < args.length) {
                String[] prefixes = args[++i].split(",");
                for (String prefix : prefixes) {
                    String trimmed = prefix.trim();
                    if (!trimmed.isEmpty()) {
                        config.packagePrefixes.add(trimmed);
                    }
                }
            } else if ("--classes".equals(arg) && i + 1 < args.length) {
                String[] classNames = args[++i].split(",");
                for (String className : classNames) {
                    String trimmed = className.trim();
                    if (!trimmed.isEmpty()) {
                        config.explicitClassNames.add(trimmed);
                    }
                }
            }
        }
        return config;
    }

    private static void validateConfig(Config config) {
        if (config.outputPath == null || config.outputPath.isEmpty()) {
            throw new IllegalArgumentException("Missing required argument --output <file>");
        }
        if (config.packagePrefixes.isEmpty() && config.explicitClassNames.isEmpty()) {
            throw new IllegalArgumentException(
                    "Missing required argument --packages <pkg1,pkg2,...> or --classes <cls1,cls2,...>");
        }
    }

    private static List<String> dedupeAndSort(List<String> values) {
        Set<String> unique = new HashSet<>(values);
        List<String> deduped = new ArrayList<>(unique);
        Collections.sort(deduped);
        return deduped;
    }

    private static List<String> discoverClassNames(List<String> packagePrefixes) {
        if (packagePrefixes.isEmpty()) {
            return new ArrayList<>();
        }

        List<String> classNames = new ArrayList<>();

        ClassGraph classGraph = new ClassGraph().enableClassInfo();
        for (String prefix : packagePrefixes) {
            classGraph.acceptPackages(prefix);
        }

        try (ScanResult scanResult = classGraph.scan()) {
            List<ClassInfo> classInfoList = scanResult.getAllClasses();
            for (ClassInfo classInfo : classInfoList) {
                if (!classInfo.isPublic()) {
                    continue;
                }
                if (classInfo.isAnonymousInnerClass() || classInfo.isSynthetic()) {
                    continue;
                }
                classNames.add(classInfo.getName());
            }
        }

        Collections.sort(classNames);
        return classNames;
    }

    private static LinkedHashMap<String, ClassModel> buildModels(List<String> classNames) {
        LinkedHashMap<String, ClassModel> models = new LinkedHashMap<>();

        for (String className : classNames) {
            try {
                Class<?> clazz = Class.forName(className, false, Thread.currentThread().getContextClassLoader());
                if (!Modifier.isPublic(clazz.getModifiers())) {
                    continue;
                }
                if (clazz.isAnonymousClass() || clazz.isLocalClass() || clazz.isSynthetic()) {
                    continue;
                }

                List<Method> instanceMethods = new ArrayList<>();
                List<Method> staticMethods = new ArrayList<>();
                List<Field> staticFields = new ArrayList<>();
                List<Constructor<?>> constructors = new ArrayList<>();

                for (Method method : clazz.getMethods()) {
                    if (!Modifier.isPublic(method.getModifiers())) {
                        continue;
                    }
                    if (method.isBridge() || method.isSynthetic()) {
                        continue;
                    }

                    if (Modifier.isStatic(method.getModifiers())) {
                        staticMethods.add(method);
                    } else {
                        instanceMethods.add(method);
                    }
                }

                for (Constructor<?> constructor : clazz.getConstructors()) {
                    if (!Modifier.isPublic(constructor.getModifiers())) {
                        continue;
                    }
                    if (constructor.isSynthetic()) {
                        continue;
                    }
                    constructors.add(constructor);
                }

                for (Field field : clazz.getFields()) {
                    if (!Modifier.isPublic(field.getModifiers()) || !Modifier.isStatic(field.getModifiers())) {
                        continue;
                    }
                    if (field.isSynthetic()) {
                        continue;
                    }
                    staticFields.add(field);
                }

                sortMethods(instanceMethods);
                sortMethods(staticMethods);
                staticFields.sort(Comparator.comparing(Field::getName));
                constructors.sort(Comparator.comparingInt(Constructor::getParameterCount));

                models.put(className,
                        new ClassModel(className, dedupeMethods(instanceMethods), dedupeMethods(staticMethods),
                                dedupeFields(staticFields),
                                dedupeConstructors(constructors)));
            } catch (Throwable t) {
                // Best-effort generation: skip classes that cannot be loaded in this
                // environment.
            }
        }

        return models;
    }

    private static void sortMethods(List<Method> methods) {
        methods.sort((a, b) -> {
            int nameCompare = a.getName().compareTo(b.getName());
            if (nameCompare != 0) {
                return nameCompare;
            }
            int arityCompare = Integer.compare(a.getParameterCount(), b.getParameterCount());
            if (arityCompare != 0) {
                return arityCompare;
            }
            String aSig = Arrays.toString(a.getParameterTypes());
            String bSig = Arrays.toString(b.getParameterTypes());
            return aSig.compareTo(bSig);
        });
    }

    private static List<Method> dedupeMethods(List<Method> methods) {
        List<Method> deduped = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        for (Method method : methods) {
            String key = method.getName() + "(" + Arrays.toString(method.getGenericParameterTypes()) + ")";
            if (seen.add(key)) {
                deduped.add(method);
            }
        }
        return deduped;
    }

    private static List<Constructor<?>> dedupeConstructors(List<Constructor<?>> constructors) {
        List<Constructor<?>> deduped = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        for (Constructor<?> constructor : constructors) {
            String key = Arrays.toString(constructor.getGenericParameterTypes());
            if (seen.add(key)) {
                deduped.add(constructor);
            }
        }
        return deduped;
    }

    private static List<Field> dedupeFields(List<Field> fields) {
        List<Field> deduped = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        for (Field field : fields) {
            if (seen.add(field.getName())) {
                deduped.add(field);
            }
        }
        return deduped;
    }

    private static String renderTypeDefinitions(LinkedHashMap<String, ClassModel> models) {
        StringBuilder sb = new StringBuilder();

        sb.append("// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.\n");
        sb.append("// Generated by org.openpnp.tools.ScriptingTypeScriptGenerator.\n\n");

        Map<String, List<ClassModel>> byNamespace = groupByNamespace(models);
        for (Map.Entry<String, List<ClassModel>> entry : byNamespace.entrySet()) {
            String namespaceName = entry.getKey();
            List<ClassModel> classes = entry.getValue();
            classes.sort(Comparator.comparing(model -> shortName(model.fqcn)));

            sb.append("declare namespace ").append(namespaceName).append(" {\n");
            for (ClassModel model : classes) {
                String shortName = shortName(model.fqcn);
                String classTypeName = shortName + "Class";

                sb.append("  interface ").append(shortName).append(" {\n");
                for (String propertySignature : renderBeanPropertySignatures(model.instanceMethods)) {
                    sb.append("    ").append(propertySignature).append("\n");
                }
                for (Method method : model.instanceMethods) {
                    sb.append("    ").append(renderMethodSignature(method)).append("\n");
                }
                sb.append("  }\n\n");

                sb.append("  interface ").append(classTypeName).append(" {\n");
                for (Constructor<?> constructor : model.constructors) {
                    sb.append("    ").append(renderConstructorSignature(constructor, shortName)).append("\n");
                }
                for (Field field : model.staticFields) {
                    sb.append("    ").append(renderStaticFieldSignature(field)).append("\n");
                }
                for (Method method : model.staticMethods) {
                    sb.append("    ").append(renderMethodSignature(method)).append("\n");
                }
                sb.append("  }\n\n");
            }
            sb.append("}\n\n");
        }

        sb.append("interface OpenPnpJavaTypeMap {\n");
        for (ClassModel model : models.values()) {
            String ns = namespaceName(model.fqcn);
            String shortName = shortName(model.fqcn);
            sb.append("  \"").append(model.fqcn).append("\": ").append(ns).append(".")
                    .append(shortName).append("Class;\n");
        }
        sb.append("}\n\n");

        appendPackageObjectTypes(sb, models);

        return sb.toString();
    }

    private static void appendPackageObjectTypes(StringBuilder sb, LinkedHashMap<String, ClassModel> models) {
        PackageNode root = new PackageNode();

        for (ClassModel model : models.values()) {
            String[] namespaceParts = namespaceName(model.fqcn).split("\\.");
            PackageNode node = root;
            for (String part : namespaceParts) {
                if (part.isEmpty()) {
                    continue;
                }
                node = node.children.computeIfAbsent(part, ignored -> new PackageNode());
            }
            node.classes.add(model);
        }

        appendPackageInterfacesRecursive(sb, root, new ArrayList<>());
        if (root.children.containsKey("org")) {
            sb.append("declare const org: ").append(packageInterfaceName(Arrays.asList("org"))).append(";\n");
        }
    }

    private static void appendPackageInterfacesRecursive(StringBuilder sb, PackageNode node, List<String> path) {
        if (!path.isEmpty()) {
            String interfaceName = packageInterfaceName(path);
            sb.append("interface ").append(interfaceName).append(" {\n");

            for (Map.Entry<String, PackageNode> entry : node.children.entrySet()) {
                List<String> childPath = new ArrayList<>(path);
                childPath.add(entry.getKey());
                sb.append("  readonly ").append(formatMemberName(entry.getKey())).append(": ")
                        .append(packageInterfaceName(childPath)).append(";\n");
            }

            node.classes.sort(Comparator.comparing(model -> shortName(model.fqcn)));
            for (ClassModel model : node.classes) {
                String ns = namespaceName(model.fqcn);
                String shortName = shortName(model.fqcn);
                sb.append("  readonly ").append(formatMemberName(shortName)).append(": ")
                        .append(ns).append(".").append(shortName).append("Class;\n");
            }

            // Keep unknown package/class lookups usable for Nashorn scripts that reference
            // classes outside the generated package set.
            sb.append("  readonly [key: string]: any;\n");
            sb.append("}\n\n");
        }

        for (Map.Entry<String, PackageNode> entry : node.children.entrySet()) {
            List<String> childPath = new ArrayList<>(path);
            childPath.add(entry.getKey());
            appendPackageInterfacesRecursive(sb, entry.getValue(), childPath);
        }
    }

    private static String packageInterfaceName(List<String> path) {
        return "OpenPnpPackage_" + String.join("_", path);
    }

    private static Map<String, List<ClassModel>> groupByNamespace(LinkedHashMap<String, ClassModel> models) {
        Map<String, List<ClassModel>> grouped = new LinkedHashMap<>();
        for (ClassModel model : models.values()) {
            String namespace = namespaceName(model.fqcn);
            grouped.computeIfAbsent(namespace, ignored -> new ArrayList<>()).add(model);
        }
        return grouped;
    }

    private static String renderMethodSignature(Method method) {
        StringBuilder sb = new StringBuilder();
        sb.append(formatMemberName(method.getName())).append("(");
        Type[] parameterTypes = method.getGenericParameterTypes();
        for (int i = 0; i < parameterTypes.length; i++) {
            if (i > 0) {
                sb.append(", ");
            }
            String tsType = mapType(parameterTypes[i]);
            if (method.isVarArgs() && i == parameterTypes.length - 1) {
                sb.append("p").append(i).append("?: ").append(tsType);
            } else {
                sb.append("p").append(i).append(": ").append(tsType);
            }
        }
        sb.append("): ").append(mapType(method.getGenericReturnType())).append(";");

        return sb.toString();
    }

    private static String renderConstructorSignature(Constructor<?> constructor, String shortName) {
        StringBuilder sb = new StringBuilder();
        sb.append("new(");

        Type[] parameterTypes = constructor.getGenericParameterTypes();
        for (int i = 0; i < parameterTypes.length; i++) {
            if (i > 0) {
                sb.append(", ");
            }
            String tsType = mapType(parameterTypes[i]);
            if (constructor.isVarArgs() && i == parameterTypes.length - 1) {
                sb.append("p").append(i).append("?: ").append(tsType);
            } else {
                sb.append("p").append(i).append(": ").append(tsType);
            }
        }

        sb.append("): ").append(shortName).append(";");
        return sb.toString();
    }

    private static String renderStaticFieldSignature(Field field) {
        return "readonly " + formatMemberName(field.getName()) + ": " + mapType(field.getGenericType()) + ";";
    }

    private static String mapType(Type type) {
        if (type instanceof Class<?>) {
            Class<?> clazz = (Class<?>) type;
            if (clazz.isArray()) {
                return mapType(clazz.getComponentType()) + "[]";
            }
            if (clazz == Void.TYPE || clazz == Void.class) {
                return "void";
            }
            if (clazz == Boolean.TYPE || clazz == Boolean.class) {
                return "boolean";
            }
            if (clazz == Byte.TYPE || clazz == Short.TYPE || clazz == Integer.TYPE || clazz == Long.TYPE
                    || clazz == Float.TYPE || clazz == Double.TYPE || Number.class.isAssignableFrom(clazz)) {
                return "number";
            }
            if (clazz == Character.TYPE || clazz == Character.class || clazz == String.class
                    || clazz.getName().equals("java.lang.CharSequence")) {
                return "string";
            }

            if (clazz.getName().startsWith("org.openpnp.") || generatedClassNames.contains(clazz.getName())) {
                return formatJavaName(clazz.getName());
            }
            return "any";
        }

        if (type instanceof ParameterizedType) {
            ParameterizedType parameterizedType = (ParameterizedType) type;
            return mapType(parameterizedType.getRawType());
        }

        if (type instanceof TypeVariable<?>) {
            return "any";
        }

        if (type instanceof WildcardType) {
            return "any";
        }

        return "any";
    }

    private static String formatJavaName(String javaName) {
        int idx = javaName.lastIndexOf('.');
        if (idx < 0) {
            return javaName.replace('$', '_');
        }
        String pkg = javaName.substring(0, idx);
        String cls = javaName.substring(idx + 1).replace('$', '_');
        return pkg + "." + cls;
    }

    private static String formatMemberName(String name) {
        if (isValidIdentifier(name) && !TS_RESERVED_WORDS.contains(name)) {
            return name;
        }
        return "\"" + name + "\"";
    }

    private static List<String> renderBeanPropertySignatures(List<Method> methods) {
        List<String> signatures = new ArrayList<>();
        Set<String> seen = new HashSet<>();

        for (Method method : methods) {
            if (method.getParameterCount() != 0) {
                continue;
            }

            String methodName = method.getName();
            Type returnType = method.getGenericReturnType();
            String propertyName = null;

            if (methodName.startsWith("get") && methodName.length() > 3
                    && !"getClass".equals(methodName)
                    && !"getDeclaringClass".equals(methodName)
                    && !"void".equals(mapType(returnType))) {
                propertyName = decapitalize(methodName.substring(3));
            } else if (methodName.startsWith("is") && methodName.length() > 2
                    && "boolean".equals(mapType(returnType))) {
                propertyName = decapitalize(methodName.substring(2));
            }

            if (propertyName == null || propertyName.isEmpty()) {
                continue;
            }

            String signature = "readonly " + formatMemberName(propertyName) + ": " + mapType(returnType)
                    + ";";
            if (seen.add(signature)) {
                signatures.add(signature);
            }
        }

        Collections.sort(signatures);
        return signatures;
    }

    private static String decapitalize(String value) {
        if (value == null || value.isEmpty()) {
            return value;
        }
        if (value.length() == 1) {
            return value.toLowerCase();
        }
        return Character.toLowerCase(value.charAt(0)) + value.substring(1);
    }

    private static boolean isValidIdentifier(String value) {
        if (value == null || value.isEmpty()) {
            return false;
        }
        if (!Character.isJavaIdentifierStart(value.charAt(0))) {
            return false;
        }
        for (int i = 1; i < value.length(); i++) {
            if (!Character.isJavaIdentifierPart(value.charAt(i))) {
                return false;
            }
        }
        return true;
    }

    private static String namespaceName(String fqcn) {
        int idx = fqcn.lastIndexOf('.');
        if (idx < 0) {
            return "global";
        }
        return fqcn.substring(0, idx).replace('$', '.');
    }

    private static String shortName(String fqcn) {
        int idx = fqcn.lastIndexOf('.');
        if (idx < 0) {
            return fqcn.replace('$', '_');
        }
        return fqcn.substring(idx + 1).replace('$', '_');
    }

    private static void writeOutput(String outputPath, String content) throws IOException {
        File outputFile = new File(outputPath);
        File parent = outputFile.getParentFile();
        if (parent != null && !parent.exists()) {
            parent.mkdirs();
        }

        try (PrintWriter writer = new PrintWriter(new FileWriter(outputFile, false))) {
            writer.write(content);
        }
    }
}
