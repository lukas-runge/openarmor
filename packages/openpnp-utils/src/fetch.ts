//Addon for Nashorn made by Creadores Program © 2023
//MIT license © https://raw.githubusercontent.com/Trollhunters501/Fetch-API-Nashorn/main/LICENSE

export function fetch(url: string, method?: "GET" | "POST" | "PUT" | "DELETE" | "HEAD", body?: string, contentType?: string, exHeaders?: { [key: string]: string }): string | number | void {
    method = method || "GET";
    contentType = contentType || "application/json; utf-8";
    var HttpURLConnectionftch = Java.type("java.net.HttpURLConnection");
    var URLftch = Java.type("java.net.URL");
    var BufferedReaderftch = Java.type("java.io.BufferedReader");
    var InputStreamReaderftch = Java.type("java.io.InputStreamReader");
    var StringBufferftch = Java.type("java.lang.StringBuffer");
    var StringBuilderftch = Java.type("java.lang.StringBuilder");
    var UserAgentftch = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36";
    if (!url) {
        console.error("it cant be empty!");
        return;
    }
    if (url.indexOf(" ") !== -1) {
        console.error("The web page cannot contain spaces!");
        return;
    }
    var urlftch;
    var conftch;
    var responsecodeftch;
    var responseLineftch;
    var inftch;
    var inputlineftch;
    var responseftch;
    var jsonContentftch;
    var osftch;
    var inputftch;
    var brftch;
    var exHeadersJ;
    switch (method) {
        case "GET":
            try {
                urlftch = new URLftch(url);
                conftch = urlftch.openConnection();
                conftch.setRequestMethod("GET");
                conftch.setRequestProperty("User-Agent", UserAgentftch);
                if (exHeaders != null) {
                    exHeadersJ = Object.keys(exHeaders);
                    for (var k in exHeadersJ) {
                        conftch.setRequestProperty(exHeadersJ[k], exHeaders[exHeadersJ[k]]);
                    }
                }
                responsecodeftch = conftch.getResponseCode();
                inftch = new BufferedReaderftch(new InputStreamReaderftch(conftch.getInputStream()));
                responseftch = new StringBufferftch();
                while ((inputlineftch = inftch.readLine()) != null) {
                    responseftch.append(inputlineftch);
                }
                inftch.close();
                return responseftch.toString();
            } catch (error) {
                console.error(error);
            }
            return;
            break;
        case "HEAD":
            try {
                urlftch = new URLftch(url);
                conftch = urlftch.openConnection();
                conftch.setRequestMethod("HEAD");
                conftch.setRequestProperty("User-Agent", UserAgentftch);
                if (exHeaders != null) {
                    exHeadersJ = Object.keys(exHeaders);
                    for (var k in exHeadersJ) {
                        conftch.setRequestProperty(exHeadersJ[k], exHeaders[exHeadersJ[k]]);
                    }
                }
                responsecodeftch = conftch.getResponseCode();
                inftch = new BufferedReaderftch(new InputStreamReaderftch(conftch.getInputStream()));
                responseftch = new StringBufferftch();
                while ((inputlineftch = inftch.readLine()) != null) {
                    responseftch.append(inputlineftch);
                }
                inftch.close();
                return responseftch.toString();
            } catch (error) {
                console.error(error);
            }
            return;
            break;
        case "POST":
            if (!body) {
                console.error("You need content to use POST!");
                return;
            }
            urlftch = new URLftch(url);
            conftch = urlftch.openConnection();
            conftch.setRequestMethod("POST");
            conftch.setRequestProperty("User-Agent", UserAgentftch);
            conftch.setRequestProperty("Content-Type", contentType);
            if (exHeaders != null) {
                exHeadersJ = Object.keys(exHeaders);
                for (var k in exHeadersJ) {
                    conftch.setRequestProperty(exHeadersJ[k], exHeaders[exHeadersJ[k]]);
                }
            }
            jsonContentftch = body;
            conftch.setDoOutput(true);
            osftch = conftch.getOutputStream();
            try {
                inputftch = jsonContentftch.getBytes("utf-8");
                osftch.write(inputftch, 0, inputftch.length);
            } finally {
                osftch.close();
            }
            brftch = new BufferedReaderftch(new InputStreamReaderftch(conftch.getInputStream(), "utf-8"));
            try {
                responseftch = new StringBuilderftch();
                responseLineftch = null;
                while ((responseLineftch = brftch.readLine()) != null) {
                    responseftch.append(responseLineftch.trim());
                }
            } finally {
                brftch.close();
            }
            return responseftch.toString();
        case "PUT":
            if (!body) {
                console.error("You need content to use PUT!");
                return;
            }
            urlftch = new URLftch(url);
            conftch = urlftch.openConnection();
            conftch.setRequestMethod("PUT");
            conftch.setRequestProperty("User-Agent", UserAgentftch);
            conftch.setRequestProperty("Content-Type", contentType);
            if (exHeaders != null) {
                exHeadersJ = Object.keys(exHeaders);
                for (var k in exHeadersJ) {
                    conftch.setRequestProperty(exHeadersJ[k], exHeaders[exHeadersJ[k]]);
                }
            }
            jsonContentftch = body;
            conftch.setDoOutput(true);
            osftch = conftch.getOutputStream();
            try {
                inputftch = jsonContentftch.getBytes("utf-8");
                osftch.write(inputftch, 0, inputftch.length);
            } finally {
                osftch.close();
            }
            brftch = new BufferedReaderftch(new InputStreamReaderftch(conftch.getInputStream(), "utf-8"));
            try {
                responseftch = new StringBuilderftch();
                responseLineftch = null;
                while ((responseLineftch = brftch.readLine()) != null) {
                    responseftch.append(responseLineftch.trim());
                }
            } finally {
                brftch.close();
            }
            return responseftch.toString();
        case "DELETE":
            urlftch = new URLftch(url);
            conftch = urlftch.openConnection();
            conftch.setDoOutput(true);
            conftch.setRequestProperty("User-Agent", UserAgentftch);
            conftch.setRequestProperty("Content-Type", contentType);
            if (exHeaders != null) {
                exHeadersJ = Object.keys(exHeaders);
                for (var k in exHeadersJ) {
                    conftch.setRequestProperty(exHeadersJ[k], exHeaders[exHeadersJ[k]]);
                }
            }
            conftch.setRequestMethod("DELETE");
            conftch.connect();
            return conftch.getResponseCode();
        default:
            throw "Method not supported or does not exist";
    }
}
