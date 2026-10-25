import os
import json
import urllib.request
import subprocess

def run_ai_agent():
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        print("Error: OPENROUTER_API_KEY is missing!")
        return

    # Запускаем тесты и сохраняем лог ошибки
    print("Running tests to capture failure...")
    result = subprocess.run(["bun", "test"], capture_output=True, text=True)
    error_output = result.stderr + "\n" + result.stdout

    if result.returncode == 0:
        print("Tests passed successfully! No healing needed.")
        return

    print("Captured test failure. Sending context to OpenRouter...")

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/sweet-vpn-spot",
        "X-Title": "Sweet VPN Spot Auto-Heal Agent"
    }

    prompt = f"""
    You are an autonomous SRE and code-healing agent. 
    The project uses Bun and TypeScript/JavaScript.
    Here is the test failure output:
    {error_output}

    Analyze the failure, find the bug in the codebase, and provide a fix.
    Output your response clearly or make modifications.
    """

    payload = {
        "model": "deepseek/deepseek-chat",
        "messages": [
            {"role": "system", "content": "You fix code errors and return patches or fixed code."},
            {"role": "user", "content": prompt}
        ]
    }

    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            ai_message = res_data["choices"][0]["message"]["content"]
            print("AI Response received:")
            print(ai_message)
            
            # Здесь в будущем можно распарсить ответ от ИИ и применить патч к файлам кода
    except Exception as e:
        print(f"Failed to communicate with OpenRouter: {e}")

if __name__ == "__main__":
    run_ai_agent()
