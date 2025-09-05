from django.core.management.base import BaseCommand
from django.utils import timezone
from accounts.models import User
from accounts.utils import ensure_platform_independence

class Command(BaseCommand):
    help = 'Ensures platform independence by activating all users and configuring authentication'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--activate-users',
            action='store_true',
            help='Activate all inactive users',
        )
        parser.add_argument(
            '--cleanup-sessions',
            action='store_true',
            help='Clean up expired sessions',
        )
        parser.add_argument(
            '--create-admin',
            action='store_true',
            help='Create admin user if none exists',
        )
    
    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('=== PIU M&E Platform Independence Configuration ===')
        )
        
        if options.get('activate_users'):
            # Activate all users
            from accounts.utils import activate_all_users
            count = activate_all_users()
            self.stdout.write(
                self.style.SUCCESS(f'✓ Activated {count} users')
            )
        
        if options.get('cleanup_sessions'):
            # Clean sessions
            from accounts.utils import cleanup_expired_sessions
            count = cleanup_expired_sessions()
            self.stdout.write(
                self.style.SUCCESS(f'✓ Cleaned up {count} expired sessions')
            )
        
        if options.get('create_admin'):
            # Ensure admin exists
            admin_users = User.objects.filter(is_superuser=True, is_active=True)
            if not admin_users.exists():
                try:
                    admin, created = User.objects.get_or_create(
                        username='admin',
                        defaults={
                            'email': 'admin@piu.gm',
                            'is_superuser': True,
                            'is_staff': True,
                            'is_active': True,
                            'first_name': 'System',
                            'last_name': 'Administrator'
                        }
                    )
                    if created:
                        admin.set_password('admin123')  # Default password
                        admin.save()
                        self.stdout.write(
                            self.style.WARNING(
                                '⚠️  Created admin user (username: admin, password: admin123) - CHANGE PASSWORD IMMEDIATELY!'
                            )
                        )
                    else:
                        admin.is_active = True
                        admin.is_superuser = True 
                        admin.is_staff = True
                        admin.save()
                        self.stdout.write(
                            self.style.SUCCESS('✓ Reactivated existing admin user')
                        )
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f'✗ Error creating admin: {e}')
                    )
            else:
                self.stdout.write(
                    self.style.SUCCESS('✓ Admin user already exists and active')
                )
        
        # Run complete platform independence setup if no specific options
        if not any([options.get('activate_users'), options.get('cleanup_sessions'), options.get('create_admin')]):
            result = ensure_platform_independence()
            self.stdout.write(
                self.style.SUCCESS(f"✓ Platform independence configured:")
            )
            self.stdout.write(f"  - {result['activated_users']} users activated")
            self.stdout.write(f"  - {result['cleaned_sessions']} expired sessions cleaned")
            self.stdout.write(f"  - Admin exists: {result['admin_exists']}")
        
        # Display current user statistics
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        admin_users = User.objects.filter(is_superuser=True, is_active=True).count()
        
        self.stdout.write(
            self.style.SUCCESS('\n=== Current System Status ===')
        )
        self.stdout.write(f"Total users: {total_users}")
        self.stdout.write(f"Active users: {active_users}")
        self.stdout.write(f"Admin users: {admin_users}")
        
        if active_users > 0 and admin_users > 0:
            self.stdout.write(
                self.style.SUCCESS('✅ System is ready for platform-independent deployment!')
            )
        else:
            self.stdout.write(
                self.style.ERROR('❌ System needs configuration - run with --create-admin if needed')
            )