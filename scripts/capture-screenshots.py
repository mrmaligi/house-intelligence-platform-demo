#!/usr/bin/env python3
"""
Capture actual screenshots of 698 Armstrong Road from Google Maps
Requires: pip install selenium webdriver-manager
"""

import time
import json
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# CORRECT COORDINATES for 698 Armstrong Road
LAT = -37.8857635
LNG = 144.6073309
ADDRESS = "698 Armstrong Road, Wyndham Vale, VIC 3024"

def setup_driver():
    """Setup Chrome driver for screenshots"""
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1280,720")
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    return driver

def capture_streetview(driver, heading, filename):
    """Capture Street View at specific heading"""
    url = f"https://www.google.com/maps/@?api=1&map_action=pano&viewpoint={LAT},{LNG}&heading={heading}&pitch=0"
    print(f"Capturing Street View {heading}°...")
    
    try:
        driver.get(url)
        time.sleep(5)  # Wait for Street View to load
        driver.save_screenshot(filename)
        print(f"  ✓ Saved: {filename}")
        return True
    except Exception as e:
        print(f"  ✗ Failed: {e}")
        return False

def capture_satellite(driver, zoom, filename):
    """Capture Satellite view"""
    url = f"https://www.google.com/maps/@{LAT},{LNG},{zoom}z"
    print(f"Capturing Satellite zoom {zoom}...")
    
    try:
        driver.get(url)
        time.sleep(5)
        driver.save_screenshot(filename)
        print(f"  ✓ Saved: {filename}")
        return True
    except Exception as e:
        print(f"  ✗ Failed: {e}")
        return False

def main():
    print("=" * 60)
    print("PROPERTY IMAGE CAPTURE - 698 Armstrong Road")
    print("=" * 60)
    print(f"\nAddress: {ADDRESS}")
    print(f"Coordinates: {LAT}, {LNG}\n")
    
    print("Setting up Chrome driver...")
    try:
        driver = setup_driver()
    except Exception as e:
        print(f"Error setting up Chrome: {e}")
        print("\nPlease install dependencies:")
        print("  pip install selenium webdriver-manager")
        return
    
    # Capture Street View from 4 main angles
    angles = [0, 90, 180, 270]
    for angle in angles:
        capture_streetview(driver, angle, f"streetview_{angle}deg.png")
    
    # Capture Satellite views
    for zoom in [18, 20]:
        capture_satellite(driver, zoom, f"satellite_zoom{zoom}.png")
    
    driver.quit()
    
    print("\n" + "=" * 60)
    print("✅ Capture complete!")
    print("=" * 60)

if __name__ == "__main__":
    main()
