#!/usr/bin/env python3
"""
Resolve git merge conflicts for sweet-vpn-spot.
"""

import sys
from pathlib import Path

PROJECT = Path("/c/Users/User/sweet-vpn-spot")


def resolve_workflow_tsx(content: str) -> str:
    """Resolve workflow.tsx conflicts - combine mediaBroken logic with publishedAssetUrl."""
    head_marker = "<<<<<<< HEAD"
    end_marker = ">>>>>>>"

    start = content.find(head_marker)
    if start == -1:
        return content

    end = content.find(end_marker, start)
    if end == -1:
        return content

    # Extract the head section
    head_section = content[start:end]

    # The head section contains the video element code
    # We want to keep the mediaBroken logic and replace asset URLs with publishedAssetUrl
    content = content.replace(
        "<source src={webmAsset.url} type=\"video/webm\" />",
        "<source src={publishedAssetUrl(webmAsset.url)} type=\"video/webm\" />",
        1,
    )
    content = content.replace(
        "<source src={videoAsset.url} type=\"video/mp4\" onError={fail} />",
        "<source src={publishedAssetUrl(videoAsset.url)} type=\"video/mp4\" onError={fail} />",
        1,
    )
    content = content.replace("poster={posterAsset.url}", "poster={publishedAssetUrl(posterAsset.url)}", 1)
    content = content.replace("poster={posterAsset.url}", "poster={publishedAssetUrl(posterAsset.url)}", 1)

    return content


def resolve_i18n_content_ts(content: str) -> str:
    """Resolve i18n-content.ts conflicts - keep fixed Japanese and Chinese a2 values."""
    # Japanese a2 value
    head_ja = '"プランを選て支払えば、設定リンクがすぐ届きます。無料設定はFreeプランに。",'
    mine_ja = '"プランを選て支払えば、設定リンクがすぐ届きます。無料設定は有料プランでご利用いただけます。",'
    if head_ja in content and mine_ja in content:
        content = content.replace(head_ja, mine_ja, 1)

    # Chinese a2 value
    head_zh = '"选择方案并付款，配置链接即刻送达。免费配置在 Free 方案中。",'
    mine_zh = '"选择方案并付款，配置链接即刻送达。免费配置在付费方案中。",'
    if head_zh in content and mine_zh in content:
        content = content.replace(head_zh, mine_zh, 1)

    return content


def resolve_i18n_ts(content: str) -> str:
    """Resolve i18n.ts conflicts - ensure readStoredLang functions are present."""
    functions = """export function readStoredLang(): string | undefined {
  try {
    const value = localStorage.getItem("lang");
    if (value && Object.hasOwn(LANGS, value)) return value;
  } catch {
    // Safari private mode and locked-down browsers throw here.
  }
  return undefined;
}

export function storeLang(lang: string) {
  try {
    localStorage.setItem("lang", lang);
  } catch {
    // Language still works for the current session without persistence.
  }
}

"""
    if "function readStoredLang" not in content:
        # Insert after the mk function
        mk_function_end = "return content;\n};"
        if mk_function_end in content:
            content = content.replace(mk_function_end, mk_function_end + functions, 1)
    return content


def resolve_root_tsx(content: str) -> str:
    """Resolve __root.tsx conflicts - keep svg favicon version."""
    head_favicon = '      { rel: "/favicon.ico", type: "image/x-icon" },'
    mine_favicon = """      { rel: FAVICON_DATA_URI, type: "image/svg+xml" },
      { rel: "/favicon.svg", type: "image/svg+xml" },"""
    if head_favicon in content:
        content = content.replace(head_favicon, mine_favicon, 1)
    return content


def resolve_file(file_path: str) -> bool:
    """Resolve conflicts in a single file. Returns True if resolved."""
    path = PROJECT / file_path
    if not path.exists():
        print(f"  {file_path}: NOT FOUND")
        return False

    content = path.read_text(encoding="utf-8")
    original = content
    resolved = False

    if file_path == "src/components/workflow.tsx":
        new_content = resolve_workflow_tsx(content)
        if new_content != content:
            path.write_text(new_content, encoding="utf-8")
            print(f"  {file_path}: resolved")
            resolved = True
    elif file_path == "src/lib/i18n-content.ts":
        new_content = resolve_i18n_content_ts(content)
        if new_content != content:
            path.write_text(new_content, encoding="utf-8")
            print(f"  {file_path}: resolved")
            resolved = True
    elif file_path == "src/lib/i18n.ts":
        new_content = resolve_i18n_ts(content)
        if new_content != content:
            path.write_text(new_content, encoding="utf-8")
            print(f"  {file_path}: resolved")
            resolved = True
    elif file_path == "src/routes/__root.tsx":
        new_content = resolve_root_tsx(content)
        if new_content != content:
            path.write_text(new_content, encoding="utf-8")
            print(f"  {file_path}: resolved")
            resolved = True

    return resolved


def main():
    files = [
        "src/components/workflow.tsx",
        "src/lib/i18n-content.ts",
        "src/lib/i18n.ts",
        "src/routes/__root.tsx",
    ]

    resolved = 0
    for file_path in files:
        if resolve_file(file_path):
            resolved += 1

    print(f"\nResolved {resolved}/{len(files)} files")
    return 0 if resolved == len(files) else 1


if __name__ == "__main__":
    sys.exit(main())
