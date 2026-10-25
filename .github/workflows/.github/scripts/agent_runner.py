import os
import json
import urllib.request
import subprocess
import re

def run_ai_agent():
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        print("Error: OPENROUTER_API_KEY is missing!")
        return

    # 1. Запускаем тесты и ловим ошибку
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

    # Просим модель вернуть имя файла и полностью исправленный код этого файла в блоке кода
    prompt = f"""
    You are an autonomous code-healing agent. 
    The project uses Bun and TypeScript/JavaScript.
    Here is the test failure output:
    {error_output}

    Analyze the failure, find which file contains the bug, and provide the ENTIRE corrected code for that file.
    Specify the file path clearly in your response, and enclose the fixed code in a standard markdown code block (e.g. ```typescript ... ```).
    """

    payload = {
        "model": "deepseek/deepseek-chat",
        "messages": [
            {"role": "system", "content": "You fix code errors and return the fixed file content."},
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
            
            # Пытаемся найти путь к файлу и блок кода в ответ от ИИ
            # Ищем что-то вроде src/start.ts или пути в тексте
            match_file = re.search(r'(?:file|path|in)?[:\s`]*([a-zA-Z0-9_\-/]+\.(?:ts|tsx|js|jsx))', ai_message, re.IGNORECASE)
            match_code = re.search(r'```(?:typescript|javascript|tsx|jsx)?\s*([\s\S]*?)```', ai_message)

            if match_file and match_code:
                file_path = match_file.group(1).strip()
                fixed_code = match_code.group(1).strip()
                
                if os.path.exists(file_path):
                    print(f"Applying fix to file: {file_path}")
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(fixed_code)
                    print("File successfully updated by AI agent!")
                else:
                    print(f"Guessed file path '{file_path}' does not exist locally.")
            else:
                print("Could not automatically parse file path or code block from AI response.")

    except Exception as e:
        print(f"Failed to communicate with OpenRouter: {e}")

if __name__ == "__main__":
    run_ai_agent()
