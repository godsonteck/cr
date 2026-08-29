from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 900})
        page.goto("http://localhost:4173")
        page.wait_for_timeout(1000)
        page.screenshot(path="rebuilt_home.png", full_page=True)
        print("Captured rebuilt_home.png")
        browser.close()

verify()
