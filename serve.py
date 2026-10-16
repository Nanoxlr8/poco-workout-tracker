import http.server
import socket
import socketserver
import os
import sys
import json
from datetime import datetime

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
DOWNLOADS_DIR = os.path.dirname(DIRECTORY) # parent folder, typically a Downloads folder

PROGRESS_JSON_PATH = os.path.join(DOWNLOADS_DIR, "workout_progress.json")
PROGRESS_MD_PATH = os.path.join(DOWNLOADS_DIR, "workout_log.md")

def save_progress_files(data):
    try:
        # 1. Save main JSON in Downloads
        with open(PROGRESS_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        # 2. Also save in app directory as backup
        with open(os.path.join(DIRECTORY, "workout_progress.json"), "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        # 3. Generate human-readable Markdown workout log in Downloads
        history = data.get("history", [])
        md_lines = [
            "# Workout Progress Log — Poco F5",
            f"\n*Last updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n",
            f"- **Total Workouts Completed**: {len(history)}",
            f"- **Total Reps Recorded**: {sum(h.get('totalReps', 0) for h in history)}\n",
            "## Completed Sessions\n",
            "| Date | Day | Session | Sets | Reps | Exercise Summary |",
            "|---|---|---|---|---|---|"
        ]

        for h in reversed(history):
            date_str = h.get("dateFormatted", h.get("date", "")[:10])
            day_name = h.get("dayName", "")
            session = h.get("sessionType", "")
            sets_cnt = h.get("totalSets", 0)
            reps_cnt = h.get("totalReps", 0)

            ex_summaries = []
            for ex_name, ex_sets in (h.get("exercises") or {}).items():
                s_txt = ", ".join(f"{s.get('reps', 0)}r ({s.get('load', 'BW')})" for s in ex_sets)
                ex_summaries.append(f"**{ex_name}**: {s_txt}")
            summary_str = "<br>".join(ex_summaries) if ex_summaries else "Completed"

            md_lines.append(f"| {date_str} | {day_name} | {session} | {sets_cnt} | {reps_cnt} | {summary_str} |")

        with open(PROGRESS_MD_PATH, "w", encoding="utf-8") as f:
            f.write("\n".join(md_lines))

        print(f"[AUTO-SAVE] Progress saved to {PROGRESS_JSON_PATH} and {PROGRESS_MD_PATH}")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to save progress: {e}")
        return False

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/save-progress':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            try:
                data = json.loads(body.decode('utf-8'))
                success = save_progress_files(data)
                self.send_response(200 if success else 500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                resp = {
                    "status": "ok" if success else "error",
                    "file_json": PROGRESS_JSON_PATH,
                    "file_md": PROGRESS_MD_PATH
                }
                self.wfile.write(json.dumps(resp).encode('utf-8'))
            except Exception as e:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        if self.path == '/api/load-progress':
            if os.path.exists(PROGRESS_JSON_PATH):
                try:
                    with open(PROGRESS_JSON_PATH, 'r', encoding='utf-8') as f:
                        data = f.read()
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json; charset=utf-8')
                    self.end_headers()
                    self.wfile.write(data.encode('utf-8'))
                    return
                except Exception:
                    pass
            self.send_response(404)
            self.end_headers()
        else:
            super().do_GET()

def main():
    os.chdir(DIRECTORY)
    local_ip = get_local_ip()
    url = f"http://{local_ip}:{PORT}"
    
    print("\n" + "=" * 60)
    print(" POCO F5 WORKOUT TRACKER - SERVER RUNNING")
    print("=" * 60)
    print(f"\nConnect your Poco F5 (same Wi-Fi):")
    print(f"   URL: {url}")
    print(f"   Auto-Save Target: {PROGRESS_JSON_PATH}\n")
    
    try:
        import qrcode
        qr = qrcode.QRCode(border=1)
        qr.add_data(url)
        qr.make(fit=True)
        print("Scan this QR Code with your Poco F5 camera to open:\n")
        qr.print_ascii(invert=True)
        print()
        img = qr.make_image(fill_color="black", back_color="white")
        img_path = os.path.join(DIRECTORY, "qr_connect.png")
        img.save(img_path)
    except Exception as e:
        print(f"Note: QR code display skipped ({e})")

    print("=" * 60)
    print("AUTO-SAVE STATUS:")
    print(f"  Every completed workout is automatically written directly to:")
    print(f"  -> {PROGRESS_JSON_PATH}")
    print(f"  -> {PROGRESS_MD_PATH}")
    print("=" * 60)
    print(f"Serving at port {PORT}. Press Ctrl+C to stop.\n")

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == '__main__':
    main()
