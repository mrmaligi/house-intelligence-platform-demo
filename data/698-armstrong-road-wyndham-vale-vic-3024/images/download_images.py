#!/usr/bin/env python3
"""
Download property images from Google Maps
Requires: Google Maps API Key
"""

import requests
import os

# CONFIGURATION
API_KEY = "YOUR_GOOGLE_MAPS_API_KEY_HERE"  # Replace with your key
LAT = -37.8923
LNG = 144.6234
ADDRESS = "698 Armstrong Road, Wyndham Vale, VIC 3024"

def download_streetview_images():
    """Download Street View images from multiple angles"""
    print(f"📸 Downloading Street View images for {ADDRESS}...")
    
    os.makedirs("streetview", exist_ok=True)
    
    # 8 angles around the property
    angles = [0, 45, 90, 135, 180, 225, 270, 315]
    
    for angle in angles:
        url = f"https://maps.googleapis.com/maps/api/streetview?size=640x480&location={LAT},{LNG}&heading={angle}&pitch=0&key={API_KEY}"
        filename = f"streetview/streetview_{angle}deg.jpg"
        
        response = requests.get(url)
        if response.status_code == 200:
            with open(filename, "wb") as f:
                f.write(response.content)
            print(f"  ✅ Downloaded: {filename}")
        else:
            print(f"  ❌ Failed: {filename} (Status: {response.status_code})")
    
    # Elevation shots
    for pitch in [-20, 20]:
        url = f"https://maps.googleapis.com/maps/api/streetview?size=640x480&location={LAT},{LNG}&heading=0&pitch={pitch}&key={API_KEY}"
        filename = f"streetview/streetview_pitch_{pitch}.jpg"
        
        response = requests.get(url)
        if response.status_code == 200:
            with open(filename, "wb") as f:
                f.write(response.content)
            print(f"  ✅ Downloaded: {filename}")

def download_aerial_images():
    """Download satellite/aerial images"""
    print(f"\n🛰️ Downloading Aerial images...")
    
    os.makedirs("aerial", exist_ok=True)
    
    zoom_levels = [18, 19, 20, 21]
    
    for zoom in zoom_levels:
        url = f"https://maps.googleapis.com/maps/api/staticmap?center={LAT},{LNG}&zoom={zoom}&size=640x640&maptype=satellite&key={API_KEY}"
        filename = f"aerial/aerial_zoom{zoom}.jpg"
        
        response = requests.get(url)
        if response.status_code == 200:
            with open(filename, "wb") as f:
                f.write(response.content)
            print(f"  ✅ Downloaded: {filename}")
        else:
            print(f"  ❌ Failed: {filename} (Status: {response.status_code})")

def main():
    print("=" * 60)
    print("PROPERTY IMAGE DOWNLOADER")
    print(f"Address: {ADDRESS}")
    print("=" * 60)
    
    if API_KEY == "YOUR_GOOGLE_MAPS_API_KEY_HERE":
        print("\n⚠️  ERROR: Please set your Google Maps API key!")
        print("\nTo get a free API key:")
        print("1. Go to https://developers.google.com/maps/documentation/streetview/get-api-key")
        print("2. Create a Google Cloud project")
        print("3. Enable Street View Static API and Maps Static API")
        print("4. Create credentials (API key)")
        print("5. Replace YOUR_GOOGLE_MAPS_API_KEY_HERE in this script")
        return
    
    download_streetview_images()
    download_aerial_images()
    
    print("\n" + "=" * 60)
    print("✅ Download complete!")
    print("=" * 60)

if __name__ == "__main__":
    main()
