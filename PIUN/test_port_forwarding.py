#!/usr/bin/env python3
"""
Port Forwarding Test - Multiple Port Check
Tests connectivity to various ports that might be forwarded
"""
import socket
import sys
from datetime import datetime

def test_port_connectivity(host='127.0.0.1', ports=None):
    """Test connectivity to multiple ports"""
    if ports is None:
        ports = [14330, 14331, 1433, 8080, 3000]  # Common forwarded ports
    
    print(f"Port Forwarding Test - {datetime.now()}")
    print("="*60)
    print(f"Testing connectivity to {host} on multiple ports...")
    
    results = {}
    
    for port in ports:
        print(f"\nTesting port {port}...")
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(3)  # 3 second timeout
            result = sock.connect_ex((host, port))
            sock.close()
            
            if result == 0:
                print(f"  ✅ Port {port}: OPEN and responding")
                results[port] = "OPEN"
                
                # Try to get more info about what's listening
                try:
                    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    sock.settimeout(1)
                    sock.connect((host, port))
                    
                    # Send a simple test to see if it responds like SQL Server
                    sock.send(b'\x00')  # Simple test byte
                    response = sock.recv(10)
                    if response:
                        print(f"    Service responding on port {port}")
                    sock.close()
                except:
                    pass  # Not all services respond to random data
                    
            else:
                print(f"  ❌ Port {port}: CLOSED (Error: {result})")
                results[port] = "CLOSED"
                
        except Exception as e:
            print(f"  ❌ Port {port}: ERROR - {e}")
            results[port] = "ERROR"
    
    print("\n" + "="*60)
    print("SUMMARY:")
    open_ports = [p for p, status in results.items() if status == "OPEN"]
    
    if open_ports:
        print(f"✅ Open ports found: {open_ports}")
        print("Port forwarding may be working on these ports")
        return open_ports
    else:
        print("❌ No open ports found")
        print("VS Code port forwarding may need to be restarted")
        return []

if __name__ == "__main__":
    # Test common forwarded ports
    test_ports = [14330, 14331, 1433, 8080, 3000, 5000, 8000]
    open_ports = test_port_connectivity(ports=test_ports)
    
    if open_ports:
        print(f"\n🎉 Potential SQL Server ports: {open_ports}")
    else:
        print(f"\n⚠️ No accessible ports found")
        print("Please check VS Code Remote Explorer port forwarding status")