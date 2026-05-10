#!/usr/bin/env python3
"""
server.py — Token Dashboard 实时数据服务器

读取 CoPaw token_usage.json（CoPaw 实时更新）
转成前端需要的格式，通过 HTTP API 提供

用法:
  python server.py              # 启动, 默认端口 3456
  python server.py --port 8080  # 自定义端口
  python server.py --open       # 启动后打开浏览器
"""

import json
import sys
import webbrowser
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from datetime import datetime, timedelta
import urllib.parse

TOKEN_FILE = Path.home() / ".copaw" / "token_usage.json"
PORT = 3456


def load_token_usage():
    """读取并转换 token_usage.json 到前端格式"""
    raw = json.loads(TOKEN_FILE.read_text(encoding="utf-8"))

    # 按日期排序
    dates = sorted(raw.keys())
    if not dates:
        return {"updatedAt": datetime.now().strftime("%Y-%m-%d %H:%M"), "totalDays": 0, "summary": {"totalTokens": 0, "promptTokens": 0, "completionTokens": 0, "totalCalls": 0}, "byModel": [], "daily": []}

    now = datetime.now()
    daily = []
    model_totals = {}

    for date_str in dates:
        day_data = raw[date_str]
        day_total = 0
        day_prompt = 0
        day_completion = 0
        day_calls = 0

        for model_key, model_data in day_data.items():
            p = model_data["prompt_tokens"]
            c = model_data["completion_tokens"]
            calls = model_data["call_count"]
            day_total += p + c
            day_prompt += p
            day_completion += c
            day_calls += calls

            # 累加模型统计
            if model_key not in model_totals:
                model_totals[model_key] = {"name": model_key, "tokens": 0, "calls": 0}
            model_totals[model_key]["tokens"] += p + c
            model_totals[model_key]["calls"] += calls

        daily.append({
            "date": date_str,
            "total": day_total,
            "calls": day_calls,
            "prompt": day_prompt,
            "completion": day_completion,
        })

    total_tokens = sum(d["total"] for d in daily)
    total_prompt = sum(d["prompt"] for d in daily)
    total_completion = sum(d["completion"] for d in daily)
    total_calls = sum(d["calls"] for d in daily)

    # 友好模型名映射
    name_map = {
        "deepseek:deepseek-v4-flash": "DeepSeek V4 Flash",
        "opencode:big-pickle": "OpenCode Big Pickle",
        "opencode:nemotron-3-super-free": "Nemotron-3 Super Free",
        "opencode:minimax-m2.5-free": "MiniMax M2.5 Free",
    }

    by_model = [
        {"name": name_map.get(k, k), "tokens": v["tokens"], "calls": v["calls"]}
        for k, v in sorted(model_totals.items(), key=lambda x: -x[1]["tokens"])
    ]

    return {
        "updatedAt": now.strftime("%Y-%m-%d %H:%M"),
        "totalDays": len(daily),
        "summary": {
            "totalTokens": total_tokens,
            "promptTokens": total_prompt,
            "completionTokens": total_completion,
            "totalCalls": total_calls,
        },
        "byModel": by_model,
        "daily": daily,
    }


class TokenAPIHandler(BaseHTTPRequestHandler):
    """HTTP 请求处理"""

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)

        if parsed.path == "/api/tokens":
            self._send_json(load_token_usage())
        elif parsed.path == "/api/health":
            self._send_json({"status": "ok", "file": str(TOKEN_FILE), "exists": TOKEN_FILE.exists()})
        else:
            self.send_response(404)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "not_found"}).encode())

    def _send_json(self, data):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode())

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, format, *args):
        """精简日志"""
        print(f"  [{self.log_date_time_string()}] {args[0]} {args[1]}")


def main():
    global PORT
    args = sys.argv[1:]
    open_browser = False

    for i, a in enumerate(args):
        if a == "--port" and i + 1 < len(args):
            PORT = int(args[i + 1])
        if a == "--open":
            open_browser = True

    if not TOKEN_FILE.exists():
        print(f"  [!] 找不到数据文件: {TOKEN_FILE}")
        print(f"  [!] 请先运行 agent 产生一些 token 数据")
        sys.exit(1)

    server = HTTPServer(("0.0.0.0", PORT), TokenAPIHandler)

    print(f"\n  ⚡ Token Dashboard API Server")
    print(f"  ─────────────────────────────")
    print(f"  API:   http://localhost:{PORT}/api/tokens")
    print(f"  Health: http://localhost:{PORT}/api/health")
    print(f"  File:  {TOKEN_FILE}")
    print(f"  Dates: {len(json.loads(TOKEN_FILE.read_text()))} 天")
    print(f"\n  在另一个终端运行: npm run dev")
    print(f"  或直接访问 API 查看原始数据")
    print(f"\n  按 Ctrl+C 停止")

    if open_browser:
        webbrowser.open(f"http://localhost:{PORT}/api/tokens")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  已停止")
        server.server_close()


if __name__ == "__main__":
    main()
