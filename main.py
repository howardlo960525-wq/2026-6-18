from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class Utf8HTTPRequestHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".html": "text/html; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".js": "application/javascript; charset=utf-8",
    }

    def guess_type(self, path):
        content_type = super().guess_type(path)
        if path.endswith((".html", ".css", ".js")) and "charset=" not in content_type:
            return f"{content_type}; charset=utf-8"
        return content_type


def main():
    host = "127.0.0.1"
    port = 8000
    server = ThreadingHTTPServer((host, port), Utf8HTTPRequestHandler)
    print(f"PlayMate running at http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
