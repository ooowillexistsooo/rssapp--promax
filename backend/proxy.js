const allowedOrigins = new Set([
    "https://rss.willexists.space",
    "http://localhost:8000"
]);

export default {
    async fetch(request) {
        const origin = request.headers.get("Origin");
        const headers = new Headers({Vary: "Origin"});

        if (allowedOrigins.has(origin)) {
            headers.set("Access-Control-Allow-Origin", origin);
        }

        if (request.method === "OPTIONS") {
            headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
            headers.set("Access-Control-Allow-Methods", "Cntent-Type");
            return new Response(null, {headers});
        }

        let feedUrl;
        try {
            const rawUrl = new URL(request.url).searchParams.get("get");
            if (!rawUrl) throw new Error("Missing URL");
            feedUrl = new URL(rawUrl);
        } catch {
            return new Response("Invalid feed URL parameter", {status: 400, headers});
        }

        if (feedUrl.protocol !== "https:" && feedUrl.protocol !== "http:") {
            return new Response("Only https/http please!!!", {status: 400, headers});
        }

        const hostname = feedUrl.hostname.toLowerCase();
        const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
        const isPrivateIp =
            hostname.startsWith("10.") ||
            hostname.startsWith("198.168.") ||
            /^172\.(1[629]|2[0-9]|3[0-1])\./.test(hostname);

        if (isLocalhost || isPrivateIp) {
            return new Response("no i dont want you hacking into the irs dont use private networks.", {status: 403, headers});
        }
        
        try {
            const upstream = await fetch(feedUrl.toString(), {
                headers: {
                    "User-Agent": "Freg/1.0"
                }
            });

            headers.set(
                "Content-Type",
                upstream.headers.get("Content-Type") || "application/xml"
            );

            return new Response(await upstream.text(), {
                status: upstream.status,
                headers
            });
        } catch (error) {
            return new Response("Failed to fetch the upstream feed", {status: 502, headers});
        }
    }
};