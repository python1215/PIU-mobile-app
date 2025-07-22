# Windows SSH Connection Debug Guide

## Current Issue
Getting password prompt instead of SSH key authentication for:
- Host: 88ef5e6b-ff4f-47ab-b937-c85b713020fa-00-cu5w6mikd1gh.worf.replit.dev
- User: 88ef5e6b-ff4f-47ab-b937-c85b713020fa

## Step-by-Step Solution

### 1. Verify SSH Key Generation (Windows)
Open Command Prompt and run:
```cmd
dir %USERPROFILE%\.ssh
```
You should see:
- replit (private key)
- replit.pub (public key)

If not, generate them:
```cmd
ssh-keygen -t ed25519 -f %USERPROFILE%\.ssh\replit -q -N ""
```

### 2. Get Your Public Key Content
```cmd
type %USERPROFILE%\.ssh\replit.pub
```
Copy the ENTIRE output (starts with ssh-ed25519 and ends with your computer name)

### 3. Add SSH Key to Replit Account
- Go to https://replit.com/account#ssh-keys
- Click "Add SSH key"
- Label: "windows-local"
- Paste the public key content
- Click "Add SSH key"

### 4. Test SSH Connection with Explicit Key
```cmd
ssh -i %USERPROFILE%\.ssh\replit 88ef5e6b-ff4f-47ab-b937-c85b713020fa@88ef5e6b-ff4f-47ab-b937-c85b713020fa-00-cu5w6mikd1gh.worf.replit.dev
```

### 5. Create SSH Config (Windows)
Create file: %USERPROFILE%\.ssh\config
```
Host *.replit.dev
    IdentityFile ~/.ssh/replit
    StrictHostKeyChecking accept-new
    User %r

Host replit-piu
    HostName 88ef5e6b-ff4f-47ab-b937-c85b713020fa-00-cu5w6mikd1gh.worf.replit.dev
    User 88ef5e6b-ff4f-47ab-b937-c85b713020fa
    IdentityFile ~/.ssh/replit
    StrictHostKeyChecking accept-new
```

### 6. Test Config
```cmd
ssh replit-piu
```

### 7. Debug Mode (if still failing)
```cmd
ssh -vvv -i %USERPROFILE%\.ssh\replit 88ef5e6b-ff4f-47ab-b937-c85b713020fa@88ef5e6b-ff4f-47ab-b937-c85b713020fa-00-cu5w6mikd1gh.worf.replit.dev
```

## Alternative: Use Replit's Built-in SSH Tool
1. In this Replit, click + button
2. Search "SSH" and click it
3. Go to "Connect" tab
4. Click "Launch VS Code"
5. This automatically configures everything

## Common Windows Issues
- SSH client not installed: Install OpenSSH via Windows Features
- Wrong key format: Use ed25519 type only
- Key not in Replit account: Must add to https://replit.com/account#ssh-keys