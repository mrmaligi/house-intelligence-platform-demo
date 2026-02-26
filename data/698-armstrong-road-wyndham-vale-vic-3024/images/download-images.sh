#!/bin/bash
# Download images for 698 Armstrong Road, Wyndham Vale
# Requires Google Maps API Key

# REPLACE THIS WITH YOUR REAL API KEY
API_KEY="YOUR_GOOGLE_MAPS_API_KEY_HERE"

# Property coordinates
LAT="-37.8923"
LNG="144.6234"

# Create directories
mkdir -p streetview aerial

echo "Downloading images for 698 Armstrong Road, Wyndham Vale..."
echo "Coordinates: $LAT, $LNG"
echo ""

# Street View Images - 8 angles around the property
echo "📸 Downloading Street View images..."

for angle in 0 45 90 135 180 225 270 315; do
    echo "  → Angle: $angle°"
    curl -s "https://maps.googleapis.com/maps/api/streetview?size=640x480&location=$LAT,$LNG&heading=$angle&pitch=0&key=$API_KEY" \
        -o "streetview/streetview_${angle}deg.jpg"
done

# Elevation shots (looking up, level, down)
echo "  → Elevation shots..."
curl -s "https://maps.googleapis.com/maps/api/streetview?size=640x480&location=$LAT,$LNG&heading=0&pitch=-20&key=$API_KEY" \
    -o "streetview/streetview_pitch_up.jpg"

curl -s "https://maps.googleapis.com/maps/api/streetview?size=640x480&location=$LAT,$LNG&heading=0&pitch=20&key=$API_KEY" \
    -o "streetview/streetview_pitch_down.jpg"

# Aerial/Satellite Images
echo ""
echo "🛰️ Downloading Aerial images..."

for zoom in 18 19 20 21; do
    echo "  → Zoom level: $zoom"
    curl -s "https://maps.googleapis.com/maps/api/staticmap?center=$LAT,$LNG&zoom=$zoom&size=640x640&maptype=satellite&key=$API_KEY" \
        -o "aerial/aerial_zoom${zoom}.jpg"
done

echo ""
echo "✅ Download complete!"
echo ""
echo "Downloaded files:"
ls -lh streetview/
ls -lh aerial/
