# 📧 Gmail Permanent Setup

## Quick Start (One Command)

```bash
bash ~/setup-gmail-permanent.sh
```

This script will:
1. ✅ Detect your shell (bash/zsh)
2. ✅ Add GOG configuration to your profile
3. ✅ Set up Gmail aliases
4. ✅ Create organization script
5. ✅ Add desktop shortcut

## What Gets Created

| File | Purpose |
|------|---------|
| `~/.bashrc` or `~/.zshrc` | Environment variables & aliases |
| `~/gmail-organize.sh` | Main organization script |
| `~/Desktop/gmail-organize.command` | Desktop shortcut (Mac) |

## After Setup

### Immediate Use
```bash
# Reload shell config
source ~/.bashrc  # or ~/.zshrc

# Test it works
gog gmail search "in:inbox" --max 5

# Run organization script
~/gmail-organize.sh
```

### Available Aliases
| Alias | What it does |
|-------|--------------|
| `gmail` | Show recent emails |
| `gmail-unread` | Show unread emails |
| `gmail-count` | Count inbox emails |
| `gmail-archive-old` | List old emails to archive |

### Organization Script Features
- 📊 Analyze inbox (count unread, recent)
- 📧 Show unread emails
- 🔍 Search emails
- 📦 Archive old emails (1+ years)

## Troubleshooting

### "Not authenticated"
```bash
# Run authentication
gog auth add YOUR_EMAIL@gmail.com --services gmail
```

### "GOG_ACCOUNT not set"
```bash
# Reload your shell config
source ~/.bashrc  # or ~/.zshrc
```

### First Time Setup
The browser will open for Google OAuth:
1. Sign in to your Google account
2. Click "Allow" for Gmail access
3. Close browser when done

## Manual Commands

If you prefer manual control:

```bash
# Set account
export GOG_ACCOUNT=you@gmail.com

# Search emails
gog gmail search "in:inbox newer_than:7d"

# Count unread
gog gmail search "is:unread" --max 100

# Find large emails
gog gmail search "larger:10M"

# Archive old emails
gog gmail search "older_than:1y in:inbox" --max 100
```

## Security

- OAuth tokens stored in `~/.config/gog/`
- No passwords stored in scripts
- Uses Google OAuth (secure)
- Token auto-refreshes

## Backup

To keep this setup on a new machine, backup:
```bash
~/.config/gog/
~/.bashrc  # or ~/.zshrc
```
