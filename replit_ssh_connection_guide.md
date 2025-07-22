# Alternative SSH Connection Methods for Windows + VS Code

## Method 1: Use Replit's SSH Panel (Recommended)

1. **In this Replit window**, click the **+** button (Tools menu)
2. Search for **"SSH"** and click it
3. Click on the **"Connect"** tab
4. Click **"Launch VS Code"** button
5. This will automatically configure VS Code with the correct settings

## Method 2: Manual VS Code Remote Settings

If Method 1 doesn't work, configure VS Code manually:

1. **VS Code Settings**: File → Preferences → Settings
2. **Search**: "remote.SSH.remotePlatform"
3. **Add entry**:
   - Item: `88ef5e6b-ff4f-47ab-b937-c85b713020fa-00-cu5w6mikd1gh.worf.replit.dev`
   - Value: `linux`

## Method 3: VS Code SSH Config with Platform Override

Update your `%USERPROFILE%\.ssh\config`:
```
Host replit-piu
    HostName 88ef5e6b-ff4f-47ab-b937-c85b713020fa-00-cu5w6mikd1gh.worf.replit.dev
    User 88ef5e6b-ff4f-47ab-b937-c85b713020fa
    IdentityFile ~/.ssh/replit
    RemoteCommand /bin/bash
    RequestTTY no
```

## Method 4: Use Git Clone Instead (Alternative)

If SSH continues to fail, you can sync files via Git:
```cmd
git clone https://github.com/your-repo/piu-project.git
```

## Current Connection Details
- Host: 88ef5e6b-ff4f-47ab-b937-c85b713020fa-00-cu5w6mikd1gh.worf.replit.dev
- User: 88ef5e6b-ff4f-47ab-b937-c85b713020fa
- SSH Key: Already added to Replit account
- Issue: VS Code trying to use PowerShell on Linux server

## Next Steps
1. Try Method 1 first (easiest)
2. If that fails, try Method 2
3. If all SSH methods fail, we can set up Git synchronization instead