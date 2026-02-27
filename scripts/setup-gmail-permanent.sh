#!/bin/bash
# Gmail Permanent Setup Script
# Run once, works forever

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║     📧 GMAIL PERMANENT SETUP                             ║"
echo "║     One-time configuration, works forever                ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Detect shell
if [ -n "$ZSH_VERSION" ]; then
    SHELL_TYPE="zsh"
    SHELL_CONFIG="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_TYPE="bash"
    SHELL_CONFIG="$HOME/.bashrc"
else
    SHELL_TYPE="bash"
    SHELL_CONFIG="$HOME/.bashrc"
fi

echo -e "${BLUE}Detected shell: $SHELL_TYPE${NC}"
echo ""

# Get email
read -p "Enter your Gmail address: " EMAIL

if [[ ! "$EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    echo -e "${RED}❌ Invalid email address${NC}"
    exit 1
fi

# Check if gog is installed
if ! command -v gog &> /dev/null; then
    echo -e "${YELLOW}Installing gog...${NC}"
    brew install steipete/tap/gogcli || {
        echo -e "${RED}❌ Failed to install gog${NC}"
        exit 1
    }
fi

# Create gog config directory
mkdir -p "$HOME/.config/gog"

# Check if already configured
if grep -q "GOG_ACCOUNT=" "$SHELL_CONFIG" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  GOG already configured in $SHELL_CONFIG${NC}"
    read -p "Overwrite existing configuration? (y/N): " OVERWRITE
    if [[ ! "$OVERWRITE" =~ ^[Yy]$ ]]; then
        echo "Exiting..."
        exit 0
    fi
    # Remove old config
    sed -i.bak '/# Gmail\/Gog Configuration/,/GOG_/d' "$SHELL_CONFIG" 2>/dev/null || true
fi

# Add to shell config
echo -e "${BLUE}Adding configuration to $SHELL_CONFIG...${NC}"

cat >> "$SHELL_CONFIG" << EOF

# Gmail/Gog Configuration (Added $(date))
export GOG_ACCOUNT="$EMAIL"
# Note: You'll be prompted for password on first run, then it caches
EOF

echo -e "${GREEN}✅ Configuration added to $SHELL_CONFIG${NC}"

# Source it for current session
export GOG_ACCOUNT="$EMAIL"

# Check if already authenticated
if gog auth list 2>/dev/null | grep -q "$EMAIL"; then
    echo -e "${GREEN}✅ Already authenticated for $EMAIL${NC}"
else
    echo ""
    echo -e "${YELLOW}🔐 Authentication Required${NC}"
    echo "A browser will open. Please:"
    echo "  1. Sign in to Google"
    echo "  2. Click 'Allow' for Gmail access"
    echo "  3. Close the browser when done"
    echo ""
    read -p "Press Enter to open browser..."
    
    # Add account
    gog auth add "$EMAIL" --services gmail
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Authentication successful!${NC}"
    else
        echo -e "${RED}❌ Authentication failed${NC}"
        exit 1
    fi
fi

# Create desktop alias
echo ""
echo -e "${BLUE}Creating convenient aliases...${NC}"

# Add aliases to shell config
cat >> "$SHELL_CONFIG" << 'EOF'

# Gmail Aliases
alias gmail='gog gmail search "in:inbox newer_than:1d" --max 20'
alias gmail-unread='gog gmail search "is:unread" --max 20'
alias gmail-count='gog gmail search "in:inbox" --max 1 &>/dev/null && echo "Inbox checked"'
alias gmail-archive-old='gog gmail search "older_than:1y in:inbox" --max 100 --format ids | head -50'
EOF

echo -e "${GREEN}✅ Aliases added:${NC}"
echo "  gmail         - Show recent emails"
echo "  gmail-unread  - Show unread emails"
echo "  gmail-count   - Count inbox emails"
echo "  gmail-archive-old - List old emails to archive"

# Create the organization script
ORG_SCRIPT="$HOME/gmail-organize.sh"
cat > "$ORG_SCRIPT" << 'SCRIPT'
#!/bin/bash
# Gmail Organization Script

if [ -z "$GOG_ACCOUNT" ]; then
    echo "❌ GOG_ACCOUNT not set. Run: source ~/.bashrc (or ~/.zshrc)"
    exit 1
fi

echo "📧 GMAIL ORGANIZATION"
echo "===================="
echo "Account: $GOG_ACCOUNT"
echo ""

# Check authentication
if ! gog gmail search "in:inbox" --max 1 &>/dev/null; then
    echo "❌ Not authenticated. Run: gog auth add $GOG_ACCOUNT --services gmail"
    exit 1
fi

# Analyze
echo "📊 ANALYZING..."
UNREAD=$(gog gmail search "is:unread" --max 500 2>/dev/null | wc -l)
RECENT=$(gog gmail search "newer_than:7d" --max 500 2>/dev/null | wc -l)

echo "  Unread emails: ~$UNREAD"
echo "  Emails from last 7 days: ~$RECENT"
echo ""

# Menu
echo "What would you like to do?"
echo "1) Show unread emails"
echo "2) Show recent emails (last 7 days)"
echo "3) Search emails"
echo "4) Archive emails older than 1 year"
echo "5) Exit"
echo ""
read -p "Choice (1-5): " CHOICE

case $CHOICE in
    1)
        echo ""
        gog gmail search "is:unread" --max 20
        ;;
    2)
        echo ""
        gog gmail search "newer_than:7d" --max 20
        ;;
    3)
        read -p "Search query: " QUERY
        echo ""
        gog gmail search "$QUERY" --max 20
        ;;
    4)
        echo "Finding emails older than 1 year..."
        COUNT=$(gog gmail search "older_than:1y in:inbox" --max 1000 2>/dev/null | wc -l)
        echo "Found ~$COUNT emails"
        read -p "Archive these? (y/N): " CONFIRM
        if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
            echo "Archiving... (this may take a while)"
            gog gmail search "older_than:1y in:inbox" --max 500 --format ids 2>/dev/null | \
            while read id; do
                gog gmail modify "$id" --remove-label INBOX 2>/dev/null && echo -n "."
            done
            echo ""
            echo "✅ Done"
        fi
        ;;
    5)
        echo "Goodbye!"
        ;;
esac
SCRIPT

chmod +x "$ORG_SCRIPT"

# Create desktop shortcut
echo ""
echo -e "${BLUE}Creating desktop shortcut...${NC}"
DESKTOP_DIR="$HOME/Desktop"
if [ -d "$DESKTOP_DIR" ]; then
    cat > "$DESKTOP_DIR/gmail-organize.command" << EOF
#!/bin/bash
cd "$HOME"
source "$SHELL_CONFIG"
exec "$ORG_SCRIPT"
EOF
    chmod +x "$DESKTOP_DIR/gmail-organize.command"
    echo -e "${GREEN}✅ Desktop shortcut created${NC}"
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ SETUP COMPLETE!                                      ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "📁 Files created:"
echo "  • $SHELL_CONFIG (updated)"
echo "  • $ORG_SCRIPT (organization script)"
echo "  • ~/Desktop/gmail-organize.command (desktop shortcut)"
echo ""
echo "🚀 To use:"
echo "  1. Run: source $SHELL_CONFIG"
echo "  2. Then run: ~/gmail-organize.sh"
echo "  3. Or use aliases: gmail, gmail-unread, gmail-count"
echo ""
echo "💡 Quick test:"
echo "   gog gmail search 'in:inbox newer_than:1d' --max 5"
echo ""
